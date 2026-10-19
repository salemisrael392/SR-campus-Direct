import React, { useState } from 'react';
import { CampusNotification } from '../types';
import { INITIAL_NOTIFICATIONS } from '../data/campusData';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const [notifications, setNotifications] = useState<CampusNotification[]>(INITIAL_NOTIFICATIONS);

  if (!isOpen) return null;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    onShowToast('All notifications marked as read');
  };

  const handleClear = () => {
    setNotifications([]);
    onShowToast('Notifications cleared');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-primary/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 flex flex-col gap-3 animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto">
        <div className="w-10 h-1 bg-outline-variant rounded-full self-center mb-1 sm:hidden" />

        <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[24px]">notifications</span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Campus Alerts</h2>
          </div>
          <div className="flex items-center gap-2">
            {notifications.some(n => n.unread) && (
              <button
                onClick={handleMarkAllRead}
                className="text-secondary font-label-md text-label-md hover:underline font-semibold"
              >
                Mark read
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="py-12 text-center text-on-surface-variant flex flex-col items-center">
            <span className="material-symbols-outlined text-[40px] text-surface-container-highest mb-2">
              notifications_paused
            </span>
            <p className="font-title-sm text-title-sm text-on-surface">You're all caught up!</p>
            <p className="font-body-sm text-body-sm mt-1">No active class changes or transit delays.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {notifications.map(n => (
              <div
                key={n.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  n.unread
                    ? 'bg-secondary-fixed/30 border-secondary-fixed-dim'
                    : 'bg-surface-container-low border-surface-container-high'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={`material-symbols-outlined text-[18px] ${
                        n.type === 'class'
                          ? 'text-secondary'
                          : n.type === 'transit'
                          ? 'text-emerald-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {n.type === 'class' ? 'school' : n.type === 'transit' ? 'directions_bus' : 'info'}
                    </span>
                    <span className="font-title-sm text-title-sm text-on-surface font-bold truncate">
                      {n.title}
                    </span>
                  </div>
                  <span className="font-code-sm text-code-sm text-on-surface-variant shrink-0 font-medium">
                    {n.timestamp}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{n.description}</p>
              </div>
            ))}
          </div>
        )}

        {notifications.length > 0 && (
          <button
            onClick={handleClear}
            className="w-full mt-2 py-2.5 rounded-xl bg-surface-container-high text-on-surface font-label-md text-label-md hover:bg-surface-container-highest transition-colors font-semibold"
          >
            Clear All Alerts
          </button>
        )}
      </div>
    </div>
  );
};
