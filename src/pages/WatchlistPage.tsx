import React, { useState, useEffect } from 'react';
import { FileText, MoreHorizontal, ChevronDown, Plus, Star, ArrowUpRight, ArrowDownRight, Search } from 'lucide-react';
import { cn } from '../lib/utils';
import { ALL_GLOBAL_ASSETS, isIDXStock } from '../lib/assetsData';
import { AssetLogo } from '../components/AssetLogo';
import { AssetDetailsPage } from './AssetDetailsPage';
import { db } from '../lib/firebase';
import { ref, onValue, set } from 'firebase/database';

export function WatchlistPage({ onOpenProfile }: { onOpenProfile?: () => void }) {
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Saham IDX' | 'Saham Global' | 'Crypto'>('All');
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>([
    'BBCA', 'BBRI', 'BMRI', 'NVDA', 'BTCUSDT', 'SOLUSDT'
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [assetPrices, setAssetPrices] = useState<Record<string, { price: string, change: string, pct: string, up: boolean }>>({});

  // Fetch real market quotes
  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const res = await fetch('/api/quotes');
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.quotes) {
          const quotes = data.quotes;
          const newPrices: Record<string, { price: string, change: string, pct: string, up: boolean }> = {};
          
          ALL_GLOBAL_ASSETS.forEach(item => {
            const q = quotes[item.symbol] || quotes[`${item.symbol}USDT`];
            if (q) {
              const isUp = (q.change || 0) >= 0;
              const isIdr = item.currency === 'IDR' || isIDXStock(item.symbol);
              
              const formatP = (val: number) => {
                if (isIdr) return Math.round(val).toLocaleString('id-ID');
                if (val < 0.01) return val.toFixed(6);
                if (val < 10) return val.toFixed(4);
                return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              };

              newPrices[item.symbol] = {
                price: formatP(q.price),
                change: `${isUp ? '+' : ''}${formatP(q.change || 0)}`,
                pct: `${isUp ? '+' : ''}${(q.pctChange || 0).toFixed(2)}%`,
                up: isUp
              };
            }
          });

          setAssetPrices(prev => ({ ...prev, ...newPrices }));
        }
      } catch (err) {
        console.warn('Failed to fetch quotes for watchlist:', err);
      }
    };

    fetchQuotes();
    const interval = setInterval(fetchQuotes, 1500);
    return () => clearInterval(interval);
  }, []);

  const toggleWatchlist = (sym: string) => {
    setWatchlistSymbols(prev => 
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    );
  };

  if (selectedAsset) {
    return <AssetDetailsPage symbol={selectedAsset} onBack={() => setSelectedAsset(null)} />;
  }

  const displayedAssets = ALL_GLOBAL_ASSETS.filter(item => {
    const isInWatchlist = watchlistSymbols.includes(item.symbol);
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return isInWatchlist && matchesCategory;
  });

  return (
    <div className="flex h-full flex-col bg-white relative overflow-hidden">
      {/* Header */}
      <header className="flex h-13 items-center justify-between px-4 bg-white sticky top-0 z-10 border-b border-gray-100">
        <button onClick={onOpenProfile} className="h-8 w-8 overflow-hidden rounded-full bg-blue-100 flex items-center justify-center shrink-0">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Garuda" alt="Avatar" className="h-full w-full object-cover" />
        </button>
        <div className="flex items-center gap-1.5">
          <img src="/logo.jpg" alt="P-Stock Sekuritas" className="w-6 h-6 rounded object-cover shadow-xs" />
          <span className="text-sm font-bold tracking-tight text-gray-900">P-STOCK <span className="text-primary">SEKURITAS</span></span>
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className="text-primary hover:text-emerald-700 p-1">
          <Plus className="h-5 w-5" strokeWidth={2.5} />
        </button>
      </header>

      {/* Sub Header / Filters */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-100">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(['All', 'Saham IDX', 'Saham Global', 'Crypto'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap",
                selectedCategory === cat
                  ? "bg-[#00B26A] text-white shadow-2xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {cat === 'All' ? 'All Watchlist' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Search drawer if isAdding */}
      {isAdding && (
        <div className="p-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-2xs">
            <Search className="w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari & tambahkan saham (BBCA, BBRI, NVDA...)"
              className="flex-1 text-xs outline-none text-gray-800 font-medium"
            />
          </div>
          {searchQuery && (
            <div className="mt-2 max-h-40 overflow-y-auto divide-y divide-gray-100 bg-white rounded-lg border border-gray-200 shadow-xs">
              {ALL_GLOBAL_ASSETS
                .filter(a => a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || a.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(item => (
                  <div key={item.symbol} className="flex items-center justify-between p-2 hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <AssetLogo symbol={item.symbol} size="xs" />
                      <span className="text-xs font-bold text-gray-900">{item.symbol} - {item.name}</span>
                    </div>
                    <button 
                      onClick={() => toggleWatchlist(item.symbol)}
                      className={cn("text-xs px-2 py-0.5 rounded font-bold", watchlistSymbols.includes(item.symbol) ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-[#00B26A]")}
                    >
                      {watchlistSymbols.includes(item.symbol) ? 'Hapus' : '+ Tambah'}
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Watchlist Asset Items */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2 pb-24">
        {displayedAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-sm font-bold text-gray-700 mb-1">Tidak ada aset di kategori ini</p>
            <p className="text-xs text-gray-400">Klik tombol + di atas untuk menambahkan saham atau kripto favoritmu.</p>
          </div>
        ) : (
          displayedAssets.map((asset) => {
            const displaySym = asset.symbol.replace('USDT', '');
            const isIdr = asset.currency === 'IDR' || isIDXStock(asset.symbol);
            const data = assetPrices[asset.symbol] || {
              price: asset.basePrice ? (isIdr ? asset.basePrice.toLocaleString('id-ID') : asset.basePrice.toString()) : '-',
              change: '0',
              pct: '0.00%',
              up: true
            };

            return (
              <div 
                key={asset.symbol}
                onClick={() => setSelectedAsset(asset.symbol)}
                className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-gray-100 hover:border-emerald-200 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <AssetLogo symbol={asset.symbol} size="md" className="group-hover:scale-105 transition-transform" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-extrabold text-gray-900">{displaySym}</h4>
                      {asset.symbol === 'BBCA' && (
                        <span className="px-1.5 py-0.2 bg-blue-100 text-blue-700 text-[9px] font-black rounded">Bank No.1</span>
                      )}
                      <span className="text-[10px] text-gray-400 font-medium">{asset.category}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 truncate max-w-[140px] sm:max-w-[200px]">{asset.name}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-black text-gray-900">
                    {isIdr ? `Rp ${data.price}` : `$${data.price}`}
                  </p>
                  <div className={cn(
                    "inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md mt-0.5",
                    data.up ? "bg-emerald-50 text-[#00B26A]" : "bg-rose-50 text-[#e11d48]"
                  )}>
                    {data.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    <span>{data.change} ({data.pct})</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
