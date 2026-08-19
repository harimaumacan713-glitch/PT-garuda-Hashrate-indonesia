import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  Info, 
  Building2, 
  Users, 
  Briefcase, 
  Globe, 
  FileText 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { getCompanyProfileForSymbol, CompanyProfile } from '../data/companyProfileData';

interface CompanyProfileViewProps {
  symbol: string;
  displaySymbol?: string;
  isIdr?: boolean;
}

export const CompanyProfileView: React.FC<CompanyProfileViewProps> = ({
  symbol,
  displaySymbol,
  isIdr = true
}) => {
  const sym = (displaySymbol || symbol).replace('USDT', '').toUpperCase();
  const profile: CompanyProfile = getCompanyProfileForSymbol(sym);

  const [shareholderFilter, setShareholderFilter] = useState<'> 1%' | '100%'>('> 1%');
  const [selectedMonth, setSelectedMonth] = useState<string>('Jul');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const getInitials = (name: string) => {
    if (!name || name === '-') return '-';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Filtered shareholders based on selection
  const visibleShareholders = shareholderFilter === '> 1%' 
    ? profile.shareholders.filter(s => s.percentage >= 1.0)
    : profile.shareholders;

  return (
    <div className="w-full bg-white text-gray-900 pb-28 select-none">
      {/* 1. TENTANG PERUSAHAAN */}
      <div className="p-4 pt-5 border-b border-gray-100">
        <h3 className="text-[14px] font-bold text-gray-900 mb-3">Tentang Perusahaan</h3>
        <p className="text-[12.5px] leading-relaxed text-gray-700 font-normal mb-5 text-justify">
          {profile.about}
        </p>

        {/* Company Details Key-Value Table */}
        <div className="divide-y divide-gray-100 text-[12.5px]">
          <div className="py-2.5 flex justify-between items-start gap-4">
            <span className="text-gray-500 w-1/3 shrink-0">Nama Perusahaan</span>
            <span className="text-gray-900 font-medium text-right w-2/3">{profile.companyName}</span>
          </div>

          <div className="py-2.5 flex justify-between items-start gap-4">
            <span className="text-gray-500 w-1/3 shrink-0">Sektor</span>
            <span className="text-gray-900 font-medium text-right w-2/3">{profile.sector}</span>
          </div>

          <div className="py-2.5 flex justify-between items-start gap-4">
            <span className="text-gray-500 w-1/3 shrink-0">Sub Sektor</span>
            <span className="text-gray-900 font-medium text-right w-2/3">{profile.subSector}</span>
          </div>

          <div className="py-2.5 flex justify-between items-start gap-4">
            <span className="text-gray-500 w-1/3 shrink-0">Alamat</span>
            <span className="text-gray-900 font-medium text-right w-2/3 leading-snug">{profile.address}</span>
          </div>

          <div className="py-2.5 flex justify-between items-start gap-4">
            <span className="text-gray-500 w-1/3 shrink-0">NPWP</span>
            <span className="text-gray-900 font-medium text-right w-2/3">{profile.npwp}</span>
          </div>

          {/* Telepon with Copy Button */}
          <div className="py-2.5 flex justify-between items-center gap-4">
            <span className="text-gray-500 w-1/3 shrink-0">Telepon</span>
            <div className="flex items-center justify-end gap-1.5 w-2/3">
              <span className="text-gray-900 font-medium">{profile.phone}</span>
              <button 
                onClick={() => handleCopy(profile.phone, 'phone')}
                className="text-gray-400 hover:text-gray-700 p-1 transition-colors"
                title="Salin Telepon"
              >
                {copiedField === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Fax with Copy Button */}
          <div className="py-2.5 flex justify-between items-center gap-4">
            <span className="text-gray-500 w-1/3 shrink-0">Fax</span>
            <div className="flex items-center justify-end gap-1.5 w-2/3">
              <span className="text-gray-900 font-medium">{profile.fax}</span>
              <button 
                onClick={() => handleCopy(profile.fax, 'fax')}
                className="text-gray-400 hover:text-gray-700 p-1 transition-colors"
                title="Salin Fax"
              >
                {copiedField === 'fax' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Email with Copy Button */}
          <div className="py-2.5 flex justify-between items-center gap-4">
            <span className="text-gray-500 w-1/3 shrink-0">Email</span>
            <div className="flex items-center justify-end gap-1.5 w-2/3">
              <span className="text-gray-900 font-medium">{profile.email}</span>
              <button 
                onClick={() => handleCopy(profile.email, 'email')}
                className="text-gray-400 hover:text-gray-700 p-1 transition-colors"
                title="Salin Email"
              >
                {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Website with active link */}
          <div className="py-2.5 flex justify-between items-center gap-4">
            <span className="text-gray-500 w-1/3 shrink-0">Website</span>
            <a 
              href={profile.website} 
              target="_blank" 
              rel="noreferrer" 
              className="text-[#00B26A] hover:underline font-medium text-right w-2/3 truncate"
            >
              {profile.website}
            </a>
          </div>

          <div className="py-2.5 flex justify-between items-start gap-4">
            <span className="text-gray-500 w-1/3 shrink-0">Tanggal Pencatatan Saham</span>
            <span className="text-gray-900 font-medium text-right w-2/3">{profile.ipoDate}</span>
          </div>

          <div className="py-2.5 flex justify-between items-start gap-4">
            <span className="text-gray-500 w-1/3 shrink-0">Harga IPO</span>
            <span className="text-gray-900 font-medium text-right w-2/3">
              {typeof profile.ipoPrice === 'number' ? profile.ipoPrice.toLocaleString('en-US') : profile.ipoPrice}
            </span>
          </div>

          <div className="py-2.5 flex justify-between items-start gap-4">
            <span className="text-gray-500 w-1/3 shrink-0">Saham IPO</span>
            <span className="text-gray-900 font-medium text-right w-2/3">{profile.ipoShares || '-'}</span>
          </div>

          <div className="py-2.5 flex justify-between items-start gap-4">
            <span className="text-gray-500 w-1/3 shrink-0">Jumlah IPO</span>
            <span className="text-gray-900 font-medium text-right w-2/3">{profile.ipoAmount || '-'}</span>
          </div>

          <div className="py-2.5 flex justify-between items-start gap-4">
            <span className="text-gray-500 w-1/3 shrink-0">Free Float</span>
            <span className="text-gray-900 font-semibold text-right w-2/3">{profile.freeFloat}</span>
          </div>

          <div className="py-2.5 flex justify-between items-start gap-4">
            <span className="text-gray-500 w-1/3 shrink-0">Penjamin Emisi</span>
            <div className="text-right w-2/3 text-gray-900 font-medium space-y-1">
              {profile.underwriters.map((u, i) => (
                <div key={i}>{u}</div>
              ))}
            </div>
          </div>

          <div className="py-2.5 flex justify-between items-start gap-4">
            <span className="text-gray-500 w-1/3 shrink-0">Biro Administrasi</span>
            <span className="text-gray-900 font-medium text-right w-2/3">{profile.bap}</span>
          </div>
        </div>
      </div>

      {/* 2. PEMEGANG SAHAM (SHAREHOLDERS) */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[14px] font-bold text-gray-900">Pemegang Saham</h3>
          <span className="text-[11px] text-gray-400">
            Terakhir Diperbarui: {profile.lastUpdatedShareholders || '04 Aug 26'}
          </span>
        </div>

        {/* Filter Pills (> 1% / 100%) */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setShareholderFilter('> 1%')}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer",
              shareholderFilter === '> 1%'
                ? "border border-[#00B26A] text-[#00B26A] bg-emerald-50/30 font-bold"
                : "border border-gray-200 text-gray-500 hover:text-gray-800"
            )}
          >
            &gt; 1%
          </button>
          <button
            onClick={() => setShareholderFilter('100%')}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer",
              shareholderFilter === '100%'
                ? "border border-[#00B26A] text-[#00B26A] bg-emerald-50/30 font-bold"
                : "border border-gray-200 text-gray-500 hover:text-gray-800"
            )}
          >
            100%
          </button>
        </div>

        {/* Shareholder Table Header */}
        <div className="flex justify-between items-center pb-2 border-b border-gray-100 text-[11.5px] font-bold text-gray-900">
          <span>Nama</span>
          <span className="text-right">Saham</span>
        </div>

        {/* Shareholder List */}
        <div className="divide-y divide-gray-50 text-[12px]">
          {visibleShareholders.map((s, idx) => (
            <div key={idx} className="py-2.5 flex justify-between items-center gap-2">
              <span className={cn(
                "w-3/5 font-semibold leading-tight",
                s.isLink ? "text-[#00B26A] cursor-pointer hover:underline" : "text-gray-800"
              )}>
                {s.name}
              </span>
              <div className="flex items-center justify-end gap-3 w-2/5 text-right">
                <span className="text-gray-600 font-medium text-[11.5px]">{s.sharesDisplay}</span>
                <span className="font-bold text-gray-900 min-w-[50px] text-right">{s.percentage.toFixed(2)}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* DIREKSI DAN KOMISARIS KEPEMILIKAN */}
        {profile.directorShareholders && profile.directorShareholders.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <h4 className="text-[13px] font-bold text-gray-900 mb-3">Direksi dan Komisaris</h4>
            <div className="space-y-2 text-[12px]">
              {profile.directorShareholders.map((d, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-gray-800">{d.name}</span>
                    {d.badge && (
                      <span className="border border-gray-400 text-gray-500 rounded px-1 py-0.2 text-[9px] font-bold">
                        {d.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <span className="text-gray-600 font-medium text-[11.5px]">{d.shares}</span>
                    <span className="font-bold text-gray-900 min-w-[50px]">{d.sharesPct?.toFixed(2)}%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Badges Legend */}
            <div className="flex items-center gap-4 mt-3 pt-2 text-[10.5px] text-gray-500">
              <div className="flex items-center gap-1">
                <span className="border border-gray-400 text-gray-600 rounded px-1 py-0.2 text-[8.5px] font-bold">K</span>
                <span>: Komisaris</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="border border-gray-400 text-gray-600 rounded px-1 py-0.2 text-[8.5px] font-bold">D</span>
                <span>: Direksi</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="border border-gray-400 text-gray-600 rounded px-1 py-0.2 text-[8.5px] font-bold">P</span>
                <span>: Pengendali</span>
              </div>
            </div>
          </div>
        )}

        {/* ULTIMATE BENEFICIARY OWNER */}
        {profile.beneficiaryOwners && profile.beneficiaryOwners.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <h4 className="text-[13px] font-bold text-gray-900 mb-2.5">Ultimate Beneficiary Owner</h4>
            <div className="space-y-1.5 text-[12px] font-medium text-gray-800">
              {profile.beneficiaryOwners.map((owner, idx) => (
                <div key={idx}>{owner}</div>
              ))}
            </div>
          </div>
        )}

        {/* JUMLAH PEMEGANG SAHAM (MONTHLY COUNT HISTORY) */}
        {profile.shareholderCountHistory && profile.shareholderCountHistory.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <h4 className="text-[13px] font-bold text-gray-900 mb-3">Jumlah Pemegang Saham</h4>
            <div className="divide-y divide-gray-50 text-[12px]">
              {profile.shareholderCountHistory.map((item, idx) => {
                const isPositive = item.change > 0;
                const isNegative = item.change < 0;
                return (
                  <div key={idx} className="py-2 flex justify-between items-center">
                    <span className="text-gray-700 font-normal">{item.date}</span>
                    <div className="flex items-center gap-1.5 font-semibold text-right">
                      <span className="text-gray-900">{item.count.toLocaleString('en-US')}</span>
                      {item.change !== 0 && (
                        <span className={cn(
                          "text-[11px] font-medium",
                          isPositive ? "text-[#00B26A]" : isNegative ? "text-rose-500" : "text-gray-400"
                        )}>
                          ({isPositive ? `+${item.change.toLocaleString('en-US')}` : item.change.toLocaleString('en-US')})
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SHAREHOLDER COMPOSITION SLIDER */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              <h4 className="text-[13px] font-bold text-gray-900">Shareholder Composition</h4>
              <Info className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <span className="text-xs text-gray-400 font-medium">Jul 2026</span>
          </div>

          {/* Month Slider Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {months.map(m => (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer shrink-0",
                  selectedMonth === m
                    ? "border border-[#00B26A] text-[#00B26A] bg-emerald-50/20 font-bold"
                    : "bg-gray-50 text-gray-400 hover:text-gray-700"
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. DEWAN DIREKSI */}
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-[14px] font-bold text-gray-900 mb-4">Dewan Direksi</h3>
        <div className="space-y-4">
          {profile.directors.map((director, idx) => (
            <div key={idx} className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold shrink-0">
                {getInitials(director.name)}
              </div>
              <div className="flex flex-col">
                <span className="text-[12.5px] font-bold text-gray-900 leading-tight">
                  {director.name}
                </span>
                <span className="text-[11.5px] text-gray-500 font-normal mt-0.5">
                  {director.position}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. DEWAN KOMISARIS */}
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-[14px] font-bold text-gray-900 mb-4">Dewan Komisaris</h3>
        <div className="space-y-4">
          {profile.commissioners.map((comm, idx) => (
            <div key={idx} className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold shrink-0">
                {getInitials(comm.name)}
              </div>
              <div className="flex flex-col">
                <span className="text-[12.5px] font-bold text-gray-900 leading-tight">
                  {comm.name}
                </span>
                <span className="text-[11.5px] text-gray-500 font-normal mt-0.5">
                  {comm.position}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. ANAK PERUSAHAAN (SUBSIDIARIES) */}
      {profile.subsidiaries && profile.subsidiaries.length > 0 && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100 text-xs font-bold text-gray-900">
            <span>Anak Perusahaan</span>
            <span className="text-right">%</span>
          </div>

          <div className="divide-y divide-gray-50 text-[12px]">
            {profile.subsidiaries.map((sub, idx) => (
              <div key={idx} className="py-2.5 flex justify-between items-center gap-2">
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-900 leading-tight">
                    {sub.name}
                  </span>
                  <span className="text-[11px] text-gray-400 mt-0.5">
                    {sub.sector}
                  </span>
                </div>
                <span className="font-bold text-gray-900 text-right min-w-[50px]">
                  {sub.percentage.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Footer Note matching Stockbit Screenshot */}
          <div className="mt-8 text-center text-[11px] text-gray-400 space-y-1">
            <div>Pembaharuan Terakhir {profile.lastUpdatedSubsidiaries || 'Q2 2026'}</div>
            <div>Sumber: Laporan Triwulanan</div>
          </div>
        </div>
      )}
    </div>
  );
};
