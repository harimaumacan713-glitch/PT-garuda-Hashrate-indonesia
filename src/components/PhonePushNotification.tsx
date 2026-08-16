import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification, PushNotificationItem } from '../contexts/NotificationContext';
import { Landmark, ArrowUpRight, ArrowDownLeft, X, BellRing, CheckCircle2 } from 'lucide-react';

export function PhonePushNotification() {
  const { activePush, dismissPush } = useNotification();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!activePush) {
      setProgress(100);
      return;
    }

    setProgress(100);
    const DURATION = 6500; // 6.5s auto dismiss
    const INTERVAL = 50;
    const startTime = Date.now();

    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / DURATION) * 100);
      setProgress(remaining);
    }, INTERVAL);

    const dismissTimer = setTimeout(() => {
      dismissPush();
    }, DURATION);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(dismissTimer);
    };
  }, [activePush, dismissPush]);

  if (!activePush) return null;

  const isWithdraw = activePush.type === 'withdraw';
  const isDeposit = activePush.type === 'deposit';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -120, opacity: 0, scale: 0.94 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -100, opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', damping: 22, stiffness: 280 }}
        className="fixed top-2.5 left-0 right-0 z-[9999] px-3.5 pointer-events-none flex justify-center"
      >
        <div 
          onClick={dismissPush}
          className="pointer-events-auto w-full max-w-[420px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-[0_12px_35px_rgba(0,0,0,0.18)] border border-gray-100/90 dark:border-gray-800 p-3.5 transition-all active:scale-[0.98] cursor-pointer relative overflow-hidden"
        >
          {/* Top progress line indicating auto dismiss */}
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gray-100 dark:bg-gray-800">
            <div 
              className="h-full bg-[#00B26A] transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-start gap-3 pt-1">
            {/* App Icon / Type Icon */}
            <div className="relative shrink-0 mt-0.5">
              {isWithdraw ? (
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800 flex items-center justify-center text-[#00B26A] shadow-xs">
                  <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                </div>
              ) : isDeposit ? (
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 flex items-center justify-center text-blue-600 shadow-xs">
                  <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                  <BellRing className="w-5 h-5" />
                </div>
              )}
              
              {/* Mini Stockbit Green Dot */}
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#00B26A] text-white rounded-full flex items-center justify-center text-[8px] font-bold border-2 border-white dark:border-gray-900 shadow-xs">
                ✓
              </span>
            </div>

            {/* Notification Body */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    GARUDA INVES • STOCKBIT
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 shrink-0 font-medium">sekarang</span>
              </div>

              <h4 className="text-[13.5px] font-bold text-gray-900 dark:text-white leading-snug flex items-center gap-1.5">
                {activePush.title}
              </h4>

              <p className="text-[12px] text-gray-600 dark:text-gray-300 leading-relaxed mt-0.5 break-words line-clamp-2">
                {activePush.message}
              </p>

              {activePush.amount && (
                <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-gray-100 dark:border-gray-800/80">
                  <span className="text-[11px] font-medium text-gray-500">Nominal:</span>
                  <span className="text-xs font-bold text-[#00B26A]">
                    Rp {activePush.amount.toLocaleString('id-ID')}
                  </span>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                dismissPush();
              }}
              className="shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
