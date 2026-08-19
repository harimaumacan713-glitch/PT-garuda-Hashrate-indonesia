import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, RefreshCcw, TrendingUp, TrendingDown, ArrowUpRight, Activity, Search, ChevronDown, Filter } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { ref, onValue, set } from 'firebase/database';
import { BuyOrderPage } from './BuyOrderPage';
import { AssetDetailsPage } from './AssetDetailsPage';
import { PortfolioDetailPage } from './PortfolioDetailPage';
import { DepositPage } from './DepositPage';
import { AssetLogo } from '../components/AssetLogo';
import { MyInvestmentCard } from '../components/MyInvestmentCard';
import { getAssetName } from '../lib/assetsData';
import { detectAssetType, getEngineForSymbol, DEFAULT_USD_TO_IDR, AssetType } from '../engines';

interface PositionItem {
  symbol: string;
  stockName?: string;
  assetType?: AssetType;
  market?: string;
  currency?: string;
  lot?: number | null;
  lotSize?: number | null;
  quantity?: number;
  avgPrice: number;
  totalCost?: number;
  updatedAt?: number;
}

interface OrderItem {
  orderId: string;
  symbol: string;
  stockName?: string;
  assetType?: AssetType;
  market?: string;
  orderType: string;
  price: number;
  lot?: number | null;
  quantity?: number;
  totalCost: number;
  status: string;
  tradingSession?: string;
  createdAt: number;
}

