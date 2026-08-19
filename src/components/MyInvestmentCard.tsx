import React, { useState } from 'react';
import { Eye, EyeOff, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { detectAssetType, getEngineForSymbol } from '../engines';

export interface MyInvestmentCardProps {
  key?: React.Key;
  symbol: string;
  lot?: number | null;
  quantity?: number;
  avgPrice: number;
  currentPrice: number;
  totalCost?: number;
  currency?: 'IDR' | 'USD';
  onClick?: () => void;
  className?: string;
}

export function MyInvestmentCard({
  symbol,
  lot,
  quantity,
  avgPrice,
  currentPrice,
  totalCost,
  onClick,
  className
}: MyInvestmentCardProps) {
  const [hideValues, setHideValues] = useState<boolean>(false);

  const displaySymbol = (symbol || '').toUpperCase().replace('USDT', '');
  const { assetType } = detectAssetType(symbol);
  const engine = getEngineForSymbol(symbol);

  // Compute effective quantities and calculations
  let effectiveQty = quantity || 0;
  let effectiveLot: number | null = lot !== undefined ? lot : null;

  if (assetType === 'stock_id') {
    if (effectiveLot !== null && effectiveLot !== undefined) {
      effectiveQty = effectiveLot * 100;
    } else if (effectiveQty > 0) {
      effectiveLot = Math.floor(effectiveQty / 100);
      effectiveQty = effectiveLot * 100;
    }
  }

  const effectivePrice = typeof currentPrice === 'number' && currentPrice > 0 ? currentPrice : (avgPrice || 0);
  const marketValue = effectiveQty * effectivePrice;
  const costBasis = totalCost && totalCost > 0 ? totalCost : (effectiveQty * (avgPrice || 0));
  const pnl = marketValue - costBasis;
  const pnlPct = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
  const isGain = pnl >= 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden bg-white border border-gray-200/90 rounded-lg shadow-2xs cursor-pointer hover:border-gray-300 transition-all font-sans",
        className
      )}
    >
      {/* Accent Indicator Bar */}
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
            <span className={cn(
              "text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase",
              assetType === 'crypto' ? "bg-amber-100 text-amber-800" :
              assetType === 'stock_us' ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"
            )}>
              {engine.market}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setHideValues(!hideValues);
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 -mt-0.5 focus:outline-hidden"
              title={hideValues ? 'Tampilkan Nominal' : 'Sembunyikan Nominal'}
            >
              {hideValues ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Market Value + Percentage Row */}
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-[21px] sm:text-[23px] font-bold text-gray-900 tracking-tight leading-tight">
              {hideValues ? '••••••••' : engine.formatCurrencyValue(marketValue, engine.currency)}
            </span>
            <span
              className={cn(
                "text-[14px] font-bold",
                isGain ? "text-[#00B26A]" : "text-[#E53935]"
              )}
            >
              {hideValues ? '•••' : `${isGain ? '+' : ''}${pnlPct.toFixed(2)}%`}
            </span>
          </div>
        </div>

        {/* Chevron Indicator */}
        <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
      </div>

      {/* BOTTOM METRICS TABLE BAR */}
      <div className="bg-[#F8FAFC] border-t border-gray-100 grid grid-cols-3 px-3.5 sm:px-4 py-2.5 text-left">
        {/* Metric 1: Quantity or Lot */}
        <div className="flex flex-col">
          <span className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wide">
            {assetType === 'stock_id' ? 'Jumlah Lot' : (assetType === 'crypto' ? 'Jumlah Koin' : 'Jumlah Lembar')}
          </span>
          <span className="text-[12.5px] font-bold text-gray-800 mt-0.5 truncate">
            {hideValues ? '••••' : (
              assetType === 'stock_id' 
                ? `${effectiveLot || Math.floor(effectiveQty / 100)} Lot`
                : engine.formatQuantity(effectiveQty)
            )}
          </span>
        </div>

        {/* Metric 2: Average Price */}
        <div className="flex flex-col">
          <span className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wide">
            Harga Rata-Rata
          </span>
          <span className="text-[12.5px] font-bold text-gray-800 mt-0.5 truncate font-mono">
            {hideValues ? '••••' : engine.formatPrice(avgPrice)}
          </span>
        </div>

        {/* Metric 3: Return / PnL */}
        <div className="flex flex-col items-end text-right">
          <span className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wide">
            Return (P&amp;L)
          </span>
          <span
            className={cn(
              "text-[12.5px] font-bold mt-0.5 truncate",
              isGain ? "text-[#00B26A]" : "text-[#E53935]"
            )}
          >
            {hideValues ? '••••' : `${isGain ? '+' : ''}${engine.formatCurrencyValue(pnl, engine.currency)}`}
          </span>
        </div>
      </div>
    </div>
  );
}
