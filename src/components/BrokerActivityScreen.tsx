import React, { useState } from 'react';
import { ChevronLeft, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

export function BrokerActivityScreen({ onBack }: { onBack: () => void }) {
  const [viewMode, setViewMode] = useState<'Value' | 'Volume'>('Value');
  const [timeframe, setTimeframe] = useState('1D');
  const [netActive, setNetActive] = useState(true);

  const chartMockData = [
    { time: '09:00', jpm: 12, gs: 5, bin: -4, coin: 8 },
    { time: '10:06', jpm: 25, gs: 15, bin: 8, coin: 22 },
    { time: '11:13', jpm: 42, gs: 18, bin: 12, coin: 28 },
    { time: '13:50', jpm: 38, gs: 22, bin: 19, coin: 25 },
    { time: '14:57', jpm: 51, gs: 28, bin: 24, coin: 35 },
    { time: '16:14', jpm: 48, gs: 30, bin: 26, coin: 38 },
  ];

  const buySellList = [
    { id: 1, byCode: 'BTC', bVal: '45.5B', bLot: '516.1K', bAvg: '63,400', slCode: 'ETH', sVal: '15.4B', sLot: '24.3K', sAvg: '3,410' },
    { id: 2, byCode: 'NVDA', bVal: '44.2B', bLot: '212.0K', bAvg: '128.0', slCode: 'AAPL', sVal: '14.8B', sLot: '146.6K', sAvg: '223.5' },
    { id: 3, byCode: 'SOL', bVal: '23.4B', bLot: '172.0K', bAvg: '144.5', slCode: 'TSLA', sVal: '5.7B', sLot: '16.4K', sAvg: '210.2' },
    { id: 4, byCode: 'GOLD', bVal: '23.2B', bLot: '76.8K', bAvg: '2,425', slCode: 'MSFT', sVal: '4.6B', sLot: '12.7K', sAvg: '446.8' },
    { id: 5, byCode: 'AMZN', bVal: '15.1B', bLot: '79.6K', bAvg: '185.2', slCode: 'GOOGL', sVal: '4.5B', sLot: '162.8K', sAvg: '171.9' },
  ];

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <header className="flex h-14 items-center justify-between px-4 bg-white sticky top-0 z-20 border-b border-gray-100">
        <button onClick={onBack} className="flex items-center text-gray-700 hover:text-black">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-base font-bold text-gray-900">Broker Activity</h1>
        <div className="w-6"></div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Entity Bar */}
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-2xs flex-1 mr-2">
            <span className="font-extrabold text-xs text-gray-900">JPM - J.P. Morgan Global Brokerage</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-white">
          <div className="flex gap-2">
            <select className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-bold text-gray-700 outline-none">
              <option>All Investor</option>
              <option>Foreign [F]</option>
              <option>Domestic [D]</option>
            </select>
            <select className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-bold text-gray-700 outline-none">
              <option>Regular / Spot</option>
              <option>Margin</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200 text-xs font-bold text-gray-700">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>13 Aug 2026</span>
          </div>
        </div>

        {/* Value / Volume Toggle */}
        <div className="flex items-center justify-between px-4 py-3 bg-white">
          <div className="flex rounded-lg bg-gray-100 p-0.5 border border-gray-200">
            <button
              onClick={() => setViewMode('Value')}
              className={cn("px-4 py-1 rounded-md text-xs font-bold transition-all", viewMode === 'Value' ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500")}
            >
              Value
            </button>
            <button
              onClick={() => setViewMode('Volume')}
              className={cn("px-4 py-1 rounded-md text-xs font-bold transition-all", viewMode === 'Volume' ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500")}
            >
              Volume
            </button>
          </div>
        </div>

        {/* Multi-Line Chart */}
        <div className="h-[220px] w-full px-2 py-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartMockData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="jpm" name="JPM" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="gs" name="GS" stroke="#00B26A" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="bin" name="BIN" stroke="#eab308" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="coin" name="COIN" stroke="#a855f7" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Timeframe Chips */}
        <div className="flex items-center justify-around px-4 py-2 border-y border-gray-100 bg-gray-50">
          {['1D', '1W', '1M', '3M', 'YTD', '1Y'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-bold transition-colors",
                timeframe === tf ? "bg-[#00B26A] text-white" : "text-gray-600 hover:bg-gray-200"
              )}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Activity Table Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <span className="text-xs font-bold text-gray-900">Broker Flow Activity Summary</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500">Net Active</span>
            <button 
              onClick={() => setNetActive(!netActive)}
              className={cn("w-9 h-5 rounded-full transition-colors relative p-0.5", netActive ? "bg-[#00B26A]" : "bg-gray-300")}
            >
              <div className={cn("w-4 h-4 rounded-full bg-white transition-transform", netActive ? "translate-x-4" : "translate-x-0")}></div>
            </button>
          </div>
        </div>

        {/* Activity Split Table */}
        <div className="grid grid-cols-2 text-xs border-b border-gray-200 divide-x divide-gray-200 bg-white">
          {/* BUY SIDE */}
          <div>
            <div className="bg-emerald-50 text-[#00B26A] font-bold px-3 py-2 text-center border-b border-emerald-100">BUY SIDE</div>
            <div className="grid grid-cols-4 px-2 py-1.5 text-[10px] font-bold text-gray-400 border-b border-gray-100 text-center">
              <span>BY</span>
              <span>B.val</span>
              <span>B.lot</span>
              <span>B.avg</span>
            </div>
            {buySellList.map((item) => (
              <div key={item.id} className="grid grid-cols-4 px-2 py-2.5 text-[11px] items-center text-center font-medium border-b border-gray-50">
                <span className="font-bold text-gray-900">{item.byCode}</span>
                <span className="text-[#00B26A] font-bold">{item.bVal}</span>
                <span className="text-gray-700">{item.bLot}</span>
                <span className="text-gray-800">{item.bAvg}</span>
              </div>
            ))}
          </div>

          {/* SELL SIDE */}
          <div>
            <div className="bg-rose-50 text-[#e11d48] font-bold px-3 py-2 text-center border-b border-rose-100">SELL SIDE</div>
            <div className="grid grid-cols-4 px-2 py-1.5 text-[10px] font-bold text-gray-400 border-b border-gray-100 text-center">
              <span>SL</span>
              <span>S.val</span>
              <span>S.lot</span>
              <span>S.avg</span>
            </div>
            {buySellList.map((item) => (
              <div key={item.id} className="grid grid-cols-4 px-2 py-2.5 text-[11px] items-center text-center font-medium border-b border-gray-50">
                <span className="font-bold text-gray-900">{item.slCode}</span>
                <span className="text-[#e11d48] font-bold">{item.sVal}</span>
                <span className="text-gray-700">{item.sLot}</span>
                <span className="text-gray-800">{item.sAvg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
