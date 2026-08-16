import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import { auth, googleProvider, db } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { cn } from '../lib/utils';

interface WelcomePageProps {
  onLogin: () => void;
}

export function WelcomePage({ onLogin }: WelcomePageProps) {
  const [view, setView] = useState<'welcome' | 'login' | 'register'>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const formatAuthError = (err: any) => {
    const msg = err.message || '';
    if (msg.includes('auth/unauthorized-domain')) {
      return 'Domain aplikasi ini belum diotorisasi di Firebase Console untuk Google Sign-In. Silakan gunakan Masuk / Daftar dengan Email & Password di bawah ini.';
    }
    if (msg.includes('auth/email-already-in-use')) return 'Email ini sudah terdaftar. Silakan masuk.';
    if (msg.includes('auth/invalid-email')) return 'Format email tidak valid.';
    if (msg.includes('auth/weak-password')) return 'Password terlalu lemah, minimal 6 karakter.';
    if (msg.includes('auth/wrong-password') || msg.includes('auth/user-not-found') || msg.includes('auth/invalid-credential')) {
      return 'Email atau password salah.';
    }
    return msg || 'Gagal melakukan autentikasi';
  };

  const ensureUserInitialState = async (uid: string, userDisplayName?: string | null) => {
    try {
      const balanceRef = ref(db, `users/${uid}/balance`);
      const balSnap = await get(balanceRef);
      if (!balSnap.exists()) {
        await set(balanceRef, 0);
        await set(ref(db, `wallets/${uid}/balance`), 0);
      }
      
      const profileRef = ref(db, `users/${uid}/profileData`);
      const profSnap = await get(profileRef);
      if (!profSnap.exists()) {
        const name = userDisplayName || email.split('@')[0] || 'Investor';
        await set(profileRef, {
          displayName: name,
          username: name.toLowerCase().replace(/\s+/g, '') + Math.floor(100 + Math.random() * 900),
          website: '',
          biography: '',
          gender: 'Laki-laki',
          createdAt: Date.now()
        });
      }
    } catch (e) {
      console.error('Error initializing user state in database:', e);
    }
  };

  const handleEmailLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await ensureUserInitialState(cred.user.uid, cred.user.displayName);
      onLogin();
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailRegister = async () => {
    try {
      setLoading(true);
      setError('');
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // Explicitly set initial balance to 0 for new user
      await set(ref(db, `users/${cred.user.uid}/balance`), 0);
      await set(ref(db, `wallets/${cred.user.uid}/balance`), 0);
      await ensureUserInitialState(cred.user.uid, cred.user.displayName);
      onLogin();
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      const cred = await signInWithPopup(auth, googleProvider);
      await ensureUserInitialState(cred.user.uid, cred.user.displayName);
      onLogin();
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  if (view === 'login') {
    return (
      <div className="flex flex-col h-full bg-white px-6 pt-12 pb-6">
        <div className="flex items-center gap-2 mb-10">
          <button 
            onClick={() => setView('welcome')}
            className="text-gray-500 hover:text-gray-900 font-medium"
          >
            ← Kembali
          </button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Masuk ke Akun Anda
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Silakan masukkan detail Anda di bawah ini
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="nama@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-500">{error}</p>
        )}

        <button
          onClick={handleEmailLogin}
          disabled={loading || !email || !password}
          className="mt-8 w-full bg-primary text-white font-semibold py-3.5 rounded-lg disabled:opacity-50 hover:bg-primary/90 transition-colors"
        >
          {loading ? 'Memproses...' : 'Masuk'}
        </button>
      </div>
    );
  }

  if (view === 'register') {
    return (
      <div className="flex flex-col h-full bg-white px-6 pt-12 pb-6 overflow-y-auto no-scrollbar">
        <div className="flex items-center gap-2 mb-8">
          <button 
            onClick={() => {
              setError('');
              setView('welcome');
            }}
            className="text-gray-500 hover:text-gray-900 font-medium text-sm"
          >
            ← Kembali
          </button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Daftar Akun Baru
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Buat akun baru untuk mulai berinvestasi.
        </p>

        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              placeholder="nama@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              placeholder="Minimal 6 karakter"
            />
          </div>
        </div>

        {error && (
          <p className="mb-4 text-xs font-semibold text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>
        )}

        <button
          onClick={handleEmailRegister}
          disabled={loading || !email || !password}
          className="w-full bg-primary text-white font-semibold py-3.5 rounded-lg disabled:opacity-50 hover:bg-primary/90 transition-colors text-sm mb-4 shadow-sm"
        >
          {loading ? 'Memproses...' : 'Daftar Akun'}
        </button>

        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-xs font-medium">atau</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white border border-gray-300 text-gray-700 font-semibold py-3.5 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 text-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {loading ? 'Memproses...' : 'Daftar dengan Google'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-6 pt-12 z-10">
        <div className="flex items-center gap-2">
          <img src="/logo.jpg" alt="P-Stock Sekuritas" className="w-8 h-8 rounded object-cover shadow-sm" />
          <span className="font-bold text-lg tracking-tight text-gray-900">P-Stock Sekuritas</span>
        </div>
        {/* Indonesian flag mock */}
        <div className="flex items-center justify-center bg-gray-100 rounded-full w-12 h-6 border border-gray-200">
           <div className="w-4 h-4 rounded-full overflow-hidden flex flex-col">
              <div className="bg-red-500 flex-1"></div>
              <div className="bg-white flex-1"></div>
           </div>
        </div>
      </div>

      {/* Illustration Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative mt-10">
        <div className="relative w-64 h-80 flex items-center justify-center">
          {/* Decorative shapes behind */}
          <div className="absolute inset-0 bg-[#e6fcf2] rounded-[40px] transform -rotate-6 scale-110 opacity-70"></div>
          
          {/* Phone mock */}
          <div className="relative bg-white w-48 h-80 rounded-[30px] border-4 border-gray-800 shadow-xl flex flex-col items-center pt-4 z-10">
             <div className="w-16 h-1.5 bg-gray-800 rounded-full mb-10"></div>
             {/* Chart visual inside phone */}
             <div className="w-10 h-10 bg-[#e6fcf2] rounded-full self-start ml-4 mb-16"></div>
             
             <svg width="120" height="50" viewBox="0 0 120 50" className="mb-8 absolute top-36">
               <path d="M0,45 L15,25 L25,30 L45,25 L65,25 L75,35 L90,15 L105,35" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinejoin="round"/>
             </svg>

             <div className="mt-auto mb-6 bg-primary w-32 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm">
               Beli
             </div>
          </div>
          
          {/* Floating elements */}
          <div className="absolute top-10 left-0 w-3 h-8 border-2 border-gray-800 rounded-sm transform -rotate-12"></div>
          <div className="absolute top-20 right-0 w-6 h-16 border-2 border-gray-800 rounded-sm transform rotate-12"></div>
          <div className="absolute bottom-20 left-4 text-primary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div className="absolute top-40 right-4 text-primary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
        </div>
      </div>

      {/* Text Content */}
      <div className="px-8 text-center mt-12 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Beli Saham di P-Stock Sekuritas Aja</h2>
        <p className="text-[13px] text-gray-500 leading-relaxed max-w-[240px] mx-auto">
          Swipe. Order. Done. Semudah itu.
          Tanpa harus baca manual.
        </p>

        {/* Carousel Dots */}
        <div className="flex justify-center gap-1.5 mt-8">
          <div className="w-6 h-1.5 bg-primary rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
        </div>
      </div>

      {/* Buttons */}
      <div className="px-6 pb-10 flex flex-col gap-4">
        <button 
          onClick={() => setView('register')}
          className="w-full bg-primary text-white font-bold py-3.5 rounded-lg text-sm shadow-sm hover:bg-primary/90 transition-colors"
        >
          Daftar
        </button>
        <button 
          onClick={() => setView('login')}
          className="w-full text-primary font-bold py-3.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          Masuk
        </button>
      </div>
    </div>
  );
}
