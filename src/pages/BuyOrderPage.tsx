import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronDown, Info, Check, Share2 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { ref, onValue, set, runTransaction, push, serverTimestamp } from 'firebase/database';

interface BuyOrderPageProps {
  symbol?: string;
  onBack: () => void;
  onOrderSuccess?: () => void;
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

  'GOLD': 'Gold / Emas Global (XAU/USD)',
  'SILVER': 'Silver / Perak Global (XAG/USD)',
  'SPX': 'S&P 500 Index',
  'NDX': 'NASDAQ 100 Index',
  'EURUSD': 'EUR / USD Forex',
  'LABA': 'Green Power Group Tbk.'
};

const assetLogos: Record<string, string> = {
  'BTC': 'https://cryptologos.cc/logos/bitcoin-btc-logo.png', 'BTCUSDT': 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
  'ETH': 'https://cryptologos.cc/logos/ethereum-eth-logo.png', 'ETHUSDT': 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  'BNB': 'https://cryptologos.cc/logos/bnb-bnb-logo.png', 'BNBUSDT': 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
  'SOL': 'https://cryptologos.cc/logos/solana-sol-logo.png', 'SOLUSDT': 'https://cryptologos.cc/logos/solana-sol-logo.png',
  'XRP': 'https://cryptologos.cc/logos/xrp-xrp-logo.png', 'XRPUSDT': 'https://cryptologos.cc/logos/xrp-xrp-logo.png',
  'ADA': 'https://cryptologos.cc/logos/cardano-ada-logo.png', 'ADAUSDT': 'https://cryptologos.cc/logos/cardano-ada-logo.png',
  'DOGE': 'https://cryptologos.cc/logos/dogecoin-doge-logo.png', 'DOGEUSDT': 'https://cryptologos.cc/logos/dogecoin-doge-logo.png',
  'AVAX': 'https://cryptologos.cc/logos/avalanche-avax-logo.png', 'AVAXUSDT': 'https://cryptologos.cc/logos/avalanche-avax-logo.png',
  'MATIC': 'https://cryptologos.cc/logos/polygon-matic-logo.png', 'MATICUSDT': 'https://cryptologos.cc/logos/polygon-matic-logo.png',
  'LINK': 'https://cryptologos.cc/logos/chainlink-link-logo.png', 'LINKUSDT': 'https://cryptologos.cc/logos/chainlink-link-logo.png',
  'DOT': 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png', 'DOTUSDT': 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png',
  'NEAR': 'https://cryptologos.cc/logos/near-protocol-near-logo.png', 'NEARUSDT': 'https://cryptologos.cc/logos/near-protocol-near-logo.png',
  'SUI': 'https://cryptologos.cc/logos/sui-sui-logo.png', 'SUIUSDT': 'https://cryptologos.cc/logos/sui-sui-logo.png',
  'PEPE': 'https://cryptologos.cc/logos/pepe-pepe-logo.png', 'PEPEUSDT': 'https://cryptologos.cc/logos/pepe-pepe-logo.png',
  'SHIB': 'https://cryptologos.cc/logos/shiba-inu-shib-logo.png', 'SHIBUSDT': 'https://cryptologos.cc/logos/shiba-inu-shib-logo.png',
  'ATOM': 'https://cryptologos.cc/logos/cosmos-atom-logo.png', 'ATOMUSDT': 'https://cryptologos.cc/logos/cosmos-atom-logo.png',
  'TON': 'https://cryptologos.cc/logos/toncoin-ton-logo.png', 'TONUSDT': 'https://cryptologos.cc/logos/toncoin-ton-logo.png',
  'LTC': 'https://cryptologos.cc/logos/litecoin-ltc-logo.png', 'LTCUSDT': 'https://cryptologos.cc/logos/litecoin-ltc-logo.png',
  'UNI': 'https://cryptologos.cc/logos/uniswap-uni-logo.png', 'UNIUSDT': 'https://cryptologos.cc/logos/uniswap-uni-logo.png',

  'NVDA': 'https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg',
  'AAPL': 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
  'TSLA': 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png',
  'MSFT': 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
  'AMZN': 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
  'GOOGL': 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg',
  'META': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg',
  'NFLX': 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
  'AMD': 'https://upload.wikimedia.org/wikipedia/commons/7/7c/AMD_Logo.svg',
  'INTC': 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Intel_logo_%282020%29.svg',
  'COIN': 'https://upload.wikimedia.org/wikipedia/commons/5/50/Coinbase_Logo_2019.svg',

  'GOLD': 'https://cdn-icons-png.flaticon.com/512/2822/2822831.png',
  'SILVER': 'https://cdn-icons-png.flaticon.com/512/2822/2822842.png',
  'SPX': 'https://upload.wikimedia.org/wikipedia/commons/1/18/S%26P_500_logo.svg',
  'NDX': 'https://upload.wikimedia.org/wikipedia/commons/8/87/Nasdaq_Logo.svg',
  'EURUSD': 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Euro_symbol.svg',
};

