import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ArrowUpCircle, ArrowDownCircle, History, Copy, 
  User, Landmark, FileText, Fingerprint, Lock, Smartphone, 
  Link as LinkIcon, Snowflake, FileBadge, ArrowRightLeft, Mail, 
  Users, UserPlus, Wallet, Key, Moon, Bell, Globe, ShieldCheck, 
  Headphones, Stethoscope, Trash2, HelpCircle, Star, FileSignature, 
  RefreshCw, LogOut, ChevronRight, X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { ref, onValue, set, runTransaction, push, serverTimestamp, get } from 'firebase/database';
import { useAuth } from '../contexts/AuthContext';
import { WithdrawPage } from './WithdrawPage';

type ProfilePageProps = {
  onClose: () => void;
};

export function ProfilePage({ onClose }: ProfilePageProps) {
  const { user } = useAuth();
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [depositMsg, setDepositMsg] = useState<string | null>(null);
  
  // Transaction History Modal state
  const [showHistory, setShowHistory] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

  // Bank account state
  const [bankAccount, setBankAccount] = useState({
    bankName: 'JAGO',
    accountNumber: '103653847791',
    accountHolder: 'INVESTOR'
  });
  const [showBankModal, setShowBankModal] = useState(false);

  useEffect(() => {
    if (user) {
      // 1. Balance
      const balanceRef = ref(db, `users/${user.uid}/balance`);
      const unsubscribe = onValue(balanceRef, (snapshot) => {
        if (snapshot.exists()) {
          setBalance(snapshot.val());
        } else {
          const initialBalance = 10000000;
          set(balanceRef, initialBalance).catch(console.error);
        }
      });

      // 2. Bank Account
      const bankRef = ref(db, `users/${user.uid}/bankAccount`);
      get(bankRef).then((snapshot) => {
        if (snapshot.exists()) {
          setBankAccount(snapshot.val());
        }
      }).catch(console.error);

      return () => unsubscribe();
    }
  }, [user]);

  // Load transaction history for logged in user
  useEffect(() => {
    if (user && showHistory) {
      const txRef = ref(db, `users/${user.uid}/transactions`);
      get(txRef).then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list = Object.values(data).sort((a: any, b: any) => (b.timestamp || b.createdAt || 0) - (a.timestamp || a.createdAt || 0));
          setTransactions(list);
        } else {
          setTransactions([]);
        }
      }).catch(console.error);
    }
  }, [user, showHistory]);

  const handleDeposit = async () => {
    if (!user) return;
    try {
      const userBalanceRef = ref(db, `users/${user.uid}/balance`);
      await runTransaction(userBalanceRef, (currentBalance) => {
        return (currentBalance || 0) + 100000;
      });

      const transactionsRef = ref(db, `users/${user.uid}/transactions`);
      const newTxRef = push(transactionsRef);
      await set(newTxRef, {
        userId: user.uid,
        uid: user.uid,
        transactionId: newTxRef.key,
        type: "deposit",
        source: "external",
        destination: "garuda_inves",
        amount: 100000,
        status: "completed",
        createdAt: serverTimestamp(),
        timestamp: Date.now()
      });

      setDepositMsg("+ Rp100.000 berhasil ditambahkan");
      setTimeout(() => setDepositMsg(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      onClose(); // Close the profile page, App will unmount Main pages and show WelcomePage
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const userNameDisplay = user?.displayName || user?.email?.split('@')[0] || 'Investor';

  if (showWithdraw) {
    return <WithdrawPage onBack={() => setShowWithdraw(false)} />;
  }

  const MenuItem = ({ icon: Icon, title, isNew = false, rightElement, hasArrow = true, onClick }: any) => (
    <div onClick={onClick} className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 last:border-0 hover:bg-gray-50 active:bg-gray-100 cursor-pointer">
      <div className="flex items-center gap-4">
        <Icon className="h-[22px] w-[22px] text-gray-500" strokeWidth={1.5} />
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-secondary font-medium">{title}</span>
          {isNew && (
            <span className="rounded border border-primary px-1 py-[1px] text-[9px] font-bold text-primary">New</span>
          )}
        </div>
      </div>
      <div className="flex items-center">
        {rightElement}
        {hasArrow && !rightElement && <ChevronRight className="h-4 w-4 text-gray-400" strokeWidth={1.5} />}
      </div>
    </div>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <div className="px-4 py-3 bg-white">
      <h3 className="text-[11px] font-bold text-gray-400">{title}</h3>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center px-4 bg-white sticky top-0 z-10">
        <button onClick={onClose} className="p-1 -ml-1 text-gray-500 hover:text-secondary">
          <ChevronLeft className="h-6 w-6" strokeWidth={1.5} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
        {/* Profile Info */}
        <div className="flex flex-col items-center pt-2 pb-6">
          <div className="h-[64px] w-[64px] overflow-hidden rounded-full bg-blue-100 mb-3 shadow-sm border border-gray-100 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary">
              {userNameDisplay.substring(0, 1).toUpperCase()}
            </span>
          </div>
          <h2 className="text-[15px] font-bold text-secondary mb-0.5">{userNameDisplay}</h2>
          <p className="text-[11px] text-gray-500">{user?.email}</p>
        </div>

        {/* Balance Info */}
        <div className="grid grid-cols-2 px-8 mb-6">
          <div className="text-center">
            <p className="text-[10px] text-gray-400 mb-0.5">Total Trading Balance</p>
            <p className="text-[12px] font-bold text-secondary">Rp{balance.toLocaleString('en-US')}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-400 mb-0.5">Total Equity</p>
            <p className="text-[12px] font-bold text-secondary">Rp{balance.toLocaleString('en-US')}</p>
          </div>
        </div>

        {depositMsg && (
          <div className="px-4 mb-3 text-center">
            <span className="bg-green-100 text-[#00B26A] text-[11px] font-bold px-3 py-1 rounded-full animate-fade-in">
              {depositMsg}
            </span>
          </div>
        )}

        {/* Action Cards */}
        <div className="px-4 mb-4">
          <div className="rounded-xl border border-gray-100 shadow-sm overflow-hidden bg-white">
            <div className="grid grid-cols-3 border-b border-gray-100">
              <button onClick={handleDeposit} className="flex flex-col items-center justify-center py-4 hover:bg-gray-50 transition-colors">
                <ArrowUpCircle className="h-6 w-6 text-primary mb-1.5" strokeWidth={1.5} />
                <span className="text-[11px] font-bold text-secondary">Deposit (+100rb)</span>
              </button>
              <button onClick={() => setShowWithdraw(true)} className="flex flex-col items-center justify-center py-4 hover:bg-gray-50 border-x border-gray-100">
                <ArrowDownCircle className="h-6 w-6 text-primary mb-1.5" strokeWidth={1.5} />
                <span className="text-[11px] font-bold text-secondary">Withdraw</span>
              </button>
              <button onClick={() => setShowHistory(true)} className="flex flex-col items-center justify-center py-4 hover:bg-gray-50">
                <History className="h-6 w-6 text-primary mb-1.5" strokeWidth={1.5} />
                <span className="text-[11px] font-bold text-secondary">Riwayat</span>
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-400 text-white text-lg font-bold">
                  {bankAccount.bankName?.substring(0, 1) || 'J'}
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 leading-tight">RDN / Rekening ({bankAccount.bankName})</p>
                  <p className="text-[11px] text-secondary leading-tight uppercase">{bankAccount.accountHolder}</p>
                  <p className="text-[12px] font-bold text-secondary leading-tight">{bankAccount.accountNumber}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(bankAccount.accountNumber);
                  alert('Nomor rekening telah disalin!');
                }}
                className="p-2 text-primary hover:bg-green-50 rounded-full"
              >
                <Copy className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Riwayat Transaksi */}
        {showHistory && (
          <div className="fixed inset-0 z-[80] bg-black/50 flex flex-col justify-end">
            <div className="bg-white rounded-t-2xl w-full max-h-[85vh] flex flex-col p-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900">Riwayat Transaksi Saya</h3>
                <button onClick={() => setShowHistory(false)} className="p-1 text-gray-400 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-3 space-y-3 no-scrollbar">
                {transactions.length === 0 ? (
                  <p className="text-center py-8 text-xs text-gray-400">Belum ada riwayat transaksi</p>
                ) : (
                  transactions.map((tx, idx) => {
                    const isP2Transfer = tx.destination === 'jago' || tx.destinationProject === 'project2' || tx.type === 'withdraw_project2';
                    const isBuyOrWd = tx.type === 'buy' || tx.type === 'withdraw' || tx.type === 'withdraw_project2';
                    return (
                      <div key={tx.transactionId || idx} className="p-3 border border-gray-100 rounded-lg flex items-center justify-between bg-gray-50/50 text-xs gap-2">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={cn(
                              "px-2 py-0.5 rounded font-bold uppercase text-[9px] tracking-wide",
                              tx.type === 'buy' ? "bg-blue-100 text-blue-700" :
                              tx.type === 'sell' ? "bg-green-100 text-green-700" :
                              tx.type === 'deposit' ? "bg-emerald-100 text-emerald-700" :
                              isP2Transfer ? "bg-emerald-100 text-[#00B26A]" : "bg-orange-100 text-orange-700"
                            )}>
                              {isP2Transfer ? 'Transfer ke Project 2' : tx.type}
                            </span>
                            <span className="font-bold text-gray-900 truncate">
                              {isP2Transfer ? 'Project 2 (Akun Saya)' : (tx.asset || tx.symbol || tx.source || 'Sistem')}
                            </span>
                          </div>
                          {tx.transactionId && (
                            <p className="text-[10px] font-mono text-gray-500 truncate">
                              ID: {tx.transactionId}
                            </p>
                          )}
                          {tx.lot && <p className="text-gray-500 text-[11px]">{tx.lot} lot @ Rp{tx.price?.toLocaleString()}</p>}
                          {tx.pnl !== undefined && (
                            <p className={cn("text-[11px] font-medium", tx.pnl >= 0 ? "text-green-600" : "text-red-500")}>
                              PnL: {tx.pnl >= 0 ? '+' : ''}Rp{tx.pnl?.toLocaleString()} ({tx.pnlPercent}%)
                            </p>
                          )}
                          <p className="text-[10px] text-gray-400">
                            {tx.timestamp ? new Date(tx.timestamp).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : 'Selesai'}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={cn(
                            "font-bold text-sm block",
                            isBuyOrWd ? "text-gray-900" : "text-[#00B26A]"
                          )}>
                            {isBuyOrWd ? '-' : '+'}Rp{(tx.amount || tx.total || 0).toLocaleString('en-US')}
                          </span>
                          <span className="inline-block mt-0.5 text-[10px] text-emerald-600 font-bold uppercase px-1.5 py-0.2 rounded bg-emerald-50">
                            {tx.status || 'Completed'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Update Banner */}
        <div className="px-4 mb-4">
          <div className="flex items-center justify-between rounded-lg bg-green-50/80 px-4 py-3 border border-green-100">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-primary" strokeWidth={2} />
              <span className="text-[11px] font-bold text-primary">New Version Available</span>
            </div>
            <button className="rounded bg-primary px-3 py-1.5 text-[11px] font-bold text-white shadow-sm">
              Update Now
            </button>
          </div>
        </div>

        <div className="bg-white">
          <SectionTitle title="Akun" />
          <MenuItem icon={User} title="Akun" />
          <MenuItem icon={Landmark} title="Rekening Bank" onClick={() => setShowWithdraw(true)} />
          <MenuItem icon={FileText} title="E-Statement" />

          <SectionTitle title="Keamanan" />
          <MenuItem icon={Fingerprint} title="Biometrik Login" />
          <MenuItem icon={Lock} title="Keamanan" />
          <MenuItem icon={Smartphone} title="Perangkat Terhubung" />
          <MenuItem icon={LinkIcon} title="Akun Terhubung" />
          <MenuItem icon={Snowflake} title="Blokir Akun Sementara" isNew={true} />

          <SectionTitle title="Fitur" />
          <MenuItem icon={FileBadge} title="e-IPO" />
          <MenuItem icon={ArrowRightLeft} title="Transfer Saham" />
          <MenuItem icon={Mail} title="KTUR" />
          <MenuItem icon={Users} title="External Community" />
          <MenuItem icon={UserPlus} title="Temukan Teman" />
          <MenuItem icon={Wallet} title="Kantong Tip" />
          <MenuItem icon={Key} title="Garuda Invest PRO" />

          <SectionTitle title="Pengaturan" />
          <MenuItem 
            icon={Moon} 
            title="Mode Gelap" 
            hasArrow={false}
            rightElement={
              <div className="h-5 w-9 rounded-full bg-gray-200 relative">
                <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform"></div>
              </div>
            }
          />
          <MenuItem icon={Bell} title="Notifikasi" />
          <MenuItem icon={Globe} title="Bahasa" />
          <MenuItem icon={ShieldCheck} title="Privasi" />

          <SectionTitle title="Bantuan" />
          <MenuItem icon={Headphones} title="Live Support" />
          <MenuItem icon={Stethoscope} title="Diagnosis" />
          <MenuItem icon={Trash2} title="Hapus Cache" />
          <MenuItem icon={HelpCircle} title="FAQ" />
          <MenuItem icon={Star} title="Beri Garuda Invest Rating" />

          <SectionTitle title="Legal" />
          <MenuItem icon={FileText} title="Syarat Penggunaan" />
          <MenuItem icon={FileSignature} title="Kebijakan Privasi" />

          <SectionTitle title="Login" />
          <MenuItem icon={LogOut} title="Keluar" onClick={handleLogout} />
        </div>

        {/* Footer info */}
        <div className="mt-8 mb-12 flex flex-col items-center gap-4">
          <p className="text-[10px] font-bold text-secondary">© PT Garuda Invest Sekuritas Digital</p>
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-white">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
              </svg>
            </div>
          </div>
          <p className="text-[10px] text-gray-400">Version : 3.22.0 (11336)</p>
        </div>
      </div>
    </div>
  );
}
