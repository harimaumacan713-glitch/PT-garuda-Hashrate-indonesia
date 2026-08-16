import React, { useState, useEffect } from 'react';
import { 
  SquarePen, Bell, Search, SlidersHorizontal, ThumbsUp, ThumbsDown, 
  Share2, DollarSign, MessageSquare, MoreHorizontal, CheckCircle2,
  TrendingUp, TrendingDown, X, Send, Heart, Flame, Smile, ArrowUpRight, Copy, Check
} from 'lucide-react';
import { cn } from '../lib/utils';
import { CreatePostPage } from './CreatePostPage';
import { db } from '../lib/firebase';
import { ref, onValue, update, push, serverTimestamp, get } from 'firebase/database';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { UserProfileAvatar } from '../components/UserProfileAvatar';
import { NotificationModal } from '../components/NotificationModal';
import { NewsReaderModal, NewsItem } from '../components/NewsReaderModal';
import { ResearchReaderModal, ResearchItem } from '../components/ResearchReaderModal';
import { RefreshCw, Sparkles, Filter, Bookmark, ExternalLink } from 'lucide-react';

type PostItem = {
  id: string;
  author: string;
  authorUid?: string;
  username?: string;
  avatar?: string;
  avatarId?: string;
  photoUrl?: string;
  isVerified?: boolean;
  time: string;
  editedTime?: string;
  text?: string;
  tags?: string[];
  sentiment?: 'BULLISH' | 'BEARISH';
  mediaUrl?: string;
  poll?: {
    question: string;
    options: { text: string; votes: number }[];
  };
  emojis?: string[];
  totalReactions?: number;
  likes?: number;
  dislikes?: number;
  comments?: number;
  commentsList?: { id: string; user: string; text: string; time: string }[];
  category?: string;
};

// Initial default high quality community posts matching user screenshot exactly
const DEFAULT_COMMUNITY_POSTS: PostItem[] = [
  {
    id: 'post_teddyed',
    author: 'teddyed',
    isVerified: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    time: '13 Aug 26, 21:49',
    text: `Malam ini saya menulis untuk kalian Trader, Ingat Trader bukan Investor.

Kebanyakan Trader itu Gagal itu karena

Sama semua strateginya menghadapi Market Bearish, Sideways atau Bullish untuk Saham Big Cap atau Saham Lapis 1 atau Saham Gorengan.

Padahal Itu BEDA JAUH

Ketika Market IHSG seperti sekarang Sideways,
Saham akan bergerak Maju Mundur,
Hari ini Koreksi, Besok bisa naik
Hari ini Naik Tinggi, Besok bisa Koreksi.
Menghadapi begini Paling aman,
Saat koreksi diperhatikan untuk beli,
Saat pasar overbought segera lakukan taking profit sebagian. Disiplin money management adalah kunci utama bertahan dalam dinamika bursa jangka panjang.`,
    emojis: ['👍', '❤️', '👎'],
    totalReactions: 516,
    likes: 470,
    dislikes: 46,
    comments: 36,
    category: 'Trending'
  },
  {
    id: 'post_senji93',
    author: 'senji93',
    isVerified: true,
    avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=200',
    time: '14 Aug 26, 05:36',
    text: `$IHSG $CUAN $DEWA`,
    tags: ['$IHSG', '$CUAN', '$DEWA'],
    mediaUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=900',
    emojis: ['👍', '😂', '🔥'],
    totalReactions: 127,
    likes: 127,
    dislikes: 0,
    comments: 0,
    category: 'Trending'
  },
  {
    id: 'post_ricky2212',
    author: 'ricky2212',
    isVerified: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    time: '13 Aug 26, 20:57',
    editedTime: 'Diedit pada 13 Aug 26, 21:13',
    text: `Beruntungnya menjadi seorang retail

Yap , saya beri judul artikel nya

" Beruntungnya menjadi seorang retail "

tapi dengan catatan yah :

=> retail yang punya passion buat menjalani dunia keuangan.`,
    emojis: ['👍', '❤️', '🔥'],
    totalReactions: 72,
    likes: 68,
    dislikes: 1,
    comments: 8,
    category: 'Trending'
  }
];

