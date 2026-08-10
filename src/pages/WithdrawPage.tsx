import React, { useState } from 'react';
import { ChevronLeft, History, Headphones, ChevronRight, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { ref, get, set, serverTimestamp, runTransaction, push } from 'firebase/database';

type WithdrawPageProps = {
  onBack: () => void;
};

export function WithdrawPage({ onBack }: WithdrawPageProps) {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [withdrawAll, setWithdrawAll] = useState(false);
  const [step, setStep] = useState<'input' | 'confirm' | 'process'>('input');
  const [withdrawableBalance, setWithdrawableBalance] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      const balanceRef = ref(db, `users/${user.uid}/balance`);
      get(balanceRef).then((snapshot) => {
        if (snapshot.exists()) {
          setWithdrawableBalance(snapshot.val());
        } else {
          const initialBalance = 10000000;
          set(balanceRef, initialBalance);
          setWithdrawableBalance(initialBalance);
        }
      }).catch(console.error);
    }
  }, [user]);
  
  const handleToggle = () => {
    setWithdrawAll(!withdrawAll);
    if (!withdrawAll) {
      setAmount(withdrawableBalance.toLocaleString('en-US'));
    } else {
      setAmount('');
    }
  };

  const handleLanjut = () => {
    const numericAmount = parseInt(amount.replace(/,/g, ''));
    if (amount && numericAmount >= 10000 && numericAmount <= withdrawableBalance) {
      setStep('confirm');
      setErrorMsg(null);
    } else if (numericAmount > withdrawableBalance) {
      setErrorMsg('Saldo tidak mencukupi');
    }
  };

  const handleWithdraw = async () => {
    if (!user || isProcessing) return;
    const numericAmount = parseInt(amount.replace(/,/g, ''));
    if (numericAmount > withdrawableBalance || numericAmount < 10000) return;
    
    setIsProcessing(true);
    setErrorMsg(null);
    
    try {
      const userBalanceRef = ref(db, `users/${user.uid}/balance`);
      
      const transactionResult = await runTransaction(userBalanceRef, (currentBalance) => {
        if (currentBalance === null) return currentBalance;
        if (currentBalance >= numericAmount) {
          return currentBalance - numericAmount;
        } else {
          return undefined; 
        }
      });

      if (transactionResult.committed) {
        const transactionsRef = ref(db, 'transactions');
        const newTxRef = push(transactionsRef);
        await set(newTxRef, {
          userId: user.uid,
          transactionId: newTxRef.key,
          type: "withdraw",
          source: "garuda_inves",
          destination: "jago",
          amount: numericAmount,
          status: "completed",
          createdAt: serverTimestamp()
        });
        
        setWithdrawableBalance(transactionResult.snapshot.val());
        setStep('process');
      } else {
        setErrorMsg('Penarikan gagal, saldo tidak mencukupi.');
        setStep('input');
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('Terjadi kesalahan jaringan.');
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
        <div className="flex flex-col items-center pt-6 pb-8">
          <span className="text-[13px] font-bold text-gray-900 mb-1.5">Saldo yang Dapat Ditarik</span>
          <span className="text-[11px] text-gray-400 mb-2">07 August 2026</span>
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
        <div className="px-4 flex justify-end items-center mb-8">
          <span className="text-[13px] text-gray-500 mr-3">Tarik Semua Saldo</span>
          <button 
            onClick={handleToggle}
            className={`w-[42px] h-6 rounded-full relative transition-colors duration-200 ease-in-out ${withdrawAll ? 'bg-[#00B26A]' : 'bg-gray-300'}`}
          >
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out ${withdrawAll ? 'transform translate-x-[18px]' : ''}`} />
          </button>
        </div>

        {/* Transfer Destination */}
        <div className="px-4 mb-6">
          <label className="block text-[13px] font-bold text-gray-900 mb-2">
            Transfer ke
          </label>
          <div className="border border-gray-200 rounded-lg p-4 flex items-center gap-4 bg-white">
            <div className="w-12 h-12 bg-[#f6891f] rounded-full flex items-center justify-center shrink-0">
               <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
                 <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" fill="#f6891f" />
                 <path d="M15.5 8.5v3c0 2-1.5 3.5-3.5 3.5s-3.5-1.5-3.5-3.5v-1h2v1c0 1 .5 1.5 1.5 1.5s1.5-.5 1.5-1.5v-3h2z" fill="white" />
                 <circle cx="15.5" cy="6" r="1.5" fill="white" />
                 <path d="M7.5 15.5c1 1.5 2.5 2.5 4.5 2.5s3.5-1 4.5-2.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
               </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] text-gray-500 mb-0.5">JAGO</span>
              <span className="text-[14px] font-bold text-gray-900 mb-0.5 tracking-tight">103653847791</span>
              <span className="text-[11px] text-gray-400 uppercase">DEWANGGA</span>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="px-4 mb-8">
          <div className="bg-[#f0f4ff] rounded-lg p-3.5 flex items-start gap-3">
            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" strokeWidth={2.5} />
            <p className="text-[11px] text-gray-700 leading-relaxed pr-2">
              Dana dari penjualan saham akan masuk ke <span className="font-bold text-gray-900">Saldo yang Dapat Ditarik</span> maksimal dalam 3 hari kerja.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Button */}
      <div className="p-4 border-t border-gray-100 bg-white sticky bottom-0">
        <button 
          onClick={handleLanjut}
          className={`w-full py-3.5 rounded-lg text-[13px] font-bold transition-colors ${
            amount && parseInt(amount.replace(/,/g, '')) >= 10000 
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
                      <span className="text-[12px] font-medium text-gray-600 mb-2">Nominal Penarikan</span>
                      <span className="text-[26px] font-bold text-[#00B26A]">Rp{amount}</span>
                    </div>

                    {/* Transfer ke */}
                    <div className="mb-6">
                      <label className="block text-[13px] font-bold text-gray-900 mb-3">
                        Transfer ke
                      </label>
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
                          <span className="text-[12px] text-gray-500 mb-0.5">JAGO</span>
                          <span className="text-[14px] font-bold text-gray-900 mb-0.5 tracking-tight">103653847791</span>
                          <span className="text-[11px] text-gray-400 uppercase">DEWANGGA</span>
                        </div>
                      </div>
                    </div>

                    {/* Detail Penarikan */}
                    <div className="mb-6">
                      <label className="block text-[13px] font-bold text-gray-900 mb-3">
                        Detail Penarikan
                      </label>
                      <div className="border border-gray-100 rounded-lg bg-white shadow-sm overflow-hidden text-[13px]">
                        <div className="flex justify-between p-3.5 border-b border-gray-50">
                          <span className="text-gray-600">Nominal Penarikan</span>
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
                          Dana akan ditransfer maksimal dalam <span className="font-bold text-gray-900">2 hari kerja.</span>
                        </p>
                      </div>
                    </div>

                    <div className="pb-4">
                      <button 
                        onClick={handleWithdraw}
                        className="w-full py-3.5 rounded-lg text-[14px] font-bold transition-colors bg-[#00B26A] text-white hover:bg-[#00995c]"
                      >
                        Withdraw
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
                      {/* Spinner */}
                      <div className="absolute bottom-1 right-1 w-10 h-10">
                         <svg viewBox="0 0 24 24" className="w-full h-full text-[#00B26A] animate-spin" style={{ animationDuration: '2s' }}>
                           <circle cx="12" cy="3" r="2" fill="currentColor" opacity="1" />
                           <circle cx="18.36" cy="5.64" r="2" fill="currentColor" opacity="0.8" />
                           <circle cx="21" cy="12" r="2" fill="currentColor" opacity="0.6" />
                           <circle cx="18.36" cy="18.36" r="2" fill="currentColor" opacity="0.4" />
                           <circle cx="12" cy="21" r="2" fill="currentColor" opacity="0.2" />
                           <circle cx="5.64" cy="18.36" r="2" fill="currentColor" opacity="0.1" />
                           <circle cx="3" cy="12" r="2" fill="currentColor" opacity="0.1" />
                           <circle cx="5.64" cy="5.64" r="2" fill="currentColor" opacity="0.2" />
                         </svg>
                      </div>
                    </div>
                    <span className="text-[13px] font-medium text-gray-700 mb-1.5">Penarikan akan Diproses</span>
                    <span className="text-[26px] font-bold text-[#00B26A] mb-12">Rp{amount}</span>
                    
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
