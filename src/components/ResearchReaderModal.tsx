import React from 'react';
import { X, Share2, Bookmark, Check, TrendingUp, ShieldAlert, Zap, BarChart3, Building, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface ResearchItem {
  id: string | number;
  title: string;
  subtitle?: string;
  author: string;
  date: string;
  category: string;
  rating?: string;
  targetPrice?: string;
  relatedTicker?: string;
  executiveSummary: string;
  investmentThesis?: string[];
  keyMetrics?: {
    peRatio?: string;
    pbvRatio?: string;
    roe?: string;
    dividendYield?: string;
  };
  catalysts?: string[];
  risks?: string[];
  image: string;
  likes?: number;
  comments?: number;
  reads?: string;
}

interface ResearchReaderModalProps {
  research: ResearchItem | null;
  onClose: () => void;
}

export function ResearchReaderModal({
  research,
  onClose
}: ResearchReaderModalProps) {
  const [copied, setCopied] = React.useState(false);
  const [bookmarked, setBookmarked] = React.useState(false);

  if (!research) return null;

  const handleShare = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRatingBadge = (rating?: string) => {
    switch (rating?.toUpperCase()) {
      case 'BUY':
      case 'OVERWEIGHT':
        return 'bg-emerald-500 text-white';
      case 'HOLD':
      case 'NEUTRAL':
        return 'bg-amber-500 text-white';
      case 'SELL':
      case 'UNDERWEIGHT':
        return 'bg-red-500 text-white';
      default:
        return 'bg-[#00B26A] text-white';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4">
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-white sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#00B26A] border border-emerald-200">
                {research.category || 'Equity Research'}
              </span>
              {research.rating && (
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${getRatingBadge(research.rating)}`}>
                  {research.rating}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                title="Bagikan Riset"
              >
                {copied ? <Check className="w-4 h-4 text-[#00B26A]" /> : <Share2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setBookmarked(!bookmarked)}
                className={`p-2 rounded-full transition-colors ${
                  bookmarked ? 'text-[#00B26A] bg-emerald-50' : 'text-gray-500 hover:bg-gray-100'
                }`}
                title="Simpan"
              >
                <Bookmark className="w-4 h-4" fill={bookmarked ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-800 rounded-full hover:bg-gray-100 transition-colors"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
            {/* Hero Cover */}
            <div className="w-full h-44 sm:h-52 rounded-2xl overflow-hidden bg-gray-100 relative shadow-xs">
              <img
                src={research.image}
                alt={research.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <div className="flex items-center gap-2 text-xs opacity-90 mb-1">
                  <User className="w-3.5 h-3.5" />
                  <span>{research.author}</span>
                  <span>•</span>
                  <span>{research.date}</span>
                </div>
                {research.relatedTicker && (
                  <span className="inline-block bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded text-xs font-bold">
                    ${research.relatedTicker}
                  </span>
                )}
              </div>
            </div>

            {/* Title & Subtitle */}
            <div>
              <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                {research.title}
              </h1>
              {research.subtitle && (
                <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium leading-relaxed">
                  {research.subtitle}
                </p>
              )}
            </div>

            {/* Target Price Highlight */}
            {research.targetPrice && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Konsensus / Target Price
                  </span>
                  <span className="text-sm font-extrabold text-[#00B26A]">
                    {research.targetPrice}
                  </span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#00B26A] text-white flex items-center justify-center shadow-xs">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            )}

            {/* Key Valuation Metrics */}
            {research.keyMetrics && (
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div className="flex items-center gap-1.5 mb-3 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <BarChart3 className="w-4 h-4 text-[#00B26A]" />
                  <span>Valuasi & Rasio Keuangan Kunci</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="bg-white p-2.5 rounded-xl border border-gray-100 text-center">
                    <span className="text-[10px] text-gray-400 block font-medium">P/E Ratio</span>
                    <span className="text-xs font-bold text-gray-800">{research.keyMetrics.peRatio || '12.5x'}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-gray-100 text-center">
                    <span className="text-[10px] text-gray-400 block font-medium">PBV Ratio</span>
                    <span className="text-xs font-bold text-gray-800">{research.keyMetrics.pbvRatio || '2.1x'}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-gray-100 text-center">
                    <span className="text-[10px] text-gray-400 block font-medium">ROE</span>
                    <span className="text-xs font-bold text-[#00B26A]">{research.keyMetrics.roe || '18.4%'}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-gray-100 text-center">
                    <span className="text-[10px] text-gray-400 block font-medium">Div. Yield</span>
                    <span className="text-xs font-bold text-blue-600">{research.keyMetrics.dividendYield || '5.2%'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Executive Summary */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Ringkasan Eksekutif & Analisis
              </h3>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                {research.executiveSummary}
              </p>
            </div>

            {/* Investment Thesis */}
            {research.investmentThesis && research.investmentThesis.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 uppercase tracking-wider">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Tesis Investasi</span>
                </div>
                <div className="space-y-2">
                  {research.investmentThesis.map((thesis, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700 bg-amber-50/40 p-2.5 rounded-xl border border-amber-100">
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="flex-1 leading-snug">{thesis}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Catalysts & Risks Side by Side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {research.catalysts && research.catalysts.length > 0 && (
                <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
                  <h4 className="text-xs font-bold text-emerald-800 mb-2 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Katalis Positif
                  </h4>
                  <ul className="space-y-1.5 text-xs text-gray-700 list-disc list-inside">
                    {research.catalysts.map((cat, i) => (
                      <li key={i} className="leading-snug">{cat}</li>
                    ))}
                  </ul>
                </div>
              )}

              {research.risks && research.risks.length > 0 && (
                <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-100">
                  <h4 className="text-xs font-bold text-rose-800 mb-2 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Risiko Penurunan
                  </h4>
                  <ul className="space-y-1.5 text-xs text-gray-700 list-disc list-inside">
                    {research.risks.map((risk, i) => (
                      <li key={i} className="leading-snug">{risk}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/60 text-[10px] text-gray-400 leading-relaxed">
              <strong>Disclaimer:</strong> Riset ini disusun untuk tujuan edukasi dan informasi pasar modal. Bukan merupakan anjuran mutlak jual/beli instrumen keuangan. Keputusan investasi sepenuhnya berada di tangan investor.
            </div>
          </div>

          {/* Footer Action Bar */}
          <div className="p-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">
              {research.reads || '3.5k dibaca'}
            </span>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#00B26A] text-white text-xs font-bold rounded-xl hover:bg-[#009659] transition-colors shadow-xs"
            >
              Tutup Riset
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
