import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, SquarePen, Clock, Share, Star, 
  LineChart as LineChartIcon, ChevronDown, Moon, ArrowUpRight, 
  ArrowDownRight, Maximize, Info, Search, ThumbsUp, ThumbsDown, 
  MessageCircle, DollarSign, SlidersHorizontal, CheckCircle2, MoreHorizontal,
  Eye, EyeOff
} from 'lucide-react';
import { cn, getEffectiveLivePrice } from '../lib/utils';
import { ResponsiveContainer, AreaChart, Area, YAxis, XAxis, ReferenceLine, Tooltip } from 'recharts';
import { BuyOrderPage } from './BuyOrderPage';
import { PortfolioDetailPage } from './PortfolioDetailPage';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { ref, onValue, set } from 'firebase/database';

interface AssetDetailsPageProps {
  symbol: string;
  onBack: () => void;
}

const cryptoLogos: Record<string, string> = {
  'BTCUSDT': 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
  'BTC': 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
  'ETHUSDT': 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  'ETH': 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  'BNBUSDT': 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
  'BNB': 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
  'SOLUSDT': 'https://cryptologos.cc/logos/solana-sol-logo.png',
  'SOL': 'https://cryptologos.cc/logos/solana-sol-logo.png',
  'XRPUSDT': 'https://cryptologos.cc/logos/xrp-xrp-logo.png',
  'XRP': 'https://cryptologos.cc/logos/xrp-xrp-logo.png',
  'ADAUSDT': 'https://cryptologos.cc/logos/cardano-ada-logo.png',
  'ADA': 'https://cryptologos.cc/logos/cardano-ada-logo.png',
  'DOGEUSDT': 'https://cryptologos.cc/logos/dogecoin-doge-logo.png',
  'DOGE': 'https://cryptologos.cc/logos/dogecoin-doge-logo.png',
  'AVAXUSDT': 'https://cryptologos.cc/logos/avalanche-avax-logo.png',
  'AVAX': 'https://cryptologos.cc/logos/avalanche-avax-logo.png',
  'MATICUSDT': 'https://cryptologos.cc/logos/polygon-matic-logo.png',
  'MATIC': 'https://cryptologos.cc/logos/polygon-matic-logo.png',
  'LINKUSDT': 'https://cryptologos.cc/logos/chainlink-link-logo.png',
  'LINK': 'https://cryptologos.cc/logos/chainlink-link-logo.png',
  'DOTUSDT': 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png',
  'DOT': 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png',
  'NEARUSDT': 'https://cryptologos.cc/logos/near-protocol-near-logo.png',
  'NEAR': 'https://cryptologos.cc/logos/near-protocol-near-logo.png',
  'SUIUSDT': 'https://cryptologos.cc/logos/sui-sui-logo.png',
  'SUI': 'https://cryptologos.cc/logos/sui-sui-logo.png',
  'PEPEUSDT': 'https://cryptologos.cc/logos/pepe-pepe-logo.png',
  'PEPE': 'https://cryptologos.cc/logos/pepe-pepe-logo.png',
  'SHIBUSDT': 'https://cryptologos.cc/logos/shiba-inu-shib-logo.png',
  'SHIB': 'https://cryptologos.cc/logos/shiba-inu-shib-logo.png',
  'ATOMUSDT': 'https://cryptologos.cc/logos/cosmos-atom-logo.png',
  'ATOM': 'https://cryptologos.cc/logos/cosmos-atom-logo.png',
  'TONUSDT': 'https://cryptologos.cc/logos/toncoin-ton-logo.png',
  'TON': 'https://cryptologos.cc/logos/toncoin-ton-logo.png',
  'LTCUSDT': 'https://cryptologos.cc/logos/litecoin-ltc-logo.png',
  'LTC': 'https://cryptologos.cc/logos/litecoin-ltc-logo.png',
  'UNIUSDT': 'https://cryptologos.cc/logos/uniswap-uni-logo.png',
  'UNI': 'https://cryptologos.cc/logos/uniswap-uni-logo.png',

  'NVDA': 'https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg',
  'AAPL': 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
  'TSLA': 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png',
  'MSFT': 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
  'AMZN': 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
  'GOOGL': 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg',
  'META': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg',
  'NFLX': 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
  'AMD': 'https://upload.wikimedia.org/wikipedia/commons/7/7c/AMD_Logo.svg',
  'INTC': 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Intel_logo_%282020%29.svg',
  'COIN': 'https://upload.wikimedia.org/wikipedia/commons/5/50/Coinbase_Logo_2019.svg',

  'GOLD': 'https://cdn-icons-png.flaticon.com/512/2822/2822831.png',
  'SILVER': 'https://cdn-icons-png.flaticon.com/512/2822/2822842.png',
  'SPX': 'https://upload.wikimedia.org/wikipedia/commons/1/18/S%26P_500_logo.svg',
  'NDX': 'https://upload.wikimedia.org/wikipedia/commons/8/87/Nasdaq_Logo.svg',
  'EURUSD': 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Euro_symbol.svg',
};

