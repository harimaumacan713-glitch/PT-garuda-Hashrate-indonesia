import React, { useState } from 'react';
import { Eye, EyeOff, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export interface MyInvestmentCardProps {
  symbol: string;
  lot: number;
  avgPrice: number;
  currentPrice: number;
  totalCost?: number;
  currency?: 'IDR' | 'USD';
  onClick?: () => void;
  className?: string;
  key?: React.Key;
}

export function MyInvestmentCard({
  symbol,
  lot,
  avgPrice,
  currentPrice,
  totalCost,
  currency = 'IDR',
  onClick,
  className
}: MyInvestmentCardProps) {
  const [hideValues, setHideValues] = useState<boolean>(false);

  const displaySymbol = (symbol || '').toUpperCase().replace('USDT', '');
  const isIdr = currency === 'IDR' || ['BBCA', 'BBRI', 'BMRI', 'BBNI', 'TLKM', 'ASII', 'GOTO', 'BREN', 'AMMN', 'ANTM', 'ICBP', 'ADRO', 'PTBA', 'UNVR', 'KLBF', 'LABA', 'TAPGHDCH6A'].includes(displaySymbol);

  const sharesPerLot = isIdr ? 100 : 1;
  const totalShares = (lot || 0) * sharesPerLot;
  const effectivePrice = typeof currentPrice === 'number' && currentPrice >= 0 ? currentPrice : (avgPrice || 0);
  const marketValue = totalShares * effectivePrice;
  const costBasis = totalCost && totalCost > 0 ? totalCost : (totalShares * (avgPrice || 0));
  const pnl = marketValue - costBasis;
  const pnlPct = costBasis > 0 ? (pnl / costBasis) * 100 : (marketValue === 0 && costBasis > 0 ? -100 : 0);
  const isGain = pnl >= 0;

  // Number formatting helpers matching Stockbit screenshot
  const formatNum = (val: number) => {
    if (val === 0) return '0';
    if (Number.isInteger(val) || Math.abs(val) >= 100) {
      return Math.round(val).toLocaleString('en-US');
    }
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatAvgPrice = (val: number) => {
    if (val === 0) return '0';
    if (Number.isInteger(val)) {
      return val.toLocaleString('en-US');
    }
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const currencyPrefix = isIdr ? 'Rp ' : '$';

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden bg-white border border-gray-200/90 rounded-lg shadow-2xs cursor-pointer hover:border-gray-300 transition-all font-sans",
        className
      )}
    >
      {/* Top Accent Indicator Bar */}
      <div 
        className={cn(
          "absolute top-0 bottom-[45px] left-0 w-1.5 rounded-tl-lg",
          isGain ? "bg-[#00B26A]" : "bg-[#E53935]"
        )} 
      />

      {/* TOP SECTION */}
      <div className="p-3.5 pl-4 sm:p-4 sm:pl-4.5 flex items-center justify-between">
        <div className="flex flex-col">
          {/* Header Title + Eye icon */}
          <div className="flex items-center gap-1.5 text-[13px] text-gray-700">
            <span>
              Investasi Saya di <span className="font-bold text-gray-900 uppercase">{displaySymbol}</span>
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setHideValues(!hideValues);
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 -mt-0.5 focus:outline-none"
              title={hideValues ? 'Tampilkan Nominal' : 'Sembunyikan Nominal'}
            >
              {hideValues ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Market Value + Percentage Row */}
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-[21px] sm:text-[23px] font-bold text-gray-900 tracking-tight leading-tight">
              {hideValues ? '••••••••' : `${currencyPrefix}${formatNum(marketValue)}`}
            </span>
            <span
              className={cn(
                "text-[13px] sm:text-[13.5px] font-medium tracking-tight",
                isGain ? "text-[#00B26A]" : "text-[#E53935]"
              )}
            >
              {hideValues ? '' : `${isGain ? '+' : ''}${pnlPct.toFixed(2)}%`}
            </span>
          </div>

          {/* Subtitle */}
          <span className="text-[11.5px] text-gray-400 font-normal mt-0.5 leading-none">
            Market Value
          </span>
        </div>

        {/* Right Navigation Chevron */}
        <ChevronRight className="w-5 h-5 text-gray-400 stroke-[2] shrink-0" />
      </div>

      {/* DIVIDER */}
      <div className="border-t border-gray-100" />

      {/* BOTTOM 3-COLUMN METRICS SECTION */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 py-3 px-3.5 sm:px-4 bg-white">
        {/* 1. Avg Price */}
        <div className="flex flex-col pr-2">
          <span className="text-[13.5px] font-bold text-gray-900 tracking-tight leading-tight">
            {hideValues ? '••••' : `${currencyPrefix}${formatAvgPrice(avgPrice)}`}
          </span>
          <span className="text-[11.5px] text-gray-400 font-normal mt-1 leading-none">
            Avg Price
          </span>
        </div>

        {/* 2. Bal Lot */}
        <div className="flex flex-col px-2 sm:px-3">
          <span className="text-[13.5px] font-bold text-gray-900 tracking-tight leading-tight">
            {hideValues ? '••••' : formatNum(lot)}
          </span>
          <span className="text-[11.5px] text-gray-400 font-normal mt-1 leading-none">
            Bal Lot
          </span>
        </div>

        {/* 3. P/L */}
        <div className="flex flex-col pl-2 sm:pl-3">
          <span
            className={cn(
              "text-[13.5px] font-bold tracking-tight leading-tight",
              isGain ? "text-[#00B26A]" : "text-[#E53935]"
            )}
          >
            {hideValues
              ? '••••'
              : `${currencyPrefix}${isGain ? '+' : '-'}${formatNum(Math.abs(pnl))}`}
          </span>
          <span className="text-[11.5px] text-gray-400 font-normal mt-1 leading-none">
            P/L
          </span>
        </div>
      </div>
    </div>
  );
}