const defaultPrices: Record<string, number> = {
  'BTC': 1450000000, 'BTCUSDT': 1450000000,
  'ETH': 48000000, 'ETHUSDT': 48000000,
  'BNB': 9500000, 'BNBUSDT': 9500000,
  'SOL': 2500000, 'SOLUSDT': 2500000,
  'XRP': 9500, 'XRPUSDT': 9500,
  'ADA': 8500, 'ADAUSDT': 8500,
  'DOGE': 2500, 'DOGEUSDT': 2500,
  'AVAX': 450000, 'AVAXUSDT': 450000,
  'MATIC': 7000, 'MATICUSDT': 7000,
  'LINK': 220000, 'LINKUSDT': 220000,
  'DOT': 110000, 'DOTUSDT': 110000,
  'NEAR': 85000, 'NEARUSDT': 85000,
  'SUI': 35000, 'SUIUSDT': 35000,
  'PEPE': 0.15, 'PEPEUSDT': 0.15,
  'SHIB': 0.35, 'SHIBUSDT': 0.35,
  'ATOM': 95000, 'ATOMUSDT': 95000,
  'TON': 95000, 'TONUSDT': 95000,
  'LTC': 1200000, 'LTCUSDT': 1200000,
  'UNI': 140000, 'UNIUSDT': 140000,

  'NVDA': 2100000, 'AAPL': 3500000, 'TSLA': 3200000, 'MSFT': 7000000, 'AMZN': 2800000, 'GOOGL': 2600000, 'META': 8000000, 'NFLX': 10000000,
  'AMD': 2200000, 'INTC': 400000, 'COIN': 3500000,
  'GOLD': 3800000, 'SILVER': 45000, 'SPX': 90000000, 'NDX': 300000000, 'EURUSD': 17000,
  'LABA': 97
};