// Initial default curated Indonesian market news
const DEFAULT_LIVE_NEWS: NewsItem[] = [
  {
    id: 'news_init_1',
    title: 'BBCA Bukukan Laba Bersih Rp 48,2 Triliun Didorong Pertumbuhan Kredit Korporasi & Rasio CASA Kuat',
    summary: 'PT Bank Central Asia Tbk (BBCA) mencatatkan pertumbuhan kinerja solid dengan kenaikan laba bersih ditopang efisiensi operasional dan pertumbuhan dana murah (CASA) yang mencapai 80,4% dari total DPK.',
    keyPoints: [
      'Laba bersih konsolidasi naik 12,8% secara tahunan (YoY)',
      'Rasio CASA terjaga tinggi di level 80,4%, menekan beban bunga',
      'Rasio kredit bermasalah (NPL) gross berada di level sehat 1,8%'
    ],
    source: 'CNBC Indonesia',
    time: '12 menit lalu',
    category: 'Perbankan',
    tags: ['BBCA', 'Perbankan', 'Laba Bersih', 'CASA'],
    relatedStock: 'BBCA',
    sentiment: 'bullish',
    image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800',
    likes: 45,
    comments: 14,
    shares: 8,
    url: 'https://www.cnbcindonesia.com/market'
  },
  {
    id: 'news_init_2',
    title: 'IHSG Menguat Menembus Level Psikologis 7.400 Didukung Net Foreign Inflow Jumbo',
    summary: 'Indeks Harga Saham Gabungan (IHSG) bergerak reli didorong aksi beli bersih investor asing (foreign net buy) pada saham-saham perbankan big cap dan emiten komoditas energi terbarukan.',
    keyPoints: [
      'Net buy investor asing mencapai Rp 1,24 triliun di pasar reguler',
      'Sektor finansial dan energi menjadi penopang utama penguatan indeks',
      'Nilai transaksi harian bursa mencapai Rp 14,2 triliun'
    ],
    source: 'Bisnis.com',
    time: '28 menit lalu',
    category: 'IHSG & Pasar',
    tags: ['IHSG', 'Foreign Flow', 'Pasar Modal', 'BEI'],
    relatedStock: 'BBRI',
    sentiment: 'bullish',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800',
    likes: 38,
    comments: 9,
    shares: 4,
    url: 'https://market.bisnis.com'
  },
  {
    id: 'news_init_3',
    title: 'BBRI Salurkan Kredit UMKM Rp 1.150 Triliun, Kualitas Aset dan LAR Membaik Signifikan',
    summary: 'PT Bank Rakyat Indonesia (Persero) Tbk (BBRI) membuktikan komitmen pemberdayaan ekonomi kerakyatan dengan porsi kredit UMKM mencapai 84,2% dari total portofolio pembiayaan.',
    keyPoints: [
      'Penyaluran kredit UMKM tumbuh 9,4% YoY',
      'Rasio Loan at Risk (LAR) turun ke level 11,2% mendekati pra-pandemi',
      'Cadangan kerugian penurunan nilai (CKPN) memadai di atas 210%'
    ],
    source: 'Kontan',
    time: '45 menit lalu',
    category: 'Perbankan',
    tags: ['BBRI', 'UMKM', 'Kredit', 'Himbara'],
    relatedStock: 'BBRI',
    sentiment: 'bullish',
    image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=800',
    likes: 52,
    comments: 18,
    shares: 11,
    url: 'https://investasi.kontan.co.id'
  },
  {
    id: 'news_init_4',
    title: 'BREN dan Barito Group Perluas Portofolio Pembangkit Panas Bumi Geothermal',
    summary: 'PT Barito Renewables Energy Tbk (BREN) mempercepat ekspansi kapasitas terpasang pembangkit listrik tenaga panas bumi (PLTP) guna memenuhi lonjakan permintaan energi hijau kawasan industri.',
    keyPoints: [
      'Target penambahan kapasitas 250 MW dalam 3 tahun ke depan',
      'Skema kontrak PPA jangka panjang menjamin stabilitas pendapatan USD',
      'Potensi monetisasi sertifikat kredit karbon internasional'
    ],
    source: 'Investor Daily',
    time: '1 jam lalu',
    category: 'Komoditas',
    tags: ['BREN', 'EBT', 'Geothermal', 'Energi Hijau'],
    relatedStock: 'BREN',
    sentiment: 'bullish',
    image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&q=80&w=800',
    likes: 31,
    comments: 7,
    shares: 3,
    url: 'https://investortrust.id'
  },
  {
    id: 'news_init_5',
    title: 'TLKM Geber Ekspansi Data Center Hyper-Scale & Bisnis B2B Digital Infra',
    summary: 'PT Telkom Indonesia (Persero) Tbk (TLKM) memperkuat ekosistem NeutraDC untuk menangkap peluang adopsi teknologi AI dan komputasi awan yang melonjak pesat di Asia Tenggara.',
    keyPoints: [
      'Pemanfaatan kapasitas data center Cikarang dan Batam meningkat',
      'Pendapatan segmen enterprise dan data center tumbuh dua digit',
      'Rasio EBITDA margin tetap terjaga kuat di kisaran 50%'
    ],
    source: 'Bloomberg Technoz',
    time: '2 jam lalu',
    category: 'Teknologi',
    tags: ['TLKM', 'Data Center', 'Telekomunikasi', 'AI'],
    relatedStock: 'TLKM',
    sentiment: 'neutral',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800',
    likes: 27,
    comments: 6,
    shares: 2,
    url: 'https://www.bloombergtechnoz.com'
  }
];

// Initial default curated Indonesian market research
const DEFAULT_LIVE_RESEARCH: ResearchItem[] = [
  {
    id: 'res_init_1',
    title: 'Unboxing Big 4 Bank: Likuiditas Ketat & Strategi Pertumbuhan Kredit Berkualitas',
    subtitle: 'Analisis Performa NIM, CASA, dan Prospek Dividen BBCA, BBRI, BMRI, BBNI',
    author: 'Stockbit Research • Banking Sector',
    date: 'Hari ini',
    category: 'Unboxing',
    rating: 'OVERWEIGHT',
    targetPrice: 'BBRI Rp 5.900 (+21%) | BBCA Rp 11.200 (+14%)',
    relatedTicker: 'BBRI',
    executiveSummary: 'Sektor perbankan Indonesia tetap menunjukkan ketahanan struktural luar biasa dengan Return on Equity (ROE) industri di atas 18%. Pertumbuhan kredit ditopang oleh segmen korporasi dan UMKM, sementara rasio CASA yang tinggi memberikan bantalan kuat terhadap biaya dana (CoF).',
    investmentThesis: [
      'Dominasi CASA menjaga margin bunga bersih (NIM) tetap sehat di kisaran 5.2% - 7.6%',
      'Kualitas aset membaik dengan penurunan rasio Loan at Risk (LAR) ke level pra-pandemi',
      'Kekuatan permodalan (CAR > 24%) membuka ruang pembagian dividen jumbo payout ratio 70-80%'
    ],
    keyMetrics: {
      peRatio: '13.2x (Fwd)',
      pbvRatio: '2.4x',
      roe: '19.8%',
      dividendYield: '5.8%'
    },
    catalysts: [
      'Potensi pelonggaran suku bunga acuan BI di semester kedua',
      'Pertumbuhan kredit korporasi seiring hilirisasi industri dan manufaktur'
    ],
    risks: [
      'Persaingan likuiditas DPK yang dapat mengerek biaya dana perbankan',
      'Volatilitas kurs rupiah terhadap dolar AS'
    ],
    image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800',
    likes: 142,
    comments: 38,
    reads: '4.8k dibaca'
  },
  {
    id: 'res_init_2',
    title: 'Macro Outlook 2026: Navigasi Inflasi, Suku Bunga Global, dan Arah IHSG',
    subtitle: 'Strategi Alokasi Aset Ekuitas di Tengah Dinamika Kebijakan The Fed & Bank Indonesia',
    author: 'Garuda Inves Macro Strategy Team',
    date: 'Hari ini',
    category: 'Macro',
    rating: 'BUY',
    targetPrice: 'Target Konsensus IHSG: 7.650',
    relatedTicker: 'IHSG',
    executiveSummary: 'Perekonomian domestik diproyeksikan tumbuh solid di kisaran 5.1% - 5.3% didukung konsumsi rumah tangga yang kokoh dan investasi modal tetap. Kami merekomendasikan strategi alokasi overweight pada saham perbankan, konsumer primer, dan infrastruktur telekomunikasi.',
    investmentThesis: [
      'Surplus neraca perdagangan berlanjut menopang cadangan devisa Bank Indonesia',
      'Valuasi IHSG di P/E 13.5x berada di bawah rata-rata historis 5 tahun (15.2x), menyajikan risk-reward menarik',
      'Pertumbuhan laba per saham (EPS Growth) emiten BEI diproyeksikan tumbuh 8.5% YoY'
    ],
    keyMetrics: {
      peRatio: '13.5x',
      pbvRatio: '1.9x',
      roe: '14.2%',
      dividendYield: '4.2%'
    },
    catalysts: [
      'Inflow dana investor asing ke pasar negara berkembang (Emerging Markets)',
      'Realisasi belanja APBN untuk proyek strategis nasional'
    ],
    risks: [
      'Tekanan geopolitik global dan fluktuasi harga energi impor',
      'Kenaikan yield US Treasury 10-tahun'
    ],
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800',
    likes: 96,
    comments: 24,
    reads: '3.9k dibaca'
  },
  {
    id: 'res_init_3',
    title: 'Strategi Dividend Investing: Berburu Saham Cash Cow Ber-Yield Di Atas 7%',
    subtitle: 'Screening Saham dengan FCF Kuat, Rasio Utang Rendah, dan Riwayat Pembagian Konsisten',
    author: 'Garuda Inves Dividend Strategy',
    date: 'Kemarin',
    category: 'Dividend Strategy',
    rating: 'BUY',
    targetPrice: 'Top Picks: PTBA, ADRO, MPMX, ASII',
    relatedTicker: 'PTBA',
    executiveSummary: 'Di tengah volatilitas pasar global, strategi investasi dividen (dividend growth investing) menawarkan total return yang unggul dengan kombinasi yield dividen tunai tinggi dan potensi apresiasi modal jangka panjang.',
    investmentThesis: [
      'Free Cash Flow (FCF) yang melimpah memberikan bantalan likuiditas pembagian dividen',
      'Rasio Debt-to-Equity (DER) di bawah 0.5x menandakan struktur permodalan yang sangat konservatif',
      'Track record pembagian dividen tanpa henti selama lebih dari 10 tahun berturut-turut'
    ],
    keyMetrics: {
      peRatio: '7.8x',
      pbvRatio: '1.4x',
      roe: '17.6%',
      dividendYield: '8.4%'
    },
    catalysts: [
      'Pengumuman jadwal cum-date dan dividen final di musim RUPS',
      'Kenaikan porsi laba bersih yang dialokasikan sebagai dividen tunai'
    ],
    risks: [
      'Penurunan harga komoditas global yang dapat mempengaruhi laba tahun depan',
      'Dividend trap pada emiten dengan penurunan prospek bisnis inti'
    ],
    image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=800',
    likes: 118,
    comments: 31,
    reads: '5.1k dibaca'
  }
];

