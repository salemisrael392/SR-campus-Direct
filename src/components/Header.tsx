import React from 'react';
import { UNIVERSITY_INFO } from '../data/campusData';

interface HeaderProps {
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  unreadCount?: number;
  subtitle?: string;
  onBack?: () => void;
  showBack?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNotifications,
  onOpenProfile,
  unreadCount = 2,
  subtitle,
  onBack,
  showBack = false
}) => {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
      <div className="h-16 px-gutter flex items-center justify-between max-w-xl mx-auto w-full">
        {/* Left: Logo & Campus Title */}
        <div className="flex items-center gap-space-sm min-w-0">
          {showBack && (
            <button
              onClick={onBack}
              aria-label="Go back"
              className="w-10 h-10 -ml-2 flex items-center justify-center text-on-surface hover:text-secondary rounded-full transition-colors shrink-0 active:scale-95"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_back</span>
            </button>
          )}

          {/* Primary or Secondary Logo Display */}
          <div className="flex items-center gap-2 shrink-0">
            <img
              alt="SR University Primary Logo"
              className="h-8 w-auto object-contain shrink-0 rounded"
              src={UNIVERSITY_INFO.logoUrl}
            />
            {/* Secondary logo badge */}
            <img
              alt="SR University Secondary Logo"
              className="hidden sm:block h-6 w-auto object-contain opacity-90"
              src={UNIVERSITY_INFO.secondaryLogoUrl}
            />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-title-sm text-title-sm text-primary tracking-tight truncate font-bold">
                {UNIVERSITY_INFO.name}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm leading-none shrink-0 font-medium">
                {subtitle || UNIVERSITY_INFO.campus}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Notification Bell & Profile Avatar */}
        <div className="flex items-center gap-space-sm shrink-0">
          <button
            onClick={onOpenNotifications}
            aria-label="Notifications"
            className="w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-primary relative rounded-full transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-secondary ring-2 ring-surface animate-pulse" />
            )}
          </button>

          <button
            onClick={onOpenProfile}
            aria-label="Open Profile"
            className="relative flex items-center justify-center active:scale-95 transition-transform"
          >
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-secondary-fixed"
              src={UNIVERSITY_INFO.user.avatar}
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-secondary-container ring-2 ring-surface" />
          </button>
        </div>
      </div>
    </header>
  );
};
