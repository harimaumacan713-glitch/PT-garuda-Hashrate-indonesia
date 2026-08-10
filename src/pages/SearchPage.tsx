import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Calendar, Search, ChevronDown, Activity, SlidersHorizontal, ArrowUpRight, ArrowDownRight, Globe } from 'lucide-react';
import { cn } from '../lib/utils';
import { ResponsiveContainer, YAxis, AreaChart, Area } from 'recharts';
import { AssetDetailsPage } from './AssetDetailsPage';
import { db } from '../lib/firebase';
import { ref, set, onValue } from 'firebase/database';

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

export interface GlobalAssetItem {
  symbol: string;
  name: string;
  category: 'Crypto' | 'Saham Global' | 'Komoditas & Forex';
  logo: string;
  basePrice?: number;
}

export const ALL_GLOBAL_ASSETS: GlobalAssetItem[] = [
  // CRYPTO TOKENS
  { symbol: 'BTCUSDT', name: 'Bitcoin', category: 'Crypto', logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png' },
  { symbol: 'ETHUSDT', name: 'Ethereum', category: 'Crypto', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
  { symbol: 'BNBUSDT', name: 'BNB', category: 'Crypto', logo: 'https://cryptologos.cc/logos/bnb-bnb-logo.png' },
  { symbol: 'SOLUSDT', name: 'Solana', category: 'Crypto', logo: 'https://cryptologos.cc/logos/solana-sol-logo.png' },
  { symbol: 'XRPUSDT', name: 'XRP', category: 'Crypto', logo: 'https://cryptologos.cc/logos/xrp-xrp-logo.png' },
  { symbol: 'ADAUSDT', name: 'Cardano', category: 'Crypto', logo: 'https://cryptologos.cc/logos/cardano-ada-logo.png' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', category: 'Crypto', logo: 'https://cryptologos.cc/logos/dogecoin-doge-logo.png' },
  { symbol: 'AVAXUSDT', name: 'Avalanche', category: 'Crypto', logo: 'https://cryptologos.cc/logos/avalanche-avax-logo.png' },
  { symbol: 'MATICUSDT', name: 'Polygon (POL)', category: 'Crypto', logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png' },
  { symbol: 'LINKUSDT', name: 'Chainlink', category: 'Crypto', logo: 'https://cryptologos.cc/logos/chainlink-link-logo.png' },
  { symbol: 'DOTUSDT', name: 'Polkadot', category: 'Crypto', logo: 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png' },
  { symbol: 'NEARUSDT', name: 'NEAR Protocol', category: 'Crypto', logo: 'https://cryptologos.cc/logos/near-protocol-near-logo.png' },
  { symbol: 'SUIUSDT', name: 'Sui Network', category: 'Crypto', logo: 'https://cryptologos.cc/logos/sui-sui-logo.png' },
  { symbol: 'PEPEUSDT', name: 'Pepe Coin', category: 'Crypto', logo: 'https://cryptologos.cc/logos/pepe-pepe-logo.png' },
  { symbol: 'SHIBUSDT', name: 'Shiba Inu', category: 'Crypto', logo: 'https://cryptologos.cc/logos/shiba-inu-shib-logo.png' },
  { symbol: 'ATOMUSDT', name: 'Cosmos', category: 'Crypto', logo: 'https://cryptologos.cc/logos/cosmos-atom-logo.png' },
  { symbol: 'TONUSDT', name: 'Toncoin', category: 'Crypto', logo: 'https://cryptologos.cc/logos/toncoin-ton-logo.png' },
  { symbol: 'LTCUSDT', name: 'Litecoin', category: 'Crypto', logo: 'https://cryptologos.cc/logos/litecoin-ltc-logo.png' },
  { symbol: 'UNIUSDT', name: 'Uniswap', category: 'Crypto', logo: 'https://cryptologos.cc/logos/uniswap-uni-logo.png' },

  // SAHAM GLOBAL (US TECH)
  { symbol: 'NVDA', name: 'NVIDIA Corporation', category: 'Saham Global', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg', basePrice: 128.50 },
  { symbol: 'AAPL', name: 'Apple Inc.', category: 'Saham Global', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', basePrice: 224.30 },
  { symbol: 'TSLA', name: 'Tesla, Inc.', category: 'Saham Global', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png', basePrice: 210.80 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', category: 'Saham Global', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg', basePrice: 448.20 },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', category: 'Saham Global', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', basePrice: 186.40 },
  { symbol: 'GOOGL', name: 'Alphabet Inc. (Google)', category: 'Saham Global', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg', basePrice: 172.90 },
  { symbol: 'META', name: 'Meta Platforms Inc.', category: 'Saham Global', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg', basePrice: 512.60 },
  { symbol: 'NFLX', name: 'Netflix Inc.', category: 'Saham Global', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg', basePrice: 635.40 },
  { symbol: 'AMD', name: 'Advanced Micro Devices', category: 'Saham Global', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/AMD_Logo.svg', basePrice: 132.10 },
  { symbol: 'INTC', name: 'Intel Corporation', category: 'Saham Global', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Intel_logo_%282020%29.svg', basePrice: 20.40 },
  { symbol: 'COIN', name: 'Coinbase Global, Inc.', category: 'Saham Global', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Coinbase_Logo_2019.svg', basePrice: 205.80 },

  // KOMODITAS & FOREX
  { symbol: 'GOLD', name: 'Gold / Emas Global (XAU/USD)', category: 'Komoditas & Forex', logo: 'https://cdn-icons-png.flaticon.com/512/2822/2822831.png', basePrice: 2430.50 },
  { symbol: 'SILVER', name: 'Silver / Perak Global (XAG/USD)', category: 'Komoditas & Forex', logo: 'https://cdn-icons-png.flaticon.com/512/2822/2822842.png', basePrice: 27.80 },
  { symbol: 'SPX', name: 'S&P 500 Index', category: 'Komoditas & Forex', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/18/S%26P_500_logo.svg', basePrice: 5450.20 },
  { symbol: 'NDX', name: 'NASDAQ 100 Index', category: 'Komoditas & Forex', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Nasdaq_Logo.svg', basePrice: 19120.40 },
  { symbol: 'EURUSD', name: 'EUR / USD Forex', category: 'Komoditas & Forex', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Euro_symbol.svg', basePrice: 1.0925 },
];

export function SearchPage({ onOpenProfile }: { onOpenProfile?: () => void }) {
  const [activeTab, setActiveTab] = useState<'MARKET' | 'GLOBAL' | 'BONDS' | 'REKSADANA'>('MARKET');
  const [categoryFilter, setCategoryFilter] = useState<'Semua' | 'Crypto' | 'Saham Global' | 'Komoditas & Forex'>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  const [chartData, setChartData] = useState<{value: number}[]>([]);
  const [btcData, setBtcData] = useState({
    price: '0.00',
    change: '0.00',
    changePercent: '0.00',
    up: true,
    open: '0.00',
    high: '0.00',
    low: '0.00',
    vol: '0',
    quoteVol: '0',
    freq: '0'
  });

  // Real-time market prices state
  const [assetPrices, setAssetPrices] = useState<Record<string, { price: string, change: string, pct: string, up: boolean, rawPrice: number }>>({});

  // Initialize prices for non-crypto assets
  useEffect(() => {
    const initialPrices: Record<string, { price: string, change: string, pct: string, up: boolean, rawPrice: number }> = {};
    ALL_GLOBAL_ASSETS.forEach(item => {
      if (item.basePrice) {
        const p = item.basePrice;
        const changePct = ((Math.random() - 0.3) * 3).toFixed(2);
        const up = parseFloat(changePct) >= 0;
        const changeVal = (p * (parseFloat(changePct) / 100)).toFixed(2);
        initialPrices[item.symbol] = {
          price: p >= 100 ? p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : p.toString(),
          change: `${up ? '+' : ''}${changeVal}`,
          pct: `${up ? '+' : ''}${changePct}%`,
          up,
          rawPrice: p
        };
      }
    });
    setAssetPrices(prev => ({ ...initialPrices, ...prev }));
  }, []);

  // Fetch initial BTC chart data
  useEffect(() => {
    fetch('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=50')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          const formatted = data.map((d: any) => ({ value: parseFloat(d[4]) }));
          setChartData(formatted);
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch initial chart data:', err);
        const dummy = Array.from({ length: 50 }, (_, i) => ({ value: 98000 + Math.sin(i / 5) * 200 }));
        setChartData(dummy);
      });

    // Binance WebSockets for all Crypto assets
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

          if (symbol === 'BTCUSDT') {
            setBtcData({
              price: formatPrice(currentPrice),
              change: isUp ? `+${formatPrice(change)}` : formatPrice(change),
              changePercent: parseFloat(data.P || '0').toFixed(2),
              up: isUp,
              open: formatPrice(parseFloat(data.o || '0')),
              high: formatPrice(parseFloat(data.h || '0')),
              low: formatPrice(parseFloat(data.l || '0')),
              vol: parseFloat(data.v || '0').toLocaleString('en-US', { maximumFractionDigits: 2 }),
              quoteVol: (parseFloat(data.q || '0') / 1000000).toFixed(2) + 'M',
              freq: (data.n || 0).toLocaleString('en-US')
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
  }, []);

  // Fetch real global market quotes from server API (Yahoo Finance & Binance)
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
              const formatP = (val: number) => {
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
        console.warn('Failed to fetch global quotes:', err);
      }
    };

    fetchGlobalQuotes();
    const interval = setInterval(fetchGlobalQuotes, 3000);
    return () => clearInterval(interval);
  }, []);

  if (selectedAsset) {
    return <AssetDetailsPage symbol={selectedAsset} onBack={() => setSelectedAsset(null)} />;
  }

  // Filter asset items
  const filteredAssets = ALL_GLOBAL_ASSETS.filter(asset => {
    // Search query filter
    const matchesSearch = !searchQuery || 
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    let matchesCategory = true;
    if (categoryFilter !== 'Semua') {
      matchesCategory = asset.category === categoryFilter;
    } else if (activeTab === 'GLOBAL') {
      // In GLOBAL tab, prioritize Saham Global & Komoditas
      matchesCategory = true;
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
            placeholder="Cari simbol aset (BTC, NVDA, Gold, ETH...)" 
            className="flex-1 bg-transparent text-xs text-gray-800 outline-none placeholder:text-gray-400" 
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
            {tab}
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
        {/* Index Card - Bitcoin Real-time */}
        <div className="py-4 cursor-pointer hover:bg-slate-50/50 transition-colors" onClick={() => setSelectedAsset('BTCUSDT')}>
          <div className="flex items-center justify-between mb-4 px-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded overflow-hidden shadow-2xs">
                <div className={cn("w-1.5 h-[24px]", btcData.up ? "bg-[#00B26A]" : "bg-[#e11d48]")}></div>
                <span className="bg-[#111827] px-2 text-xs font-black text-white h-[24px] flex items-center gap-1">
                  BTC/USDT <span className="w-1.5 h-1.5 rounded-full bg-[#00B26A] animate-ping" />
                </span>
              </div>
              <span className="text-[17px] font-extrabold text-gray-900">{btcData.price}</span>
              <span className={cn("text-xs font-bold", btcData.up ? "text-[#00B26A]" : "text-[#e11d48]")}>
                {btcData.change} ({btcData.changePercent}%)
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-[#00B26A] font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <Activity className="h-3.5 w-3.5 animate-pulse" />
              <span>Real-Time</span>
            </div>
          </div>

          <div className="h-[200px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 40, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={btcData.up ? "#00B26A" : "#e11d48"} stopOpacity={0.15}/>
                    <stop offset="95%" stopColor={btcData.up ? "#00B26A" : "#e11d48"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <YAxis 
                  domain={['dataMin', 'dataMax']} 
                  orientation="right" 
                  tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  dx={8}
                  tickFormatter={(val) => val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={btcData.up ? "#00B26A" : "#e11d48"} 
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
              <p className="font-bold text-gray-500 mb-1.5 text-[10px] tracking-wider uppercase">Intraday BTC</p>
              <div className="flex flex-col gap-1 text-[11px]">
                <div className="flex justify-between"><span className="text-gray-500">Open</span><span className="text-gray-900 font-bold">{btcData.open}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">High</span><span className="text-[#00B26A] font-bold">{btcData.high}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Low</span><span className="text-[#e11d48] font-bold">{btcData.low}</span></div>
              </div>
            </div>
            <div className="flex-[2] rounded-lg border border-gray-100 p-2.5 bg-gray-50/50 flex">
              <div className="flex-1 pr-2">
                <p className="font-bold text-gray-500 mb-1.5 text-[10px] tracking-wider uppercase">Volume</p>
                <div className="flex flex-col gap-1 text-[11px]">
                  <div className="flex justify-between"><span className="text-gray-500">Vol</span><span className="text-gray-900 font-bold">{btcData.vol}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Value</span><span className="text-gray-900 font-bold">${btcData.quoteVol}</span></div>
                </div>
              </div>
              <div className="flex-1 pl-2 border-l border-gray-200">
                <p className="font-bold text-gray-500 mb-1.5 text-[10px] tracking-wider uppercase">Pasar</p>
                <div className="flex flex-col gap-1 text-[11px]">
                  <div className="flex justify-between"><span className="text-gray-500">Freq</span><span className="text-gray-900 font-bold">{btcData.freq}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Tipe</span><span className="text-[#00B26A] font-bold">24H Live</span></div>
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
              <div key={sc.id} className="flex flex-col items-center gap-2 min-w-[64px] relative cursor-pointer hover:opacity-80 transition-opacity">
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

        {/* Category Filter Chips for Global Assets */}
        <div className="bg-gray-50 px-4 py-3 border-y border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(['Semua', 'Crypto', 'Saham Global', 'Komoditas & Forex'] as const).map((cat) => (
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

        {/* Global Asset List */}
        <div className="px-4 py-2 flex flex-col gap-1 pb-24">
          <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 py-2 px-2 border-b border-gray-100">
            <span>ASET GLOBAL ({filteredAssets.length})</span>
            <span>HARGA & PERUBAHAN LIVE</span>
          </div>

          {filteredAssets.map((asset) => {
            const displaySym = asset.symbol.replace('USDT', '');
            const data = assetPrices[asset.symbol] || { 
              price: asset.basePrice ? asset.basePrice.toString() : '-', 
              change: '0.00', 
              pct: '0.00%', 
              up: true 
            };

            return (
              <div 
                key={asset.symbol} 
                onClick={() => setSelectedAsset(asset.symbol)}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-emerald-50/40 rounded-xl px-2 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-2xs border border-gray-100 p-1.5 overflow-hidden group-hover:scale-105 transition-transform">
                    <img 
                      src={asset.logo} 
                      alt={asset.name} 
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        // Fallback badge if image fails
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-extrabold text-gray-900">{displaySym}</h4>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-gray-100 text-gray-500">
                        {asset.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 truncate max-w-[150px] sm:max-w-[200px]">{asset.name}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-black text-gray-900">
                    ${data.price}
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
