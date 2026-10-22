import React, { useState } from 'react';
import { TabType } from '../types';
import { UNIVERSITY_INFO } from '../data/campusData';

interface HeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  unreadCount?: number;
  onQuickSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenNotifications,
  onOpenProfile,
  unreadCount = 2,
  onQuickSearch
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems: { tab: TabType; label: string; icon: string }[] = [
    { tab: 'explore', label: 'Campus Map', icon: 'map' },
    { tab: 'wayfinder', label: 'Directions', icon: 'directions' },
    { tab: 'timetable', label: 'Timetable', icon: 'calendar_today' },
    { tab: 'directory', label: 'Directory', icon: 'contact_phone' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onTabChange('explore')}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <img
                alt="SR University Logo"
                className="h-9 w-auto object-contain rounded"
                src={UNIVERSITY_INFO.logoUrl}
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                    {UNIVERSITY_INFO.name}
                  </span>
                  <span className="hidden sm:inline-block text-[11px] font-medium text-slate-500">
                    Warangal
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 hidden sm:block">
                  Campus Navigation &amp; Maps
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links (Google-style clean tabs) */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const isActive = activeTab === item.tab;
              return (
                <button
                  key={item.tab}
                  onClick={() => onTabChange(item.tab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-secondary'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[19px]"
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Tools: Quick Search, Emergency SOS, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Shortcut */}
            {onQuickSearch && (
              <button
                onClick={onQuickSearch}
                aria-label="Search campus places"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-600 transition-colors font-medium border border-slate-200"
              >
                <span className="material-symbols-outlined text-[16px] text-slate-500">search</span>
                <span>Find Room / Block</span>
                <kbd className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-300 text-slate-500">
                  ⌘K
                </kbd>
              </button>
            )}

            {/* Emergency Hotline Button */}
            <a
              href={`tel:${UNIVERSITY_INFO.emergencyPhone}`}
              title="Campus Security Dispatch"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold border border-red-200 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-red-600">call</span>
              <span className="hidden sm:inline">SOS</span>
            </a>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              aria-label="Campus Announcements"
              className="relative w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-secondary" />
              )}
            </button>

            {/* Student Account */}
            <button
              onClick={onOpenProfile}
              aria-label="User Profile"
              className={`flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-lg border transition-colors ${
                activeTab === 'profile'
                  ? 'border-secondary bg-blue-50/50'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <img
                alt={UNIVERSITY_INFO.user.name}
                className="w-7 h-7 rounded-full object-cover"
                src={UNIVERSITY_INFO.user.avatar}
              />
              <span className="hidden lg:inline text-xs font-semibold text-slate-800">
                {UNIVERSITY_INFO.user.name}
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
              className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100"
            >
              <span className="material-symbols-outlined text-[22px]">
                {isMobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-2 border-t border-slate-100 space-y-1">
            {navItems.map(item => {
              const isActive = activeTab === item.tab;
              return (
                <button
                  key={item.tab}
                  onClick={() => {
                    onTabChange(item.tab);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-secondary'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
            {onQuickSearch && (
              <button
                onClick={() => {
                  onQuickSearch();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
              >
                <span className="material-symbols-outlined text-[20px] text-slate-500">search</span>
                <span>Search campus places</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
