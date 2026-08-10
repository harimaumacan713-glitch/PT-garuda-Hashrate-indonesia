import React, { useState } from 'react';
import { SquarePen, Bell, Filter } from 'lucide-react';
import { cn } from '../lib/utils';

export function StreamPage({ onOpenProfile }: { onOpenProfile?: () => void }) {
  const [activeTab, setActiveTab] = useState('STREAM');
  const [activeFilter, setActiveFilter] = useState('Followed');

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <header className="flex h-14 items-center justify-between px-4 bg-white sticky top-0 z-10 relative">
        <button onClick={onOpenProfile} className="h-8 w-8 overflow-hidden rounded-full bg-blue-100 flex items-center justify-center relative z-10">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Garuda" alt="Avatar" className="h-full w-full object-cover" />
        </button>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none gap-2">
          <img src="/logo.jpg" alt="Garuda Invest" className="w-6 h-6 rounded object-cover shadow-sm" />
          <span className="text-xl font-bold tracking-tight text-secondary">GARUDA<span className="text-primary">INVEST</span></span>
        </div>
        <div className="flex items-center gap-4 text-gray-500 relative z-10">
          <button><SquarePen className="h-5 w-5" strokeWidth={1.5} /></button>
          <div className="relative">
            <button><Bell className="h-5 w-5" strokeWidth={1.5} /></button>
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              56
            </span>
          </div>
        </div>
      </header>

      {/* Main Tabs */}
      <div className="flex px-4 border-b border-border">
        {['STREAM', 'BERITA', 'RISET'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-3 text-[11px] font-semibold tracking-wider relative",
              activeTab === tab ? "text-primary" : "text-gray-500"
            )}
          >
            {tab}
            {tab === 'RISET' && (
              <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">5</span>
            )}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-1/2 h-[2.5px] w-full max-w-[60%] -translate-x-1/2 bg-primary" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Banner */}
        <div className="p-4 pb-4">
          <div className="flex items-center justify-between rounded-[10px] bg-[#5B52F6] px-4 py-5 text-white shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full border-[3px] border-[#857EF8] bg-transparent p-[3px]">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-[9px] font-bold text-secondary text-center leading-[1.1]">
                  Garuda<br/>Invest
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-1.5 text-[11px] text-[#E0DFFC] font-medium mb-1.5">
                  <svg className="h-[14px] w-[14px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>10 Agu 2026 20:00 WIB</span>
                </div>
                <h3 className="text-[14px] font-bold leading-[1.3] text-white pr-2 tracking-tight">Garuda Invest Class Features : Technical and Flow Session on Desktop App</h3>
                <p className="mt-1 text-[11px] text-[#E0DFFC] font-medium">Garuda Invest</p>
              </div>
            </div>
            <ChevronRightIcon className="h-6 w-6 text-white shrink-0 ml-1" strokeWidth={2.5} />
          </div>
        </div>

        <div className="border-t border-gray-100"></div>

        {/* Search & Filters */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex h-[42px] items-center gap-2 rounded-lg border border-gray-200 bg-white px-3">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Cari Stream" className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400" />
          </div>
        </div>

        <div className="flex gap-2.5 overflow-x-auto px-4 py-3 no-scrollbar items-center">
          {['Trending', 'Followed', 'All', 'People', 'Watchlist', 'Laporan', 'Insider'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "whitespace-nowrap rounded-full border px-4 py-[6px] text-xs font-medium transition-colors",
                activeFilter === filter
                  ? "border-primary text-primary bg-white"
                  : "border-gray-200 text-gray-500 bg-white"
              )}
            >
              {filter}
            </button>
          ))}
          <button className="flex h-[28px] w-[36px] shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-500 bg-white">
            <Filter className="h-3 w-3" strokeWidth={2} />
          </button>
        </div>

        {/* Empty State */}
        <div className="mt-16 flex flex-col items-center justify-center px-8 text-center">
          <div className="relative mb-4 flex items-center justify-center">
            {/* Box illustration */}
            <svg width="100" height="100" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Falling leaf 1 */}
              <path d="M56 42C56 42 59 34 68 30C68 30 65 38 56 42Z" stroke="#00B26A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              {/* Box body */}
              <path d="M42 58H78V72C78 74.2091 76.2091 76 74 76H46C43.7909 76 42 74.2091 42 72V58Z" stroke="#00B26A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              {/* Box top flap left */}
              <path d="M42 58L32 44" stroke="#00B26A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              {/* Box top flap right */}
              <path d="M78 58L88 44" stroke="#00B26A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              {/* Box handle hole */}
              <rect x="54" y="64" width="12" height="4" rx="2" stroke="#00B26A" strokeWidth="2.5"/>
              
              {/* Swoosh lines */}
              <path d="M68 40C72 35 78 28 85 24" stroke="#111827" strokeWidth="2" strokeLinecap="round"/>
              <path d="M74 44C78 40 82 34 88 30" stroke="#111827" strokeWidth="2" strokeLinecap="round"/>
              
              {/* Circles */}
              <circle cx="34" cy="56" r="3" stroke="#00B26A" strokeWidth="2"/>
              <circle cx="28" cy="54" r="2" fill="#00B26A"/>
              <circle cx="94" cy="62" r="2.5" stroke="#00B26A" strokeWidth="2"/>
            </svg>
          </div>
          <p className="text-[13px] text-gray-500">Belum ada postingan</p>
        </div>
      </div>
    </div>
  );
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}
