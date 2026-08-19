import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, History, Headphones, Copy, Check, Info, ChevronRight, 
  X, QrCode, CheckCircle2, AlertCircle, Clock, Landmark, ArrowRight, 
  HelpCircle, MessageSquare, PhoneCall, ShieldCheck, Sparkles, ExternalLink
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { ref, onValue, set, push, serverTimestamp } from 'firebase/database';
import { QRCodeSVG } from 'qrcode.react';
import { creditDepositToUser } from '../lib/depositManager';
import { 
  LOGO_JAGO, LOGO_BCA, LOGO_BRI, LOGO_BNI, LOGO_MANDIRI, 
  LOGO_GOPAY, LOGO_SHOPEEPAY, LOGO_QRIS, LOGO_BANK_LAIN 
} from '../lib/depositLogos';

interface DepositPageProps {
  onBack: () => void;
  onSuccess?: () => void;
}

export function DepositPage({ onBack, onSuccess }: DepositPageProps) {
  const { user } = useAuth();
  const activeUid = user ? user.uid : (localStorage.getItem('pstock_active_uid') || 'demo_user');
  
  // User profile & RDN info
  const displayName = user?.displayName || (user?.email ? user.email.split('@')[0].toUpperCase() : 'DEWANGGA');
  const uppercaseName = displayName.toUpperCase();
  
  // Generate consistent 12-digit RDN number
  const rdnNumber = React.useMemo(() => {
    let hash = 0;
    const str = `RDN_JAGO_${activeUid}`;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const num = Math.abs(hash) % 900000000000 + 100000000000;
    return num.toString();
  }, [activeUid]);

  const [copiedRdn, setCopiedRdn] = useState(false);
  const [balance, setBalance] = useState<number>(0);

  // Active sub-modals & drawers
  const [activeModal, setActiveModal] = useState<
    'none' | 'qris' | 'jago_sim' | 'bank_guide' | 'wallet_guide' | 'rdn_info' | 'history' | 'help'
  >('none');
  
  const [selectedBank, setSelectedBank] = useState<{
    id: string;
    name: string;
    logo: string;
    code: string;
    fee: string;
  } | null>(null);

  const [selectedWallet, setSelectedWallet] = useState<{
    id: string;
    name: string;
    logo: string;
    fee: string;
  } | null>(null);

  // Bank guide tab: 'mbanking' | 'ibanking' | 'atm'
  const [guideTab, setGuideTab] = useState<'mbanking' | 'ibanking' | 'atm'>('mbanking');

  // QRIS Payment state
  const [qrisAmount, setQrisAmount] = useState<number>(100000);
  const [qrisCustomInput, setQrisCustomInput] = useState<string>('');
  const [qrisTx, setQrisTx] = useState<{
    txId: string;
    amount: number;
    createdAt: number;
    status: 'pending' | 'completed';
  } | null>(null);

  // Bank Jago Simulation state
  const [jagoAmount, setJagoAmount] = useState<number>(500000);
  const [jagoBalance, setJagoBalance] = useState<number>(15000000);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Transaction history
  const [txList, setTxList] = useState<any[]>([]);

  // Listen to user balance & transaction history from Firebase
  useEffect(() => {
    if (!activeUid) return;
    const balRef = ref(db, `users/${activeUid}/balance`);
    const unsubBal = onValue(balRef, (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        setBalance(typeof val === 'number' ? val : Number(val) || 0);
      }
    });

    const txRef = ref(db, `users/${activeUid}/transactions`);
    const unsubTx = onValue(txRef, (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        const list = Object.entries(data).map(([k, v]: [string, any]) => ({
          ...v,
          id: v?.transactionId || k
        }));
        list.sort((a, b) => (b.createdAt || b.timestamp || 0) - (a.createdAt || a.timestamp || 0));
        setTxList(list);
      } else {
        setTxList([]);
      }
    });

    return () => {
      unsubBal();
      unsubTx();
    };
  }, [activeUid]);

  // Real-time listener for incoming QRIS deposit settlement
  useEffect(() => {
    if (!qrisTx?.txId || qrisTx.status === 'completed') return;

    const qrisRef = ref(db, `depositTransactions/${qrisTx.txId}`);
    const unsub = onValue(qrisRef, async (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        if (data.status === 'completed' || data.status === 'sukses' || data.status === 'success') {
          const amt = Number(data.amount) || qrisTx.amount;
          if (!data.credited) {
            await creditDepositToUser(activeUid, qrisTx.txId, amt, {
              description: `Deposit QRIS Projek 2 - Rp ${amt.toLocaleString('id-ID')}`,
              source: 'QRIS National Standard'
            });
          }
          setQrisTx(prev => prev ? { ...prev, status: 'completed' } : null);
        }
      }
    });

    return () => unsub();
  }, [qrisTx?.txId, qrisTx?.status, activeUid]);

  const handleCopyRdn = () => {
    navigator.clipboard.writeText(rdnNumber);
    setCopiedRdn(true);
    setTimeout(() => setCopiedRdn(false), 2000);
  };

  // Generate new QRIS Transaction
  const handleOpenQRIS = async (presetAmount?: number) => {
    const amt = presetAmount || (qrisCustomInput ? Number(qrisCustomInput) : qrisAmount) || 100000;
    const randomSuffix = Math.floor(Math.random() * 900) + 100;
    const uniqueTxId = `QRIS-${Date.now()}-${randomSuffix}`;

    const newTx = {
      txId: uniqueTxId,
      amount: amt,
      createdAt: Date.now(),
      status: 'pending' as const
    };

    try {
      await set(ref(db, `depositTransactions/${uniqueTxId}`), {
        transactionId: uniqueTxId,
        receiverUid: activeUid,
        amount: amt,
        type: 'deposit',
        source: 'QRIS_PROJEK_2',
        status: 'pending',
        createdAt: Date.now()
      });
    } catch (e) {
      console.warn('Failed to record pending QRIS tx:', e);
    }

    setQrisTx(newTx);
    setActiveModal('qris');
  };

  // Simulate Instant QRIS Payment Success
  const handleSimulateQRISPayment = async () => {
    if (!qrisTx || isProcessing) return;
    setIsProcessing(true);

    try {
      const credited = await creditDepositToUser(
        activeUid,
        qrisTx.txId,
        qrisTx.amount,
        {
          description: `Deposit QRIS Projek 2 - Rp ${qrisTx.amount.toLocaleString('id-ID')}`,
          source: 'QRIS National Standard'
        }
      );

      if (credited) {
        setQrisTx(prev => prev ? { ...prev, status: 'completed' } : null);
        setSuccessMessage(`Deposit QRIS sebesar Rp ${qrisTx.amount.toLocaleString('id-ID')} berhasil masuk ke Saldo RDN!`);
      }
    } catch (err) {
      console.error('Failed to credit QRIS deposit:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Simulate Bank Jago / Transfer Instant Success
  const handleSimulateTransferSuccess = async (bankName: string, amount: number) => {
    if (isProcessing) return;
    setIsProcessing(true);

    const txId = `DEP-${bankName.toUpperCase()}-${Date.now()}`;
    try {
      const credited = await creditDepositToUser(
        activeUid,
        txId,
        amount,
        {
          description: `Deposit RDN via ${bankName} - Rp ${amount.toLocaleString('id-ID')}`,
          source: bankName
        }
      );

      if (credited) {
        setSuccessMessage(`Deposit via ${bankName} sebesar Rp ${amount.toLocaleString('id-ID')} berhasil masuk!`);
        setTimeout(() => {
          setActiveModal('none');
          setSuccessMessage(null);
        }, 1800);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#F8FAFC] select-none relative overflow-hidden font-sans">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="flex h-14 shrink-0 items-center justify-between px-4 bg-white border-b border-gray-100 sticky top-0 z-30">
        <button 
          onClick={onBack} 
          className="p-1 -ml-1 text-gray-700 hover:text-black active:scale-95 transition-transform cursor-pointer"
          title="Kembali"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={2} />
        </button>

        <h1 className="text-base font-bold text-gray-900 tracking-tight">
          Deposit
        </h1>

        <div className="flex items-center gap-1.5 -mr-1">
          <button 
            onClick={() => setActiveModal('history')} 
            className="p-2 text-gray-600 hover:text-gray-900 active:scale-95 transition-transform rounded-full hover:bg-gray-100 cursor-pointer"
            title="Riwayat Deposit"
          >
            <History className="h-5 w-5" strokeWidth={1.8} />
          </button>
          <button 
            onClick={() => setActiveModal('help')} 
            className="p-2 text-gray-600 hover:text-gray-900 active:scale-95 transition-transform rounded-full hover:bg-gray-100 cursor-pointer"
            title="Bantuan & CS"
          >
            <Headphones className="h-5 w-5" strokeWidth={1.8} />
          </button>
        </div>
      </header>

      {/* MAIN SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-16">
        
        {/* ======================================================== */}
        {/* SECTION 1: RDN DETAILS                                    */}
        {/* ======================================================== */}
        <div className="p-4 bg-white border-b border-gray-100">
          <h2 className="text-[13px] font-bold text-gray-900 tracking-tight mb-2.5">
            RDN Details
          </h2>

          {/* RDN Card */}
          <div className="p-4 rounded-2xl border border-gray-100/90 bg-white shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Bank Jago Logo */}
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 shadow-2xs">
                <img src={LOGO_JAGO} alt="Bank Jago" className="w-full h-full object-cover" />
              </div>

              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-gray-900 leading-snug tracking-tight">
                  {uppercaseName}
                </span>
                <span className="text-[14px] font-extrabold text-gray-900 font-mono tracking-wide mt-0.5">
                  {rdnNumber}
                </span>
              </div>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopyRdn}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center gap-1 cursor-pointer",
                copiedRdn 
                  ? "bg-emerald-100 text-emerald-700" 
                  : "bg-emerald-50/80 hover:bg-emerald-100/80 text-[#00AA5B]"
              )}
            >
              {copiedRdn ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Tersalin</span>
                </>
              ) : (
                <span>Copy</span>
              )}
            </button>
          </div>

          {/* Keterangan Deposit RDN Link */}
          <div 
            onClick={() => setActiveModal('rdn_info')}
            className="mt-2.5 p-3.5 rounded-xl border border-gray-100 bg-white hover:bg-gray-50/80 active:bg-gray-100 transition-colors flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2.5 text-gray-700">
              <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 shrink-0">
                <Info className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span className="text-xs font-bold text-gray-800">Keterangan Deposit RDN</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECTION 2: BANK TRANSFER                                 */}
        {/* ======================================================== */}
        <div className="mt-3 p-4 bg-white border-y border-gray-100">
          <div>
            <h2 className="text-[14px] font-bold text-gray-900 tracking-tight">
              Bank Transfer
            </h2>
            <p className="text-[12px] text-gray-400 font-medium mt-0.5">
              Transfer dari berbagai macam bank di Indonesia
            </p>
          </div>

          {/* Bank List */}
          <div className="divide-y divide-gray-100 mt-2">
            {/* 1. BCA */}
            <BankItem
              logo={LOGO_BCA}
              name="BCA"
              feeText="Berlaku biaya transfer"
              onClick={() => {
                setSelectedBank({ id: 'bca', name: 'BCA', logo: LOGO_BCA, code: '014', fee: 'Berlaku biaya transfer (Rp 2.500 BI-FAST / Rp 6.500 Realtime)' });
                setActiveModal('bank_guide');
              }}
            />

            {/* 2. Jago */}
            <BankItem
              logo={LOGO_JAGO}
              name="Jago"
              feeText="Gratis biaya transfer"
              isFreeFee={true}
              onClick={() => {
                setSelectedBank({ id: 'jago', name: 'Bank Jago', logo: LOGO_JAGO, code: '542', fee: 'Gratis 100%' });
                setActiveModal('jago_sim');
              }}
            />

            {/* 3. BRI */}
            <BankItem
              logo={LOGO_BRI}
              name="BRI"
              feeText="Berlaku biaya transfer"
              onClick={() => {
                setSelectedBank({ id: 'bri', name: 'BRI', logo: LOGO_BRI, code: '002', fee: 'Berlaku biaya transfer' });
                setActiveModal('bank_guide');
              }}
            />

            {/* 4. BNI */}
            <BankItem
              logo={LOGO_BNI}
              name="BNI"
              feeText="Berlaku biaya transfer"
              onClick={() => {
                setSelectedBank({ id: 'bni', name: 'BNI', logo: LOGO_BNI, code: '009', fee: 'Berlaku biaya transfer' });
                setActiveModal('bank_guide');
              }}
            />

            {/* 5. Mandiri */}
            <BankItem
              logo={LOGO_MANDIRI}
              name="Mandiri"
              feeText="Berlaku biaya transfer"
              onClick={() => {
                setSelectedBank({ id: 'mandiri', name: 'Mandiri', logo: LOGO_MANDIRI, code: '008', fee: 'Berlaku biaya transfer' });
                setActiveModal('bank_guide');
              }}
            />

            {/* 6. Transfer dari Bank Lain */}
            <BankItem
              logo={LOGO_BANK_LAIN}
              name="Transfer dari Bank Lain"
              feeText="Berlaku biaya transfer"
              onClick={() => {
                setSelectedBank({ id: 'other', name: 'Bank Lainnya', logo: LOGO_BANK_LAIN, code: '542', fee: 'Berlaku biaya transfer antar bank' });
                setActiveModal('bank_guide');
              }}
            />
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECTION 3: DIGITAL WALLET & QRIS (REPLACES OVO)          */}
        {/* ======================================================== */}
        <div className="mt-3 p-4 bg-white border-y border-gray-100">
          <div>
            <h2 className="text-[14px] font-bold text-gray-900 tracking-tight">
              Digital Wallet
            </h2>
            <p className="text-[12px] text-gray-400 font-medium mt-0.5">
              Transfer dari berbagai digital wallet dengan mudah
            </p>
          </div>

          <div className="divide-y divide-gray-100 mt-2">
            {/* 1. GoPay */}
            <BankItem
              logo={LOGO_GOPAY}
              name="GoPay"
              feeText="Berlaku biaya transfer"
              onClick={() => {
                setSelectedWallet({ id: 'gopay', name: 'GoPay', logo: LOGO_GOPAY, fee: 'Rp 2.500 via Transfer Bank Jago' });
                setActiveModal('wallet_guide');
              }}
            />

            {/* 2. ShopeePay */}
            <BankItem
              logo={LOGO_SHOPEEPAY}
              name="ShopeePay"
              feeText="Berlaku biaya transfer"
              onClick={() => {
                setSelectedWallet({ id: 'shopeepay', name: 'ShopeePay', logo: LOGO_SHOPEEPAY, fee: 'Rp 2.500 via Transfer Bank' });
                setActiveModal('wallet_guide');
              }}
            />

            {/* 3. QRIS (REPLACES OVO FOR PROJEK 2 AS REQUESTED) */}
            <div
              onClick={() => handleOpenQRIS(100000)}
              className="py-3.5 flex items-center justify-between hover:bg-emerald-50/40 active:bg-emerald-50 rounded-xl px-1.5 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-white border border-red-100 p-0.5 shadow-2xs group-hover:scale-105 transition-transform">
                  <img src={LOGO_QRIS} alt="QRIS" className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[14px] font-bold text-gray-900 group-hover:text-[#00AA5B] transition-colors">
                      QRIS
                    </span>
                    <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded font-mono uppercase tracking-wider">
                      Projek 2
                    </span>
                    <span className="bg-emerald-50 text-[#00AA5B] text-[9px] font-bold px-1.5 py-0.2 rounded border border-emerald-200/60">
                      Instan
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Scan dari BCA, Mandiri, BRI, GoPay, OVO, Dana, dll
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#00AA5B] group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        </div>

        {/* Security & Regulatory Notice Footer */}
        <div className="p-6 text-center text-gray-400 space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Terdaftar &amp; Diawasi OJK dan Bank Indonesia</span>
          </div>
          <p className="text-[10px] text-gray-400 max-w-xs mx-auto">
            Seluruh transaksi deposit diproses secara real-time ke Rekening Dana Nasabah (RDN) resmi berlisensi.
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: QRIS PAYMENT (PROJEK 2)                         */}
      {/* ======================================================== */}
      {activeModal === 'qris' && qrisTx && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-red-50 to-white">
              <div className="flex items-center gap-2">
                <img src={LOGO_QRIS} alt="QRIS" className="w-7 h-7 object-contain" />
                <div>
                  <h3 className="text-sm font-bold text-gray-900">QRIS Pembayaran</h3>
                  <p className="text-[10px] text-red-600 font-semibold">Standar Nasional Bank Indonesia</p>
                </div>
              </div>
              <button 
                onClick={() => { setActiveModal('none'); setSuccessMessage(null); }}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto no-scrollbar space-y-4">
              {qrisTx.status === 'completed' ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-[#00AA5B] rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-gray-900">Pembayaran Berhasil!</h4>
                    <p className="text-xs text-gray-500 mt-1">Saldo RDN kamu telah bertambah</p>
                    <p className="text-xl font-extrabold text-[#00AA5B] mt-2">
                      +Rp {qrisTx.amount.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl text-left text-xs text-gray-600 space-y-1 font-mono">
                    <div className="flex justify-between"><span>No. Referensi:</span><span className="font-bold text-gray-900">{qrisTx.txId}</span></div>
                    <div className="flex justify-between"><span>Tujuan:</span><span className="font-bold text-gray-900">RDN BANK JAGO</span></div>
                    <div className="flex justify-between"><span>Status:</span><span className="font-bold text-emerald-600">BERHASIL / LUNAS</span></div>
                  </div>
                  <button
                    onClick={() => { setActiveModal('none'); setSuccessMessage(null); if (onSuccess) onSuccess(); }}
                    className="w-full py-3.5 bg-[#00AA5B] hover:bg-[#00924E] text-white font-extrabold rounded-2xl shadow-md transition-colors"
                  >
                    Selesai &amp; Cek Saldo
                  </button>
                </div>
              ) : (
                <>
                  {/* QRIS Code Canvas Card */}
                  <div className="p-4 bg-white border-2 border-red-100 rounded-2xl shadow-inner text-center">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <img src={LOGO_QRIS} alt="QRIS" className="w-5 h-5 object-contain" />
                        <span className="text-[11px] font-black tracking-wider text-gray-800">QRIS STANDAR</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">NMID: ID102026884129</span>
                    </div>

                    <div className="inline-block p-2 bg-white rounded-xl shadow-xs border border-gray-100">
                      <QRCodeSVG
                        value={`00020101021226590014ID.LINKAJA.WWW01189360091800000000000215${qrisTx.txId}520458125303360540${qrisTx.amount}5802ID5913DEWANGGA_RDN6007JAKARTA6304`}
                        size={190}
                        level="M"
                        includeMargin={true}
                      />
                    </div>

                    <p className="text-[11px] font-bold text-gray-700 mt-2">
                      {uppercaseName} - RDN BANK JAGO
                    </p>
                    <p className="text-lg font-black text-red-600 font-mono mt-0.5">
                      Rp {qrisTx.amount.toLocaleString('id-ID')}
                    </p>
                  </div>

                  {/* Preset Nominal Buttons */}
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1.5">Pilih Nominal Lain:</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[50000, 100000, 250000, 500000, 1000000, 2500000].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => setQrisTx(prev => prev ? { ...prev, amount: amt } : null)}
                          className={cn(
                            "py-2 px-1 rounded-xl text-[11px] font-bold border transition-all active:scale-95",
                            qrisTx.amount === amt 
                              ? "bg-red-500 text-white border-red-500 shadow-xs" 
                              : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                          )}
                        >
                          Rp {(amt / 1000).toLocaleString('id-ID')}K
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status & Petunjuk Pembayaran */}
                  <div className="p-3 bg-red-50/70 border border-red-100 rounded-2xl space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-red-700 font-bold">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                      </span>
                      <span>Menunggu Pembayaran Masuk</span>
                    </div>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      Buka aplikasi perbankan (BCA, Mandiri, BRI, BNI, Jago) atau e-wallet (GoPay, OVO, DANA, ShopeePay) pilihanmu, lalu scan kode QR di atas. Saldo RDN akan otomatis bertambah setelah transfer berhasil.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-1">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(qrisTx.amount.toString());
                        alert(`Nominal Rp ${qrisTx.amount.toLocaleString('id-ID')} berhasil disalin!`);
                      }}
                      className="w-full py-3 bg-gray-900 hover:bg-black text-white font-extrabold rounded-2xl shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-xs"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Salin Nominal Rp {qrisTx.amount.toLocaleString('id-ID')}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: BANK JAGO DIRECT SIMULATOR                      */}
      {/* ======================================================== */}
      {activeModal === 'jago_sim' && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-orange-100 bg-[#FFF5E6]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 shadow-2xs">
                  <img src={LOGO_JAGO} alt="Bank Jago" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Transfer via Bank Jago</h3>
                  <p className="text-[10px] text-orange-700 font-semibold">Gratis Biaya Admin 100%</p>
                </div>
              </div>
              <button 
                onClick={() => { setActiveModal('none'); setSuccessMessage(null); }}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-orange-200/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-[11px] font-medium">Rekening RDN Tujuan</p>
                  <p className="text-sm font-extrabold text-gray-900 font-mono mt-0.5">{rdnNumber}</p>
                  <p className="text-[11px] text-gray-600 font-bold">{uppercaseName}</p>
                </div>
                <button
                  onClick={handleCopyRdn}
                  className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-emerald-600 hover:bg-gray-50"
                >
                  {copiedRdn ? 'Tersalin' : 'Salin'}
                </button>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Nominal Deposit:</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-gray-400 font-bold text-sm">Rp</span>
                  <input
                    type="number"
                    value={jagoAmount}
                    onChange={(e) => setJagoAmount(Math.max(10000, Number(e.target.value)))}
                    className="w-full pl-10 pr-3 py-2.5 text-base font-extrabold text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {[100000, 500000, 1000000, 2000000, 5000000, 10000000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setJagoAmount(amt)}
                    className={cn(
                      "py-1.5 rounded-lg text-[10px] font-bold border transition-colors",
                      jagoAmount === amt ? "bg-orange-500 text-white border-orange-500" : "bg-gray-50 text-gray-700 border-gray-200"
                    )}
                  >
                    Rp {(amt / 1000).toLocaleString('id-ID')}K
                  </button>
                ))}
              </div>

              {successMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  disabled={isProcessing}
                  onClick={() => handleSimulateTransferSuccess('Bank Jago', jagoAmount)}
                  className="w-full py-3.5 bg-[#FF8D00] hover:bg-[#E67E00] text-white font-extrabold rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Landmark className="w-4 h-4" />
                  <span>{isProcessing ? 'Memproses Transfer...' : `Transfer Rp ${jagoAmount.toLocaleString('id-ID')} Sekarang`}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: BANK TRANSFER GUIDE (BCA, BRI, BNI, Mandiri)     */}
      {/* ======================================================== */}
      {activeModal === 'bank_guide' && selectedBank && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 shadow-2xs">
                  <img src={selectedBank.logo} alt={selectedBank.name} className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Transfer via {selectedBank.name}</h3>
                  <p className="text-[10px] text-gray-400 font-medium">Petunjuk Pengiriman ke RDN</p>
                </div>
              </div>
              <button 
                onClick={() => { setActiveModal('none'); setSuccessMessage(null); }}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto no-scrollbar space-y-4 text-xs">
              {/* Destination Card */}
              <div className="p-3.5 bg-gray-50/80 rounded-2xl border border-gray-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-[11px]">Bank Tujuan:</span>
                  <span className="font-bold text-gray-900">BANK JAGO (Kode: 542)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-[11px]">Nama Rekening:</span>
                  <span className="font-bold text-gray-900">{uppercaseName}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-gray-200/60">
                  <div>
                    <span className="text-gray-400 text-[11px] block">No. Rekening RDN:</span>
                    <span className="text-sm font-black text-gray-900 font-mono">{rdnNumber}</span>
                  </div>
                  <button
                    onClick={handleCopyRdn}
                    className="px-3 py-1.5 bg-emerald-50 text-[#00AA5B] rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors"
                  >
                    {copiedRdn ? 'Tersalin' : 'Salin No. Rek'}
                  </button>
                </div>
              </div>

              {/* Transfer Steps Tabs */}
              <div className="flex border-b border-gray-100">
                {(['mbanking', 'ibanking', 'atm'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setGuideTab(tab)}
                    className={cn(
                      "flex-1 py-2 text-center text-xs font-bold transition-colors border-b-2",
                      guideTab === tab 
                        ? "border-[#00B26A] text-[#00B26A]" 
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    )}
                  >
                    {tab === 'mbanking' ? 'm-Banking' : tab === 'ibanking' ? 'Internet' : 'ATM'}
                  </button>
                ))}
              </div>

              {/* Step list */}
              <ol className="list-decimal pl-4 space-y-2 text-gray-600 text-[11.5px] leading-relaxed">
                <li>Buka aplikasi <strong>{selectedBank.name}</strong> dan lakukan login.</li>
                <li>Pilih menu <strong>Transfer</strong> &gt; <strong>Transfer Antar Bank</strong> (atau BI-FAST).</li>
                <li>Pilih Bank Tujuan: <strong>Bank Jago (542)</strong>.</li>
                <li>Masukkan Nomor Rekening RDN kamu: <strong className="font-mono">{rdnNumber}</strong>.</li>
                <li>Masukkan nominal transfer yang diinginkan.</li>
                <li>Pastikan nama penerima tertera <strong>{uppercaseName}</strong>.</li>
                <li>Konfirmasi transaksi dan masukkan PIN {selectedBank.name} kamu.</li>
              </ol>

              {successMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Quick Simulation Button */}
              <button
                disabled={isProcessing}
                onClick={() => handleSimulateTransferSuccess(selectedBank.name, 1000000)}
                className="w-full py-3 bg-[#00AA5B] hover:bg-[#00924E] text-white font-extrabold rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{isProcessing ? 'Memverifikasi...' : `Simulasikan Transfer Berhasil (Rp 1.000.000)`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: DIGITAL WALLET GUIDE (GoPay, ShopeePay)          */}
      {/* ======================================================== */}
      {activeModal === 'wallet_guide' && selectedWallet && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 shadow-2xs">
                  <img src={selectedWallet.logo} alt={selectedWallet.name} className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Transfer via {selectedWallet.name}</h3>
                  <p className="text-[10px] text-gray-400 font-medium">Kirim Saldo ke RDN Bank Jago</p>
                </div>
              </div>
              <button 
                onClick={() => { setActiveModal('none'); setSuccessMessage(null); }}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-[11px]">Bank Penerima:</span>
                  <span className="font-bold text-gray-900">Bank Jago (542)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-[11px]">No. RDN:</span>
                  <span className="font-mono font-bold text-gray-900">{rdnNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-[11px]">Nama Akun:</span>
                  <span className="font-bold text-gray-900">{uppercaseName}</span>
                </div>
              </div>

              <ol className="list-decimal pl-4 space-y-2 text-gray-600 text-[11.5px] leading-relaxed">
                <li>Buka aplikasi <strong>{selectedWallet.name}</strong>.</li>
                <li>Pilih menu <strong>Transfer / Kirim ke Rekening Bank</strong>.</li>
                <li>Pilih Bank Tujuan: <strong>Bank Jago</strong>.</li>
                <li>Ketik Nomor RDN: <strong>{rdnNumber}</strong>.</li>
                <li>Masukkan nominal yang ingin didepositkan.</li>
                <li>Konfirmasi pengiriman. Saldo RDN kamu akan terisi otomatis.</li>
              </ol>

              {successMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <button
                disabled={isProcessing}
                onClick={() => handleSimulateTransferSuccess(selectedWallet.name, 250000)}
                className="w-full py-3 bg-[#00AA5B] hover:bg-[#00924E] text-white font-extrabold rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isProcessing ? 'Memproses...' : `Simulasikan Transfer ${selectedWallet.name} (Rp 250.000)`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: KETERANGAN DEPOSIT RDN                           */}
      {/* ======================================================== */}
      {activeModal === 'rdn_info' && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-[#00AA5B]" />
                <h3 className="text-sm font-bold text-gray-900">Keterangan Deposit RDN</h3>
              </div>
              <button 
                onClick={() => setActiveModal('none')}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3.5 text-xs text-gray-600 leading-relaxed">
              <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl">
                <h4 className="font-bold text-emerald-900 mb-1">Apa itu RDN?</h4>
                <p className="text-[11.5px] text-emerald-800">
                  RDN (Rekening Dana Nasabah) adalah rekening bank atas nama kamu pribadi di Bank Jago yang digunakan khusus untuk menampung dana transaksi jual beli saham.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-1">Keamanan Dana Terjamin</h4>
                <p className="text-[11.5px] text-gray-500">
                  Dana tersimpan aman di bank kustodian resmi dan dilindungi oleh Lembaga Penjamin Simpanan (LPS).
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-1">Waktu Proses</h4>
                <p className="text-[11.5px] text-gray-500">
                  Transfer via QRIS, Bank Jago, dan BI-FAST diproses secara <strong>real-time online (instan)</strong> 24 jam sehari, 7 hari seminggu.
                </p>
              </div>

              <button
                onClick={() => setActiveModal('none')}
                className="w-full py-3 bg-[#00AA5B] text-white font-bold rounded-xl mt-2"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 6: RIWAYAT TRANSAKSI / HISTORY                      */}
      {/* ======================================================== */}
      {activeModal === 'history' && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#00AA5B]" />
                <h3 className="text-sm font-bold text-gray-900">Riwayat Transaksi Deposit</h3>
              </div>
              <button 
                onClick={() => setActiveModal('none')}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2.5 flex-1 min-h-[200px]">
              {txList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400">
                  <Clock className="w-10 h-10 mb-2 stroke-1" />
                  <p className="text-xs font-medium">Belum ada riwayat deposit</p>
                </div>
              ) : (
                txList.map((tx, idx) => (
                  <div key={tx.id || idx} className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-900">{tx.description || 'Deposit RDN'}</p>
                      <p className="text-[10px] text-gray-400">{tx.createdAt ? new Date(tx.createdAt).toLocaleString('id-ID') : 'Baru saja'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-extrabold text-[#00AA5B]">+Rp {Number(tx.amount || 0).toLocaleString('id-ID')}</p>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">Sukses</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 7: BANTUAN & CS                                     */}
      {/* ======================================================== */}
      {activeModal === 'help' && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <Headphones className="w-5 h-5 text-[#00AA5B]" />
                <h3 className="text-sm font-bold text-gray-900">Pusat Bantuan Deposit</h3>
              </div>
              <button 
                onClick={() => setActiveModal('none')}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between cursor-pointer hover:bg-emerald-50">
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-[#00AA5B]" />
                  <div>
                    <p className="font-bold text-gray-900">Live Chat Support 24/7</p>
                    <p className="text-[10px] text-gray-400">Respon dalam &lt; 2 menit</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between cursor-pointer hover:bg-emerald-50">
                <div className="flex items-center gap-2.5">
                  <PhoneCall className="w-4 h-4 text-[#00AA5B]" />
                  <div>
                    <p className="font-bold text-gray-900">Call Center RDN</p>
                    <p className="text-[10px] text-gray-400">1500-123 (Bebas Pulsa)</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>

              <button
                onClick={() => setActiveModal('none')}
                className="w-full py-3 bg-[#00AA5B] text-white font-bold rounded-xl mt-2"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Bank / Wallet List Item component
function BankItem({
  logo,
  name,
  feeText,
  isFreeFee = false,
  onClick
}: {
  logo: string;
  name: string;
  feeText: string;
  isFreeFee?: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="py-3 flex items-center justify-between hover:bg-gray-50/80 active:bg-gray-100 rounded-xl px-1.5 transition-colors cursor-pointer group"
    >
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 shadow-2xs group-hover:scale-105 transition-transform bg-gray-50 flex items-center justify-center">
          <img src={logo} alt={name} className="w-full h-full object-cover" />
        </div>
        <div>
          <span className="text-[14px] font-bold text-gray-900 group-hover:text-[#00AA5B] transition-colors">
            {name}
          </span>
          <p className={cn("text-[11px] mt-0.5", isFreeFee ? "text-[#00AA5B] font-semibold" : "text-gray-400")}>
            {feeText}
          </p>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all" />
    </div>
  );
}