const cryptoNames: Record<string, string> = {
  'BTCUSDT': 'Bitcoin', 'BTC': 'Bitcoin',
  'ETHUSDT': 'Ethereum', 'ETH': 'Ethereum',
  'BNBUSDT': 'BNB', 'BNB': 'BNB',
  'SOLUSDT': 'Solana', 'SOL': 'Solana',
  'XRPUSDT': 'XRP', 'XRP': 'XRP',
  'ADAUSDT': 'Cardano', 'ADA': 'Cardano',
  'DOGEUSDT': 'Dogecoin', 'DOGE': 'Dogecoin',
  'AVAXUSDT': 'Avalanche', 'AVAX': 'Avalanche',
  'MATICUSDT': 'Polygon (POL)', 'MATIC': 'Polygon (POL)',
  'LINKUSDT': 'Chainlink', 'LINK': 'Chainlink',
  'DOTUSDT': 'Polkadot', 'DOT': 'Polkadot',
  'NEARUSDT': 'NEAR Protocol', 'NEAR': 'NEAR Protocol',
  'SUIUSDT': 'Sui Network', 'SUI': 'Sui Network',
  'PEPEUSDT': 'Pepe Coin', 'PEPE': 'Pepe Coin',
  'SHIBUSDT': 'Shiba Inu', 'SHIB': 'Shiba Inu',
  'ATOMUSDT': 'Cosmos', 'ATOM': 'Cosmos',
  'TONUSDT': 'Toncoin', 'TON': 'Toncoin',
  'LTCUSDT': 'Litecoin', 'LTC': 'Litecoin',
  'UNIUSDT': 'Uniswap', 'UNI': 'Uniswap',

  'NVDA': 'NVIDIA Corporation',
  'AAPL': 'Apple Inc.',
  'TSLA': 'Tesla, Inc.',
  'MSFT': 'Microsoft Corporation',
  'AMZN': 'Amazon.com, Inc.',
  'GOOGL': 'Alphabet Inc. (Google)',
  'META': 'Meta Platforms Inc.',
  'NFLX': 'Netflix Inc.',
  'AMD': 'Advanced Micro Devices',
  'INTC': 'Intel Corporation',
  'COIN': 'Coinbase Global, Inc.',

  'GOLD': 'Gold / Emas Global (XAU/USD)',
  'SILVER': 'Silver / Perak Global (XAG/USD)',
  'SPX': 'S&P 500 Index',
  'NDX': 'NASDAQ 100 Index',
  'EURUSD': 'EUR / USD Forex',
};

const stockBasePrices: Record<string, number> = {
  'NVDA': 128.50, 'AAPL': 224.30, 'TSLA': 210.80, 'MSFT': 448.20,
  'AMZN': 186.40, 'GOOGL': 172.90, 'META': 512.60, 'NFLX': 635.40,
  'AMD': 132.10, 'INTC': 20.40, 'COIN': 205.80,
  'GOLD': 2430.50, 'SILVER': 27.80, 'SPX': 5450.20, 'NDX': 19120.40, 'EURUSD': 1.0925
};

