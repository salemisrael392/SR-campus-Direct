/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TabType, ClassSession } from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ExploreView } from './components/ExploreView';
import { TimetableView } from './components/TimetableView';
import { WayfinderView } from './components/WayfinderView';
import { ProfileView } from './components/ProfileView';
import { UploadScheduleModal } from './components/UploadScheduleModal';
import { VoiceNavigationModal } from './components/VoiceNavigationModal';
import { NotificationsModal } from './components/NotificationsModal';
import { InfoDeskChatModal } from './components/InfoDeskChatModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('explore');
  const [origin, setOrigin] = useState<string>('Student Center Plaza (Fountain)');
  const [destination, setDestination] = useState<string>('Newton Hall • Room 204 (Level 2)');
  
  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isVoiceNavOpen, setIsVoiceNavOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isChatSupportOpen, setIsChatSupportOpen] = useState(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(prev => (prev === message ? null : prev));
    }, 2800);
  };

  const handleNavigateTo = (destName: string, roomCode?: string) => {
    const formatted = roomCode ? `${destName} • ${roomCode}` : destName;
    setDestination(formatted);
    setActiveTab('wayfinder');
    showToast(`Calculating optimal route to ${destName}...`);
  };

  const handleNavigateToClass = (cls: ClassSession) => {
    setDestination(`${cls.building} • ${cls.room}`);
    setActiveTab('wayfinder');
    showToast(`Navigating to ${cls.building} (${cls.room})...`);
  };

  const getHeaderSubtitle = () => {
    switch (activeTab) {
      case 'explore':
        return 'Campus Map';
      case 'timetable':
        return 'Class Timetable';
      case 'wayfinder':
        return 'Wayfinder Navigator';
      case 'profile':
        return 'Academic Profile';
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-start text-on-surface select-none">
      {/* Mobile Shell Framing for Desktop & Mobile */}
      <div className="w-full max-w-md min-h-screen flex flex-col bg-surface shadow-2xl relative border-x border-surface-container-high/40 pb-20">
        {/* Sticky Header */}
        <Header
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenProfile={() => setActiveTab('profile')}
          unreadCount={2}
          subtitle={getHeaderSubtitle()}
        />

        {/* Main Screen Body */}
        <main className="flex-1 w-full pt-16 flex flex-col">
          {activeTab === 'explore' && (
            <ExploreView
              onNavigateTo={handleNavigateTo}
              onShowToast={showToast}
              onOpenAccessibilitySettings={() => setActiveTab('profile')}
            />
          )}

          {activeTab === 'timetable' && (
            <TimetableView
              onNavigateToClass={handleNavigateToClass}
              onOpenUploadSchedule={() => setIsUploadOpen(true)}
              onShowToast={showToast}
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
                showToast('Connecting to Campus Security Dispatch (+1 555-019-7800)');
              }}
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

        {/* Fixed Bottom Navigation */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Micro-Interactive Floating Toast */}
        <div
          className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 transform transition-all duration-300 pointer-events-none max-w-xs ${
            toastMessage ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-95'
          }`}
        >
          <div className="bg-primary text-on-primary px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 font-label-md text-label-md whitespace-nowrap border border-primary-fixed-dim/20">
            <span className="material-symbols-outlined text-secondary-fixed text-[18px]">
              turn_sharp_right
            </span>
            <span className="truncate">{toastMessage}</span>
          </div>
        </div>

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
    </div>
  );
}
