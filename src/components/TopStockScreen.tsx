import React, { useState } from 'react';
import { ChevronLeft, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';

export function TopStockScreen({ onBack }: { onBack: () => void }) {
  const [viewTab, setViewTab] = useState<'Net' | 'Gross' | 'Total'>('Net');
  const [investorFilter, setInvestorFilter] = useState('All Investor');

  const topStocksData = [
    { buy: 'BBCA', bNVal: '148.2B', bNLot: '145.8K', bNFreq: '+4,219', bAvg: '6,350', nForeign: '+98.4B', sell: 'NVDA', sNVal: '-200.7B', sNLot: '-968.2K' },
    { buy: 'BBRI', bNVal: '95.4B', bNLot: '196.2K', bNFreq: '+3,104', bAvg: '3,120', nForeign: '+45.1B', sell: 'AAPL', sNVal: '-129.1B', sNLot: '-7.1M' },
    { buy: 'BTC', bNVal: '33.6B', bNLot: '129.2K', bNFreq: '+547', bAvg: '63,138', nForeign: '+10.5B', sell: 'BMRI', sNVal: '-64.2B', sNLot: '-93.5K' },
    { buy: 'ETH', bNVal: '25.2B', bNLot: '38.0K', bNFreq: '-1,501', bAvg: '3,420', nForeign: '+129.4B', sell: 'TSLA', sNVal: '-94.0B', sNLot: '-179.8K' },
    { buy: 'TLKM', bNVal: '22.8B', bNLot: '77.2K', bNFreq: '+890', bAvg: '2,620', nForeign: '+14.6B', sell: 'MSFT', sNVal: '-87.2B', sNLot: '-287.1K' },
    { buy: 'SOL', bNVal: '14.2B', bNLot: '324.3K', bNFreq: '+54.8K', bAvg: '145.2', nForeign: '-8.6B', sell: 'GOOGL', sNVal: '-76.7B', sNLot: '-187.7K' },
    { buy: 'GOLD', bNVal: '12.0B', bNLot: '162.6K', bNFreq: '-153', bAvg: '4,437', nForeign: '+172.8M', sell: 'DOGE', sNVal: '-75.6B', sNLot: '-1.7M' },
    { buy: 'AMZN', bNVal: '11.1B', bNLot: '194.9K', bNFreq: '+1,384', bAvg: '262.6', nForeign: '-1.0B', sell: 'BREN', sNVal: '-42.1B', sNLot: '-47.8K' },
    { buy: 'ASII', bNVal: '10.8B', bNLot: '21.3K', bNFreq: '+412', bAvg: '4,780', nForeign: '+5.4B', sell: 'SHIB', sNVal: '-71.7B', sNLot: '-168.5K' },
    { buy: 'META', bNVal: '10.4B', bNLot: '972.0K', bNFreq: '+14.4K', bAvg: '589.8', nForeign: '+894.4M', sell: 'PEPE', sNVal: '-71.6B', sNLot: '-379.3K' },
  ];

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <header className="flex h-14 items-center justify-between px-4 bg-white sticky top-0 z-20 border-b border-gray-100">
        <button onClick={onBack} className="flex items-center text-gray-700 hover:text-black">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-base font-bold text-gray-900">Top Asset / Stock</h1>
        <div className="w-6"></div>
      </header>

      {/* Filters Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <select 
          value={investorFilter}
          onChange={(e) => setInvestorFilter(e.target.value)}
          className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 outline-none shadow-2xs"
        >
          <option>All Investor</option>
          <option>Foreign Only</option>
          <option>Domestic Only</option>
        </select>

        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-800 shadow-2xs">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <span>13 Aug 2026</span>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-gray-100">
        {(['Net', 'Gross', 'Total'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setViewTab(tab)}
            className={cn(
              "px-5 py-1.5 rounded-full text-xs font-bold border transition-all",
              viewTab === tab ? "bg-[#00B26A] border-[#00B26A] text-white shadow-2xs" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-100"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Split Table Header */}
      <div className="grid grid-cols-2 text-[10px] font-bold text-gray-500 bg-gray-50 border-b border-gray-200 uppercase tracking-wider">
        <div className="grid grid-cols-5 px-3 py-2 border-r border-gray-200 text-center">
          <span className="text-left font-extrabold text-[#00B26A]">Buy</span>
          <span className="text-right">N.Val</span>
          <span className="text-right">N.Lot</span>
          <span className="text-right">Avg</span>
          <span className="text-right">Foreign</span>
        </div>
        <div className="grid grid-cols-3 px-3 py-2 text-center">
          <span className="text-left font-extrabold text-[#e11d48]">Sell</span>
          <span className="text-right">N.Val</span>
          <span className="text-right">N.Lot</span>
        </div>
      </div>

      {/* Split Table Rows */}
      <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-gray-100">
        {topStocksData.map((item, idx) => (
          <div key={idx} className="grid grid-cols-2 text-xs divide-x divide-gray-100 hover:bg-gray-50 font-medium">
            {/* BUY SIDE */}
            <div className="grid grid-cols-5 px-3 py-2.5 items-center text-center">
              <span className="text-left font-black text-gray-900">{item.buy}</span>
              <span className="text-right text-[#00B26A] font-bold">{item.bNVal}</span>
              <span className="text-right text-gray-700 font-mono text-[11px]">{item.bNLot}</span>
              <span className="text-right text-gray-800 font-mono text-[11px]">{item.bAvg}</span>
              <span className={cn("text-right font-mono text-[11px]", item.nForeign.startsWith('+') ? "text-[#00B26A]" : "text-[#e11d48]")}>{item.nForeign}</span>
            </div>
            {/* SELL SIDE */}
            <div className="grid grid-cols-3 px-3 py-2.5 items-center text-center">
              <span className="text-left font-black text-gray-900">{item.sell}</span>
              <span className="text-right text-[#e11d48] font-bold">{item.sNVal}</span>
              <span className="text-right text-gray-700 font-mono text-[11px]">{item.sNLot}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
