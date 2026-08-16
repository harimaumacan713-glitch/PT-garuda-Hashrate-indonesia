import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Calendar, Search, ChevronDown, Activity, SlidersHorizontal, ArrowUpRight, ArrowDownRight, Globe, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';
import { ResponsiveContainer, YAxis, AreaChart, Area } from 'recharts';
import { AssetDetailsPage } from './AssetDetailsPage';
import { RunningTradeScreen } from '../components/RunningTradeScreen';
import { TopBrokerScreen } from '../components/TopBrokerScreen';
import { BrokerActivityScreen } from '../components/BrokerActivityScreen';
import { TopStockScreen } from '../components/TopStockScreen';
import { InsiderActivityScreen } from '../components/InsiderActivityScreen';
import { db } from '../lib/firebase';
import { ref, set, onValue } from 'firebase/database';
import { ALL_GLOBAL_ASSETS, getAssetLogo, getAssetName, isIDXStock, GlobalAssetItem } from '../lib/assetsData';
import { AssetLogo } from '../components/AssetLogo';

const shortcuts = [
  { 
    id: 'running', 
    icon: (props: any) => (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <circle cx="13" cy="12" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M13 9V12L15 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 3H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M4 11H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M5 14H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ), 
    label: 'Running\nTrade', 
    color: 'text-purple-500', 
    bg: 'bg-purple-50/50' 
  },
  { 
    id: 'broker', 
    icon: (props: any) => (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M11 5L10 8L12 10L14 8L13 5H11Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M10 8L11 17L12 18L13 17L14 8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M11 5L8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M13 5L16 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ), 
    label: 'Top\nBroker', 
    color: 'text-green-500', 
    bg: 'bg-green-50/50' 
  },
  { 
    id: 'activity', 
    icon: (props: any) => (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect x="3" y="6" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M6 13L9 10L11 12L14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18 13L17.5 15L18.5 16L19.5 15L19 13H18Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M17.5 15L18 20L18.5 21L19 20L19.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ), 
    label: 'Broker\nActivity', 
    isNew: true, 
    color: 'text-pink-600', 
    bg: 'bg-pink-50/50' 
  },
  { 
    id: 'stock', 
    icon: (props: any) => (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M10 13H14V19H10V13Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M6 15H10V19H6V15Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M14 16H18V19H14V16Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M5 19H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M12 11V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M12 4V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ), 
    label: 'Top\nStock', 
    color: 'text-orange-500', 
    bg: 'bg-orange-50/50' 
  },
  { 
    id: 'insider', 
    icon: (props: any) => (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect x="4" y="8" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 8V6C8 4.89543 8.89543 4 10 4H14C15.1046 4 16 4.89543 16 6V8" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 12H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M16 12L14 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 15H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M8 15L10 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ), 
    label: 'Insider\nActivity', 
    color: 'text-[#0ea5e9]', 
    bg: 'bg-sky-50' 
  }
];

export function SearchPage({ onOpenProfile }: { onOpenProfile?: () => void }) {
  const [activeTab, setActiveTab] = useState<'MARKET' | 'GLOBAL' | 'BONDS' | 'REKSADANA'>('MARKET');
  const [categoryFilter, setCategoryFilter] = useState<'Semua' | 'Saham IDX' | 'Saham Global' | 'Crypto' | 'Komoditas & Forex'>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [activeScreen, setActiveScreen] = useState<string | null>(null);

  // Featured Header Asset: Default to BTC/USD with live real-time chart
  const [featuredAsset, setFeaturedAsset] = useState<'BTCUSDT' | 'BBCA'>('BTCUSDT');

  const [chartData, setChartData] = useState<{value: number}[]>([]);
  const [headerAssetData, setHeaderAssetData] = useState({
    symbol: 'BTCUSDT',
    name: 'Bitcoin',
    price: '63,138.78',
    change: '+890.50',
    changePercent: '1.43',
    up: true,
    open: '62,248.28',
    high: '63,450.00',
    low: '62,100.00',
    vol: '38.45K BTC',
    quoteVol: '$2.43B',
    freq: '1,840,500',
    currency: 'USD'
  });

  // Real-time market prices state
  const [assetPrices, setAssetPrices] = useState<Record<string, { price: string, change: string, pct: string, up: boolean, rawPrice: number }>>({});

  // Initialize default prices for all assets
  useEffect(() => {
    const initialPrices: Record<string, { price: string, change: string, pct: string, up: boolean, rawPrice: number }> = {};
    ALL_GLOBAL_ASSETS.forEach(item => {
      if (item.basePrice) {
        const p = item.basePrice;
        const changePct = ((Math.random() - 0.3) * 2.5).toFixed(2);
        const up = parseFloat(changePct) >= 0;
        const changeVal = (p * (parseFloat(changePct) / 100)).toFixed(item.currency === 'IDR' ? 0 : 2);
        initialPrices[item.symbol] = {
          price: item.currency === 'IDR' 
            ? p.toLocaleString('id-ID')
            : (p >= 100 ? p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : p.toString()),
          change: `${up ? '+' : ''}${item.currency === 'IDR' ? Number(changeVal).toLocaleString('id-ID') : changeVal}`,
          pct: `${up ? '+' : ''}${changePct}%`,
          up,
          rawPrice: p
        };
      }
    });
    setAssetPrices(prev => ({ ...initialPrices, ...prev }));
  }, []);

  // Fetch featured asset data & chart (BBCA or BTC)
  useEffect(() => {
    if (featuredAsset === 'BBCA') {
      const fetchBBCA = () => {
        fetch('/api/quote/BBCA')
          .then(res => res.json())
          .then(data => {
            if (data && data.success && data.quote) {
              const q = data.quote;
              const isUp = (q.change || 0) >= 0;
              setHeaderAssetData({
                symbol: 'BBCA',
                name: 'PT Bank Central Asia Tbk',
                price: q.price ? q.price.toLocaleString('id-ID') : '6.350',
                change: `${isUp ? '+' : ''}${(q.change || 0).toLocaleString('id-ID')}`,
                changePercent: (q.pctChange || 0).toFixed(2),
                up: isUp,
                open: (q.open || q.price - (q.change || 0)).toLocaleString('id-ID'),
                high: (q.high || q.price * 1.015).toLocaleString('id-ID'),
                low: (q.low || q.price * 0.985).toLocaleString('id-ID'),
                vol: q.volDisplay || (q.volume ? (q.volume > 1000000 ? (q.volume / 1000000).toFixed(1) + 'M Lot' : q.volume.toLocaleString('id-ID')) : '56.9M'),
                quoteVol: q.valDisplay || '578.2B',
                freq: q.freqDisplay || '24.120',
                currency: 'IDR'
              });

              if (q.chart && q.chart.length > 0) {
                setChartData(q.chart.map((c: any) => ({ value: c.value })));
              }
            }
          })
          .catch(() => {});
      };

      fetchBBCA();
      const interval = setInterval(fetchBBCA, 1200);
      return () => clearInterval(interval);
    } else {
      // BTC/USD Real-time Klines
      let isMounted = true;
      const fetchBTCKlines = () => {
        fetch('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=60')
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data) && isMounted) {
              const formatted = data.map((d: any) => ({ value: parseFloat(d[4]) }));
              setChartData(formatted);
            }
          })
          .catch(() => {});
      };

      // Also fetch 24h ticker immediately for instant display
      fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT')
        .then(res => res.json())
        .then(data => {
          if (data && data.lastPrice && isMounted) {
            const currentPrice = parseFloat(data.lastPrice);
            const change = parseFloat(data.priceChange || '0');
            const isUp = change >= 0;
            const formatPrice = (val: number) => val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            setHeaderAssetData({
              symbol: 'BTCUSDT',
              name: 'Bitcoin',
              price: formatPrice(currentPrice),
              change: isUp ? `+${formatPrice(change)}` : formatPrice(change),
              changePercent: parseFloat(data.priceChangePercent || '0').toFixed(2),
              up: isUp,
              open: formatPrice(parseFloat(data.openPrice || '0')),
              high: formatPrice(parseFloat(data.highPrice || '0')),
              low: formatPrice(parseFloat(data.lowPrice || '0')),
              vol: `${(parseFloat(data.volume || '0') / 1000).toFixed(2)}K BTC`,
              quoteVol: `$${(parseFloat(data.quoteVolume || '0') / 1000000000).toFixed(2)}B`,
              freq: (data.count || 2450000).toLocaleString('id-ID'),
              currency: 'USD'
            });
          }
        })
        .catch(() => {});

      fetchBTCKlines();
      const interval = setInterval(fetchBTCKlines, 5000);
      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }
  }, [featuredAsset]);

  // Binance WebSockets for Crypto assets
  useEffect(() => {
    const cryptoItems = ALL_GLOBAL_ASSETS.filter(a => a.category === 'Crypto');
    const streams = cryptoItems.map(c => `${c.symbol.toLowerCase()}@ticker`).join('/');
    
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);
      ws.onerror = () => {};
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const symbol = data.s;
          if (!symbol) return;
          
          const currentPrice = parseFloat(data.c || '0');
          const change = parseFloat(data.p || '0');
          const isUp = change >= 0;
          
          const formatPrice = (val: number) => {
            if (val < 1) return val.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 });
            return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          };

          if (symbol === 'BTCUSDT' && featuredAsset === 'BTCUSDT') {
            setHeaderAssetData({
              symbol: 'BTCUSDT',
              name: 'Bitcoin',
              price: formatPrice(currentPrice),
              change: isUp ? `+${formatPrice(change)}` : formatPrice(change),
              changePercent: parseFloat(data.P || '0').toFixed(2),
              up: isUp,
              open: formatPrice(parseFloat(data.o || '0')),
              high: formatPrice(parseFloat(data.h || '0')),
              low: formatPrice(parseFloat(data.l || '0')),
              vol: parseFloat(data.v || '0').toLocaleString('en-US', { maximumFractionDigits: 2 }),
              quoteVol: (parseFloat(data.q || '0') / 1000000).toFixed(2) + 'M',
              freq: (data.n || 0).toLocaleString('en-US'),
              currency: 'USD'
            });

            setChartData(prev => {
              if (prev.length === 0 || prev[0].value === 0) {
                 return Array.from({ length: 50 }, () => ({ value: currentPrice }));
              }
              const newData = [...prev];
              newData[newData.length - 1] = { value: currentPrice };
              return newData;
            });
          }

          setAssetPrices(prev => ({
            ...prev,
            [symbol]: {
              price: formatPrice(currentPrice),
              change: isUp ? `+${formatPrice(change)}` : formatPrice(change),
              pct: `${isUp ? '+' : ''}${parseFloat(data.P || '0').toFixed(2)}%`,
              up: isUp,
              rawPrice: currentPrice
            }
          }));
        } catch (e) {}
      };
    } catch (e) {}

    return () => {
      if (ws) ws.close();
    };
  }, [featuredAsset]);

  // Fetch real market quotes (Indonesian IDX Stocks including BBCA, US Stocks & Crypto) from server API
  useEffect(() => {
    const fetchGlobalQuotes = async () => {
      try {
        const res = await fetch('/api/quotes');
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.quotes) {
          const quotes = data.quotes;
          const newPrices: Record<string, { price: string, change: string, pct: string, up: boolean, rawPrice: number }> = {};
          
          ALL_GLOBAL_ASSETS.forEach(item => {
            const q = quotes[item.symbol] || quotes[`${item.symbol}USDT`];
            if (q) {
              const isUp = (q.change || 0) >= 0;
              const isIdr = item.currency === 'IDR' || isIDXStock(item.symbol);
              
              const formatP = (val: number) => {
                if (isIdr) return Math.round(val).toLocaleString('id-ID');
                if (val < 0.01) return val.toFixed(6);
                if (val < 10) return val.toFixed(4);
                return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              };

              newPrices[item.symbol] = {
                price: formatP(q.price),
                change: `${isUp ? '+' : ''}${formatP(q.change || 0)}`,
                pct: `${isUp ? '+' : ''}${(q.pctChange || 0).toFixed(2)}%`,
                up: isUp,
                rawPrice: q.price
              };
              set(ref(db, `assetPrices/${item.symbol}`), { symbol: item.symbol, price: q.price, updatedAt: Date.now() }).catch(() => {});
            }
          });

          setAssetPrices(prev => ({ ...prev, ...newPrices }));
        }
      } catch (err) {
        console.warn('Failed to fetch quotes:', err);
      }
    };

    fetchGlobalQuotes();
    const interval = setInterval(fetchGlobalQuotes, 1500);
    return () => clearInterval(interval);
  }, []);

  if (selectedAsset) {
    return <AssetDetailsPage symbol={selectedAsset} onBack={() => setSelectedAsset(null)} />;
  }

  if (activeScreen === 'running') {
    return <RunningTradeScreen onBack={() => setActiveScreen(null)} />;
  }
  if (activeScreen === 'broker') {
    return <TopBrokerScreen onBack={() => setActiveScreen(null)} />;
  }
  if (activeScreen === 'activity') {
    return <BrokerActivityScreen onBack={() => setActiveScreen(null)} />;
  }
  if (activeScreen === 'stock') {
    return <TopStockScreen onBack={() => setActiveScreen(null)} />;
  }
  if (activeScreen === 'insider') {
    return <InsiderActivityScreen onBack={() => setActiveScreen(null)} />;
  }

  // Filter asset items
  const filteredAssets = ALL_GLOBAL_ASSETS.filter(asset => {
    // Search query filter
    const matchesSearch = !searchQuery || 
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.symbol === 'BBCA' && (searchQuery.toLowerCase().includes('bca') || searchQuery.toLowerCase().includes('bank central asia')));

    // Category filter
    let matchesCategory = true;
    if (categoryFilter !== 'Semua') {
      matchesCategory = asset.category === categoryFilter;
    } else if (activeTab === 'MARKET') {
      matchesCategory = true;
    } else if (activeTab === 'GLOBAL') {
      matchesCategory = asset.category === 'Saham Global' || asset.category === 'Komoditas & Forex' || asset.category === 'Crypto';
    }

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <header className="flex h-14 items-center gap-3 px-4 bg-white sticky top-0 z-10 border-b border-gray-100">
        <button onClick={onOpenProfile} className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-blue-100 flex items-center justify-center border border-gray-100">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Garuda" alt="Avatar" className="h-full w-full object-cover" />
        </button>
        <div className="flex h-9 flex-1 items-center gap-2 rounded-lg bg-gray-100 px-3">
          <Search className="h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari simbol saham (BBCA, BBRI, NVDA, BTC...)" 
            className="flex-1 bg-transparent text-xs text-gray-800 outline-none placeholder:text-gray-400 font-medium" 
          />
        </div>
      </header>

      {/* Tabs */}
      <div className="flex px-4 border-b border-gray-100 bg-white">
        {(['MARKET', 'GLOBAL', 'BONDS', 'REKSADANA'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              if (tab === 'GLOBAL') setCategoryFilter('Saham Global');
              else if (tab === 'MARKET') setCategoryFilter('Semua');
            }}
            className={cn(
              "flex-1 py-3 text-[11px] font-bold tracking-wide relative",
              activeTab === tab ? "text-[#00B26A]" : "text-gray-400"
            )}
          >
            {tab === 'MARKET' ? 'SAHAM IDX' : tab}
            {tab === 'MARKET' && (
              <span className="absolute top-1 right-0 rounded bg-blue-600 px-1 py-[1px] text-[8px] font-bold text-white">Live</span>
            )}
            {tab === 'GLOBAL' && (
              <span className="absolute top-1 right-1 rounded bg-[#00B26A] px-1 py-[1px] text-[8px] font-bold text-white">Live</span>
            )}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-1/2 h-[2.5px] w-3/4 -translate-x-1/2 bg-[#00B26A] rounded-t-md" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
        {/* Featured Live Chart Card (BTC/USD Live Real-time) */}
        <div className="py-4 cursor-pointer hover:bg-slate-50/50 transition-colors">
          <div className="flex items-center justify-between mb-3 px-4">
            <div className="flex items-center gap-2" onClick={() => setSelectedAsset(featuredAsset === 'BBCA' ? 'BBCA' : 'BTCUSDT')}>
              <div className="flex items-center rounded overflow-hidden shadow-2xs">
                <div className={cn("w-1.5 h-[24px]", headerAssetData.up ? "bg-[#00B26A]" : "bg-[#e11d48]")}></div>
                <span className="bg-[#111827] px-2 text-xs font-black text-white h-[24px] flex items-center gap-1.5">
                  {headerAssetData.symbol === 'BBCA' ? 'BBCA (IDX)' : 'BTC / USD'} 
                  <span className="w-2 h-2 rounded-full bg-[#00B26A] animate-ping inline-block" />
                </span>
              </div>
              <span className="text-[17px] font-extrabold text-gray-900">
                {headerAssetData.currency === 'IDR' ? `Rp ${headerAssetData.price}` : `$${headerAssetData.price}`}
              </span>
              <span className={cn("text-xs font-bold", headerAssetData.up ? "text-[#00B26A]" : "text-[#e11d48]")}>
                {headerAssetData.change} ({headerAssetData.changePercent}%)
              </span>
            </div>

            {/* Toggle BTC / BBCA */}
            <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg">
              <button 
                onClick={(e) => { e.stopPropagation(); setFeaturedAsset('BTCUSDT'); }}
                className={cn("px-2 py-0.5 text-[10px] font-bold rounded-md transition-all", featuredAsset === 'BTCUSDT' ? "bg-white text-[#F7931A] shadow-2xs" : "text-gray-500")}
              >
                BTC/USD
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setFeaturedAsset('BBCA'); }}
                className={cn("px-2 py-0.5 text-[10px] font-bold rounded-md transition-all", featuredAsset === 'BBCA' ? "bg-white text-blue-700 shadow-2xs" : "text-gray-500")}
              >
                BBCA
              </button>
            </div>
          </div>

          <div className="h-[200px] w-full relative" onClick={() => setSelectedAsset(featuredAsset === 'BBCA' ? 'BBCA' : 'BTCUSDT')}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 40, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={headerAssetData.up ? "#00B26A" : "#e11d48"} stopOpacity={0.15}/>
                    <stop offset="95%" stopColor={headerAssetData.up ? "#00B26A" : "#e11d48"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <YAxis 
                  domain={['dataMin', 'dataMax']} 
                  orientation="right" 
                  tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  dx={8}
                  tickFormatter={(val) => headerAssetData.currency === 'IDR' ? Math.round(val).toLocaleString('id-ID') : val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={headerAssetData.up ? "#00B26A" : "#e11d48"} 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  isAnimationActive={false} 
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-0 right-14 border-t border-dashed border-gray-200 pointer-events-none"></div>
          </div>

          <div className="mt-4 flex gap-2 px-4">
            <div className="flex-1 rounded-lg border border-gray-100 p-2.5 bg-gray-50/50">
              <p className="font-bold text-gray-500 mb-1.5 text-[10px] tracking-wider uppercase">Intraday {headerAssetData.symbol}</p>
              <div className="flex flex-col gap-1 text-[11px]">
                <div className="flex justify-between"><span className="text-gray-500">Open</span><span className="text-gray-900 font-bold">{headerAssetData.open}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">High</span><span className="text-[#00B26A] font-bold">{headerAssetData.high}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Low</span><span className="text-[#e11d48] font-bold">{headerAssetData.low}</span></div>
              </div>
            </div>
            <div className="flex-[2] rounded-lg border border-gray-100 p-2.5 bg-gray-50/50 flex">
              <div className="flex-1 pr-2">
                <p className="font-bold text-gray-500 mb-1.5 text-[10px] tracking-wider uppercase">Volume</p>
                <div className="flex flex-col gap-1 text-[11px]">
                  <div className="flex justify-between"><span className="text-gray-500">Vol</span><span className="text-gray-900 font-bold">{headerAssetData.vol}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Value</span><span className="text-gray-900 font-bold">{headerAssetData.quoteVol}</span></div>
                </div>
              </div>
              <div className="flex-1 pl-2 border-l border-gray-200">
                <p className="font-bold text-gray-500 mb-1.5 text-[10px] tracking-wider uppercase">Pasar</p>
                <div className="flex flex-col gap-1 text-[11px]">
                  <div className="flex justify-between"><span className="text-gray-500">Freq</span><span className="text-gray-900 font-bold">{headerAssetData.freq}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Bursa</span><span className="text-[#00B26A] font-bold">{headerAssetData.symbol === 'BBCA' ? 'BEI / IDX' : '24H Live'}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shortcuts */}
        <div className="flex justify-between px-4 py-4 overflow-x-auto no-scrollbar gap-2 border-t border-gray-100">
          {shortcuts.map((sc) => {
            const Icon = sc.icon;
            return (
              <div 
                key={sc.id} 
                onClick={() => setActiveScreen(sc.id)}
                className="flex flex-col items-center gap-2 min-w-[64px] relative cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-full text-xl shadow-2xs", sc.bg)}>
                  <Icon className={cn("h-5 w-5", sc.color)} strokeWidth={1.8} />
                </div>
                <span className="text-center text-[10px] text-gray-600 font-bold leading-[1.2] whitespace-pre-wrap">{sc.label}</span>
                {sc.isNew && (
                  <span className="absolute -top-1 right-0 rounded-md bg-[#e11d48] px-1 py-0.5 text-[8px] font-bold text-white shadow-xs">New</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Category Filter Chips */}
        <div className="bg-gray-50 px-4 py-3 border-y border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(['Semua', 'Saham IDX', 'Saham Global', 'Crypto', 'Komoditas & Forex'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  "px-3 py-1 rounded-full text-[11px] font-bold border transition-colors whitespace-nowrap",
                  categoryFilter === cat 
                    ? "bg-[#00B26A] border-[#00B26A] text-white shadow-2xs" 
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-100"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Asset List */}
        <div className="px-4 py-2 flex flex-col gap-1 pb-24">
          <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 py-2 px-2 border-b border-gray-100">
            <span>DAFTAR SAHAM & ASET ({filteredAssets.length})</span>
            <span>HARGA & PERUBAHAN LIVE</span>
          </div>

          {filteredAssets.map((asset) => {
            const displaySym = asset.symbol.replace('USDT', '');
            const isIdr = asset.currency === 'IDR' || isIDXStock(asset.symbol);
            const data = assetPrices[asset.symbol] || { 
              price: asset.basePrice ? (isIdr ? asset.basePrice.toLocaleString('id-ID') : asset.basePrice.toString()) : '-', 
              change: '0', 
              pct: '0.00%', 
              up: true 
            };

            return (
              <div 
                key={asset.symbol} 
                onClick={() => setSelectedAsset(asset.symbol)}
                className={cn(
                  "flex items-center justify-between py-3 border-b border-gray-100 last:border-0 rounded-xl px-2 transition-all cursor-pointer group",
                  asset.symbol === 'BBCA' ? "bg-blue-50/40 hover:bg-blue-50/70" : "hover:bg-emerald-50/40"
                )}
              >
                <div className="flex items-center gap-3">
                  <AssetLogo symbol={asset.symbol} size="md" className="group-hover:scale-105 transition-transform" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-extrabold text-gray-900 flex items-center gap-1">
                        {displaySym}
                        {asset.symbol === 'BBCA' && (
                          <span className="px-1.5 py-0.2 bg-blue-100 text-blue-700 text-[9px] font-black rounded">Top Bank</span>
                        )}
                      </h4>
                      <span className={cn(
                        "text-[9px] font-bold px-1.5 py-0.2 rounded",
                        asset.category === 'Saham IDX' ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-gray-100 text-gray-500"
                      )}>
                        {asset.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 truncate max-w-[150px] sm:max-w-[200px]">{asset.name}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-black text-gray-900">
                    {isIdr ? `Rp ${data.price}` : `$${data.price}`}
                  </p>
                  <div className={cn(
                    "inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md mt-0.5",
                    data.up ? "bg-emerald-50 text-[#00B26A]" : "bg-rose-50 text-[#e11d48]"
                  )}>
                    {data.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    <span>{data.change} ({data.pct})</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
