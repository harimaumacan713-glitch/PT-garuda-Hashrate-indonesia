import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, X } from 'lucide-react';
import { cn, getEffectiveLivePrice } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { ref, onValue, set, runTransaction, push, remove } from 'firebase/database';
import { getAssetName, isIDXStock } from '../lib/assetsData';

interface PortfolioDetailPageProps {
  symbol: string;
  onBack: () => void;
  onSellSuccess?: () => void;
  onOpenAssetDetail?: (symbol: string) => void;
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

  'BBCA': 'PT Bank Central Asia Tbk',
  'BBRI': 'PT Bank Rakyat Indonesia Tbk',
  'BMRI': 'PT Bank Mandiri (Persero) Tbk',
  'BBNI': 'PT Bank Negara Indonesia Tbk',
  'TLKM': 'PT Telkom Indonesia Tbk',
  'ASII': 'PT Astra International Tbk',
  'GOTO': 'PT GoTo Gojek Tokopedia Tbk',
  'BREN': 'PT Barito Renewables Energy Tbk',
  'AMMN': 'PT Amman Mineral Internasional Tbk',
  'ANTM': 'PT Aneka Tambang Tbk',
  'ICBP': 'PT Indofood CBP Sukses Makmur Tbk',
  'ADRO': 'PT Adaro Energy Indonesia Tbk',
  'PTBA': 'PT Bukit Asam Tbk',
  'UNVR': 'PT Unilever Indonesia Tbk',
  'KLBF': 'PT Kalbe Farma Tbk',
  'GOLD': 'Gold / Emas Global',
  'SILVER': 'Silver / Perak Global',
  'SPX': 'S&P 500 Index',
  'NDX': 'NASDAQ 100 Index',
  'EURUSD': 'EUR / USD Forex',
  'LABA': 'Green Power Group Tbk.',
  'TAPGHDCH6A': 'Call Waran TAPG HD'
};

