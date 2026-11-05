
import React, { useRef, useState } from 'react';
import { UNIVERSITY_INFO } from '../data/campusData';
import { AuthUser } from './AuthModal';

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
).replace(/\/+$/, '');

const API_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, '');

const MAX_PROFILE_PICTURE_SIZE = 3 * 1024 * 1024;

const ALLOWED_PROFILE_PICTURE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

interface ProfileViewProps {
  user: AuthUser;
  authToken: string;
  onUserUpdated: (user: AuthUser) => void;
  onSignOut: () => void;
  onShowToast: (msg: string) => void;
  onNavigateToDest: (destName: string, roomCode?: string) => void;
  onOpenUploadSchedule: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  authToken,
  onUserUpdated,
  onSignOut,
  onShowToast,
  onOpenUploadSchedule,
}) => {
  const profilePictureInputRef = useRef<HTMLInputElement>(null);

  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [isRemovingPicture, setIsRemovingPicture] = useState(false);

  const [stepFreeDefault, setStepFreeDefault] = useState(true);
  const [audioFeedback, setAudioFeedback] = useState(true);
  const [walkingPace, setWalkingPace] = useState<
    'normal' | 'relaxed' | 'brisk'
  >('normal');

  const displayName = user.name?.trim() || 'Name not provided';

  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  const handleProfilePictureSelection = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Allow selecting the same file again later.
    event.target.value = '';

    if (!ALLOWED_PROFILE_PICTURE_TYPES.includes(file.type)) {
      onShowToast('Please select a JPEG, PNG or WebP image.');
      return;
    }

    if (file.size > MAX_PROFILE_PICTURE_SIZE) {
      onShowToast('Your profile picture must not exceed 3 MB.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsUploadingPicture(true);

    try {
      const response = await fetch(`${API_URL}/profile/picture`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: 'application/json',
        },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail || data.message || 'Could not upload your profile picture.',
        );
      }

      if (!data.profile_picture_url) {
        throw new Error('The server did not return your profile picture URL.');
      }

      onUserUpdated({
        ...user,
        profile_picture_url: data.profile_picture_url,
      });

      onShowToast('Your profile picture has been updated.');
    } catch (error) {
      onShowToast(
        error instanceof TypeError
          ? 'Unable to reach the server. Please try again.'
          : error instanceof Error
            ? error.message
            : 'Could not upload your profile picture.',
      );
    } finally {
      setIsUploadingPicture(false);
    }
  };

  const handleRemoveProfilePicture = async () => {
    if (!user.profile_picture_url || isRemovingPicture) {
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to remove your profile picture?',
    );

    if (!confirmed) {
      return;
    }

    setIsRemovingPicture(true);

    try {
      const response = await fetch(`${API_URL}/profile/picture`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: 'application/json',
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail || data.message || 'Could not remove your profile picture.',
        );
      }

      onUserUpdated({
        ...user,
        profile_picture_url: null,
      });

      onShowToast('Your profile picture has been removed.');
    } catch (error) {
      onShowToast(
        error instanceof TypeError
          ? 'Unable to reach the server. Please try again.'
          : error instanceof Error
            ? error.message
            : 'Could not remove your profile picture.',
      );
    } finally {
      setIsRemovingPicture(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col space-y-5">

      {/* Authenticated user profile */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

          <div className="flex min-w-0 items-center gap-4">

            <div className="flex shrink-0 flex-col items-center gap-2">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-blue-50 text-2xl font-bold text-blue-800 ring-1 ring-blue-100">
                {user.profile_picture_url ? (
                  <img
                    src={`${API_ORIGIN}${user.profile_picture_url}`}
                    alt={`${displayName}'s profile`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials || '?'
                )}
              </div>

              <input
                ref={profilePictureInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleProfilePictureSelection}
                disabled={isUploadingPicture || isRemovingPicture}
              />

              <button
                type="button"
                onClick={() => profilePictureInputRef.current?.click()}
                disabled={isUploadingPicture || isRemovingPicture}
                className="whitespace-nowrap rounded-lg bg-blue-50 px-2.5 py-1.5 text-[11px] font-semibold text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUploadingPicture
                  ? 'Uploading...'
                  : user.profile_picture_url
                    ? 'Change picture'
                    : 'Upload picture'}
              </button>

              {user.profile_picture_url && (
                <button
                  type="button"
                  onClick={handleRemoveProfilePicture}
                  disabled={isUploadingPicture || isRemovingPicture}
                  className="whitespace-nowrap text-[11px] font-medium text-red-600 transition-colors hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isRemovingPicture ? 'Removing...' : 'Remove picture'}
                </button>
              )}
            </div>

            <div className="min-w-0">

              <div className="flex flex-wrap items-center gap-2">

                <h2 className="break-words text-xl font-bold tracking-tight text-slate-900">
                  {displayName}
                </h2>

                {user.email_verified && (
                  <span className="rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                    Verified
                  </span>
                )}

              </div>

              <p className="mt-1 break-all text-xs text-slate-600">
                {user.email}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {UNIVERSITY_INFO.name}
              </p>

            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">

            <button
              type="button"
              onClick={onOpenUploadSchedule}
              className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-200"
            >
              <span className="material-symbols-outlined text-[16px]">
                calendar_today
              </span>
              Update Timetable
            </button>

            <button
              type="button"
              onClick={onSignOut}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              Sign out
            </button>

          </div>
        </div>
      </section>

      {/* Actual account information */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">

        <div className="mb-5 flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <span className="material-symbols-outlined">
              person
            </span>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Account Information
            </h3>
            <p className="text-xs text-slate-500">
              Information associated with your authenticated account.
            </p>
          </div>

        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Full Name
            </p>
            <p className="break-words text-sm font-semibold text-slate-900">
              {displayName}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Email Address
            </p>
            <p className="break-all text-sm font-semibold text-slate-900">
              {user.email}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Account ID
            </p>
            <p className="break-all font-mono text-xs text-slate-700">
              {user.id}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Email Verification
            </p>
            <p className={`text-sm font-semibold ${
              user.email_verified
                ? 'text-emerald-700'
                : 'text-amber-700'
            }`}>
              {user.email_verified ? 'Verified' : 'Not verified'}
            </p>
          </div>

        </div>
      </section>

      {/* Navigation preferences */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">

        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">
          Navigation Preferences
        </h3>

        <div className="space-y-5 text-xs">

          <div className="flex items-center justify-between gap-4">

            <div>
              <span className="block font-semibold text-slate-900">
                Prioritize Step-Free Routes
              </span>
              <span className="text-slate-500">
                Prefer elevators and ramps
              </span>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={stepFreeDefault}
              aria-label="Prioritize step-free routes"
              onClick={() => {
                setStepFreeDefault((value) => !value);
                onShowToast(
                  stepFreeDefault
                    ? 'Standard routing enabled'
                    : 'Step-free routing prioritized',
                );
              }}
              className={`flex h-6 w-11 shrink-0 items-center rounded-full p-1 transition-colors ${
                stepFreeDefault ? 'bg-secondary' : 'bg-slate-200'
              }`}
            >
              <span className={`h-4 w-4 rounded-full bg-white shadow-md transition-transform ${
                stepFreeDefault ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>

          </div>

          <div className="flex items-center justify-between gap-4">

            <div>
              <span className="block font-semibold text-slate-900">
                Voice Guidance &amp; Chimes
              </span>
              <span className="text-slate-500">
                Audio feedback near turns
              </span>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={audioFeedback}
              aria-label="Voice guidance and chimes"
              onClick={() => {
                setAudioFeedback((value) => !value);
                onShowToast(
                  audioFeedback
                    ? 'Voice alerts disabled'
                    : 'Voice alerts enabled',
                );
              }}
              className={`flex h-6 w-11 shrink-0 items-center rounded-full p-1 transition-colors ${
                audioFeedback ? 'bg-secondary' : 'bg-slate-200'
              }`}
            >
              <span className={`h-4 w-4 rounded-full bg-white shadow-md transition-transform ${
                audioFeedback ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>

          </div>

          <div>

            <span className="mb-2 block font-semibold text-slate-900">
              Estimated Walking Pace
            </span>

            <div className="grid grid-cols-3 gap-2">

              {[
                { id: 'relaxed' as const, label: 'Relaxed', speed: '3 km/h' },
                { id: 'normal' as const, label: 'Normal', speed: '4.5 km/h' },
                { id: 'brisk' as const, label: 'Brisk', speed: '6 km/h' },
              ].map((pace) => (

                <button
                  type="button"
                  key={pace.id}
                  aria-pressed={walkingPace === pace.id}
                  onClick={() => {
                    setWalkingPace(pace.id);
                    onShowToast(`Walking pace set to ${pace.id}`);
                  }}
                  className={`rounded-lg border px-2 py-2 text-center text-xs font-semibold transition-colors ${
                    walkingPace === pace.id
                      ? 'border-secondary bg-blue-50 text-secondary'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {pace.label}
                  <span className="mt-0.5 block text-[10px] font-normal">
                    {pace.speed}
                  </span>
                </button>

              ))}

            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
