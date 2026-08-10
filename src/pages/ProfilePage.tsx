import React, { useState } from 'react';
import { 
  ChevronLeft, ArrowUpCircle, ArrowDownCircle, History, Copy, 
  User, Landmark, FileText, Fingerprint, Lock, Smartphone, 
  Link as LinkIcon, Snowflake, FileBadge, ArrowRightLeft, Mail, 
  Users, UserPlus, Wallet, Key, Moon, Bell, Globe, ShieldCheck, 
  Headphones, Stethoscope, Trash2, HelpCircle, Star, FileSignature, 
  RefreshCw, LogOut, ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { WithdrawPage } from './WithdrawPage';

type ProfilePageProps = {
  onClose: () => void;
};

export function ProfilePage({ onClose }: ProfilePageProps) {
  const { user } = useAuth();
  const [showWithdraw, setShowWithdraw] = useState(false);
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      onClose(); // Close the profile page, App will unmount Main pages and show WelcomePage
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

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
          <div className="h-[64px] w-[64px] overflow-hidden rounded-full bg-blue-100 mb-3 shadow-sm border border-gray-100">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Garuda" alt="Avatar" className="h-full w-full object-cover" />
          </div>
          <h2 className="text-[15px] font-bold text-secondary mb-0.5">{user?.email || 'DewanggaTreders'}</h2>
          <button className="text-[11px] text-primary font-medium hover:underline">Lihat Profil</button>
        </div>

        {/* Balance Info */}
        <div className="grid grid-cols-2 px-8 mb-6">
          <div className="text-center">
            <p className="text-[10px] text-gray-400 mb-0.5">Total Trading Balance</p>
            <p className="text-[12px] font-bold text-secondary">Rp0</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-400 mb-0.5">Total Equity</p>
            <p className="text-[12px] font-bold text-secondary">Rp0</p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="px-4 mb-4">
          <div className="rounded-xl border border-gray-100 shadow-sm overflow-hidden bg-white">
            <div className="grid grid-cols-3 border-b border-gray-100">
              <button className="flex flex-col items-center justify-center py-4 hover:bg-gray-50">
                <ArrowUpCircle className="h-6 w-6 text-primary mb-1.5" strokeWidth={1.5} />
                <span className="text-[11px] font-bold text-secondary">Deposit</span>
              </button>
              <button onClick={() => setShowWithdraw(true)} className="flex flex-col items-center justify-center py-4 hover:bg-gray-50 border-x border-gray-100">
                <ArrowDownCircle className="h-6 w-6 text-primary mb-1.5" strokeWidth={1.5} />
                <span className="text-[11px] font-bold text-secondary">Withdraw</span>
              </button>
              <button className="flex flex-col items-center justify-center py-4 hover:bg-gray-50">
                <History className="h-6 w-6 text-primary mb-1.5" strokeWidth={1.5} />
                <span className="text-[11px] font-bold text-secondary">Riwayat</span>
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-400 text-white text-lg font-bold">
                  J
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 leading-tight">RDN</p>
                  <p className="text-[11px] text-secondary leading-tight">Dewangga</p>
                  <p className="text-[12px] font-bold text-secondary leading-tight">110245815557</p>
                </div>
              </div>
              <button className="p-2 text-primary hover:bg-green-50 rounded-full">
                <Copy className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

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
          <MenuItem icon={Landmark} title="Rekening Bank" />
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
          <MenuItem icon={RefreshCw} title="Pindah ke Virtual" />
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
