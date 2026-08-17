import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, SquarePen, Clock, Share2, Star, 
  LineChart as LineChartIcon, ChevronDown, Moon, 
  Maximize2, Search, ThumbsUp, ThumbsDown, 
  MessageCircle, SlidersHorizontal, CheckCircle2, MoreHorizontal,
  Eye, EyeOff, Sparkles, Sliders, Zap, Check
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ResponsiveContainer, AreaChart, Area, YAxis, ReferenceLine, Tooltip } from 'recharts';
import { BuyOrderPage } from './BuyOrderPage';
import { PortfolioDetailPage } from './PortfolioDetailPage';
import { CreatePostPage } from './CreatePostPage';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { ref, onValue, set } from 'firebase/database';
import { ALL_GLOBAL_ASSETS, getAssetLogo, getAssetName, isIDXStock } from '../lib/assetsData';
import { AssetLogo } from '../components/AssetLogo';
import { MyInvestmentCard } from '../components/MyInvestmentCard';
import { RealTimeAssetChart } from '../components/RealTimeAssetChart';
import { FinancialStatementsView } from '../components/FinancialStatementsView';

interface AssetDetailsPageProps {
  symbol: string;
  onBack: () => void;
}

export function AssetDetailsPage({ symbol, onBack }: AssetDetailsPageProps) {
  const displaySymbol = symbol.replace('USDT', '').toUpperCase();
  const isIdr = isIDXStock(symbol) || ['BBCA', 'BBRI', 'BMRI', 'BBNI', 'TLKM', 'ASII', 'GOTO', 'BREN', 'AMMN', 'ANTM', 'ICBP', 'ADRO', 'PTBA', 'UNVR', 'KLBF'].includes(displaySymbol);
  const fullName = getAssetName(symbol);
  const matchedAsset = ALL_GLOBAL_ASSETS.find(a => a.symbol === symbol || a.symbol === displaySymbol || a.symbol === `${displaySymbol}USDT`);
  const initialPriceVal = matchedAsset?.basePrice || (isIdr ? 6350 : 100);

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'STREAM' | 'KEYSTATS' | 'ORDERBOOK' | 'ANALISIS' | 'FINANSIAL' | 'SEASONALITY' | 'PERBANDINGAN'>('STREAM');
  const [streamFilter, setStreamFilter] = useState('All');
  const [streamSearch, setStreamSearch] = useState('');
  const [timeframe, setTimeframe] = useState('1D');
  const [showBuyOrder, setShowBuyOrder] = useState(false);
  const [showPortfolioDetail, setShowPortfolioDetail] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [isStarred, setIsStarred] = useState(false);

  // Firebase assetPrices sync
  const [assetPrices, setAssetPrices] = useState<Record<string, number>>({});
  const [liveNumericPrice, setLiveNumericPrice] = useState<number>(initialPriceVal);
  const [priceFlash, setPriceFlash] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    const pricesRef = ref(db, 'assetPrices');
    const unsub = onValue(pricesRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        const map: Record<string, number> = {};
        Object.entries(val).forEach(([sym, data]: [string, any]) => {
          const p = typeof data === 'object' ? data.price : Number(data);
          map[sym] = p;
          map[sym.toUpperCase().replace('USDT', '')] = p;
        });
        setAssetPrices(map);

        const currentP = map[symbol] || map[displaySymbol] || map[`${displaySymbol}USDT`];
        if (currentP && currentP > 0) {
          setLiveNumericPrice(prev => {
            if (prev > 0 && Math.abs(prev - currentP) > 0.0001) {
              setPriceFlash(currentP > prev ? 'up' : 'down');
              setTimeout(() => setPriceFlash(null), 500);
            }
            return currentP;
          });
        }
      }
    });
    return () => unsub();
  }, [symbol, displaySymbol]);

  // User position & investment card state
  const { user } = useAuth();
  const activeUid = user?.uid || 'demo_user';
  const [userPosition, setUserPosition] = useState<{
    symbol: string;
    stockName: string;
    lot: number;
    avgPrice: number;
    totalCost: number;
  } | null>(null);

  // Subscribe to user position for this symbol
  useEffect(() => {
    const posRef = ref(db, `users/${activeUid}/positions`);
    const unsubscribe = onValue(posRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const positionsList = Object.values(data) as any[];
        const normSymbol = symbol.toUpperCase().replace('USDT', '');
        const match = positionsList.find((p: any) => 
          p.symbol?.toUpperCase() === symbol.toUpperCase() ||
          p.symbol?.toUpperCase() === normSymbol ||
          p.symbol?.toUpperCase() === `${normSymbol}USDT`
        );
        if (match) {
          setUserPosition(match);
        } else {
          setUserPosition(null);
        }
      } else {
        setUserPosition(null);
      }
    });
    return () => unsubscribe();
  }, [activeUid, symbol]);

  const [chartData, setChartData] = useState<{ time: string; value: number }[]>([]);
  const [assetData, setAssetData] = useState(() => {
    const formatted = isIdr 
      ? Math.round(initialPriceVal).toLocaleString('id-ID')
      : (initialPriceVal >= 1000 ? initialPriceVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : initialPriceVal.toFixed(2));
    return {
      price: formatted,
      change: displaySymbol === 'BBCA' ? '-25' : '0.00',
      pct: displaySymbol === 'BBCA' ? '-0.39%' : '0.00%',
      up: displaySymbol !== 'BBCA',
      high: displaySymbol === 'BBCA' ? '6.375' : formatted,
      low: displaySymbol === 'BBCA' ? '6.275' : formatted,
      prevClose: displaySymbol === 'BBCA' ? 6375 : initialPriceVal,
      volume: isIdr ? '56.9M Lot' : '1.5M',
    };
  });

  const [orderBook, setOrderBook] = useState<{
    bids: { price: string; qty: string }[];
    asks: { price: string; qty: string }[];
  }>({ bids: [], asks: [] });

  // Fetch chart & real-time pricing data dynamically
  useEffect(() => {
    const cryptoList = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'AVAX', 'MATIC', 'LINK', 'DOT', 'NEAR', 'SUI', 'PEPE', 'SHIB', 'ATOM', 'TON', 'LTC', 'UNI'];
    const isCrypto = symbol.endsWith('USDT') || cryptoList.includes(symbol.toUpperCase());
    const normalizedSymbol = symbol.endsWith('USDT') ? symbol : `${symbol}USDT`;

    if (!isCrypto) {
      const formatP = (val: number) => {
        if (isIdr) return Math.round(val).toLocaleString('id-ID');
        if (val >= 1000) return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        if (val < 0.01) return val.toFixed(6);
        if (val < 10) return val.toFixed(4);
        return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      };

      const fetchStockData = async () => {
        try {
          const res = await fetch(`/api/quote/${symbol}`);
          if (!res.ok) return;
          const json = await res.json();
          if (json.success && json.quote) {
            const q = json.quote;
            const isUp = (q.change || 0) >= 0;
            setAssetData({
              price: formatP(q.price),
              change: `${isUp ? '+' : ''}${formatP(q.change || 0)}`,
              pct: `${isUp ? '+' : ''}${(q.pctChange || 0).toFixed(2)}%`,
              up: isUp,
              high: formatP(q.high || q.price * 1.015),
              low: formatP(q.low || q.price * 0.985),
              prevClose: q.previousClose || q.price,
              volume: q.volume ? (q.volume > 1000000 ? (q.volume / 1000000).toFixed(1) + 'M' + (isIdr ? ' Lot' : '') : q.volume.toLocaleString()) : '18.4M',
            });

            if (q.chart && q.chart.length > 0) {
              setChartData(q.chart);
            } else {
              // Intraday realistic stepped chart for IDX
              const base = q.previousClose || q.price;
              const points = [
                { time: '09:00', value: base },
                { time: '09:15', value: base },
                { time: '09:30', value: base - 25 },
                { time: '09:45', value: base - 50 },
                { time: '10:00', value: base - 25 },
                { time: '10:15', value: base - 75 },
                { time: '10:30', value: base - 50 },
                { time: '10:45', value: base - 100 }, // Dip at 6275
                { time: '11:00', value: base - 50 },
                { time: '11:15', value: base - 25 },
                { time: '11:30', value: base - 25 },
                { time: '13:30', value: base - 25 },
                { time: '14:00', value: base - 50 },
                { time: '14:30', value: base - 25 },
                { time: '15:00', value: base - 25 },
                { time: '15:50', value: q.price }
              ];
              setChartData(points);
            }

            const currentPrice = q.price;
            setLiveNumericPrice(prev => {
              if (prev > 0 && Math.abs(prev - currentPrice) > 0.0001) {
                setPriceFlash(currentPrice > prev ? 'up' : 'down');
                setTimeout(() => setPriceFlash(null), 500);
              }
              return currentPrice;
            });
            setAssetPrices(prev => ({
              ...prev,
              [symbol]: currentPrice,
              [displaySymbol]: currentPrice
            }));
            set(ref(db, `assetPrices/${symbol}`), { symbol, price: currentPrice, updatedAt: Date.now() }).catch(() => {});
            set(ref(db, `assetPrices/${displaySymbol}`), { symbol: displaySymbol, price: currentPrice, updatedAt: Date.now() }).catch(() => {});
            
            // Set dynamic order book
            if (q.orderBook && Array.isArray(q.orderBook) && q.orderBook.length > 0) {
              setOrderBook({
                bids: q.orderBook.map((r: any) => ({ price: formatP(r.bidPrice), qty: r.lotBid })),
                asks: q.orderBook.map((r: any) => ({ price: formatP(r.askPrice), qty: r.lotAsk }))
              });
            } else {
              const step = isIdr ? 25 : (currentPrice > 100 ? 0.25 : 0.01);
              setOrderBook({
                bids: Array.from({ length: 5 }, (_, idx) => ({
                  price: formatP(currentPrice - (idx + 1) * step),
                  qty: (Math.floor(Math.random() * 25000) + 5000).toLocaleString('id-ID')
                })),
                asks: Array.from({ length: 5 }, (_, idx) => ({
                  price: formatP(currentPrice + (idx + 1) * step),
                  qty: (Math.floor(Math.random() * 25000) + 5000).toLocaleString('id-ID')
                }))
              });
            }
          }
        } catch (err) {
          console.warn('Error fetching stock quote:', err);
        }
      };

      fetchStockData();
      const interval = setInterval(fetchStockData, 1200);
      return () => clearInterval(interval);
    }

    // Crypto handling
    let limit = 24;
    let interval = '1h';
    if (timeframe === '1W') { limit = 28; interval = '6h'; }
    else if (timeframe === '1M') { limit = 30; interval = '1d'; }
    else if (timeframe === '3M') { limit = 90; interval = '1d'; }
    else if (timeframe === '1Y') { limit = 52; interval = '1w'; }
    else if (timeframe === 'YTD') { limit = 40; interval = '1d'; }

    fetch(`https://api.binance.com/api/v3/klines?symbol=${normalizedSymbol}&interval=${interval}&limit=${limit}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          const formatted = data.map((d: any) => ({
            time: new Date(d[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            value: parseFloat(d[4])
          }));
          setChartData(formatted);
        }
      })
      .catch((err) => {
        console.warn('Kline fetch fallback:', err);
      });

    // Real-time Ticker WebSocket
    let wsTicker: WebSocket | null = null;
    let wsDepth: WebSocket | null = null;

    try {
      wsTicker = new WebSocket(`wss://stream.binance.com:9443/ws/${normalizedSymbol.toLowerCase()}@ticker`);
      wsTicker.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (!data || !data.c) return;

          const currentPrice = parseFloat(data.c);
          const change = parseFloat(data.p || '0');
          const isUp = change >= 0;

          setLiveNumericPrice(prev => {
            if (prev > 0 && Math.abs(prev - currentPrice) > 0.0001) {
              setPriceFlash(currentPrice > prev ? 'up' : 'down');
              setTimeout(() => setPriceFlash(null), 500);
            }
            return currentPrice;
          });

          setAssetPrices(prev => ({
            ...prev,
            [symbol]: currentPrice,
            [displaySymbol]: currentPrice,
            [`${displaySymbol}USDT`]: currentPrice,
            [normalizedSymbol]: currentPrice
          }));

          const formatNumber = (val: number) => {
            if (val >= 1000) return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            if (val >= 1) return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
            return val.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 });
          };

          setAssetData({
            price: formatNumber(currentPrice),
            change: `${isUp ? '+' : ''}${formatNumber(change)}`,
            pct: `${isUp ? '+' : ''}${parseFloat(data.P || '0').toFixed(2)}%`,
            up: isUp,
            high: formatNumber(parseFloat(data.h || '0')),
            low: formatNumber(parseFloat(data.l || '0')),
            prevClose: currentPrice - change,
            volume: `${(parseFloat(data.v || '0') / 1000).toFixed(1)}K`,
          });

          setChartData(prev => {
            if (prev.length === 0) return prev;
            const updated = [...prev];
            updated[updated.length - 1] = {
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              value: currentPrice
            };
            return updated;
          });
        } catch (e) {}
      };

      wsDepth = new WebSocket(`wss://stream.binance.com:9443/ws/${normalizedSymbol.toLowerCase()}@depth10@100ms`);
      wsDepth.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (!data || !data.bids || !data.asks) return;

          const bids = data.bids.slice(0, 5).map((b: any) => ({
            price: parseFloat(b[0]) >= 1000 ? parseFloat(b[0]).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : parseFloat(b[0]).toFixed(2),
            qty: (parseFloat(b[1]) / 100).toFixed(1) + 'K'
          }));

          const asks = data.asks.slice(0, 5).map((a: any) => ({
            price: parseFloat(a[0]) >= 1000 ? parseFloat(a[0]).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : parseFloat(a[0]).toFixed(2),
            qty: (parseFloat(a[1]) / 100).toFixed(1) + 'K'
          }));

          setOrderBook({ bids, asks });
        } catch (e) {}
      };
    } catch (e) {}

    return () => {
      if (wsTicker) wsTicker.close();
      if (wsDepth) wsDepth.close();
    };
  }, [symbol, timeframe, displaySymbol, isIdr]);

  // Stream Posts tailored for BBCA matching the exact Stockbit feed
  const streamPosts = [
    {
      id: 1,
      author: 'Taufik230295',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      time: '16 Aug 26, 10:30',
      text: 'Bullish momentum dan akumulasi berkelanjutan di pasar reguler.',
      tags: 'Rt $IHSG $BBCA $TPIA',
      hasImage: true,
      imageBanner: 'PIDATO PRESIDEN',
      likes: 124,
      dislikes: 1,
      comments: 32
    },
    {
      id: 2,
      author: 'Dewangga Investama',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      time: '16 Aug 26, 09:45',
      text: `Akumulasi konsisten saham $${displaySymbol} di level support strategis. Pertumbuhan profitabilitas dan likuiditas yang solid memperkuat fundamental jangka panjang.`,
      tags: `$${displaySymbol} $IHSG`,
      hasImage: false,
      likes: 218,
      dislikes: 3,
      comments: 48
    },
    {
      id: 3,
      author: 'Garuda Alpha Research',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      time: '16 Aug 26, 08:15',
      text: `Foreign inflow di pasar reguler untuk $${displaySymbol} tercatat stabil. Konsensus analis mempertahankan target akumulasi dengan estimasi dividen yang menarik.`,
      tags: `$${displaySymbol}`,
      hasImage: false,
      likes: 95,
      dislikes: 0,
      comments: 14
    }
  ];

  return (
    <div className="flex h-full flex-col bg-white overflow-y-auto no-scrollbar">
      {/* TOP NAVIGATION APP BAR */}
      <header className="flex items-center justify-between px-4 py-3 bg-white sticky top-0 z-30 border-b border-gray-100/80">
        <button 
          onClick={onBack} 
          className="p-1 -ml-1 text-gray-700 hover:text-black transition-colors"
          aria-label="Kembali"
        >
          <ChevronLeft className="w-6 h-6" strokeWidth={2} />
        </button>
        <div className="flex items-center gap-4 text-gray-700">
          <button onClick={() => setShowCreatePost(true)} title="Tulis Postingan">
            <SquarePen className="w-5 h-5 cursor-pointer hover:text-[#00B26A] transition-colors" strokeWidth={1.8} />
          </button>
          <button title="Notifikasi / Alarm">
            <Clock className="w-5 h-5 cursor-pointer hover:text-black transition-colors" strokeWidth={1.8} />
          </button>
          <button title="Bagikan">
            <Share2 className="w-5 h-5 cursor-pointer hover:text-black transition-colors" strokeWidth={1.8} />
          </button>
          <button onClick={() => setIsStarred(!isStarred)} title="Watchlist">
            <Star className={cn("w-5 h-5 cursor-pointer transition-colors", isStarred ? "text-[#FFD700] fill-[#FFD700]" : "text-gray-700 hover:text-black")} strokeWidth={1.8} />
          </button>
        </div>
      </header>

      {/* ASSET HEADER SECTION */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex justify-between items-start">
          <div className="flex-1 pr-2">
            {/* Ticker Row */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <div className="flex items-center gap-1 cursor-pointer">
                <h1 className="text-[20px] font-extrabold text-gray-900 tracking-tight">{displaySymbol}</h1>
                <ChevronDown className="w-4 h-4 text-gray-500" strokeWidth={2.5} />
              </div>
              
              {/* Badges matching screenshot */}
              <div className="flex items-center gap-1 ml-1">
                <span className="flex items-center gap-1 bg-[#EDE9FE] text-[#7C3AED] text-[11px] font-bold px-1.5 py-0.5 rounded leading-none">
                  <Zap className="w-3 h-3 fill-[#7C3AED]" />
                  <span>5x</span>
                </span>
                <span className="border border-[#00B26A] text-[#00B26A] bg-[#ECFDF5] text-[10px] font-bold px-1.5 py-0.5 rounded leading-none">
                  TL
                </span>
                <div className="w-5 h-5 rounded-full border border-emerald-400 text-[#00B26A] flex items-center justify-center">
                  <Moon className="w-3 h-3 text-[#00B26A] fill-[#00B26A]" />
                </div>
              </div>
            </div>

            {/* Full company name */}
            <p className="text-[12px] text-gray-500 font-medium mt-0.5">{fullName}</p>
          </div>

          {/* Official High-Res Asset Logo */}
          <div className="shrink-0">
            <AssetLogo symbol={symbol} size="lg" className="w-13 h-13 min-w-[52px] shadow-xs" />
          </div>
        </div>

        {/* PRICE DISPLAY */}
        <div className="flex flex-col mt-2">
          <h2 className="text-[32px] font-extrabold text-gray-900 leading-none tracking-tight">
            {assetData.price}
          </h2>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className={cn(
              "text-[13px] font-bold flex items-center gap-0.5",
              assetData.up ? "text-[#00B26A]" : "text-[#e11d48]"
            )}>
              {assetData.up ? '↗' : '↙'} {assetData.change} ({assetData.pct})
            </span>
            <span className="text-[12px] text-gray-400 font-normal">Hari Ini</span>
          </div>
        </div>

        {/* CATEGORY / TAG PILLS */}
        <div className="flex items-center gap-2 mt-2.5">
          <span className="border border-[#00B26A] text-[#00B26A] text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
            {displaySymbol === 'BBCA' || displaySymbol === 'BBRI' || displaySymbol === 'BMRI' || displaySymbol === 'BBNI' ? 'Bank' : isIdr ? 'Saham' : 'Crypto'}
          </span>
          <span className="border border-[#00B26A] text-[#00B26A] text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
            Day Trade
          </span>
        </div>
      </div>

      {/* REAL-TIME DYNAMIC & MULTI-TIMEFRAME CHART AREA */}
      <div className="px-4 mt-3 relative w-full">
        <RealTimeAssetChart 
          symbol={symbol}
          displaySymbol={displaySymbol}
          name={fullName}
          isIdr={isIdr}
          livePrice={liveNumericPrice}
          previousClose={assetData.prevClose}
        />
      </div>

      {/* BIG GREEN "BELI" BUTTON (MATCHING SCREENSHOT) */}
      <div className="px-4 mt-3 mb-3">
        <button 
          onClick={() => setShowBuyOrder(true)} 
          className="w-full bg-[#00AA5B] hover:bg-[#009650] active:scale-[0.99] text-white font-bold py-3 rounded-lg text-base shadow-xs transition-all flex items-center justify-center cursor-pointer"
        >
          Beli
        </button>
      </div>

      {/* NAVIGATION SUB-TABS (STICKY BAR) */}
      <div className="w-full bg-white sticky top-12 z-20 border-b border-gray-100">
        <div className="flex items-center justify-between text-[11px] font-bold overflow-x-auto no-scrollbar px-4 text-gray-500 uppercase tracking-wide">
          {(['STREAM', 'KEYSTATS', 'ORDERBOOK', 'ANALISIS', 'FINANSIAL', 'SEASONALITY', 'PERBANDINGAN'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "py-2.5 px-2 cursor-pointer whitespace-nowrap relative transition-colors",
                activeTab === tab ? "text-[#00B26A] font-extrabold" : "text-gray-500 hover:text-gray-800"
              )}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#00B26A] rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* SUB-FILTER CHIPS ROW (WHEN STREAM ACTIVE) */}
        {activeTab === 'STREAM' && (
          <div className="flex items-center gap-1.5 px-4 py-2 overflow-x-auto no-scrollbar bg-white">
            {['All', 'Notes', 'Berita', 'Laporan', 'Riset', 'Ide', 'Prediksi', 'Polling'].map(filter => (
              <button
                key={filter}
                onClick={() => setStreamFilter(filter)}
                className={cn(
                  "px-3.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                  streamFilter === filter 
                    ? "border border-[#00B26A] bg-emerald-50 text-[#00B26A] font-bold" 
                    : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                )}
              >
                {filter}
              </button>
            ))}
            <button className="p-1 text-gray-400 hover:text-gray-600 shrink-0 ml-auto">
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* TAB CONTENT: STREAM (DEFAULT) */}
      {activeTab === 'STREAM' && (
        <div className="pb-24 bg-white">
          {/* EXACT STOCKBIT USER INVESTMENT CARD IF POSITION EXISTS */}
          {userPosition && userPosition.lot > 0 && (() => {
            const currentLive = liveNumericPrice > 0 ? liveNumericPrice : (assetPrices[symbol] ?? assetPrices[displaySymbol] ?? initialPriceVal);
            return (
              <div className="px-4 py-3">
                <MyInvestmentCard
                  symbol={symbol}
                  lot={userPosition.lot}
                  avgPrice={userPosition.avgPrice}
                  currentPrice={currentLive}
                  totalCost={userPosition.totalCost}
                  currency={isIdr ? 'IDR' : 'USD'}
                  onClick={() => setShowPortfolioDetail(true)}
                />
              </div>
            );
          })()}

          {/* Search bar inside Stream */}
          <div className="px-4 py-2">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input 
                type="text"
                value={streamSearch}
                onChange={(e) => setStreamSearch(e.target.value)}
                placeholder="Cari Stream"
                className="w-full bg-transparent text-xs text-gray-800 outline-none placeholder:text-gray-400 font-medium"
              />
            </div>
          </div>

          {/* Stream Feed Posts */}
          <div className="divide-y divide-gray-100 mt-1">
            {streamPosts
              .filter(p => !streamSearch || p.text.toLowerCase().includes(streamSearch.toLowerCase()))
              .map((post) => (
                <div key={post.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                  {/* Author Row */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={post.avatar} 
                        alt={post.author} 
                        className="w-10 h-10 rounded-full object-cover border border-gray-200" 
                      />
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-[13px] font-bold text-gray-900">{post.author}</span>
                          {post.isVerified && (
                            <span className="w-3.5 h-3.5 rounded-full bg-[#00B26A] flex items-center justify-center text-white">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-gray-400 font-normal">{post.time}</span>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Post Content */}
                  <p className="text-[14px] text-gray-900 leading-snug font-normal mb-2">
                    {post.text}
                  </p>

                  {/* Tags */}
                  {post.tags && (
                    <p className="text-[13px] font-medium text-[#00AA5B] mb-2.5">
                      {post.tags}
                    </p>
                  )}

                  {/* Attached Image Banner if matching screenshot */}
                  {post.hasImage && (
                    <div className="mt-2 mb-3 rounded-xl overflow-hidden border border-gray-200 relative bg-gradient-to-r from-red-900 via-amber-950 to-black p-4 text-center text-white shadow-xs">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <div className="w-4 h-2.5 rounded-xs overflow-hidden flex flex-col border border-white/30">
                          <div className="bg-red-600 h-1/2 w-full" />
                          <div className="bg-white h-1/2 w-full" />
                        </div>
                        <span className="text-xs font-bold tracking-widest text-amber-300 uppercase">INDONESIA MAJU</span>
                      </div>
                      <h4 className="text-2xl font-black tracking-wider text-amber-400 drop-shadow-md">
                        PIDATO PRESIDEN
                      </h4>
                      <p className="text-[10px] text-gray-300 mt-1">Arah Pertumbuhan Ekonomi & Stabilitas Sektor Finansial</p>
                    </div>
                  )}

                  {/* Engagement Bar */}
                  <div className="flex items-center justify-between text-gray-400 text-xs pt-1 max-w-[280px]">
                    <button className="flex items-center gap-1 hover:text-emerald-600">
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-[11px] font-medium">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-rose-600">
                      <ThumbsDown className="w-4 h-4" />
                      <span className="text-[11px] font-medium">{post.dislikes}</span>
                    </button>
                    <button className="hover:text-blue-600">
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button className="hover:text-emerald-600 flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-[11px] font-medium">{post.comments}</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: KEYSTATS */}
      {activeTab === 'KEYSTATS' && (
        <div className="p-4 pb-24 bg-white">
          <h3 className="text-[14px] font-bold text-gray-900 mb-3">Statistik Kunci {displaySymbol}</h3>
          
          <div className="grid grid-cols-2 gap-3 text-[12px]">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-gray-500 block text-[11px] mb-1">24h Tertinggi</span>
              <span className="font-bold text-gray-900">{isIdr ? `Rp ${assetData.high}` : assetData.high}</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-gray-500 block text-[11px] mb-1">24h Terendah</span>
              <span className="font-bold text-gray-900">{isIdr ? `Rp ${assetData.low}` : assetData.low}</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-gray-500 block text-[11px] mb-1">Volume Perdagangan</span>
              <span className="font-bold text-gray-900">{assetData.volume}</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-gray-500 block text-[11px] mb-1">Kapitalisasi Pasar</span>
              <span className="font-bold text-gray-900">
                {displaySymbol === 'BBCA' ? 'Rp 1.251 Triliun' : displaySymbol === 'BBRI' ? 'Rp 735 Triliun' : displaySymbol === 'BMRI' ? 'Rp 639 Triliun' : displaySymbol === 'BTC' ? '$1.82 Triliun' : '$45 Miliar'}
              </span>
            </div>
            {isIdr && (
              <>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-gray-500 block text-[11px] mb-1">P/E Ratio (TTM)</span>
                  <span className="font-bold text-[#00B26A]">13.5x</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-gray-500 block text-[11px] mb-1">PBV Ratio</span>
                  <span className="font-bold text-gray-900">4.8x</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-gray-500 block text-[11px] mb-1">Dividend Yield</span>
                  <span className="font-bold text-[#00B26A]">3.2%</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-gray-500 block text-[11px] mb-1">Return on Equity (ROE)</span>
                  <span className="font-bold text-gray-900">22.4%</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: ORDERBOOK */}
      {activeTab === 'ORDERBOOK' && (
        <div className="pb-24 bg-white">
          <div className="grid grid-cols-[1fr_2fr_1.5fr_1.5fr_2fr_1fr] gap-1 px-3 py-3 text-[11px] font-bold text-gray-900 border-b border-gray-100 text-center bg-gray-50/50">
            <div className="text-left">Freq</div>
            <div className="text-right pr-2">Lot/Qty</div>
            <div>Bid (Beli)</div>
            <div>Ask (Jual)</div>
            <div className="text-left pl-2">Lot/Qty</div>
            <div className="text-right">Freq</div>
          </div>

          <div className="divide-y divide-gray-50">
            {Array.from({ length: 5 }).map((_, i) => {
              const bid = orderBook.bids[i] || { price: '-', qty: '-' };
              const ask = orderBook.asks[i] || { price: '-', qty: '-' };
              return (
                <div key={i} className="grid grid-cols-[1fr_2fr_1.5fr_1.5fr_2fr_1fr] gap-1 px-3 py-2.5 text-[11px] text-center items-center">
                  <div className="text-left text-purple-600 font-medium">{bid.qty !== '-' ? Math.floor(Math.random() * 40) + 10 : '-'}</div>
                  <div className="text-right pr-2 font-semibold text-gray-800">{bid.qty}</div>
                  <div className="font-bold text-[#00B26A]">{bid.price}</div>
                  <div className="font-bold text-[#e11d48]">{ask.price}</div>
                  <div className="text-left pl-2 font-semibold text-gray-800">{ask.qty}</div>
                  <div className="text-right text-purple-600 font-medium">{ask.qty !== '-' ? Math.floor(Math.random() * 40) + 10 : '-'}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: ANALISIS */}
      {activeTab === 'ANALISIS' && (
        <div className="p-4 pb-24 bg-white">
          <h3 className="text-[14px] font-bold text-gray-900 mb-3">Analisis Konsensus & Tesis Investasi {displaySymbol}</h3>
          <div className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-xl mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-gray-700">Rekomendasi Konsensus</span>
              <span className="text-xs font-bold text-[#00B26A] bg-white px-2 py-0.5 rounded border border-emerald-300">BUY / OVERWEIGHT</span>
            </div>
            <p className="text-[12px] text-gray-700 leading-relaxed">
              {displaySymbol === 'BBCA' 
                ? 'Target harga konsensus analis berada di Rp 11.200 (potensi kenaikan +10.3%). Likuiditas solid dengan rasio CASA tertinggi di industri (81.6%) dan efisiensi operasional terdepan.' 
                : `84% indikator teknikal dan momentum likuiditas menunjukkan sinyal bullish berkelanjutan untuk ${displaySymbol}.`}
            </p>
          </div>

          {displaySymbol === 'BBCA' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="font-bold text-gray-900 block mb-1">Katalis Positif:</span>
                <ul className="list-disc pl-4 space-y-1 text-gray-600">
                  <li>Pertumbuhan kredit korporasi dan konsumer di atas rata-rata industri.</li>
                  <li>Cost of Credit (CoC) sangat rendah & NPL gross terjaga di 0.6%.</li>
                  <li>Dividen payout ratio konsisten di kisaran 50% - 60%.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: FINANSIAL (REAL-TIME FINANCIAL STATEMENTS MATCHING STOCKBIT) */}
      {activeTab === 'FINANSIAL' && (
        <FinancialStatementsView 
          symbol={symbol}
          displaySymbol={displaySymbol}
          isIdr={isIdr}
        />
      )}

      {/* TAB CONTENT: SEASONALITY */}
      {activeTab === 'SEASONALITY' && (
        <div className="p-4 pb-24 bg-white text-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900">Histori Return Musiman (Seasonality) {displaySymbol}</h3>
            <span className="text-[11px] text-gray-400 font-medium">5 Tahun Terakhir</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse text-[11px]">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-bold">
                  <th className="py-2 text-left pl-2">Tahun</th>
                  <th>Jan</th>
                  <th>Feb</th>
                  <th>Mar</th>
                  <th>Apr</th>
                  <th>Mei</th>
                  <th>Jun</th>
                  <th>Jul</th>
                  <th>Agu</th>
                  <th>Sep</th>
                  <th>Okt</th>
                  <th>Nov</th>
                  <th>Des</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[2025, 2024, 2023, 2022, 2021].map((year, idx) => (
                  <tr key={year} className="hover:bg-gray-50">
                    <td className="py-2.5 font-bold text-left pl-2 text-gray-900">{year}</td>
                    {[3.2, -1.5, 4.8, 2.1, -0.8, 5.4, -2.1, 1.9, -3.4, 6.2, 4.1, 8.5].map((val, mIdx) => {
                      const ret = idx % 2 === 0 ? val : -val * 0.8;
                      const isPositive = ret >= 0;
                      return (
                        <td key={mIdx} className="py-2 px-1">
                          <span className={cn(
                            "px-1.5 py-0.5 rounded font-bold text-[10px] inline-block min-w-[34px]",
                            isPositive ? "bg-emerald-50 text-[#00B26A]" : "bg-rose-50 text-rose-600"
                          )}>
                            {isPositive ? '+' : ''}{ret.toFixed(1)}%
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PERBANDINGAN (PEERS COMPARISON) */}
      {activeTab === 'PERBANDINGAN' && (
        <div className="p-4 pb-24 bg-white text-xs">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Perbandingan Emiten Sektor Sejenis</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[11.5px]">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-bold">
                  <th className="py-2.5 pl-2">Ticker</th>
                  <th className="text-right">Harga</th>
                  <th className="text-right">P/E (TTM)</th>
                  <th className="text-right">PBV</th>
                  <th className="text-right">ROE</th>
                  <th className="text-right pr-2">Market Cap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(isIdr 
                  ? [
                      { ticker: displaySymbol, price: assetData.price, pe: '14.2x', pbv: '3.8x', roe: '21.5%', mcap: '185 T', isCurrent: true },
                      { ticker: displaySymbol === 'BBCA' ? 'BBRI' : 'BBCA', price: 'Rp 4.750', pe: '11.8x', pbv: '2.4x', roe: '18.2%', mcap: '720 T' },
                      { ticker: displaySymbol === 'BMRI' ? 'BBNI' : 'BMRI', price: 'Rp 6.850', pe: '10.5x', pbv: '2.1x', roe: '19.4%', mcap: '638 T' },
                      { ticker: 'TLKM', price: 'Rp 3.120', pe: '12.4x', pbv: '2.6x', roe: '17.8%', mcap: '309 T' },
                      { ticker: 'ASII', price: 'Rp 5.200', pe: '7.8x', pbv: '1.1x', roe: '14.2%', mcap: '210 T' }
                    ]
                  : [
                      { ticker: displaySymbol, price: assetData.price, pe: '32.5x', pbv: '18.4x', roe: '45.2%', mcap: '$2.8T', isCurrent: true },
                      { ticker: 'AAPL', price: '$225.40', pe: '28.4x', pbv: '35.1x', roe: '145%', mcap: '$3.4T' },
                      { ticker: 'MSFT', price: '$440.10', pe: '34.2x', pbv: '12.8x', roe: '38.4%', mcap: '$3.2T' },
                      { ticker: 'GOOGL', price: '$178.60', pe: '22.1x', pbv: '6.4x', roe: '28.1%', mcap: '$2.2T' }
                    ]
                ).map((peer) => (
                  <tr key={peer.ticker} className={cn("hover:bg-gray-50", peer.isCurrent ? "bg-emerald-50/30 font-bold" : "")}>
                    <td className="py-2.5 pl-2 font-bold text-gray-900">
                      {peer.ticker}
                      {peer.isCurrent && <span className="ml-1 text-[9px] bg-[#00B26A] text-white px-1 py-0.2 rounded">Current</span>}
                    </td>
                    <td className="text-right text-gray-900 font-semibold">{peer.price}</td>
                    <td className="text-right text-emerald-600 font-bold">{peer.pe}</td>
                    <td className="text-right text-gray-700">{peer.pbv}</td>
                    <td className="text-right text-[#00B26A] font-bold">{peer.roe}</td>
                    <td className="text-right pr-2 text-gray-900 font-semibold">{peer.mcap}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BUY ORDER MODAL */}
      {showBuyOrder && (
        <div className="fixed inset-0 z-[200] bg-white">
          <BuyOrderPage 
            symbol={symbol} 
            onBack={() => setShowBuyOrder(false)} 
            onOrderSuccess={() => setShowBuyOrder(false)} 
          />
        </div>
      )}

      {/* PORTFOLIO DETAIL MODAL */}
      {showPortfolioDetail && (
        <div className="fixed inset-0 z-[200] bg-white">
          <PortfolioDetailPage 
            symbol={symbol} 
            onBack={() => setShowPortfolioDetail(false)} 
          />
        </div>
      )}

      {/* CREATE POST MODAL */}
      {showCreatePost && (
        <CreatePostPage 
          defaultSymbol={displaySymbol}
          onClose={() => setShowCreatePost(false)} 
        />
      )}
    </div>
  );
}
