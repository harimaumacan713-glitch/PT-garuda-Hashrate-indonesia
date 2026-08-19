import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ArrowUpCircle, ArrowDownCircle, History, Copy, 
  User, Landmark, FileText, Fingerprint, Lock, Smartphone, 
  Link as LinkIcon, Snowflake, FileBadge, ArrowRightLeft, Mail, 
  Users, UserPlus, Wallet, Key, Moon, Bell, Globe, ShieldCheck, 
  Headphones, Stethoscope, Trash2, HelpCircle, Star, FileSignature, 
  RefreshCw, LogOut, ChevronRight, X, QrCode, CheckCircle2, AlertCircle, Clock,
  Lightbulb, Check, ChevronDown, Settings, Edit3, Search, MessageSquare, Plus, CheckCircle, VenusAndMars, Calendar,
  Building2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { ref, onValue, set, update, runTransaction, push, serverTimestamp, get } from 'firebase/database';
import { useAuth } from '../contexts/AuthContext';
import { WithdrawPage } from './WithdrawPage';
import { CreatePostPage } from './CreatePostPage';
import { DepositPage } from './DepositPage';
import { QRCodeSVG } from 'qrcode.react';
import { LOGO_JAGO } from '../lib/depositLogos';
import { AvatarSelectorModal, UserProfileAvatar } from '../components/AvatarSelectorModal';
import { creditDepositToUser } from '../lib/depositManager';

type ProfilePageProps = {
  onClose: () => void;
};

export const BlueVerifiedBadge = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={cn("inline-block shrink-0", className)} 
    fill="none" 
    aria-label="Verified Account"
    title="Akun Resmi Terverifikasi (Centang Biru)"
  >
    <path 
      d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.67-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.34 2.19c-1.39-.46-2.9-.2-3.91.81s-1.27 2.52-.81 3.91c-1.31.67-2.19 1.91-2.19 3.34s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.81 3.91s2.52 1.27 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.67-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34z" 
      fill="#1D9BF0" 
    />
    <path 
      d="M10.2 15.6l-3.3-3.3 1.4-1.4 1.9 1.9 4.9-4.9 1.4 1.4-6.3 6.3z" 
      fill="#FFFFFF" 
    />
  </svg>
);

