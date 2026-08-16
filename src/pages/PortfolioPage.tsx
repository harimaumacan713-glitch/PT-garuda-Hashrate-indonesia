import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, RefreshCcw, TrendingUp, TrendingDown, ArrowUpRight, Activity, Search, ChevronDown } from 'lucide-react';
import { cn, getEffectiveLivePrice } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { ref, onValue, set } from 'firebase/database';
import { BuyOrderPage } from './BuyOrderPage';
import { AssetDetailsPage } from './AssetDetailsPage';
import { PortfolioDetailPage } from './PortfolioDetailPage';
import { AssetLogo } from '../components/AssetLogo';
import { MyInvestmentCard } from '../components/MyInvestmentCard';
import { getAssetName, isIDXStock } from '../lib/assetsData';

interface PositionItem {
  symbol: string;
  stockName: string;
  lot: number;
  avgPrice: number;
  totalCost: number;
}

interface OrderItem {
  orderId: string;
  symbol: string;
  stockName: string;
  orderType: string;
  price: number;
  lot: number;
  totalCost: number;
  status: string;
  createdAt: number;
}

const assetLogos: Record<string, string> = {
  // CRYPTO
  'BTC': 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
  'BTCUSDT': 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
  'ETH': 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  'ETHUSDT': 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  'BNB': 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
  'BNBUSDT': 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
  'SOL': 'https://cryptologos.cc/logos/solana-sol-logo.png',
  'SOLUSDT': 'https://cryptologos.cc/logos/solana-sol-logo.png',
  'XRP': 'https://cryptologos.cc/logos/xrp-xrp-logo.png',
  'XRPUSDT': 'https://cryptologos.cc/logos/xrp-xrp-logo.png',
  'ADA': 'https://cryptologos.cc/logos/cardano-ada-logo.png',
  'ADAUSDT': 'https://cryptologos.cc/logos/cardano-ada-logo.png',
  'DOGE': 'https://cryptologos.cc/logos/dogecoin-doge-logo.png',
  'DOGEUSDT': 'https://cryptologos.cc/logos/dogecoin-doge-logo.png',
  'AVAX': 'https://cryptologos.cc/logos/avalanche-avax-logo.png',
  'AVAXUSDT': 'https://cryptologos.cc/logos/avalanche-avax-logo.png',
  'MATIC': 'https://cryptologos.cc/logos/polygon-matic-logo.png',
  'MATICUSDT': 'https://cryptologos.cc/logos/polygon-matic-logo.png',
  'LINK': 'https://cryptologos.cc/logos/chainlink-link-logo.png',
  'LINKUSDT': 'https://cryptologos.cc/logos/chainlink-link-logo.png',
  'DOT': 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png',
  'DOTUSDT': 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png',
  'NEAR': 'https://cryptologos.cc/logos/near-protocol-near-logo.png',
  'NEARUSDT': 'https://cryptologos.cc/logos/near-protocol-near-logo.png',
  'SUI': 'https://cryptologos.cc/logos/sui-sui-logo.png',
  'SUIUSDT': 'https://cryptologos.cc/logos/sui-sui-logo.png',
  'PEPE': 'https://cryptologos.cc/logos/pepe-pepe-logo.png',
  'PEPEUSDT': 'https://cryptologos.cc/logos/pepe-pepe-logo.png',
  'SHIB': 'https://cryptologos.cc/logos/shiba-inu-shib-logo.png',
  'SHIBUSDT': 'https://cryptologos.cc/logos/shiba-inu-shib-logo.png',
  'ATOM': 'https://cryptologos.cc/logos/cosmos-atom-logo.png',
  'ATOMUSDT': 'https://cryptologos.cc/logos/cosmos-atom-logo.png',
  'TON': 'https://cryptologos.cc/logos/toncoin-ton-logo.png',
  'TONUSDT': 'https://cryptologos.cc/logos/toncoin-ton-logo.png',
  'LTC': 'https://cryptologos.cc/logos/litecoin-ltc-logo.png',
  'LTCUSDT': 'https://cryptologos.cc/logos/litecoin-ltc-logo.png',
  'UNI': 'https://cryptologos.cc/logos/uniswap-uni-logo.png',
  'UNIUSDT': 'https://cryptologos.cc/logos/uniswap-uni-logo.png',
  'ARB': 'https://cryptologos.cc/logos/arbitrum-arb-logo.png',
  'ARBUSDT': 'https://cryptologos.cc/logos/arbitrum-arb-logo.png',
  'OP': 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.png',
  'OPUSDT': 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.png',
  'RENDER': 'https://cryptologos.cc/logos/render-token-rndr-logo.png',
  'RENDERUSDT': 'https://cryptologos.cc/logos/render-token-rndr-logo.png',
  'FET': 'https://cryptologos.cc/logos/artificial-superintelligence-alliance-fet-logo.png',
  'FETUSDT': 'https://cryptologos.cc/logos/artificial-superintelligence-alliance-fet-logo.png',
  'INJ': 'https://cryptologos.cc/logos/injective-inj-logo.png',
  'INJUSDT': 'https://cryptologos.cc/logos/injective-inj-logo.png',

  // SAHAM GLOBAL
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
  'JPM': 'https://upload.wikimedia.org/wikipedia/commons/f/f8/JPMorgan_Chase_Logo.svg',
  'V': 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg',
  'MA': 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg',
  'WMT': 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Walmart_logo.svg',
  'DIS': 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Walt_Disney_Company_logo.svg',
  'KO': 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Coca-Cola_logo.svg',
  'PEP': 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_de_PepsiCo.svg',

  // KOMODITAS & FOREX
  'GOLD': 'https://cdn-icons-png.flaticon.com/512/2822/2822831.png',
  'SILVER': 'https://cdn-icons-png.flaticon.com/512/2822/2822842.png',
  'SPX': 'https://upload.wikimedia.org/wikipedia/commons/1/18/S%26P_500_logo.svg',
  'NDX': 'https://upload.wikimedia.org/wikipedia/commons/8/87/Nasdaq_Logo.svg',
  'EURUSD': 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Euro_symbol.svg',

  'LABA': 'https://cdn-icons-png.flaticon.com/512/2910/2910313.png',
};

