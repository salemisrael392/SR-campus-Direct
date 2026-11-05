
import React, { useState, useRef, useEffect } from 'react';
import { TabType } from '../types';
import { UNIVERSITY_INFO } from '../data/campusData';
import type { AuthUser } from './AuthModal';

const API_ORIGIN = (
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
).replace(/\/api\/v1\/?$/, '');

interface HeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  user: AuthUser | null;
  unreadCount?: number;
  onQuickSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenNotifications,
  onOpenProfile,
  user,
  unreadCount = 2,
  onQuickSearch
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Generate the account display name from the authenticated user.
  const getDisplayName = () => {
    const fullName = user?.name?.trim();

    if (fullName) {
      const parts = fullName.split(/\s+/).filter(Boolean);

      if (parts.length >= 2) {
        return `${parts[0].charAt(0).toUpperCase()}. ${parts[parts.length - 1]}`;
      }

      return parts[0];
    }

    return user?.email || 'Account';
  };

  // Generate avatar initials from the authenticated user.
  const getAvatarInitials = () => {
    const fullName = user?.name?.trim();

    if (fullName) {
      const parts = fullName.split(/\s+/).filter(Boolean);

      if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
      }

      return parts[0].substring(0, 2).toUpperCase();
    }

    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }

    return 'U';
  };

  const displayName = getDisplayName();
  const avatarInitials = getAvatarInitials();

  const navItems: {
    tab: TabType;
    label: string;
    icon: string;
    desc: string;
  }[] = [
    {
      tab: 'explore',
      label: 'Campus Map',
      icon: 'map',
      desc: 'Interactive 2D & satellite campus navigation'
    },
    {
      tab: 'wayfinder',
      label: 'Directions',
      icon: 'directions',
      desc: 'Turn-by-turn routing & 3D indoor pathway'
    },
    {
      tab: 'timetable',
      label: 'Timetable',
      icon: 'calendar_today',
      desc: 'Class schedule & room route sync'
    },
    {
      tab: 'directory',
      label: 'Directory',
      icon: 'contact_phone',
      desc: 'Faculty offices, labs & student services'
    }
  ];

  const currentNavItem =
    navItems.find(item => item.tab === activeTab) || navItems[0];

  // Close dropdown on click outside or Escape key.
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const handleSelectNav = (tab: TabType) => {
    onTabChange(tab);
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Left: University Logo and Navigation */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => onTabChange('explore')}
              className="flex items-center focus:outline-none transition-transform hover:opacity-90 active:scale-95 py-1"
              title="SR University Campus Navigation"
              aria-label="SR University Home"
            >
              <img
                alt="SR University Logo"
                className="h-10 sm:h-11 w-auto object-contain rounded"
                src={UNIVERSITY_INFO.logoUrl}
              />
            </button>

            {/* Menu Dropdown Trigger */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-haspopup="true"
                aria-expanded={isMenuOpen}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-all shadow-2xs active:scale-98 ${
                  isMenuOpen
                    ? 'bg-blue-50/70 border-secondary text-secondary ring-2 ring-secondary/20'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-[19px] text-secondary">
                  menu
                </span>

                <span className="font-bold text-slate-900">
                  {currentNavItem.label}
                </span>

                <span
                  className={`material-symbols-outlined text-[18px] text-slate-500 transition-transform duration-200 ${
                    isMenuOpen ? 'rotate-180' : ''
                  }`}
                >
                  expand_more
                </span>
              </button>

              {/* Menu Dropdown Panel */}
              {isMenuOpen && (
                <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">

                  {/* Campus Subpages */}
                  <div className="p-2 border-b border-slate-100 bg-slate-50/50">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2.5 py-1 block">
                      Campus Subpages
                    </span>
                  </div>

                  <div className="p-2 space-y-1">
                    {navItems.map(item => {
                      const isActive = activeTab === item.tab;

                      return (
                        <button
                          key={item.tab}
                          onClick={() => handleSelectNav(item.tab)}
                          className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-colors ${
                            isActive
                              ? 'bg-blue-50 text-secondary'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                              isActive
                                ? 'bg-secondary text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {item.icon}
                            </span>
                          </div>

                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-bold block text-slate-900 leading-tight">
                              {item.label}
                            </span>

                            <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                              {item.desc}
                            </span>
                          </div>

                          {isActive && (
                            <span className="material-symbols-outlined text-[18px] text-secondary shrink-0 mt-1">
                              check
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Quick Tools and Support */}
                  <div className="p-2 border-t border-slate-100 bg-slate-50/50">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2.5 py-1 block">
                      Quick Tools &amp; Support
                    </span>
                  </div>

                  <div className="p-2 space-y-1">
                    {onQuickSearch && (
                      <button
                        onClick={() => {
                          onQuickSearch();
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-[19px] text-slate-500">
                            search
                          </span>

                          <span className="text-xs font-semibold text-slate-800">
                            Find Room / Block
                          </span>
                        </div>

                        <kbd className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-500">
                          ⌘K
                        </kbd>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onOpenNotifications();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-[19px] text-slate-500">
                          notifications
                        </span>

                        <span className="text-xs font-semibold text-slate-800">
                          Announcements &amp; Alerts
                        </span>
                      </div>

                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-secondary text-white text-[10px] font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </button>

                    <a
                      href={`tel:${UNIVERSITY_INFO.emergencyPhone}`}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-red-50 text-red-700 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-[19px] text-red-600">
                          call
                        </span>

                        <span className="text-xs font-semibold text-red-700">
                          Emergency SOS Dispatch
                        </span>
                      </div>

                      <span className="text-[10px] font-mono text-red-500 font-bold">
                        24/7
                      </span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Authenticated User Profile */}
          <div className="flex items-center">
            <button
              onClick={onOpenProfile}
              aria-label={`User Profile: ${displayName}`}
              title={user?.email || 'User Account'}
              className={`flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-xl border transition-all shadow-2xs active:scale-95 ${
                activeTab === 'profile'
                  ? 'border-secondary bg-blue-50/60 ring-2 ring-secondary/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
              }`}
            >
              {/* Profile Picture or Generated Initials */}
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden flex items-center justify-center bg-blue-100 text-blue-700 text-[11px] sm:text-xs font-bold ring-1 ring-blue-200 shrink-0">
                {user?.profile_picture_url ? (
                  <img
                    src={`${API_ORIGIN}${user.profile_picture_url}`}
                    alt={`${displayName}'s profile`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span aria-hidden="true">{avatarInitials}</span>
                )}
              </div>

              <div className="flex flex-col text-left min-w-0">
                <span className="text-xs font-bold text-slate-800 leading-tight max-w-[110px] truncate">
                  {displayName}
                </span>

                <span className="text-[10px] text-slate-400 hidden sm:block leading-none max-w-[150px] truncate">
                  {user?.email || 'Sign in to your account'}
                </span>
              </div>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
