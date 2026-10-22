/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { TabType, ClassSession } from './types';
import { UNIVERSITY_INFO } from './data/campusData';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ExploreView } from './components/ExploreView';
import { TimetableView } from './components/TimetableView';
import { WayfinderView } from './components/WayfinderView';
import { DirectoryView } from './components/DirectoryView';
import { ProfileView } from './components/ProfileView';
import { UploadScheduleModal } from './components/UploadScheduleModal';
import { VoiceNavigationModal } from './components/VoiceNavigationModal';
import { NotificationsModal } from './components/NotificationsModal';
import { InfoDeskChatModal } from './components/InfoDeskChatModal';
import { QuickSearchModal } from './components/QuickSearchModal';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('explore');
  const [origin, setOrigin] = useState<string>('Main Campus Entrance (Gate 1)');
  const [destination, setDestination] = useState<string>('SREC Computer Science Block • Room 204 (Level 2)');
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isVoiceNavOpen, setIsVoiceNavOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isChatSupportOpen, setIsChatSupportOpen] = useState(false);
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  const showToast = React.useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(prev => (prev === message ? null : prev));
    }, 2800);
  }, []);

  const handleNavigateTo = React.useCallback((destName: string, roomCode?: string) => {
    const formatted = roomCode ? `${destName} • ${roomCode}` : destName;
    setDestination(formatted);
    setActiveTab('wayfinder');
    showToast(`Routing to ${destName}...`);
  }, [showToast]);

  const handleNavigateToClass = React.useCallback((cls: ClassSession) => {
    setDestination(`${cls.building} • ${cls.room}`);
    setActiveTab('wayfinder');
    showToast(`Navigating to ${cls.building} (${cls.room})...`);
  }, [showToast]);

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['marker', 'places', 'geometry']}>
      <div className="min-h-screen bg-slate-50 flex flex-col text-on-surface antialiased">
        {/* Google Maps Platform Quota Notice Banner */}
        {quotaExceeded && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
            <span>
              Google Maps Platform quota reached. If you are the app owner, visit{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-amber-950 hover:text-amber-800"
              >
                maps developer site
              </a>{' '}
              for instructions to update your account.
            </span>
          </div>
        )}
      {/* Website Navigation Topbar */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenProfile={() => setActiveTab('profile')}
        unreadCount={2}
        onQuickSearch={() => setIsQuickSearchOpen(true)}
      />

      {/* Main Website Canvas Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
        {activeTab === 'explore' && (
          <ExploreView
            onNavigateTo={handleNavigateTo}
            onShowToast={showToast}
            onOpenAccessibilitySettings={() => setActiveTab('profile')}
          />
        )}

        {activeTab === 'wayfinder' && (
          <WayfinderView
            origin={origin}
            destination={destination}
            onShowToast={showToast}
            onStartVoiceNav={() => setIsVoiceNavOpen(true)}
            onOpenChatSupport={() => setIsChatSupportOpen(true)}
            onCallSecurity={() => {
              showToast(`Connecting to Campus Security Dispatch (${UNIVERSITY_INFO.emergencyPhone})`);
            }}
          />
        )}

        {activeTab === 'timetable' && (
          <TimetableView
            onNavigateToClass={handleNavigateToClass}
            onOpenUploadSchedule={() => setIsUploadOpen(true)}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'directory' && (
          <DirectoryView
            onNavigateToDest={handleNavigateTo}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            onShowToast={showToast}
            onNavigateToDest={handleNavigateTo}
            onOpenUploadSchedule={() => setIsUploadOpen(true)}
          />
        )}
      </main>

      {/* Full Website Footer */}
      <Footer onTabChange={setActiveTab} />

      {/* Micro-Interactive Floating Toast */}
      <div
        className={`fixed bottom-6 right-6 z-50 transform transition-all duration-300 pointer-events-none max-w-sm ${
          toastMessage ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'
        }`}
      >
        <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold border border-slate-700">
          <span className="material-symbols-outlined text-secondary text-[20px]">
            check_circle
          </span>
          <span className="truncate">{toastMessage}</span>
        </div>
      </div>

      {/* Quick Search Shortcut Dialog */}
      <QuickSearchModal
        isOpen={isQuickSearchOpen}
        onClose={() => setIsQuickSearchOpen(false)}
        onSelectDestination={handleNavigateTo}
      />

      {/* Upload Schedule Full Modal */}
      <UploadScheduleModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onShowToast={showToast}
      />

      {/* Turn-by-Turn Voice Navigation Modal */}
      <VoiceNavigationModal
        isOpen={isVoiceNavOpen}
        onClose={() => setIsVoiceNavOpen(false)}
        destination={destination}
        onShowToast={showToast}
      />

      {/* Campus Notifications Drawer */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onShowToast={showToast}
      />

      {/* Info Desk Live Chat Modal */}
      <InfoDeskChatModal
        isOpen={isChatSupportOpen}
        onClose={() => setIsChatSupportOpen(false)}
        onNavigateToDest={handleNavigateTo}
      />
    </div>
    </APIProvider>
  );
}
