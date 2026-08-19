import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileText,
  SlidersHorizontal,
  Flame,
  Coins,
  Cross,
  Factory,
  ShoppingCart,
  Home,
  Plane,
  Cpu,
  Shirt,
  FlaskConical,
  Building2,
  Share2,
  TrendingUp,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ALL_GLOBAL_ASSETS, isIDXStock, AssetMeta, IDXSector } from '../lib/assetsData';
import { AssetLogo } from '../components/AssetLogo';
import { AssetDetailsPage } from './AssetDetailsPage';
import { UserProfileAvatar } from '../components/UserProfileAvatar';
import { ResearchReaderModal, ResearchItem } from '../components/ResearchReaderModal';

// Unboxing Saham Research Articles with Realistic Photographic Backgrounds
const UNBOXING_ARTICLES: (ResearchItem & { tickerBadge: string; volNumber: string; bgImage: string })[] = [
  {
    id: 'cnma-51',
    tickerBadge: '$CNMA',
    volNumber: 'Vol. 51, August 26',
    title: 'CNMA: Sustainable 9% Dividend Play with Limited Downside',
    subtitle: 'Analisis fundamental dan valuasi bioskop XXI di tengah pertumbuhan box office nasional.',
    author: 'BrusaSCS Research Team',
    date: '26 Agu 2026',
    category: 'Unboxing Saham',
    rating: 'BUY',
    targetPrice: 'Rp 320',
    relatedTicker: 'CNMA',
    executiveSummary: 'PT Nusantara Sejahtera Raya Tbk (CNMA) mengoperasikan jaringan bioskop Cinema XXI terbesar di Indonesia. Dengan posisi kas yang kuat, yield dividen ~9%, dan minimnya utang berbunga, CNMA menawarkan profil risk-reward yang sangat menarik di sektor konsumer.',
    investmentThesis: [
      'Market share box office domestik lebih dari 60% dengan penetrasi bioskop yang terus meluas.',
      'Margin F&B bioskop (popcorn, minuman) menghasilkan profitabilitas tinggi di atas 65%.',
      'Kebijakan dividen payout ratio mencapai 70% memberikan arus kas dividen konsisten.'
    ],
    keyMetrics: {
      peRatio: '14.2x',
      pbvRatio: '1.8x',
      roe: '13.5%',
      dividendYield: '8.9%'
    },
    bgImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900&auto=format&fit=crop&q=80',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900&auto=format&fit=crop&q=80'
  },
  {
    id: 'ammn-50',
    tickerBadge: '$AMMN',
    volNumber: 'Vol. 50, June 26',
    title: 'AMMN: When Passive Selling Creates an Active Opportunity',
    subtitle: 'Peluang akumulasi pasca-rebalancing indeks global dengan smelter tembaga yang mulai beroperasi penuh.',
    author: 'BrusaSCS Research Team',
    date: '26 Jun 2026',
    category: 'Unboxing Saham',
    rating: 'BUY',
    targetPrice: 'Rp 6,500',
    relatedTicker: 'AMMN',
    executiveSummary: 'Amman Mineral Internasional (AMMN) menyelesaikan pembangunan fasilitas smelter tembaga dan pemurnian logam mulia di Sumbawa Barat. Penjualan pasif dari rebalancing indeks membuka titik masuk valuasi atraktif untuk emiten tembaga-emas berkadar tinggi ini.',
    investmentThesis: [
      'Smelter tembaga kapasitas 900.000 ton konsentrat mulai beroperasi komersial.',
      'Cadangan bijih Batu Hijau dan Elang menjamin kelangsungan tambang hingga lebih dari 20 tahun.',
      'Kenaikan harga tembaga global didorong oleh elektrifikasi dan infrastruktur AI data center.'
    ],
    keyMetrics: {
      peRatio: '18.5x',
      pbvRatio: '3.2x',
      roe: '17.8%',
      dividendYield: '2.1%'
    },
    bgImage: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=900&auto=format&fit=crop&q=80',
    image: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=900&auto=format&fit=crop&q=80'
  },
  {
    id: 'bdmn-49',
    tickerBadge: '$BDMN',
    volNumber: 'Vol. 49, May 26',
    title: 'Integrasi BDMN–MUFG: Asymmetric Upside Opportunity',
    subtitle: 'Sinergi pembiayaan otomotif Adira Finance dan jaringan korporasi global Mitsubishi UFJ.',
    author: 'BrusaSCS Research Team',
    date: '26 Mei 2026',
    category: 'Unboxing Saham',
    rating: 'BUY',
    targetPrice: 'Rp 3,800',
    relatedTicker: 'BDMN',
    executiveSummary: 'Kolaborasi strategis Bank Danamon (BDMN) dengan induk usahanya MUFG Bank mulai membuahkan hasil signifikan dalam pembiayaan rantai pasok otomotif dan korporasi multinasional Jepang di Indonesia.',
    investmentThesis: [
      'Pertumbuhan pinjaman korporasi mencapai double digit didorong ekosistem supply-chain MUFG.',
      'Kualitas aset membaik dengan NPL gross terjaga di bawah 2.3%.',
      'Valuasi PBV 0.55x masih jauh di bawah rata-rata historis bank modalitas Tier-2.'
    ],
    keyMetrics: {
      peRatio: '8.4x',
      pbvRatio: '0.58x',
      roe: '8.2%',
      dividendYield: '5.4%'
    },
    bgImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&auto=format&fit=crop&q=80',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&auto=format&fit=crop&q=80'
  },
  {
    id: 'bbca-48',
    tickerBadge: '$BBCA',
    volNumber: 'Vol. 48, April 26',
    title: 'BBCA: Resilient NIM & Digital Banking Dominance',
    subtitle: 'Keunggulan dana murah CASA 82% mempertahankan profitabilitas di era suku bunga tinggi.',
    author: 'BrusaSCS Research Team',
    date: '18 Apr 2026',
    category: 'Unboxing Saham',
    rating: 'BUY',
    targetPrice: 'Rp 11,200',
    relatedTicker: 'BBCA',
    executiveSummary: 'PT Bank Central Asia Tbk terus menunjukkan kepemimpinan tak tertandingi di industri perbankan nasional melalui efisiensi operasional dan pertumbuhan transaksi digital myBCA.',
    investmentThesis: [
      'Rasio CASA 82% menopang Cost of Funds terendah di industri perbankan Indonesia.',
      'Return on Equity (ROE) konsisten di atas 20% dengan rasio kredit macet mendekati nol.',
      'Pertumbuhan fee-based income yang solid dari jutaan transaksi harian nasabah ritel.'
    ],
    keyMetrics: {
      peRatio: '21.5x',
      pbvRatio: '4.8x',
      roe: '22.4%',
      dividendYield: '2.8%'
    },
    bgImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=900&auto=format&fit=crop&q=80',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=900&auto=format&fit=crop&q=80'
  }
];

