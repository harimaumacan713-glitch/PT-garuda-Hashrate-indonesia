import React, { useState, useEffect } from 'react';
import { ChevronLeft, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { ALL_GLOBAL_ASSETS } from '../lib/assetsData';

export function RunningTradeScreen({ onBack }: { onBack: () => void }) {
  const [filterMarket, setFilterMarket] = useState('All Assets');
  const [trades, setTrades] = useState<Array<{
    id: string;
    time: string;
    code: string;
    price: string;
    change: string;
    up: boolean;
    action: 'Buy' | 'Sell';
    lot: string;
    val: string;
    buyer: string;
    seller: string;
    market: string;
  }>>([
    { id: '1', time: '16:26:16', code: 'BBCA', price: '6,350', change: '+0.50%', up: true, action: 'Buy', lot: '15,240', val: 'Rp 9.6B', buyer: 'YP [D]', seller: 'CS [F]', market: 'RG' },
    { id: '2', time: '16:25:50', code: 'BTC', price: '63,138.78', change: '+1.44%', up: true, action: 'Buy', lot: '2,540', val: '$160.3M', buyer: 'BIN [D]', seller: 'BIN [D]', market: 'NG' },
    { id: '3', time: '16:25:30', code: 'NVDA', price: '225.16', change: '+1.20%', up: true, action: 'Buy', lot: '2,080', val: '$468.3K', buyer: 'JPM [F]', seller: 'JPM [F]', market: 'NG' },
    { id: '4', time: '16:24:55', code: 'BBRI', price: '3,120', change: '+0.32%', up: true, action: 'Buy', lot: '45,000', val: 'Rp 14.0B', buyer: 'BK [F]', seller: 'CC [D]', market: 'RG' },
    { id: '5', time: '16:24:40', code: 'ETH', price: '3,420.10', change: '+2.10%', up: true, action: 'Buy', lot: '2,540', val: '$8.6M', buyer: 'COIN [D]', seller: 'COIN [D]', market: 'NG' },
    { id: '6', time: '16:24:26', code: 'AAPL', price: '305.93', change: '+1.21%', up: true, action: 'Buy', lot: '250,000', val: '$76.4M', buyer: 'UBS [F]', seller: 'UBS [F]', market: 'NG' },
    { id: '7', time: '16:24:06', code: 'BMRI', price: '4,170', change: '+0.96%', up: true, action: 'Buy', lot: '18,500', val: 'Rp 7.7B', buyer: 'ZP [F]', seller: 'NI [D]', market: 'RG' },
    { id: '8', time: '16:23:42', code: 'SOL', price: '145.20', change: '+5.12%', up: true, action: 'Buy', lot: '3,000', val: '$435.6K', buyer: 'BIN [D]', seller: 'BIN [D]', market: 'NG' },
    { id: '9', time: '16:23:22', code: 'GOLD', price: '4,437.30', change: '+1.68%', up: true, action: 'Buy', lot: '385', val: '$1.7M', buyer: 'GS [F]', seller: 'GS [F]', market: 'NG' },
    { id: '10', time: '16:22:46', code: 'TSLA', price: '342.27', change: '+4.50%', up: true, action: 'Buy', lot: '385', val: '$131.7K', buyer: 'MS [F]', seller: 'MS [F]', market: 'NG' },
  ]);

  // Real-time ticker fetching & simulation for running trades with real market prices
  useEffect(() => {
    let latestQuotes: Record<string, any> = {};

    const fetchQuotes = async () => {
      try {
        const res = await fetch('/api/quotes');
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.quotes) {
          latestQuotes = data.quotes;
        }
      } catch (e) {}
    };

    fetchQuotes();
    const quoteInterval = setInterval(fetchQuotes, 3000);

    const interval = setInterval(() => {
      const randomAsset = ALL_GLOBAL_ASSETS[Math.floor(Math.random() * ALL_GLOBAL_ASSETS.length)];
      const q = latestQuotes[randomAsset.symbol] || latestQuotes[`${randomAsset.symbol}USDT`];
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const isIdr = randomAsset.currency === 'IDR' || ['BBCA', 'BBRI', 'BMRI', 'BBNI', 'TLKM', 'ASII', 'GOTO', 'BREN', 'AMMN', 'ANTM', 'ICBP', 'ADRO', 'PTBA', 'UNVR', 'KLBF'].includes(randomAsset.symbol);
      
      const priceNum = q?.price || randomAsset.basePrice || 100;
      const changePct = q?.pctChange !== undefined ? q.pctChange : (Math.random() - 0.4) * 2;
      const isUp = changePct >= 0;
      const action = Math.random() > 0.35 ? 'Buy' : 'Sell';
      const lotNum = Math.floor(100 + Math.random() * 50000).toLocaleString(isIdr ? 'id-ID' : 'en-US');
      const valStr = isIdr ? `Rp ${(Math.random() * 15 + 1).toFixed(1)}B` : `$${(Math.random() * 500).toFixed(1)}M`;

      const formattedPrice = isIdr 
        ? Math.round(priceNum).toLocaleString('id-ID')
        : (priceNum >= 100 ? priceNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : priceNum.toFixed(4));

      const newTrade = {
        id: Math.random().toString(),
        time: timeStr,
        code: randomAsset.symbol.replace('USDT', ''),
        price: formattedPrice,
        change: `${isUp ? '+' : ''}${changePct.toFixed(2)}%`,
        up: isUp,
        action,
        lot: lotNum,
        val: valStr,
        buyer: isIdr ? 'YP [D]' : 'JPM [F]',
        seller: isIdr ? 'CS [F]' : 'UBS [F]',
        market: isIdr ? 'RG' : 'NG'
      };

      setTrades(prev => [newTrade, ...prev.slice(0, 49)]);
    }, 1200);

    return () => {
      clearInterval(quoteInterval);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <header className="flex h-14 items-center justify-between px-4 bg-white sticky top-0 z-20 border-b border-gray-100">
        <button onClick={onBack} className="flex items-center text-gray-700 hover:text-black">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-base font-bold text-gray-900">Running Trade</h1>
        <div className="relative">
          <select 
            value={filterMarket}
            onChange={(e) => setFilterMarket(e.target.value)}
            className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 pr-8 text-xs font-semibold text-gray-700 outline-none"
          >
            <option>All Assets</option>
            <option>Crypto</option>
            <option>Saham Global</option>
            <option>Komoditas</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </header>

      {/* Table Data Header */}
      <div className="bg-gray-50 grid grid-cols-9 px-3 py-2.5 text-[10px] font-bold text-gray-500 border-b border-gray-200 uppercase tracking-wider text-center">
        <span className="text-left">Time</span>
        <span>Code</span>
        <span className="col-span-2 text-right">Price</span>
        <span>Action</span>
        <span className="text-right">Lot</span>
        <span className="text-right">Val</span>
        <span>Buyer</span>
        <span>Seller</span>
      </div>

      {/* Table Rows */}
      <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-gray-100">
        {trades.map((t) => (
          <div key={t.id} className="grid grid-cols-9 px-3 py-2.5 text-xs items-center hover:bg-gray-50 transition-colors text-center font-medium">
            <span className="text-left text-gray-500 font-mono text-[11px]">{t.time}</span>
            <span className="font-extrabold text-gray-900">{t.code}</span>
            <span className={cn("col-span-2 text-right font-bold", t.up ? "text-[#00B26A]" : "text-[#e11d48]")}>
              {t.price} <span className="text-[10px] font-normal">({t.change})</span>
            </span>
            <span className={cn("font-bold", t.action === 'Buy' ? "text-[#00B26A]" : "text-[#e11d48]")}>
              {t.action}
            </span>
            <span className="text-right text-gray-800 font-mono">{t.lot}</span>
            <span className="text-right text-gray-900 font-bold font-mono">{t.val}</span>
            <span className="text-gray-600 text-[11px]">{t.buyer}</span>
            <span className="text-gray-600 text-[11px]">{t.seller}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
