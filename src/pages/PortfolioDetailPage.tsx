import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, X, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { ref, onValue, set, runTransaction, push, remove } from 'firebase/database';
import { getAssetName } from '../lib/assetsData';
import { detectAssetType, getEngineForSymbol, DEFAULT_USD_TO_IDR } from '../engines';

interface PortfolioDetailPageProps {
  symbol: string;
  onBack: () => void;
  onSellSuccess?: () => void;
  onOpenAssetDetail?: (symbol: string) => void;
}

export function PortfolioDetailPage({ symbol, onBack, onSellSuccess, onOpenAssetDetail }: PortfolioDetailPageProps) {
  const { user } = useAuth();
  const activeUid = user ? user.uid : 'demo_user';
  const [positionKey, setPositionKey] = useState<string | null>(null);
  const [userPosition, setUserPosition] = useState<any | null>(null);

  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [showSellModal, setShowSellModal] = useState<boolean>(false);
  const [sellLot, setSellLot] = useState<number>(1);
  const [sellQty, setSellQty] = useState<string>('1');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [sellSuccessMsg, setSellSuccessMsg] = useState<string | null>(null);
  const [sellErrorMsg, setSellErrorMsg] = useState<string | null>(null);

  const displaySymbol = symbol.toUpperCase().replace('USDT', '');
  const { assetType } = detectAssetType(symbol);
  const engine = getEngineForSymbol(symbol);
  const stockName = userPosition?.stockName || getAssetName(displaySymbol) || 'Aset Investasi';

  // Listen to user position in Firebase
  useEffect(() => {
    const posRef = ref(db, `users/${activeUid}/positions`);
    const unsubscribe = onValue(posRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        let foundKey: string | null = null;
        let foundPos: any = null;

        Object.entries(data).forEach(([key, val]: [string, any]) => {
          if (
            val.symbol?.toUpperCase() === symbol.toUpperCase() ||
            val.symbol?.toUpperCase() === displaySymbol ||
            val.symbol?.toUpperCase() === `${displaySymbol}USDT`
          ) {
            foundKey = key;
            foundPos = val;
          }
        });

        if (foundPos) {
          setPositionKey(foundKey);
          setUserPosition(foundPos);
          if (foundPos.lot) setSellLot(foundPos.lot);
          if (foundPos.quantity) setSellQty(foundPos.quantity.toString());
        } else {
          setUserPosition(null);
        }
      }
    });

    return () => unsubscribe();
  }, [activeUid, symbol, displaySymbol]);

  // Listen to real-time price
  useEffect(() => {
    let isSubscribed = true;
    if (assetType === 'crypto') {
      const rawSym = symbol.endsWith('USDT') ? symbol : `${symbol}USDT`;
      fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${rawSym}`)
        .then(r => r.json())
        .then(d => {
          if (isSubscribed && d && d.price) setCurrentPrice(parseFloat(d.price));
        })
        .catch(() => {});
    } else {
      fetch(`/api/quote/${symbol}`)
        .then(r => r.json())
        .then(d => {
          if (isSubscribed && d && d.quote && d.quote.price) setCurrentPrice(d.quote.price);
        })
        .catch(() => {});
    }

    return () => { isSubscribed = false; };
  }, [symbol, assetType]);

  // Effective metrics
  const avgPrice = userPosition?.avgPrice || 0;
  const livePrice = currentPrice > 0 ? currentPrice : avgPrice;

  let totalQty = userPosition?.quantity || 0;
  let totalLot = userPosition?.lot !== undefined ? userPosition?.lot : null;

  if (assetType === 'stock_id') {
    if (totalLot !== null && totalLot !== undefined) {
      totalQty = totalLot * 100;
    } else if (totalQty > 0) {
      totalLot = Math.floor(totalQty / 100);
      totalQty = totalLot * 100;
    }
  }

  const costBasis = userPosition?.totalCost && userPosition.totalCost > 0 ? userPosition.totalCost : (totalQty * avgPrice * (assetType === 'stock_id' ? 1 : 1));
  const marketValue = totalQty * livePrice;
  const pnl = marketValue - costBasis;
  const pnlPct = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
  const isGain = pnl >= 0;

  // Handle Sell Execution per Engine
  const handleExecuteSell = async () => {
    setSellErrorMsg(null);
    setIsSubmitting(true);

    try {
      let sharesToSell = 0;
      let lotToSell: number | null = null;

      if (assetType === 'stock_id') {
        lotToSell = sellLot;
        sharesToSell = sellLot * 100;
        if (lotToSell > (totalLot || 0) || lotToSell <= 0) {
          setSellErrorMsg('Jumlah lot jual tidak valid.');
          setIsSubmitting(false);
          return;
        }
      } else {
        sharesToSell = parseFloat(sellQty) || 0;
        if (sharesToSell > totalQty || sharesToSell <= 0) {
          setSellErrorMsg('Jumlah aset jual tidak valid.');
          setIsSubmitting(false);
          return;
        }
      }

      const grossSellValue = sharesToSell * livePrice;
      const fee = engine.calculateFee(grossSellValue, 'SELL');
      const netSellValue = grossSellValue - fee;
      const netSellIdr = assetType === 'stock_id' ? netSellValue : netSellValue * DEFAULT_USD_TO_IDR;

      // 1. Credit balance in Firebase
      const balanceRef = ref(db, `users/${activeUid}/balance`);
      await runTransaction(balanceRef, (b) => (typeof b === 'number' ? b : 0) + netSellIdr);

      // 2. Log Transaction History
      const txRef = ref(db, `users/${activeUid}/transactions`);
      const newTxRef = push(txRef);
      await set(newTxRef, {
        transactionId: newTxRef.key,
        type: 'sell',
        asset: displaySymbol,
        stockName,
        assetType: engine.assetType,
        market: engine.market,
        price: livePrice,
        lot: lotToSell,
        quantity: sharesToSell,
        amount: netSellIdr,
        fee,
        currency: engine.currency,
        timestamp: Date.now()
      });

      // 3. Update or Remove Position
      const posKey = positionKey || displaySymbol;
      const singlePosRef = ref(db, `users/${activeUid}/positions/${posKey}`);

      const remainingQty = totalQty - sharesToSell;
      if (remainingQty <= 0.00001) {
        await remove(singlePosRef);
      } else {
        const remainingLot = assetType === 'stock_id' ? Math.floor(remainingQty / 100) : null;
        const newCost = costBasis * (remainingQty / totalQty);
        await set(singlePosRef, {
          symbol: displaySymbol,
          stockName,
          assetType: engine.assetType,
          market: engine.market,
          currency: engine.currency,
          lot: remainingLot,
          lotSize: assetType === 'stock_id' ? 100 : null,
          quantity: remainingQty,
          avgPrice: avgPrice,
          totalCost: newCost,
          updatedAt: Date.now()
        });
      }

      setSellSuccessMsg(`Berhasil menjual ${engine.formatQuantity(sharesToSell, lotToSell)} ${displaySymbol}`);
      setTimeout(() => {
        setShowSellModal(false);
        if (onSellSuccess) onSellSuccess();
        onBack();
      }, 1200);
    } catch (err) {
      setSellErrorMsg('Terjadi kesalahan saat memproses penjualan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col font-sans pb-24 select-none">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-1 -ml-1 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-black text-[16px] text-gray-900 leading-tight">
                {displaySymbol}
              </h1>
              <span className={cn(
                "px-1.5 py-0.5 rounded text-[9px] font-black uppercase",
                assetType === 'crypto' ? "bg-amber-100 text-amber-800" :
                assetType === 'stock_us' ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"
              )}>
                {engine.market}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 font-medium truncate max-w-[200px]">
              {stockName}
            </p>
          </div>
        </div>

        {onOpenAssetDetail && (
          <button
            onClick={() => onOpenAssetDetail(symbol)}
            className="text-xs font-bold text-[#00B26A] hover:underline flex items-center gap-1"
          >
            <span>Beli / Detail</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4 max-w-md mx-auto w-full">
        {/* INVESTMENT SUMMARY HERO CARD */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-medium text-gray-400 block">Nilai Portofolio Saat Ini</span>
              <span className="text-2xl font-black text-gray-900 tracking-tight">
                {engine.formatCurrencyValue(marketValue, engine.currency)}
              </span>
            </div>
            <div className="text-right">
              <span className={cn(
                "inline-flex items-center font-extrabold text-xs px-2.5 py-1 rounded-full",
                isGain ? "bg-emerald-50 text-[#00B26A]" : "bg-rose-50 text-rose-600"
              )}>
                {isGain ? '+' : ''}{pnlPct.toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100 text-xs">
            <div className="bg-gray-50 p-3 rounded-xl">
              <span className="text-gray-400 font-medium block">
                {assetType === 'stock_id' ? 'Jumlah Lot Dimiliki' : 'Kuantitas Dimiliki'}
              </span>
              <span className="text-sm font-bold text-gray-900 mt-0.5 block">
                {engine.formatQuantity(totalQty, totalLot)}
              </span>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <span className="text-gray-400 font-medium block">Harga Rata-Rata</span>
              <span className="text-sm font-bold text-gray-900 mt-0.5 block font-mono">
                {engine.formatPrice(avgPrice)}
              </span>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <span className="text-gray-400 font-medium block">Harga Saat Ini</span>
              <span className="text-sm font-bold text-[#00B26A] mt-0.5 block font-mono">
                {engine.formatPrice(livePrice)}
              </span>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <span className="text-gray-400 font-medium block">Keuntungan / Kerugian</span>
              <span className={cn("text-sm font-bold mt-0.5 block", isGain ? "text-[#00B26A]" : "text-rose-600")}>
                {isGain ? '+' : ''}{engine.formatCurrencyValue(pnl, engine.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {onOpenAssetDetail && (
            <button
              onClick={() => onOpenAssetDetail(symbol)}
              className="bg-[#00B26A] hover:bg-[#009650] text-white font-extrabold py-3.5 rounded-xl text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              + Beli Tambahan
            </button>
          )}
          <button
            onClick={() => setShowSellModal(true)}
            className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-extrabold py-3.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Jual Aset
          </button>
        </div>
      </div>

      {/* SELL MODAL */}
      {showSellModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="text-base font-black text-gray-900">Jual {displaySymbol}</h3>
              <button 
                onClick={() => setShowSellModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input per engine */}
            {assetType === 'stock_id' ? (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700">Jumlah Lot yang Ingin Dijual</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSellLot(Math.max(1, sellLot - 1))}
                    className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={totalLot || 1}
                    value={sellLot}
                    onChange={(e) => setSellLot(Math.min(totalLot || 1, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg py-2 text-center font-bold text-base"
                  />
                  <button
                    onClick={() => setSellLot(Math.min(totalLot || 1, sellLot + 1))}
                    className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold"
                  >
                    +
                  </button>
                </div>
                <div className="flex justify-between text-[11px] text-gray-500 font-medium">
                  <span>Maksimal: {totalLot || 0} Lot</span>
                  <button onClick={() => setSellLot(totalLot || 1)} className="text-[#00B26A] font-bold">
                    Jual Semua (100%)
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700">
                  {assetType === 'crypto' ? 'Jumlah Koin yang Ingin Dijual' : 'Jumlah Lembar yang Ingin Dijual'}
                </label>
                <input
                  type="number"
                  step="any"
                  value={sellQty}
                  onChange={(e) => setSellQty(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 font-bold text-base text-gray-900"
                />
                <div className="flex justify-between text-[11px] text-gray-500 font-medium">
                  <span>Tersedia: {engine.formatQuantity(totalQty)}</span>
                  <button onClick={() => setSellQty(totalQty.toString())} className="text-[#00B26A] font-bold">
                    Jual Semua (100%)
                  </button>
                </div>
              </div>
            )}

            {sellErrorMsg && (
              <div className="bg-rose-50 text-rose-600 p-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{sellErrorMsg}</span>
              </div>
            )}

            {sellSuccessMsg && (
              <div className="bg-emerald-50 text-[#00B26A] p-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{sellSuccessMsg}</span>
              </div>
            )}

            <button
              onClick={handleExecuteSell}
              disabled={isSubmitting}
              className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-extrabold py-3.5 rounded-xl text-sm transition-all shadow-sm cursor-pointer"
            >
              {isSubmitting ? 'Memproses Penjualan...' : `Konfirmasi Jual ${displaySymbol}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