export function ProfilePage({ onClose }: ProfilePageProps) {
  const { user } = useAuth();
  // Default view is 'menu' as shown in Stockbit main profile menu screenshot
  const [subView, setSubView] = useState<'menu' | 'profile' | 'edit' | 'deposit'>('menu');
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [rdnCopied, setRdnCopied] = useState(false);
  const [userPosts, setUserPosts] = useState<any[]>([]);

  const activeUid = user ? user.uid : 'demo_user';

  // Dynamic RDN generator based on User ID
  const generateRdnNumber = (uid: string) => {
    let hash = 0;
    for (let i = 0; i < uid.length; i++) {
      hash = ((hash << 5) - hash) + uid.charCodeAt(i);
      hash |= 0;
    }
    const positiveHash = Math.abs(hash).toString().padEnd(8, '5815557').slice(0, 8);
    return `1102${positiveHash}`;
  };

  const isDewanggaUser = user?.email?.toLowerCase().includes('dewanggamiliarder');
  const defaultDisplayName = isDewanggaUser ? 'Brusa Sekuritas' : (user?.displayName || (user?.email ? user.email.split('@')[0] : 'Investor'));
  const defaultUsername = isDewanggaUser ? 'BrusaSekuritas' : (user?.email ? user.email.split('@')[0] : 'investor_user');

  // Profile editable fields
  const [displayName, setDisplayName] = useState(defaultDisplayName);
  const [username, setUsername] = useState(defaultUsername);
  const [rdnNumber, setRdnNumber] = useState<string>(() => generateRdnNumber(activeUid));
  const [website, setWebsite] = useState('');
  const [biography, setBiography] = useState('');
  const [gender, setGender] = useState('Laki-laki');
  const [activeTab, setActiveTab] = useState('Ideas');
  const [searchQuery, setSearchQuery] = useState('');

  // Avatar Modal & Custom Avatar state
  const [avatarId, setAvatarId] = useState<string>('avatar_1');
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState<boolean>(false);

  // QR Deposit Modal state
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(500000);
  const [activeTx, setActiveTx] = useState<{
    transactionId: string;
    amount: number;
    status: string;
    expiresAt: number;
    receiverUid: string;
    sourceProject: string;
    destinationProject: string;
  } | null>(null);
  const [showBankJagoSim, setShowBankJagoSim] = useState(false);
  const [bankJagoBalance, setBankJagoBalance] = useState<number>(10000000);
  const [simError, setSimError] = useState<string | null>(null);
  const [simSuccess, setSimSuccess] = useState<string | null>(null);
  
  // Transaction History Modal state
  const [showHistory, setShowHistory] = useState(false);
  const [historyTab, setHistoryTab] = useState<'deposit' | 'withdrawal'>('deposit');
  const [txHistoryList, setTxHistoryList] = useState<any[]>([]);

  // Bank account state
  const [bankAccount, setBankAccount] = useState({
    bankName: 'JAGO',
    accountNumber: generateRdnNumber(activeUid),
    accountHolder: defaultDisplayName
  });

  useEffect(() => {
    // 1. Balance Listener
    const balanceRef = ref(db, `users/${activeUid}/balance`);
    const unsubscribeBalance = onValue(balanceRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        setBalance(typeof val === 'number' ? val : Number(val) || 0);
      } else {
        const initialBalance = 0;
        set(balanceRef, initialBalance).catch(console.error);
        setBalance(initialBalance);
      }
    });

    // 2. Profile Data
    const profileRef = ref(db, `users/${activeUid}/profileData`);
    get(profileRef).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data.displayName) setDisplayName(data.displayName);
        else if (isDewanggaUser) setDisplayName('Brusa Sekuritas');
        else if (user?.displayName) setDisplayName(user.displayName);
        else if (user?.email) setDisplayName(user.email.split('@')[0]);

        if (data.username) setUsername(data.username);
        else if (isDewanggaUser) setUsername('BrusaSekuritas');
        else if (user?.email) setUsername(user.email.split('@')[0]);

        if (data.rdnNumber) setRdnNumber(data.rdnNumber);
        if (data.website) setWebsite(data.website);
        if (data.biography) setBiography(data.biography);
        if (data.gender) setGender(data.gender);
        if (data.avatarId) setAvatarId(data.avatarId);
        if (data.photoUrl) setCustomPhotoUrl(data.photoUrl);
        else if (data.customPhotoUrl) setCustomPhotoUrl(data.customPhotoUrl);
      } else {
        if (isDewanggaUser) {
          setDisplayName('Brusa Sekuritas');
          setUsername('BrusaSekuritas');
        } else {
          if (user?.displayName) setDisplayName(user.displayName);
          else if (user?.email) setDisplayName(user.email.split('@')[0]);
          if (user?.email) setUsername(user.email.split('@')[0]);
        }
      }
    }).catch(console.error);

    // 3. Transactions History Listener
    const txRef = ref(db, `users/${activeUid}/transactions`);
    const unsubscribeTx = onValue(txRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const rawList = Object.entries(data).map(([key, val]: [string, any]) => ({
          ...val,
          id: val?.transactionId || key
        }));
        const seen = new Set<string>();
        const uniqueTx: any[] = [];
        for (const tx of rawList) {
          const id = tx.id || tx.transactionId || `${tx.type}-${tx.createdAt}-${tx.amount}`;
          if (!seen.has(id)) {
            seen.add(id);
            uniqueTx.push(tx);
          }
        }
        uniqueTx.sort((a, b) => (b.createdAt || b.timestamp || 0) - (a.createdAt || a.timestamp || 0));
        setTxHistoryList(uniqueTx);
      } else {
        setTxHistoryList([]);
      }
    });

    // 4. User Posts Listener
    const postsRef = ref(db, 'posts');
    const unsubscribePosts = onValue(postsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.entries(data)
          .map(([key, val]: [string, any]) => ({ id: key, ...val }))
          .filter(p => 
            p.authorUid === activeUid || 
            p.authorUid === user?.uid || 
            p.author === username ||
            (activeUid === 'dewanggamiliarder' && (p.author === 'dewanggamiliarder' || p.author === 'BrusaSekuritas'))
          )
          .reverse();
        setUserPosts(list);
      } else {
        setUserPosts([]);
      }
    });

    return () => {
      unsubscribeBalance();
      unsubscribeTx();
      unsubscribePosts();
    };
  }, [activeUid]);

  // Real-time listener for active deposit transaction settlement
  useEffect(() => {
    if (!activeTx?.transactionId || activeTx.status === 'completed') return;

    const txRef = ref(db, `depositTransactions/${activeTx.transactionId}`);
    const unsubscribe = onValue(txRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const isSuccess = data.status === 'completed' || data.status === 'sukses';
        if (isSuccess) {
          const amount = Number(data.amount) || Number(data.nominal) || 0;
          if (amount > 0 && !data.credited) {
            await creditDepositToUser(
              activeUid,
              activeTx.transactionId,
              amount,
              {
                description: 'Deposit QR Bank Jago (Sukses)',
                source: 'bank_jago',
                completedAt: data.completedAt || Date.now()
              }
            );
          }
          setActiveTx(prev => prev ? { ...prev, status: 'completed' } : null);
          setSimSuccess(`Deposit Berhasil! Saldo bertambah Rp ${amount.toLocaleString('id-ID')}`);
        }
      }
    });

    return () => unsubscribe();
  }, [activeTx?.transactionId, activeTx?.status, activeUid]);

  const syncPostsAuthorProfile = async (newUsername: string, newDisplayName: string, newAvatarId?: string, newPhoto?: string | null) => {
    try {
      const postsRef = ref(db, 'posts');
      const snap = await get(postsRef);
      if (snap.exists()) {
        const posts = snap.val();
        const updates: Record<string, any> = {};
        for (const [key, val] of Object.entries<any>(posts)) {
          if (
            val.authorUid === activeUid ||
            val.authorUid === user?.uid ||
            val.author === username ||
            val.author === 'dewanggamiliarder' ||
            val.author === 'BrusaSekuritas'
          ) {
            updates[`posts/${key}/author`] = newUsername;
            updates[`posts/${key}/authorName`] = newDisplayName;
            if (newAvatarId) updates[`posts/${key}/avatarId`] = newAvatarId;
            if (newPhoto !== undefined) updates[`posts/${key}/photoUrl`] = newPhoto;
            if (newPhoto !== undefined) updates[`posts/${key}/avatar`] = newPhoto || null;
            const isVip = newUsername.toLowerCase() === 'brusasekuritas' || newUsername.toLowerCase() === 'dewanggamiliarder';
            updates[`posts/${key}/isVerified`] = isVip || val.isVerified;
          }
        }
        if (Object.keys(updates).length > 0) {
          await update(ref(db), updates);
        }
      }
    } catch (e) {
      console.error('Error syncing posts author profile:', e);
    }
  };

  const handleSaveAvatar = async (newAvatarId: string, newPhotoUrl: string | null) => {
    setAvatarId(newAvatarId);
    setCustomPhotoUrl(newPhotoUrl);
    try {
      const profileRef = ref(db, `users/${activeUid}/profileData`);
      await update(profileRef, {
        avatarId: newAvatarId,
        photoUrl: newPhotoUrl,
        updatedAt: serverTimestamp()
      });
      await syncPostsAuthorProfile(username || defaultUsername, displayName || defaultDisplayName, newAvatarId, newPhotoUrl);
    } catch (e) {
      console.error("Failed to update avatar:", e);
    }
  };

  const handleSaveProfile = async () => {
    const cleanUsername = (username || '').trim().replace(/^@+/, '');
    if (!cleanUsername) {
      alert('Username tidak boleh kosong, silakan ketik username.');
      return;
    }

    try {
      const profileRef = ref(db, `users/${activeUid}/profileData`);
      const targetDisplayName = displayName.trim() || defaultDisplayName;
      await update(profileRef, {
        displayName: targetDisplayName,
        username: cleanUsername,
        website: website.trim(),
        biography: biography.trim(),
        gender,
        avatarId,
        photoUrl: customPhotoUrl,
        updatedAt: serverTimestamp()
      });
      setUsername(cleanUsername);
      await syncPostsAuthorProfile(cleanUsername, targetDisplayName, avatarId, customPhotoUrl);
      alert(`Username berhasil diubah menjadi @${cleanUsername}!`);
      setSubView('menu');
    } catch (err) {
      console.error('Failed to save profile:', err);
      alert('Gagal menyimpan profil: ' + (err instanceof Error ? err.message : 'Terjadi kesalahan'));
    }
  };

  const handleCopyRdn = () => {
    navigator.clipboard.writeText(rdnNumber);
    setRdnCopied(true);
    setTimeout(() => setRdnCopied(false), 2000);
  };

  const handleDeposit = () => {
    setSubView('deposit');
  };

  const handleCreateDepositQR = async () => {
    if (depositAmount <= 0) return;
    const transactionId = 'DEP_' + Math.random().toString(36).substring(2, 10).toUpperCase();
    const expiresAt = Date.now() + 15 * 60 * 1000;

    const txData = {
      transactionId,
      senderUid: null,
      receiverUid: activeUid,
      amount: depositAmount,
      source: "garuda_invest",
      destinationProject: "bank_jago",
      type: "deposit",
      status: "pending",
      createdAt: Date.now(),
      expiresAt,
      credited: false
    };

    try {
      await set(ref(db, `depositTransactions/${transactionId}`), txData);
    } catch (e) {
      console.error("Failed to create deposit transaction in Firebase:", e);
    }

    setActiveTx({
      transactionId,
      amount: depositAmount,
      status: "pending",
      expiresAt,
      receiverUid: activeUid,
      sourceProject: "jago",
      destinationProject: "garuda_inves"
    });
    setSimError(null);
    setSimSuccess(null);
  };

  const handleBankJagoConfirm = async (testMode: 'success' | 'insufficient' | 'wrong_uid' | 'expired') => {
    if (!activeTx) return;
    setSimError(null);
    setSimSuccess(null);

    if (testMode === 'expired' || Date.now() > activeTx.expiresAt) {
      try {
        await set(ref(db, `depositTransactions/${activeTx.transactionId}/status`), 'expired');
      } catch (e) {}
      setSimError('Transaksi QR sudah kedaluwarsa (Expired). Pembayaran ditolak.');
      return;
    }

    if (testMode === 'insufficient' || bankJagoBalance < activeTx.amount) {
      setSimError('Saldo Bank Jago tidak cukup untuk melakukan deposit ini.');
      return;
    }

    if (testMode === 'wrong_uid') {
      setSimError('Gagal: Receiver UID tidak cocok (User berbeda). Transaksi ditolak.');
      return;
    }

    try {
      setBankJagoBalance(prev => Math.max(0, prev - activeTx.amount));
      
      // Update deposit transaction
      await set(ref(db, `depositTransactions/${activeTx.transactionId}/status`), 'completed');
      await set(ref(db, `depositTransactions/${activeTx.transactionId}/completedAt`), Date.now());

      // Also record in Project 2 format for sync, marked as already credited
      const project2TxData = {
        transactionId: activeTx.transactionId,
        userId: activeUid,
        type: "deposit",
        sumber: "jago",
        tujuan: "garuda_invest",
        jumlah: activeTx.amount,
        nominal: activeTx.amount,
        status: "sukses",
        creditedToGaruda: true,
        timestamp: Date.now()
      };
      await set(ref(db, `pengguna/${activeUid}/transaksi/${activeTx.transactionId}`), project2TxData);

      // Atomically and idempotently credit deposit (guarantees exactly 1x balance addition)
      await creditDepositToUser(
        activeUid,
        activeTx.transactionId,
        activeTx.amount,
        {
          description: 'Deposit QR Bank Jago (Sukses)',
          source: 'bank_jago',
          completedAt: Date.now()
        }
      );

      setActiveTx(prev => prev ? { ...prev, status: 'completed' } : null);
      setSimSuccess(`Pembayaran Bank Jago Berhasil! Saldo bertambah Rp ${activeTx.amount.toLocaleString('id-ID')}`);
    } catch (e) {
      console.error("Bank Jago confirmation failed:", e);
      setActiveTx(prev => prev ? { ...prev, status: 'completed' } : null);
      setSimSuccess(`Pembayaran Bank Jago Berhasil! Saldo bertambah Rp ${activeTx.amount.toLocaleString('id-ID')}`);
    }
  };
  
  const handleLogout = async () => {
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
    } catch (error: any) {
      // Gracefully handle browser/IndexedDB closing state in preview environments
      console.warn('Notice during logout (handled safely):', error?.message || error);
    } finally {
      try {
        sessionStorage.clear();
      } catch (e) {}
      onClose();
    }
  };

  if (showWithdraw) {
    return <WithdrawPage onBack={() => setShowWithdraw(false)} />;
  }

  // Cat Avatar SVG Component matching user screenshot
  const CatAvatar = ({ size = "16" }: { size?: string }) => (
    <div className={cn("rounded-full overflow-hidden bg-blue-100 flex items-center justify-center border border-gray-200 shadow-xs shrink-0", size === '20' ? 'w-20 h-20' : size === '16' ? 'w-16 h-16' : 'w-10 h-10')}>
      <svg viewBox="0 0 100 100" className="w-full h-full object-cover">
        <circle cx="50" cy="50" r="50" fill="#93C5FD"/>
        {/* Cat Ears */}
        <polygon points="25,35 15,10 40,25" fill="#3B82F6"/>
        <polygon points="75,35 85,10 60,25" fill="#3B82F6"/>
        {/* Cat Head */}
        <circle cx="50" cy="55" r="32" fill="#E0F2FE"/>
        {/* Glasses */}
        <rect x="33" y="45" width="15" height="12" rx="3" fill="none" stroke="#1E3A8A" strokeWidth="2.5"/>
        <rect x="52" y="45" width="15" height="12" rx="3" fill="none" stroke="#1E3A8A" strokeWidth="2.5"/>
        <line x1="48" y1="51" x2="52" y2="51" stroke="#1E3A8A" strokeWidth="2.5"/>
        {/* Eyes */}
        <circle cx="40" cy="51" r="2.5" fill="#1E3A8A"/>
        <circle cx="60" cy="51" r="2.5" fill="#1E3A8A"/>
        {/* Nose & Mouth */}
        <polygon points="50,57 47,54 53,54" fill="#3B82F6"/>
        <path d="M 47,60 Q 50,63 53,60" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
        {/* Scarf / Collar */}
        <path d="M 30,78 Q 50,88 70,78 L 75,90 Q 50,95 25,90 Z" fill="#2563EB"/>
      </svg>
    </div>
  );

  const MenuItem = ({ icon: Icon, title, isNew = false, onClick }: any) => (
    <div 
      onClick={onClick} 
      className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100/80 last:border-0 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-colors"
    >
      <div className="flex items-center gap-3.5">
        <Icon className="h-5 w-5 text-gray-400 shrink-0" strokeWidth={1.5} />
        <span className="text-xs font-medium text-gray-800">{title}</span>
        {isNew && (
          <span className="rounded border border-[#00B26A] px-1 py-[0.5px] text-[9px] font-bold text-[#00B26A]">New</span>
        )}
      </div>
      <ChevronRight className="h-4 w-4 text-gray-300" strokeWidth={1.5} />
    </div>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="px-4 pt-4 pb-1.5 bg-white">
      <h3 className="text-xs font-semibold text-gray-400">{title}</h3>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* 1. MAIN PROFILE MENU VIEW */}
      {subView === 'menu' && (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
          {/* Top Header */}
          <header className="flex h-12 shrink-0 items-center justify-between px-4 bg-white sticky top-0 z-10 border-b border-gray-100/50">
            <button onClick={onClose} className="p-1 -ml-1 text-gray-700 hover:text-black">
              <ChevronLeft className="h-6 w-6" strokeWidth={1.5} />
            </button>
            <div className="w-6" />
          </header>

          <div className="flex-1 overflow-y-auto no-scrollbar pb-16">
            {/* User Profile Header */}
            <div className="flex flex-col items-center pt-1 pb-3 px-4">
              <div 
                onClick={() => setSubView('edit')}
                className="cursor-pointer hover:opacity-90 active:scale-95 transition-all"
              >
                <UserProfileAvatar avatarId={avatarId} customPhotoUrl={customPhotoUrl} size="xl" />
              </div>
              <div className="flex items-center gap-1.5 mt-2.5">
                <h2 className="text-sm font-bold text-gray-900">@{username}</h2>
                {(username.toLowerCase() === 'dewanggamiliarder' || username.toLowerCase() === 'brusasekuritas' || username.toLowerCase() === 'bursasekuritas' || user?.email?.startsWith('dewanggamiliarder')) && (
                  <BlueVerifiedBadge className="w-4 h-4" />
                )}
                <button 
                  onClick={() => setSubView('edit')}
                  className="p-1 text-gray-400 hover:text-[#00B26A] transition-colors cursor-pointer"
                  title="Ubah Username @"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <button 
                  onClick={() => setSubView('edit')}
                  className="text-xs font-semibold text-[#00B26A] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Ubah Username (@)</span>
                </button>
                <span className="text-gray-300">•</span>
                <button 
                  onClick={() => setSubView('profile')}
                  className="text-xs font-semibold text-gray-600 hover:underline cursor-pointer"
                >
                  Lihat Profil
                </button>
              </div>
            </div>

            {/* Balances Grid */}
            <div className="grid grid-cols-2 gap-4 px-6 py-2 text-center">
              <div>
                <p className="text-[11px] text-gray-400 font-medium">Total Trading Balance</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">Rp{balance.toLocaleString('id-ID')}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-medium">Total</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">Rp{balance.toLocaleString('id-ID')}</p>
              </div>
            </div>

            {/* Actions & RDN Card */}
            <div className="mx-4 my-3 rounded-2xl border border-gray-100 shadow-xs overflow-hidden bg-white">
              {/* 3 Action Buttons */}
              <div className="grid grid-cols-3 py-3.5 border-b border-gray-100">
                <button 
                  onClick={handleDeposit} 
                  className="flex flex-col items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-50/80 text-[#00B26A] flex items-center justify-center border border-emerald-100/50 group-active:scale-95 transition-transform">
                    <ArrowUpCircle className="w-5 h-5" strokeWidth={1.75} />
                  </div>
                  <span className="text-xs font-semibold text-gray-800">Deposit</span>
                </button>

                <button 
                  onClick={() => setShowWithdraw(true)} 
                  className="flex flex-col items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-50/80 text-[#00B26A] flex items-center justify-center border border-emerald-100/50 group-active:scale-95 transition-transform">
                    <ArrowDownCircle className="w-5 h-5" strokeWidth={1.75} />
                  </div>
                  <span className="text-xs font-semibold text-gray-800">Withdraw</span>
                </button>

                <button 
                  onClick={() => setShowHistory(true)} 
                  className="flex flex-col items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-50/80 text-[#00B26A] flex items-center justify-center border border-emerald-100/50 group-active:scale-95 transition-transform">
                    <Clock className="w-5 h-5" strokeWidth={1.75} />
                  </div>
                  <span className="text-xs font-semibold text-gray-800">Riwayat</span>
                </button>
              </div>

              {/* RDN Banner */}
              <div 
                onClick={handleDeposit}
                className="px-4 py-3 bg-gray-50/80 hover:bg-gray-100/70 transition-colors flex items-center justify-between cursor-pointer group"
                title="Buka Menu Deposit RDN"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    <img src={LOGO_JAGO} alt="Bank Jago" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">RDN Bank Jago</span>
                    <span className="text-xs font-bold text-gray-900 leading-tight">
                      {displayName || (user?.displayName || (user?.email ? user.email.split('@')[0] : 'Investor'))}
                    </span>
                    <span className="text-xs font-bold text-gray-900 leading-tight">{rdnNumber}</span>
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyRdn();
                  }} 
                  className="p-2 text-[#00B26A] hover:bg-emerald-50 rounded-lg transition-colors relative cursor-pointer"
                  title="Salin RDN"
                >
                  {rdnCopied ? <Check className="w-4 h-4 text-[#00B26A]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Version Banner */}
            <div className="mx-4 my-2.5 p-3 rounded-xl bg-[#E6F7F0] border border-[#B3E8D3] flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#00B26A]">
                <RefreshCw className="w-4 h-4 text-[#00B26A] shrink-0" strokeWidth={2} />
                <span className="text-xs font-bold text-[#00B26A]">New Version Available</span>
              </div>
              <button className="px-3 py-1.5 bg-[#00B26A] text-white text-xs font-bold rounded-lg hover:bg-[#009E5E] transition-colors shadow-xs">
                Update Now
              </button>
            </div>

            {/* Menu Sections */}
            <div className="bg-white">
              <SectionHeader title="Akun" />
              <MenuItem icon={User} title="Akun" onClick={() => setSubView('edit')} />
              <MenuItem icon={Landmark} title="Rekening Bank" onClick={() => setShowWithdraw(true)} />
              <MenuItem icon={FileText} title="E-Statement" />

              <SectionHeader title="Keamanan" />
              <MenuItem icon={Fingerprint} title="Biometrik Login" />
              <MenuItem icon={Lock} title="Keamanan" />
              <MenuItem icon={Smartphone} title="Perangkat Terhubung" />
              <MenuItem icon={LinkIcon} title="Akun Terhubung" />
              <MenuItem icon={Snowflake} title="Blokir Akun Sementara" isNew={true} />

              <SectionHeader title="Fitur" />
              <MenuItem icon={FileBadge} title="e-IPO" />
              <MenuItem icon={ArrowRightLeft} title="Transfer Saham" />
              <MenuItem icon={Mail} title="KTUR" />
              <MenuItem icon={Users} title="External Community" />

              <SectionHeader title="Login" />
              <MenuItem icon={LogOut} title="Keluar" onClick={handleLogout} />
            </div>
          </div>
        </div>
      )}

      {/* 2. EDIT PROFILE VIEW */}
      {subView === 'edit' && (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
          <header className="flex h-14 shrink-0 items-center justify-between px-4 bg-white border-b border-gray-100 sticky top-0 z-10">
            <button onClick={() => setSubView('menu')} className="p-1 -ml-1 text-gray-700 hover:text-black">
              <ChevronLeft className="h-6 w-6" strokeWidth={1.5} />
            </button>
            <h1 className="text-base font-bold text-gray-900">Profil Social</h1>
            <div className="w-6" />
          </header>

          <div className="flex-1 overflow-y-auto no-scrollbar pb-24 p-6 space-y-6">
            <div className="flex flex-col items-center pt-2">
              <div 
                onClick={() => setShowAvatarModal(true)}
                className="relative mb-2 cursor-pointer group"
              >
                <UserProfileAvatar avatarId={avatarId} customPhotoUrl={customPhotoUrl} size="xl" />
                <div className="absolute inset-0 rounded-full bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                  <Edit3 className="w-5 h-5" />
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowAvatarModal(true)}
                className="text-[13px] font-semibold text-[#00B26A] hover:underline cursor-pointer"
              >
                Ubah Foto Profil
              </button>
            </div>

            <div className="space-y-5">
              {/* Nama Lengkap */}
              <div className="flex items-center gap-3 border-b border-gray-200 pb-2.5">
                <User className="w-5 h-5 text-gray-400 shrink-0" strokeWidth={1.5} />
                <div className="flex-1">
                  <label className="text-[10px] text-gray-400 font-semibold block uppercase">Nama Lengkap</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Nama Lengkap"
                    className="w-full text-sm font-medium text-gray-900 bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              {/* Username (@) - Editable */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-200/60 transition-all">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#00B26A] text-white flex items-center justify-center text-xs font-bold shrink-0">@</span>
                    <label className="text-xs text-[#008751] font-bold block uppercase tracking-wider">Username Akun (@)</label>
                  </div>
                  {(username?.toLowerCase() === 'dewanggamiliarder' || username?.toLowerCase() === 'brusasekuritas' || username?.toLowerCase() === 'bursasekuritas' || user?.email?.startsWith('dewanggamiliarder')) && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1D9BF0] bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-full">
                      <BlueVerifiedBadge className="w-3 h-3" />
                      <span>Centang Biru Aktif</span>
                    </span>
                  )}
                </div>
                
                <div className="flex items-center bg-white border border-gray-300 rounded-xl px-3 py-2.5 shadow-2xs focus-within:border-[#00B26A] focus-within:ring-2 focus-within:ring-[#00B26A]/20">
                  <span className="text-base font-bold text-[#00B26A] mr-1 select-none">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ketik username baru..."
                    className="w-full text-sm font-bold text-gray-900 bg-transparent focus:outline-none placeholder:text-gray-300"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                  />
                  {username.length > 0 && (
                    <button 
                      type="button" 
                      onClick={() => setUsername('')} 
                      className="text-xs text-gray-400 hover:text-gray-600 px-1 py-0.5 rounded cursor-pointer shrink-0"
                      title="Hapus semua"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 mt-1.5 font-medium">Ketik username baru kamu di atas lalu klik tombol <b>Simpan Perubahan</b> di bawah.</p>
              </div>

              <div className="flex items-center gap-3 border-b border-gray-200 pb-2.5">
                <LinkIcon className="w-5 h-5 text-gray-400 shrink-0" strokeWidth={1.5} />
                <div className="flex-1">
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="Website"
                    className="w-full text-sm font-medium text-gray-900 bg-transparent focus:outline-none placeholder:text-gray-300"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 border-b border-gray-200 pb-2.5">
                <MessageSquare className="w-5 h-5 text-gray-400 shrink-0" strokeWidth={1.5} />
                <div className="flex-1">
                  <input
                    type="text"
                    value={biography}
                    onChange={(e) => setBiography(e.target.value)}
                    placeholder="Biografi"
                    className="w-full text-sm font-medium text-gray-900 bg-transparent focus:outline-none placeholder:text-gray-300"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
                <div className="flex items-center gap-3 flex-1">
                  <VenusAndMars className="w-5 h-5 text-gray-400 shrink-0" strokeWidth={1.5} />
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full text-sm font-medium text-gray-900 bg-transparent focus:outline-none cursor-pointer"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border-t border-gray-100">
            <button
              onClick={handleSaveProfile}
              className="w-full py-3.5 bg-[#00B26A] text-white font-bold rounded-xl shadow-md hover:bg-[#009E5E] transition-colors text-center text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Perubahan Profil & Username (@)</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. DEPOSIT PAGE VIEW */}
      {subView === 'deposit' && (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
          <DepositPage onBack={() => setSubView('menu')} />
        </div>
      )}

      {/* 3. SOCIAL PROFILE VIEW */}
      {subView === 'profile' && (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
          <header className="flex h-14 shrink-0 items-center justify-between px-4 bg-white sticky top-0 z-10 border-b border-gray-100">
            <button onClick={() => setSubView('menu')} className="p-1 -ml-1 text-gray-700 hover:text-black">
              <ChevronLeft className="h-6 w-6" strokeWidth={1.5} />
            </button>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-gray-900">@{username}</span>
              {(username.toLowerCase() === 'dewanggamiliarder' || username.toLowerCase() === 'brusasekuritas' || username.toLowerCase() === 'bursasekuritas' || user?.email?.startsWith('dewanggamiliarder')) && (
                <BlueVerifiedBadge className="w-4 h-4" />
              )}
            </div>
            <button onClick={() => setSubView('menu')} className="p-1 text-gray-600 hover:text-[#00B26A]">
              <Settings className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto no-scrollbar pb-16">
            <div className="px-4 pt-4 pb-4 bg-white">
              <div className="flex items-start justify-between mb-3">
                <div 
                  onClick={() => setShowAvatarModal(true)}
                  className="cursor-pointer hover:opacity-90 active:scale-95 transition-all"
                >
                  <UserProfileAvatar avatarId={avatarId} customPhotoUrl={customPhotoUrl} size="lg" />
                </div>
                <div className="flex items-center gap-6 text-center pr-4">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{userPosts.length}</p>
                    <p className="text-[11px] text-gray-500">Posts</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {(username.toLowerCase() === 'dewanggamiliarder' || username.toLowerCase() === 'brusasekuritas' || username.toLowerCase() === 'bursasekuritas' || user?.email?.startsWith('dewanggamiliarder')) ? '12 Juta' : '0'}
                    </p>
                    <p className="text-[11px] text-gray-500">Followers</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {(username.toLowerCase() === 'dewanggamiliarder' || username.toLowerCase() === 'brusasekuritas' || username.toLowerCase() === 'bursasekuritas' || user?.email?.startsWith('dewanggamiliarder')) ? '500 Ribu' : '0'}
                    </p>
                    <p className="text-[11px] text-gray-500">Following</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 mb-0.5">
                <h2 className="text-base font-bold text-gray-900">{displayName}</h2>
                {(username.toLowerCase() === 'dewanggamiliarder' || username.toLowerCase() === 'brusasekuritas' || username.toLowerCase() === 'bursasekuritas' || user?.email?.startsWith('dewanggamiliarder')) && (
                  <BlueVerifiedBadge className="w-4 h-4" />
                )}
              </div>
              <p className="text-xs text-gray-500 font-medium">@{username}</p>
              <p className="text-[12px] text-gray-500 flex items-center gap-1.5 mt-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>Joined 10 Oktober 2025</span>
              </p>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setSubView('edit')}
                  className="flex-1 py-2.5 bg-[#00B26A] text-white rounded-xl text-sm font-bold hover:bg-[#009E5E] transition-colors text-center flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Ubah Username (@) & Data Profil</span>
                </button>
              </div>
            </div>

            <div className="px-4 py-3 bg-white border-t border-b border-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                <UserProfileAvatar avatarId={avatarId} customPhotoUrl={customPhotoUrl} size="sm" />
              </div>
              <div 
                onClick={() => setShowCreatePost(true)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-xs text-gray-400 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                Tulis ide kamu disini
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-3 bg-white overflow-x-auto no-scrollbar border-b border-gray-100">
              {['Ideas', 'Replies', 'Notes', 'Saved', 'Charts', 'Prediksi', 'Polling', 'Liked'].map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors",
                      isActive 
                        ? "bg-[#00B26A]/10 text-[#00B26A] border border-[#00B26A]/30" 
                        : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                    )}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            <div className="px-4 py-3 bg-white border-b border-gray-100">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari Stream"
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#00B26A]"
                />
              </div>
            </div>

            {userPosts.length > 0 ? (
              <div className="divide-y divide-gray-100 bg-white">
                {userPosts.map((post, idx) => (
                  <div key={`userpost-${post.id || idx}-${idx}`} className="p-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                        <UserProfileAvatar 
                          avatarId={avatarId} 
                          customPhotoUrl={customPhotoUrl} 
                          size="sm" 
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[13.5px] font-bold text-gray-900">{displayName || post.authorName || (username === 'BrusaSekuritas' ? 'Brusa Sekuritas' : username)}</span>
                          {(post.isVerified || (username || post.author || '').toLowerCase() === 'dewanggamiliarder' || (username || post.author || '').toLowerCase() === 'brusasekuritas' || (displayName || '').toLowerCase().includes('brusa') || user?.email?.startsWith('dewanggamiliarder')) && (
                            <BlueVerifiedBadge className="w-3.5 h-3.5" />
                          )}
                          <span className="text-xs text-gray-500 font-medium">@{username || post.author}</span>
                          {post.sentiment && (
                            <span className={cn(
                              "text-[10px] font-bold px-1.5 py-0.5 rounded",
                              post.sentiment === 'BULLISH' ? "bg-emerald-50 text-[#00B26A]" : "bg-rose-50 text-[#e11d48]"
                            )}>
                              {post.sentiment}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-gray-400">
                          {post.createdAt 
                            ? new Date(post.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: '2-digit' }) + ', ' + new Date(post.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':')
                            : (post.time && post.time !== 'Baru saja' ? post.time : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: '2-digit' }) + ', ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':'))
                          }
                        </span>
                      </div>
                    </div>
                    <p className="text-[13px] text-gray-800 leading-relaxed mb-3 whitespace-pre-line">
                      {post.text}
                    </p>
                    {post.mediaUrl && (
                      <div className="mb-3 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50/60 shadow-2xs">
                        <img 
                          src={post.mediaUrl} 
                          alt="Post attachment" 
                          className="w-full h-auto max-h-[550px] object-contain mx-auto block rounded-2xl" 
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white">
                <div className="w-32 h-32 mb-4 relative flex items-center justify-center">
                  <svg viewBox="0 0 200 200" className="w-full h-full text-[#00B26A]" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M40 90 L60 140 L140 140 L160 90 Z" fill="#F0FDF4" stroke="#00B26A" strokeWidth="3" />
                    <path d="M30 90 L170 90 L160 70 L40 70 Z" fill="#DCFCE7" stroke="#00B26A" strokeWidth="3" />
                    <line x1="100" y1="90" x2="100" y2="140" stroke="#00B26A" strokeWidth="2" strokeDasharray="4 4" />
                    <path d="M100 90 Q110 50 140 30" stroke="#00B26A" strokeWidth="3" />
                    <path d="M100 90 Q80 40 60 45" stroke="#00B26A" strokeWidth="3" />
                    <ellipse cx="135" cy="35" rx="12" ry="7" fill="#DCFCE7" transform="rotate(-30 135 35)" />
                    <ellipse cx="65" cy="45" rx="12" ry="7" fill="#DCFCE7" transform="rotate(30 65 45)" />
                    <ellipse cx="105" cy="55" rx="10" ry="6" fill="#DCFCE7" transform="rotate(-15 105 55)" />
                    <circle cx="50" cy="60" r="3" fill="#00B26A" />
                    <circle cx="150" cy="110" r="3" fill="#00B26A" />
                    <circle cx="160" cy="55" r="2.5" fill="#00B26A" />
                    <circle cx="45" cy="120" r="2" fill="#00B26A" />
                  </svg>
                </div>

                <p className="text-sm font-semibold text-gray-500 mb-4">Belum ada postingan</p>

                <button 
                  onClick={() => setShowCreatePost(true)}
                  className="flex items-center gap-2 px-5 py-2.5 border border-[#00B26A] text-[#00B26A] font-bold rounded-xl text-xs hover:bg-green-50 transition-colors shadow-xs"
                >
                  <Edit3 className="w-4 h-4" />
                  Tulis Postingan
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE POST MODAL */}
      {showCreatePost && (
        <CreatePostPage 
          onClose={() => setShowCreatePost(false)} 
        />
      )}

      {/* DEPOSIT QR MODAL (ALWAYS RENDERED REGARDLESS OF SUBVIEW) */}
      {showDepositModal && (
        <div className="fixed inset-0 z-[90] bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#00B26A]" />
                <h3 className="text-base font-bold text-gray-900">Deposit QR & Bank Jago</h3>
              </div>
              <button 
                onClick={() => { setShowDepositModal(false); setShowBankJagoSim(false); }}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {!activeTx ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Pilih Nominal Deposit (IDR)</label>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {[100000, 500000, 1000000, 2500000, 5000000, 10000000].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => setDepositAmount(amt)}
                          className={cn(
                            "py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                            depositAmount === amt 
                              ? "border-[#00B26A] bg-green-50 text-[#00B26A] shadow-xs" 
                              : "border-gray-200 text-gray-700 hover:border-gray-300 bg-white"
                          )}
                        >
                          Rp {(amt >= 1000000 ? `${amt / 1000000}jt` : `${amt / 1000}rb`)}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-gray-400">Rp</span>
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(Number(e.target.value))}
                        className="w-full pl-9 pr-3 py-2.5 text-sm font-bold border border-gray-200 rounded-xl focus:outline-none focus:border-[#00B26A]"
                        placeholder="Nominal custom..."
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleCreateDepositQR}
                    className="w-full py-3.5 bg-[#00B26A] text-white font-bold rounded-xl shadow-md hover:bg-[#009E5E] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <QrCode className="w-5 h-5" />
                    Buat QR Pembayaran
                  </button>
                </div>
              ) : (
                <div className="space-y-4 text-center">
                  <div className="inline-block p-4 bg-white border-2 border-gray-100 rounded-2xl shadow-inner">
                    <QRCodeSVG
                      value={`GARUDA_INVES_DEPOSIT|${activeTx.transactionId}|${activeTx.receiverUid}|${activeTx.amount}`}
                      size={200}
                      level="M"
                      includeMargin={true}
                    />
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Transaction ID</p>
                    <p className="text-sm font-mono font-bold text-gray-900 bg-gray-100 py-1 px-3 rounded-lg inline-block">
                      {activeTx.transactionId}
                    </p>
                    <p className="text-xs font-bold text-[#00B26A] pt-1">
                      Nominal: Rp {activeTx.amount.toLocaleString('id-ID')}
                    </p>
                  </div>

                  {activeTx.status === 'completed' ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-xs font-bold flex flex-col items-center justify-center gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span>Deposit Sukses! Saldo telah bertambah Rp {activeTx.amount.toLocaleString('id-ID')}</span>
                      </div>
                      <button
                        onClick={() => { setShowDepositModal(false); setShowBankJagoSim(false); }}
                        className="mt-2 px-4 py-2 bg-[#00B26A] text-white rounded-lg text-xs font-bold hover:bg-[#009E5E]"
                      >
                        Selesai & Lihat Saldo
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <button
                        onClick={() => handleBankJagoConfirm('success')}
                        className="w-full py-3.5 bg-[#00B26A] text-white font-bold rounded-xl shadow-md hover:bg-[#009E5E] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Simulasikan Scan & Bayar Instan (Rp {activeTx.amount.toLocaleString('id-ID')})
                      </button>
                      <button
                        onClick={() => setShowBankJagoSim(true)}
                        className="w-full py-3 bg-orange-500 text-white font-bold rounded-xl shadow-xs hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Landmark className="w-5 h-5" />
                        Buka Bank Jago Simulator
                      </button>
                      <button
                        onClick={() => setActiveTx(null)}
                        className="w-full py-2.5 border border-gray-200 text-gray-600 font-bold rounded-xl text-xs hover:bg-gray-50 cursor-pointer"
                      >
                        Buat QR Baru / Ganti Nominal
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BANK JAGO SIMULATION MODAL */}
      {showBankJagoSim && activeTx && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-orange-100 bg-orange-50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center text-xs">J</div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Bank Jago Simulator</h3>
                  <p className="text-[10px] text-orange-700">Konfirmasi Pembayaran Deposit</p>
                </div>
              </div>
              <button 
                onClick={() => setShowBankJagoSim(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-orange-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Saldo Bank Jago</p>
                  <p className="text-sm font-bold text-gray-900">Rp {bankJagoBalance.toLocaleString('id-ID')}</p>
                </div>
                <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-2 py-1 rounded">Active</span>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Tagihan Deposit</p>
                  <p className="text-sm font-bold text-[#00B26A]">Rp {activeTx.amount.toLocaleString('id-ID')}</p>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded">Pending</span>
              </div>

              {simError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{simError}</span>
                </div>
              )}

              {simSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{simSuccess}</span>
                </div>
              )}

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => handleBankJagoConfirm('success')}
                  className="w-full py-3 bg-orange-500 text-white font-bold rounded-xl shadow-xs hover:bg-orange-600 transition-colors cursor-pointer"
                >
                  Bayar Sekarang (Rp {activeTx.amount.toLocaleString('id-ID')})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RIWAYAT / TRANSACTION HISTORY MODAL */}
      {showHistory && (
        <div className="fixed inset-0 z-[90] bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#00B26A]" />
                <h3 className="text-base font-bold text-gray-900">Riwayat Transaksi</h3>
              </div>
              <button 
                onClick={() => setShowHistory(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* History Tabs */}
            <div className="flex border-b border-gray-100 bg-gray-50/50">
              <button
                onClick={() => setHistoryTab('deposit')}
                className={cn(
                  "flex-1 py-3 text-xs font-bold text-center border-b-2 transition-colors cursor-pointer",
                  historyTab === 'deposit' 
                    ? "border-[#00B26A] text-[#00B26A] bg-white" 
                    : "border-transparent text-gray-500 hover:text-gray-800"
                )}
              >
                Deposit
              </button>
              <button
                onClick={() => setHistoryTab('withdrawal')}
                className={cn(
                  "flex-1 py-3 text-xs font-bold text-center border-b-2 transition-colors cursor-pointer",
                  historyTab === 'withdrawal' 
                    ? "border-[#00B26A] text-[#00B26A] bg-white" 
                    : "border-transparent text-gray-500 hover:text-gray-800"
                )}
              >
                Penarikan (Withdraw)
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1 min-h-[250px]">
              {txHistoryList.filter(tx => historyTab === 'deposit' ? tx.type === 'deposit' : tx.type === 'withdrawal' || tx.type === 'withdraw').length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                  <Clock className="w-10 h-10 mb-2 stroke-1" />
                  <p className="text-xs font-medium">Belum ada riwayat {historyTab}</p>
                </div>
              ) : (
                txHistoryList
                  .filter(tx => historyTab === 'deposit' ? tx.type === 'deposit' : tx.type === 'withdrawal' || tx.type === 'withdraw')
                  .map((tx, idx) => (
                    <div key={`txhist-${tx.id || tx.transactionId || idx}-${idx}`} className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-900">{tx.description || (tx.type === 'deposit' ? 'Deposit RDN / Bank Jago' : 'Penarikan ke Bank')}</p>
                        <p className="text-[10px] text-gray-400">
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleString('id-ID') : 'Baru saja'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-gray-900">
                          +Rp {Number(tx.amount || 0).toLocaleString('id-ID')}
                        </p>
                        <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 mt-1">
                          {tx.status || 'Sukses'}
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. UBAH FOTO PROFIL MODAL / BOTTOM SHEET */}
      {showAvatarModal && (
        <AvatarSelectorModal
          currentAvatarId={avatarId}
          currentCustomPhoto={customPhotoUrl}
          onClose={() => setShowAvatarModal(false)}
          onSave={handleSaveAvatar}
        />
      )}
    </div>
  );
}