// Special Boards (Papan Khusus)
const PAPAN_KHUSUS_LIST = [
  'Day Trade',
  'Trading Limit',
  'UMA',
  'Suspended',
  'Unsuspended',
  'FCA',
  'FCA Out',
  'Notasi Khusus'
] as const;

// 11 Sectors configuration with exact icons & definitions
const SECTORS_CONFIG: {
  id: IDXSector;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}[] = [
  { id: 'BASIC-IND', label: 'BASIC-IND', icon: FlaskConical },
  { id: 'CYCLICAL', label: 'CYCLICAL', icon: Shirt },
  { id: 'ENERGY', label: 'ENERGY', icon: Flame },
  { id: 'FINANCE', label: 'FINANCE', icon: Coins },
  { id: 'HEALTH', label: 'HEALTH', icon: Cross },
  { id: 'INDUSTRIAL', label: 'INDUSTRIAL', icon: Factory },
  { id: 'INFRASTRUC', label: 'INFRASTRUC', icon: Building2 },
  { id: 'NON-CYCLICAL', label: 'NON-CYCLICAL', icon: ShoppingCart },
  { id: 'PROPERTY', label: 'PROPERTY', icon: Home },
  { id: 'TRANSPORT', label: 'TRANSPORT', icon: Plane },
  { id: 'TECHNOLOGY', label: 'TECHNOLOGY', icon: Cpu },
];

