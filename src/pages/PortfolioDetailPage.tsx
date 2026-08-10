import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { cn, getEffectiveLivePrice } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { ref, onValue, set, runTransaction, push, remove } from 'firebase/database';

interface PortfolioDetailPageProps {
  symbol: string;
  onBack: () => void;
  onSellSuccess?: () => void;
}

const assetNames: Record<string, string> = {
  'BTC': 'Bitcoin', 'BTCUSDT': 'Bitcoin',
  'ETH': 'Ethereum', 'ETHUSDT': 'Ethereum',
  'BNB': 'BNB', 'BNBUSDT': 'BNB',
  'SOL': 'Solana', 'SOLUSDT': 'Solana',
  'XRP': 'XRP', 'XRPUSDT': 'XRP',
  'ADA': 'Cardano', 'ADAUSDT': 'Cardano',
  'DOGE': 'Dogecoin', 'DOGEUSDT': 'Dogecoin',
  'AVAX': 'Avalanche', 'AVAXUSDT': 'Avalanche',
  'MATIC': 'Polygon (POL)', 'MATICUSDT': 'Polygon (POL)',
  'LINK': 'Chainlink', 'LINKUSDT': 'Chainlink',
  'DOT': 'Polkadot', 'DOTUSDT': 'Polkadot',
  'NEAR': 'NEAR Protocol', 'NEARUSDT': 'NEAR Protocol',
  'SUI': 'Sui Network', 'SUIUSDT': 'Sui Network',
  'PEPE': 'Pepe Coin', 'PEPEUSDT': 'Pepe Coin',
  'SHIB': 'Shiba Inu', 'SHIBUSDT': 'Shiba Inu',
  'ATOM': 'Cosmos', 'ATOMUSDT': 'Cosmos',
  'TON': 'Toncoin', 'TONUSDT': 'Toncoin',
  'LTC': 'Litecoin', 'LTCUSDT': 'Litecoin',
  'UNI': 'Uniswap', 'UNIUSDT': 'Uniswap',

  'NVDA': 'NVIDIA Corporation',
  'AAPL': 'Apple Inc.',
  'TSLA': 'Tesla, Inc.',
  'MSFT': 'Microsoft Corporation',
  'AMZN': 'Amazon.com, Inc.',
  'GOOGL': 'Alphabet Inc. (Google)',
  'META': 'Meta Platforms Inc.',
  'NFLX': 'Netflix Inc.',
  'AMD': 'Advanced Micro Devices',
  'INTC': 'Intel Corporation',
  'COIN': 'Coinbase Global, Inc.',

  'GOLD': 'Gold / Emas Global',
  'SILVER': 'Silver / Perak Global',
  'SPX': 'S&P 500 Index',
  'NDX': 'NASDAQ 100 Index',
  'EURUSD': 'EUR / USD Forex',
  'LABA': 'Green Power Group Tbk.'
};