export function PortfolioPage({ onOpenProfile }: { onOpenProfile?: () => void }) {
  const [activeTab, setActiveTab] = useState<'PORTFOLIO' | 'ORDER' | 'HISTORY'>('PORTFOLIO');
  const [assetCategoryFilter, setAssetCategoryFilter] = useState<'ALL' | 'IDX' | 'CRYPTO' | 'US'>('ALL');
  const [showDeposit, setShowDeposit] = useState(false);
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

          Object.entries(quotes).forEach(([sym, q]: [string, any]) => {
            if (q && typeof q.price === 'number') {
              map[sym] = q.price;
              const cleanSym = sym.toUpperCase().replace('USDT', '');
              map[cleanSym] = q.price;
            }
          });

          prevPricesRef.current = { ...prevPricesRef.current, ...map };
          setAssetPrices(prev => ({ ...prev, ...map }));
        }
      } catch (err) {}
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
    const balanceRef = ref(db, `users/${activeUid}/balance`);
    const unsubscribeBal = onValue(balanceRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        setBalance(typeof val === 'number' ? val : Number(val) || 0);
      } else {
        set(balanceRef, 50000000).catch(() => {});
        setBalance(50000000);
      }
    });

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

    const ordersRef = ref(db, `users/${activeUid}/orders`);
    const unsubscribeOrd = onValue(ordersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const rawList = Object.entries(data).map(([key, val]: [string, any]) => ({
          ...val,
          orderId: val.orderId || key
        }));
        const seen = new Set<string>();
        const uniqueOrders: OrderItem[] = [];
        for (const o of rawList) {
          const id = o.orderId || `${o.symbol}-${o.createdAt}`;
          if (!seen.has(id)) {
            seen.add(id);
            uniqueOrders.push(o);
          }
        }
        setOrders(uniqueOrders.reverse()); // most recent first
      } else {
        setOrders([]);
      }
    });

    const txRef = ref(db, `users/${activeUid}/transactions`);
    const unsubscribeTx = onValue(txRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const rawList = Object.entries(data).map(([key, val]: [string, any]) => ({
          ...val,
          transactionId: val.transactionId || key
        }));
        const seen = new Set<string>();
        const uniqueTx: any[] = [];
        for (const tx of rawList) {
          const id = tx.transactionId || tx.id || `${tx.type}-${tx.createdAt}-${tx.amount}`;
          if (!seen.has(id)) {
            seen.add(id);
            uniqueTx.push(tx);
          }
        }
        uniqueTx.sort((a: any, b: any) => (b.timestamp || b.createdAt || 0) - (a.timestamp || a.createdAt || 0));
        setTransactions(uniqueTx);
      } else {
        setTransactions([]);
      }
    });

    return () => {
      unsubscribeBal();
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

  // Decoupled portfolio calculations
  const totalInvested = positions.reduce((sum, p) => {
    const meta = detectAssetType(p.symbol);
    const qty = p.quantity || (p.lot ? p.lot * 100 : 0);
    const costBasis = p.totalCost && p.totalCost > 0 
      ? p.totalCost 
      : (meta.assetType === 'stock_id' ? (p.avgPrice * qty) : (p.avgPrice * qty * DEFAULT_USD_TO_IDR));
    return sum + costBasis;
  }, 0);
  
  const currentMarketValue = positions.reduce((sum, p) => {
    const meta = detectAssetType(p.symbol);
    const cleanSym = p.symbol.toUpperCase().replace('USDT', '');
    const livePrice = assetPrices[p.symbol] ?? assetPrices[cleanSym] ?? assetPrices[`${cleanSym}USDT`] ?? p.avgPrice;
    const qty = p.quantity || (p.lot ? p.lot * 100 : 0);
    
    if (meta.assetType === 'stock_id') {
      return sum + (qty * livePrice);
    } else {
      return sum + (qty * livePrice * DEFAULT_USD_TO_IDR);
    }
  }, 0);

  const virtualPnL = currentMarketValue - totalInvested;
  const pnlPercent = totalInvested > 0 ? (virtualPnL / totalInvested) * 100 : 0;
  const virtualEquity = balance + currentMarketValue;

  // Filter positions by selected engine tab
  const filteredPositions = positions.filter((p) => {
    if (assetCategoryFilter === 'ALL') return true;
    const meta = detectAssetType(p.symbol);
    return meta.market === assetCategoryFilter;
  });

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

  if (showDeposit) {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <DepositPage onBack={() => setShowDeposit(false)} />
      </div>
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
    <div className="flex h-full flex-col bg-white select-none font-sans">
      {/* Header */}
      <header className="flex h-14 items-center justify-between px-4 bg-white sticky top-0 z-10 border-b border-gray-100">
        <button onClick={onOpenProfile} className="h-8 w-8 overflow-hidden rounded-full bg-blue-100 flex items-center justify-center border border-gray-100">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Garuda" alt="Avatar" className="h-full w-full object-cover" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#111827] text-white shadow-xs">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white">
              <path d="M4 16L9 11L14 14L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="19" cy="7" r="2" fill="#00B26A" />
            </svg>
          </div>
          <span className="text-sm font-bold tracking-tight text-gray-900">Portofolio</span>
          <span className="flex items-center gap-1 bg-emerald-50 text-[#00B26A] text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00B26A] animate-ping" />
            LIVE
          </span>
        </div>
        <button 
          onClick={() => setShowBuyPage('ANTM')}
          className="bg-[#00B26A] text-white text-[12px] font-bold px-3 py-1.5 rounded-lg shadow-xs hover:bg-[#00995c] transition-colors cursor-pointer"
        >
          + Beli Aset
        </button>
      </header>

      {/* Main Tabs */}
      <div className="flex px-4 border-b border-gray-100">
        {(['PORTFOLIO', 'ORDER', 'HISTORY'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-3 text-[11px] font-bold tracking-wider relative",
              activeTab === tab ? "text-[#00B26A]" : "text-gray-400"
            )}
          >
            {tab === 'PORTFOLIO' ? 'PORTOFOLIO' : tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-1/2 h-[2.5px] w-full max-w-[60%] -translate-x-1/2 bg-[#00B26A]" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-12">
        {/* Real-time Summary Card */}
        <div className="px-4 py-5 border-b-[6px] border-gray-50 bg-gradient-to-b from-slate-50/50 to-white">
          <div className="grid grid-cols-3 gap-y-4">
            <div 
              onClick={() => setShowDeposit(true)}
              className="flex flex-col cursor-pointer group hover:opacity-80 transition-opacity"
              title="Klik untuk Deposit / Top Up RDN"
            >
              <div className="flex items-center gap-1">
                <span className="text-[14px] font-bold text-gray-900 group-hover:text-[#00AA5B] transition-colors">
                  Rp {balance.toLocaleString('id-ID')}
                </span>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100/60">
                  + Top Up
                </span>
              </div>
              <span className="text-[11px] text-gray-500 mt-0.5">Saldo Kas RDN</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[14px] font-bold text-gray-900">
                Rp {Math.round(totalInvested).toLocaleString('id-ID')}
              </span>
              <span className="text-[11px] text-gray-500 mt-0.5">Total Modal</span>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-[14px] font-bold text-gray-900">
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
                {virtualPnL > 0 ? `+Rp ${Math.round(virtualPnL).toLocaleString('id-ID')}` : virtualPnL < 0 ? `-Rp ${Math.round(Math.abs(virtualPnL)).toLocaleString('id-ID')}` : 'Rp 0'}
              </span>
              <span className="text-[11px] font-semibold text-gray-500 mt-0.5 flex items-center gap-1">
                Total Return (P&amp;L) <Activity className="w-3 h-3 text-[#00B26A]" />
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
              <span className="text-[14px] font-bold text-gray-900">
                Rp {Math.round(virtualEquity).toLocaleString('id-ID')}
              </span>
              <span className="text-[11px] text-gray-500 mt-0.5">Total Ekuitas</span>
            </div>
          </div>
        </div>

        {/* TAB 1: PORTFOLIO LIST */}
        {activeTab === 'PORTFOLIO' && (
          <div>
            {/* Asset Engine Category Filter Pill Bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-gray-100 overflow-x-auto no-scrollbar">
              {[
                { id: 'ALL', label: 'Semua Aset' },
                { id: 'IDX', label: 'Saham IDX' },
                { id: 'CRYPTO', label: 'Crypto (24/7)' },
                { id: 'US', label: 'Saham AS (Wall St)' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setAssetCategoryFilter(f.id as any)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer",
                    assetCategoryFilter === f.id
                      ? "bg-gray-900 text-white shadow-xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {filteredPositions.length > 0 ? (
              <div className="p-4 space-y-3">
                {filteredPositions.map((pos, idx) => {
                  const cleanSym = pos.symbol.toUpperCase().replace('USDT', '');
                  const livePrice = assetPrices[pos.symbol] ?? assetPrices[cleanSym] ?? assetPrices[`${cleanSym}USDT`] ?? pos.avgPrice;
                  return (
                    <MyInvestmentCard
                      key={`pos-${pos.symbol}-${idx}`}
                      symbol={pos.symbol}
                      lot={pos.lot}
                      quantity={pos.quantity}
                      avgPrice={pos.avgPrice}
                      currentPrice={livePrice}
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
                <h3 className="text-[15px] font-bold text-gray-900 mb-1.5">Belum ada aset di kategori ini</h3>
                <p className="text-[13px] text-gray-500">Mulai transaksi dengan Engine terpisah untuk Saham IDX, Crypto, atau Saham AS.</p>
                <div className="flex items-center gap-2 mt-5">
                  <button 
                    onClick={() => setShowBuyPage('ANTM')}
                    className="bg-[#00B26A] hover:bg-[#00995c] text-white text-[12px] font-bold py-2 px-4 rounded-lg shadow-xs transition-colors"
                  >
                    Beli Saham IDX (ANTM)
                  </button>
                  <button 
                    onClick={() => setShowBuyPage('BTC')}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-[12px] font-bold py-2 px-4 rounded-lg shadow-xs transition-colors"
                  >
                    Beli BTC
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ORDER LIST */}
        {activeTab === 'ORDER' && (
          <div className="flex flex-col divide-y divide-gray-100">
            {orders.length > 0 ? (
              orders.map((ord, idx) => {
                const engine = getEngineForSymbol(ord.symbol);
                return (
                  <div key={`ord-${ord.orderId || ord.symbol}-${idx}`} className="p-4 hover:bg-gray-50 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <AssetLogo symbol={ord.symbol} className="w-8 h-8 rounded-full border border-gray-100" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-gray-900">{ord.symbol}</span>
                          <span className={cn(
                            "px-1.5 py-0.2 rounded text-[9px] font-black uppercase",
                            engine.assetType === 'crypto' ? "bg-amber-100 text-amber-800" :
                            engine.assetType === 'stock_us' ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"
                          )}>
                            {engine.market}
                          </span>
                        </div>
                        <p className="text-gray-500 text-[11px] mt-0.5">
                          {engine.formatQuantity(ord.quantity || 0, ord.lot)} @ {engine.formatPrice(ord.price)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="px-2 py-0.5 bg-emerald-50 text-[#00B26A] text-[10px] font-extrabold rounded">
                        {ord.status || 'FILLED'}
                      </span>
                      <p className="text-gray-900 font-bold text-xs mt-1">
                        Rp {Math.round(ord.totalCost).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 text-gray-400 text-xs">
                Belum ada antrian order aktif
              </div>
            )}
          </div>
        )}

        {/* TAB 3: HISTORY */}
        {activeTab === 'HISTORY' && (
          <div className="flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100 bg-white">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Cari riwayat transaksi aset..."
                  className="w-full bg-gray-50/80 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-900 focus:outline-hidden focus:border-[#00B26A]"
                />
              </div>
            </div>

            <div className="flex flex-col divide-y divide-gray-100">
              {transactions.length > 0 ? (
                transactions
                  .filter(tx => {
                    if (!historySearch) return true;
                    const q = historySearch.toLowerCase();
                    return (tx.type || '').toLowerCase().includes(q) || (tx.asset || tx.symbol || '').toLowerCase().includes(q);
                  })
                  .map((tx, idx) => {
                    const isWithdraw = tx.type?.includes('withdraw');
                    const isDeposit = tx.type === 'deposit';
                    const isBuy = tx.type === 'buy' || tx.type === 'BUY';
                    const isSell = tx.type === 'sell' || tx.type === 'SELL';
                    const actionLabel = isWithdraw ? 'WITHDRAW' : isDeposit ? 'DEPOSIT' : isBuy ? 'BUY' : isSell ? 'SELL' : 'TRANSACTION';
                    const amountVal = tx.amount || tx.totalCost || 0;
                    const dateStr = new Date(tx.timestamp || tx.createdAt || Date.now()).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

                    return (
                      <div key={`tx-${tx.transactionId || tx.id || idx}-${idx}`} className="p-4 hover:bg-gray-50 flex items-center justify-between text-xs">
                        <div>
                          <span className={cn(
                            "font-extrabold text-[11px] uppercase tracking-wider block",
                            isDeposit || isSell ? "text-[#00B26A]" : "text-gray-900"
                          )}>
                            {actionLabel} {tx.asset ? `• ${tx.asset}` : ''}
                          </span>
                          <span className="text-gray-400 text-[10.5px] mt-0.5 block">{dateStr}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-gray-900 block">
                            Rp {Math.round(amountVal).toLocaleString('id-ID')}
                          </span>
                          {tx.price && (
                            <span className="text-[10.5px] text-gray-400 font-mono">
                              @ {tx.currency === 'USD' ? `$${Number(tx.price).toFixed(2)}` : `Rp${Math.round(Number(tx.price)).toLocaleString('id-ID')}`}
                            </span>
                          )}
                        </div>
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
      </div>
    </div>
  );
}
