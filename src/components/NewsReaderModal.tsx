import React from 'react';
import { X, Share2, ThumbsUp, Bookmark, ExternalLink, TrendingUp, TrendingDown, Minus, Clock, Building2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface NewsItem {
  id: string | number;
  title: string;
  summary: string;
  keyPoints?: string[];
  source: string;
  time: string;
  category?: string;
  tags?: string[];
  relatedStock?: string;
  sentiment?: 'bullish' | 'bearish' | 'neutral';
  image: string;
  likes: number;
  comments: number;
  shares?: number;
  url?: string;
}

interface NewsReaderModalProps {
  news: NewsItem | null;
  onClose: () => void;
  isLiked?: boolean;
  onToggleLike?: (id: string | number) => void;
}

export function NewsReaderModal({
  news,
  onClose,
  isLiked = false,
  onToggleLike
}: NewsReaderModalProps) {
  const [copied, setCopied] = React.useState(false);
  const [bookmarked, setBookmarked] = React.useState(false);

  if (!news) return null;

  const handleShare = () => {
    navigator.clipboard?.writeText?.(news.url || window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sentimentConfig = {
    bullish: {
      bg: 'bg-emerald-50 text-[#00B26A] border-emerald-200',
      icon: TrendingUp,
      label: 'Sentimen Bullish'
    },
    bearish: {
      bg: 'bg-red-50 text-red-600 border-red-200',
      icon: TrendingDown,
      label: 'Sentimen Bearish'
    },
    neutral: {
      bg: 'bg-gray-50 text-gray-600 border-gray-200',
      icon: Minus,
      label: 'Sentimen Netral'
    }
  }[news.sentiment || 'neutral'];

  const SentimentIcon = sentimentConfig.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4">
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-white sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00B26A] animate-pulse" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {news.category || 'Berita Pasar Modal'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                title="Bagikan Berita"
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
            {/* News Hero Image */}
            <div className="w-full h-48 sm:h-56 rounded-2xl overflow-hidden bg-gray-100 relative shadow-xs">
              <img
                src={news.image}
                alt={news.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-black/50 backdrop-blur-md">
                  {news.source}
                </span>
                <span className="text-[11px] font-medium opacity-90 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {news.time}
                </span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
              {news.title}
            </h1>

            {/* Badges & Meta Info */}
            <div className="flex flex-wrap items-center gap-2">
              <div className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 ${sentimentConfig.bg}`}>
                <SentimentIcon className="w-3.5 h-3.5" />
                {sentimentConfig.label}
              </div>

              {news.relatedStock && (
                <div className="px-2.5 py-1 rounded-lg bg-emerald-50 text-[#00B26A] border border-emerald-200 text-xs font-bold flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  ${news.relatedStock}
                </div>
              )}

              {news.tags?.map((tag, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[11px] font-medium">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Article Summary */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                Ringkasan Berita & Analisis
              </h3>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-normal">
                {news.summary}
              </p>
            </div>

            {/* Key Points */}
            {news.keyPoints && news.keyPoints.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Poin Penting untuk Investor
                </h3>
                <div className="space-y-2">
                  {news.keyPoints.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#00B26A] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="flex-1 leading-snug">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Source Attribution & Link */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>Diterbitkan oleh <strong className="text-gray-700">{news.source}</strong></span>
              <a
                href={news.url || 'https://www.cnbcindonesia.com/market'}
                target="_blank"
                rel="noreferrer"
                className="text-[#00B26A] hover:underline font-bold flex items-center gap-1"
              >
                Buka Sumber Asli
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Footer Action Bar */}
          <div className="p-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onToggleLike?.(news.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  isLiked
                    ? 'bg-emerald-50 text-[#00B26A] border-emerald-300'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" fill={isLiked ? 'currentColor' : 'none'} />
                <span>{(news.likes || 0) + (isLiked ? 1 : 0)} Suka</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#00B26A] text-white text-xs font-bold rounded-xl hover:bg-[#009659] transition-colors shadow-xs"
            >
              Selesai Membaca
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