export function PortfolioDetailPage({ symbol, onBack, onSellSuccess, onOpenAssetDetail }: PortfolioDetailPageProps) {
  const { user } = useAuth();
  const activeUid = user ? user.uid : 'demo_user';
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
  const isIdr = isIDXStock(symbol) || ['BBCA', 'BBRI', 'BMRI', 'BBNI', 'TLKM', 'ASII', 'GOTO', 'BREN', 'AMMN', 'ANTM', 'ICBP', 'ADRO', 'PTBA', 'UNVR', 'KLBF', 'LABA', 'TAPGHDCH6A'].includes(displaySymbol);
  const stockName = userPosition?.stockName || assetNames[symbol.toUpperCase()] || assetNames[displaySymbol] || getAssetName(displaySymbol) || 'Aset Investasi';

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
          setSellLot(foundPos.lot || 1);
        } else {
          setUserPosition(null);
        }
      } else {
        setUserPosition(null);
      }
    });
    return () => unsubscribe();
  }, [activeUid, symbol, displaySymbol]);

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

        const currentP = map[symbol] || map[displaySymbol] || map[`${displaySymbol}USDT`];
        if (currentP && currentP > 0) {
          setCurrentPrice(currentP);
        }
      }
    });
    return () => unsub();
  }, [symbol, displaySymbol]);

  // Fetch real-time price & sync to Firebase assetPrices with Binance WebSocket + API
  useEffect(() => {
    const cryptoList = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'AVAX', 'MATIC', 'LINK', 'DOT', 'NEAR', 'SUI', 'PEPE', 'SHIB', 'ATOM', 'TON', 'LTC', 'UNI'];
    const isCrypto = symbol.endsWith('USDT') || cryptoList.includes(displaySymbol);
    const binanceSymbol = symbol.endsWith('USDT') ? symbol.toUpperCase() : `${displaySymbol}USDT`;

    let ws: WebSocket | null = null;
    if (isCrypto) {
      try {
        ws = new WebSocket(`wss://stream.binance.com:9443/ws/${binanceSymbol.toLowerCase()}@ticker`);
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data && data.c) {
              const p = parseFloat(data.c);
              setCurrentPrice(p);
              set(ref(db, `assetPrices/${displaySymbol}`), { symbol: displaySymbol, price: p, updatedAt: Date.now() }).catch(() => {});
            }
          } catch (e) {}
        };
      } catch (e) {}

      fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${binanceSymbol}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.lastPrice) {
            const p = parseFloat(data.lastPrice);
            setCurrentPrice(p);
            set(ref(db, `assetPrices/${displaySymbol}`), { symbol: displaySymbol, price: p, updatedAt: Date.now() }).catch(() => {});
          }
        })
        .catch(() => {});
    }

    const fetchQuote = () => {
      fetch(`/api/quote/${displaySymbol}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.quote && data.quote.price) {
            const p = data.quote.price;
            setCurrentPrice(p);
            set(ref(db, `assetPrices/${displaySymbol}`), { symbol: displaySymbol, price: p, updatedAt: Date.now() }).catch(() => {});
          }
        })
        .catch(() => {});
    };

    fetchQuote();
    const interval = setInterval(fetchQuote, 2500);

    return () => {
      if (ws) ws.close();
      clearInterval(interval);
    };
  }, [symbol, displaySymbol]);

  // Calculations using exact real market formulas:
  const balanceLot = userPosition?.lot || 0;
  const availableLot = balanceLot;
  const avgPrice = userPosition?.avgPrice || 0;
  const resolvedLivePrice = assetPrices[symbol] ?? assetPrices[displaySymbol] ?? (currentPrice > 0 ? currentPrice : avgPrice);
  const priceToUse = getEffectiveLivePrice(avgPrice, resolvedLivePrice);

  const sharesPerLot = isIdr ? 100 : 1;
  const totalShares = balanceLot * sharesPerLot;
  const costBasis = userPosition?.totalCost && userPosition.totalCost > 0 ? userPosition.totalCost : (avgPrice * totalShares);
  const marketValue = totalShares * (priceToUse > 0 ? priceToUse : avgPrice);
  const potentialPnL = marketValue - costBasis;
  const pnlPercentage = costBasis > 0 ? (potentialPnL / costBasis) * 100 : 0;
  const isUp = potentialPnL >= 0;

  // Format Helper matching Stockbit exact visual display (comma separated numbers)
  const formatNum = (val: number) => {
    if (val === 0) return '0';
    if (Number.isInteger(val) || Math.abs(val) >= 100) {
      return Math.round(val).toLocaleString('en-US');
    }
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Execute Sell
  const handleConfirmSell = async () => {
    if (!userPosition || !positionKey || sellLot <= 0 || sellLot > availableLot) return;
    setIsSubmitting(true);
    try {
      const soldShares = sellLot * (isIdr ? 100 : 1);
      const totalProceeds = isIdr ? Math.round(soldShares * priceToUse) : Number((soldShares * priceToUse).toFixed(2));
      const costForSold = isIdr 
        ? Math.round((sellLot / availableLot) * (userPosition.totalCost || (soldShares * avgPrice)))
        : Number(((sellLot / availableLot) * (userPosition.totalCost || (soldShares * avgPrice))).toFixed(2));
      const calculatedPnl = isIdr ? Math.round(totalProceeds - costForSold) : Number((totalProceeds - costForSold).toFixed(2));
      const calculatedPnlPercent = costForSold > 0 ? Number(((calculatedPnl / costForSold) * 100).toFixed(2)) : 0;

      // 1. Update Balance atomically
      const balanceRef = ref(db, `users/${activeUid}/balance`);
      await runTransaction(balanceRef, (currentBalance) => {
        return (currentBalance || 0) + totalProceeds;
      });

      // 2. Update or delete Position
      if (sellLot >= availableLot) {
        await remove(ref(db, `users/${activeUid}/positions/${positionKey}`));
      } else {
        const remainingLot = availableLot - sellLot;
        const newTotalCost = Math.max(0, (userPosition.totalCost || 0) - costForSold);
        await set(ref(db, `users/${activeUid}/positions/${positionKey}`), {
          ...userPosition,
          lot: remainingLot,
          totalCost: newTotalCost
        });
      }

      // 3. Record Order history
      const ordersRef = ref(db, `users/${activeUid}/orders`);
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
      const txRef = ref(db, `users/${activeUid}/transactions`);
      const newTxRef = push(txRef);
      await set(newTxRef, {
        transactionId: newTxRef.key,
        uid: activeUid,
        userId: activeUid,
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
    <div className="flex h-full flex-col bg-white overflow-y-auto no-scrollbar relative font-sans">
      {/* 1. HEADER (Portfolio Detail centered with Back button) */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between px-4 bg-white border-b border-gray-100">
        <button 
          onClick={onBack}
          className="flex items-center text-gray-700 hover:text-black transition-colors p-1"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2]" />
        </button>
        <h1 className="text-[16px] font-semibold text-gray-900 tracking-tight text-center flex-1 pr-6">
          Portfolio Detail
        </h1>
      </header>

      {/* SUCCESS BANNER */}
      {sellSuccessMsg && (
        <div className="mx-4 mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2.5 text-emerald-800 text-xs font-medium animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#00B26A] shrink-0" />
          <span>{sellSuccessMsg}</span>
        </div>
      )}

      {/* 2. TOP ASSET CARD (Symbol, Subtitle, Chevron Right) */}
      <div 
        onClick={() => {
          if (onOpenAssetDetail) onOpenAssetDetail(displaySymbol);
        }}
        className={cn(
          "mx-4 mt-3.5 p-3.5 px-4 rounded-lg border border-gray-200/90 bg-white flex items-center justify-between transition-colors shadow-2xs",
          onOpenAssetDetail ? "cursor-pointer hover:bg-gray-50/60" : ""
        )}
      >
        <div className="flex flex-col">
          <span className="text-[15px] font-bold text-gray-900 tracking-tight leading-tight uppercase">
            {displaySymbol}
          </span>
          <span className="text-[12px] text-gray-400 font-normal mt-0.5 leading-tight">
            {userPosition?.stockName || stockName || getAssetName(displaySymbol)}
          </span>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-300 stroke-[1.75]" />
      </div>

      {/* 3. METRICS CARD (Balance Lot, Available Lot, Avg Price, Current Price, Invested, Market Value, Potential P&L, Percentage) */}
      <div className="mx-4 mt-3 rounded-lg border border-gray-200/90 bg-white shadow-2xs overflow-hidden">
        <div className="divide-y-0">
          {/* Balance Lot */}
          <div className="px-4 py-3 flex items-center justify-between text-[13px]">
            <span className="text-gray-500 font-normal">Balance Lot</span>
            <span className="text-gray-900 font-normal">{formatNum(balanceLot)}</span>
          </div>

          {/* Available Lot */}
          <div className="px-4 py-3 flex items-center justify-between text-[13px]">
            <span className="text-gray-500 font-normal">Available Lot</span>
            <span className="text-gray-900 font-normal">{formatNum(availableLot)}</span>
          </div>

          {/* Average Price */}
          <div className="px-4 py-3 flex items-center justify-between text-[13px]">
            <span className="text-gray-500 font-normal">Average Price</span>
            <span className="text-gray-900 font-normal">{formatNum(avgPrice)}</span>
          </div>

          {/* Current Price */}
          <div className="px-4 py-3 flex items-center justify-between text-[13px]">
            <span className="text-gray-500 font-normal">Current Price</span>
            <span className="text-gray-900 font-normal">{formatNum(priceToUse)}</span>
          </div>

          {/* Invested */}
          <div className="px-4 py-3 flex items-center justify-between text-[13px]">
            <span className="text-gray-500 font-normal">Invested</span>
            <span className="text-gray-900 font-normal">{formatNum(costBasis)}</span>
          </div>

          {/* Market Value */}
          <div className="px-4 py-3 flex items-center justify-between text-[13px]">
            <span className="text-gray-500 font-normal">Market Value</span>
            <span className="text-gray-900 font-normal">{formatNum(marketValue)}</span>
          </div>

          {/* Potential P&L */}
          <div className="px-4 py-3 flex items-center justify-between text-[13px]">
            <span className="text-gray-500 font-normal">Potential P&L</span>
            <span className={cn(
              "font-normal",
              isUp ? "text-[#00B26A]" : "text-[#E53935]"
            )}>
              {isUp ? '+' : '-'}{formatNum(Math.abs(potentialPnL))}
            </span>
          </div>

          {/* Percentage */}
          <div className="px-4 py-3 flex items-center justify-between text-[13px]">
            <span className="text-gray-500 font-normal">Percentage</span>
            <span className={cn(
              "font-normal",
              isUp ? "text-[#00B26A]" : "text-[#E53935]"
            )}>
              {isUp ? '+' : ''}{pnlPercentage.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Spacer for natural push */}
      <div className="flex-1 min-h-[40px]" />

      {/* 4. BOTTOM STICKY ACTION BUTTON: SELL */}
      <div className="sticky bottom-0 z-20 bg-white p-4 pb-6 border-t border-gray-100">
        <button
          onClick={() => setShowSellModal(true)}
          disabled={availableLot <= 0}
          className={cn(
            "w-full py-2.5 rounded-lg font-semibold text-[14px] border transition-all text-center",
            availableLot > 0 
              ? "border-[#E53935] text-[#E53935] bg-white hover:bg-red-50/50 active:scale-[0.99]" 
              : "border-gray-200 text-gray-300 cursor-not-allowed bg-white"
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
                    {formatNum(priceToUse)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Sell Amount</span>
                  <span className="font-bold text-gray-900">
                    {formatNum(sellAmount)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Fee</span>
                  <span className="font-bold text-gray-900">
                    {formatNum(fee)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Profit/Loss</span>
                  <span className={cn(
                    "font-bold",
                    isSellUp ? "text-[#00B26A]" : "text-[#E53935]"
                  )}>
                    {isSellUp ? '+' : '-'}{formatNum(Math.abs(sellPnL))} ({isSellUp ? '+' : ''}{sellPnLPct.toFixed(2)}%)
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
