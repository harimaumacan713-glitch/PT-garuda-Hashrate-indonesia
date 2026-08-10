import React, { useState } from 'react';
import { ChevronRight, RefreshCcw } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { ref, onValue, set } from 'firebase/database';

export function PortfolioPage({ onOpenProfile }: { onOpenProfile?: () => void }) {
  const [activeTab, setActiveTab] = useState('PORTFOLIO');
  const { user } = useAuth();
  const [balance, setBalance] = React.useState<number>(0);

  React.useEffect(() => {
    if (user) {
      const balanceRef = ref(db, `users/${user.uid}/balance`);
      const unsubscribe = onValue(balanceRef, (snapshot) => {
        if (snapshot.exists()) {
          setBalance(snapshot.val());
        } else {
          // Initialize balance to 10,000,000 if it doesn't exist
          const initialBalance = 10000000;
          set(balanceRef, initialBalance).catch(console.error);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <header className="flex h-14 items-center justify-between px-4 bg-white sticky top-0 z-10">
        <button onClick={onOpenProfile} className="h-8 w-8 overflow-hidden rounded-full bg-blue-100 flex items-center justify-center border border-gray-100">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Garuda" alt="Avatar" className="h-full w-full object-cover" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#111827] text-white shadow-sm">
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
              <span className="text-[14px] font-bold text-secondary">{balance > 0 ? `Rp${balance.toLocaleString('en-US')}` : '0'}</span>
              <span className="text-[11px] text-gray-500 mt-0.5">Virtual Balance</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[14px] font-bold text-secondary">0</span>
              <span className="text-[11px] text-gray-500 mt-0.5">Invested</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[14px] font-bold text-secondary">0</span>
              <span className="text-[11px] text-gray-500 mt-0.5">Open</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-[14px] font-bold text-gray-400">0</span>
              <span className="text-[11px] text-gray-500 mt-0.5">Virtual P&L</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[14px] font-bold text-gray-400">0.00%</span>
              <span className="text-[11px] text-gray-500 mt-0.5">Loss</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[14px] font-bold text-secondary">{balance > 0 ? `Rp${balance.toLocaleString('en-US')}` : '0'}</span>
              <span className="text-[11px] text-gray-500 mt-0.5">Virtual Equity</span>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-8 h-8 text-gray-300" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h3 className="text-[15px] font-bold text-gray-900 mb-1.5">Belum ada aset</h3>
          <p className="text-[13px] text-gray-500">Mulai investasi pertamamu dan pantau perkembangannya di sini.</p>
          <button className="mt-6 bg-primary text-white text-[13px] font-bold py-2.5 px-6 rounded-lg shadow-sm hover:bg-primary/90 transition-colors">
            Cari Saham / Kripto
          </button>
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
