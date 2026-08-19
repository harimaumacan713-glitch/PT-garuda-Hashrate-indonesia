import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  MoreHorizontal, 
  ChevronDown, 
  Plus, 
  Star, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  X, 
  Check, 
  SlidersHorizontal,
  Sparkles,
  Layers,
  Trash2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ALL_GLOBAL_ASSETS, isIDXStock } from '../lib/assetsData';
import { AssetLogo } from '../components/AssetLogo';
import { AssetDetailsPage } from './AssetDetailsPage';
import { UserProfileAvatar } from '../components/UserProfileAvatar';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { ref, onValue, set } from 'firebase/database';

interface WatchlistPageProps {
  onOpenProfile?: () => void;
}

export function WatchlistPage({ onOpenProfile }: WatchlistPageProps) {
  const { user } = useAuth();
  const activeUid = user ? user.uid : (localStorage.getItem('pstock_active_uid') || 'default_user');

  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Modals & Drawers
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Watchlist');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Saham IDX' | 'Saham Global' | 'Crypto'>('All');

  // Real-time market prices
  const [assetPrices, setAssetPrices] = useState<Record<string, { price: string; change: string; pct: string; up: boolean }>>({});

  // Sync Watchlist from Firebase
  useEffect(() => {
    if (!activeUid) return;
    const watchlistRef = ref(db, `users/${activeUid}/watchlist`);
    const unsubscribe = onValue(watchlistRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        if (Array.isArray(val)) {
          setWatchlistSymbols(val);
        } else if (typeof val === 'object' && val !== null) {
          setWatchlistSymbols(Object.values(val));
        } else {
          setWatchlistSymbols([]);
        }
      } else {
        setWatchlistSymbols([]);
      }
      setIsLoaded(true);
    });

    return () => unsubscribe();
  }, [activeUid]);

  // Fetch real market quotes
  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const res = await fetch('/api/quotes');
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.quotes) {
          const quotes = data.quotes;
          const newPrices: Record<string, { price: string; change: string; pct: string; up: boolean }> = {};
          
          ALL_GLOBAL_ASSETS.forEach(item => {
            const q = quotes[item.symbol] || quotes[`${item.symbol}USDT`];
            const isIdr = item.currency === 'IDR' || isIDXStock(item.symbol);
            
            const formatP = (val: number) => {
              if (isIdr) return Math.round(val).toLocaleString('id-ID');
              if (val < 0.01) return val.toFixed(6);
              if (val < 10) return val.toFixed(4);
              return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            };

            if (q) {
              const isUp = (q.change || 0) >= 0;
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

  // Toggle Stock in Watchlist & persist to Firebase
  const toggleWatchlist = async (sym: string) => {
    let updated: string[];
    if (watchlistSymbols.includes(sym)) {
      updated = watchlistSymbols.filter(s => s !== sym);
    } else {
      updated = [...watchlistSymbols, sym];
    }
    setWatchlistSymbols(updated);
    if (activeUid) {
      try {
        await set(ref(db, `users/${activeUid}/watchlist`), updated);
      } catch (e) {
        console.error('Failed to save watchlist to Firebase:', e);
      }
    }
  };

  // Clear Watchlist
  const handleClearWatchlist = async () => {
    setWatchlistSymbols([]);
    setShowMoreMenu(false);
    if (activeUid) {
      try {
        await set(ref(db, `users/${activeUid}/watchlist`), []);
      } catch (e) {
        console.error('Failed to clear watchlist:', e);
      }
    }
  };

  if (selectedAsset) {
    return <AssetDetailsPage symbol={selectedAsset} onBack={() => setSelectedAsset(null)} />;
  }

  // Filter items based on selected category dropdown
  const filteredWatchlist = ALL_GLOBAL_ASSETS.filter(item => {
    const isSaved = watchlistSymbols.includes(item.symbol);
    if (!isSaved) return false;

    if (selectedCategory === 'Saham IDX') return item.category === 'Saham IDX';
    if (selectedCategory === 'Saham Global') return item.category === 'Saham Global';
    if (selectedCategory === 'Crypto') return item.category === 'Crypto';
    return true; // 'All Watchlist'
  });

  const searchFilteredAssets = ALL_GLOBAL_ASSETS.filter(item => {
    const matchesCat = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesSearch = !searchQuery || 
      item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex h-full flex-col bg-white relative overflow-hidden select-none">
      {/* TOP HEADER - EXACT STOCKBIT DESIGN */}
      <header className="flex h-14 items-center justify-between px-4 bg-white sticky top-0 z-20">
        {/* Left: User Avatar */}
        <button 
          onClick={onOpenProfile} 
          className="w-8 h-8 rounded-full overflow-hidden shrink-0 active:scale-95 transition-transform"
          aria-label="Profil Pengguna"
        >
          <UserProfileAvatar size="sm" className="w-8 h-8" />
        </button>

        {/* Center: BrusaSCS Logo */}
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-0.5">
            <span className="text-[20px] font-black text-gray-900 tracking-tight font-sans">
              Brusa<span className="text-[#00B26A]">SCS</span>
            </span>
            {/* BrusaSCS mini colorful chart icon */}
            <div className="flex items-end gap-[1.5px] h-3.5 ml-1 mb-0.5">
              <div className="w-[2.5px] h-2 bg-[#00AA5B] rounded-xs"></div>
              <div className="w-[2.5px] h-3.5 bg-[#E11D48] rounded-xs"></div>
              <div className="w-[2.5px] h-2.5 bg-[#00AA5B] rounded-xs"></div>
            </div>
          </div>
        </div>

        {/* Right: Document / News Report Icon */}
        <button 
          onClick={() => setShowNewsModal(true)} 
          className="text-gray-700 hover:text-black p-1 active:scale-95 transition-transform"
          aria-label="Laporan Pasar"
        >
          <FileText className="w-5 h-5" strokeWidth={1.75} />
        </button>
      </header>

      {/* SUB-HEADER CONTROLS ROW */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-100/80">
        {/* Left: "All Watchlist" Pill Button with Green Outline */}
        <button 
          onClick={() => setShowCategoryMenu(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#00AA5B] text-[#00AA5B] bg-white hover:bg-emerald-50/50 active:scale-98 transition-all text-xs font-bold"
        >
          <span>{selectedCategory}</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#00AA5B]" strokeWidth={2.5} />
        </button>

        {/* Right Action Icons: "..." and "(+)" */}
        <div className="flex items-center gap-3 text-gray-500">
          <button 
            onClick={() => setShowMoreMenu(true)}
            className="p-1 hover:text-gray-900 transition-colors"
            aria-label="Menu Opsi"
          >
            <MoreHorizontal className="w-5 h-5 text-gray-500" strokeWidth={2} />
          </button>

          <button 
            onClick={() => setShowAddModal(true)}
            className="p-0.5 hover:text-gray-900 transition-colors"
            aria-label="Tambah Saham"
          >
            <div className="w-5 h-5 rounded-full border-[1.75px] border-gray-500 flex items-center justify-center">
              <Plus className="w-3.5 h-3.5 text-gray-500" strokeWidth={2.5} />
            </div>
          </button>
        </div>
      </div>

      {/* MAIN BODY AREA */}
      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
        {/* If Watchlist is empty -> Render Exact Empty State from Screenshot */}
        {filteredWatchlist.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center -mt-6">
            {/* Binoculars Vector Illustration */}
            <div className="relative mb-6 flex items-center justify-center">
              {/* Confetti & Sparkles Top */}
              <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 flex items-center justify-center w-24 pointer-events-none">
                {/* Green Ribbon */}
                <svg className="w-16 h-8 text-[#00AA5B]" viewBox="0 0 60 30" fill="none">
                  <path d="M28 6C27 10 24 14 26 18C28 22 33 24 32 28" stroke="#00AA5B" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="16" cy="12" r="2" fill="#10B981" />
                  <circle cx="44" cy="18" r="2.5" fill="#10B981" />
                </svg>
                {/* Sparkle Left */}
                <Sparkles className="absolute -left-2 top-4 w-3.5 h-3.5 text-[#1F2937]" />
                {/* Sparkle Right */}
                <Sparkles className="absolute -right-2 top-3 w-3 h-3 text-[#1F2937]" />
              </div>

              {/* Binoculars SVG */}
              <div className="w-24 h-20 relative flex items-center justify-center">
                <svg viewBox="0 0 100 80" className="w-full h-full drop-shadow-xs" fill="none">
                  {/* Bridge connection */}
                  <rect x="42" y="32" width="16" height="8" rx="4" fill="#00AA5B" stroke="#1F2937" strokeWidth="2.5" />
                  <rect x="46" y="26" width="8" height="6" rx="2" fill="#1F2937" />
                  
                  {/* Left Barrel */}
                  <rect x="18" y="16" width="26" height="24" rx="4" fill="#00AA5B" stroke="#1F2937" strokeWidth="2.5" />
                  {/* Left Eyepiece */}
                  <path d="M22 10H40V16H22V10Z" fill="#1F2937" stroke="#1F2937" strokeWidth="2" strokeLinejoin="round" />
                  {/* Left Objective Lens Big Circle */}
                  <circle cx="31" cy="48" r="16" fill="#00AA5B" stroke="#1F2937" strokeWidth="3" />
                  <circle cx="31" cy="48" r="11" fill="#059669" />
                  <circle cx="31" cy="48" r="8" fill="#ECFDF5" />
                  {/* Lens Highlight */}
                  <path d="M26 43C28 40 33 40 36 43" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />

                  {/* Right Barrel */}
                  <rect x="56" y="16" width="26" height="24" rx="4" fill="#00AA5B" stroke="#1F2937" strokeWidth="2.5" />
                  {/* Right Eyepiece */}
                  <path d="M60 10H78V16H60V10Z" fill="#1F2937" stroke="#1F2937" strokeWidth="2" strokeLinejoin="round" />
                  {/* Right Objective Lens Big Circle */}
                  <circle cx="69" cy="48" r="16" fill="#00AA5B" stroke="#1F2937" strokeWidth="3" />
                  <circle cx="69" cy="48" r="11" fill="#059669" />
                  <circle cx="69" cy="48" r="8" fill="#ECFDF5" />
                  {/* Lens Highlight */}
                  <path d="M64 43C66 40 71 40 74 43" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>

              {/* Bottom Dot */}
              <div className="absolute -bottom-2 right-4 w-2 h-2 rounded-full bg-[#00AA5B]" />
              <div className="absolute -bottom-1 left-3 w-1.5 h-1.5 rounded-full bg-[#00AA5B]" />
            </div>

            {/* Empty State Text */}
            <h2 className="text-[17px] font-extrabold text-gray-900 tracking-tight mb-1.5">
              Watchlist Kamu Masih Kosong
            </h2>
            <p className="text-[13px] text-gray-400 font-normal leading-relaxed max-w-[290px] mb-6">
              Tambahkan saham favoritmu ke watchlist untuk pantau pergerakannya.
            </p>

            {/* Primary Action Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#00AA5B] hover:bg-[#009650] active:scale-[0.98] text-white text-[14px] font-bold py-2.5 px-7 rounded-full shadow-xs transition-all flex items-center justify-center cursor-pointer"
            >
              Tambahkan Saham
            </button>
          </div>
        ) : (
          /* Populated Watchlist Stock Items List */
          <div className="p-3 space-y-2 pb-24">
            <div className="flex items-center justify-between px-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              <span>Aset ({filteredWatchlist.length})</span>
              <span>Harga & Perubahan</span>
            </div>

            {filteredWatchlist.map((asset, idx) => {
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
                  key={`watch-${asset.symbol}-${idx}`}
                  onClick={() => setSelectedAsset(asset.symbol)}
                  className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-gray-100/90 hover:border-emerald-200 active:bg-gray-50 shadow-2xs transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <AssetLogo symbol={asset.symbol} size="md" className="group-hover:scale-105 transition-transform" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-extrabold text-gray-900">{displaySym}</h4>
                        <span className="text-[10px] text-gray-400 font-medium">{asset.category}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 truncate max-w-[130px] sm:max-w-[200px]">{asset.name}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-black text-gray-900 font-mono">
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
            })}
          </div>
        )}
      </div>

      {/* MODAL: TAMBAH SAHAM KE WATCHLIST (DRAWER SHEET) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-t-2xl max-h-[85vh] h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-250">
            {/* Sheet Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Tambahkan ke Watchlist</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-3 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2 bg-white px-3 py-2.5 rounded-xl border border-gray-200 shadow-2xs">
                <Search className="w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari saham / kripto (BBCA, BTC, NVDA...)"
                  className="flex-1 text-xs text-gray-900 placeholder:text-gray-400 outline-none font-medium"
                  autoFocus
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar">
                {(['All', 'Saham IDX', 'Saham Global', 'Crypto'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all",
                      categoryFilter === cat
                        ? "bg-[#00AA5B] text-white"
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    {cat === 'All' ? 'Semua Aset' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Asset List with Toggle Star */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50 p-2">
              {searchFilteredAssets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center text-gray-400">
                  <p className="text-sm font-semibold">Aset tidak ditemukan</p>
                  <p className="text-xs mt-1">Coba kata kunci pencarian lainnya.</p>
                </div>
              ) : (
                searchFilteredAssets.map((asset, idx) => {
                  const isStarred = watchlistSymbols.includes(asset.symbol);
                  return (
                    <div 
                      key={`search-asset-${asset.symbol}-${idx}`}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <AssetLogo symbol={asset.symbol} size="sm" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-gray-900">{asset.symbol.replace('USDT', '')}</span>
                            <span className="text-[10px] text-gray-400 font-medium">{asset.category}</span>
                          </div>
                          <p className="text-[11px] text-gray-500 truncate max-w-[170px]">{asset.name}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleWatchlist(asset.symbol)}
                        className={cn(
                          "p-2 rounded-full transition-all active:scale-90",
                          isStarred ? "text-[#00AA5B] bg-emerald-50" : "text-gray-300 hover:text-gray-500 hover:bg-gray-100"
                        )}
                        title={isStarred ? "Hapus dari Watchlist" : "Tambah ke Watchlist"}
                      >
                        <Star className={cn("w-5 h-5", isStarred && "fill-[#00AA5B]")} strokeWidth={2} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Sheet Footer Done Button */}
            <div className="p-3 border-t border-gray-100 bg-white">
              <button
                onClick={() => setShowAddModal(false)}
                className="w-full bg-[#00AA5B] hover:bg-[#009650] text-white font-bold py-2.5 rounded-xl text-sm transition-all"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DROPDOWN MENU: PILIH KATEGORI WATCHLIST */}
      {showCategoryMenu && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-start pt-24 px-4 bg-black/20 backdrop-blur-2xs"
          onClick={() => setShowCategoryMenu(false)}
        >
          <div 
            className="bg-white rounded-2xl p-2 w-56 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Daftar Watchlist
            </div>
            {['All Watchlist', 'Saham IDX', 'Saham Global', 'Crypto'].map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setShowCategoryMenu(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left",
                  selectedCategory === cat ? "bg-emerald-50 text-[#00AA5B]" : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <span>{cat}</span>
                {selectedCategory === cat && <Check className="w-4 h-4 text-[#00AA5B]" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MORE OPTIONS MENU */}
      {showMoreMenu && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-end pt-24 px-4 bg-black/20 backdrop-blur-2xs"
          onClick={() => setShowMoreMenu(false)}
        >
          <div 
            className="bg-white rounded-2xl p-2 w-52 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setShowMoreMenu(false);
                setShowAddModal(true);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 text-left"
            >
              <Plus className="w-4 h-4 text-gray-500" />
              <span>Tambah Aset</span>
            </button>
            {watchlistSymbols.length > 0 && (
              <button
                onClick={handleClearWatchlist}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 text-left"
              >
                <Trash2 className="w-4 h-4 text-rose-500" />
                <span>Kosongkan Watchlist</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* NEWS & MARKET REPORT MODAL */}
      {showNewsModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-t-2xl max-h-[75vh] h-[75vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#00AA5B]" />
                <h3 className="text-base font-bold text-gray-900">Riset & Berita Pasar</h3>
              </div>
              <button 
                onClick={() => setShowNewsModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs text-gray-600">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-[#00AA5B] uppercase">Market Wrap</span>
                <h4 className="text-sm font-bold text-gray-900 mt-1">IHSG Bergerak Menguat Didukung Sektor Perbankan</h4>
                <p className="mt-1 text-gray-500 leading-relaxed">Arus dana asing terpantau positif pada saham-saham berkapitalisasi besar seperti BBCA dan BMRI.</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-[#7C3AED] uppercase">Global Crypto</span>
                <h4 className="text-sm font-bold text-gray-900 mt-1">Bitcoin Mempertahankan Level Support Kuat</h4>
                <p className="mt-1 text-gray-500 leading-relaxed">Aktivitas on-chain mencerminkan akumulasi konsisten dari investor institusi.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