// Market Indices
const INDICES_CONFIG = [
  { id: 'IDX30', name: 'IDX30' },
  { id: 'LQ45', name: 'LQ45' },
  { id: 'SRI-KEHATI', name: 'SRI-KEHATI' },
  { id: 'JII', name: 'JII' },
  { id: 'ISSI', name: 'ISSI' },
  { id: 'KOMPAS100', name: 'KOMPAS100' },
  { id: 'IHSG', name: 'IHSG' },
];

export function SearchPage({ onOpenProfile }: { onOpenProfile?: () => void }) {
  const [activeTab, setActiveTab] = useState<'MARKET' | 'GLOBAL' | 'BONDS' | 'REKSADANA'>('MARKET');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  
  // Selected filtered view state (when tapping a sector, index, or special board)
  const [selectedSector, setSelectedSector] = useState<IDXSector | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<string | null>(null);
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);
  const [selectedResearch, setSelectedResearch] = useState<ResearchItem | null>(null);
  const [showAllStocksModal, setShowAllStocksModal] = useState(false);

  // Real-time market quotes
  const [assetQuotes, setAssetQuotes] = useState<Record<string, { price: number; change: number; pctChange: number }>>({});

  // Initialize and poll live price quotes
  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const res = await fetch('/api/quotes');
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.quotes) {
          const quotes: Record<string, { price: number; change: number; pctChange: number }> = {};
          
          ALL_GLOBAL_ASSETS.forEach(item => {
            const q = data.quotes[item.symbol] || data.quotes[`${item.symbol}USDT`];
            if (q) {
              quotes[item.symbol] = {
                price: q.price || item.basePrice,
                change: q.change || 0,
                pctChange: q.pctChange || 0
              };
            } else {
              quotes[item.symbol] = {
                price: item.basePrice,
                change: 0,
                pctChange: 0
              };
            }
          });
          setAssetQuotes(quotes);
        }
      } catch (err) {
        console.warn('Failed to fetch quotes for search page:', err);
      }
    };

    fetchQuotes();
    const interval = setInterval(fetchQuotes, 1500);
    return () => clearInterval(interval);
  }, []);

  // Compute live change % and count for each Sector dynamically from existing assets
  const sectorStats = useMemo(() => {
    const stats: Record<IDXSector, { avgPct: number; count: number; formattedPct: string; isUp: boolean }> = {} as any;

    SECTORS_CONFIG.forEach(sec => {
      const assetsInSector = ALL_GLOBAL_ASSETS.filter(a => a.idxSector === sec.id);
      const count = assetsInSector.length;
      
      let sumPct = 0;
      assetsInSector.forEach(asset => {
        const q = assetQuotes[asset.symbol];
        if (q && typeof q.pctChange === 'number') {
          sumPct += q.pctChange;
        }
      });

      // If no live updates yet, use deterministic realistic seeded value
      const avg = count > 0 && sumPct !== 0 
        ? sumPct / count 
        : (sec.id === 'HEALTH' ? 3.09 : sec.id === 'ENERGY' ? 2.66 : sec.id === 'PROPERTY' ? 2.99 : sec.id === 'INFRASTRUC' ? 1.67 : sec.id === 'CYCLICAL' ? 1.17 : sec.id === 'BASIC-IND' ? 1.11 : sec.id === 'NON-CYCLICAL' ? 1.14 : sec.id === 'TRANSPORT' ? 1.14 : sec.id === 'FINANCE' ? 0.68 : sec.id === 'TECHNOLOGY' ? 0.60 : 0.34);

      const isUp = avg >= 0;
      stats[sec.id] = {
        avgPct: avg,
        count,
        formattedPct: `${isUp ? '+' : ''}${avg.toFixed(2)}%`,
        isUp
      };
    });

    return stats;
  }, [assetQuotes]);

  // Compute live change % and count for each Index dynamically from constituent stocks
  const indexStats = useMemo(() => {
    const stats: Record<string, { avgPct: number; count: number; formattedPct: string; isUp: boolean }> = {};

    INDICES_CONFIG.forEach(idx => {
      const constituents = ALL_GLOBAL_ASSETS.filter(a => a.indices?.includes(idx.id));
      const count = constituents.length;
      
      let sumPct = 0;
      constituents.forEach(asset => {
        const q = assetQuotes[asset.symbol];
        if (q && typeof q.pctChange === 'number') {
          sumPct += q.pctChange;
        }
      });

      const avg = count > 0 && sumPct !== 0
        ? sumPct / count
        : (idx.id === 'IDX30' ? 0.80 : idx.id === 'LQ45' ? 0.82 : idx.id === 'SRI-KEHATI' ? 0.57 : idx.id === 'JII' ? 1.39 : idx.id === 'ISSI' ? 2.54 : idx.id === 'KOMPAS100' ? 0.95 : 0.65);

      const isUp = avg >= 0;
      stats[idx.id] = {
        avgPct: avg,
        count,
        formattedPct: `${isUp ? '+' : ''}${avg.toFixed(2)}%`,
        isUp
      };
    });

    return stats;
  }, [assetQuotes]);

  // Get active list of assets based on tab or active selection
  const filteredAssets = useMemo(() => {
    let list = ALL_GLOBAL_ASSETS;

    if (activeTab === 'GLOBAL') {
      list = list.filter(a => a.category === 'Saham Global' || a.category === 'Crypto' || a.category === 'Komoditas & Forex');
    } else if (activeTab === 'BONDS') {
      return []; // empty or placeholder
    } else if (activeTab === 'REKSADANA') {
      return []; // empty or placeholder
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(a => 
        a.symbol.toLowerCase().includes(q) || 
        a.name.toLowerCase().includes(q) ||
        (a.symbol === 'BBCA' && q.includes('bca')) ||
        (a.symbol === 'BTCUSDT' && q.includes('bitcoin'))
      );
    } else if (selectedSector) {
      list = list.filter(a => a.idxSector === selectedSector);
    } else if (selectedIndex) {
      list = list.filter(a => a.indices?.includes(selectedIndex));
    } else if (selectedBoard) {
      list = list.filter(a => a.specialBoards?.includes(selectedBoard));
    }

    return list;
  }, [activeTab, searchQuery, selectedSector, selectedIndex, selectedBoard]);

  if (selectedAsset) {
    return <AssetDetailsPage symbol={selectedAsset} onBack={() => setSelectedAsset(null)} />;
  }

  const isSearchActive = !!searchQuery.trim();
  const isFilterDrilldownActive = !!(selectedSector || selectedIndex || selectedBoard);

  return (
    <div className="flex h-full flex-col bg-white select-none relative overflow-hidden">
      {/* TOP BAR: USER AVATAR + SEARCH INPUT (EXACT STOCKBIT HEADER) */}
      <header className="flex h-14 items-center gap-3 px-4 bg-white sticky top-0 z-20 border-b border-gray-100">
        {/* Left: User Profile Avatar */}
        <button 
          onClick={onOpenProfile} 
          className="w-8 h-8 rounded-full overflow-hidden shrink-0 active:scale-95 transition-transform"
          aria-label="Profil Pengguna"
        >
          <UserProfileAvatar size="sm" className="w-8 h-8" />
        </button>

        {/* Center: Search Box */}
        <div className="flex h-10 flex-1 items-center gap-2 rounded-xl bg-gray-100/90 px-3.5 border border-transparent focus-within:border-emerald-500 focus-within:bg-white transition-all">
          <Search className="h-4 w-4 text-gray-400 shrink-0" strokeWidth={2} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search symbol or username" 
            className="flex-1 bg-transparent text-xs text-gray-900 outline-none placeholder:text-gray-400 font-medium" 
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600 p-0.5">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* TOP NAVIGATION TABS: MARKET | GLOBAL | BONDS (New) | REKSADANA */}
      <div className="flex px-4 border-b border-gray-100 bg-white sticky top-14 z-10">
        {(['MARKET', 'GLOBAL', 'BONDS', 'REKSADANA'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSelectedSector(null);
                setSelectedIndex(null);
                setSelectedBoard(null);
              }}
              className={cn(
                "flex-1 py-3 text-[11px] font-bold tracking-wide relative text-center transition-colors",
                isActive ? "text-[#00AA5B]" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <div className="inline-flex items-center justify-center relative">
                <span>{tab}</span>
                {tab === 'BONDS' && (
                  <span className="absolute -top-1 -right-6 rounded bg-[#0284C7] px-1 py-[1px] text-[8px] font-black text-white leading-tight">
                    New
                  </span>
                )}
              </div>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#00AA5B] rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* MAIN SCROLL CONTENT */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        
        {/* ========================================================= */}
        {/* VIEW 1: SEARCH RESULTS OR FILTER DRILLDOWN */}
        {/* ========================================================= */}
        {(isSearchActive || isFilterDrilldownActive) ? (
          <div className="p-4 space-y-3">
            {/* Filter Active Breadcrumb / Header */}
            {isFilterDrilldownActive && (
              <div className="flex items-center justify-between bg-emerald-50/70 border border-emerald-200/80 rounded-xl px-3.5 py-2.5 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#00AA5B] text-white flex items-center justify-center text-xs font-black">
                    {selectedSector ? 'S' : selectedIndex ? 'I' : 'P'}
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-gray-900">
                      {selectedSector ? `Sektor: ${selectedSector}` : selectedIndex ? `Indeks: ${selectedIndex}` : `Papan: ${selectedBoard}`}
                    </h4>
                    <p className="text-[10px] text-gray-500 font-medium">
                      {filteredAssets.length} Saham Terdaftar
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setSelectedSector(null);
                    setSelectedIndex(null);
                    setSelectedBoard(null);
                  }}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-700 bg-white shadow-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">
              <span>Aset Ditemukan ({filteredAssets.length})</span>
              <span>Harga & Perubahan</span>
            </div>

            {filteredAssets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
                <Search className="w-10 h-10 stroke-1 text-gray-300 mb-2" />
                <p className="text-sm font-bold text-gray-700">Tidak ada aset yang sesuai</p>
                <p className="text-xs text-gray-400 mt-0.5">Coba cari dengan kata kunci lain</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {filteredAssets.map((asset, idx) => {
                  const displaySym = asset.symbol.replace('USDT', '');
                  const isIdr = asset.currency === 'IDR' || isIDXStock(asset.symbol);
                  const q = assetQuotes[asset.symbol];
                  
                  const price = q ? q.price : asset.basePrice;
                  const pct = q ? q.pctChange : 0;
                  const isUp = pct >= 0;

                  const formattedPrice = isIdr 
                    ? Math.round(price).toLocaleString('id-ID') 
                    : price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                  return (
                    <div 
                      key={`filt-${asset.symbol}-${idx}`}
                      onClick={() => setSelectedAsset(asset.symbol)}
                      className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100/90 hover:border-emerald-200 active:bg-gray-50 shadow-2xs transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <AssetLogo symbol={asset.symbol} size="md" className="group-hover:scale-105 transition-transform" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-extrabold text-gray-900">{displaySym}</h4>
                            {asset.idxSector && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-[#00AA5B] border border-emerald-100">
                                {asset.idxSector}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 truncate max-w-[150px] sm:max-w-[220px]">{asset.name}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-black text-gray-900 font-mono">
                          {isIdr ? `Rp ${formattedPrice}` : `$${formattedPrice}`}
                        </p>
                        <div className={cn(
                          "inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md mt-0.5",
                          isUp ? "bg-emerald-50 text-[#00AA5B]" : "bg-rose-50 text-[#e11d48]"
                        )}>
                          {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          <span>{isUp ? '+' : ''}{pct.toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : activeTab === 'MARKET' ? (
          /* ========================================================= */
          /* VIEW 2: MARKET HOME (DAFTAR SAHAM DI ATAS, UNBOXING DI BAWAH) */
          /* ========================================================= */
          <div className="flex flex-col divide-y divide-gray-100/80">
            
            {/* 1. DAFTAR SAHAM (TOP SECTION) */}
            <div className="p-4 space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h3 className="text-[15px] font-black text-gray-900 tracking-tight">
                    Daftar Saham IDX
                  </h3>
                  <p className="text-[11px] text-gray-400 font-medium">
                    {ALL_GLOBAL_ASSETS.filter(a => a.category === 'Saham IDX').length} Saham Terdaftar di Bursa Efek Indonesia
                  </p>
                </div>

                <button 
                  onClick={() => setShowAllStocksModal(true)}
                  className="text-xs font-bold text-[#00AA5B] flex items-center gap-0.5 hover:underline"
                >
                  <span>Lihat Semua</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#00AA5B]" strokeWidth={2.5} />
                </button>
              </div>

              {/* List of Stocks */}
              <div className="space-y-1.5 pt-1">
                {ALL_GLOBAL_ASSETS.filter(a => a.category === 'Saham IDX').map((asset, idx) => {
                  const q = assetQuotes[asset.symbol];
                  const price = q ? q.price : asset.basePrice;
                  const pct = q ? q.pctChange : 0;
                  const isUp = pct >= 0;

                  return (
                    <div 
                      key={`idxstock-${asset.symbol}-${idx}`}
                      onClick={() => setSelectedAsset(asset.symbol)}
                      className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100/90 hover:border-emerald-200 active:bg-gray-50 shadow-2xs transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <AssetLogo symbol={asset.symbol} size="md" className="group-hover:scale-105 transition-transform" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-extrabold text-gray-900">{asset.symbol}</h4>
                            {asset.idxSector && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-[#00AA5B] border border-emerald-100">
                                {asset.idxSector}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 truncate max-w-[150px] sm:max-w-[220px]">{asset.name}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-black text-gray-900 font-mono">
                          Rp {Math.round(price).toLocaleString('id-ID')}
                        </p>
                        <div className={cn(
                          "inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md mt-0.5",
                          isUp ? "bg-emerald-50 text-[#00AA5B]" : "bg-rose-50 text-[#e11d48]"
                        )}>
                          {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          <span>{isUp ? '+' : ''}{pct.toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. PAPAN KHUSUS */}
            <div className="py-4">
              <div className="flex items-center justify-between px-4 mb-3">
                <h3 className="text-[15px] font-black text-gray-900 tracking-tight">
                  Papan Khusus
                </h3>
                <button 
                  onClick={() => setShowAllStocksModal(true)}
                  className="text-xs font-bold text-[#00AA5B] flex items-center gap-0.5 hover:underline"
                >
                  <span>Selengkapnya</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#00AA5B]" strokeWidth={2.5} />
                </button>
              </div>

              {/* Horizontal Scroll Chips with Green Borders */}
              <div className="flex items-center gap-2 px-4 overflow-x-auto no-scrollbar">
                {PAPAN_KHUSUS_LIST.map((board) => {
                  const isSelected = selectedBoard === board;
                  return (
                    <button
                      key={board}
                      onClick={() => setSelectedBoard(isSelected ? null : board)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border shrink-0",
                        isSelected
                          ? "bg-[#00AA5B] text-white border-[#00AA5B] shadow-2xs"
                          : "border-[#00AA5B] text-[#00AA5B] bg-white hover:bg-emerald-50/50"
                      )}
                    >
                      {board}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. INDEX */}
            <div className="py-4">
              <div className="flex items-center justify-between px-4 mb-3">
                <h3 className="text-[15px] font-black text-gray-900 tracking-tight">
                  Index
                </h3>
                <button 
                  onClick={() => setShowAllStocksModal(true)}
                  className="text-xs font-bold text-[#00AA5B] flex items-center gap-0.5 hover:underline"
                >
                  <span>Selengkapnya</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#00AA5B]" strokeWidth={2.5} />
                </button>
              </div>

              {/* Horizontal Scroll Cards for Indices */}
              <div className="flex items-center gap-3 px-4 overflow-x-auto no-scrollbar">
                {INDICES_CONFIG.map((idx) => {
                  const stat = indexStats[idx.id] || { avgPct: 0.8, count: 5, formattedPct: '+0.80%', isUp: true };
                  const isSelected = selectedIndex === idx.id;
                  return (
                    <div
                      key={idx.id}
                      onClick={() => setSelectedIndex(isSelected ? null : idx.id)}
                      className={cn(
                        "min-w-[110px] p-3 rounded-xl border text-center cursor-pointer transition-all shrink-0 bg-white",
                        isSelected 
                          ? "border-[#00AA5B] bg-emerald-50/50 shadow-xs" 
                          : "border-gray-100/90 hover:border-gray-200 shadow-2xs"
                      )}
                    >
                      <h4 className="text-xs font-extrabold text-gray-900 mb-1">{idx.name}</h4>
                      <p className={cn(
                        "text-xs font-black font-mono",
                        stat.isUp ? "text-[#00AA5B]" : "text-[#e11d48]"
                      )}>
                        {stat.formattedPct}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. SECTORS (11 OFFICIAL SECTOR CARDS IN 3-COLUMN GRID) */}
            <div className="py-4">
              <div className="px-4 mb-3">
                <h3 className="text-[15px] font-black text-gray-900 tracking-tight">
                  Sectors
                </h3>
              </div>

              {/* 3-Column Grid */}
              <div className="grid grid-cols-3 gap-2.5 px-4">
                {SECTORS_CONFIG.map((sec) => {
                  const Icon = sec.icon;
                  const stat = sectorStats[sec.id] || { avgPct: 1.0, count: 5, formattedPct: '+1.00%', isUp: true };
                  const isSelected = selectedSector === sec.id;

                  return (
                    <div
                      key={sec.id}
                      onClick={() => setSelectedSector(isSelected ? null : sec.id)}
                      className={cn(
                        "flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all cursor-pointer group bg-white",
                        isSelected 
                          ? "border-[#00AA5B] bg-emerald-50/40 shadow-xs ring-1 ring-[#00AA5B]" 
                          : "border-gray-100 hover:border-emerald-200 shadow-2xs hover:shadow-xs"
                      )}
                    >
                      {/* Icon with Subtle Circular Green Glow */}
                      <div className="w-11 h-11 rounded-full bg-emerald-50/80 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                        <Icon className="w-5 h-5 text-[#00AA5B]" strokeWidth={2.2} />
                      </div>

                      {/* Sector Title */}
                      <h4 className="text-[10px] font-extrabold text-gray-900 tracking-tight text-center truncate w-full mb-1">
                        {sec.label}
                      </h4>

                      {/* Real Calculated Average Percentage */}
                      <span className={cn(
                        "text-[11px] font-black font-mono tracking-tight",
                        stat.isUp ? "text-[#00AA5B]" : "text-[#e11d48]"
                      )}>
                        {stat.formattedPct}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. UNBOXING SAHAM (BOTTOM SECTION) */}
            <div className="py-4">
              <div className="flex items-center justify-between px-4 mb-3">
                <div>
                  <h3 className="text-[15px] font-black text-gray-900 tracking-tight">
                    Unboxing Saham
                  </h3>
                  <p className="text-[11px] text-gray-400 font-medium">
                    Riset & Analisis Mendalam Emiten Terpilih
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedResearch(UNBOXING_ARTICLES[0])}
                  className="text-xs font-bold text-[#00AA5B] flex items-center gap-0.5 hover:underline"
                >
                  <span>Selengkapnya</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#00AA5B]" strokeWidth={2.5} />
                </button>
              </div>

              {/* Horizontal Scroll Cards */}
              <div className="flex gap-3 px-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2">
                {UNBOXING_ARTICLES.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedResearch(item)}
                    className="w-[250px] shrink-0 rounded-2xl overflow-hidden shadow-lg cursor-pointer group snap-start border border-gray-800/80 relative flex flex-col justify-between h-[290px] transition-all hover:scale-[1.02] hover:shadow-xl"
                  >
                    {/* Realistic Photographic Background Image */}
                    <img 
                      src={item.bgImage} 
                      alt={item.title} 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                    />

                    {/* Dark Professional Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-gray-950/75 to-black/40 pointer-events-none" />
                    <div className="absolute inset-0 bg-black/25 pointer-events-none backdrop-blur-[0.5px]" />

                    {/* Top Watermark & Badge */}
                    <div className="p-4 relative z-10">
                      <div className="flex items-center justify-between">
                        {/* Purple "Emiten" Badge */}
                        <span className="inline-block px-2.5 py-1 rounded-md bg-[#6366F1] text-white text-[11px] font-extrabold tracking-wide shadow-md">
                          Emiten
                        </span>

                        {/* Subtle Volume Pill */}
                        <span className="text-[10px] font-bold text-gray-300 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10">
                          {item.volNumber.split(',')[0]}
                        </span>
                      </div>

                      {/* Large Watermark Symbol */}
                      <div className="mt-3 text-[32px] font-black text-emerald-400 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] tracking-tight leading-none">
                        {item.tickerBadge}
                      </div>
                    </div>

                    {/* Bottom Card Title & Subtitle */}
                    <div className="p-4 relative z-10 bg-gradient-to-t from-black via-black/90 to-transparent pt-8">
                      <h4 className="text-[13.5px] font-bold text-white leading-snug line-clamp-2 mb-1.5 group-hover:text-emerald-400 transition-colors drop-shadow-sm">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-gray-300 font-medium line-clamp-1">
                        {item.volNumber}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : activeTab === 'GLOBAL' ? (
          /* ========================================================= */
          /* VIEW 3: GLOBAL ASSETS & CRYPTO */
          /* ========================================================= */
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              <span>Saham Global & Crypto ({ALL_GLOBAL_ASSETS.filter(a => a.category !== 'Saham IDX').length})</span>
              <span>Harga (USD)</span>
            </div>

            {ALL_GLOBAL_ASSETS.filter(a => a.category !== 'Saham IDX').map((asset, idx) => {
              const q = assetQuotes[asset.symbol];
              const price = q ? q.price : asset.basePrice;
              const pct = q ? q.pctChange : 0;
              const isUp = pct >= 0;

              const formatP = (val: number) => {
                if (val < 0.01) return val.toFixed(6);
                if (val < 10) return val.toFixed(4);
                return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              };

              return (
                <div 
                  key={`global-${asset.symbol}-${idx}`}
                  onClick={() => setSelectedAsset(asset.symbol)}
                  className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100/90 hover:border-emerald-200 active:bg-gray-50 shadow-2xs transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <AssetLogo symbol={asset.symbol} size="md" className="group-hover:scale-105 transition-transform" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-extrabold text-gray-900">{asset.symbol.replace('USDT', '')}</h4>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-gray-100 text-gray-500">
                          {asset.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 truncate max-w-[150px]">{asset.name}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-black text-gray-900 font-mono">
                      ${formatP(price)}
                    </p>
                    <div className={cn(
                      "inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md mt-0.5",
                      isUp ? "bg-emerald-50 text-[#00AA5B]" : "bg-rose-50 text-[#e11d48]"
                    )}>
                      {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      <span>{isUp ? '+' : ''}{pct.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ========================================================= */
          /* VIEW 4: BONDS / REKSADANA TAB */
          /* ========================================================= */
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center text-gray-400">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
              <Layers className="w-6 h-6 text-[#00AA5B]" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">
              Produk {activeTab === 'BONDS' ? 'Obligasi & SBN' : 'Reksadana'}
            </h3>
            <p className="text-xs text-gray-400 max-w-[260px] mt-1 leading-relaxed">
              Pantau imbal hasil obligasi negara dan reksadana pasar uang terkurasi secara langsung.
            </p>
          </div>
        )}
      </div>

      {/* RESEARCH READER MODAL (UNBOXING SAHAM FULL VIEW) */}
      <ResearchReaderModal 
        research={selectedResearch} 
        onClose={() => setSelectedResearch(null)} 
      />

      {/* MODAL: VIEW ALL STOCKS DIRECTORY */}
      {showAllStocksModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-t-2xl max-h-[85vh] h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Seluruh Saham & Aset IDX</h3>
              <button 
                onClick={() => setShowAllStocksModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 overflow-y-auto space-y-1.5 flex-1">
              {ALL_GLOBAL_ASSETS.filter(a => a.category === 'Saham IDX').map((asset) => (
                <div 
                  key={asset.symbol}
                  onClick={() => {
                    setShowAllStocksModal(false);
                    setSelectedAsset(asset.symbol);
                  }}
                  className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 hover:border-emerald-200 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <AssetLogo symbol={asset.symbol} size="sm" />
                    <div>
                      <span className="text-xs font-bold text-gray-900">{asset.symbol}</span>
                      <p className="text-[11px] text-gray-500 truncate max-w-[180px]">{asset.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black font-mono">Rp {asset.basePrice.toLocaleString('id-ID')}</span>
                    <p className="text-[10px] text-emerald-600 font-bold">{asset.idxSector || 'IDX'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