export function StreamPage({ onOpenProfile }: { onOpenProfile?: () => void }) {
  const { user } = useAuth();
  const { unreadCount } = useNotification();
  const activeUid = user ? user.uid : 'demo_user';
  const defaultUsername = user?.email ? user.email.split('@')[0] : 'investor_user';
  const [currentUsername, setCurrentUsername] = useState(defaultUsername);
  const [userAvatarId, setUserAvatarId] = useState('cat_glasses');
  const [userCustomPhotoUrl, setUserCustomPhotoUrl] = useState<string | null>(null);

  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'STREAM' | 'BERITA' | 'RISET'>('STREAM');
  const [activeFilter, setActiveFilter] = useState('Trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [streamPosts, setStreamPosts] = useState<PostItem[]>([]);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [dislikedPosts, setDislikedPosts] = useState<Record<string, boolean>>({});
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});
  const [activeCommentPost, setActiveCommentPost] = useState<PostItem | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [activeTipPost, setActiveTipPost] = useState<PostItem | null>(null);
  const [tipSuccess, setTipSuccess] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Tautan stream berhasil disalin');

  // Dynamic Live News & Research states with immediate rich defaults
  const [liveNews, setLiveNews] = useState<NewsItem[]>(DEFAULT_LIVE_NEWS);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [newsCategory, setNewsCategory] = useState('Semua');
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [likedNews, setLikedNews] = useState<Record<string | number, boolean>>({});
  const [dislikedNews, setDislikedNews] = useState<Record<string | number, boolean>>({});

  const [liveResearch, setLiveResearch] = useState<ResearchItem[]>(DEFAULT_LIVE_RESEARCH);
  const [isLoadingResearch, setIsLoadingResearch] = useState(false);
  const [researchCategory, setResearchCategory] = useState('Semua');
  const [selectedResearch, setSelectedResearch] = useState<ResearchItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastNewsUpdate, setLastNewsUpdate] = useState<string>('Baru saja');

  const filterTabs = [
    'Trending', 'Followed', 'All', 'People', 'Watchlist', 'Laporan', 'Insider'
  ];

  const newsCategories = [
    'Semua', 'IHSG & Pasar', 'Emiten', 'Perbankan', 'Komoditas', 'Teknologi'
  ];

  const researchCategories = [
    'Semua', 'Unboxing', 'Sectoral Outlook', 'Macro', 'Dividend Strategy', 'Academy', 'Snips'
  ];

  // Fetch live news from server with robust error handling & fallback
  const fetchLiveNews = async (force = false) => {
    try {
      setIsLoadingNews(true);
      const res = await fetch(`/api/news${force ? '?refresh=true' : ''}`);
      if (!res.ok) {
        return;
      }
      const data = await res.json();
      if (data && data.success && Array.isArray(data.news) && data.news.length > 0) {
        setLiveNews(data.news);
        setLastNewsUpdate('Baru saja');
      }
    } catch (err) {
      console.warn('Network notice: using cached live news');
    } finally {
      setIsLoadingNews(false);
    }
  };

  // Fetch live research from server with robust error handling & fallback
  const fetchLiveResearch = async (force = false) => {
    try {
      setIsLoadingResearch(true);
      const res = await fetch(`/api/research${force ? '?refresh=true' : ''}`);
      if (!res.ok) {
        return;
      }
      const data = await res.json();
      if (data && data.success && Array.isArray(data.research) && data.research.length > 0) {
        setLiveResearch(data.research);
      }
    } catch (err) {
      console.warn('Network notice: using cached live research');
    } finally {
      setIsLoadingResearch(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchLiveNews();
    fetchLiveResearch();
  }, []);

  // Fetch on tab switch if empty
  useEffect(() => {
    if (activeTab === 'BERITA' && liveNews.length === 0) {
      fetchLiveNews();
    } else if (activeTab === 'RISET' && liveResearch.length === 0) {
      fetchLiveResearch();
    }
  }, [activeTab]);

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    if (activeTab === 'BERITA') {
      await fetchLiveNews(true);
      setToastMessage('Berita bursa berhasil diperbarui!');
    } else if (activeTab === 'RISET') {
      await fetchLiveResearch(true);
      setToastMessage('Laporan riset berhasil diperbarui!');
    } else {
      await Promise.all([fetchLiveNews(true), fetchLiveResearch(true)]);
      setToastMessage('Data stream berhasil disinkronkan!');
    }
    setIsRefreshing(false);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  const handleToggleNewsLike = (newsId: string | number) => {
    setLikedNews(prev => ({ ...prev, [newsId]: !prev[newsId] }));
    if (dislikedNews[newsId]) {
      setDislikedNews(prev => ({ ...prev, [newsId]: false }));
    }
  };

  const handleToggleNewsDislike = (newsId: string | number) => {
    setDislikedNews(prev => ({ ...prev, [newsId]: !prev[newsId] }));
    if (likedNews[newsId]) {
      setLikedNews(prev => ({ ...prev, [newsId]: false }));
    }
  };

  const handleShareNews = (item: NewsItem, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText?.(item.url || `https://stockbit.com/news/${item.id}`);
    setToastMessage('Tautan berita berhasil disalin');
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  const handleShareResearch = (item: ResearchItem, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText?.(`https://stockbit.com/research/${item.id}`);
    setToastMessage('Tautan laporan riset berhasil disalin');
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  // Fetch user profile avatar in real-time
  useEffect(() => {
    const profileRef = ref(db, `users/${activeUid}/profileData`);
    const unsubscribeProfile = onValue(profileRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data.username) setCurrentUsername(data.username);
        else if (data.displayName) setCurrentUsername(data.displayName.replace(/\s+/g, '_').toLowerCase());
        if (data.avatarId) setUserAvatarId(data.avatarId);
        if (data.photoUrl) setUserCustomPhotoUrl(data.photoUrl);
        else if (data.customPhotoUrl) setUserCustomPhotoUrl(data.customPhotoUrl);
      }
    });

    return () => unsubscribeProfile();
  }, [activeUid]);

  // Real-time listener for posts from Firebase
  useEffect(() => {
    const postsRef = ref(db, 'posts');
    const unsubscribe = onValue(postsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const firebaseList: PostItem[] = Object.entries(data).map(([key, value]: [string, any]) => ({
          ...value,
          id: key,
          time: value.time || 'Baru saja',
          isVerified: value.isVerified ?? true,
          emojis: value.emojis || ['👍', '❤️', '🔥'],
          totalReactions: value.totalReactions || value.likes || 1,
          likes: value.likes || 0,
          dislikes: value.dislikes || 0,
          comments: value.comments || 0
        })).sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));

        // Combine Firebase posts with default realistic posts
        setStreamPosts([...firebaseList, ...DEFAULT_COMMUNITY_POSTS]);
      } else {
        setStreamPosts(DEFAULT_COMMUNITY_POSTS);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleToggleLike = (postId: string) => {
    const isLiked = likedPosts[postId];
    const isDisliked = dislikedPosts[postId];

    setLikedPosts(prev => ({ ...prev, [postId]: !isLiked }));
    if (isDisliked) {
      setDislikedPosts(prev => ({ ...prev, [postId]: false }));
    }

    setStreamPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const newLikes = isLiked ? Math.max(0, (p.likes || 1) - 1) : (p.likes || 0) + 1;
        const newDislikes = isDisliked ? Math.max(0, (p.dislikes || 1) - 1) : (p.dislikes || 0);
        return {
          ...p,
          likes: newLikes,
          dislikes: newDislikes,
          totalReactions: (p.totalReactions || 0) + (isLiked ? -1 : 1)
        };
      }
      return p;
    }));

    if (!postId.startsWith('post_')) {
      const postRef = ref(db, `posts/${postId}`);
      update(postRef, {
        likes: isLiked ? Math.max(0, (streamPosts.find(p => p.id === postId)?.likes || 1) - 1) : ((streamPosts.find(p => p.id === postId)?.likes || 0) + 1)
      }).catch(() => {});
    }
  };

  const handleToggleDislike = (postId: string) => {
    const isDisliked = dislikedPosts[postId];
    const isLiked = likedPosts[postId];

    setDislikedPosts(prev => ({ ...prev, [postId]: !isDisliked }));
    if (isLiked) {
      setLikedPosts(prev => ({ ...prev, [postId]: false }));
    }

    setStreamPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          dislikes: isDisliked ? Math.max(0, (p.dislikes || 1) - 1) : (p.dislikes || 0) + 1,
          likes: isLiked ? Math.max(0, (p.likes || 1) - 1) : (p.likes || 0)
        };
      }
      return p;
    }));
  };

  const handleAddComment = () => {
    if (!commentInput.trim() || !activeCommentPost) return;

    const newComment = {
      id: Date.now().toString(),
      user: currentUsername || defaultUsername,
      text: commentInput.trim(),
      time: 'Baru saja'
    };

    setStreamPosts(prev => prev.map(p => {
      if (p.id === activeCommentPost.id) {
        return {
          ...p,
          comments: (p.comments || 0) + 1,
          commentsList: [...(p.commentsList || []), newComment]
        };
      }
      return p;
    }));

    setActiveCommentPost(prev => prev ? ({
      ...prev,
      comments: (prev.comments || 0) + 1,
      commentsList: [...(prev.commentsList || []), newComment]
    }) : null);

    setCommentInput('');
  };

  const handleSharePost = (post: PostItem) => {
    navigator.clipboard?.writeText?.(`https://stockbit.com/post/${post.id}`);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  const filteredPosts = streamPosts.filter(post => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      post.author?.toLowerCase().includes(query) ||
      post.text?.toLowerCase().includes(query) ||
      post.tags?.some(t => t.toLowerCase().includes(query))
    );
  });

  const filteredNews = liveNews.filter(item => {
    const matchesCategory = newsCategory === 'Semua' || 
      (newsCategory === 'IHSG & Pasar' && (item.category?.includes('IHSG') || item.category?.includes('Pasar') || item.tags?.includes('IHSG'))) ||
      (newsCategory === 'Emiten' && (item.category?.includes('Emiten') || !!item.relatedStock)) ||
      (newsCategory === 'Perbankan' && (item.category?.includes('Perbankan') || item.tags?.some(t => ['BBCA', 'BBRI', 'BMRI', 'BBNI'].includes(t)))) ||
      (newsCategory === 'Komoditas' && (item.category?.includes('Komoditas') || item.category?.includes('Energi') || item.tags?.some(t => ['ADRO', 'PTBA', 'ANTM', 'MDKA', 'INCO'].includes(t)))) ||
      (newsCategory === 'Teknologi' && (item.category?.includes('Teknologi') || item.category?.includes('Telko') || item.tags?.some(t => ['TLKM', 'GOTO', 'EMTK'].includes(t)))) ||
      Boolean(item.category?.toLowerCase().includes(newsCategory.toLowerCase()));

    if (!searchQuery) return matchesCategory;
    const q = searchQuery.toLowerCase();
    return matchesCategory && (
      item.title?.toLowerCase().includes(q) ||
      item.summary?.toLowerCase().includes(q) ||
      item.source?.toLowerCase().includes(q) ||
      item.relatedStock?.toLowerCase().includes(q) ||
      item.tags?.some(t => t.toLowerCase().includes(q))
    );
  });

  const filteredResearch = liveResearch.filter(item => {
    const matchesCategory = researchCategory === 'Semua' ||
      Boolean(item.category?.toLowerCase().includes(researchCategory.toLowerCase()));

    if (!searchQuery) return matchesCategory;
    const q = searchQuery.toLowerCase();
    return matchesCategory && (
      item.title?.toLowerCase().includes(q) ||
      item.subtitle?.toLowerCase().includes(q) ||
      item.executiveSummary?.toLowerCase().includes(q) ||
      item.author?.toLowerCase().includes(q) ||
      item.relatedTicker?.toLowerCase().includes(q)
    );
  });

  if (showCreatePost) {
    return (
      <CreatePostPage 
        onClose={() => setShowCreatePost(false)}
        onPostCreated={(newP) => {
          setStreamPosts(prev => [newP, ...prev]);
          setActiveTab('STREAM');
        }}
      />
    );
  }

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Toast Notification */}
      {copiedToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-gray-900/90 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-fade-in">
          <Check className="w-3.5 h-3.5 text-[#00B26A]" />
          {toastMessage}
        </div>
      )}

      {/* Top Header - Matching Screenshot */}
      <header className="flex h-13 items-center justify-between px-4 bg-white sticky top-0 z-20 border-b border-gray-100">
        {/* Left: User Avatar with blue badge/star */}
        <button 
          onClick={onOpenProfile} 
          className="relative shrink-0 active:scale-95 transition-transform"
        >
          <UserProfileAvatar 
            avatarId={userAvatarId} 
            customPhotoUrl={userCustomPhotoUrl} 
            size="sm" 
          />
          <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-[#00B26A] text-[8px] font-bold text-white flex items-center justify-center border-1.5 border-white shadow-xs">
            10
          </span>
        </button>

        {/* Center: Stockbit Official Wordmark / Logo */}
        <div className="flex items-center gap-1">
          <div className="flex items-baseline">
            <span className="text-lg font-bold tracking-tight text-gray-900">Stock</span>
            <span className="text-lg font-bold tracking-tight text-gray-900 relative">
              bit
              <svg className="w-3 h-3 text-[#00B26A] inline-block ml-0.5 -mt-2.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 17h3v4H3v-4zm6-6h3v10H9V11zm6-6h3v16h-3V5zm6 4h3v12h-3V9z"/>
              </svg>
            </span>
          </div>
        </div>

        {/* Right: Pencil Edit + Bell Notification Badge */}
        <div className="flex items-center gap-3.5 text-gray-600">
          <button 
            onClick={() => setShowCreatePost(true)}
            className="hover:text-[#00B26A] text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
            title="Tulis Postingan"
          >
            <SquarePen className="h-5 w-5" strokeWidth={1.8} />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowNotificationModal(true)}
              className="hover:text-gray-900 p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              title="Notifikasi"
            >
              <Bell className="h-5 w-5" strokeWidth={1.8} />
            </button>
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-xs">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Tabs (STREAM, BERITA, RISET) */}
      <div className="flex px-4 border-b border-gray-100 bg-white sticky top-13 z-20">
        <button
          onClick={() => setActiveTab('STREAM')}
          className={cn(
            "flex-1 py-3 text-xs font-bold tracking-wider relative transition-colors",
            activeTab === 'STREAM' ? "text-[#00B26A]" : "text-gray-400 hover:text-gray-600"
          )}
        >
          STREAM
          {activeTab === 'STREAM' && (
            <div className="absolute bottom-0 left-1/2 h-[2.5px] w-full max-w-[50%] -translate-x-1/2 bg-[#00B26A] rounded-t-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('BERITA')}
          className={cn(
            "flex-1 py-3 text-xs font-bold tracking-wider relative transition-colors",
            activeTab === 'BERITA' ? "text-[#00B26A]" : "text-gray-400 hover:text-gray-600"
          )}
        >
          BERITA
          {activeTab === 'BERITA' && (
            <div className="absolute bottom-0 left-1/2 h-[2.5px] w-full max-w-[50%] -translate-x-1/2 bg-[#00B26A] rounded-t-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('RISET')}
          className={cn(
            "flex-1 py-3 text-xs font-bold tracking-wider relative flex items-center justify-center gap-1.5 transition-colors",
            activeTab === 'RISET' ? "text-[#00B26A]" : "text-gray-400 hover:text-gray-600"
          )}
        >
          RISET
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#00B26A] text-[10px] text-white font-bold">
            1
          </span>
          {activeTab === 'RISET' && (
            <div className="absolute bottom-0 left-1/2 h-[2.5px] w-full max-w-[50%] -translate-x-1/2 bg-[#00B26A] rounded-t-full" />
          )}
        </button>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar bg-white">
        {activeTab === 'STREAM' && (
          <>
            {/* Search Stream Input */}
            <div className="px-4 pt-3 pb-2 bg-white">
              <div className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 focus-within:border-[#00B26A] transition-colors">
                <Search className="h-4 w-4 text-gray-400 shrink-0" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari Stream" 
                  className="flex-1 bg-transparent text-xs text-gray-800 outline-none placeholder:text-gray-400 font-normal" 
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')}>
                    <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Horizontal Filter Pills Row */}
            <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto no-scrollbar border-b border-gray-100 bg-white">
              {filterTabs.map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={cn(
                      "px-3.5 py-1 rounded-full text-xs whitespace-nowrap transition-all shrink-0",
                      isActive
                        ? "border border-[#00B26A] text-[#00B26A] bg-[#00B26A]/5 font-semibold"
                        : "border border-gray-200 text-gray-600 hover:border-gray-300 font-normal"
                    )}
                  >
                    {filter}
                  </button>
                );
              })}
              <button className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 shrink-0">
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Stream Feed Posts */}
            <div className="divide-y divide-gray-100">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => {
                  const isExpanded = expandedPosts[post.id];
                  const isLiked = likedPosts[post.id];
                  const isDisliked = dislikedPosts[post.id];
                  const textLength = post.text?.length || 0;
                  const shouldTruncate = textLength > 280 && !isExpanded;

                  return (
                    <article key={post.id} className="p-4 bg-white hover:bg-gray-50/40 transition-colors">
                      {/* Post Header: Avatar, Name, Verified Badge, Time, Menu */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {post.avatarId || post.photoUrl ? (
                            <UserProfileAvatar 
                              avatarId={post.avatarId} 
                              customPhotoUrl={post.photoUrl || post.avatar} 
                              size="md" 
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-gray-100 shrink-0">
                              <img 
                                src={post.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${post.author}&backgroundColor=b6e3f4`} 
                                alt={post.author} 
                                className="w-full h-full object-cover" 
                              />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[13.5px] font-bold text-gray-900 hover:underline cursor-pointer">
                                {post.author}
                              </span>
                              {post.isVerified && (
                                <svg className="w-3.5 h-3.5 text-gray-400 fill-current" viewBox="0 0 24 24">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                </svg>
                              )}
                              {post.sentiment && (
                                <span className={cn(
                                  "text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ml-1",
                                  post.sentiment === 'BULLISH' 
                                    ? "bg-emerald-50 text-[#00B26A]" 
                                    : "bg-rose-50 text-[#e11d48]"
                                )}>
                                  {post.sentiment === 'BULLISH' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                  {post.sentiment}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-gray-400 mt-0.5">
                              {post.time}
                              {post.editedTime && ` • ${post.editedTime}`}
                            </div>
                          </div>
                        </div>

                        {/* Top Right More Options */}
                        <button 
                          onClick={() => handleSharePost(post)}
                          className="text-gray-400 hover:text-gray-600 p-1"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Tagged Cashtags (if any separately) */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2 font-bold text-[13.5px] text-[#00B26A]">
                          {post.tags.map((t, idx) => (
                            <span key={idx} className="cursor-pointer hover:underline">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Post Content Text */}
                      {post.text && (
                        <div className="text-[13.5px] text-gray-800 leading-relaxed whitespace-pre-line mb-3">
                          {shouldTruncate ? (
                            <>
                              {post.text.slice(0, 280)}...
                              <button 
                                onClick={() => setExpandedPosts(prev => ({ ...prev, [post.id]: true }))}
                                className="text-[#00B26A] text-xs font-semibold ml-1 cursor-pointer hover:underline block mt-1"
                              >
                                Baca selengkapnya
                              </button>
                            </>
                          ) : (
                            <>
                              {post.text.split(/(\$[A-Z0-9]+)/g).map((chunk: string, i: number) => {
                                if (chunk.startsWith('$')) {
                                  return (
                                    <span key={i} className="font-bold text-[#00B26A] cursor-pointer hover:underline">
                                      {chunk}
                                    </span>
                                  );
                                }
                                return chunk;
                              })}
                              {textLength > 280 && isExpanded && (
                                <button 
                                  onClick={() => setExpandedPosts(prev => ({ ...prev, [post.id]: false }))}
                                  className="text-[#00B26A] text-xs font-semibold ml-1 cursor-pointer hover:underline block mt-1"
                                >
                                  Tutup
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      )}

                      {/* Media Image Attachment (Full width or Rounded) */}
                      {post.mediaUrl && (
                        <div className="mb-3 rounded-lg overflow-hidden border border-gray-100 bg-black/5">
                          <img 
                            src={post.mediaUrl} 
                            alt="Stream attachment" 
                            className="w-full object-cover max-h-[380px]" 
                          />
                        </div>
                      )}

                      {/* Poll Display if applicable */}
                      {post.poll && post.poll.options && (
                        <div className="mb-3 p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                          <p className="text-xs font-bold text-gray-800">{post.poll.question || 'Polling'}</p>
                          {post.poll.options.map((opt, idx) => (
                            <button
                              key={idx}
                              className="w-full py-2 px-3 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 text-left hover:border-[#00B26A] hover:bg-green-50/30 transition-all flex items-center justify-between"
                            >
                              <span>{opt.text}</span>
                              <span className="text-[11px] text-gray-400 font-bold">{opt.votes || 0} suara</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Emoji Reactions Summary Row (e.g., 👍 💖 👎 516) */}
                      <div className="flex items-center gap-1.5 mb-2.5 text-xs text-gray-500">
                        <div className="flex items-center -space-x-1">
                          {post.emojis && post.emojis.map((emoji, idx) => (
                            <span key={idx} className="text-sm">
                              {emoji}
                            </span>
                          ))}
                        </div>
                        <span className="text-xs font-medium text-gray-500 ml-1">
                          {post.totalReactions || post.likes || 0}
                        </span>
                      </div>

                      {/* Action Bar (ThumbsUp, ThumbsDown, Share, Dollar, Comments) */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-gray-400">
                        <div className="flex items-center gap-5">
                          {/* Like button */}
                          <button 
                            onClick={() => handleToggleLike(post.id)}
                            className={cn(
                              "flex items-center gap-1 transition-colors p-1 -m-1",
                              isLiked ? "text-[#00B26A]" : "hover:text-gray-700"
                            )}
                            title="Suka"
                          >
                            <ThumbsUp className={cn("w-4 h-4", isLiked && "fill-[#00B26A]")} strokeWidth={1.5} />
                          </button>

                          {/* Dislike button */}
                          <button 
                            onClick={() => handleToggleDislike(post.id)}
                            className={cn(
                              "flex items-center gap-1 transition-colors p-1 -m-1",
                              isDisliked ? "text-rose-500" : "hover:text-gray-700"
                            )}
                            title="Tidak suka"
                          >
                            <ThumbsDown className={cn("w-4 h-4", isDisliked && "fill-rose-500")} strokeWidth={1.5} />
                          </button>

                          {/* Share button */}
                          <button 
                            onClick={() => handleSharePost(post)}
                            className="flex items-center gap-1 hover:text-gray-700 p-1 -m-1 transition-colors"
                            title="Bagikan"
                          >
                            <Share2 className="w-4 h-4" strokeWidth={1.5} />
                          </button>

                          {/* Tipping / Donation Dollar Sign */}
                          <button 
                            onClick={() => setActiveTipPost(post)}
                            className="flex items-center gap-1 hover:text-[#00B26A] p-1 -m-1 transition-colors"
                            title="Beri Tip"
                          >
                            <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px] font-bold">
                              $
                            </div>
                          </button>
                        </div>

                        {/* Comment Count on Far Right */}
                        <button 
                          onClick={() => setActiveCommentPost(post)}
                          className="flex items-center gap-1.5 text-xs hover:text-gray-700 p-1 -m-1 transition-colors"
                        >
                          <span className="text-xs font-medium text-gray-500">{post.comments || 0}</span>
                          <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center px-4">
                  <p className="text-sm font-semibold text-gray-500 mb-3">Tidak ada postingan stream</p>
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="px-4 py-2 bg-[#00B26A] text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    Tulis Postingan Pertama
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* BERITA TAB */}
        {activeTab === 'BERITA' && (
          <div className="divide-y divide-gray-100">
            {/* Top Search & Refresh Bar */}
            <div className="p-3 bg-white space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="flex h-9 flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/70 px-3 focus-within:border-[#00B26A] focus-within:bg-white transition-all">
                  <Search className="h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari berita emiten, IHSG, atau topik..."
                    className="flex-1 bg-transparent text-xs text-gray-800 outline-none placeholder:text-gray-400"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="p-0.5 text-gray-400 hover:text-gray-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  onClick={handleRefreshAll}
                  disabled={isRefreshing || isLoadingNews}
                  className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-emerald-50 text-[#00B26A] border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors shrink-0 disabled:opacity-50"
                  title="Perbarui Berita Terkini"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", (isRefreshing || isLoadingNews) && "animate-spin")} />
                  <span className="hidden sm:inline">Perbarui</span>
                </button>
              </div>

              {/* Status and Category Chips */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00B26A]"></span>
                  </span>
                  <span>Live Bursa Indonesia</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-[10px] text-gray-400">{lastNewsUpdate}</span>
                </div>
                <span className="text-[11px] font-semibold text-gray-500">
                  {filteredNews.length} Berita
                </span>
              </div>

              {/* Horizontal Scrollable Filter Chips */}
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-1">
                {newsCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setNewsCategory(cat)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all",
                      newsCategory === cat
                        ? "bg-[#00B26A] text-white shadow-xs"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* News List */}
            {isLoadingNews && liveNews.length === 0 ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse flex gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-5/6" />
                      <div className="h-3 bg-gray-200 rounded w-4/6" />
                      <div className="h-3 bg-gray-200 rounded w-1/3 mt-2" />
                    </div>
                    <div className="w-20 h-16 bg-gray-200 rounded-lg shrink-0" />
                  </div>
                ))}
              </div>
            ) : filteredNews.length > 0 ? (
              filteredNews.map((item) => {
                const isLiked = likedNews[item.id];
                const isDisliked = dislikedNews[item.id];

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedNews(item)}
                    className="p-4 bg-white hover:bg-emerald-50/20 transition-all cursor-pointer group"
                  >
                    <div className="flex gap-3 justify-between items-start">
                      <div className="flex-1 pr-2">
                        {/* Badges */}
                        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                          {item.relatedStock && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-[#00B26A] font-bold text-[10px] border border-emerald-200">
                              ${item.relatedStock}
                            </span>
                          )}
                          {item.sentiment && (
                            <span
                              className={cn(
                                "px-1.5 py-0.5 rounded text-[10px] font-bold",
                                item.sentiment === 'bullish' && "bg-green-50 text-green-700",
                                item.sentiment === 'bearish' && "bg-red-50 text-red-700",
                                item.sentiment === 'neutral' && "bg-gray-100 text-gray-600"
                              )}
                            >
                              {item.sentiment === 'bullish' ? 'Bullish' : item.sentiment === 'bearish' ? 'Bearish' : 'Netral'}
                            </span>
                          )}
                          <span className="text-[11px] text-gray-400 font-medium">
                            {item.category}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-[13.5px] font-bold text-gray-900 leading-snug mb-1.5 group-hover:text-[#00B26A] transition-colors line-clamp-2">
                          {item.title}
                        </h4>

                        {/* Summary preview */}
                        <p className="text-xs text-gray-500 line-clamp-2 mb-2 leading-relaxed">
                          {item.summary}
                        </p>

                        {/* Source and Time */}
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span className="inline-block w-4 h-4 rounded bg-blue-100 text-blue-700 font-bold text-[9px] text-center leading-4">
                            {item.source.charAt(0)}
                          </span>
                          <span className="font-semibold text-gray-600">{item.source}</span>
                          <span>•</span>
                          <span>{item.time}</span>
                        </div>
                      </div>

                      {/* Image */}
                      <div className="w-22 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100 shadow-xs relative">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50 text-gray-400 text-xs">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleNewsLike(item.id);
                          }}
                          className={cn(
                            "flex items-center gap-1 transition-colors hover:text-gray-700",
                            isLiked && "text-[#00B26A] font-bold"
                          )}
                        >
                          <ThumbsUp className="w-4 h-4" strokeWidth={1.5} fill={isLiked ? "currentColor" : "none"} />
                          <span>{(item.likes || 0) + (isLiked ? 1 : 0)}</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleNewsDislike(item.id);
                          }}
                          className={cn(
                            "flex items-center gap-1 transition-colors hover:text-gray-700",
                            isDisliked && "text-red-500 font-bold"
                          )}
                        >
                          <ThumbsDown className="w-4 h-4" strokeWidth={1.5} fill={isDisliked ? "currentColor" : "none"} />
                        </button>
                        <button
                          onClick={(e) => handleShareNews(item, e)}
                          className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                          title="Bagikan"
                        >
                          <Share2 className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 text-[#00B26A] font-semibold text-xs">
                        <span>Baca Lengkap</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-16 text-center px-4">
                <p className="text-sm font-semibold text-gray-600 mb-1">Tidak ada berita ditemukan</p>
                <p className="text-xs text-gray-400 mb-4">Coba cari dengan kata kunci lain atau perbarui feed berita.</p>
                <button
                  onClick={() => { setSearchQuery(''); setNewsCategory('Semua'); fetchLiveNews(true); }}
                  className="px-4 py-2 bg-[#00B26A] text-white text-xs font-bold rounded-xl"
                >
                  Reset Filter & Muat Ulang
                </button>
              </div>
            )}
          </div>
        )}

        {/* RISET TAB */}
        {activeTab === 'RISET' && (
          <div>
            {/* Top Quick Tools & Academy Grid */}
            <div className="grid grid-cols-4 gap-2 px-4 py-4 border-b border-gray-100 text-center bg-gray-50/50">
              <div
                onClick={() => setResearchCategory('Academy')}
                className="flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="w-11 h-11 rounded-2xl bg-blue-100/80 text-blue-600 flex items-center justify-center shadow-xs">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                </div>
                <span className="text-[11px] font-bold text-gray-700">Academy</span>
              </div>
              <div
                onClick={() => setResearchCategory('Unboxing')}
                className="flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="w-11 h-11 rounded-2xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center shadow-xs">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                </div>
                <span className="text-[11px] font-bold text-gray-700">Unboxing</span>
              </div>
              <div
                onClick={() => setResearchCategory('Sectoral Outlook')}
                className="flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="w-11 h-11 rounded-2xl bg-purple-100/80 text-purple-600 flex items-center justify-center shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-gray-700">Sectoral</span>
              </div>
              <div
                onClick={() => setResearchCategory('Snips')}
                className="flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="w-11 h-11 rounded-2xl bg-amber-100/80 text-amber-600 flex items-center justify-center shadow-xs">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2  0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                </div>
                <span className="text-[11px] font-bold text-gray-700">Snips</span>
              </div>
            </div>

            {/* Research Header & Category Filters */}
            <div className="p-3 bg-white space-y-2 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Laporan Riset & Analisis
                  </h3>
                  <p className="text-[11px] text-gray-500">Kajian fundamental dan valuasi saham terpercaya</p>
                </div>
                <button
                  onClick={handleRefreshAll}
                  disabled={isRefreshing || isLoadingResearch}
                  className="flex items-center gap-1 text-xs font-bold text-[#00B26A] bg-emerald-50 px-2.5 py-1 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", (isRefreshing || isLoadingResearch) && "animate-spin")} />
                  <span>Segarkan</span>
                </button>
              </div>

              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-1">
                {researchCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setResearchCategory(cat)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all",
                      researchCategory === cat
                        ? "bg-[#00B26A] text-white shadow-xs"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Research Cards */}
            {isLoadingResearch && liveResearch.length === 0 ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse p-4 bg-gray-50 rounded-2xl space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-32 bg-gray-200 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : filteredResearch.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {filteredResearch.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedResearch(item)}
                    className="p-4 bg-white hover:bg-emerald-50/20 transition-all cursor-pointer group"
                  >
                    <div className="flex gap-3 justify-between items-start">
                      <div className="flex-1 pr-2">
                        {/* Rating and category */}
                        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-[#00B26A] font-bold text-[10px] border border-emerald-200">
                            {item.category}
                          </span>
                          {item.rating && (
                            <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-extrabold text-[10px]">
                              {item.rating}
                            </span>
                          )}
                          {item.relatedTicker && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px]">
                              ${item.relatedTicker}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h4 className="text-[14px] font-bold text-gray-900 leading-snug mb-1 group-hover:text-[#00B26A] transition-colors">
                          {item.title}
                        </h4>

                        {/* Subtitle / summary */}
                        {item.subtitle && (
                          <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                            {item.subtitle}
                          </p>
                        )}

                        {/* Target Price highlight if available */}
                        {item.targetPrice && (
                          <div className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 text-[#00B26A] text-[11px] font-bold border border-emerald-200/80 mb-2">
                            🎯 {item.targetPrice}
                          </div>
                        )}

                        {/* Author and Reads */}
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span className="inline-block w-4 h-4 rounded bg-emerald-100 text-emerald-700 font-bold text-[9px] text-center leading-4">
                            S
                          </span>
                          <span>{item.author}</span>
                          <span>•</span>
                          <span>{item.date}</span>
                        </div>
                      </div>

                      {/* Image */}
                      <div className="w-24 h-22 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100 shadow-xs">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>

                    {/* Bottom stats & action */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50 text-xs text-gray-400">
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-medium text-gray-500">{item.reads || '3.2k dibaca'}</span>
                      </div>
                      <button
                        onClick={(e) => handleShareResearch(item, e)}
                        className="flex items-center gap-1 text-[#00B26A] font-semibold hover:underline"
                      >
                        <span>Baca Riset</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center px-4">
                <p className="text-sm font-semibold text-gray-600 mb-1">Tidak ada riset dalam kategori ini</p>
                <button
                  onClick={() => { setResearchCategory('Semua'); fetchLiveResearch(true); }}
                  className="mt-2 px-4 py-2 bg-[#00B26A] text-white text-xs font-bold rounded-xl"
                >
                  Muat Semua Riset
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* COMMENTS MODAL / DRAWER */}
      {activeCommentPost && (
        <div className="fixed inset-0 z-50 bg-black/50 flex flex-col justify-end animate-fade-in">
          <div className="bg-white rounded-t-2xl max-h-[85vh] flex flex-col shadow-2xl animate-slide-up">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Komentar</h3>
                <p className="text-[11px] text-gray-500">Postingan oleh @{activeCommentPost.author}</p>
              </div>
              <button 
                onClick={() => setActiveCommentPost(null)}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[160px] max-h-[50vh]">
              {activeCommentPost.commentsList && activeCommentPost.commentsList.length > 0 ? (
                activeCommentPost.commentsList.map((comm) => (
                  <div key={comm.id} className="flex gap-2.5 items-start">
                    <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 font-bold text-xs text-blue-600">
                      {comm.user.charAt(0)}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-gray-900">{comm.user}</span>
                        <span className="text-[10px] text-gray-400">{comm.time}</span>
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed">{comm.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-gray-400">
                  Belum ada komentar. Jadilah yang pertama berkomentar!
                </div>
              )}
            </div>

            <div className="p-3 border-t border-gray-100 bg-white flex items-center gap-2">
              <input 
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder="Tulis balasan..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-xs text-gray-800 outline-none focus:border-[#00B26A]"
              />
              <button 
                onClick={handleAddComment}
                disabled={!commentInput.trim()}
                className={cn(
                  "p-2 rounded-full text-white transition-colors",
                  commentInput.trim() ? "bg-[#00B26A] hover:bg-[#009659]" : "bg-gray-200 cursor-not-allowed"
                )}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TIPPING / DONATE MODAL */}
      {activeTipPost && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl animate-scale-up">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Apresiasi Analisis</h3>
                <p className="text-xs text-gray-500">Kirim apresiasi tip ke @{activeTipPost.author}</p>
              </div>
              <button onClick={() => { setActiveTipPost(null); setTipSuccess(false); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {tipSuccess ? (
              <div className="py-6 text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 text-[#00B26A] flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-gray-900 mb-1">Tip Berhasil Terkirim!</p>
                <p className="text-xs text-gray-500 mb-4">Terima kasih telah mendukung kreator edukasi finansial.</p>
                <button 
                  onClick={() => { setActiveTipPost(null); setTipSuccess(false); }}
                  className="w-full py-2 bg-[#00B26A] text-white text-xs font-bold rounded-xl"
                >
                  Tutup
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {['Rp 10.000', 'Rp 25.000', 'Rp 50.000'].map((amt, i) => (
                    <button 
                      key={i} 
                      onClick={() => setTipSuccess(true)}
                      className="py-2.5 px-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 hover:border-[#00B26A] hover:bg-green-50 transition-all text-center"
                    >
                      {amt}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setTipSuccess(true)}
                  className="w-full py-2.5 bg-[#00B26A] text-white text-xs font-bold rounded-xl hover:bg-[#009659] transition-colors"
                >
                  Kirim Apresiasi
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notification Modal */}
      <NotificationModal 
        isOpen={showNotificationModal} 
        onClose={() => setShowNotificationModal(false)} 
      />

      {/* News Reader Detail Modal */}
      <NewsReaderModal
        news={selectedNews}
        onClose={() => setSelectedNews(null)}
        isLiked={selectedNews ? Boolean(likedNews[selectedNews.id]) : false}
        onToggleLike={handleToggleNewsLike}
      />

      {/* Research Reader Detail Modal */}
      <ResearchReaderModal
        research={selectedResearch}
        onClose={() => setSelectedResearch(null)}
      />
    </div>
  );
}
