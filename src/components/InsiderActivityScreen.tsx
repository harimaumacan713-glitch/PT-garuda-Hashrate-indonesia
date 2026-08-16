import React, { useState } from 'react';
import { ChevronLeft, Search, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

export function InsiderActivityScreen({ onBack }: { onBack: () => void }) {
  const [assetFilter, setAssetFilter] = useState('All Stock');
  const [actionFilter, setActionFilter] = useState('All Action');
  const [activeChip, setActiveChip] = useState('All');

  const insiderList = [
    {
      id: 1,
      date: '13 Aug 26',
      action: 'Buy CSIS',
      isBuy: true,
      name: 'TJOEA AUBINTORO',
      tag: 'D',
      change: '↗ 114,600 (+0.0063%)',
      current: '8,814,300 (0.48%)',
      previous: '8,699,700 (0.48%)',
      price: '199',
      type: 'Domestic',
      source: 'IDX'
    },
    {
      id: 2,
      date: '13 Aug 26',
      action: 'Buy CSIS',
      isBuy: true,
      name: 'TJOEA AUBINTORO',
      tag: 'D',
      change: '↗ 199,300 (+0.01%)',
      current: '8,699,700 (0.48%)',
      previous: '8,500,400 (0.46%)',
      price: '198',
      type: 'Domestic',
      source: 'IDX'
    },
    {
      id: 3,
      date: '12 Aug 26',
      action: 'Sell INPS',
      isBuy: false,
      name: 'JERRY ERFANSYAH',
      tag: 'D',
      change: '↘ 35,200,000 (-5.42%)',
      current: '533,418,000 (82.06%)',
      previous: '568,618,000 (87.48%)',
      price: '350',
      type: 'Domestic',
      source: 'IDX'
    },
    {
      id: 4,
      date: '12 Aug 26',
      action: 'Buy SUPA',
      isBuy: true,
      name: 'SUKIWAN',
      tag: 'D',
      change: '↗ 7,000,000 (+0.02%)',
      current: '7,000,000 (0.02%)',
      previous: '0 (0.00%)',
      price: '1',
      type: 'Domestic',
      source: 'IDX'
    },
    {
      id: 5,
      date: '12 Aug 26',
      action: 'Buy SUPA',
      isBuy: true,
      name: 'MELISA HENDRAWATI',
      tag: 'D',
      change: '↗ 7,000,000 (+0.02%)',
      current: '7,000,000 (0.02%)',
      previous: '0 (0.00%)',
      price: '1',
      type: 'Domestic',
      source: 'IDX'
    },
    {
      id: 6,
      date: '12 Aug 26',
      action: 'Buy SUPA',
      isBuy: true,
      name: 'MARSAHALA SIAHAAN',
      tag: 'D',
      change: '↗ 10,000,000 (+0.03%)',
      current: '10,000,000 (0.03%)',
      previous: '0 (0.00%)',
      price: '1',
      type: 'Domestic',
      source: 'IDX'
    }
  ];

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <header className="flex h-14 items-center justify-between px-4 bg-white sticky top-0 z-20 border-b border-gray-100">
        <button onClick={onBack} className="flex items-center text-gray-700 hover:text-black">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-base font-bold text-gray-900">Insider Activity</h1>
        <button className="text-gray-500 hover:text-black">
          <Search className="h-5 w-5" />
        </button>
      </header>

      {/* Filter Row 1 */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50/50 border-b border-gray-200">
        <div className="relative">
          <select 
            value={assetFilter}
            onChange={(e) => setAssetFilter(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-1.5 pr-8 text-xs font-semibold text-gray-800 outline-none shadow-2xs"
          >
            <option>All Stock</option>
            <option>IDX Stock</option>
            <option>Crypto</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-800 shadow-2xs">
          <span>13 Jul 26 - 13 Agu 26</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </div>
      </div>

      {/* Filter Row 2: Chips & Action Dropdown */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          {['All', 'IDX', 'KSEI'].map((chip) => (
            <button
              key={chip}
              onClick={() => setActiveChip(chip)}
              className={cn(
                "px-3.5 py-1 rounded-full text-xs font-bold border transition-all",
                activeChip === chip 
                  ? "bg-white border-gray-800 text-gray-900 shadow-2xs" 
                  : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
              )}
            >
              {chip}
            </button>
          ))}
        </div>

        <div className="relative">
          <select 
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-1.5 pr-8 text-xs font-semibold text-gray-800 outline-none shadow-2xs"
          >
            <option>All Action</option>
            <option>Buy Only</option>
            <option>Sell Only</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* List Items */}
      <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-gray-200 bg-white">
        {insiderList.map((item) => (
          <div key={item.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
            {/* Top Info Bar */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500">{item.date}</span>
                <span className={cn("font-bold", item.isBuy ? "text-[#00B26A]" : "text-[#e11d48]")}>
                  {item.action}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>

            {/* Name & Change */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-[#008080] tracking-tight">{item.name}</span>
                <span className="border border-gray-300 rounded px-1 py-0.5 text-[9px] font-bold text-gray-600 bg-gray-50">{item.tag}</span>
              </div>
              <span className={cn("text-xs font-bold font-mono", item.isBuy ? "text-[#00B26A]" : "text-[#e11d48]")}>
                {item.change}
              </span>
            </div>

            {/* Key-Value Details */}
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex justify-between items-center text-gray-500">
                <span>Current</span>
                <span className="font-semibold text-gray-900">{item.current}</span>
              </div>
              <div className="flex justify-between items-center text-gray-500">
                <span>Previous</span>
                <span className="font-semibold text-gray-900">{item.previous}</span>
              </div>
              <div className="flex justify-between items-center text-gray-500">
                <span>Price</span>
                <span className="font-semibold text-gray-900">{item.price}</span>
              </div>
              <div className="flex justify-between items-center text-gray-500">
                <span>Type</span>
                <span className="font-semibold text-gray-900">{item.type}</span>
              </div>
              <div className="flex justify-between items-center text-gray-500">
                <span>Source</span>
                <span className="font-semibold text-gray-900">{item.source}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

