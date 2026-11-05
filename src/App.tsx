/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import type { TabType, ClassSession } from './types';
import { UNIVERSITY_INFO } from './data/campusData';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ExploreView } from './components/ExploreView';
import { TimetableView } from './components/TimetableView';
import { WayfinderView } from './components/WayfinderView';
import { DirectoryView } from './components/DirectoryView';
import { ProfileView } from './components/ProfileView';

import { UploadScheduleModal } from './components/UploadScheduleModal';
import type {
  SruxOptionsResponse,
  SruxPreview,
  SruxSubscription,
} from './components/UploadScheduleModal';

import { VoiceNavigationModal } from './components/VoiceNavigationModal';
import { NotificationsModal } from './components/NotificationsModal';
import { InfoDeskChatModal } from './components/InfoDeskChatModal';
import { QuickSearchModal } from './components/QuickSearchModal';
import { AuthModal } from './components/AuthModal';
import type { AuthUser } from './components/AuthModal';

const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
).replace(/\/+$/, '');

interface TimetableApiEntry {
  id: string;
  code: string;
  title: string;
  day: string;
  start_time: string;
  end_time: string;
  lecturer: string | null;
  room: string | null;
  source: 'manual' | 'upload' | 'official';
}

interface TimetableApiPayload {
  code: string;
  title: string;
  day: string;
  start_time: string;
  end_time: string;
  lecturer: string | null;
  room: string | null;
}

function getErrorMessage(data: unknown, fallback: string): string {
  if (
    typeof data === 'object' &&
    data !== null &&
    'detail' in data &&
    typeof data.detail === 'string'
  ) {
    return data.detail;
  }

  return fallback;
}

async function readResponseData(
  response: Response,
): Promise<unknown> {
  return response.json().catch(() => null);
}

function apiEntryToClass(entry: TimetableApiEntry): ClassSession {
  const roomParts = (entry.room || '').split(' • ', 2);

  const savedBuilding =
    roomParts.length > 1 ? roomParts[0].trim() : '';

  const savedRoom =
    roomParts.length > 1
      ? roomParts[1].trim()
      : roomParts[0].trim();

  return {
    id: entry.id,
    code: entry.code,
    title: entry.title,
    startTime: entry.start_time,
    endTime: entry.end_time,
    tag: 'Class',
    major: '',
    professor: {
      name: entry.lecturer || '',
      avatar: '',
    },
    building: savedBuilding || 'Building not specified',
    floor: '',
    room: savedRoom || 'Room not specified',
    walkMinutes: 0,
    walkMeters: 0,
    day: entry.day,
    dateNumber: 0,
    source: entry.source,
  };
}

function classToApiPayload(
  cls: ClassSession,
): TimetableApiPayload {
  const building = cls.building.trim();
  const room = cls.room.trim();

  let roomLabel: string | null = null;

  if (
    building &&
    room &&
    building !== 'Building not specified' &&
    room !== 'Room not specified'
  ) {
    roomLabel = `${building} • ${room}`;
  } else if (
    building &&
    building !== 'Building not specified'
  ) {
    roomLabel = building;
  } else if (
    room &&
    room !== 'Room not specified'
  ) {
    roomLabel = room;
  }

  return {
    code: cls.code,
    title: cls.title,
    day: cls.day,
    start_time: cls.startTime,
    end_time: cls.endTime,
    lecturer: cls.professor.name.trim() || null,
    room: roomLabel,
  };
}

