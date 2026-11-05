
import React, { useState } from 'react';
import { UNIVERSITY_INFO, POPULAR_DESTINATIONS } from '../data/campusData';
import { AuthUser } from './AuthModal';

interface ProfileViewProps {
  user: AuthUser;
  onSignOut: () => void;
  onShowToast: (msg: string) => void;
  onNavigateToDest: (destName: string, roomCode?: string) => void;
  onOpenUploadSchedule: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onSignOut,
  onShowToast,
  onNavigateToDest,
  onOpenUploadSchedule,
}) => {
  const [stepFreeDefault, setStepFreeDefault] = useState(true);
  const [audioFeedback, setAudioFeedback] = useState(true);
  const [walkingPace, setWalkingPace] = useState<'normal' | 'relaxed' | 'brisk'>('normal');

  const bookmarkedDestinations = POPULAR_DESTINATIONS.filter((d) => d.bookmarked);
  const displayName = user.name?.trim() || user.email;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col space-y-5">
      <section className="flex flex-col justify-between gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:p-6">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl font-bold text-blue-800 ring-1 ring-blue-100">
            {displayName.slice(0, 1).toUpperCase()}
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
            <p className="mt-1 break-all text-xs text-slate-600">{user.email}</p>
            <p className="mt-1 text-xs text-slate-400">
              {UNIVERSITY_INFO.name} · Student account
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={onOpenUploadSchedule}
            className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-200"
          >
            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            <span>Update Timetable</span>
          </button>
          <button
            type="button"
            onClick={onSignOut}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            Sign out
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">
            Navigation Preferences
          </h3>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="block font-semibold text-slate-900">Prioritize Step-Free Routes</span>
                <span className="text-slate-500">Prefer elevators and ramps</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={stepFreeDefault}
                aria-label="Prioritize step-free routes"
                onClick={() => {
                  setStepFreeDefault((value) => !value);
                  onShowToast(stepFreeDefault ? 'Standard routing enabled' : 'Step-free routing prioritized');
                }}
                className={`flex h-6 w-11 shrink-0 items-center rounded-full p-1 transition-colors ${stepFreeDefault ? 'bg-secondary' : 'bg-slate-200'}`}
              >
                <span className={`h-4 w-4 rounded-full bg-white shadow-md transition-transform ${stepFreeDefault ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="block font-semibold text-slate-900">Voice Guidance &amp; Chimes</span>
                <span className="text-slate-500">Audio feedback near turns</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={audioFeedback}
                aria-label="Voice guidance and chimes"
                onClick={() => {
                  setAudioFeedback((value) => !value);
                  onShowToast(audioFeedback ? 'Voice alerts disabled' : 'Voice alerts enabled');
                }}
                className={`flex h-6 w-11 shrink-0 items-center rounded-full p-1 transition-colors ${audioFeedback ? 'bg-secondary' : 'bg-slate-200'}`}
              >
                <span className={`h-4 w-4 rounded-full bg-white shadow-md transition-transform ${audioFeedback ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div>
              <span className="mb-2 block font-semibold text-slate-900">Estimated Walking Pace</span>
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
                    <span className="mt-0.5 block text-[10px] font-normal">{pace.speed}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Saved Locations ({bookmarkedDestinations.length})
            </h3>
            <span className="text-[11px] text-slate-400">Quick routing</span>
          </div>

          <div className="space-y-2">
            {bookmarkedDestinations.map((place) => (
              <div
                key={place.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3 transition-colors hover:border-slate-300"
              >
                <div className="min-w-0">
                  <h4 className="truncate text-xs font-bold text-slate-900">{place.name}</h4>
                  <p className="text-[11px] text-slate-500">
                    {place.locationLabel} {place.roomCode ? `· ${place.roomCode}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateToDest(place.name, place.roomCode)}
                  className="flex shrink-0 items-center gap-1 rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-secondary hover:bg-slate-100"
                >
                  <span className="material-symbols-outlined text-[15px]">directions</span>
                  Route
                </button>
              </div>
            ))}

            {bookmarkedDestinations.length === 0 && (
              <p className="py-6 text-center text-xs text-slate-400">
                No bookmarked places yet. Click the bookmark icon on a campus destination.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};