export function PortfolioPage({ onOpenProfile }: { onOpenProfile?: () => void }) {
  const [activeTab, setActiveTab] = useState<'PORTFOLIO' | 'ORDER' | 'HISTORY'>('PORTFOLIO');
  const { user } = useAuth();
  const activeUid = user?.uid || 'demo_user';
  const [balance, setBalance] = useState<number>(0);
  const [positions, setPositions] = useState<PositionItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'REALIZED'>('ALL');
  const [historySearch, setHistorySearch] = useState('');
  const [showBuyPage, setShowBuyPage] = useState<string | null>(null);
  const [selectedPortfolioAsset, setSelectedPortfolioAsset] = useState<string | null>(null);

  // Live price state from Firebase assetPrices and live stream
  const [assetPrices, setAssetPrices] = useState<Record<string, number>>({});
  const [priceFlash, setPriceFlash] = useState<Record<string, 'up' | 'down'>>({});
  const prevPricesRef = useRef<Record<string, number>>({});

  // 1. Initial & Continuous Global Quote Polling (/api/quotes) for all stocks, forex, crypto
  useEffect(() => {
    let isMounted = true;
    const fetchGlobalQuotes = async () => {
      try {
        const res = await fetch('/api/quotes');
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.success && data.quotes && isMounted) {
          const quotes = data.quotes;
          const map: Record<string, number> = {};
          const flashes: Record<string, 'up' | 'down'> = {};

          Object.entries(quotes).forEach(([sym, q]: [string, any]) => {
            if (q && typeof q.price === 'number') {
              map[sym] = q.price;
              const cleanSym = sym.toUpperCase().replace('USDT', '');
              map[cleanSym] = q.price;

              const prevP = prevPricesRef.current[sym] || prevPricesRef.current[cleanSym];
              if (prevP && prevP !== q.price) {
                flashes[sym] = q.price > prevP ? 'up' : 'down';
                flashes[cleanSym] = flashes[sym];
              }
            }
          });

          prevPricesRef.current = { ...prevPricesRef.current, ...map };
          setAssetPrices(prev => ({ ...prev, ...map }));
          
          if (Object.keys(flashes).length > 0) {
            setPriceFlash(prev => ({ ...prev, ...flashes }));
            setTimeout(() => {
              if (isMounted) setPriceFlash({});
            }, 600);
          }
        }
      } catch (err) {
        console.warn('Portfolio quotes fetch error:', err);
      }
    };

    fetchGlobalQuotes();
    const interval = setInterval(fetchGlobalQuotes, 1500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // 2. Realtime balance, positions, orders & transactions listener from Firebase
  useEffect(() => {
    // 1. Balance Listener
    const balanceRef = ref(db, `users/${activeUid}/balance`);
    const unsubscribeBal = onValue(balanceRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        setBalance(typeof val === 'number' ? val : Number(val) || 0);
      } else {
        const initialBalance = 0;
        set(balanceRef, initialBalance).catch(console.error);
        setBalance(initialBalance);
      }
    });

    // 2. Asset Prices (Single Source of Truth from Firebase)
    const pricesRef = ref(db, 'assetPrices');
    const unsubscribePrices = onValue(pricesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const pricesMap: Record<string, number> = {};
        Object.entries(data).forEach(([sym, val]: [string, any]) => {
          const p = typeof val === 'object' ? val.price : Number(val);
          pricesMap[sym] = p;
          pricesMap[sym.toUpperCase().replace('USDT', '')] = p;
        });
        setAssetPrices(prev => ({ ...prev, ...pricesMap }));
      }
    });

    // 3. Positions
    const positionsRef = ref(db, `users/${activeUid}/positions`);
    const unsubscribePos = onValue(positionsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list: PositionItem[] = Object.values(data);
        setPositions(list);
      } else {
        setPositions([]);
      }
    });

    // 4. Orders
    const ordersRef = ref(db, `users/${activeUid}/orders`);
    const unsubscribeOrd = onValue(ordersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list: OrderItem[] = Object.values(data);
        setOrders(list.reverse()); // most recent first
      } else {
        setOrders([]);
      }
    });

    // 5. Transactions History
    const txRef = ref(db, `users/${activeUid}/transactions`);
    const unsubscribeTx = onValue(txRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.values(data).sort((a: any, b: any) => (b.timestamp || b.createdAt || 0) - (a.timestamp || a.createdAt || 0));
        setTransactions(list);
      } else {
        setTransactions([]);
      }
    });

    return () => {
      unsubscribeBal();
      unsubscribePrices();
      unsubscribePos();
      unsubscribeOrd();
      unsubscribeTx();
    };
  }, [activeUid]);

  // 3. Real-time Binance WebSocket for live price ticks on crypto positions
  useEffect(() => {
    const defaultCryptos = ['btc', 'eth', 'sol', 'bnb', 'xrp', 'ada', 'doge', 'avax', 'link', 'dot', 'near', 'sui', 'pepe', 'shib', 'ton', 'ltc', 'uni'];
    const positionCryptos = positions
      .map(p => p.symbol.toLowerCase().replace('usdt', ''))
      .filter(s => !['bbca', 'bbri', 'tlkm', 'asii', 'goto', 'bmri', 'antm', 'nvda', 'aapl', 'tsla', 'gold'].includes(s));

    const cryptoSymbols = Array.from(new Set([...defaultCryptos, ...positionCryptos]));
    const streams = cryptoSymbols.map(s => `${s}usdt@ticker`).join('/');

    let ws: WebSocket | null = null;
    let retryTimeout: any = null;

    const connect = () => {
      try {
        ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data && data.s && data.c) {
              const sym = data.s.replace('USDT', '');
              const liveBinancePrice = parseFloat(data.c);

              const prevP = prevPricesRef.current[sym];
              if (prevP && Math.abs(prevP - liveBinancePrice) > 0.0001) {
                const dir = liveBinancePrice > prevP ? 'up' : 'down';
                setPriceFlash(prev => ({ ...prev, [sym]: dir, [data.s]: dir }));
                setTimeout(() => {
                  setPriceFlash(prev => {
                    const next = { ...prev };
                    delete next[sym];
                    delete next[data.s];
                    return next;
                  });
                }, 500);
              }

              prevPricesRef.current[sym] = liveBinancePrice;
              prevPricesRef.current[data.s] = liveBinancePrice;

              setAssetPrices(prev => ({
                ...prev,
                [sym]: liveBinancePrice,
                [`${sym}USDT`]: liveBinancePrice,
                [data.s]: liveBinancePrice
              }));
            }
          } catch (e) {}
        };
        ws.onclose = () => {
          retryTimeout = setTimeout(connect, 3000);
        };
      } catch (e) {
        retryTimeout = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
      if (ws) ws.close();
    };
  }, [positions]);

  // Summary calculations using exact formulas:
  // costBasis = averagePrice * totalShares
  // marketValue = currentPrice * totalShares
  // unrealizedPnL = marketValue - costBasis
  // returnPercent = (unrealizedPnL / costBasis) * 100
  const isAssetIdr = (sym: string) => isIDXStock(sym) || ['BBCA', 'BBRI', 'BMRI', 'BBNI', 'TLKM', 'ASII', 'GOTO', 'BREN', 'AMMN', 'ANTM', 'ICBP', 'ADRO', 'PTBA', 'UNVR', 'KLBF', 'LABA', 'TAPGHDCH6A'].includes(sym.toUpperCase().replace('USDT', ''));

  const totalInvested = positions.reduce((sum, p) => {
    const isIdr = isAssetIdr(p.symbol);
    const totalShares = (p.lot || 0) * (isIdr ? 100 : 1);
    const costBasis = p.totalCost && p.totalCost > 0 ? p.totalCost : (p.avgPrice || 0) * totalShares;
    return sum + costBasis;
  }, 0);
  
  const currentMarketValue = positions.reduce((sum, p) => {
    const isIdr = isAssetIdr(p.symbol);
    const totalShares = (p.lot || 0) * (isIdr ? 100 : 1);
    const cleanSym = p.symbol.toUpperCase().replace('USDT', '');
    const livePrice = assetPrices[p.symbol] ?? assetPrices[cleanSym] ?? assetPrices[`${cleanSym}USDT`];
    const currentPrice = livePrice && livePrice > 0 ? livePrice : (p.avgPrice || 0);
    const marketValue = totalShares * currentPrice;
    return sum + marketValue;
  }, 0);

  const virtualPnL = currentMarketValue - totalInvested;
  const pnlPercent = totalInvested > 0 ? (virtualPnL / totalInvested) * 100 : 0;
  const virtualEquity = balance + currentMarketValue;

  if (selectedPortfolioAsset) {
    return (
      <PortfolioDetailPage
        symbol={selectedPortfolioAsset}
        onBack={() => setSelectedPortfolioAsset(null)}
        onSellSuccess={() => setSelectedPortfolioAsset(null)}
        onOpenAssetDetail={(sym) => {
          setSelectedPortfolioAsset(null);
          setShowBuyPage(sym);
        }}
      />
    );
  }

  if (showBuyPage) {
    return (
      <AssetDetailsPage 
        symbol={showBuyPage} 
        onBack={() => setShowBuyPage(null)} 
      />
    );
  }

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <header className="flex h-14 items-center justify-between px-4 bg-white sticky top-0 z-10 border-b border-gray-100">
        <button onClick={onOpenProfile} className="h-8 w-8 overflow-hidden rounded-full bg-blue-100 flex items-center justify-center border border-gray-100">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Garuda" alt="Avatar" className="h-full w-full object-cover" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#111827] text-white shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white">
              <path d="M4 16L9 11L14 14L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="19" cy="7" r="2" fill="#00B26A" />
            </svg>
          </div>
          <span className="text-sm font-bold tracking-tight text-secondary">Portofolio</span>
          <span className="flex items-center gap-1 bg-emerald-50 text-[#00B26A] text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00B26A] animate-ping" />
            LIVE
          </span>
        </div>
        <button 
          onClick={() => setShowBuyPage('BTCUSDT')}
          className="bg-[#00B26A] text-white text-[12px] font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-[#00995c] transition-colors"
        >
          + Beli Aset
        </button>
      </header>

      {/* Tabs */}
      <div className="flex px-4 border-b border-gray-100">
        {(['PORTFOLIO', 'ORDER', 'HISTORY'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-3 text-[11px] font-bold tracking-wider relative",
              activeTab === tab ? "text-primary" : "text-gray-400"
            )}
          >
            {tab === 'PORTFOLIO' ? 'STOCKS' : tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-1/2 h-[2.5px] w-full max-w-[60%] -translate-x-1/2 bg-primary" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
        {/* Real-time Summary Card */}
        <div className="px-4 py-5 border-b-[6px] border-gray-50 bg-gradient-to-b from-slate-50/50 to-white">
          <div className="grid grid-cols-3 gap-y-5">
            <div className="flex flex-col">
              <span className="text-[14px] font-bold text-secondary">
                Rp {balance.toLocaleString('id-ID')}
              </span>
              <span className="text-[11px] text-gray-500 mt-0.5">Saldo Kas</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[14px] font-bold text-secondary">
                Rp {totalInvested.toLocaleString('id-ID')}
              </span>
              <span className="text-[11px] text-gray-500 mt-0.5">Total Modal</span>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-[14px] font-bold text-secondary">
                {positions.length}
              </span>
              <span className="text-[11px] text-gray-500 mt-0.5">Open Positions</span>
            </div>

            {/* Live Realtime P&L Highlight Box */}
            <div className="flex flex-col">
              <span className={cn(
                "text-[15px] font-extrabold transition-colors duration-300 flex items-center gap-1",
                virtualPnL > 0 ? "text-[#00B26A]" : virtualPnL < 0 ? "text-[#e11d48]" : "text-gray-400"
              )}>
                {virtualPnL > 0 ? `+Rp ${virtualPnL.toLocaleString('id-ID')}` : virtualPnL < 0 ? `-Rp ${Math.abs(virtualPnL).toLocaleString('id-ID')}` : 'Rp 0'}
              </span>
              <span className="text-[11px] font-semibold text-gray-500 mt-0.5 flex items-center gap-1">
                Total P&L <Activity className="w-3 h-3 text-[#00B26A]" />
              </span>
            </div>

            <div className="flex flex-col items-center">
              <span className={cn(
                "text-[15px] font-extrabold transition-colors duration-300",
                pnlPercent > 0 ? "text-[#00B26A]" : pnlPercent < 0 ? "text-[#e11d48]" : "text-gray-400"
              )}>
                {pnlPercent > 0 ? `+${pnlPercent.toFixed(2)}%` : `${pnlPercent.toFixed(2)}%`}
              </span>
              <span className="text-[11px] text-gray-500 mt-0.5">Return (%)</span>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-[14px] font-bold text-secondary">
                Rp {virtualEquity.toLocaleString('id-ID')}
              </span>
              <span className="text-[11px] text-gray-500 mt-0.5">Total Ekuitas</span>
            </div>
          </div>
        </div>

        {/* TAB 1: PORTFOLIO LIST */}
        {activeTab === 'PORTFOLIO' && (
          <div>
            {positions.length > 0 ? (
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between text-[12px] text-gray-400 font-medium px-1">
                  <span>Aset Dimiliki ({positions.length})</span>
                  <span>Nilai Pasar & P&L Live</span>
                </div>

                {positions.map((pos) => {
                  const cleanSym = pos.symbol.toUpperCase().replace('USDT', '');
                  const liveP = assetPrices[pos.symbol] ?? assetPrices[cleanSym];
                  const currentPrice = liveP && liveP > 0 ? liveP : (pos.avgPrice || 0);

                  return (
                    <MyInvestmentCard
                      key={pos.symbol}
                      symbol={pos.symbol}
                      lot={pos.lot}
                      avgPrice={pos.avgPrice}
                      currentPrice={currentPrice}
                      totalCost={pos.totalCost}
                      onClick={() => setSelectedPortfolioAsset(pos.symbol)}
                    />
                  );
                })}
              </div>
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-8 h-8 text-gray-300" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <h3 className="text-[15px] font-bold text-gray-900 mb-1.5">Belum ada aset</h3>
                <p className="text-[13px] text-gray-500">Mulai investasi pertamamu dan pantau perkembangannya secara live di sini.</p>
                <button 
                  onClick={() => setShowBuyPage('BTCUSDT')}
                  className="mt-6 bg-[#00B26A] hover:bg-[#00995c] text-white text-[13px] font-bold py-2.5 px-6 rounded-lg shadow-sm transition-colors"
                >
                  Beli BTC Sekarang
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: HISTORY */}
        {activeTab === 'HISTORY' && (
          <div className="flex flex-col">
            {/* Filter bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setHistoryFilter('ALL')}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                    historyFilter === 'ALL' 
                      ? "border border-[#00B26A] text-[#00B26A] bg-emerald-50/40" 
                      : "border border-gray-200 text-gray-600 bg-white"
                  )}
                >
                  All
                </button>
                <button 
                  onClick={() => setHistoryFilter('REALIZED')}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                    historyFilter === 'REALIZED' 
                      ? "border border-[#00B26A] text-[#00B26A] bg-emerald-50/40" 
                      : "border border-gray-200 text-gray-600 bg-white"
                  )}
                >
                  Realized
                </button>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-gray-700 cursor-pointer hover:text-primary">
                <span>Last 3 Months</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Search Input */}
            <div className="px-4 py-3 border-b border-gray-100 bg-white">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Search by stock or action"
                  className="w-full bg-gray-50/80 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#00B26A]"
                />
              </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-4 px-4 py-2.5 text-[11px] font-bold text-gray-400 border-b border-gray-100 bg-gray-50/50">
              <span>ACTION</span>
              <span className="text-right">AMOUNT</span>
              <span className="text-right">PRICE</span>
              <span className="text-right">DATE</span>
            </div>

            {/* Month Group Header */}
            <div className="px-4 py-2 text-[11px] font-bold text-gray-500 bg-gray-50/80 border-b border-gray-100">
              Aug 2026
            </div>

            {/* Transactions List */}
            <div className="flex flex-col">
              {transactions.length > 0 ? (
                transactions
                  .filter(tx => {
                    if (!historySearch) return true;
                    const q = historySearch.toLowerCase();
                    const type = (tx.type || '').toLowerCase();
                    const asset = (tx.asset || tx.symbol || '').toLowerCase();
                    return type.includes(q) || asset.includes(q);
                  })
                  .map((tx, idx) => {
                    const isWithdraw = tx.type?.includes('withdraw');
                    const isDeposit = tx.type === 'deposit';
                    const isBuy = tx.type === 'buy';
                    const actionLabel = isWithdraw ? 'WITHDRAW' : isDeposit ? 'DEPOSIT' : isBuy ? 'BUY' : (tx.type || 'TRANSACTION').toUpperCase();
                    const amountVal = tx.amount || tx.totalCost || 0;
                    const priceVal = tx.price ? `Rp ${Number(tx.price).toLocaleString('en-US')}` : '-';
                    const dateStr = new Date(tx.timestamp || tx.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

                    return (
                      <div key={tx.transactionId || idx} className="grid grid-cols-4 items-center px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50/50 transition-colors text-xs">
                        <span className={cn(
                          "font-bold uppercase tracking-wide",
                          isWithdraw ? "text-blue-600" : isDeposit ? "text-[#00B26A]" : "text-gray-900"
                        )}>
                          {actionLabel}
                        </span>
                        <span className="text-right font-bold text-gray-900">
                          {amountVal.toLocaleString('en-US')}
                        </span>
                        <span className="text-right text-gray-500 font-mono">
                          {priceVal}
                        </span>
                        <span className="text-right text-gray-500 text-[11px]">
                          {dateStr}
                        </span>
                      </div>
                    );
                  })
              ) : (
                <div className="text-center py-16 text-gray-400 text-xs">
                  Belum ada riwayat transaksi
                </div>
              )}
            </div>
          </div>
        )}

        <div className="border-t border-gray-100 mt-4"></div>

        {/* Switch to Real */}
        <div className="px-4 py-6 flex justify-center">
          <button className="flex items-center gap-2 rounded border border-gray-200 px-6 py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-50 shadow-sm">
            <RefreshCcw className="h-4 w-4" strokeWidth={1.5} />
            Switch to Real
          </button>
        </div>
      </div>
    </div>
  );
}
