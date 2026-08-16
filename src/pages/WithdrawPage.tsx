import React, { useState } from 'react';
import { ChevronLeft, History, Headphones, ChevronRight, Info, Landmark, ArrowRightLeft, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { db } from '../lib/firebase';
import { ref, get, set, onValue, serverTimestamp, runTransaction, push } from 'firebase/database';
import { cn } from '../lib/utils';

type WithdrawPageProps = {
  onBack: () => void;
};

export function WithdrawPage({ onBack }: WithdrawPageProps) {
  const { user } = useAuth();
  const { showPushNotification } = useNotification();
  const activeUid = user?.uid || 'demo_user';
  const [amount, setAmount] = useState('');
  const [withdrawAll, setWithdrawAll] = useState(false);
  const [step, setStep] = useState<'input' | 'confirm' | 'process'>('input');
  const [withdrawableBalance, setWithdrawableBalance] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Transfer destination type: 'project2' (default) or 'bank'
  const [withdrawDestination, setWithdrawDestination] = useState<'project2' | 'bank'>('project2');

  // Bank account state
  const [bankAccount, setBankAccount] = useState({
    bankName: 'JAGO',
    accountNumber: '103653847791',
    accountHolder: 'INVESTOR'
  });
  const [showEditBank, setShowEditBank] = useState(false);
  const [editBankName, setEditBankName] = useState('JAGO');
  const [editAccNum, setEditAccNum] = useState('');
  const [editAccHolder, setEditAccHolder] = useState('');

  React.useEffect(() => {
    // 1. Fetch balance in realtime
    const balanceRef = ref(db, `users/${activeUid}/balance`);
    const unsubscribeBal = onValue(balanceRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        setWithdrawableBalance(typeof val === 'number' ? val : Number(val) || 0);
      } else {
        const initialBalance = 0;
        set(balanceRef, initialBalance).catch(console.error);
        setWithdrawableBalance(initialBalance);
      }
    });

    // 2. Fetch or initialize Bank Account
    const bankRef = ref(db, `users/${activeUid}/bankAccount`);
    get(bankRef).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setBankAccount(data);
        setEditBankName(data.bankName || 'JAGO');
        setEditAccNum(data.accountNumber || '');
        setEditAccHolder(data.accountHolder || '');
      } else {
        const defaultHolder = (user?.displayName || user?.email?.split('@')[0] || 'INVESTOR').toUpperCase();
        const defaultAccNum = `103${Math.floor(100000000 + Math.random() * 900000000)}`;
        const defaultBank = {
          bankName: 'JAGO',
          accountNumber: defaultAccNum,
          accountHolder: defaultHolder
        };
        set(bankRef, defaultBank).catch(console.error);
        setBankAccount(defaultBank);
        setEditBankName('JAGO');
        setEditAccNum(defaultAccNum);
        setEditAccHolder(defaultHolder);
      }
    }).catch(console.error);

    return () => {
      unsubscribeBal();
    };
  }, [activeUid, user]);

  const handleSaveBank = async () => {
    if (!user) return;
    if (!editAccNum.trim() || !editAccHolder.trim()) return;
    const updated = {
      bankName: editBankName.trim().toUpperCase() || 'JAGO',
      accountNumber: editAccNum.trim(),
      accountHolder: editAccHolder.trim().toUpperCase()
    };
    try {
      await set(ref(db, `users/${user.uid}/bankAccount`), updated);
      setBankAccount(updated);
      setShowEditBank(false);
    } catch (e) {
      console.error('Failed to update bank account:', e);
    }
  };
  
  const handleToggle = () => {
    setWithdrawAll(!withdrawAll);
    if (!withdrawAll) {
      setAmount(withdrawableBalance.toLocaleString('en-US'));
    } else {
      setAmount('');
    }
  };

  const handleLanjut = () => {
    const numericAmount = parseInt(amount.replace(/,/g, ''), 10);
    if (!user) {
      setErrorMsg('Anda harus login terlebih dahulu.');
      return;
    }
    if (amount && numericAmount >= 10000 && numericAmount <= withdrawableBalance) {
      setStep('confirm');
      setErrorMsg(null);
    } else if (numericAmount > withdrawableBalance) {
      setErrorMsg('Saldo tidak mencukupi.');
    } else if (numericAmount < 10000) {
      setErrorMsg('Nominal penarikan minimal Rp 10.000.');
    }
  };

  const handleWithdraw = async () => {
    if (!user || isProcessing) return;
    const numericAmount = parseInt(amount.replace(/,/g, ''), 10);
    if (isNaN(numericAmount) || numericAmount > withdrawableBalance || numericAmount < 10000) {
      setErrorMsg('Nominal penarikan tidak valid.');
      return;
    }
    
    setIsProcessing(true);
    setErrorMsg(null);
    
    try {
      const userBalanceRef = ref(db, `users/${activeUid}/balance`);
      
      // Atomic deduction from Project 1
      const transactionResult = await runTransaction(userBalanceRef, (currentBalance) => {
        if (currentBalance === null) return currentBalance;
        if (currentBalance >= numericAmount) {
          return currentBalance - numericAmount;
        } else {
          return undefined; // Abort if balance insufficient
        }
      });

      if (transactionResult.committed) {
        const newP1Balance = transactionResult.snapshot.val();
        
        // Sync wallet balance node
        await set(ref(db, `wallets/${activeUid}/balance`), newP1Balance).catch(console.error);

        // Generate unique transaction ID
        const rawKey = push(ref(db, 'temp')).key || 'ABC';
        const timestampSeconds = Math.floor(Date.now() / 1000);
        const txKey = `WD-${timestampSeconds}-${rawKey.substring(rawKey.length - 6).toUpperCase()}`;

        if (withdrawDestination === 'project2') {
          // Save transaction log for Project 2 (Bank Jago) in requested Indonesian format
          const project2TxData = {
            transactionId: txKey,
            userId: activeUid,
            type: "tarik",
            sumber: "garuda_invest",
            tujuan: "jago",
            jumlah: numericAmount,
            status: "selesai",
            createdAt: serverTimestamp()
          };

          // Save transaction log for Project 1 (Garuda Inves) in original format for UI history
          const project1TxData = {
            userId: activeUid,
            transactionId: txKey,
            type: "withdraw_project2",
            source: "garuda_inves",
            destination: "jago",
            amount: numericAmount,
            status: "completed",
            createdAt: serverTimestamp(),
            timestamp: Date.now()
          };

          // Simpan ke path khusus untuk Project 2 Bank Jago
          await set(ref(db, `pengguna/${activeUid}/transaksi/${txKey}`), project2TxData);
          
          // Simpan ke path history Project 1 (UI)
          await set(ref(db, `users/${activeUid}/transactions/${txKey}`), project1TxData);
          await set(ref(db, `users/${activeUid}/withdrawals/${txKey}`), project1TxData);
        } else {
          // Bank withdrawal transaction
          const txData = {
            userId: activeUid,
            transactionId: txKey,
            type: "withdraw",
            source: "garuda_inves",
            destination: bankAccount.bankName,
            accountNumber: bankAccount.accountNumber,
            accountHolder: bankAccount.accountHolder,
            amount: numericAmount,
            status: "completed",
            createdAt: serverTimestamp(),
            timestamp: Date.now()
          };
          await set(ref(db, `users/${activeUid}/transactions/${txKey}`), txData);
          await set(ref(db, `users/${activeUid}/withdrawals/${txKey}`), txData);
        }

        setWithdrawableBalance(newP1Balance);
        setStep('process');

        // Trigger Phone Push Notification
        const destTitle = withdrawDestination === 'project2' 
          ? 'Bank Jago (Project 2)' 
          : `${bankAccount.bankName} (${bankAccount.accountNumber})`;

        showPushNotification({
          title: 'Penarikan Dana Berhasil',
          message: `Penarikan saldo sebesar Rp ${numericAmount.toLocaleString('id-ID')} ke ${destTitle} telah berhasil diproses.`,
          type: 'withdraw',
          amount: numericAmount,
          destination: destTitle
        });
      } else {
        setErrorMsg('Penarikan gagal: Saldo tidak mencukupi.');
        setStep('input');
      }
    } catch (e) {
      console.error('Withdrawal error:', e);
      setErrorMsg('Terjadi kesalahan sistem/jaringan.');
      setStep('input');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelesai = () => {
    onBack();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between px-4 bg-white sticky top-0 z-10 border-b border-transparent">
        <button onClick={onBack} className="p-1 -ml-1 text-gray-500 hover:text-gray-900 transition-colors">
          <ChevronLeft className="h-6 w-6" strokeWidth={1.5} />
        </button>
        <h1 className="text-[15px] font-bold text-gray-900">Withdrawal</h1>
        <div className="flex items-center gap-3">
          <button className="p-1 -mr-1 text-gray-500 hover:text-gray-900 transition-colors">
            <History className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <button className="p-1 -mr-1 text-gray-500 hover:text-gray-900 transition-colors">
            <Headphones className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Balance */}
        <div className="flex flex-col items-center pt-6 pb-6">
          <span className="text-[13px] font-bold text-gray-900 mb-1.5">Saldo yang Dapat Ditarik</span>
          <span className="text-[11px] text-gray-400 mb-2">Google Auth UID: {user?.uid ? `${user.uid.substring(0, 10)}...` : 'Not Logged In'}</span>
          <div className="flex items-center gap-1 cursor-pointer">
            <span className="text-lg font-bold text-[#00B26A]">Rp{withdrawableBalance.toLocaleString('en-US')}</span>
            <ChevronRight className="w-4 h-4 text-[#00B26A] mt-0.5" strokeWidth={2.5} />
          </div>
        </div>

        {/* Amount Input */}
        <div className="px-4 mb-4">
          <label className="block text-[13px] font-bold text-gray-900 mb-2">
            Nominal Penarikan
          </label>
          <div className="flex items-center border border-gray-200 rounded-lg px-4 py-3 focus-within:border-[#00B26A] transition-colors">
            <span className="text-[14px] text-gray-900 font-medium mr-2">Rp</span>
            <input 
              type="text"
              value={amount}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                if (val) {
                  setAmount(parseInt(val, 10).toLocaleString('en-US'));
                } else {
                  setAmount('');
                }
                if (val !== withdrawableBalance.toString()) {
                  setWithdrawAll(false);
                }
              }}
              placeholder="Minimum Rp 10,000"
              className="flex-1 text-[15px] outline-none placeholder:text-gray-400 font-medium text-gray-900 bg-transparent w-full"
            />
          </div>
        </div>
        {errorMsg && (
          <div className="px-4 mb-4 -mt-2">
            <p className="text-xs text-red-500 font-medium">{errorMsg}</p>
          </div>
        )}

        {/* Toggle All */}
        <div className="px-4 flex justify-end items-center mb-6">
          <span className="text-[13px] text-gray-500 mr-3">Tarik Semua Saldo</span>
          <button 
            onClick={handleToggle}
            className={`w-[42px] h-6 rounded-full relative transition-colors duration-200 ease-in-out ${withdrawAll ? 'bg-[#00B26A]' : 'bg-gray-300'}`}
          >
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out ${withdrawAll ? 'transform translate-x-[18px]' : ''}`} />
          </button>
        </div>

        {/* Destination Option Tabs */}
        <div className="px-4 mb-6">
          <label className="block text-[13px] font-bold text-gray-900 mb-2">
            Tujuan Withdraw / Transfer
          </label>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              type="button"
              onClick={() => setWithdrawDestination('project2')}
              className={cn(
                "p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all text-center",
                withdrawDestination === 'project2' 
                  ? "border-[#f58220] bg-orange-50/60 text-orange-800 shadow-sm ring-1 ring-[#f58220]" 
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              )}
            >
              <div className="w-7 h-7 rounded-lg bg-[#f58220] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                <div className="flex flex-col items-center justify-center">
                  <div className="flex gap-[1px] mb-[1px]">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  <span className="text-white font-black text-xs leading-none tracking-tighter">J</span>
                </div>
              </div>
              <span>Bank Jago (Project 2)</span>
            </button>

            <button
              type="button"
              onClick={() => setWithdrawDestination('bank')}
              className={cn(
                "p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all text-center",
                withdrawDestination === 'bank' 
                  ? "border-[#00B26A] bg-emerald-50/60 text-[#00B26A] shadow-sm ring-1 ring-[#00B26A]" 
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              )}
            >
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shadow-sm">
                <Landmark className="w-4 h-4" />
              </div>
              <span>Rekening Bank</span>
            </button>
          </div>

          {/* Destination Card Detail */}
          {withdrawDestination === 'project2' ? (
            <div className="border border-orange-200 rounded-xl p-4 flex items-center justify-between bg-orange-50/30">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 bg-[#f58220] rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-base shadow-sm">
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex gap-0.5 mb-0.5">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                    <span className="text-white font-black text-xl leading-none tracking-tighter">J</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[13px] font-bold text-gray-900">Bank Jago (Project 2)</span>
                    <span className="bg-orange-100 text-orange-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase">Otomatis UID</span>
                  </div>
                  <span className="text-[11px] font-mono text-gray-600 tracking-tight">UID: {user?.uid || '-'}</span>
                  <span className="text-[10px] text-gray-500">Penerima Otomatis (Akun Project 2 Saya)</span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-gray-500">Rekening Tujuan</span>
                <button 
                  onClick={() => setShowEditBank(true)}
                  className="text-[11px] font-bold text-[#00B26A] hover:underline"
                >
                  Ubah Rekening
                </button>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between bg-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#f6891f] rounded-full flex items-center justify-center shrink-0">
                     <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
                       <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" fill="#f6891f" />
                       <path d="M15.5 8.5v3c0 2-1.5 3.5-3.5 3.5s-3.5-1.5-3.5-3.5v-1h2v1c0 1 .5 1.5 1.5 1.5s1.5-.5 1.5-1.5v-3h2z" fill="white" />
                       <circle cx="15.5" cy="6" r="1.5" fill="white" />
                       <path d="M7.5 15.5c1 1.5 2.5 2.5 4.5 2.5s3.5-1 4.5-2.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                     </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12px] text-gray-500 mb-0.5">{bankAccount.bankName}</span>
                    <span className="text-[14px] font-bold text-gray-900 mb-0.5 tracking-tight">{bankAccount.accountNumber}</span>
                    <span className="text-[11px] text-gray-400 uppercase">{bankAccount.accountHolder}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Ubah Rekening */}
        {showEditBank && (
          <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-sm w-full p-5 space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-gray-900">Ubah Rekening Bank</h3>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Bank</label>
                <input 
                  type="text" 
                  value={editBankName}
                  onChange={(e) => setEditBankName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#00B26A]"
                  placeholder="Contoh: BANK JAGO / BCA / MANDIRI"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nomor Rekening</label>
                <input 
                  type="text" 
                  value={editAccNum}
                  onChange={(e) => setEditAccNum(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#00B26A]"
                  placeholder="Masukkan nomor rekening"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Pemilik Rekening</label>
                <input 
                  type="text" 
                  value={editAccHolder}
                  onChange={(e) => setEditAccHolder(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#00B26A]"
                  placeholder="Nama sesuai buku tabungan"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => setShowEditBank(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSaveBank}
                  className="flex-1 py-2.5 bg-[#00B26A] rounded-lg text-xs font-bold text-white hover:bg-[#00995c]"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Banner */}
        <div className="px-4 mb-8">
          <div className="bg-[#f0f4ff] rounded-lg p-3.5 flex items-start gap-3">
            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" strokeWidth={2.5} />
            <p className="text-[11px] text-gray-700 leading-relaxed pr-2">
              {withdrawDestination === 'project2' ? (
                <>Withdrawal ke <span className="font-bold text-gray-900">Project 2</span> diproses secara otomatis & instan menggunakan UID akun Firebase Anda.</>
              ) : (
                <>Dana dari penjualan saham akan masuk ke <span className="font-bold text-gray-900">Saldo yang Dapat Ditarik</span> maksimal dalam 3 hari kerja.</>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Button */}
      <div className="p-4 border-t border-gray-100 bg-white sticky bottom-0">
        <button 
          onClick={handleLanjut}
          className={`w-full py-3.5 rounded-lg text-[13px] font-bold transition-colors ${
            amount && parseInt(amount.replace(/,/g, ''), 10) >= 10000 
              ? 'bg-[#00B26A] text-white hover:bg-[#00995c]' 
              : 'bg-[#c3ecd7] text-white cursor-not-allowed'
          }`}
        >
          Lanjut
        </button>
      </div>

      {/* Bottom Sheet Overlay */}
      <AnimatePresence>
        {step !== 'input' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 flex flex-col justify-end"
            onClick={() => setStep('input')}
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-2xl w-full flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1.5 bg-gray-300 rounded-full"></div>
              </div>
              
              <div className="flex-1 overflow-y-auto px-4 pb-4 no-scrollbar">
                {step === 'confirm' ? (
                  <>
                    <div className="flex flex-col items-center pt-2 pb-6">
                      <span className="text-[12px] font-medium text-gray-600 mb-2">
                        {withdrawDestination === 'project2' ? 'Nominal Transfer ke Project 2' : 'Nominal Penarikan'}
                      </span>
                      <span className="text-[26px] font-bold text-[#00B26A]">Rp{amount}</span>
                    </div>

                    {/* Transfer ke */}
                    <div className="mb-6">
                      <label className="block text-[13px] font-bold text-gray-900 mb-3">
                        Transfer ke
                      </label>
                      {withdrawDestination === 'project2' ? (
                        <div className="border border-orange-200 rounded-lg p-4 flex items-center gap-4 bg-orange-50/40 shadow-sm">
                          <div className="w-12 h-12 bg-[#f58220] rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-base shadow-sm">
                            <div className="flex flex-col items-center justify-center">
                              <div className="flex gap-0.5 mb-0.5">
                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                              </div>
                              <span className="text-white font-black text-xl leading-none tracking-tighter">J</span>
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-[14px] font-bold text-gray-900">Bank Jago (Project 2)</span>
                              <span className="bg-orange-100 text-orange-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded">Otomatis UID</span>
                            </div>
                            <span className="text-[12px] font-mono text-gray-700 tracking-tight">UID: {user?.uid || '-'}</span>
                            <span className="text-[11px] text-gray-500">Penerima: Akun Saya di Project 2</span>
                          </div>
                        </div>
                      ) : (
                        <div className="border border-gray-100 rounded-lg p-4 flex items-center gap-4 bg-white shadow-sm">
                          <div className="w-12 h-12 bg-[#f6891f] rounded-full flex items-center justify-center shrink-0">
                             <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
                               <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" fill="#f6891f" />
                               <path d="M15.5 8.5v3c0 2-1.5 3.5-3.5 3.5s-3.5-1.5-3.5-3.5v-1h2v1c0 1 .5 1.5 1.5 1.5s1.5-.5 1.5-1.5v-3h2z" fill="white" />
                               <circle cx="15.5" cy="6" r="1.5" fill="white" />
                               <path d="M7.5 15.5c1 1.5 2.5 2.5 4.5 2.5s3.5-1 4.5-2.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                             </svg>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[12px] text-gray-500 mb-0.5">{bankAccount.bankName}</span>
                            <span className="text-[14px] font-bold text-gray-900 mb-0.5 tracking-tight">{bankAccount.accountNumber}</span>
                            <span className="text-[11px] text-gray-400 uppercase">{bankAccount.accountHolder}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Detail Penarikan */}
                    <div className="mb-6">
                      <label className="block text-[13px] font-bold text-gray-900 mb-3">
                        Detail Penarikan
                      </label>
                      <div className="border border-gray-100 rounded-lg bg-white shadow-sm overflow-hidden text-[13px]">
                        <div className="flex justify-between p-3.5 border-b border-gray-50">
                          <span className="text-gray-600">Nominal Transfer</span>
                          <span className="text-gray-900 font-medium">Rp{amount}</span>
                        </div>
                        <div className="flex justify-between p-3.5 border-b border-gray-50">
                          <span className="text-gray-600">Biaya Transfer</span>
                          <span className="text-[#00B26A] font-bold">Gratis</span>
                        </div>
                        <div className="flex justify-between p-3.5 bg-gray-50/30">
                          <span className="text-gray-700">Total Diterima</span>
                          <span className="text-gray-900 font-bold">Rp{amount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Info Banner */}
                    <div className="mb-8">
                      <div className="bg-[#f0f4ff] rounded-lg p-3.5 flex items-start gap-3">
                        <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                        <p className="text-[11px] text-gray-700 leading-relaxed pr-2">
                          {withdrawDestination === 'project2' ? (
                            <>Saldo sebesar <span className="font-bold text-gray-900">Rp{amount}</span> akan langsung ditransfer ke saldo Project 2 milik UID Anda secara instan.</>
                          ) : (
                            <>Dana akan ditransfer maksimal dalam <span className="font-bold text-gray-900">2 hari kerja.</span></>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="pb-4">
                      <button 
                        onClick={handleWithdraw}
                        disabled={isProcessing}
                        className={cn(
                          "w-full py-3.5 rounded-lg text-[14px] font-bold transition-colors bg-[#00B26A] text-white hover:bg-[#00995c]",
                          isProcessing && "opacity-60 cursor-not-allowed"
                        )}
                      >
                        {isProcessing ? "Memproses Transfer..." : "Withdraw / Transfer"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10">
                    <div className="relative mb-8 w-28 h-28 flex items-center justify-center">
                      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-[#00B26A]">
                        {/* Top rectangle */}
                        <rect x="25" y="25" width="50" height="20" stroke="currentColor" strokeWidth="2.5" />
                        {/* Slot line */}
                        <line x1="35" y1="35" x2="65" y2="35" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                        {/* Bottom rectangle (paper) */}
                        <path d="M35 45 V75 H65 V45" stroke="currentColor" strokeWidth="2.5" />
                        <line x1="35" y1="45" x2="65" y2="45" stroke="white" strokeWidth="4" />
                        {/* Arrow pointing down on the paper */}
                        <line x1="50" y1="50" x2="50" y2="62" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                        <polyline points="44,56 50,62 56,56" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        {/* Paper horizontal line at bottom */}
                        <line x1="40" y1="68" x2="60" y2="68" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                      {/* Checkmark icon overlay */}
                      <div className="absolute bottom-1 right-1 w-10 h-10 bg-[#00B26A] text-white rounded-full flex items-center justify-center shadow-md">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                    </div>
                    <span className="text-[13px] font-medium text-gray-700 mb-1.5">
                      {withdrawDestination === 'project2' ? 'Transfer ke Project 2 Berhasil' : 'Penarikan Berhasil Diproses'}
                    </span>
                    <span className="text-[26px] font-bold text-[#00B26A] mb-2">Rp{amount}</span>
                    <p className="text-xs text-gray-500 mb-8 text-center max-w-xs">
                      {withdrawDestination === 'project2' 
                        ? 'Saldo berhasil dipindahkan ke Project 2 untuk UID akun ini.' 
                        : 'Permintaan penarikan ke rekening bank Anda telah dicatat.'}
                    </p>
                    
                    <div className="w-full pb-4">
                      <button 
                        onClick={handleSelesai}
                        className="w-full py-3.5 rounded-lg text-[14px] font-bold transition-colors bg-[#00B26A] text-white hover:bg-[#00995c]"
                      >
                        Selesai
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

