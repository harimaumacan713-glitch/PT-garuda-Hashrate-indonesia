import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Calendar, Search, ChevronDown, Timer, Briefcase, Activity, Trophy, Users, Filter } from 'lucide-react';
import { cn } from '../lib/utils';
import { LineChart, Line, ResponsiveContainer, YAxis, AreaChart, Area } from 'recharts';
import { AssetDetailsPage } from './AssetDetailsPage';

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

const cryptoSymbols = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png' },
  { symbol: 'ETHUSDT', name: 'Ethereum', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
  { symbol: 'BNBUSDT', name: 'BNB', logo: 'https://cryptologos.cc/logos/bnb-bnb-logo.png' },
  { symbol: 'SOLUSDT', name: 'Solana', logo: 'https://cryptologos.cc/logos/solana-sol-logo.png' },
  { symbol: 'XRPUSDT', name: 'XRP', logo: 'https://cryptologos.cc/logos/xrp-xrp-logo.png' },
  { symbol: 'ADAUSDT', name: 'Cardano', logo: 'https://cryptologos.cc/logos/cardano-ada-logo.png' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', logo: 'https://cryptologos.cc/logos/dogecoin-doge-logo.png' },
];

export function SearchPage({ onOpenProfile }: { onOpenProfile?: () => void }) {
  const [activeTab, setActiveTab] = useState('MARKET');
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
  const [cryptoData, setCryptoData] = useState<Record<string, { price: string, change: string, pct: string, up: boolean }>>({});

  useEffect(() => {
    // Fetch initial chart data
    fetch('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=50')
      .then(res => res.json())
      .then(data => {
        const formatted = data.map((d: any) => ({ value: parseFloat(d[4]) }));
        setChartData(formatted);
      })
      .catch((err) => {
        console.error('Failed to fetch initial chart data:', err);
        // Fallback to empty data, let websocket fill it
        setChartData(Array.from({ length: 50 }, () => ({ value: 0 })));
      });

    // Connect to WebSocket for BTC ticker
    const streams = ['btcusdt@ticker', ...cryptoSymbols.map(c => `${c.symbol.toLowerCase()}@ticker`)].join('/');
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const symbol = data.s;
      
      if (!symbol) return;
      
      const currentPrice = parseFloat(data.c);
      const change = parseFloat(data.p);
      const isUp = change >= 0;
      
      const formatPrice = (val: number) => {
        if (val < 1) return val.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
        return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      };

      if (symbol === 'BTCUSDT') {
        setBtcData({
          price: formatPrice(currentPrice),
          change: isUp ? `+${formatPrice(change)}` : formatPrice(change),
          changePercent: parseFloat(data.P).toFixed(2),
          up: isUp,
          open: formatPrice(parseFloat(data.o)),
          high: formatPrice(parseFloat(data.h)),
          low: formatPrice(parseFloat(data.l)),
          vol: parseFloat(data.v).toLocaleString('en-US', { maximumFractionDigits: 2 }),
          quoteVol: (parseFloat(data.q) / 1000000).toFixed(2) + 'M',
          freq: data.n.toLocaleString('en-US')
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
      
      setCryptoData(prev => ({
        ...prev,
        [symbol]: {
          price: formatPrice(currentPrice),
          change: isUp ? `+${formatPrice(change)}` : formatPrice(change),
          pct: `${isUp ? '+' : ''}${parseFloat(data.P).toFixed(2)}%`,
          up: isUp
        }
      }));
    };

    return () => ws.close();
  }, []);

  if (selectedAsset) {
    return <AssetDetailsPage symbol={selectedAsset} onBack={() => setSelectedAsset(null)} />;
  }

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <header className="flex h-14 items-center gap-3 px-4 bg-white sticky top-0 z-10">
        <button onClick={onOpenProfile} className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-blue-100 flex items-center justify-center">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Garuda" alt="Avatar" className="h-full w-full object-cover" />
        </button>
        <div className="flex h-9 flex-1 items-center gap-2 rounded-lg bg-gray-100 px-3">
          <Search className="h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Search symbol or username" className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400" />
        </div>
      </header>

      {/* Tabs */}
      <div className="flex px-4 border-b border-border">
        {['MARKET', 'GLOBAL', 'BONDS', 'REKSADANA'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-3 text-[10px] sm:text-xs font-semibold tracking-wide relative",
              activeTab === tab ? "text-primary" : "text-gray-500"
            )}
          >
            {tab}
            {tab === 'BONDS' && (
              <span className="absolute -top-1 right-0 rounded bg-blue-600 px-1 py-[2px] text-[8px] font-bold text-white">New</span>
            )}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-1/2 h-[3px] w-3/4 -translate-x-1/2 bg-primary rounded-t-md" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
        {/* Index Card */}
        <div className="py-4 cursor-pointer" onClick={() => setSelectedAsset('BTCUSDT')}>
          <div className="flex items-center justify-between mb-6 px-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded overflow-hidden">
                <div className={cn("w-1.5 h-[24px]", btcData.up ? "bg-primary" : "bg-[#e11d48]")}></div>
                <span className="bg-[#111827] px-1.5 text-xs font-bold text-white h-[24px] flex items-center">BTC/USDT</span>
              </div>
              <span className="text-[17px] font-bold text-secondary">{btcData.price}</span>
              <span className={cn("text-sm font-medium", btcData.up ? "text-primary" : "text-[#e11d48]")}>{btcData.change} ({btcData.changePercent}%)</span>
            </div>
            <div className="flex items-center gap-1.5 text-[13px] text-primary font-medium">
              <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
              <span>Real-Time</span>
              <Calendar className="h-4 w-4" strokeWidth={2} />
              <ChevronRight className="h-4 w-4 text-gray-300" strokeWidth={2.5} />
            </div>
          </div>

          <div className="h-[220px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 40, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={btcData.up ? "#00B26A" : "#e11d48"} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={btcData.up ? "#00B26A" : "#e11d48"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <YAxis 
                  domain={['dataMin', 'dataMax']} 
                  orientation="right" 
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  dx={10}
                  tickFormatter={(val) => val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                />
                <Area 
                  type="linear" 
                  dataKey="value" 
                  stroke={btcData.up ? "#00B26A" : "#e11d48"} 
                  strokeWidth={1.5} 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  isAnimationActive={false} 
                />
              </AreaChart>
            </ResponsiveContainer>
            {/* Dashed line */}
            <div className="absolute top-1/2 left-0 right-14 border-t-2 border-dashed border-gray-300 -mt-px pointer-events-none"></div>
          </div>

          <div className="mt-6 flex gap-3 px-4">
            <div className="flex-1 rounded-lg border border-gray-200 p-3 shadow-sm">
              <p className="font-bold text-gray-500 mb-2 text-[11px]">Intraday</p>
              <div className="flex flex-col gap-1.5 text-[11px]">
                <div className="flex justify-between"><span className="text-gray-600">Open</span><span className="text-primary font-medium">{btcData.open}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">High</span><span className="text-primary font-medium">{btcData.high}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Low</span><span className="text-[#e11d48] font-medium">{btcData.low}</span></div>
              </div>
            </div>
            <div className="flex-[2] rounded-lg border border-gray-200 p-3 flex shadow-sm">
              <div className="flex-1 pr-2">
                <p className="font-bold text-gray-500 mb-2 text-[11px]">All Market</p>
                <div className="flex flex-col gap-1.5 text-[11px]">
                  <div className="flex justify-between"><span className="text-gray-600">Vol</span><span className="text-primary font-medium">{btcData.vol}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Value</span><span className="text-primary font-medium">{btcData.quoteVol}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Freq</span><span className="text-primary font-medium">{btcData.freq}</span></div>
                </div>
              </div>
              <div className="flex-1 px-2 border-x border-gray-100">
                <p className="font-bold text-gray-500 mb-2 text-[11px]">Regular</p>
                <div className="flex flex-col gap-1.5 text-[11px]">
                  <div className="flex justify-between"><span className="text-gray-600">Vol</span><span className="text-primary font-medium">{btcData.vol}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Value</span><span className="text-primary font-medium">{btcData.quoteVol}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Freq</span><span className="text-primary font-medium">{btcData.freq}</span></div>
                </div>
              </div>
              <div className="flex-1 pl-2">
                <p className="font-bold text-gray-500 mb-2 text-[11px]">Nego</p>
                <div className="flex flex-col gap-1.5 text-[11px]">
                  <div className="flex justify-between"><span className="text-gray-600">Vol</span><span className="text-secondary font-medium">-</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Value</span><span className="text-secondary font-medium">-</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Freq</span><span className="text-secondary font-medium">-</span></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-8">
             <ChevronDown className="h-6 w-6 text-primary" strokeWidth={3} />
          </div>
        </div>

        {/* Shortcuts */}
        <div className="flex justify-between px-6 py-6 overflow-x-auto no-scrollbar gap-2">
          {shortcuts.map((sc) => {
            const Icon = sc.icon;
            return (
              <div key={sc.id} className="flex flex-col items-center gap-3 min-w-[64px] relative">
                <div className={cn("flex h-14 w-14 items-center justify-center rounded-full text-xl", sc.bg)}>
                  <Icon className={cn("h-6 w-6", sc.color)} strokeWidth={1.5} />
                </div>
                <span className="text-center text-[11px] text-gray-500 font-medium leading-[1.2] whitespace-pre-wrap">{sc.label}</span>
                {sc.isNew && (
                  <span className="absolute -top-2 right-0 rounded-md bg-[#e11d48] px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm">New</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Trending */}
        <div className="bg-gray-50 px-4 py-3 border-y border-border">
          <h3 className="text-sm font-bold text-secondary">Trending</h3>
        </div>
        
        <div className="px-4 py-2 flex flex-col gap-1 pb-24">
          {cryptoSymbols.map((crypto, i) => {
            const data = cryptoData[crypto.symbol] || { price: '-', change: '-', pct: '-', up: true };
            return (
              <div 
                key={i} 
                onClick={() => setSelectedAsset(crypto.symbol)}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded px-2 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-50 shadow-sm border border-gray-100 p-2">
                    <img src={crypto.logo} alt={crypto.name} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-secondary">{crypto.symbol.replace('USDT', '')}</h4>
                    <p className="text-[10px] text-gray-500 truncate w-32">{crypto.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-secondary">{data.price}</p>
                  <p className={cn("text-xs font-medium", data.up ? "text-primary" : "text-red-500")}>
                    {data.change} ({data.pct})
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
