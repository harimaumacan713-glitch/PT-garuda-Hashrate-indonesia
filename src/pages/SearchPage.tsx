import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Calendar, Search, ChevronDown, Timer, Briefcase, Activity, Trophy, Users, Filter } from 'lucide-react';
import { cn } from '../lib/utils';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

const chartData = Array.from({ length: 50 }, (_, i) => ({
  value: 6300 + Math.random() * 80 + (i > 25 ? -50 : 20) + (i > 40 ? -20 : 0)
}));

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

const trendingStocks = [
  { code: 'JGLE', name: 'Graha Andrasentra Propertindo Tbk.', price: '83', change: '+4', pct: '+5.06%', up: true, color: 'bg-orange-100 text-orange-500' },
  { code: 'KOTA', name: 'DMS Propertindo Tbk.', price: '171', change: '+16', pct: '+10.32%', up: true, color: 'bg-yellow-100 text-yellow-600' },
  { code: 'BUMI', name: 'Bumi Resources Tbk', price: '179', change: '+11', pct: '+6.55%', up: true, color: 'bg-gray-800 text-white' },
  { code: 'BULL', name: 'Buana Lintas Lautan Tbk.', price: '466', change: '+16', pct: '+3.56%', up: true, color: 'bg-blue-100 text-blue-600' },
  { code: 'BNBR', name: 'Bakrie & Brothers Tbk', price: '101', change: '+4', pct: '+4.12%', up: true, color: 'bg-orange-50 text-orange-400' },
  { code: 'TPIA', name: 'Chandra Asri Pacific Tbk.', price: '2,060', change: '-10', pct: '-0.48%', up: false, color: 'bg-blue-500 text-white' },
  { code: 'VKTR', name: '', price: '890', change: '', pct: '', up: true, color: 'bg-gray-200 text-gray-500' },
];

export function SearchPage({ onOpenProfile }: { onOpenProfile?: () => void }) {
  const [activeTab, setActiveTab] = useState('MARKET');

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
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="rounded bg-secondary px-1.5 py-0.5 text-xs font-bold text-white">IHSG</span>
              <span className="text-sm font-bold text-secondary">6,351.14</span>
              <span className="text-xs font-semibold text-primary">+31.53 (+0.50%)</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-primary font-medium">
              <ChevronLeft className="h-4 w-4" />
              <span>5 Agu 26</span>
              <Calendar className="h-3.5 w-3.5" />
              <ChevronRight className="h-4 w-4 text-gray-300" />
            </div>
          </div>

          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <YAxis domain={['dataMin', 'dataMax']} hide />
                <Line type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2 text-[10px]">
            <div className="col-span-1 border-r border-border pr-2">
              <p className="font-semibold text-secondary mb-1">Intraday</p>
              <div className="flex justify-between"><span className="text-gray-500">Open</span><span className="text-primary font-medium">6,338.59</span></div>
              <div className="flex justify-between"><span className="text-gray-500">High</span><span className="text-primary font-medium">6,367.82</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Low</span><span className="text-red-500 font-medium">6,316.10</span></div>
            </div>
            <div className="col-span-1 border-r border-border px-2">
              <p className="font-semibold text-secondary mb-1">All Market</p>
              <div className="flex justify-between"><span className="text-gray-500">Lot</span><span className="text-primary font-medium">403.58M</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Value</span><span className="text-primary font-medium">14.93T</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Freq</span><span className="text-primary font-medium">2.33M</span></div>
            </div>
            <div className="col-span-1 border-r border-border px-2">
              <p className="font-semibold text-secondary mb-1">Regular</p>
              <div className="flex justify-between"><span className="text-gray-500">Lot</span><span className="text-primary font-medium">361.71M</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Value</span><span className="text-primary font-medium">13.96T</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Freq</span><span className="text-primary font-medium">2.33M</span></div>
            </div>
            <div className="col-span-1 pl-2">
              <p className="font-semibold text-secondary mb-1">Nego</p>
              <div className="flex justify-between"><span className="text-gray-500">Lot</span><span className="text-primary font-medium">41.86M</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Value</span><span className="text-primary font-medium">970.66B</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Freq</span><span className="text-primary font-medium">616</span></div>
            </div>
          </div>
          
          <div className="flex justify-center mt-4">
             <ChevronDown className="h-5 w-5 text-primary" />
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
        
        <div className="px-4 py-2 flex flex-col gap-1">
          {trendingStocks.map((stock, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-3">
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-sm", stock.color)}>
                  {stock.code.substring(0, 2)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-secondary">{stock.code}</h4>
                  <p className="text-[10px] text-gray-500 truncate w-32">{stock.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-secondary">{stock.price}</p>
                {stock.change && (
                  <p className={cn("text-xs font-medium", stock.up ? "text-primary" : "text-red-500")}>
                    {stock.change}({stock.pct})
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