export default function App() {
  const [activeTab, setActiveTab] =
    useState<TabType>('explore');

  // Authentication state is managed centrally in this component.
  const [authToken, setAuthToken] =
    useState<string | null>(null);

  const [currentUser, setCurrentUser] =
    useState<AuthUser | null>(null);

  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const [pendingTab, setPendingTab] =
    useState<TabType>('timetable');

  // Campus navigation state.
  const origin = 'Main Campus Entrance (Gate 1)';

  const [destination, setDestination] = useState<string>(
    'SREC Computer Science Block • Room 204 (Level 2)',
  );

  const [quotaExceeded, setQuotaExceeded] = useState(false);

  // Database-backed timetable state.
  const [timetableClasses, setTimetableClasses] =
    useState<ClassSession[]>([]);

  const [isTimetableLoading, setIsTimetableLoading] =
    useState(false);

  // Official SRUX timetable subscription state.
  const [sruxSubscription, setSruxSubscription] =
    useState<SruxSubscription | null>(null);

  const [sruxSubscriptionKnown, setSruxSubscriptionKnown] =
    useState(false);

  const [timetableReloadKey, setTimetableReloadKey] =
    useState(0);

  /*
   * Fail safely while the subscription status is unknown.
   * Manual timetable editing remains disabled until the
   * backend confirms that no active SRUX subscription exists.
   */
  const sruxActive =
    Boolean(authToken) &&
    (!sruxSubscriptionKnown || Boolean(sruxSubscription));

  // Modal state. These are Israel's existing campus features.
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isVoiceNavOpen, setIsVoiceNavOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] =
    useState(false);
  const [isChatSupportOpen, setIsChatSupportOpen] =
    useState(false);
  const [isQuickSearchOpen, setIsQuickSearchOpen] =
    useState(false);

  const [toastMessage, setToastMessage] =
    useState<string | null>(null);

  useEffect(() => {
    const handleQuota = () => setQuotaExceeded(true);

    window.addEventListener(
      'gmp-quota-exceeded',
      handleQuota,
    );

    return () => {
      window.removeEventListener(
        'gmp-quota-exceeded',
        handleQuota,
      );
    };
  }, []);

  const showToast = React.useCallback((message: string) => {
    setToastMessage(message);

    window.setTimeout(() => {
      setToastMessage((previous) =>
        previous === message ? null : previous,
      );
    }, 2800);
  }, []);

  /*
   * Load the signed-in student's timetable.
   * Cancel outdated requests when the user signs out
   * or changes accounts.
   */
  useEffect(() => {
    if (!authToken) {
      setTimetableClasses([]);
      setIsTimetableLoading(false);
      return;
    }

    let cancelled = false;

    const loadTimetable = async () => {
      setIsTimetableLoading(true);

      try {
        const response = await fetch(`${API_URL}/timetable`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: 'application/json',
          },
        });

        const data = await readResponseData(response);

        if (!response.ok) {
          throw new Error(
            getErrorMessage(
              data,
              'Could not load your timetable.',
            ),
          );
        }

        if (!Array.isArray(data)) {
          throw new Error(
            'The server returned an unexpected timetable response.',
          );
        }

        if (!cancelled) {
          setTimetableClasses(
            (data as TimetableApiEntry[]).map(apiEntryToClass),
          );
        }
      } catch (error) {
        if (!cancelled) {
          setTimetableClasses([]);

          showToast(
            error instanceof TypeError
              ? 'Unable to reach the timetable API. Check that the backend is running.'
              : error instanceof Error
                ? error.message
                : 'Could not load your timetable.',
          );
        }
      } finally {
        if (!cancelled) {
          setIsTimetableLoading(false);
        }
      }
    };

    void loadTimetable();

    return () => {
      cancelled = true;
    };
  }, [authToken, showToast, timetableReloadKey]);

  /*
   * Load the student's SRUX subscription.
   */
  useEffect(() => {
    if (!authToken) {
      setSruxSubscription(null);
      setSruxSubscriptionKnown(true);
      return;
    }

    let cancelled = false;

    const loadSubscription = async () => {
      setSruxSubscriptionKnown(false);

      try {
        const response = await fetch(`${API_URL}/srux/imports`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: 'application/json',
          },
        });

        const data = await readResponseData(response);

        if (!response.ok) {
          throw new Error(
            getErrorMessage(
              data,
              'Could not check your SRUX subscription.',
            ),
          );
        }

        const result = data as {
          imports: SruxSubscription[];
        };

        if (!Array.isArray(result?.imports)) {
          throw new Error(
            'Unexpected SRUX subscription response.',
          );
        }

        if (!cancelled) {
          setSruxSubscription(result.imports[0] ?? null);
          setSruxSubscriptionKnown(true);
        }
      } catch (error) {
        if (!cancelled) {
          setSruxSubscriptionKnown(false);

          showToast(
            error instanceof TypeError
              ? 'Unable to check your SRUX subscription. Manual timetable editing remains disabled.'
              : error instanceof Error
                ? error.message
                : 'Could not check your SRUX subscription.',
          );
        }
      }
    };

    void loadSubscription();

    return () => {
      cancelled = true;
    };
  }, [authToken, showToast]);

  /*
   * One navigation handler for Header, Footer and page actions.
   * Timetable and Profile require an authenticated student.
   */
  const handleTabChange = React.useCallback(
    (tab: TabType) => {
      if (
        (tab === 'timetable' || tab === 'profile') &&
        (!authToken || !currentUser)
      ) {
        setPendingTab(tab);
        setIsAuthOpen(true);
        return;
      }

      setActiveTab(tab);
    },
    [authToken, currentUser],
  );

  const handleAuthenticated = React.useCallback(
    (token: string, user: AuthUser) => {
      setTimetableClasses([]);
      setSruxSubscription(null);
      setSruxSubscriptionKnown(false);

      setAuthToken(token);
      setCurrentUser(user);

      setIsAuthOpen(false);
      setActiveTab(pendingTab);

      showToast(
        `Welcome${user.name ? `, ${user.name}` : ''}!`,
      );
    },
    [pendingTab, showToast],
  );

  const handleSignOut = React.useCallback(() => {
    setAuthToken(null);
    setCurrentUser(null);

    setTimetableClasses([]);
    setSruxSubscription(null);
    setSruxSubscriptionKnown(true);
    setIsTimetableLoading(false);

    setIsAuthOpen(false);
    setIsUploadOpen(false);
    setActiveTab('explore');

    showToast('You have signed out.');
  }, [showToast]);

  // Campus destination navigation.
  const handleNavigateTo = React.useCallback(
    (destName: string, roomCode?: string) => {
      const formatted = roomCode
        ? `${destName} • ${roomCode}`
        : destName;

      setDestination(formatted);
      setActiveTab('wayfinder');
      showToast(`Routing to ${destName}...`);
    },
    [showToast],
  );

  const handleNavigateToClass = React.useCallback(
    (cls: ClassSession) => {
      const roomDetails = cls.room
        ? ` • ${cls.room}`
        : '';

      setDestination(`${cls.building}${roomDetails}`);
      setActiveTab('wayfinder');

      showToast(
        `Navigating to ${cls.building} (${cls.room})...`,
      );
    },
    [showToast],
  );

  /*
   * Save a new class to the API first.
   * Return true only after the server confirms the save.
   */
  const handleAddClass = React.useCallback(
    async (newClass: ClassSession): Promise<boolean> => {
      if (!authToken) {
        showToast('Please sign in before adding a class.');
        return false;
      }

      try {
        const response = await fetch(`${API_URL}/timetable`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(classToApiPayload(newClass)),
        });

        const data = await readResponseData(response);

        if (!response.ok) {
          throw new Error(
            getErrorMessage(data, 'Could not save this class.'),
          );
        }

        const savedClass = apiEntryToClass(
          data as TimetableApiEntry,
        );

        setTimetableClasses((current) => {
          if (current.some((cls) => cls.id === savedClass.id)) {
            return current;
          }

          return [...current, savedClass];
        });

        showToast(`${savedClass.code} saved to your timetable.`);
        return true;
      } catch (error) {
        showToast(
          error instanceof TypeError
            ? 'Unable to reach the API. Your class was not saved.'
            : error instanceof Error
              ? error.message
              : 'Could not save this class.',
        );

        return false;
      }
    },
    [authToken, showToast],
  );

  /*
   * Update a class in the API first.
   * Update local state only after server confirmation.
   */
  const handleUpdateClass = React.useCallback(
    async (updatedClass: ClassSession): Promise<boolean> => {
      if (!authToken) {
        showToast('Please sign in to manage your timetable.');
        return false;
      }

      try {
        const response = await fetch(
          `${API_URL}/timetable/${encodeURIComponent(updatedClass.id)}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify(classToApiPayload(updatedClass)),
          },
        );

        const data = await readResponseData(response);

        if (!response.ok) {
          throw new Error(
            getErrorMessage(data, 'Could not update this class.'),
          );
        }

        const savedClass = apiEntryToClass(
          data as TimetableApiEntry,
        );

        setTimetableClasses((current) =>
          current.map((cls) =>
            cls.id === savedClass.id ? savedClass : cls,
          ),
        );

        showToast(`${savedClass.code} updated successfully.`);
        return true;
      } catch (error) {
        showToast(
          error instanceof TypeError
            ? 'Unable to reach the API. Your changes were not saved.'
            : error instanceof Error
              ? error.message
              : 'Could not update this class.',
        );

        return false;
      }
    },
    [authToken, showToast],
  );

  /*
   * Delete a class from the API first.
   * Update local state only after server confirmation.
   */
  const handleRemoveClass = React.useCallback(
    async (id: string): Promise<boolean> => {
      if (!authToken) {
        showToast('Please sign in to manage your timetable.');
        return false;
      }

      try {
        const response = await fetch(
          `${API_URL}/timetable/${encodeURIComponent(id)}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${authToken}`,
              Accept: 'application/json',
            },
          },
        );

        if (!response.ok) {
          const data = await readResponseData(response);

          throw new Error(
            getErrorMessage(data, 'Could not remove this class.'),
          );
        }

        setTimetableClasses((current) =>
          current.filter((cls) => cls.id !== id),
        );

        showToast('Class removed from your timetable.');
        return true;
      } catch (error) {
        showToast(
          error instanceof TypeError
            ? 'Unable to reach the API. The class was not removed.'
            : error instanceof Error
              ? error.message
              : 'Could not remove this class.',
        );

        return false;
      }
    },
    [authToken, showToast],
  );

  // SRUX API operations.
  const loadSruxOptions = React.useCallback(
    async (): Promise<SruxOptionsResponse> => {
      if (!authToken) {
        throw new Error('Please sign in to load SRUX options.');
      }

      const response = await fetch(`${API_URL}/srux/options`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: 'application/json',
        },
      });

      const data = await readResponseData(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, 'Could not load SRUX options.'),
        );
      }

      return data as SruxOptionsResponse;
    },
    [authToken],
  );

  const previewSruxTimetable = React.useCallback(
    async (
      degree: string,
      academicYear: string,
      batchId: string,
    ): Promise<SruxPreview> => {
      if (!authToken) {
        throw new Error('Please sign in to preview a timetable.');
      }

      const params = new URLSearchParams({
        degree,
        academic_year: academicYear,
      });

      const response = await fetch(
        `${API_URL}/srux/timetable/${encodeURIComponent(batchId)}?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: 'application/json',
          },
        },
      );

      const data = await readResponseData(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, 'Could not preview this timetable.'),
        );
      }

      return data as SruxPreview;
    },
    [authToken],
  );

  const importSruxTimetable = React.useCallback(
    async (
      degree: string,
      academicYear: string,
      batchId: string,
    ): Promise<void> => {
      if (!authToken) {
        throw new Error('Please sign in before importing.');
      }

      const response = await fetch(`${API_URL}/srux/import`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          degree,
          academic_year: academicYear,
          batch_id: batchId,
        }),
      });

      const data = await readResponseData(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, 'Could not import the SRUX timetable.'),
        );
      }

      const result = data as {
        subscription: SruxSubscription;
      };

      if (!result?.subscription?.id) {
        throw new Error('Invalid SRUX subscription response.');
      }

      setSruxSubscription(result.subscription);
      setSruxSubscriptionKnown(true);
      setTimetableReloadKey((current) => current + 1);
    },
    [authToken],
  );

  const refreshSruxTimetable = React.useCallback(
    async (): Promise<void> => {
      if (!authToken || !sruxSubscription) {
        throw new Error('No active SRUX subscription was found.');
      }

      const response = await fetch(
        `${API_URL}/srux/imports/${encodeURIComponent(sruxSubscription.id)}/refresh`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: 'application/json',
          },
        },
      );

      const data = await readResponseData(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, 'Could not refresh the SRUX timetable.'),
        );
      }

      const result = data as {
        subscription: SruxSubscription;
      };

      if (!result?.subscription?.id) {
        throw new Error('Invalid refreshed subscription response.');
      }

      setSruxSubscription(result.subscription);
      setSruxSubscriptionKnown(true);
      setTimetableReloadKey((current) => current + 1);
    },
    [authToken, sruxSubscription],
  );

  const unsubscribeSruxTimetable = React.useCallback(
    async (): Promise<void> => {
      if (!authToken || !sruxSubscription) {
        throw new Error('No active SRUX subscription was found.');
      }

      const response = await fetch(
        `${API_URL}/srux/imports/${encodeURIComponent(sruxSubscription.id)}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: 'application/json',
          },
        },
      );

      if (!response.ok) {
        const data = await readResponseData(response);

        throw new Error(
          getErrorMessage(data, 'Could not unsubscribe from SRUX.'),
        );
      }

      setSruxSubscription(null);
      setSruxSubscriptionKnown(true);
      setTimetableReloadKey((current) => current + 1);
    },
    [authToken, sruxSubscription],
  );

  return (
    <APIProvider
      apiKey={GOOGLE_MAPS_API_KEY}
      libraries={['marker', 'places', 'geometry']}
    >
      <div className="flex min-h-screen w-full flex-col bg-slate-50 text-on-surface antialiased">
        {quotaExceeded && (
          <div className="sticky top-0 z-50 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-xs text-amber-900 shadow-sm md:text-sm">
            <span>
              Google Maps Platform quota reached. If you are the app owner,
              visit{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-amber-950 underline hover:text-amber-800"
              >
                maps developer site
              </a>{' '}
              for instructions to update your account.
            </span>
          </div>
        )}

        <Header
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenProfile={() => handleTabChange('profile')}
          unreadCount={2}
          onQuickSearch={() => setIsQuickSearchOpen(true)}
        />

        <main className="w-full min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 xl:px-10">
          {activeTab === 'explore' && (
            <ExploreView
              onNavigateTo={handleNavigateTo}
              onShowToast={showToast}
              onOpenAccessibilitySettings={() =>
                handleTabChange('profile')
              }
            />
          )}

          {activeTab === 'wayfinder' && (
            <WayfinderView
              origin={origin}
              destination={destination}
              onShowToast={showToast}
              onStartVoiceNav={() => setIsVoiceNavOpen(true)}
              onOpenChatSupport={() =>
                setIsChatSupportOpen(true)
              }
              onCallSecurity={() => {
                showToast(
                  `Connecting to Campus Security Dispatch (${UNIVERSITY_INFO.emergencyPhone})`,
                );
              }}
            />
          )}

          {activeTab === 'timetable' &&
            authToken &&
            currentUser && (
              <>
                {isTimetableLoading && (
                  <p
                    role="status"
                    className="mb-3 text-sm text-slate-500"
                  >
                    Loading your saved timetable...
                  </p>
                )}

                <TimetableView
                  classes={timetableClasses}
                  sruxActive={sruxActive}
                  onAddClass={handleAddClass}
                  onUpdateClass={handleUpdateClass}
                  onRemoveClass={handleRemoveClass}
                  onNavigateToClass={handleNavigateToClass}
                  onOpenUploadSchedule={() =>
                    setIsUploadOpen(true)
                  }
                  onShowToast={showToast}
                />
              </>
            )}

          {activeTab === 'directory' && (
            <DirectoryView
              onNavigateToDest={handleNavigateTo}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'profile' &&
            authToken &&
            currentUser && (
              <ProfileView
                user={currentUser}
                onSignOut={handleSignOut}
                onShowToast={showToast}
                onNavigateToDest={handleNavigateTo}
                onOpenUploadSchedule={() =>
                  setIsUploadOpen(true)
                }
              />
            )}
        </main>

        <Footer onTabChange={handleTabChange} />

        <div
          aria-live="polite"
          className={`pointer-events-none fixed bottom-6 right-6 z-50 max-w-sm transform transition-all duration-300 ${
            toastMessage
              ? 'translate-y-0 scale-100 opacity-100'
              : 'translate-y-8 scale-95 opacity-0'
          }`}
        >
          <div className="flex items-center gap-2.5 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-2xl">
            <span className="material-symbols-outlined text-secondary text-[20px]">
              check_circle
            </span>
            <span className="truncate">{toastMessage}</span>
          </div>
        </div>

        <QuickSearchModal
          isOpen={isQuickSearchOpen}
          onClose={() => setIsQuickSearchOpen(false)}
          onSelectDestination={handleNavigateTo}
        />

        <UploadScheduleModal
          isOpen={isUploadOpen && sruxSubscriptionKnown}
          onClose={() => setIsUploadOpen(false)}
          onShowToast={showToast}
          subscription={sruxSubscription}
          loadOptions={loadSruxOptions}
          previewTimetable={previewSruxTimetable}
          onImport={importSruxTimetable}
          onRefresh={refreshSruxTimetable}
          onUnsubscribe={unsubscribeSruxTimetable}
        />

        <VoiceNavigationModal
          isOpen={isVoiceNavOpen}
          onClose={() => setIsVoiceNavOpen(false)}
          destination={destination}
          onShowToast={showToast}
        />

        <NotificationsModal
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          onShowToast={showToast}
        />

        <InfoDeskChatModal
          isOpen={isChatSupportOpen}
          onClose={() => setIsChatSupportOpen(false)}
          onNavigateToDest={handleNavigateTo}
        />

        {isAuthOpen && (
          <AuthModal
            onClose={() => setIsAuthOpen(false)}
            onAuthenticated={handleAuthenticated}
          />
        )}
      </div>
    </APIProvider>
  );
}
