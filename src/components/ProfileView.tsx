import React, { useState } from 'react';
import { UNIVERSITY_INFO, POPULAR_DESTINATIONS } from '../data/campusData';

interface ProfileViewProps {
  onShowToast: (msg: string) => void;
  onNavigateToDest: (destName: string, roomCode?: string) => void;
  onOpenUploadSchedule: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onShowToast,
  onNavigateToDest,
  onOpenUploadSchedule
}) => {
  const [stepFreeDefault, setStepFreeDefault] = useState(true);
  const [audioFeedback, setAudioFeedback] = useState(true);
  const [walkingPace, setWalkingPace] = useState<'normal' | 'relaxed' | 'brisk'>('normal');

  const bookmarkedDestinations = POPULAR_DESTINATIONS.filter(d => d.bookmarked);

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto space-y-5">
      {/* Student Identity Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <img
            src={UNIVERSITY_INFO.user.avatar}
            alt={UNIVERSITY_INFO.user.name}
            className="w-16 h-16 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {UNIVERSITY_INFO.user.name}
              </h2>
              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                ID: {UNIVERSITY_INFO.user.id}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {UNIVERSITY_INFO.user.program} &bull; {UNIVERSITY_INFO.user.department}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {UNIVERSITY_INFO.user.email} &bull; {UNIVERSITY_INFO.user.term}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={onOpenUploadSchedule}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            <span>Update Timetable</span>
          </button>
        </div>
      </div>

      {/* Grid: Preferences & Saved Places */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Navigation & Accessibility Settings */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
            Navigation Preferences
          </h3>

          <div className="space-y-4 text-xs">
            {/* Step-Free Routing */}
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900 block">Prioritize Step-Free Routes</span>
                <span className="text-slate-500">Always route via campus elevators &amp; ramps</span>
              </div>
              <button
                onClick={() => {
                  setStepFreeDefault(!stepFreeDefault);
                  onShowToast(stepFreeDefault ? 'Standard routing enabled' : 'Step-free routing prioritized');
                }}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  stepFreeDefault ? 'bg-secondary' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    stepFreeDefault ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Audio Directions */}
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900 block">Voice Guidance &amp; Chimes</span>
                <span className="text-slate-500">Audio feedback when approaching turns</span>
              </div>
              <button
                onClick={() => {
                  setAudioFeedback(!audioFeedback);
                  onShowToast(audioFeedback ? 'Voice alerts disabled' : 'Voice alerts enabled');
                }}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  audioFeedback ? 'bg-secondary' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    audioFeedback ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Walking Pace */}
            <div>
              <span className="font-semibold text-slate-900 block mb-2">Estimated Walking Pace</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'relaxed', label: 'Relaxed (3 km/h)' },
                  { id: 'normal', label: 'Normal (4.5 km/h)' },
                  { id: 'brisk', label: 'Brisk (6 km/h)' }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setWalkingPace(p.id as any);
                      onShowToast(`Walking pace set to ${p.id}`);
                    }}
                    className={`py-2 px-2 text-center rounded-lg border text-xs font-semibold transition-colors ${
                      walkingPace === p.id
                        ? 'border-secondary bg-blue-50 text-secondary'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Saved Campus Places */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Saved Locations ({bookmarkedDestinations.length})
            </h3>
            <span className="text-[11px] text-slate-400">Quick routing</span>
          </div>

          <div className="space-y-2">
            {bookmarkedDestinations.map(d => (
              <div
                key={d.id}
                className="p-3 rounded-lg border border-slate-100 hover:border-slate-300 bg-slate-50/50 flex items-center justify-between gap-3 transition-colors"
              >
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{d.name}</h4>
                  <p className="text-[11px] text-slate-500">{d.locationLabel} &bull; {d.roomCode}</p>
                </div>
                <button
                  onClick={() => onNavigateToDest(d.name, d.roomCode)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded text-xs font-semibold text-secondary flex items-center gap-1 shrink-0"
                >
                  <span className="material-symbols-outlined text-[15px]">directions</span>
                  <span>Route</span>
                </button>
              </div>
            ))}

            {bookmarkedDestinations.length === 0 && (
              <p className="text-xs text-slate-400 py-6 text-center">
                No bookmarked places yet. Click the bookmark icon on any campus destination.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