export function AssetDetailsPage({ symbol, onBack }: AssetDetailsPageProps) {
  // Navigation tabs - default STREAM as per reference design
  const [activeTab, setActiveTab] = useState<'STREAM' | 'KEYSTATS' | 'ORDERBOOK' | 'ANALISIS' | 'FINANSIAL'>('STREAM');
  const [streamFilter, setStreamFilter] = useState('All');
  const [streamSearch, setStreamSearch] = useState('');
  const [timeframe, setTimeframe] = useState('1D');
  const [showBuyOrder, setShowBuyOrder] = useState(false);
  const [showPortfolioDetail, setShowPortfolioDetail] = useState(false);
  const [isStarred, setIsStarred] = useState(true);

  // Firebase assetPrices sync
  const [assetPrices, setAssetPrices] = useState<Record<string, number>>({});

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
      }
    });
    return () => unsub();
  }, []);

  // User position & investment card state
  const { user } = useAuth();
  const [userPosition, setUserPosition] = useState<{
    symbol: string;
    stockName: string;
    lot: number;
    avgPrice: number;
    totalCost: number;
  } | null>(null);
  const [hideInvestmentValues, setHideInvestmentValues] = useState(false);

  // Subscribe to user position for this symbol
  useEffect(() => {
    if (user) {
      const posRef = ref(db, `users/${user.uid}/positions`);
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
    }
  }, [user, symbol]);

  const [chartData, setChartData] = useState<{ time: string; value: number }[]>([]);
  const [assetData, setAssetData] = useState({
    price: '0.00',
    change: '0.00',
    pct: '0.00%',
    up: true,
    high: '0.00',
    low: '0.00',
    volume: '0.00',
  });

  const [orderBook, setOrderBook] = useState<{
    bids: { price: string; qty: string }[];
    asks: { price: string; qty: string }[];
  }>({ bids: [], asks: [] });

  const displaySymbol = symbol.replace('USDT', '').toUpperCase();
  const logoUrl = cryptoLogos[symbol] || cryptoLogos[displaySymbol] || 'https://cryptologos.cc/logos/bitcoin-btc-logo.png';
  const fullName = cryptoNames[symbol] || cryptoNames[displaySymbol] || `${displaySymbol} Crypto Token`;

  // Fetch chart & real-time pricing data dynamically
  useEffect(() => {
    const cryptoList = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'AVAX', 'MATIC', 'LINK', 'DOT', 'NEAR', 'SUI', 'PEPE', 'SHIB', 'ATOM', 'TON', 'LTC', 'UNI'];
    const isCrypto = symbol.endsWith('USDT') || cryptoList.includes(symbol.toUpperCase());
    const normalizedSymbol = symbol.endsWith('USDT') ? symbol : `${symbol}USDT`;

    if (!isCrypto) {
      const formatP = (val: number) => {
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
              high: formatP(q.high || q.price * 1.02),
              low: formatP(q.low || q.price * 0.98),
              volume: q.volume ? (q.volume > 1000000 ? (q.volume / 1000000).toFixed(2) + 'M' : q.volume.toLocaleString()) : '18.4M',
            });

            if (q.chart && q.chart.length > 0) {
              setChartData(q.chart);
            }

            const currentPrice = q.price;
            set(ref(db, `assetPrices/${symbol}`), { symbol, price: currentPrice, updatedAt: Date.now() }).catch(() => {});
            set(ref(db, `assetPrices/${displaySymbol}`), { symbol: displaySymbol, price: currentPrice, updatedAt: Date.now() }).catch(() => {});
            setOrderBook({
              bids: Array.from({ length: 5 }, (_, idx) => ({
                price: formatP(currentPrice * (1 - (idx + 1) * 0.001)),
                qty: (Math.random() * 15 + 2).toFixed(1) + 'K'
              })),
              asks: Array.from({ length: 5 }, (_, idx) => ({
                price: formatP(currentPrice * (1 + (idx + 1) * 0.001)),
                qty: (Math.random() * 15 + 2).toFixed(1) + 'K'
              }))
            });
          }
        } catch (err) {
          console.warn('Error fetching stock quote:', err);
        }
      };

      fetchStockData();
      const interval = setInterval(fetchStockData, 3000);
      return () => clearInterval(interval);
    }

    // Determine Binance klines limit based on timeframe
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
        const base = displaySymbol === 'BTC' ? 97000 : displaySymbol === 'ETH' ? 2700 : displaySymbol === 'SOL' ? 175 : 100;
        const mock = Array.from({ length: 24 }, (_, i) => ({
          time: `${i}:00`,
          value: base + Math.sin(i / 2) * (base * 0.02)
        }));
        setChartData(mock);
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
          if (data && data.bids && data.asks) {
            setOrderBook({
              bids: data.bids.slice(0, 5).map((b: any) => ({
                price: parseFloat(b[0]).toLocaleString('en-US', { minimumFractionDigits: 2 }),
                qty: parseFloat(b[1]).toFixed(3)
              })),
              asks: data.asks.slice(0, 5).map((a: any) => ({
                price: parseFloat(a[0]).toLocaleString('en-US', { minimumFractionDigits: 2 }),
                qty: parseFloat(a[1]).toFixed(3)
              }))
            });
          }
        } catch (e) {}
      };
    } catch (e) {}

    return () => {
      if (wsTicker) wsTicker.close();
      if (wsDepth) wsDepth.close();
    };
  }, [symbol, timeframe]);

  if (showBuyOrder) {
    return (
      <BuyOrderPage
        symbol={symbol.endsWith('USDT') ? symbol : `${symbol}USDT`}
        onBack={() => setShowBuyOrder(false)}
        onOrderSuccess={() => setShowBuyOrder(false)}
      />
    );
  }

  // Dynamic social stream posts tailored to currently selected asset
  const streamPosts = [
    {
      id: '1',
      author: 'rizal230300',
      time: '10 Aug 26, 09:40',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=rizal',
      text: `$${displaySymbol} jangan lupa mulai hari ini pergerakan akumulasi aset, wns dlu guys! Tetap disiplin money management. 📈`,
      likes: 14,
      dislikes: 1,
      comments: 6
    },
    {
      id: '2',
      author: 'Diventra',
      time: '10 Aug 26, 09:40',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Diventra',
      text: `$${displaySymbol} yang hari ini lagi di area support penting, ayo $${displaySymbol} kiw kiw ❤️🚀 mari serok bertahap!`,
      likes: 32,
      dislikes: 0,
      comments: 12
    },
    {
      id: '3',
      author: 'TraderPro_ID',
      time: '10 Aug 26, 08:15',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=TraderPro',
      text: `Analisis Teknikal $${displaySymbol}: RSI oversold di timeframe 4H. Potensi reversal kuat dalam 24 jam ke depan! Target tp 1 di area resistance terdekat.`,
      likes: 58,
      dislikes: 2,
      comments: 19
    },
    {
      id: '4',
      author: 'CryptoWhaleWatcher',
      time: '10 Aug 26, 07:30',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Whale',
      text: `Alert: Terdeteksi perpindahan volume $${displaySymbol} sebesar 1,200 token ke wallet dingin. Indikasi hold jangka panjang. 💎🙌`,
      likes: 89,
      dislikes: 4,
      comments: 25
    }
  ];

  if (showBuyOrder) {
    return (
      <BuyOrderPage
        symbol={symbol}
        onBack={() => setShowBuyOrder(false)}
        onOrderSuccess={() => setShowBuyOrder(false)}
      />
    );
  }

  if (showPortfolioDetail) {
    return (
      <PortfolioDetailPage
        symbol={symbol}
        onBack={() => setShowPortfolioDetail(false)}
      />
    );
  }

  return (
    <div className="flex h-full flex-col bg-white overflow-y-auto no-scrollbar">
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 h-12 bg-white sticky top-0 z-20 border-b border-gray-50">
        <button onClick={onBack} className="p-1.5 -ml-1.5 text-gray-700 hover:text-black transition-colors">
          <ChevronLeft className="w-6 h-6" strokeWidth={2} />
        </button>
        <div className="flex items-center gap-4 text-gray-600">
          <SquarePen className="w-5 h-5 cursor-pointer hover:text-black" strokeWidth={1.8} />
          <Clock className="w-5 h-5 cursor-pointer hover:text-black" strokeWidth={1.8} />
          <Share className="w-5 h-5 cursor-pointer hover:text-black" strokeWidth={1.8} />
          <button onClick={() => setIsStarred(!isStarred)}>
            <Star className={cn("w-5 h-5 cursor-pointer transition-colors", isStarred ? "text-[#FFD700] fill-[#FFD700]" : "text-gray-400")} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* ASSET HEADER SECTION */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <h1 className="text-[18px] font-extrabold text-gray-900 tracking-tight">{displaySymbol}</h1>
              <ChevronDown className="w-4 h-4 text-gray-400" strokeWidth={2.5} />
              
              {/* Badges as per image 1 */}
              <div className="flex items-center justify-center px-1.5 py-0.5 bg-purple-50 text-[#9333ea] rounded text-[10px] font-bold border border-purple-200 ml-1">
                4x
              </div>
              <div className="flex items-center justify-center px-1.5 py-0.5 bg-emerald-50 text-[#00B26A] rounded text-[10px] font-bold border border-emerald-200">
                TL
              </div>
            </div>
            <p className="text-[12px] text-gray-500 font-medium mb-3">{fullName}</p>
          </div>

          {/* Asset Logo Image */}
          <div className="w-[46px] h-[46px] rounded-full bg-red-500 flex items-center justify-center p-1.5 shadow-sm overflow-hidden shrink-0 mt-1">
            <img 
              src={logoUrl} 
              alt={fullName} 
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback to stylized logo if network icon fails
                (e.target as HTMLElement).style.display = 'none';
              }} 
            />
          </div>
        </div>

        {/* PRICE DISPLAY */}
        <div className="flex flex-col mt-1">
          <h2 className="text-[36px] font-black text-gray-900 leading-none tracking-tight">
            {assetData.price}
          </h2>
          <div className="flex items-center gap-1.5 mt-2">
            <span className={cn(
              "text-[13px] font-bold flex items-center gap-0.5",
              assetData.up ? "text-[#00B26A]" : "text-[#e11d48]"
            )}>
              {assetData.up ? '↗' : '↘'} {assetData.change} ({assetData.pct})
            </span>
            <span className="text-[12px] text-gray-400 font-medium">Hari Ini</span>
          </div>
        </div>

        {/* CATEGORY / TAG PILLS */}
        <div className="flex flex-wrap items-center gap-2 mt-3.5">
          <span className="px-2.5 py-1 rounded border border-[#00B26A] text-[#00B26A] text-[11px] font-bold bg-emerald-50/30">
            Kripto
          </span>
          <span className="px-2.5 py-1 rounded border border-[#00B26A] text-[#00B26A] text-[11px] font-bold bg-emerald-50/30">
            Spot
          </span>
          <span className="px-2.5 py-1 rounded border border-[#00B26A] text-[#00B26A] text-[11px] font-bold bg-emerald-50/30">
            24H Trade
          </span>
        </div>
      </div>

      {/* CHART UTAMA */}
      <div className="px-4 mt-4 h-60 relative w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 15, right: 35, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={assetData.up ? "#00B26A" : "#e11d48"} stopOpacity={0.25}/>
                <stop offset="95%" stopColor={assetData.up ? "#00B26A" : "#e11d48"} stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <YAxis 
              domain={['dataMin', 'dataMax']} 
              orientation="right" 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }}
              dx={4}
              tickFormatter={(val) => val >= 1000 ? val.toLocaleString('en-US', { maximumFractionDigits: 0 }) : val.toString()}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md">
                      {payload[0].value?.toLocaleString('en-US')}
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine y={chartData.length > 0 ? chartData[0].value : 0} stroke="#e5e7eb" strokeDasharray="3 3" />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={assetData.up ? "#00B26A" : "#e11d48"} 
              strokeWidth={2.5} 
              fillOpacity={1}
              fill="url(#chartFill)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* High & Low Price Tags on Chart */}
        <div className="absolute top-1 left-1/2 transform -translate-x-1/2 text-[10px] font-bold text-[#00B26A] bg-white px-1.5 py-0.5 rounded border border-emerald-100 shadow-2xs">
          {assetData.high}
        </div>
        <div className="absolute bottom-6 left-1/4 text-[10px] font-bold text-[#00B26A] bg-white px-1.5 py-0.5 rounded border border-emerald-100 shadow-2xs">
          {assetData.low}
        </div>

        {/* Maximize Icon */}
        <div className="absolute bottom-0 right-3 p-1.5 bg-gray-50 rounded-md border border-gray-200 cursor-pointer text-gray-500 hover:text-black">
          <Maximize className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* TIMEFRAME SELECTOR */}
      <div className="px-4 mt-3 w-full border-b border-gray-100 pb-2">
        <div className="flex items-center justify-between text-[11px] font-bold overflow-x-auto no-scrollbar gap-4">
          {['1D', '1W', '1M', '3M', 'YTD', '1Y', '3Y', '5Y'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={cn(
                "pb-2 relative whitespace-nowrap transition-colors",
                timeframe === tf ? "text-[#00B26A]" : "text-gray-400 hover:text-gray-600"
              )}
            >
              {tf}
              {timeframe === tf && (
                <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#00B26A] rounded-full" />
              )}
            </button>
          ))}
          <div className="flex items-center gap-2 text-gray-400 shrink-0 ml-auto pl-2 border-l border-gray-100">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 cursor-pointer hover:text-gray-600">
              <path d="M12 4V20M8 8L12 4L16 8M8 16L12 20L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <LineChartIcon className="w-4 h-4 text-[#00B26A] cursor-pointer" />
          </div>
        </div>
      </div>

      {/* BUTTON BELI - FULL WIDTH */}
      <div className="px-4 mt-4 mb-2">
        <button 
          onClick={() => setShowBuyOrder(true)} 
          className="w-full bg-[#00B26A] text-white font-black py-3.5 rounded-lg text-sm hover:bg-[#00995c] active:scale-[0.99] transition-all shadow-sm"
        >
          Beli
        </button>
      </div>

      {/* NAVIGATION TAB BAR */}
      <div className="w-full border-b border-gray-100 mt-2 bg-white sticky top-12 z-10">
        <div className="flex items-center text-[11px] font-bold overflow-x-auto no-scrollbar px-2">
          {(['STREAM', 'KEYSTATS', 'ORDERBOOK', 'ANALISIS', 'FINANSIAL'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-3.5 py-3 cursor-pointer whitespace-nowrap relative shrink-0 transition-colors",
                activeTab === tab ? "text-[#00B26A]" : "text-gray-400 hover:text-gray-600"
              )}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#00B26A] rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT: STREAM (DEFAULT) */}
      {activeTab === 'STREAM' && (
        <div className="pb-24 bg-white">
          {/* CARD INVESTASI SAYA (JIKA USER MEMILIKI ASET INI) */}
          {userPosition && userPosition.lot > 0 && (() => {
            const cleanSym = symbol.toUpperCase().replace('USDT', '');
            const livePrice = assetPrices[symbol] ?? assetPrices[cleanSym] ?? assetPrices[displaySymbol] ?? parseFloat(assetData.price.replace(/,/g, '')) ?? userPosition.avgPrice ?? 97;
            const currentNumericPrice = getEffectiveLivePrice(userPosition.avgPrice, livePrice, 97);
            const posShares = userPosition.lot * 100;
            const posCostBasis = (userPosition.avgPrice || 0) * posShares;
            const posMarketVal = posShares * currentNumericPrice;
            const posPnL = posMarketVal - posCostBasis;
            const posPnLPct = posCostBasis > 0 ? (posPnL / posCostBasis) * 100 : 0;
            const isPosUp = posPnL >= 0;

            return (
              <div className="mx-4 mt-3 mb-2 bg-white border border-gray-100 rounded-xl shadow-xs overflow-hidden relative">
                {/* Accent strip on left */}
                <div className={cn(
                  "absolute left-0 top-0 bottom-0 w-1",
                  isPosUp ? "bg-[#00B26A]" : "bg-[#e11d48]"
                )} />

                <div className="p-3.5 pl-4">
                  {/* Top Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div 
                      onClick={() => setShowPortfolioDetail(true)}
                      className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      <span className="text-[13px] font-bold text-gray-800">
                        Investasi Saya di <span className="font-extrabold text-gray-900">{displaySymbol}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setHideInvestmentValues(!hideInvestmentValues);
                        }}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-0.5"
                      >
                        {hideInvestmentValues ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => setShowPortfolioDetail(true)}
                        className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Market Value Row */}
                  <div className="mb-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[20px] font-black text-gray-900 tracking-tight">
                        {hideInvestmentValues ? 'Rp ***' : `Rp ${Math.round(posMarketVal).toLocaleString('en-US')}`}
                      </span>
                      <span className={cn(
                        "text-[12px] font-bold",
                        isPosUp ? "text-[#00B26A]" : "text-[#e11d48]"
                      )}>
                        {hideInvestmentValues ? '***' : `${isPosUp ? '+' : ''}${posPnLPct.toFixed(2)}%`}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400 font-medium block mt-0.5">Market Value</span>
                  </div>

                  {/* 3 Columns Grid */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
                    <div>
                      <span className="text-[12px] font-bold text-gray-900 block">
                        {hideInvestmentValues ? 'Rp ***' : `Rp ${userPosition.avgPrice?.toLocaleString('en-US')}`}
                      </span>
                      <span className="text-[11px] text-gray-400 font-medium">Avg Price</span>
                    </div>

                    <div className="border-l border-gray-100 pl-3">
                      <span className="text-[12px] font-bold text-gray-900 block">
                        {hideInvestmentValues ? '***' : userPosition.lot?.toLocaleString('en-US')}
                      </span>
                      <span className="text-[11px] text-gray-400 font-medium">Bal Lot</span>
                    </div>

                    <div className="border-l border-gray-100 pl-3">
                      <span className={cn(
                        "text-[12px] font-bold block",
                        isPosUp ? "text-[#00B26A]" : "text-[#e11d48]"
                      )}>
                        {hideInvestmentValues ? 'Rp ***' : `${isPosUp ? '+Rp ' : '-Rp '}${Math.abs(Math.round(posPnL)).toLocaleString('en-US')}`}
                      </span>
                      <span className="text-[11px] text-gray-400 font-medium">P/L</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Stream Filter Chips */}
          <div className="px-4 pt-3 pb-2 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {['All', 'Notes', 'Berita', 'Laporan', 'Riset', 'Ide', 'Prediksi', 'Polling'].map((chip) => (
                <button
                  key={chip}
                  onClick={() => setStreamFilter(chip)}
                  className={cn(
                    "px-3 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap transition-colors",
                    streamFilter === chip 
                      ? "bg-white border-[#00B26A] text-[#00B26A]" 
                      : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                  )}
                >
                  {chip}
                </button>
              ))}
            </div>
            <button className="p-1.5 rounded-full border border-gray-200 text-gray-500 shrink-0 hover:bg-gray-50">
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search Box */}
          <div className="px-4 py-2">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input 
                type="text"
                value={streamSearch}
                onChange={(e) => setStreamSearch(e.target.value)}
                placeholder="Cari Stream"
                className="w-full bg-transparent text-xs text-gray-800 outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Stream Feed Posts */}
          <div className="divide-y divide-gray-100 mt-2">
            {streamPosts
              .filter(p => !streamSearch || p.text.toLowerCase().includes(streamSearch.toLowerCase()))
              .map((post) => (
                <div key={post.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                  {/* Post Author */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <img src={post.avatar} alt={post.author} className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200" />
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-[13px] font-bold text-gray-900">{post.author}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#00B26A] fill-emerald-100" />
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium">{post.time}</span>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Post Text */}
                  <p className="text-[13px] text-gray-800 leading-relaxed font-normal mb-3">
                    {post.text.split(`$${displaySymbol}`).map((part, index, array) => (
                      <React.Fragment key={index}>
                        {part}
                        {index < array.length - 1 && (
                          <span className="font-extrabold text-[#00B26A] hover:underline cursor-pointer">
                            ${displaySymbol}
                          </span>
                        )}
                      </React.Fragment>
                    ))}
                  </p>

                  {/* Action Icons */}
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
                      <Share className="w-4 h-4" />
                    </button>
                    <button className="hover:text-amber-600">
                      <DollarSign className="w-4 h-4" />
                    </button>
                    <button className="flex items-center gap-1 hover:text-emerald-600">
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
              <span className="font-bold text-gray-900">{assetData.high}</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-gray-500 block text-[11px] mb-1">24h Terendah</span>
              <span className="font-bold text-gray-900">{assetData.low}</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-gray-500 block text-[11px] mb-1">Volume 24h</span>
              <span className="font-bold text-gray-900">{assetData.volume}</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-gray-500 block text-[11px] mb-1">Kapitalisasi Pasar</span>
              <span className="font-bold text-gray-900">
                {displaySymbol === 'BTC' ? '$1.82 Triliun' : displaySymbol === 'ETH' ? '$320 Miliar' : '$45 Miliar'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ORDERBOOK */}
      {activeTab === 'ORDERBOOK' && (
        <div className="pb-24 bg-white">
          <div className="grid grid-cols-[1fr_2fr_1.5fr_1.5fr_2fr_1fr] gap-1 px-3 py-3 text-[11px] font-bold text-gray-900 border-b border-gray-100 text-center bg-gray-50/50">
            <div className="text-left">Freq</div>
            <div className="text-right pr-2">Lot/Qty</div>
            <div>Bid</div>
            <div>Ask</div>
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
                  <div className="font-bold text-[#e11d48]">{bid.price}</div>
                  <div className="font-bold text-[#00B26A]">{ask.price}</div>
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
          <h3 className="text-[14px] font-bold text-gray-900 mb-3">Sinyal Teknis & Sentimen</h3>
          <div className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-xl mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-gray-700">Sentimen Pasar</span>
              <span className="text-xs font-bold text-[#00B26A] bg-white px-2 py-0.5 rounded border border-emerald-300">BULLISH</span>
            </div>
            <p className="text-[12px] text-gray-600">
              84% indikator teknikal menunjukkan sinyal tren naik untuk {displaySymbol}.
            </p>
          </div>
        </div>
      )}

      {/* TAB CONTENT: FINANSIAL */}
      {activeTab === 'FINANSIAL' && (
        <div className="p-4 pb-24 bg-white text-[12px]">
          <h3 className="text-[14px] font-bold text-gray-900 mb-3">Metrik Finansial {displaySymbol}</h3>
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Pasokan Beredar</span>
              <span className="font-bold text-gray-900">{displaySymbol === 'BTC' ? '19.7M BTC' : '120.2M Token'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Maksimum Pasokan</span>
              <span className="font-bold text-gray-900">{displaySymbol === 'BTC' ? '21.0M BTC' : 'Tak Terbatas'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
