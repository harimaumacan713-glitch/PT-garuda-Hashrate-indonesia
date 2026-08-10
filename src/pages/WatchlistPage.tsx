import React from 'react';
import { FileText, MoreHorizontal, CirclePlus, ChevronDown } from 'lucide-react';

export function WatchlistPage({ onOpenProfile }: { onOpenProfile?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <header className="flex h-14 items-center justify-between px-4 bg-white sticky top-0 z-10">
        <button onClick={onOpenProfile} className="h-8 w-8 overflow-hidden rounded-full bg-blue-100 flex items-center justify-center">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Garuda" alt="Avatar" className="h-full w-full object-cover" />
        </button>
        <div className="flex items-center gap-2">
          <img src="/logo.jpg" alt="Garuda Invest" className="w-6 h-6 rounded object-cover shadow-sm" />
          <span className="text-xl font-bold tracking-tight text-secondary">GARUDA<span className="text-primary">INVEST</span></span>
        </div>
        <button className="text-gray-500">
          <FileText className="h-6 w-6" strokeWidth={1.5} />
        </button>
      </header>

      {/* Sub Header */}
      <div className="flex items-center justify-between px-4 py-3 mt-1">
        <button className="flex items-center gap-1.5 rounded-full border border-primary px-3 py-1.5 text-xs font-medium text-primary bg-white">
          All Watchlist
          <ChevronDown className="h-4 w-4" strokeWidth={2} />
        </button>
        <div className="flex items-center gap-4 text-gray-500">
          <button><MoreHorizontal className="h-6 w-6" strokeWidth={1.5} /></button>
          <button><CirclePlus className="h-6 w-6" strokeWidth={1} /></button>
        </div>
      </div>

      {/* Main Content - Empty State */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center pb-24">
        <div className="relative mb-8">
           {/* Custom Binoculars Illustration matching refererence closely */}
           <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M54.5 45L45 52C45 52 48 42 53 38C58 34 65 34 65 34" stroke="#00B26A" strokeWidth="2.5" strokeLinecap="round"/>
             <path d="M38 72C38 72 40 76 48 76C56 76 56 68 56 68" stroke="#00B26A" strokeWidth="2.5" strokeLinecap="round"/>
             <circle cx="28" cy="46" r="3" fill="#00B26A"/>
             <circle cx="30" cy="74" r="2" fill="#00B26A"/>
             <circle cx="92" cy="74" r="3" fill="#00B26A"/>
             <path d="M96 52L86 48" stroke="#111827" strokeWidth="2" strokeLinecap="round"/>
             <path d="M92 42L90 52" stroke="#111827" strokeWidth="2" strokeLinecap="round"/>
             <path d="M28 58L22 54" stroke="#111827" strokeWidth="2" strokeLinecap="round"/>
             <path d="M24 60L26 52" stroke="#111827" strokeWidth="2" strokeLinecap="round"/>
             
             {/* Binoculars Base */}
             <rect x="36" y="52" width="48" height="14" rx="4" fill="#00B26A" stroke="#111827" strokeWidth="2.5"/>
             
             {/* Left Lens */}
             <circle cx="44" cy="59" r="12" fill="white" stroke="#111827" strokeWidth="2.5"/>
             <circle cx="44" cy="59" r="6" fill="white" stroke="#111827" strokeWidth="2.5"/>
             
             {/* Right Lens */}
             <circle cx="76" cy="59" r="12" fill="white" stroke="#111827" strokeWidth="2.5"/>
             <circle cx="76" cy="59" r="6" fill="white" stroke="#111827" strokeWidth="2.5"/>
             
             {/* Top bridge */}
             <path d="M52 52V46C52 44.8954 52.8954 44 54 44H66C67.1046 44 68 44.8954 68 46V52" stroke="#111827" strokeWidth="2.5"/>
           </svg>
        </div>
        <h2 className="mb-2 text-[15px] font-bold text-secondary">Watchlist Kamu Masih Kosong</h2>
        <p className="mb-8 text-[13px] leading-relaxed text-gray-400">
          Tambahkan saham favoritmu ke watchlist untuk pantau pergerakannya.
        </p>
        <button className="rounded-full bg-primary px-8 py-3 text-sm font-bold text-white transition-transform active:scale-95">
          Tambahkan Saham
        </button>
      </div>
    </div>
  );
}
