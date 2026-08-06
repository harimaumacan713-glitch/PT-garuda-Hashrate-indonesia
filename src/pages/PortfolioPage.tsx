import React, { useState } from 'react';
import { ChevronRight, RefreshCcw } from 'lucide-react';
import { cn } from '../lib/utils';

const assets = [
  { code: 'MBMAHDCN6A', invested: '27,945,780', pnl: '-27,666,880', pct: '-99.00%', up: false },
  { code: 'TAPGHDCH6A', invested: '17,722,875', pnl: '+4,917,125', pct: '+27.74%', up: true },
  { code: 'BUMI', invested: '45,787,392', pnl: '-15,715,392', pct: '-34.32%', up: false },
];

export function PortfolioPage({ onOpenProfile }: { onOpenProfile?: () => void }) {
  const [activeTab, setActiveTab] = useState('PORTFOLIO');

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <header className="flex h-14 items-center justify-between px-4 bg-white sticky top-0 z-10">
        <button onClick={onOpenProfile} className="h-8 w-8 overflow-hidden rounded-full bg-blue-100 flex items-center justify-center">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Garuda" alt="Avatar" className="h-full w-full object-cover" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#111827] text-white">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white">
              <path d="M4 16L9 11L14 14L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="19" cy="7" r="2" fill="#00B26A" />
            </svg>
          </div>
          <span className="text-[17px] font-bold tracking-tight text-secondary">Virtual</span>
        </div>
        <div className="w-8"></div> {/* Spacer for centering */}
      </header>

      {/* Tabs */}
      <div className="flex px-4 border-b border-gray-100">
        {['PORTFOLIO', 'ORDER'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-3 text-[11px] font-bold tracking-wider relative",
              activeTab === tab ? "text-primary" : "text-gray-400"
            )}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-1/2 h-[2.5px] w-full max-w-[60%] -translate-x-1/2 bg-primary" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
        {/* Summary */}
        <div className="px-4 py-5 border-b-[6px] border-gray-50">
          <div className="grid grid-cols-3 gap-y-6">
            <div className="flex flex-col">
              <span className="text-[14px] font-bold text-secondary">2,911,117</span>
              <span className="text-[11px] text-gray-500 mt-0.5">Virtual Balance</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[14px] font-bold text-secondary">91,273,500</span>
              <span className="text-[11px] text-gray-500 mt-0.5">Invested</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[14px] font-bold text-secondary">0</span>
              <span className="text-[11px] text-gray-500 mt-0.5">Open</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-[14px] font-bold text-[#e11d48]">-38,465,150</span>
              <span className="text-[11px] text-gray-500 mt-0.5">Virtual P&L</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[14px] font-bold text-[#e11d48]">-40.84%</span>
              <span className="text-[11px] text-gray-500 mt-0.5">Loss</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[14px] font-bold text-secondary">55,719,470</span>
              <span className="text-[11px] text-gray-500 mt-0.5">Virtual Equity</span>
            </div>
          </div>
        </div>

        {/* Assets */}
        <div className="flex flex-col">
          {assets.map((asset, i) => (
            <div key={i} className="flex flex-col justify-center px-4 py-3.5 border-b border-gray-100 last:border-0 hover:bg-gray-50">
              <div className="text-[13px] font-bold text-secondary mb-1">{asset.code}</div>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-[13px] text-secondary">{asset.invested}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">Invested</div>
                </div>
                <div className="flex-1 text-center">
                  <div className={cn("text-[13px]", asset.up ? "text-primary" : "text-[#e11d48]")}>{asset.pnl}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">Potential P&L</div>
                </div>
                <div className="flex-1 flex items-start justify-end gap-1">
                  <div className="text-right">
                    <div className={cn("text-[13px]", asset.up ? "text-primary" : "text-[#e11d48]")}>{asset.pct}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{asset.up ? 'Gain' : 'Loss'}</div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 ml-1" strokeWidth={1.5} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100"></div>

        {/* Switch to Real */}
        <div className="px-4 py-6 flex justify-center">
          <button className="flex items-center gap-2 rounded border border-gray-200 px-6 py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-50 shadow-sm">
            <RefreshCcw className="h-4 w-4" strokeWidth={1.5} />
            Switch to Real
          </button>
        </div>
      </div>
    </div>
  );
}
