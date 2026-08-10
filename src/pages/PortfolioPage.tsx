import React, { useState, useEffect } from 'react';
import { ChevronRight, RefreshCcw, TrendingUp, TrendingDown, ArrowUpRight, Activity } from 'lucide-react';
import { cn, getEffectiveLivePrice } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { ref, onValue, set } from 'firebase/database';
import { BuyOrderPage } from './BuyOrderPage';
import { AssetDetailsPage } from './AssetDetailsPage';

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

  // KOMODITAS & FOREX
  'GOLD': 'https://cdn-icons-png.flaticon.com/512/2822/2822831.png',
  'SILVER': 'https://cdn-icons-png.flaticon.com/512/2822/2822842.png',
  'SPX': 'https://upload.wikimedia.org/wikipedia/commons/1/18/S%26P_500_logo.svg',
  'NDX': 'https://upload.wikimedia.org/wikipedia/commons/8/87/Nasdaq_Logo.svg',
  'EURUSD': 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Euro_symbol.svg',

  'LABA': 'https://cdn-icons-png.flaticon.com/512/2910/2910313.png',
};

export function PortfolioPage({ onOpenProfile }: { onOpenProfile?: () => void }) {
  const [activeTab, setActiveTab] = useState<'PORTFOLIO' | 'ORDER'>('PORTFOLIO');
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [positions, setPositions] = useState<PositionItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [showBuyPage, setShowBuyPage] = useState<string | null>(null);

  // Live price state from Firebase assetPrices
  const [assetPrices, setAssetPrices] = useState<Record<string, number>>({});
  // Price direction for visual tick flash: 'up' | 'down' | null
  const [flashState, setFlashState] = useState<Record<string, 'up' | 'down' | null>>({});

  // Realtime balance, positions & asset prices listener
  useEffect(() => {
    if (user) {
      // Balance
      const balanceRef = ref(db, `users/${user.uid}/balance`);
      const unsubscribeBal = onValue(balanceRef, (snapshot) => {
        if (snapshot.exists()) {
          setBalance(snapshot.val());
        } else {
          const initialBalance = 10000000;
          set(balanceRef, initialBalance).catch(console.error);
        }
      });

      // Asset Prices (Single Source of Truth)
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
          setAssetPrices(pricesMap);
        }
      });

      // Positions
      const positionsRef = ref(db, `users/${user.uid}/positions`);
      const unsubscribePos = onValue(positionsRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list: PositionItem[] = Object.values(data);
          setPositions(list);
        } else {
          setPositions([]);
        }
      });

      // Orders
      const ordersRef = ref(db, `users/${user.uid}/orders`);
      const unsubscribeOrd = onValue(ordersRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list: OrderItem[] = Object.values(data);
          setOrders(list.reverse()); // most recent first
        } else {
          setOrders([]);
        }
      });

      return () => {
        unsubscribeBal();
        unsubscribePrices();
        unsubscribePos();
        unsubscribeOrd();
      };
    }
  }, [user]);

  // Real-time market tick engine: updates prices and syncs to Firebase assetPrices
  useEffect(() => {
    if (positions.length === 0) return;

    const interval = setInterval(() => {
      const newFlash: Record<string, 'up' | 'down' | null> = {};

      positions.forEach(pos => {
        const cleanSymbol = pos.symbol.toUpperCase().replace('USDT', '');
        const currentP = assetPrices[pos.symbol] ?? assetPrices[cleanSymbol] ?? pos.avgPrice ?? 97;
        
        let delta = 0;
        if (currentP > 500) {
          delta = (Math.random() - 0.48) * (currentP * 0.0015);
        } else {
          const roll = Math.random();
          if (roll > 0.65) delta = 1;
          else if (roll < 0.35) delta = -1;
          else delta = 0;
        }

        const newP = Math.max(1, Math.round((currentP + delta) * 100) / 100);

        if (newP > currentP) {
          newFlash[pos.symbol] = 'up';
        } else if (newP < currentP) {
          newFlash[pos.symbol] = 'down';
        } else {
          newFlash[pos.symbol] = null;
        }

        // Write to Firebase assetPrices single source of truth
        set(ref(db, `assetPrices/${cleanSymbol}`), {
          symbol: cleanSymbol,
          price: newP,
          updatedAt: Date.now()
        }).catch(() => {});
      });

      setFlashState(newFlash);
      setTimeout(() => setFlashState({}), 800);

    }, 1500);

    return () => clearInterval(interval);
  }, [positions, assetPrices]);

  // Real-time Binance WebSocket hook for major crypto positions
  useEffect(() => {
    const cryptoSymbols = positions
      .map(p => p.symbol)
      .filter(s => ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE'].includes(s) || s.endsWith('USDT'));

    if (cryptoSymbols.length === 0) return;

    const streams = cryptoSymbols.map(s => {
      const raw = s.endsWith('USDT') ? s.toLowerCase() : `${s.toLowerCase()}usdt`;
      return `${raw}@ticker`;
    }).join('/');

    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.s && data.c) {
            const sym = data.s.replace('USDT', '');
            const liveBinancePrice = parseFloat(data.c);

            // Sync to Firebase assetPrices
            set(ref(db, `assetPrices/${sym}`), {
              symbol: sym,
              price: liveBinancePrice,
              updatedAt: Date.now()
            }).catch(() => {});
          }
        } catch (e) {}
      };
    } catch (e) {}

    return () => {
      if (ws) ws.close();
    };
  }, [positions]);

  // Summary calculations using exact formulas:
  // costBasis = averagePrice * totalShares
  // marketValue = currentPrice * totalShares
  // unrealizedPnL = marketValue - costBasis
  // returnPercent = (unrealizedPnL / costBasis) * 100
  const totalInvested = positions.reduce((sum, p) => {
    const totalShares = (p.lot || 0) * 100;
    const costBasis = (p.avgPrice || 0) * totalShares;
    return sum + costBasis;
  }, 0);
  
  const currentMarketValue = positions.reduce((sum, p) => {
    const totalShares = (p.lot || 0) * 100;
    const cleanSym = p.symbol.toUpperCase().replace('USDT', '');
    const currentPrice = assetPrices[p.symbol] ?? assetPrices[cleanSym] ?? p.avgPrice ?? 97;
    const marketValue = totalShares * currentPrice;
    return sum + marketValue;
  }, 0);

  const virtualPnL = currentMarketValue - totalInvested;
  const pnlPercent = totalInvested > 0 ? (virtualPnL / totalInvested) * 100 : 0;
  const virtualEquity = balance + currentMarketValue;

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
          <span className="text-[17px] font-bold tracking-tight text-secondary">Portofolio</span>
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
        {(['PORTFOLIO', 'ORDER'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-3 text-[11px] font-bold tracking-wider relative",
              activeTab === tab ? "text-primary" : "text-gray-400"
            )}
          >
            {tab}
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
                Rp {balance.toLocaleString('en-US')}
              </span>
              <span className="text-[11px] text-gray-500 mt-0.5">Saldo Kas</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[14px] font-bold text-secondary">
                Rp {totalInvested.toLocaleString('en-US')}
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
                {virtualPnL > 0 ? `+Rp ${virtualPnL.toLocaleString('en-US')}` : virtualPnL < 0 ? `-Rp ${Math.abs(virtualPnL).toLocaleString('en-US')}` : 'Rp 0'}
              </span>
              <span className="text-[11px] font-semibold text-gray-500 mt-0.5 flex items-center gap-1">
                Total P&L <Activity className="w-3 h-3 text-[#00B26A] animate-pulse" />
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
                Rp {virtualEquity.toLocaleString('en-US')}
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
                  const currentPrice = assetPrices[pos.symbol] ?? assetPrices[cleanSym] ?? pos.avgPrice ?? 97;
                  const shares = pos.lot * 100;
                  const costBasis = (pos.avgPrice || 0) * shares;
                  const currentVal = shares * currentPrice;
                  const pnlVal = currentVal - costBasis;
                  const pnlPct = costBasis > 0 ? (pnlVal / costBasis) * 100 : 0;
                  const isUp = pnlVal >= 0;
                  const flash = flashState[pos.symbol];
                  const logoUrl = assetLogos[pos.symbol] || assetLogos[pos.symbol.replace('USDT', '')];

                  return (
                    <div 
                      key={pos.symbol}
                      onClick={() => setShowBuyPage(pos.symbol)}
                      className={cn(
                        "bg-white border rounded-xl p-4 shadow-sm transition-all duration-300 cursor-pointer flex items-center justify-between relative overflow-hidden",
                        flash === 'up' && "bg-emerald-50/60 border-[#00B26A]",
                        flash === 'down' && "bg-rose-50/60 border-rose-400",
                        !flash && "border-gray-100 hover:border-[#00B26A]"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 shadow-sm overflow-hidden p-1.5">
                          {logoUrl ? (
                            <img 
                              src={logoUrl} 
                              alt={pos.symbol} 
                              className="w-full h-full object-contain" 
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span className="font-black text-xs text-gray-700">{pos.symbol.substring(0, 3)}</span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-[15px] font-bold text-gray-900">{pos.symbol}</h4>
                            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                              {pos.lot} Lot ({shares.toLocaleString('en-US')} Lembar)
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400">{pos.stockName}</p>
                          <p className="text-[11px] text-gray-500 mt-1">
                            Beli Avg: <span className="font-bold text-gray-700">Rp {pos.avgPrice.toLocaleString('en-US')}</span> | Live: <span className={cn(
                              "font-extrabold transition-colors duration-200",
                              flash === 'up' ? "text-[#00B26A]" : flash === 'down' ? "text-[#e11d48]" : "text-gray-900"
                            )}>Rp {currentPrice.toLocaleString('en-US')}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-[14px] font-bold text-gray-900">
                          Rp {currentVal.toLocaleString('en-US')}
                        </p>
                        <div className={cn(
                          "inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-md mt-1 transition-all duration-300",
                          isUp ? "bg-emerald-50 text-[#00B26A]" : "bg-rose-50 text-[#e11d48]"
                        )}>
                          {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          <span>{isUp ? '+' : ''}{pnlVal.toLocaleString('en-US')} ({pnlPct.toFixed(2)}%)</span>
                        </div>
                      </div>
                    </div>
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

        {/* TAB 2: ORDERS HISTORY */}
        {activeTab === 'ORDER' && (
          <div className="p-4">
            {orders.length > 0 ? (
              <div className="flex flex-col gap-3">
                {orders.map((ord) => {
                  const logoUrl = assetLogos[ord.symbol] || assetLogos[ord.symbol.replace('USDT', '')];
                  return (
                    <div key={ord.orderId} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 shadow-sm overflow-hidden p-1">
                            {logoUrl ? (
                              <img src={logoUrl} alt={ord.symbol} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                            ) : (
                              <span className="font-bold text-[10px] text-gray-700">{ord.symbol.substring(0, 3)}</span>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 text-sm block">{ord.symbol}</span>
                            <span className="text-[10px] text-gray-400">{ord.stockName}</span>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-[#00B26A] ml-1">
                            BUY
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-[#00B26A] bg-emerald-50 px-2 py-0.5 rounded-full">
                          {ord.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[12px] text-gray-600 mt-2">
                        <div>Harga: <span className="font-bold text-gray-900">Rp {ord.price?.toLocaleString('en-US')}</span></div>
                        <div>Lot: <span className="font-bold text-gray-900">{ord.lot}</span></div>
                        <div>Total: <span className="font-bold text-gray-900">Rp {ord.totalCost?.toLocaleString('en-US')}</span></div>
                        <div className="text-gray-400 text-[10px]">
                          {new Date(ord.createdAt || Date.now()).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400 text-sm">
                Belum ada riwayat order
              </div>
            )}
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
