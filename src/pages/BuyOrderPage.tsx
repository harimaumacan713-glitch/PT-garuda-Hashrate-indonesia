import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronDown, Info, Check, Share2, Zap, Clock, AlertCircle, Sparkles, ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { ref, onValue, set, runTransaction, push, serverTimestamp } from 'firebase/database';
import { ALL_GLOBAL_ASSETS, getAssetName } from '../lib/assetsData';
import { AssetLogo } from '../components/AssetLogo';
import { 
  detectAssetType, 
  getAssetEngine, 
  DEFAULT_USD_TO_IDR, 
  AssetType,
  MarketStatusInfo
} from '../engines';

interface BuyOrderPageProps {
  symbol?: string;
  onBack: () => void;
  onOrderSuccess?: () => void;
}

export function BuyOrderPage({ symbol = 'BBCA', onBack, onOrderSuccess }: BuyOrderPageProps) {
  const { user } = useAuth();
  const activeUid = user?.uid || 'demo_user';
  const [tradingBalance, setTradingBalance] = useState<number>(0);
  
  // Normalize symbol and detect engine
  const rawSymbol = symbol.endsWith('USDT') ? symbol : `${symbol}USDT`;
  const baseSymbol = symbol.replace('USDT', '').toUpperCase();
  const assetMeta = detectAssetType(symbol);
  const assetType: AssetType = assetMeta.assetType;
  const engine = getAssetEngine(assetType);
  const matchedAsset = ALL_GLOBAL_ASSETS.find(a => a.symbol === symbol || a.symbol === baseSymbol || a.symbol === `${baseSymbol}USDT`);
  const initialBasePrice = matchedAsset?.basePrice || (assetType === 'stock_id' ? 3080 : (assetType === 'crypto' ? 64000 : 225));
  const assetName = getAssetName(symbol);

  // Market status from engine
  const [marketStatus, setMarketStatus] = useState<MarketStatusInfo>(engine.getMarketStatus());

  useEffect(() => {
    const updateStatus = () => setMarketStatus(engine.getMarketStatus());
    updateStatus();
    const interval = setInterval(updateStatus, 15000);
    return () => clearInterval(interval);
  }, [engine]);

  // Order inputs
  const [price, setPrice] = useState<number>(initialBasePrice);
  const [priceTouched, setPriceTouched] = useState<boolean>(false);
  
  // Inputs per engine
  // IDX: Lot
  const [lot, setLot] = useState<number>(1);
  const [lotInputStr, setLotInputStr] = useState<string>('1');

  // Crypto & US: Mode + Amount/Quantity
  const [cryptoMode, setCryptoMode] = useState<'idr_amount' | 'token_qty'>('idr_amount');
  const [idrAmountInput, setIdrAmountInput] = useState<string>('100000');
  const [tokenQtyInput, setTokenQtyInput] = useState<string>('0.001');

  // US Stock: Mode + Shares
  const [usMode, setUsMode] = useState<'shares' | 'idr_amount' | 'usd_amount'>('shares');
  const [usSharesInput, setUsSharesInput] = useState<string>('1');
  const [usAmountInput, setUsAmountInput] = useState<string>('50');

  const [leverage, setLeverage] = useState<'None' | '5x Day Trade'>('None');
  const [sliderPct, setSliderPct] = useState<number>(0);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Real-time market stats
  const [ticker, setTicker] = useState<{
    price: number;
    change: number;
    changePct: number;
    high: number;
    low: number;
    open: number;
    prev: number;
    vol: string;
    val: string;
    ara?: number;
    arb?: number;
  }>({
    price: initialBasePrice,
    change: 0,
    changePct: 0,
    high: initialBasePrice * 1.02,
    low: initialBasePrice * 0.98,
    open: initialBasePrice,
    prev: initialBasePrice,
    vol: '569.54K',
    val: '360.45B',
    ara: assetType === 'stock_id' ? Math.round(initialBasePrice * 1.25) : undefined,
    arb: assetType === 'stock_id' ? Math.round(initialBasePrice * 0.75) : undefined,
  });

  // Modal Flow state: 'form' | 'preview' | 'success'
  const [step, setStep] = useState<'form' | 'preview' | 'success'>('form');

  // Fetch real-time user balance
  useEffect(() => {
    const balanceRef = ref(db, `users/${activeUid}/balance`);
    const unsub = onValue(balanceRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        setTradingBalance(typeof val === 'number' ? val : (Number(val) || 0));
      } else {
        setTradingBalance(50000000); // 50M default simulation
      }
    });
    return () => unsub();
  }, [activeUid]);

  // Real-time market data feed per Engine
  useEffect(() => {
    let isSubscribed = true;

    if (assetType === 'crypto') {
      // CRYPTO ENGINE: Fetch 24/7 Binance / Crypto Feed
      const fetchCrypto = () => {
        fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${rawSymbol}`)
          .then(res => res.json())
          .then(data => {
            if (!isSubscribed || !data || !data.lastPrice) return;
            const liveP = parseFloat(data.lastPrice);
            if (!priceTouched) setPrice(liveP);
            setTicker({
              price: liveP,
              change: parseFloat(data.priceChange || '0'),
              changePct: parseFloat(data.priceChangePercent || '0'),
              high: parseFloat(data.highPrice || `${liveP * 1.02}`),
              low: parseFloat(data.lowPrice || `${liveP * 0.98}`),
              open: parseFloat(data.openPrice || `${liveP}`),
              prev: parseFloat(data.prevClosePrice || `${liveP}`),
              vol: `${(parseFloat(data.volume || '0') / 1000).toFixed(2)}K`,
              val: `$${(parseFloat(data.quoteVolume || '0') / 1000000).toFixed(2)}M`
            });
          })
          .catch(() => {});
      };

      fetchCrypto();
      const interval = setInterval(fetchCrypto, 1500);
      return () => { isSubscribed = false; clearInterval(interval); };
    } else {
      // STOCK ENGINE: Fetch Quote API
      const fetchQuote = async () => {
        try {
          const res = await fetch(`/api/quote/${symbol}`);
          if (!res.ok) return;
          const json = await res.json();
          if (json.success && json.quote) {
            const q = json.quote;
            if (!priceTouched) setPrice(q.price);
            const prev = q.previousClose || (q.price - (q.change || 0));
            const chg = q.change || (q.price - prev);
            const pct = q.pctChange || (prev > 0 ? (chg / prev) * 100 : 0);

            setTicker({
              price: q.price,
              change: chg,
              changePct: pct,
              high: q.high || q.price * 1.02,
              low: q.low || q.price * 0.98,
              open: q.open || prev,
              prev: prev,
              vol: q.volDisplay || '125K',
              val: q.valDisplay || (assetType === 'stock_id' ? 'Rp 25.4 B' : '$1.8 M'),
              ara: assetType === 'stock_id' ? (q.ara || Math.round(prev * 1.25)) : undefined,
              arb: assetType === 'stock_id' ? (q.arb || Math.round(prev * 0.75)) : undefined
            });
          }
        } catch (e) {}
      };

      fetchQuote();
      const interval = setInterval(fetchQuote, 2000);
      return () => { isSubscribed = false; clearInterval(interval); };
    }
  }, [symbol, baseSymbol, rawSymbol, assetType, priceTouched]);

  // Calculate Order based on active Engine
  const orderCalculation = React.useMemo(() => {
    if (assetType === 'crypto') {
      if (cryptoMode === 'idr_amount') {
        const val = parseFloat(idrAmountInput) || 0;
        return engine.calculateOrder({
          price,
          inputMode: 'amount_idr',
          inputValue: val,
          usdToIdrRate: DEFAULT_USD_TO_IDR
        });
      } else {
        const qty = parseFloat(tokenQtyInput) || 0;
        return engine.calculateOrder({
          price,
          inputMode: 'shares',
          inputValue: qty,
          usdToIdrRate: DEFAULT_USD_TO_IDR
        });
      }
    } else if (assetType === 'stock_us') {
      if (usMode === 'shares') {
        const shares = parseFloat(usSharesInput) || 0;
        return engine.calculateOrder({
          price,
          inputMode: 'shares',
          inputValue: shares,
          usdToIdrRate: DEFAULT_USD_TO_IDR
        });
      } else if (usMode === 'usd_amount') {
        const usdVal = parseFloat(usAmountInput) || 0;
        return engine.calculateOrder({
          price,
          inputMode: 'amount_usd',
          inputValue: usdVal,
          usdToIdrRate: DEFAULT_USD_TO_IDR
        });
      } else {
        const idrVal = parseFloat(idrAmountInput) || 0;
        return engine.calculateOrder({
          price,
          inputMode: 'amount_idr',
          inputValue: idrVal,
          usdToIdrRate: DEFAULT_USD_TO_IDR
        });
      }
    } else {
      // IDX Stock
      const levMult = leverage === '5x Day Trade' ? 5 : 1;
      return engine.calculateOrder({
        price,
        inputMode: 'lot',
        inputValue: lot,
        leverageMultiplier: levMult,
        usdToIdrRate: DEFAULT_USD_TO_IDR
      });
    }
  }, [assetType, engine, price, cryptoMode, idrAmountInput, tokenQtyInput, usMode, usSharesInput, usAmountInput, lot, leverage]);

  // Adjust Price Step
  const handlePriceStep = (delta: number) => {
    let stepVal = 1;
    if (assetType === 'stock_id') {
      stepVal = price >= 5000 ? 25 : price >= 2000 ? 10 : price >= 500 ? 5 : (price >= 200 ? 2 : 1);
    } else if (assetType === 'stock_us') {
      stepVal = price >= 100 ? 0.5 : 0.1;
    } else {
      stepVal = price >= 1000 ? 5 : (price >= 100 ? 0.5 : (price >= 1 ? 0.01 : 0.00001));
    }

    setPrice(prev => {
      const nextP = Math.max(0.000001, prev + delta * stepVal);
      return assetType === 'stock_id' ? Math.round(nextP) : Number(nextP.toFixed(price < 1 ? 6 : 2));
    });
    setPriceTouched(true);
  };

  // Slider change handler
  const handleSliderChange = (pct: number) => {
    setSliderPct(pct);
    if (pct === 0) {
      if (assetType === 'stock_id') { setLot(1); setLotInputStr('1'); }
      return;
    }
    const allocatedIdr = (tradingBalance * pct) / 100;

    if (assetType === 'stock_id') {
      const singleLotCost = price * 100;
      const targetLot = singleLotCost > 0 ? Math.floor(allocatedIdr / singleLotCost) : 1;
      const validLot = Math.max(1, targetLot);
      setLot(validLot);
      setLotInputStr(validLot.toString());
    } else if (assetType === 'crypto') {
      setIdrAmountInput(Math.round(allocatedIdr).toString());
      setCryptoMode('idr_amount');
    } else if (assetType === 'stock_us') {
      const usdAllocated = allocatedIdr / DEFAULT_USD_TO_IDR;
      const shares = price > 0 ? Number((usdAllocated / price).toFixed(2)) : 1;
      setUsSharesInput(shares.toString());
      setUsMode('shares');
    }
  };

  // Proceed to Preview
  const handleProceedToPreview = () => {
    // Validate order using the designated Engine
    const validation = engine.validateOrder({
      price,
      lot: assetType === 'stock_id' ? lot : null,
      quantity: orderCalculation.quantity,
      userBalanceIdr: tradingBalance,
      userBalanceUsd: tradingBalance / DEFAULT_USD_TO_IDR,
      orderType: 'BUY',
      usdToIdrRate: DEFAULT_USD_TO_IDR
    });

    if (!validation.isValid) {
      setValidationError(validation.errorMessage || 'Order tidak valid.');
      return;
    }

    setValidationError(null);
    setStep('preview');
  };

  // Confirm Order Execution into Firebase
  const handleConfirmOrder = async () => {
    try {
      const userBalanceRef = ref(db, `users/${activeUid}/balance`);
      
      // Deduct balance atomically
      await runTransaction(userBalanceRef, (currentBalance) => {
        const b = typeof currentBalance === 'number' ? currentBalance : (Number(currentBalance) || 0);
        return Math.max(0, b - orderCalculation.netTotalIdr);
      });

      // 1. Save to orders collection with explicit engine attributes
      const ordersRef = ref(db, `users/${activeUid}/orders`);
      const newOrderRef = push(ordersRef);
      await set(newOrderRef, {
        orderId: newOrderRef.key,
        symbol: baseSymbol,
        stockName: assetName,
        assetType: engine.assetType,
        market: engine.market,
        currency: engine.currency,
        orderType: 'BUY',
        price: price,
        lot: engine.assetType === 'stock_id' ? lot : null,
        lotSize: engine.assetType === 'stock_id' ? 100 : null,
        quantity: orderCalculation.quantity,
        grossAmountIdr: orderCalculation.grossAmountIdr,
        grossAmountUsd: orderCalculation.grossAmountUsd,
        feeAmountIdr: orderCalculation.feeAmountIdr,
        feeAmountUsd: orderCalculation.feeAmountUsd,
        totalCost: orderCalculation.netTotalIdr,
        status: 'FILLED',
        tradingSession: marketStatus.session,
        createdAt: serverTimestamp()
      });

      // 2. Save / Update positions collection with decoupled structure
      const positionRef = ref(db, `users/${activeUid}/positions/${baseSymbol}`);
      await runTransaction(positionRef, (currentPos) => {
        if (!currentPos) {
          return {
            symbol: baseSymbol,
            stockName: assetName,
            assetType: engine.assetType,
            market: engine.market,
            currency: engine.currency,
            lot: engine.assetType === 'stock_id' ? lot : null,
            lotSize: engine.assetType === 'stock_id' ? 100 : null,
            quantity: orderCalculation.quantity,
            avgPrice: price,
            totalCost: orderCalculation.netTotalIdr,
            updatedAt: Date.now()
          };
        }

        const existingQty = typeof currentPos.quantity === 'number' ? currentPos.quantity : (currentPos.lot ? currentPos.lot * 100 : 0);
        const existingCost = currentPos.totalCost || (existingQty * (currentPos.avgPrice || price));
        const newQty = existingQty + orderCalculation.quantity;
        const newCost = existingCost + orderCalculation.netTotalIdr;
        const newAvg = newQty > 0 ? (newCost / newQty) : price;

        return {
          ...currentPos,
          symbol: baseSymbol,
          stockName: assetName,
          assetType: engine.assetType,
          market: engine.market,
          currency: engine.currency,
          lot: engine.assetType === 'stock_id' ? Math.floor(newQty / 100) : null,
          lotSize: engine.assetType === 'stock_id' ? 100 : null,
          quantity: newQty,
          avgPrice: newAvg,
          totalCost: newCost,
          updatedAt: Date.now()
        };
      });

      setStep('success');
    } catch (err) {
      setValidationError('Gagal mengeksekusi order. Silakan coba kembali.');
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col justify-between text-gray-900 pb-20 select-none">
      {/* HEADER BAR */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-1 -ml-1 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <AssetLogo symbol={symbol} className="w-8 h-8 rounded-full border border-gray-100" />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-[15px] text-gray-900 leading-tight">
                  Beli {baseSymbol}
                </h1>
                <span className={cn(
                  "px-1.5 py-0.5 rounded text-[9px] font-extrabold tracking-wider uppercase",
                  assetType === 'crypto' ? "bg-amber-100 text-amber-800" :
                  assetType === 'stock_us' ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"
                )}>
                  {engine.market}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium truncate max-w-[180px]">
                {assetName}
              </p>
            </div>
          </div>
        </div>

        {/* MARKET SESSION STATUS PILL */}
        <div className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold border",
          marketStatus.isOpen 
            ? "bg-emerald-50 text-[#00B26A] border-emerald-200" 
            : "bg-gray-100 text-gray-600 border-gray-200"
        )}>
          <span className={cn("w-2 h-2 rounded-full", marketStatus.isOpen ? "bg-[#00B26A] animate-pulse" : "bg-gray-400")} />
          <span>{marketStatus.label}</span>
        </div>
      </div>

      {/* BODY CONTENT */}
      {step === 'form' && (
        <div className="p-4 space-y-4 max-w-md mx-auto w-full">
          {/* REAL TIME PRICE HERO CARD */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] text-gray-400 font-medium block">Harga Pasar Saat Ini</span>
                <span className="text-2xl font-black text-gray-900 tracking-tight">
                  {engine.formatPrice(ticker.price)}
                </span>
                {assetType !== 'stock_id' && (
                  <span className="text-xs text-gray-500 font-medium ml-2">
                    (~Rp {Math.round(ticker.price * DEFAULT_USD_TO_IDR).toLocaleString('id-ID')})
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className={cn(
                  "inline-flex items-center font-extrabold text-xs px-2 py-0.5 rounded",
                  ticker.changePct >= 0 ? "bg-emerald-50 text-[#00B26A]" : "bg-rose-50 text-rose-600"
                )}>
                  {ticker.changePct >= 0 ? '+' : ''}{ticker.changePct.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Price Limit Adjuster */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                Harga Order (Limit Price)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePriceStep(-1)}
                  className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-lg flex items-center justify-center transition-colors cursor-pointer"
                >
                  -
                </button>
                <div className="flex-1 relative">
                  <input
                    type="number"
                    step="any"
                    value={price}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value) || 0;
                      setPrice(v);
                      setPriceTouched(true);
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-center text-base font-bold text-gray-900 focus:outline-hidden focus:border-[#00B26A] focus:bg-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handlePriceStep(1)}
                  className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-lg flex items-center justify-center transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* ENGINE 1: CRYPTO INPUT FORM */}
          {assetType === 'crypto' && (
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700">Pilih Metode Pembelian Crypto</label>
                <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-[11px] font-bold">
                  <button
                    onClick={() => setCryptoMode('idr_amount')}
                    className={cn("px-2.5 py-1 rounded-md transition-all", cryptoMode === 'idr_amount' ? "bg-white text-gray-900 shadow-xs" : "text-gray-500")}
                  >
                    Nominal (Rp)
                  </button>
                  <button
                    onClick={() => setCryptoMode('token_qty')}
                    className={cn("px-2.5 py-1 rounded-md transition-all", cryptoMode === 'token_qty' ? "bg-white text-gray-900 shadow-xs" : "text-gray-500")}
                  >
                    Jumlah Token
                  </button>
                </div>
              </div>

              {cryptoMode === 'idr_amount' ? (
                <div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-gray-400">Rp</span>
                    <input
                      type="number"
                      value={idrAmountInput}
                      onChange={(e) => setIdrAmountInput(e.target.value)}
                      placeholder="100.000"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-base font-bold text-gray-900 focus:outline-hidden focus:border-[#00B26A] focus:bg-white"
                    />
                  </div>
                  {/* Quick IDR Chips */}
                  <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar">
                    {['50000', '100000', '500000', '1000000', '5000000'].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setIdrAmountInput(amt)}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-emerald-50 hover:text-[#00B26A] text-gray-600 rounded-md text-[10.5px] font-bold whitespace-nowrap transition-colors"
                      >
                        +Rp {(parseInt(amt) / 1000).toLocaleString('id-ID')}k
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      value={tokenQtyInput}
                      onChange={(e) => setTokenQtyInput(e.target.value)}
                      placeholder="0.001"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-base font-bold text-gray-900 focus:outline-hidden focus:border-[#00B26A] focus:bg-white"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-bold text-gray-400">{baseSymbol}</span>
                  </div>
                </div>
              )}

              {/* Conversion Preview */}
              <div className="bg-amber-50/60 rounded-lg p-3 border border-amber-200/50 flex justify-between items-center text-xs">
                <span className="text-amber-900 font-medium">Estimasi Koin Diperoleh:</span>
                <span className="font-black text-amber-900 text-sm">
                  {engine.formatQuantity(orderCalculation.quantity)} {baseSymbol}
                </span>
              </div>
            </div>
          )}

          {/* ENGINE 2: US STOCK INPUT FORM */}
          {assetType === 'stock_us' && (
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700">Jumlah Saham AS</label>
                <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-[11px] font-bold">
                  <button
                    onClick={() => setUsMode('shares')}
                    className={cn("px-2.5 py-1 rounded-md transition-all", usMode === 'shares' ? "bg-white text-gray-900 shadow-xs" : "text-gray-500")}
                  >
                    Lembar (Shares)
                  </button>
                  <button
                    onClick={() => setUsMode('usd_amount')}
                    className={cn("px-2.5 py-1 rounded-md transition-all", usMode === 'usd_amount' ? "bg-white text-gray-900 shadow-xs" : "text-gray-500")}
                  >
                    Nominal ($)
                  </button>
                </div>
              </div>

              {usMode === 'shares' ? (
                <div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setUsSharesInput(prev => Math.max(0.1, (parseFloat(prev) || 1) - 1).toString())}
                      className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-lg flex items-center justify-center transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      step="any"
                      value={usSharesInput}
                      onChange={(e) => setUsSharesInput(e.target.value)}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-center text-base font-bold text-gray-900 focus:outline-hidden focus:border-[#00B26A] focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setUsSharesInput(prev => ((parseFloat(prev) || 0) + 1).toString())}
                      className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-lg flex items-center justify-center transition-colors"
                    >
                      +
                    </button>
                  </div>
                  {/* Fractional quick buttons */}
                  <div className="flex items-center gap-1.5 mt-2">
                    {['0.25', '0.5', '1', '2', '5', '10'].map((sh) => (
                      <button
                        key={sh}
                        onClick={() => setUsSharesInput(sh)}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-600 rounded-md text-[10.5px] font-bold whitespace-nowrap transition-colors"
                      >
                        {sh} shr
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-gray-400">$</span>
                  <input
                    type="number"
                    value={usAmountInput}
                    onChange={(e) => setUsAmountInput(e.target.value)}
                    placeholder="50"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-8 pr-3 text-base font-bold text-gray-900 focus:outline-hidden focus:border-[#00B26A] focus:bg-white"
                  />
                </div>
              )}

              <div className="bg-blue-50/60 rounded-lg p-3 border border-blue-200/50 flex justify-between items-center text-xs">
                <span className="text-blue-900 font-medium">Estimasi Saham AS:</span>
                <span className="font-black text-blue-900 text-sm">
                  {engine.formatQuantity(orderCalculation.quantity)}
                </span>
              </div>
            </div>
          )}

          {/* ENGINE 3: IDX STOCK INPUT FORM (1 LOT = 100 SHARES) */}
          {assetType === 'stock_id' && (
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700">Jumlah Lot (1 Lot = 100 Saham)</label>
                <span className="text-[11px] font-extrabold text-[#00B26A]">
                  = {(lot * 100).toLocaleString('id-ID')} Saham
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const nextLot = Math.max(1, lot - 1);
                    setLot(nextLot);
                    setLotInputStr(nextLot.toString());
                  }}
                  className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-lg flex items-center justify-center transition-colors cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={lotInputStr}
                  onChange={(e) => {
                    setLotInputStr(e.target.value);
                    const v = parseInt(e.target.value) || 0;
                    setLot(Math.max(1, v));
                  }}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-center text-base font-bold text-gray-900 focus:outline-hidden focus:border-[#00B26A] focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    const nextLot = lot + 1;
                    setLot(nextLot);
                    setLotInputStr(nextLot.toString());
                  }}
                  className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-lg flex items-center justify-center transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Quick Lot Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[1, 5, 10, 50, 100].map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setLot(l);
                      setLotInputStr(l.toString());
                    }}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-emerald-50 hover:text-[#00B26A] text-gray-600 rounded-md text-[10.5px] font-bold whitespace-nowrap transition-colors"
                  >
                    +{l} Lot
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SLIDER PERSENTASE SALDO */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-xs">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-semibold text-gray-500">Persentase Saldo RDN</span>
              <span className="font-bold text-gray-900">{sliderPct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={sliderPct}
              onChange={(e) => handleSliderChange(parseInt(e.target.value))}
              className="w-full accent-[#00B26A] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1.5">
              {[0, 25, 50, 75, 100].map(p => (
                <span 
                  key={p} 
                  onClick={() => handleSliderChange(p)}
                  className="cursor-pointer hover:text-gray-700"
                >
                  {p}%
                </span>
              ))}
            </div>
          </div>

          {/* TOTAL ESTIMATION CARD */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-xs space-y-2 text-xs">
            <div className="flex justify-between text-gray-500">
              <span>Saldo RDN Tersedia:</span>
              <span className="font-semibold text-gray-900">
                Rp {Math.round(tradingBalance).toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Biaya Transaksi / Broker:</span>
              <span className="font-semibold text-gray-900">
                Rp {Math.round(orderCalculation.feeAmountIdr).toLocaleString('id-ID')}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
              <span className="font-bold text-gray-900 text-sm">Total Estimasi Pembelian:</span>
              <div className="text-right">
                <span className="font-black text-base text-[#00B26A]">
                  Rp {Math.round(orderCalculation.netTotalIdr).toLocaleString('id-ID')}
                </span>
                {assetType !== 'stock_id' && (
                  <span className="text-[11px] text-gray-400 block">
                    (~${orderCalculation.netTotalUsd.toFixed(2)})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* VALIDATION ERROR BANNER */}
          {validationError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: PREVIEW ORDER */}
      {step === 'preview' && (
        <div className="p-4 max-w-md mx-auto w-full space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
            <div className="text-center pb-3 border-b border-gray-100">
              <span className="inline-block px-3 py-1 bg-emerald-50 text-[#00B26A] text-xs font-black rounded-full mb-1">
                KONFIRMASI ORDER BELI
              </span>
              <h2 className="text-xl font-black text-gray-900">{baseSymbol}</h2>
              <p className="text-xs text-gray-500">{assetName}</p>
            </div>

            <div className="divide-y divide-gray-100 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-gray-500">Kategori & Engine:</span>
                <span className="font-bold text-gray-900 uppercase">{engine.market} Asset Engine</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-gray-500">Harga Order:</span>
                <span className="font-bold text-gray-900">{engine.formatPrice(price)}</span>
              </div>
              {assetType === 'stock_id' && (
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-500">Jumlah Lot:</span>
                  <span className="font-bold text-gray-900">{lot} Lot (1 Lot = 100 Saham)</span>
                </div>
              )}
              <div className="py-2.5 flex justify-between">
                <span className="text-gray-500">Kuantitas Total:</span>
                <span className="font-bold text-[#00B26A]">
                  {engine.formatQuantity(orderCalculation.quantity, lot)}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-gray-500">Biaya Fee:</span>
                <span className="font-medium text-gray-900">
                  Rp {Math.round(orderCalculation.feeAmountIdr).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="py-3 flex justify-between items-center text-sm font-bold">
                <span className="text-gray-900">Total Pembayaran:</span>
                <span className="text-[#00B26A] text-lg font-black">
                  Rp {Math.round(orderCalculation.netTotalIdr).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: SUCCESS ORDER */}
      {step === 'success' && (
        <div className="p-6 max-w-md mx-auto w-full text-center space-y-4 my-auto">
          <div className="w-16 h-16 bg-emerald-100 text-[#00B26A] rounded-full flex items-center justify-center mx-auto shadow-sm">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">Order Beli Berhasil!</h2>
            <p className="text-xs text-gray-500 mt-1">
              Order pembelian {baseSymbol} berhasil diproses oleh {engine.market} Engine.
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-xs text-xs space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-gray-500">Aset:</span>
              <span className="font-bold text-gray-900">{baseSymbol} ({engine.market})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Kuantitas:</span>
              <span className="font-bold text-gray-900">
                {engine.formatQuantity(orderCalculation.quantity, lot)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Eksekusi:</span>
              <span className="font-black text-[#00B26A]">
                Rp {Math.round(orderCalculation.netTotalIdr).toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              if (onOrderSuccess) onOrderSuccess();
              onBack();
            }}
            className="w-full bg-[#00B26A] hover:bg-[#009650] text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-sm cursor-pointer"
          >
            Lihat di Portofolio
          </button>
        </div>
      )}

      {/* BOTTOM ACTION BAR */}
      {step !== 'success' && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 p-4 shadow-lg">
          <div className="max-w-md mx-auto flex items-center gap-3">
            {step === 'preview' && (
              <button
                onClick={() => setStep('form')}
                className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 rounded-xl text-sm transition-all cursor-pointer"
              >
                Ubah
              </button>
            )}
            <button
              onClick={step === 'form' ? handleProceedToPreview : handleConfirmOrder}
              className={cn(
                "w-full bg-[#00B26A] hover:bg-[#009650] active:scale-[0.99] text-white font-extrabold py-3.5 rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer",
                step === 'preview' ? "w-2/3" : "w-full"
              )}
            >
              <span>{step === 'form' ? `Beli ${baseSymbol}` : 'Konfirmasi Beli'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
