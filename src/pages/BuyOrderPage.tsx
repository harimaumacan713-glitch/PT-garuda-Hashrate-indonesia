import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronDown, Info, Check, Share2, Zap 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { ref, onValue, set, runTransaction, push, serverTimestamp } from 'firebase/database';
import { ALL_GLOBAL_ASSETS, getAssetName, isIDXStock } from '../lib/assetsData';
import { AssetLogo } from '../components/AssetLogo';

interface BuyOrderPageProps {
  symbol?: string;
  onBack: () => void;
  onOrderSuccess?: () => void;
}

export function BuyOrderPage({ symbol = 'BBCA', onBack, onOrderSuccess }: BuyOrderPageProps) {
  const { user } = useAuth();
  const activeUid = user?.uid || 'demo_user';
  const [tradingBalance, setTradingBalance] = useState<number>(0);
  
  // Normalize symbol
  const rawSymbol = symbol.endsWith('USDT') ? symbol : `${symbol}USDT`;
  const baseSymbol = symbol.replace('USDT', '').toUpperCase();
  const isIdr = isIDXStock(symbol) || ['BBCA', 'BBRI', 'BMRI', 'BBNI', 'TLKM', 'ASII', 'GOTO', 'BREN', 'AMMN', 'ANTM', 'ICBP', 'ADRO', 'PTBA', 'UNVR', 'KLBF'].includes(baseSymbol);
  const matchedAsset = ALL_GLOBAL_ASSETS.find(a => a.symbol === symbol || a.symbol === baseSymbol || a.symbol === `${baseSymbol}USDT`);
  const initialBasePrice = matchedAsset?.basePrice || (isIdr ? 6350 : 100);
  const assetName = getAssetName(symbol);

  // Firebase assetPrices sync state
  const [assetPricesMap, setAssetPricesMap] = useState<Record<string, number>>({});

  // Order inputs
  const [price, setPrice] = useState<number>(initialBasePrice);
  const [priceTouched, setPriceTouched] = useState<boolean>(false);
  const [lot, setLot] = useState<number>(0);
  const [lotInputStr, setLotInputStr] = useState<string>('0');
  const [leverage, setLeverage] = useState<'None' | '5x Day Trade'>('None');
  const [expiry] = useState('Good For Day');
  const [stopLossActive, setStopLossActive] = useState(false);
  const [sliderPct, setSliderPct] = useState<number>(0);

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
    avg: number;
    ara: number;
    arb: number;
    fBuy: string;
    fSell: string;
    freq: string;
  }>({
    price: initialBasePrice,
    change: baseSymbol === 'BBCA' ? -25 : 0,
    changePct: baseSymbol === 'BBCA' ? -0.39 : 0.00,
    high: baseSymbol === 'BBCA' ? 6350 : initialBasePrice,
    low: baseSymbol === 'BBCA' ? 6275 : Math.round(initialBasePrice * 0.985),
    open: baseSymbol === 'BBCA' ? 6300 : initialBasePrice,
    prev: baseSymbol === 'BBCA' ? 6375 : initialBasePrice,
    vol: '569.54K',
    val: '360.45B',
    avg: baseSymbol === 'BBCA' ? 6329 : initialBasePrice,
    ara: baseSymbol === 'BBCA' ? 7600 : Math.round(initialBasePrice * 1.20),
    arb: baseSymbol === 'BBCA' ? 5400 : Math.round(initialBasePrice * 0.80),
    fBuy: '241.95B',
    fSell: '239.50B',
    freq: '11.66K'
  });

  // Orderbook rows matching Stockbit bid/ask matrix exactly
  const [orderBookRows, setOrderBookRows] = useState<Array<{
    freqBid: string | number;
    lotBid: string;
    bidPrice: number;
    askPrice: number;
    lotAsk: string;
    freqAsk: string | number;
    bidDepthPct?: number;
    askDepthPct?: number;
  }>>([
    { freqBid: '-', lotBid: '17,597', bidPrice: 6325, askPrice: 6350, lotAsk: '14,620', freqAsk: '-', bidDepthPct: 30, askDepthPct: 25 },
    { freqBid: 67, lotBid: '2,819', bidPrice: 6325, askPrice: 6350, lotAsk: '25,120', freqAsk: 238, bidDepthPct: 15, askDepthPct: 40 },
    { freqBid: 867, lotBid: '67,194', bidPrice: 6300, askPrice: 6375, lotAsk: '59,007', freqAsk: 734, bidDepthPct: 75, askDepthPct: 65 },
    { freqBid: '1,012', lotBid: '44,616', bidPrice: 6275, askPrice: 6400, lotAsk: '70,317', freqAsk: '1,023', bidDepthPct: 55, askDepthPct: 80 },
    { freqBid: '1,235', lotBid: '55,601', bidPrice: 6250, askPrice: 6425, lotAsk: '37,888', freqAsk: 479, bidDepthPct: 65, askDepthPct: 45 },
    { freqBid: 594, lotBid: '36,528', bidPrice: 6225, askPrice: 6450, lotAsk: '41,864', freqAsk: 713, bidDepthPct: 45, askDepthPct: 50 },
    { freqBid: '1,437', lotBid: '93,825', bidPrice: 6200, askPrice: 6475, lotAsk: '21,746', freqAsk: 435, bidDepthPct: 90, askDepthPct: 30 }
  ]);

  // Modal Flow state: 'form' | 'preview' | 'success'
  const [step, setStep] = useState<'form' | 'preview' | 'success'>('form');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Financial calculations
  const sharesPerLot = isIdr ? 100 : 1;
  const rawInvestment = price * lot * sharesPerLot;
  const brokerFee = rawInvestment > 0 ? (isIdr ? Math.round(rawInvestment * 0.0015) : Number((rawInvestment * 0.001).toFixed(2))) : 0;
  const exchangeFee = rawInvestment > 0 ? (isIdr ? Math.round(rawInvestment * 0.0004) : 0) : 0;
  const totalInvestmentWithFee = rawInvestment > 0 
    ? (isIdr ? Math.round(rawInvestment + brokerFee + exchangeFee) : Number((rawInvestment + brokerFee + exchangeFee).toFixed(2))) 
    : 0;

  // Real-time balance sync from Firebase
  useEffect(() => {
    const balanceRef = ref(db, `users/${activeUid}/balance`);
    const unsubscribe = onValue(balanceRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        setTradingBalance(typeof val === 'number' ? val : Number(val) || 0);
      } else {
        const initialBalance = 0;
        set(balanceRef, initialBalance).catch(console.error);
        setTradingBalance(initialBalance);
      }
    });
    return () => unsubscribe();
  }, [activeUid]);

  // Live Firebase assetPrices sync
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
        setAssetPricesMap(map);
        const liveP = map[baseSymbol] || map[symbol] || map[rawSymbol];
        if (liveP && liveP > 0 && !priceTouched) {
          setPrice(liveP);
        }
      }
    });
    return () => unsub();
  }, [baseSymbol, symbol, rawSymbol, priceTouched]);

  // Fetch real-time market data directly from backend server & market feeds
  useEffect(() => {
    const cryptoList = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'AVAX', 'MATIC', 'LINK', 'DOT', 'NEAR', 'SUI', 'PEPE', 'SHIB', 'ATOM', 'TON', 'LTC', 'UNI'];
    const isCrypto = symbol.endsWith('USDT') || cryptoList.includes(baseSymbol);

    if (!isCrypto) {
      const fetchStockQuote = async () => {
        try {
          const res = await fetch(`/api/quote/${symbol}`);
          if (!res.ok) return;
          const json = await res.json();
          if (json.success && json.quote) {
            const q = json.quote;
            if (!priceTouched) {
              setPrice(q.price);
            }
            
            const prev = q.previousClose || (q.price - (q.change || 0));
            const chg = q.change || (q.price - prev);
            const pct = q.pctChange || (prev > 0 ? (chg / prev) * 100 : 0);
            const high = q.high || q.price;
            const low = q.low || Math.round(q.price * 0.985);
            const open = q.open || Math.round(prev * 0.99);
            const avg = q.avg || Math.round((high + low + q.price) / 3);
            const ara = q.ara || Math.round(prev * 1.20);
            const arb = q.arb || Math.round(prev * 0.80);

            setTicker({
              price: q.price,
              change: chg,
              changePct: pct,
              high,
              low,
              open,
              prev,
              vol: q.volDisplay || `${((q.volume || 500000) / 1000).toFixed(2)}K`,
              val: q.valDisplay || `Rp ${(((q.volume || 500000) * q.price) / 1000000000).toFixed(2)}B`,
              avg,
              ara,
              arb,
              fBuy: q.fBuyDisplay || '241.95B',
              fSell: q.fSellDisplay || '239.50B',
              freq: q.freqDisplay || '11.66K'
            });

            if (q.orderBook && Array.isArray(q.orderBook) && q.orderBook.length > 0) {
              setOrderBookRows(q.orderBook);
            } else {
              const stepVal = isIdr ? (q.price >= 5000 ? 25 : q.price >= 2000 ? 10 : 5) : 0.25;
              const rows = Array.from({ length: 7 }, (_, i) => {
                const bP = isIdr ? Math.round(q.price - (i === 0 ? 0 : i * stepVal)) : Number((q.price - (i === 0 ? 0 : i * stepVal)).toFixed(2));
                const aP = isIdr ? Math.round(q.price + ((i + 1) * stepVal)) : Number((q.price + ((i + 1) * stepVal)).toFixed(2));
                const lB = Math.floor(Math.random() * 40000) + 15000;
                const lA = Math.floor(Math.random() * 40000) + 15000;
                return {
                  freqBid: i === 0 ? '-' : (Math.floor(Math.random() * 600) + 100).toLocaleString('id-ID'),
                  lotBid: lB.toLocaleString('id-ID'),
                  bidPrice: bP,
                  askPrice: aP,
                  lotAsk: lA.toLocaleString('id-ID'),
                  freqAsk: i === 0 ? '-' : (Math.floor(Math.random() * 600) + 100).toLocaleString('id-ID'),
                  bidDepthPct: Math.min(95, Math.round((lB / 80000) * 100)),
                  askDepthPct: Math.min(95, Math.round((lA / 80000) * 100))
                };
              });
              setOrderBookRows(rows);
            }
          }
        } catch (e) {}
      };

      fetchStockQuote();
      const interval = setInterval(fetchStockQuote, 1200);
      return () => clearInterval(interval);
    }

    // Crypto Live Ticker & WebSocket Stream
    let ws: WebSocket | null = null;
    let isSubscribed = true;

    const fetchCrypto = () => {
      fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${rawSymbol}`)
        .then(res => res.json())
        .then(data => {
          if (!isSubscribed || !data || !data.lastPrice) return;
          const liveP = parseFloat(data.lastPrice);
          if (!priceTouched) {
            setPrice(liveP);
          }
          const chg = parseFloat(data.priceChange || '0');
          const pct = parseFloat(data.priceChangePercent || '0');
          const highP = parseFloat(data.highPrice || `${liveP * 1.02}`);
          const lowP = parseFloat(data.lowPrice || `${liveP * 0.98}`);
          const openP = parseFloat(data.openPrice || `${liveP}`);
          const prevP = parseFloat(data.prevClosePrice || `${liveP}`);
          const volP = parseFloat(data.volume || '0');
          const quoteVolP = parseFloat(data.quoteVolume || '0');

          setTicker({
            price: liveP,
            change: chg,
            changePct: pct,
            high: highP,
            low: lowP,
            open: openP,
            prev: prevP,
            vol: volP > 1000 ? `${(volP / 1000).toFixed(2)}K` : volP.toFixed(2),
            val: `$${(quoteVolP / 1000000).toFixed(2)}M`,
            avg: Number(((highP + lowP + liveP) / 3).toFixed(2)),
            ara: Number((liveP * 1.25).toFixed(2)),
            arb: Number((liveP * 0.75).toFixed(2)),
            fBuy: `$${((quoteVolP * 0.52) / 1000000).toFixed(2)}M`,
            fSell: `$${((quoteVolP * 0.48) / 1000000).toFixed(2)}M`,
            freq: `${(Math.floor(volP * 0.2)).toLocaleString('id-ID')}`
          });
        })
        .catch(() => {});
    };

    fetchCrypto();
    const cryptoInterval = setInterval(fetchCrypto, 1500);

    // Connect to Binance live WebSocket for real-time trade updates
    try {
      ws = new WebSocket(`wss://stream.binance.com:9443/ws/${rawSymbol.toLowerCase()}@ticker`);
      ws.onmessage = (event) => {
        if (!isSubscribed) return;
        try {
          const d = JSON.parse(event.data);
          if (d && d.c) {
            const liveP = parseFloat(d.c);
            const chg = parseFloat(d.p || '0');
            const pct = parseFloat(d.P || '0');
            const highP = parseFloat(d.h || '0');
            const lowP = parseFloat(d.l || '0');
            const openP = parseFloat(d.o || '0');
            const volP = parseFloat(d.v || '0');
            const quoteVolP = parseFloat(d.q || '0');

            setTicker(prev => ({
              ...prev,
              price: liveP,
              change: chg,
              changePct: pct,
              high: highP,
              low: lowP,
              open: openP,
              vol: volP > 1000 ? `${(volP / 1000).toFixed(2)}K` : volP.toFixed(2),
              val: `$${(quoteVolP / 1000000).toFixed(2)}M`
            }));

            // Generate live crypto order book matrix
            const step = liveP > 1000 ? 5 : (liveP > 100 ? 0.5 : 0.01);
            const rows = Array.from({ length: 7 }, (_, i) => {
              const bP = Number((liveP - i * step).toFixed(2));
              const aP = Number((liveP + (i + 1) * step).toFixed(2));
              const lB = Number(((Math.random() * 5 + 0.5) * (liveP > 1000 ? 1 : 20)).toFixed(2));
              const lA = Number(((Math.random() * 5 + 0.5) * (liveP > 1000 ? 1 : 20)).toFixed(2));
              return {
                freqBid: (Math.floor(Math.random() * 100) + 10).toString(),
                lotBid: lB.toString(),
                bidPrice: bP,
                askPrice: aP,
                lotAsk: lA.toString(),
                freqAsk: (Math.floor(Math.random() * 100) + 10).toString(),
                bidDepthPct: Math.min(95, Math.round((lB / 30) * 100)),
                askDepthPct: Math.min(95, Math.round((lA / 30) * 100))
              };
            });
            setOrderBookRows(rows);
          }
        } catch (err) {}
      };
    } catch (e) {}

    return () => {
      isSubscribed = false;
      clearInterval(cryptoInterval);
      if (ws) ws.close();
    };
  }, [symbol, baseSymbol, rawSymbol, isIdr, priceTouched]);

  // Handle lot changes via slider
  const handleSliderChange = (newPct: number) => {
    setSliderPct(newPct);
    if (newPct === 0) {
      setLot(0);
      setLotInputStr('0');
      return;
    }
    const targetAmount = (tradingBalance * newPct) / 100;
    const costPerLot = (price * sharesPerLot) || 1;
    const calculatedLot = Math.floor(targetAmount / costPerLot);
    const finalLot = calculatedLot > 0 ? calculatedLot : 1;
    setLot(finalLot);
    setLotInputStr(finalLot.toString());
  };

  // Handle lot changes via buttons or input
  const handleLotChange = (newLot: number) => {
    const validLot = Math.max(0, newLot);
    setLot(validLot);
    setLotInputStr(validLot.toString());
    const totalCost = validLot > 0 ? validLot * price * sharesPerLot : 0;
    if (tradingBalance > 0) {
      const calculatedPct = Math.min(100, Math.round((totalCost / tradingBalance) * 100));
      setSliderPct(calculatedPct);
    }
  };

  // Price adjustment step
  const priceStep = isIdr 
    ? (price >= 5000 ? 25 : price >= 2000 ? 10 : 5) 
    : (price >= 1000 ? 10 : price >= 100 ? 0.5 : (price < 1 ? 0.0001 : 0.01));

  const handlePriceStep = (delta: number) => {
    setPrice(prev => {
      const updated = Math.max(0.000001, prev + delta * priceStep);
      return isIdr ? Math.round(updated) : Number(updated.toFixed(price < 1 ? 4 : 2));
    });
    setPriceTouched(true);
  };

  // Format IDR/USD number
  const formatPriceDisplay = (val: number) => {
    if (isIdr) return Math.round(val).toLocaleString('id-ID');
    if (val >= 1000) return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (val < 0.01) return val.toFixed(6);
    return val.toFixed(2);
  };

  // Confirm order execution
  const handleConfirmOrder = async () => {
    try {
      const userBalanceRef = ref(db, `users/${activeUid}/balance`);
      
      // Deduct balance atomically
      await runTransaction(userBalanceRef, (currentBalance) => {
        const b = typeof currentBalance === 'number' ? currentBalance : (Number(currentBalance) || 0);
        return Math.max(0, b - totalInvestmentWithFee);
      });

      // Save order
      const ordersRef = ref(db, `users/${activeUid}/orders`);
      const newOrderRef = push(ordersRef);
      await set(newOrderRef, {
        orderId: newOrderRef.key,
        symbol: baseSymbol,
        stockName: assetName,
        orderType: 'Limit Order',
        price: price,
        lot: lot,
        shares: lot * sharesPerLot,
        investment: rawInvestment,
        brokerFee: brokerFee,
        exchangeFee: exchangeFee,
        totalCost: totalInvestmentWithFee,
        currency: isIdr ? 'IDR' : 'USD',
        status: 'FILLED',
        createdAt: serverTimestamp()
      });

      // Save / Update position
      const positionRef = ref(db, `users/${activeUid}/positions/${baseSymbol}`);
      await runTransaction(positionRef, (currentPos) => {
        if (!currentPos) {
          return {
            symbol: baseSymbol,
            stockName: assetName,
            lot: lot,
            avgPrice: price,
            totalCost: totalInvestmentWithFee,
            currency: isIdr ? 'IDR' : 'USD',
            updatedAt: Date.now()
          };
        } else {
          const newLot = (currentPos.lot || 0) + lot;
          const newTotalCost = (currentPos.totalCost || 0) + totalInvestmentWithFee;
          const oldAvgPrice = currentPos.avgPrice || price;
          const newAvgPrice = isIdr
            ? Math.round(((oldAvgPrice * (currentPos.lot || 0)) + (price * lot)) / newLot)
            : Number((((oldAvgPrice * (currentPos.lot || 0)) + (price * lot)) / newLot).toFixed(2));
          return {
            ...currentPos,
            symbol: baseSymbol,
            stockName: assetName,
            lot: newLot,
            avgPrice: newAvgPrice,
            totalCost: newTotalCost,
            currency: isIdr ? 'IDR' : 'USD',
            updatedAt: Date.now()
          };
        }
      });

      // Save transaction log
      const txRef = ref(db, `users/${activeUid}/transactions`);
      const newTxRef = push(txRef);
      await set(newTxRef, {
        transactionId: newTxRef.key,
        uid: activeUid,
        userId: activeUid,
        type: 'buy',
        asset: baseSymbol,
        symbol: baseSymbol,
        stockName: assetName,
        lot: lot,
        quantity: lot * sharesPerLot,
        price: price,
        amount: totalInvestmentWithFee,
        total: totalInvestmentWithFee,
        currency: isIdr ? 'IDR' : 'USD',
        status: 'completed',
        createdAt: serverTimestamp(),
        timestamp: Date.now()
      });

      setStep('success');
    } catch (err) {
      console.error('Order submission failed:', err);
      setToastMsg('Gagal memproses pesanan, silakan coba lagi');
      setTimeout(() => setToastMsg(null), 2500);
    }
  };

  const isBuyEnabled = lot > 0;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-[#FAFAFA] h-[100dvh] max-h-[100dvh] w-full overflow-hidden select-none">
      {/* Toast popup */}
      {toastMsg && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-[150] bg-gray-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg">
          {toastMsg}
        </div>
      )}

      {/* TOP APP BAR (STICKY AT TOP) */}
      <header className="shrink-0 flex items-center justify-between px-4 h-14 bg-white border-b border-gray-100 z-20">
        <button 
          onClick={onBack} 
          className="p-1 -ml-1 text-gray-700 hover:text-black transition-colors"
          aria-label="Kembali"
        >
          <ChevronLeft className="w-6 h-6" strokeWidth={2} />
        </button>
        
        <div className="flex items-center gap-2">
          <span className="bg-[#E6F7F0] text-[#00AA5B] text-[11px] font-bold px-3 py-1 rounded-md border border-[#00AA5B]/20">
            Limit Order
          </span>
          <button className="flex items-center gap-1 border border-gray-200 text-gray-700 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-white hover:bg-gray-50 transition-colors">
            <span>Order Types</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>
      </header>

      {/* MAIN SCROLLABLE CONTENT (EXPANDS TO FILL HEIGHT) */}
      <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar pb-6 space-y-3">
        {/* ASSET HEADER CARD */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-3 mx-4 mt-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AssetLogo symbol={symbol} size="md" className="w-11 h-11 min-w-[44px] shadow-xs" />
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="text-[16px] font-extrabold text-gray-900 leading-tight">{baseSymbol}</h1>
                  <span className="flex items-center gap-1 bg-[#EDE9FE] text-[#7C3AED] text-[10px] font-bold px-1.5 py-0.5 rounded leading-none">
                    <Zap className="w-2.5 h-2.5 fill-[#7C3AED]" />
                    <span>5x</span>
                  </span>
                  <span className="border border-[#00B26A] text-[#00B26A] bg-[#ECFDF5] text-[10px] font-bold px-1.5 py-0.5 rounded leading-none">
                    TL
                  </span>
                </div>
                <p className="text-[12px] text-gray-400 font-medium mt-0.5">{assetName}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[18px] font-extrabold text-gray-900 block leading-tight">
                {formatPriceDisplay(ticker.price)}
              </span>
              <span className={cn(
                "text-[12px] font-bold",
                ticker.change >= 0 ? "text-[#00B26A]" : "text-[#e11d48]"
              )}>
                {ticker.change >= 0 ? '+' : ''}{ticker.change} ({ticker.changePct >= 0 ? '+' : ''}{ticker.changePct.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* ORDER CONFIGURATION CARD */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-4 mx-4 shadow-2xs space-y-4">
          {/* Leverage Row */}
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-gray-800 font-medium">Leverage</span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setLeverage('None')}
                className={cn(
                  "px-4 py-1 rounded-full text-xs font-bold border transition-colors",
                  leverage === 'None' 
                    ? "border-[#00B26A] text-[#00B26A] bg-white ring-1 ring-[#00B26A]" 
                    : "border-gray-200 text-gray-500 bg-white hover:bg-gray-50"
                )}
              >
                None
              </button>
              <button 
                onClick={() => setLeverage('5x Day Trade')}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 transition-colors",
                  leverage === '5x Day Trade' 
                    ? "border-[#00B26A] text-[#00B26A] bg-white ring-1 ring-[#00B26A]" 
                    : "border-gray-200 text-gray-500 bg-white hover:bg-gray-50"
                )}
              >
                <Zap className="w-3 h-3 text-[#00B26A]" />
                <span>5x Day Trade</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Trading Balance Row */}
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-gray-800 font-medium">Trading Balance</span>
            <span className="text-[14px] font-extrabold text-gray-900">
              Rp {tradingBalance.toLocaleString('id-ID')}
            </span>
          </div>

          {/* Slider Row */}
          <div className="flex items-center gap-3">
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={sliderPct} 
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#00AA5B]"
            />
            <span className="text-xs font-medium text-gray-700 min-w-[32px] text-right">
              {sliderPct}%
            </span>
          </div>

          {/* Investment (Plus Fee) Row */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[13px] text-gray-800 font-medium block leading-none">Investment</span>
              <span className="text-[11px] text-gray-400 font-normal mt-0.5 block">(Plus Fee)</span>
            </div>
            <span className="text-[14px] font-extrabold text-gray-900">
              {isIdr ? 'Rp ' : '$'}{totalInvestmentWithFee.toLocaleString(isIdr ? 'id-ID' : 'en-US', { minimumFractionDigits: isIdr ? 0 : 2, maximumFractionDigits: isIdr ? 0 : 2 })}
            </span>
          </div>

          {/* Price Stepper Row */}
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-gray-800 font-medium">Price</span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handlePriceStep(-1)}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 text-base font-bold transition-colors cursor-pointer"
              >
                -
              </button>
              <div className="w-24 text-center font-extrabold text-[14px] text-gray-900 select-none">
                {formatPriceDisplay(price)}
              </div>
              <button 
                onClick={() => handlePriceStep(1)}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 text-base font-bold transition-colors cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Lot Stepper Row */}
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-gray-800 font-medium">Lot</span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleLotChange(lot - 1)}
                className={cn(
                  "w-8 h-8 rounded-lg border flex items-center justify-center text-base font-bold transition-colors",
                  lot > 0 ? "border-gray-200 text-gray-700 hover:bg-gray-100 cursor-pointer" : "border-gray-200 text-gray-300 cursor-not-allowed"
                )}
                disabled={lot <= 0}
              >
                -
              </button>
              <input 
                type="text"
                value={lotInputStr}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  setLotInputStr(raw);
                  const parsed = parseInt(raw, 10) || 0;
                  setLot(parsed);
                  if (tradingBalance > 0) {
                    const totalCost = parsed * price * sharesPerLot;
                    setSliderPct(Math.min(100, Math.round((totalCost / tradingBalance) * 100)));
                  }
                }}
                className="w-24 text-center font-extrabold text-[14px] text-gray-900 bg-transparent outline-none"
              />
              <button 
                onClick={() => handleLotChange(lot + 1)}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 text-base font-bold transition-colors cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Expiry Dropdown Row */}
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-gray-800 font-medium">Expiry</span>
            <button className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-1.5 text-xs font-medium text-gray-800 bg-white hover:bg-gray-50">
              <span>{expiry}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* STOP LOSS / TAKE PROFIT CARD */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-4 mx-4 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[13px] text-gray-800 font-medium">
            <span>Stop Loss/Take Profit</span>
            <Info className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <button 
            onClick={() => setStopLossActive(!stopLossActive)}
            className={cn(
              "w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer",
              stopLossActive ? "bg-[#00AA5B]" : "bg-gray-200"
            )}
          >
            <div className={cn(
              "w-5 h-5 rounded-full bg-white transition-transform shadow-xs",
              stopLossActive ? "translate-x-5" : "translate-x-0"
            )} />
          </button>
        </div>

        {/* CLICK YOUR BUYING PRICE BELOW DIVIDER */}
        <div className="text-center text-[11px] text-gray-400 font-medium my-3 flex items-center justify-center gap-3 px-6 before:flex-1 before:border-t before:border-gray-200 after:flex-1 after:border-t after:border-gray-200">
          Click your buying price below
        </div>

        {/* 3-COLUMN STATS GRID */}
        <div className="px-4">
          <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-[12px] bg-white rounded-xl border border-gray-200/80 p-3.5 shadow-2xs">
            {/* Column 1 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Open</span>
                <span className="font-bold text-[#e11d48]">
                  {formatPriceDisplay(ticker.open)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">High</span>
                <span className="font-bold text-[#e11d48]">
                  {formatPriceDisplay(ticker.high)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Low</span>
                <span className="font-bold text-[#e11d48]">
                  {formatPriceDisplay(ticker.low)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">F Buy</span>
                <span className="font-bold text-[#00B26A]">{ticker.fBuy}</span>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Prev</span>
                <span className="font-bold text-gray-800">{formatPriceDisplay(ticker.prev)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">ARA</span>
                <span className="font-bold text-gray-800 flex items-center gap-0.5">
                  {formatPriceDisplay(ticker.ara)} <ChevronDown className="w-3 h-3 text-gray-400" />
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">ARB</span>
                <span className="font-bold text-gray-800 flex items-center gap-0.5">
                  {formatPriceDisplay(ticker.arb)} <ChevronDown className="w-3 h-3 text-gray-400" />
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">F Sell</span>
                <span className="font-bold text-[#e11d48]">{ticker.fSell}</span>
              </div>
            </div>

            {/* Column 3 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Lot</span>
                <span className="font-bold text-[#e11d48]">{ticker.vol}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Val</span>
                <span className="font-bold text-[#e11d48]">{ticker.val}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Avg</span>
                <span className="font-bold text-[#e11d48]">{formatPriceDisplay(ticker.avg)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Freq</span>
                <span className="font-bold text-[#00B26A]">{ticker.freq}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ORDER BOOK MATRIX */}
        <div className="bg-white border-y border-gray-200/80 mx-0 mt-2 mb-2">
          <div className="grid grid-cols-6 gap-1 px-3 py-2.5 text-[11px] font-bold text-gray-700 border-b border-gray-200 bg-gray-50/70 text-center">
            <div className="text-left">Freq</div>
            <div className="text-right pr-2">Lot</div>
            <div>Bid</div>
            <div>Ask</div>
            <div className="text-left pl-2">Lot</div>
            <div className="text-right">Freq</div>
          </div>

          <div className="divide-y divide-gray-100 text-[11px]">
            {orderBookRows.map((row, idx) => (
              <div key={idx} className="grid grid-cols-6 gap-1 px-3 py-2 text-center items-center">
                <div className="text-left text-[#7C3AED] font-semibold">{row.freqBid}</div>
                <div className="text-right pr-2 relative">
                  {row.bidDepthPct && (
                    <div 
                      className="absolute right-0 top-0 bottom-0 bg-rose-50/60 rounded-xs" 
                      style={{ width: `${row.bidDepthPct}%` }}
                    />
                  )}
                  <span className="relative z-10 text-gray-800 font-medium">{row.lotBid}</span>
                </div>
                <button 
                  onClick={() => {
                    setPrice(row.bidPrice);
                    setPriceTouched(true);
                  }}
                  className="font-bold text-[#e11d48] hover:bg-rose-50 rounded py-0.5 transition-colors cursor-pointer"
                >
                  {formatPriceDisplay(row.bidPrice)}
                </button>
                <button 
                  onClick={() => {
                    setPrice(row.askPrice);
                    setPriceTouched(true);
                  }}
                  className="font-bold text-[#00AA5B] hover:bg-emerald-50 rounded py-0.5 transition-colors cursor-pointer"
                >
                  {formatPriceDisplay(row.askPrice)}
                </button>
                <div className="text-left pl-2 relative">
                  {row.askDepthPct && (
                    <div 
                      className="absolute left-0 top-0 bottom-0 bg-emerald-50/60 rounded-xs" 
                      style={{ width: `${row.askDepthPct}%` }}
                    />
                  )}
                  <span className="relative z-10 text-gray-800 font-medium">{row.lotAsk}</span>
                </div>
                <div className="text-right text-[#7C3AED] font-semibold">{row.freqAsk}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* DOCKED BOTTOM BUY BUTTON (ELEVATED & COMFORTABLE PADDING SO IT CAN ALWAYS BE CLICKED CLEANLY) */}
      <footer className="shrink-0 bg-white border-t border-gray-200/80 px-4 pt-3 pb-6 sm:pb-4 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] z-30">
        <button 
          onClick={() => {
            if (lot <= 0) {
              setToastMsg(isIdr ? 'Silakan tentukan jumlah lot' : 'Silakan tentukan jumlah unit');
              setTimeout(() => setToastMsg(null), 2500);
              return;
            }
            if (tradingBalance <= 0) {
              setToastMsg('Saldo Trading Balance Rp 0. Silakan isi saldo di Profil / Deposit');
              setTimeout(() => setToastMsg(null), 3000);
              return;
            }
            if (totalInvestmentWithFee > tradingBalance) {
              setToastMsg('Saldo Trading Balance tidak mencukupi');
              setTimeout(() => setToastMsg(null), 2500);
              return;
            }
            setStep('preview');
          }}
          className={cn(
            "w-full py-3.5 rounded-xl text-[16px] font-extrabold transition-all shadow-xs flex items-center justify-center cursor-pointer select-none",
            isBuyEnabled 
              ? "bg-[#00AA5B] hover:bg-[#009650] active:scale-[0.99] text-white" 
              : "bg-[#A7F3D0] text-white cursor-pointer hover:bg-[#8ee7be]"
          )}
        >
          Buy
        </button>
      </footer>

      {/* ========================================================================= */}
      {/* SCREEN 2: Buy Order Preview Modal Bottom Sheet */}
      {/* ========================================================================= */}
      {step === 'preview' && (
        <div className="fixed inset-0 z-[250] flex flex-col justify-end bg-black/50 backdrop-blur-[1px] animate-fade-in">
          <div 
            onClick={() => setStep('form')} 
            className="flex-1"
          />
          <div className="bg-white rounded-t-3xl p-5 w-full max-w-md mx-auto shadow-2xl animate-slide-up pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4" />

            <h2 className="text-[16px] font-bold text-gray-900 text-center mb-5">
              Buy Order Preview
            </h2>

            <div className="flex flex-col gap-3.5 text-[13px] mb-5">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Aset</span>
                <div className="flex items-center gap-2">
                  <AssetLogo symbol={symbol} size="sm" className="w-5 h-5 min-w-[20px]" />
                  <span className="font-bold text-gray-900">{baseSymbol}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Order Type</span>
                <span className="font-bold text-gray-900">Limit Order</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Expiry</span>
                <span className="font-bold text-gray-900">Good For Day</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Price</span>
                <span className="font-bold text-gray-900">{isIdr ? 'Rp ' : '$'}{formatPriceDisplay(price)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Lot</span>
                <span className="font-bold text-gray-900">{lot} {isIdr ? `(${lot * sharesPerLot} Lembar)` : `(${lot} Unit)`}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Investment</span>
                <span className="font-bold text-gray-900">
                  {isIdr ? 'Rp ' : '$'}{rawInvestment.toLocaleString(isIdr ? 'id-ID' : 'en-US', { minimumFractionDigits: isIdr ? 0 : 2, maximumFractionDigits: isIdr ? 0 : 2 })}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Broker Fee ({isIdr ? '0.15%' : '0.10%'})</span>
                <span className="font-bold text-gray-900">
                  {isIdr ? 'Rp ' : '$'}{brokerFee.toLocaleString(isIdr ? 'id-ID' : 'en-US', { minimumFractionDigits: isIdr ? 0 : 2, maximumFractionDigits: isIdr ? 0 : 2 })}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-gray-500 font-medium">
                  <span>Exchange Fee ({isIdr ? '0.04%' : '0%'})</span>
                  <Info className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <span className="font-bold text-gray-900">
                  {isIdr ? 'Rp ' : '$'}{exchangeFee.toLocaleString(isIdr ? 'id-ID' : 'en-US', { minimumFractionDigits: isIdr ? 0 : 2, maximumFractionDigits: isIdr ? 0 : 2 })}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3.5 flex items-center justify-between mb-5 border border-gray-100">
              <span className="text-[13px] font-bold text-gray-900">Investment (Plus Fee)</span>
              <span className="text-[15px] font-extrabold text-gray-900">
                {isIdr ? 'Rp ' : '$'}{totalInvestmentWithFee.toLocaleString(isIdr ? 'id-ID' : 'en-US', { minimumFractionDigits: isIdr ? 0 : 2, maximumFractionDigits: isIdr ? 0 : 2 })}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setStep('form')}
                className="py-3 px-4 rounded-xl border border-gray-200 text-[#e11d48] hover:bg-red-50 font-bold text-[14px] transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button 
                onClick={handleConfirmOrder}
                className="py-3 px-4 rounded-xl bg-[#00AA5B] hover:bg-[#009650] text-white font-bold text-[14px] transition-colors shadow-sm cursor-pointer"
              >
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 3: Order Success Modal Bottom Sheet */}
      {/* ========================================================================= */}
      {step === 'success' && (
        <div className="fixed inset-0 z-[260] flex flex-col justify-end bg-black/50 backdrop-blur-[1px] animate-fade-in">
          <div className="bg-white rounded-t-3xl p-6 w-full max-w-md mx-auto shadow-2xl animate-slide-up flex flex-col items-center pb-[max(2rem,env(safe-area-inset-bottom))]">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mb-6" />

            <div className="w-full bg-white border border-gray-100 rounded-2xl p-6 mb-6 text-center relative overflow-hidden shadow-xs">
              <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center">
                <AssetLogo symbol={symbol} size="lg" className="w-16 h-16 min-w-[64px]" />
              </div>

              <h2 className="text-[18px] font-bold text-gray-900 mb-0.5">{baseSymbol}</h2>
              <p className="text-[12px] text-gray-400 mb-6">{assetName}</p>

              <div className="relative my-6 -mx-6">
                <div className="border-b border-dashed border-gray-200 w-full" />
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-r border-gray-200" />
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-l border-gray-200" />
              </div>

              <h3 className="text-[15px] font-bold text-gray-900 mb-5">
                Pesanan berhasil dikirim
              </h3>

              <div className="w-16 h-16 bg-[#00AA5B] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#00AA5B]/20">
                <Check className="w-9 h-9 text-white" strokeWidth={3} />
              </div>

              <button className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#00AA5B] hover:underline cursor-pointer">
                <Share2 className="w-4 h-4" />
                <span>Share Trade</span>
              </button>
            </div>

            <div className="w-full flex flex-col gap-3">
              <button 
                onClick={() => {
                  setStep('form');
                  setLot(0);
                  setLotInputStr('0');
                  setSliderPct(0);
                }}
                className="w-full py-3.5 px-4 rounded-xl border border-[#00AA5B] text-[#00AA5B] bg-white hover:bg-emerald-50 font-bold text-[14px] transition-colors cursor-pointer"
              >
                Kembali ke Halaman Order
              </button>

              <button 
                onClick={() => {
                  if (onOrderSuccess) onOrderSuccess();
                  else onBack();
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-[#00AA5B] hover:bg-[#009650] text-white font-bold text-[14px] transition-colors shadow-sm cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