export function BuyOrderPage({ symbol = 'BTCUSDT', onBack, onOrderSuccess }: BuyOrderPageProps) {
  const { user } = useAuth();
  const [tradingBalance, setTradingBalance] = useState<number>(40000); // Default balance Rp 40,000
  
  // Normalize symbol
  const rawSymbol = symbol.endsWith('USDT') ? symbol : `${symbol}USDT`;
  const baseSymbol = symbol.replace('USDT', '');
  const assetName = assetNames[symbol] || assetNames[rawSymbol] || baseSymbol;
  const assetLogo = assetLogos[symbol] || assetLogos[rawSymbol] || '';

  // Firebase assetPrices sync state
  const [assetPricesMap, setAssetPricesMap] = useState<Record<string, number>>({});

  // Order inputs
  const initialPrice = assetPricesMap[baseSymbol] || assetPricesMap[symbol] || defaultPrices[symbol] || defaultPrices[rawSymbol] || 1450000000;
  const [price, setPrice] = useState<number>(initialPrice);
  const [priceTouched, setPriceTouched] = useState<boolean>(false);
  const [lot, setLot] = useState<number>(0);
  const [leverage, setLeverage] = useState<'None' | 'Trading Limit'>('None');
  const [expiry] = useState('Good For Day');
  const [stopLossActive, setStopLossActive] = useState(false);
  const [sliderPct, setSliderPct] = useState<number>(0);

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

  // Real-time market stats from Binance
  const [ticker, setTicker] = useState<{
    price: number;
    change: number;
    changePct: number;
    high: number;
    low: number;
    open: number;
    vol: string;
    val: string;
    avg: number;
    ara: number;
    arb: number;
  }>({
    price: price,
    change: 0,
    changePct: 0.00,
    high: 98,
    low: 95,
    open: 97,
    vol: '64.89K',
    val: '628.23M',
    avg: 97,
    ara: 129,
    arb: 82
  });

  // Orderbook rows (bids and asks) exactly matching screenshot
  const [orderBookRows, setOrderBookRows] = useState<Array<{
    freqBid: string | number;
    lotBid: string;
    bidPrice: number;
    askPrice: number;
    lotAsk: string;
    freqAsk: string | number;
  }>>([
    { freqBid: '-', lotBid: '21,046', bidPrice: 96, askPrice: 97, lotAsk: '1,337', freqAsk: '-' },
    { freqBid: 62, lotBid: '18,892', bidPrice: 96, askPrice: 97, lotAsk: '2,237', freqAsk: 6 },
    { freqBid: 50, lotBid: '21,041', bidPrice: 95, askPrice: 98, lotAsk: '5,139', freqAsk: 39 },
    { freqBid: 42, lotBid: '16,612', bidPrice: 94, askPrice: 99, lotAsk: '7,806', freqAsk: 51 },
    { freqBid: 20, lotBid: '8,097', bidPrice: 93, askPrice: 100, lotAsk: '6,153', freqAsk: 34 },
    { freqBid: 21, lotBid: '6,943', bidPrice: 92, askPrice: 101, lotAsk: '4,374', freqAsk: 32 },
    { freqBid: 18, lotBid: '6,873', bidPrice: 91, askPrice: 102, lotAsk: '6,166', freqAsk: 28 },
    { freqBid: 28, lotBid: '14,127', bidPrice: 90, askPrice: 103, lotAsk: '6,938', freqAsk: 24 },
    { freqBid: 14, lotBid: '1,275', bidPrice: 89, askPrice: 104, lotAsk: '724', freqAsk: 16 },
    { freqBid: 11, lotBid: '381', bidPrice: 88, askPrice: 105, lotAsk: '6,428', freqAsk: 32 }
  ]);

  // Modal Flow state: 'form' (Screen 1) | 'preview' (Screen 2) | 'success' (Screen 3)
  const [step, setStep] = useState<'form' | 'preview' | 'success'>('form');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Financial calculations
  // 1 Lot = 100 shares (1 lot Bitcoin at price 97 = 97 * 100 = Rp 9,700 investment)
  const sharesPerLot = 100;
  const rawInvestment = price * lot * sharesPerLot;
  const brokerFee = rawInvestment > 0 ? 10 : 0;
  const exchangeFee = rawInvestment > 0 ? 4 : 0;
  const totalInvestmentWithFee = rawInvestment > 0 ? rawInvestment + brokerFee + exchangeFee : 0;

  // Real-time balance sync from Firebase
  useEffect(() => {
    if (user) {
      const balanceRef = ref(db, `users/${user.uid}/balance`);
      const unsubscribe = onValue(balanceRef, (snapshot) => {
        if (snapshot.exists()) {
          setTradingBalance(snapshot.val());
        } else {
          const initialBalance = 40000;
          set(balanceRef, initialBalance).catch(console.error);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  // Fetch initial quote data & stream live updates if available
  useEffect(() => {
    const cryptoList = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'AVAX', 'MATIC', 'LINK', 'DOT', 'NEAR', 'SUI', 'PEPE', 'SHIB', 'ATOM', 'TON', 'LTC', 'UNI'];
    const isCrypto = symbol.endsWith('USDT') || cryptoList.includes(symbol.toUpperCase());

    if (!isCrypto) {
      fetch(`/api/quote/${symbol}`)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(data => {
          if (data && data.success && data.quote) {
            const q = data.quote;
            set(ref(db, `assetPrices/${baseSymbol}`), { symbol: baseSymbol, price: q.price, updatedAt: Date.now() }).catch(() => {});
            if (!priceTouched) {
              setPrice(q.price);
            }
            setTicker({
              price: q.price,
              change: q.change || 0,
              changePct: q.pctChange || 0,
              high: q.high || q.price * 1.02,
              low: q.low || q.price * 0.98,
              open: q.price - (q.change || 0),
              vol: q.volume ? (q.volume > 1000000 ? (q.volume / 1000000).toFixed(2) + 'M' : q.volume.toString()) : '15.4M',
              val: '120M',
              avg: q.price,
              ara: Math.round(q.price * 1.25),
              arb: Math.round(q.price * 0.75)
            });

            const p = q.price;
            const rows = Array.from({ length: 10 }, (_, i) => ({
              freqBid: Math.floor(Math.random() * 40) + 10,
              lotBid: Math.floor(Math.random() * 20000 + 1000).toLocaleString(),
              bidPrice: Number((p * (1 - (i + 1) * 0.002)).toFixed(2)),
              askPrice: Number((p * (1 + (i + 1) * 0.002)).toFixed(2)),
              lotAsk: Math.floor(Math.random() * 20000 + 1000).toLocaleString(),
              freqAsk: Math.floor(Math.random() * 40) + 10
            }));
            setOrderBookRows(rows);
          }
        })
        .catch(console.error);
      return;
    }

    fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${rawSymbol}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data && data.lastPrice) {
          const liveP = parseFloat(data.lastPrice);
          const formattedPrice = liveP > 1000 ? Math.round(liveP) : (priceTouched ? price : liveP);
          
          if (!priceTouched) {
            setPrice(formattedPrice);
          }

          setTicker(prev => ({
            ...prev,
            price: liveP,
            change: parseFloat(data.priceChange || '0'),
            changePct: parseFloat(data.priceChangePercent || '0')
          }));
        }
      })
      .catch((err) => {
        console.warn('Ticker fetch fallback:', err);
      });

    // Binance Depth WebSocket for live orderbook optional sync
    let wsDepth: WebSocket | null = null;
    try {
      wsDepth = new WebSocket(`wss://stream.binance.com:9443/ws/${rawSymbol.toLowerCase()}@depth10@100ms`);
      wsDepth.onerror = () => {};
      wsDepth.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.bids && data.asks) {
            const bids = data.bids.slice(0, 10);
            const asks = data.asks.slice(0, 10);
            const rows = bids.map((b: any, idx: number) => {
              const a = asks[idx] || [0, 0];
              const bp = parseFloat(b[0]);
              const ap = parseFloat(a[0]);
              return {
                freqBid: Math.floor(Math.random() * 50) + 10,
                lotBid: parseFloat(b[1]).toLocaleString('en-US', { maximumFractionDigits: 0 }),
                bidPrice: bp > 1000 ? Math.round(bp) : (bp < 200 ? Math.round(bp) : 96),
                askPrice: ap > 1000 ? Math.round(ap) : (ap < 200 ? Math.round(ap) : 97),
                lotAsk: parseFloat(a[1]).toLocaleString('en-US', { maximumFractionDigits: 0 }),
                freqAsk: Math.floor(Math.random() * 50) + 5
              };
            });
            if (rows.length > 0) setOrderBookRows(rows);
          }
        } catch (e) {}
      };
    } catch (e) {}

    return () => {
      if (wsDepth) wsDepth.close();
    };
  }, [rawSymbol, priceTouched, price]);

  // Handle lot changes via slider
  const handleSliderChange = (newPct: number) => {
    setSliderPct(newPct);
    if (newPct === 0) {
      setLot(0);
      return;
    }
    const targetAmount = (tradingBalance * newPct) / 100;
    const costPerLot = price * sharesPerLot + 14;
    const calculatedLot = Math.floor(targetAmount / costPerLot);
    setLot(calculatedLot > 0 ? calculatedLot : 1);
  };

  // Handle lot changes via buttons or input
  const handleLotChange = (newLot: number) => {
    const validLot = Math.max(0, newLot);
    setLot(validLot);
    const totalCost = validLot > 0 ? validLot * price * sharesPerLot + 14 : 0;
    if (tradingBalance > 0) {
      const calculatedPct = Math.min(100, Math.round((totalCost / tradingBalance) * 100));
      setSliderPct(calculatedPct);
    }
  };

  // Click price in orderbook
  const handleSelectPrice = (newPrice: number) => {
    setPrice(newPrice);
    setPriceTouched(true);
  };

  // Check if balance is sufficient and lot is selected
  const isSufficientBalance = lot > 0 && totalInvestmentWithFee <= tradingBalance;

  // Validate and show preview
  const handleBuyClick = () => {
    if (lot <= 0) {
      setToastMsg('Mohon tentukan jumlah Lot terlebih dahulu');
      setTimeout(() => setToastMsg(null), 2500);
      return;
    }
    if (totalInvestmentWithFee > tradingBalance) {
      setToastMsg('Saldo Trading Balance tidak mencukupi');
      setTimeout(() => setToastMsg(null), 2500);
      return;
    }
    setStep('preview');
  };

  // Confirm order execution
  const handleConfirmOrder = async () => {
    if (!user) return;
    try {
      const userBalanceRef = ref(db, `users/${user.uid}/balance`);
      
      // Deduct balance atomically
      await runTransaction(userBalanceRef, (currentBalance) => {
        if (currentBalance === null) return 0;
        return Math.max(0, currentBalance - totalInvestmentWithFee);
      });

      // Save order
      const ordersRef = ref(db, `users/${user.uid}/orders`);
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
        status: 'FILLED',
        createdAt: serverTimestamp()
      });

      // Save / Update position
      const positionRef = ref(db, `users/${user.uid}/positions/${baseSymbol}`);
      await runTransaction(positionRef, (currentPos) => {
        if (!currentPos) {
          return {
            symbol: baseSymbol,
            stockName: assetName,
            lot: lot,
            avgPrice: price,
            totalCost: totalInvestmentWithFee,
            updatedAt: Date.now()
          };
        } else {
          const newLot = (currentPos.lot || 0) + lot;
          const newTotalCost = (currentPos.totalCost || 0) + totalInvestmentWithFee;
          const oldAvgPrice = currentPos.avgPrice || price;
          const newAvgPrice = Math.round(((oldAvgPrice * (currentPos.lot || 0)) + (price * lot)) / newLot);
          return {
            ...currentPos,
            lot: newLot,
            avgPrice: newAvgPrice,
            totalCost: newTotalCost,
            updatedAt: Date.now()
          };
        }
      });

      // Save transaction log under users/{uid}/transactions
      const txRef = ref(db, `users/${user.uid}/transactions`);
      const newTxRef = push(txRef);
      await set(newTxRef, {
        transactionId: newTxRef.key,
        uid: user.uid,
        userId: user.uid,
        type: 'buy',
        asset: baseSymbol,
        symbol: baseSymbol,
        stockName: assetName,
        lot: lot,
        quantity: lot * sharesPerLot,
        price: price,
        amount: totalInvestmentWithFee,
        total: totalInvestmentWithFee,
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

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#f8fafc] overflow-hidden">
      {/* Toast popup */}
      {toastMsg && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-[150] bg-gray-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg animate-fade-in">
          {toastMsg}
        </div>
      )}

      {/* Main Order Form Screen (Gambar 1) */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-28">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 h-14 bg-white border-b border-gray-100 sticky top-0 z-20">
          <button onClick={onBack} className="p-1 -ml-1 text-gray-700 hover:text-gray-900 transition-colors">
            <ChevronLeft className="w-6 h-6" strokeWidth={1.5} />
          </button>
          
          <div className="flex items-center gap-2">
            <span className="bg-[#f0fdf4] text-[#00B26A] border border-[#00B26A]/30 text-[11px] font-bold px-2.5 py-1 rounded-md">
              Limit Order
            </span>
            <button className="flex items-center gap-1 border border-gray-200 text-gray-700 text-[11px] font-medium px-2.5 py-1 rounded-md bg-white hover:bg-gray-50">
              <span>Order Types</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Asset Header Banner */}
        <div className="bg-white px-4 py-3 border-b border-gray-100 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#00B26A] flex items-center justify-center text-white font-black text-[13px] tracking-tighter shrink-0 overflow-hidden shadow-sm">
                {assetLogo ? (
                  <img src={assetLogo} alt={baseSymbol} className="w-full h-full object-contain p-1 bg-white" />
                ) : (
                  <div className="w-full h-full bg-[#00B26A] flex items-center justify-center text-white font-bold text-[11px]">
                    GP
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-[15px] font-bold text-gray-900">{baseSymbol}</h1>
                  <span className="flex items-center justify-center w-[16px] h-[16px] bg-purple-50 text-[#a855f7] rounded text-[10px] font-bold border border-purple-200">
                    C
                  </span>
                  <span className="flex items-center justify-center px-1 h-[16px] bg-[#f0fdf4] text-[#00B26A] rounded text-[10px] font-bold border border-[#00B26A]">
                    TL
                  </span>
                  <span className="flex items-center justify-center px-1 h-[16px] bg-[#f0fdf4] text-[#00B26A] rounded text-[10px] font-bold border border-[#00B26A]">
                    DBX
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">{assetName}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[17px] font-bold text-gray-900 block leading-tight">
                {price.toLocaleString('en-US')}
              </span>
              <span className={cn(
                "text-[11px] font-medium",
                ticker.changePct >= 0 ? "text-[#00B26A]" : "text-[#e11d48]"
              )}>
                {ticker.changePct >= 0 ? '' : ''}{ticker.changePct.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Order Form Card */}
        <div className="bg-white px-4 py-4 mb-3 border-y border-gray-100 flex flex-col gap-4">
          {/* Leverage Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-[13px] text-gray-600 font-medium">
              <span>Leverage</span>
              <Info className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setLeverage('None')}
                className={cn(
                  "px-3 py-1 rounded-full text-[12px] font-medium border transition-colors",
                  leverage === 'None' 
                    ? "border-[#00B26A] text-[#00B26A] bg-white ring-1 ring-[#00B26A]" 
                    : "border-gray-200 text-gray-500 bg-white"
                )}
              >
                None
              </button>
              <button 
                onClick={() => setLeverage('Trading Limit')}
                className={cn(
                  "px-3 py-1 rounded-full text-[12px] font-medium border transition-colors",
                  leverage === 'Trading Limit' 
                    ? "border-[#00B26A] text-[#00B26A] bg-white ring-1 ring-[#00B26A]" 
                    : "border-gray-200 text-gray-400 bg-white"
                )}
              >
                Trading Limit
              </button>
            </div>
          </div>

          {/* Trading Balance Row */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[13px] text-gray-600 font-medium">Trading Balance</span>
            <span className="text-[14px] font-bold text-gray-900">
              Rp {tradingBalance.toLocaleString('en-US')}
            </span>
          </div>

          {/* Slider Row */}
          <div className="flex items-center gap-3 pt-1">
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={sliderPct} 
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#00B26A]"
            />
            <span className="text-[12px] font-medium text-gray-500 min-w-[32px] text-right">
              {sliderPct}%
            </span>
          </div>

          {/* Investment (Plus Fee) Row */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-[13px] text-gray-600 font-medium block">Investment</span>
              <span className="text-[10px] text-gray-400">(Plus Fee)</span>
            </div>
            <span className="text-[14px] font-bold text-gray-900">
              Rp {totalInvestmentWithFee.toLocaleString('en-US')}
            </span>
          </div>

          {/* Price Stepper Row */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[13px] text-gray-600 font-medium">Price</span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  setPrice(p => Math.max(1, p - 1));
                  setPriceTouched(true);
                }}
                className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg font-bold"
              >
                -
              </button>
              <input 
                type="number" 
                value={price}
                onChange={(e) => {
                  setPrice(Number(e.target.value));
                  setPriceTouched(true);
                }}
                className="w-20 h-8 text-center border border-gray-200 rounded font-bold text-sm text-gray-900 focus:outline-none focus:border-[#00B26A]"
              />
              <button 
                onClick={() => {
                  setPrice(p => p + 1);
                  setPriceTouched(true);
                }}
                className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Lot Stepper Row */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[13px] text-gray-600 font-medium">Lot</span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleLotChange(lot - 1)}
                className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg font-bold"
              >
                -
              </button>
              <input 
                type="number" 
                value={lot}
                onChange={(e) => handleLotChange(Number(e.target.value))}
                className="w-20 h-8 text-center border border-gray-200 rounded font-bold text-sm text-gray-900 focus:outline-none focus:border-[#00B26A]"
              />
              <button 
                onClick={() => handleLotChange(lot + 1)}
                className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Expiry Dropdown Row */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[13px] text-gray-600 font-medium">Expiry</span>
            <button className="flex items-center gap-2 border border-gray-200 rounded px-3 py-1.5 text-[12px] font-medium text-gray-700 bg-white hover:bg-gray-50">
              <span>{expiry}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Stop Loss / Take Profit Card */}
        <div className="bg-white px-4 py-3.5 mb-4 border-y border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[13px] text-gray-700 font-medium">
            <span>Stop Loss/Take Profit</span>
            <Info className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <button 
            onClick={() => setStopLossActive(!stopLossActive)}
            className={cn(
              "w-11 h-6 rounded-full transition-colors relative p-0.5",
              stopLossActive ? "bg-[#00B26A]" : "bg-gray-200"
            )}
          >
            <div className={cn(
              "w-5 h-5 rounded-full bg-white transition-transform shadow-sm",
              stopLossActive ? "translate-x-5" : "translate-x-0"
            )} />
          </button>
        </div>

        {/* Orderbook Header Caption */}
        <div className="text-center text-[11px] text-gray-400 mb-3">
          Click your buying price below
        </div>

        {/* Stats Grid */}
        <div className="bg-white px-4 py-3 border-y border-gray-100 mb-3 text-[12px]">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
            <div className="flex justify-between">
              <span className="text-gray-500">Open</span>
              <span className="font-bold text-[#00B26A]">{ticker.open.toLocaleString('en-US')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Lot</span>
              <span className="font-bold text-gray-800">{ticker.vol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">High</span>
              <span className="font-bold text-[#00B26A]">{ticker.high.toLocaleString('en-US')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Val</span>
              <span className="font-bold text-gray-800">{ticker.val}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Low</span>
              <span className="font-bold text-[#e11d48]">{ticker.low.toLocaleString('en-US')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Avg</span>
              <span className="font-bold text-gray-800">{ticker.avg.toLocaleString('en-US')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">ARA</span>
              <span className="font-bold text-gray-800 flex items-center gap-0.5">{ticker.ara.toLocaleString('en-US')} <ChevronDown className="w-3 h-3 text-gray-400" /></span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">ARB</span>
              <span className="font-bold text-gray-800 flex items-center gap-0.5">{ticker.arb.toLocaleString('en-US')} <ChevronDown className="w-3 h-3 text-gray-400" /></span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">F Buy</span>
              <span className="font-bold text-[#00B26A]">77.60K</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">F Sell</span>
              <span className="font-bold text-[#e11d48]">2.02M</span>
            </div>
          </div>
        </div>

        {/* Order Book Table */}
        <div className="bg-white border-y border-gray-100">
          <div className="grid grid-cols-6 gap-1 px-3 py-2 text-[11px] font-bold text-gray-500 border-b border-gray-100 text-center">
            <div className="text-left">Freq</div>
            <div className="text-right pr-2">Lot</div>
            <div>Bid</div>
            <div>Ask</div>
            <div className="text-left pl-2">Lot</div>
            <div className="text-right">Freq</div>
          </div>

          <div className="divide-y divide-gray-50 text-[11px]">
            {orderBookRows.map((row, idx) => (
              <div key={idx} className="grid grid-cols-6 gap-1 px-3 py-2 text-center items-center">
                <div className="text-left text-[#a855f7] font-medium">{row.freqBid}</div>
                <div className="text-right pr-2 relative">
                  <span className="relative z-10 text-gray-800 font-medium">{row.lotBid}</span>
                </div>
                <button 
                  onClick={() => handleSelectPrice(row.bidPrice)}
                  className="font-bold text-[#e11d48] hover:bg-rose-50 rounded py-0.5 transition-colors"
                >
                  {row.bidPrice}
                </button>
                <button 
                  onClick={() => handleSelectPrice(row.askPrice)}
                  className="font-bold text-[#00B26A] hover:bg-emerald-50 rounded py-0.5 transition-colors"
                >
                  {row.askPrice}
                </button>
                <div className="text-left pl-2 relative">
                  <span className="relative z-10 text-gray-800 font-medium">{row.lotAsk}</span>
                </div>
                <div className="text-right text-[#a855f7] font-medium">{row.freqAsk}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Buy Button (Matching Gambar 1 & Gambar 2 exactly) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-3 z-[110]">
        <button 
          onClick={handleBuyClick}
          className={cn(
            "w-full py-3.5 rounded-lg text-[15px] font-bold transition-all shadow-sm flex items-center justify-center",
            isSufficientBalance 
              ? "bg-[#00B26A] hover:bg-[#00995c] text-white active:scale-[0.99]" 
              : "bg-[#d4f2e3] text-white font-bold hover:bg-[#cbeee0]"
          )}
        >
          Buy
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SCREEN 2: Buy Order Preview Modal Bottom Sheet (Gambar 2) */}
      {/* ========================================================================= */}
      {step === 'preview' && (
        <div className="fixed inset-0 z-[120] flex flex-col justify-end bg-black/50 backdrop-blur-[1px] animate-fade-in">
          <div 
            onClick={() => setStep('form')} 
            className="flex-1"
          />
          <div className="bg-white rounded-t-3xl p-5 w-full max-w-md mx-auto shadow-2xl animate-slide-up">
            {/* Top Grabber Handle */}
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4" />

            {/* Title */}
            <h2 className="text-[16px] font-bold text-gray-900 text-center mb-5">
              Buy Order Preview
            </h2>

            {/* Details Table */}
            <div className="flex flex-col gap-3.5 text-[13px] mb-5">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Stock</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-[#00B26A] flex items-center justify-center text-white text-[9px] font-black overflow-hidden shrink-0">
                    {assetLogo ? (
                      <img src={assetLogo} alt={baseSymbol} className="w-full h-full object-contain p-0.5 bg-white" />
                    ) : (
                      <div className="w-full h-full bg-[#00B26A] flex items-center justify-center text-white font-bold text-[9px]">
                        GP
                      </div>
                    )}
                  </div>
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
                <span className="font-bold text-gray-900">{price.toLocaleString('en-US')}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Lot</span>
                <span className="font-bold text-gray-900">{lot}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Investment</span>
                <span className="font-bold text-gray-900">
                  Rp {rawInvestment.toLocaleString('en-US')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Broker Fee</span>
                <span className="font-bold text-gray-900">
                  Rp {brokerFee.toLocaleString('en-US')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-gray-500 font-medium">
                  <span>Exchange Fee</span>
                  <Info className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <span className="font-bold text-gray-900">
                  Rp {exchangeFee.toLocaleString('en-US')}
                </span>
              </div>
            </div>

            {/* Total Investment Box */}
            <div className="bg-gray-50 rounded-xl p-3.5 flex items-center justify-between mb-5 border border-gray-100">
              <span className="text-[13px] font-bold text-gray-900">Investment (Plus Fee)</span>
              <span className="text-[15px] font-extrabold text-gray-900">
                Rp {totalInvestmentWithFee.toLocaleString('en-US')}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setStep('form')}
                className="py-3 px-4 rounded-xl border border-gray-200 text-[#ef4444] hover:bg-red-50 font-bold text-[14px] transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleConfirmOrder}
                className="py-3 px-4 rounded-xl bg-[#00B26A] hover:bg-[#00995c] text-white font-bold text-[14px] transition-colors shadow-sm"
              >
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 3: Order Success Modal Bottom Sheet (Gambar 3) */}
      {/* ========================================================================= */}
      {step === 'success' && (
        <div className="fixed inset-0 z-[130] flex flex-col justify-end bg-black/50 backdrop-blur-[1px] animate-fade-in">
          <div className="bg-white rounded-t-3xl p-6 w-full max-w-md mx-auto shadow-2xl animate-slide-up flex flex-col items-center">
            {/* Top Grabber Handle */}
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mb-6" />

            {/* Stock Confirmation Card Container */}
            <div className="w-full bg-white border border-gray-100 rounded-2xl p-6 mb-6 text-center relative overflow-hidden shadow-sm">
              {/* Circle Icon */}
              <div className="w-16 h-16 rounded-full bg-[#00B26A] flex items-center justify-center text-white font-black text-xl tracking-tighter mx-auto mb-3 shadow-md overflow-hidden">
                {assetLogo ? (
                  <img src={assetLogo} alt={baseSymbol} className="w-full h-full object-contain p-2 bg-white" />
                ) : (
                  <div className="w-full h-full bg-[#00B26A] flex items-center justify-center text-white font-bold text-lg">
                    GP
                  </div>
                )}
              </div>

              <h2 className="text-[18px] font-bold text-gray-900 mb-0.5">{baseSymbol}</h2>
              <p className="text-[12px] text-gray-400 mb-6">{assetName}</p>

              {/* Dashed Separator Line with side cutouts */}
              <div className="relative my-6 -mx-6">
                <div className="border-b border-dashed border-gray-200 w-full" />
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-r border-gray-200" />
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-l border-gray-200" />
              </div>

              {/* Success Message & Checkmark */}
              <h3 className="text-[15px] font-bold text-gray-900 mb-5">
                Pesanan berhasil dikirim
              </h3>

              <div className="w-16 h-16 bg-[#00B26A] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#00B26A]/20">
                <Check className="w-9 h-9 text-white" strokeWidth={3} />
              </div>

              <button className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#00B26A] hover:underline">
                <Share2 className="w-4 h-4" />
                <span>Share Trade</span>
              </button>
            </div>

            {/* Bottom Stacked Action Buttons */}
            <div className="w-full flex flex-col gap-3">
              <button 
                onClick={() => setStep('form')}
                className="w-full py-3.5 px-4 rounded-xl border border-[#00B26A] text-[#00B26A] bg-white hover:bg-emerald-50 font-bold text-[14px] transition-colors"
              >
                Kembali ke Halaman Order
              </button>

              <button 
                onClick={() => {
                  if (onOrderSuccess) onOrderSuccess();
                  else onBack();
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-[#00B26A] hover:bg-[#00995c] text-white font-bold text-[14px] transition-colors shadow-sm"
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
