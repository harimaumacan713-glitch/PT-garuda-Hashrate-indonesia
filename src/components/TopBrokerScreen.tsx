import React, { useState } from 'react';
import { ChevronLeft, Info, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export function TopBrokerScreen({ onBack }: { onBack: () => void }) {
  const [marketFilter, setMarketFilter] = useState('All Markets');

  const brokers = [
    { rank: 1, code: 'JPM', name: 'J.P. Morgan Global Brokerage', tVal: '14.8T', nVal: '1.45T', bVal: '8.1T', sVal: '6.7T', tVol: '48B' },
    { rank: 2, code: 'GS', name: 'Goldman Sachs International', tVal: '12.4T', nVal: '-890.5B', bVal: '5.7T', sVal: '6.7T', tVol: '39B' },
    { rank: 3, code: 'MS', name: 'Morgan Stanley & Co.', tVal: '10.2T', nVal: '-450.2B', bVal: '4.8T', sVal: '5.4T', tVol: '32B' },
    { rank: 4, code: 'UBS', name: 'UBS AG London Branch', tVal: '8.9T', nVal: '320.4B', bVal: '4.6T', sVal: '4.3T', tVol: '28B' },
    { rank: 5, code: 'BIN', name: 'Binance Institutional Liquidity', tVal: '24.5T', nVal: '3.12T', bVal: '13.8T', sVal: '10.7T', tVol: '110B' },
    { rank: 6, code: 'COIN', name: 'Coinbase Prime Execution', tVal: '18.2T', nVal: '1.89T', bVal: '10.0T', sVal: '8.2T', tVol: '85B' },
    { rank: 7, code: 'CGS', name: 'CGS International Securities', tVal: '6.5T', nVal: '145.2B', bVal: '3.3T', sVal: '3.2T', tVol: '19B' },
    { rank: 8, code: 'MIRA', name: 'Mirae Asset Global Markets', tVal: '5.8T', nVal: '210.0B', bVal: '3.0T', sVal: '2.8T', tVol: '16B' },
    { rank: 9, code: 'CITI', name: 'Citigroup Global Markets', tVal: '5.1T', nVal: '-310.8B', bVal: '2.4T', sVal: '2.7T', tVol: '15B' },
    { rank: 10, code: 'HSBC', name: 'HSBC Securities (USA)', tVal: '4.7T', nVal: '88.5B', bVal: '2.4T', sVal: '2.3T', tVol: '12B' }
  ];

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <header className="flex h-14 items-center justify-between px-4 bg-white sticky top-0 z-20 border-b border-gray-100">
        <button onClick={onBack} className="flex items-center text-gray-700 hover:text-black">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-base font-bold text-gray-900">Top Broker / Exchange</h1>
        <button className="text-gray-500 hover:text-black">
          <Info className="h-5 w-5" />
        </button>
      </header>

      {/* Date & Market Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-800 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-2xs">
          <ChevronLeft className="w-4 h-4 text-gray-400 cursor-pointer" />
          <span>13 Aug 2026</span>
          <ChevronRight className="w-4 h-4 text-gray-400 cursor-pointer" />
        </div>

        <select 
          value={marketFilter}
          onChange={(e) => setMarketFilter(e.target.value)}
          className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 outline-none shadow-2xs"
        >
          <option>All Markets</option>
          <option>Crypto Spot</option>
          <option>US Equities</option>
          <option>Global Forex</option>
        </select>
      </div>

      {/* Table Columns Header */}
      <div className="grid grid-cols-12 px-4 py-2.5 bg-gray-50 text-[10px] font-bold text-gray-500 uppercase border-b border-gray-200">
        <span className="col-span-1">#</span>
        <span className="col-span-2">Code</span>
        <span className="col-span-3">Sekuritas / Exchange</span>
        <span className="col-span-1.5 text-right">T.val</span>
        <span className="col-span-1.5 text-right">N.val</span>
        <span className="col-span-1 text-right">B.val</span>
        <span className="col-span-1 text-right">S.val</span>
      </div>

      {/* Broker List */}
      <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-gray-100">
        {brokers.map((b) => {
          const isNetPos = !b.nVal.startsWith('-');
          return (
            <div key={b.code} className="grid grid-cols-12 px-4 py-3 text-xs items-center hover:bg-gray-50 font-medium">
              <span className="col-span-1 text-gray-400 font-bold">{b.rank}</span>
              <span className="col-span-2 font-black text-gray-900">{b.code}</span>
              <span className="col-span-3 font-semibold text-gray-800 truncate pr-2">{b.name}</span>
              <span className="col-span-1.5 text-right font-bold text-gray-900">{b.tVal}</span>
              <span className={cn("col-span-1.5 text-right font-bold", isNetPos ? "text-[#00B26A]" : "text-[#e11d48]")}>
                {b.nVal}
              </span>
              <span className="col-span-1 text-right text-[#00B26A] font-medium">{b.bVal}</span>
              <span className="col-span-1 text-right text-[#e11d48] font-medium">{b.sVal}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