export function PortfolioDetailPage({ symbol, onBack, onSellSuccess }: PortfolioDetailPageProps) {
  const { user } = useAuth();
  const [positionKey, setPositionKey] = useState<string | null>(null);
  const [userPosition, setUserPosition] = useState<{
    symbol: string;
    stockName: string;
    lot: number;
    avgPrice: number;
    totalCost: number;
  } | null>(null);

  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [showSellModal, setShowSellModal] = useState<boolean>(false);
  const [sellLot, setSellLot] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [sellSuccessMsg, setSellSuccessMsg] = useState<string | null>(null);

  const displaySymbol = symbol.toUpperCase().replace('USDT', '');
  const stockName = assetNames[symbol.toUpperCase()] || assetNames[displaySymbol] || 'Aset Investasi';

  // Listen to user position
  useEffect(() => {
    if (!user) return;
    const posRef = ref(db, `users/${user.uid}/positions`);
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
          setSellLot(foundPos.lot || 1);
        } else {
          setUserPosition(null);
        }
      } else {
        setUserPosition(null);
      }
    });
    return () => unsubscribe();
  }, [user, symbol, displaySymbol]);

  // Firebase assetPrices sync
  const [assetPrices, setAssetPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    const pricesRef = ref(db, 'assetPrices');
    const unsub = onValue(pricesRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        const map: Record<string, number> = {};
        Object.entries(val).forEach(([sym, data]: [string, any]) => {
          const p = typeof data === 'object' ? data.price : Number(data);
          map[sym] = p;
          map[sym.toUpperCase().replace('USDT', '')] = p;
        });
        setAssetPrices(map);
      }
    });
    return () => unsub();
  }, []);

  // Fetch real-time price & sync to Firebase assetPrices
  useEffect(() => {
    const cryptoList = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'AVAX', 'MATIC', 'LINK', 'DOT', 'NEAR', 'SUI', 'PEPE', 'SHIB', 'ATOM', 'TON', 'LTC', 'UNI'];
    const isCrypto = symbol.endsWith('USDT') || cryptoList.includes(displaySymbol);

    const updatePrice = () => {
      if (isCrypto) {
        const binanceSymbol = symbol.endsWith('USDT') ? symbol.toUpperCase() : `${displaySymbol}USDT`;
        fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${binanceSymbol}`)
          .then(r => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
          })
          .then(data => {
            if (data && data.lastPrice) {
              const p = parseFloat(data.lastPrice);
              setCurrentPrice(p);
              set(ref(db, `assetPrices/${displaySymbol}`), { symbol: displaySymbol, price: p, updatedAt: Date.now() }).catch(() => {});
            }
          })
          .catch(err => {
            console.warn('Crypto price fetch error:', err);
          });
      } else {
        fetch(`/api/quote/${displaySymbol}`)
          .then(r => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
          })
          .then(data => {
            if (data && data.success && data.quote) {
              const p = data.quote.price;
              setCurrentPrice(p);
              set(ref(db, `assetPrices/${displaySymbol}`), { symbol: displaySymbol, price: p, updatedAt: Date.now() }).catch(() => {});
            }
          })
          .catch(err => {
            console.warn('Stock quote fetch error:', err);
          });
      }
    };

    updatePrice();
    const interval = setInterval(updatePrice, 2500);
    return () => clearInterval(interval);
  }, [symbol, displaySymbol]);

  // Calculations using exact formulas
  const balanceLot = userPosition?.lot || 0;
  const availableLot = balanceLot;
  const avgPrice = userPosition?.avgPrice || 0;
  const resolvedLivePrice = assetPrices[symbol] ?? assetPrices[displaySymbol] ?? (currentPrice > 0 ? currentPrice : avgPrice);
  const priceToUse = getEffectiveLivePrice(avgPrice, resolvedLivePrice, 97);

  const totalShares = balanceLot * 100;
  const costBasis = avgPrice * totalShares;
  const marketValue = totalShares * priceToUse;
  const potentialPnL = marketValue - costBasis;
  const pnlPercentage = costBasis > 0 ? (potentialPnL / costBasis) * 100 : 0;
  const isUp = potentialPnL >= 0;

  // Execute Sell
  const handleConfirmSell = async () => {
    if (!user || !userPosition || !positionKey || sellLot <= 0 || sellLot > availableLot) return;
    setIsSubmitting(true);
    try {
      const soldShares = sellLot * 100;
      const totalProceeds = Math.round(soldShares * priceToUse);
      const costForSold = Math.round((sellLot / availableLot) * (userPosition.totalCost || (soldShares * avgPrice)));
      const calculatedPnl = totalProceeds - costForSold;
      const calculatedPnlPercent = costForSold > 0 ? Number(((calculatedPnl / costForSold) * 100).toFixed(2)) : 0;

      // 1. Update Balance atomically
      const balanceRef = ref(db, `users/${user.uid}/balance`);
      await runTransaction(balanceRef, (currentBalance) => {
        return (currentBalance || 0) + totalProceeds;
      });

      // 2. Update or delete Position
      if (sellLot >= availableLot) {
        // Sold all lots
        await remove(ref(db, `users/${user.uid}/positions/${positionKey}`));
      } else {
        // Partial sell
        const remainingLot = availableLot - sellLot;
        const newTotalCost = Math.max(0, (userPosition.totalCost || 0) - costForSold);
        await set(ref(db, `users/${user.uid}/positions/${positionKey}`), {
          ...userPosition,
          lot: remainingLot,
          totalCost: newTotalCost
        });
      }

      // 3. Record Order history
      const ordersRef = ref(db, `users/${user.uid}/orders`);
      await push(ordersRef, {
        orderId: `SELL-${Date.now()}`,
        symbol: symbol.toUpperCase(),
        stockName: stockName,
        type: 'SELL',
        lot: sellLot,
        price: priceToUse,
        totalCost: totalProceeds,
        status: 'MATCHED',
        createdAt: Date.now()
      });

      // 4. Record Transaction log
      const txRef = ref(db, `users/${user.uid}/transactions`);
      const newTxRef = push(txRef);
      await set(newTxRef, {
        transactionId: newTxRef.key,
        uid: user.uid,
        userId: user.uid,
        type: 'sell',
        asset: displaySymbol,
        symbol: displaySymbol,
        stockName: stockName,
        lot: sellLot,
        quantity: soldShares,
        price: priceToUse,
        amount: totalProceeds,
        total: totalProceeds,
        pnl: calculatedPnl,
        pnlPercent: calculatedPnlPercent,
        status: 'completed',
        createdAt: Date.now(),
        timestamp: Date.now()
      });

      setShowSellModal(false);
      setSellSuccessMsg(`Berhasil menjual ${sellLot} lot ${displaySymbol}! Saldo sebesar Rp ${totalProceeds.toLocaleString('en-US')} telah ditambahkan.`);
      
      setTimeout(() => {
        if (onSellSuccess) onSellSuccess();
        else onBack();
      }, 1800);
    } catch (err) {
      console.error('Error selling asset:', err);
      alert('Gagal melakukan penjualan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-white overflow-y-auto no-scrollbar relative">
      {/* HEADER */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3.5 shadow-2xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-1 text-gray-700 hover:text-black transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-[17px] font-bold text-gray-900 tracking-tight">
            Portfolio Detail
          </h1>
        </div>
      </div>

      {/* SUCCESS BANNER */}
      {sellSuccessMsg && (
        <div className="m-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800 text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#00B26A] shrink-0" />
          <span>{sellSuccessMsg}</span>
        </div>
      )}

      {/* TOP ASSET BAR */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
        <div>
          <h2 className="text-[16px] font-bold text-gray-900 tracking-tight">
            {displaySymbol}
          </h2>
          <p className="text-[12px] text-gray-400 font-medium">
            {stockName}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>

      {/* METRICS TABLE / LIST */}
      <div className="flex-1 divide-y divide-gray-100 text-[13px]">
        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="text-gray-500 font-medium">Balance Lot</span>
          <span className="font-bold text-gray-900">{balanceLot.toLocaleString('en-US')}</span>
        </div>

        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="text-gray-500 font-medium">Available Lot</span>
          <span className="font-bold text-gray-900">{availableLot.toLocaleString('en-US')}</span>
        </div>

        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="text-gray-500 font-medium">Average Price</span>
          <span className="font-bold text-gray-900">
            {avgPrice >= 1000 ? Math.round(avgPrice).toLocaleString('en-US') : avgPrice.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="text-gray-500 font-medium">Current Price</span>
          <span className="font-bold text-gray-900">
            {priceToUse >= 1000 ? Math.round(priceToUse).toLocaleString('en-US') : priceToUse.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="text-gray-500 font-medium">Invested</span>
          <span className="font-bold text-gray-900">
            {Math.round(costBasis).toLocaleString('en-US')}
          </span>
        </div>

        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="text-gray-500 font-medium">Market Value</span>
          <span className="font-bold text-gray-900">
            {Math.round(marketValue).toLocaleString('en-US')}
          </span>
        </div>

        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="text-gray-500 font-medium">Potential P&L</span>
          <span className={cn(
            "font-bold",
            isUp ? "text-[#00B26A]" : "text-[#e11d48]"
          )}>
            {isUp ? '+' : '-'}{Math.abs(Math.round(potentialPnL)).toLocaleString('en-US')}
          </span>
        </div>

        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="text-gray-500 font-medium">Percentage</span>
          <span className={cn(
            "font-bold",
            isUp ? "text-[#00B26A]" : "text-[#e11d48]"
          )}>
            {isUp ? '+' : ''}{pnlPercentage.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* BOTTOM ACTION BUTTON: SELL */}
      <div className="sticky bottom-0 z-20 bg-white border-t border-gray-100 p-4">
        <button
          onClick={() => setShowSellModal(true)}
          disabled={availableLot <= 0}
          className={cn(
            "w-full py-3.5 rounded-xl font-bold text-[15px] border-2 transition-all shadow-xs",
            availableLot > 0 
              ? "border-[#e11d48] text-[#e11d48] bg-white hover:bg-red-50 active:scale-[0.99]" 
              : "border-gray-200 text-gray-300 cursor-not-allowed"
          )}
        >
          Sell
        </button>
      </div>

      {/* SELL PREVIEW ORDER MODAL */}
      {showSellModal && (() => {
        const soldShares = sellLot * 100;
        const sellAmount = Math.round(soldShares * priceToUse);
        const fee = Math.round(sellAmount * 0.0025);
        const costForSell = Math.round((sellLot / availableLot) * (userPosition?.totalCost || (soldShares * avgPrice)));
        const sellPnL = sellAmount - costForSell;
        const sellPnLPct = costForSell > 0 ? (sellPnL / costForSell) * 100 : 0;
        const isSellUp = sellPnL >= 0;

        return (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
              {/* Modal Header */}
              <div className="relative flex items-center justify-center pb-4 mb-2">
                <h3 className="text-[17px] font-bold text-gray-800 tracking-tight">
                  Preview Order
                </h3>
                <button
                  onClick={() => setShowSellModal(false)}
                  className="absolute right-0 top-0 text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Order Rows */}
              <div className="space-y-4 text-[14px]">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Stock</span>
                  <span className="font-bold text-gray-900">{displaySymbol}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Lot</span>
                  <div className="flex items-center gap-2">
                    {availableLot > 1 && sellLot < availableLot && (
                      <button
                        onClick={() => setSellLot(availableLot)}
                        className="text-[11px] font-bold text-[#00B26A] bg-emerald-50 px-2 py-0.5 rounded-md hover:bg-emerald-100 transition-colors"
                      >
                        Max ({availableLot.toLocaleString('en-US')})
                      </button>
                    )}
                    <input
                      type="number"
                      min={1}
                      max={availableLot}
                      value={sellLot}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setSellLot(Math.min(availableLot, Math.max(1, val)));
                      }}
                      className="w-20 text-right font-bold text-gray-900 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-[#00B26A]"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Price</span>
                  <span className="font-bold text-gray-900">
                    {priceToUse >= 1000 ? Math.round(priceToUse).toLocaleString('en-US') : priceToUse.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Sell Amount</span>
                  <span className="font-bold text-gray-900">
                    {sellAmount.toLocaleString('en-US')}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Fee</span>
                  <span className="font-bold text-gray-900">
                    {fee.toLocaleString('en-US')}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Profit/Loss</span>
                  <span className={cn(
                    "font-bold",
                    isSellUp ? "text-[#00B26A]" : "text-[#e11d48]"
                  )}>
                    {isSellUp ? '+' : '-'}{Math.abs(Math.round(sellPnL)).toLocaleString('en-US')}
                    ({isSellUp ? '+' : ''}{sellPnLPct.toFixed(2)}%)
                  </span>
                </div>
              </div>

              {/* Note */}
              <p className="text-[12px] italic font-medium text-gray-600 text-center my-6 leading-relaxed">
                * Fee akan dipotong dari trading balance kamu di akhir hari bursa
              </p>

              {/* Next Button */}
              <button
                onClick={handleConfirmSell}
                disabled={isSubmitting || sellLot <= 0}
                className="w-full py-3.5 bg-[#00B26A] hover:bg-[#009e5e] active:scale-[0.99] text-white font-bold text-[16px] rounded-xl transition-all shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Memproses...' : 'Next'}
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
