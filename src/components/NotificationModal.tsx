import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, ArrowUpRight, ArrowDownLeft, CheckCircle2, Trash2 } from 'lucide-react';
import { useNotification, PushNotificationItem } from '../contexts/NotificationContext';
import { cn } from '../lib/utils';

export function NotificationModal({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { notifications, markAllAsRead } = useNotification();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 animate-fade-in">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-slide-up">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-[#00B26A] rounded-full">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Notifikasi</h2>
              <p className="text-[11px] text-gray-400">Pemberitahuan aktivitas & penarikan dana</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 mb-3">
                <Bell className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-gray-700">Belum Ada Notifikasi</p>
              <p className="text-xs text-gray-400 max-w-xs mt-1">
                Notifikasi penarikan saldo, deposit, dan aktivitas akun akan muncul di sini.
              </p>
            </div>
          ) : (
            notifications.map((notif, idx) => {
              const isWithdraw = notif.type === 'withdraw';
              const isDeposit = notif.type === 'deposit';

              return (
                <div
                  key={`notif-${notif.id || idx}-${idx}`}
                  className="p-3.5 bg-gray-50/80 hover:bg-emerald-50/40 rounded-xl border border-gray-100 transition-colors flex items-start gap-3"
                >
                  <div className="shrink-0 mt-0.5">
                    {isWithdraw ? (
                      <div className="w-9 h-9 rounded-lg bg-emerald-100 text-[#00B26A] flex items-center justify-center">
                        <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                      </div>
                    ) : isDeposit ? (
                      <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                        <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-xs font-bold text-gray-900">{notif.title}</h4>
                      <span className="text-[10px] text-gray-400">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-gray-600 leading-relaxed">
                      {notif.message}
                    </p>
                    {notif.amount && (
                      <span className="inline-block mt-1.5 text-xs font-bold text-[#00B26A]">
                        Rp {notif.amount.toLocaleString('id-ID')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
            <button 
              onClick={markAllAsRead}
              className="text-xs font-bold text-[#00B26A] hover:underline"
            >
              Tandai Semua Sudah Dibaca
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
