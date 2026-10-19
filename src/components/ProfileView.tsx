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
  const [highContrastAR, setHighContrastAR] = useState(false);
  const [walkingPace, setWalkingPace] = useState<'normal' | 'relaxed' | 'brisk'>('normal');

  const bookmarkedDestinations = POPULAR_DESTINATIONS.filter(d => d.bookmarked);

  return (
    <div className="flex flex-col w-full px-gutter pb-12 gap-space-lg pt-3">
      {/* Student ID Card Badge */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-container text-on-primary p-5 shadow-lg border border-primary-fixed-dim/20">
        <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-secondary/20 pointer-events-none blur-2xl" />
        
        {/* Top Header of Card */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <img
              alt="SR University"
              className="h-6 w-auto object-contain brightness-200"
              src={UNIVERSITY_INFO.logoUrl}
            />
            <span className="font-title-sm text-title-sm tracking-tight text-primary-fixed font-bold">
              DIGITAL STUDENT PASS
            </span>
          </div>
          <span className="font-code-sm text-code-sm bg-secondary px-2.5 py-0.5 rounded-full text-white font-bold">
            FALL 2024
          </span>
        </div>

        {/* User Info Grid */}
        <div className="flex items-start gap-4 relative z-10">
          <img
            src={UNIVERSITY_INFO.user.avatar}
            alt={UNIVERSITY_INFO.user.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-secondary-fixed shadow-md shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h2 className="font-headline-sm text-headline-sm text-white font-bold truncate">
              {UNIVERSITY_INFO.user.name}
            </h2>
            <p className="font-label-md text-label-md text-secondary-fixed-dim font-medium">
              {UNIVERSITY_INFO.user.id}
            </p>
            <p className="font-body-sm text-body-sm text-surface-container-high mt-1 truncate">
              {UNIVERSITY_INFO.user.program}
            </p>
            <p className="font-label-sm text-label-sm text-primary-fixed-dim">
              {UNIVERSITY_INFO.user.department}
            </p>
          </div>
        </div>

        {/* Barcode Simulator for Library / Campus Turnstiles */}
        <div className="mt-4 pt-3 border-t border-primary-fixed-dim/20 flex flex-col items-center relative z-10">
          <div className="w-full h-9 bg-white/90 rounded-md flex items-center justify-center px-4 py-1 gap-1">
            {Array.from({ length: 44 }).map((_, i) => (
              <div
                key={i}
                className="h-full bg-slate-900"
                style={{ width: `${(i % 3 === 0 ? 3 : i % 2 === 0 ? 1.5 : 2.5)}px` }}
              />
            ))}
          </div>
          <span className="font-code-sm text-[11px] text-primary-fixed-dim tracking-widest mt-1">
            SRU-8841-RFID-ACTIVE • LEVEL 2 ATRIUM ACCESS
          </span>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onOpenUploadSchedule}
          className="p-3.5 rounded-xl bg-surface-container-lowest shadow-sm flex items-center gap-3 hover:bg-surface-container transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-secondary-fixed text-secondary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[20px]">calendar_month</span>
          </div>
          <div className="min-w-0">
            <p className="font-title-sm text-title-sm text-on-surface font-semibold">Schedule Sync</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant text-[12px]">v2.4 Active</p>
          </div>
        </button>

        <button
          onClick={() => onShowToast('Indoor RTLS mesh calibrated to ±1.5m accuracy')}
          className="p-3.5 rounded-xl bg-surface-container-lowest shadow-sm flex items-center gap-3 hover:bg-surface-container transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-surface-container-high text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[20px]">radar</span>
          </div>
          <div className="min-w-0">
            <p className="font-title-sm text-title-sm text-on-surface font-semibold">RTLS Beacons</p>
            <p className="font-body-sm text-body-sm text-emerald-600 font-medium text-[12px]">Online • 48 Nodes</p>
          </div>
        </button>
      </div>

      {/* Accessibility & Navigation Settings */}
      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-secondary text-[22px]">accessibility_new</span>
          <h3 className="font-title-sm text-title-sm text-on-surface font-bold">
            Accessibility &amp; Routing Preferences
          </h3>
        </div>

        <div className="space-y-3">
          {/* Toggle: Step Free Default */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low/50">
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">accessible</span>
              <div>
                <p className="font-title-sm text-title-sm text-on-surface font-semibold">Step-Free Corridors Default</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Automatically prioritizes ramps and automated elevators.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-2">
              <input
                type="checkbox"
                checked={stepFreeDefault}
                onChange={e => {
                  setStepFreeDefault(e.target.checked);
                  onShowToast(e.target.checked ? 'Step-free routing set as default' : 'Standard walking paths enabled');
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary" />
            </label>
          </div>

          {/* Toggle: Audio Navigation Cues */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low/50">
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">volume_up</span>
              <div>
                <p className="font-title-sm text-title-sm text-on-surface font-semibold">Audio Wayfinding Cues</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Chimes and spoken distance checkpoints before indoor turnings.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-2">
              <input
                type="checkbox"
                checked={audioFeedback}
                onChange={e => {
                  setAudioFeedback(e.target.checked);
                  onShowToast(e.target.checked ? 'Turn-by-turn voice active' : 'Voice navigation muted');
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary" />
            </label>
          </div>

          {/* Toggle: High-Contrast AR */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low/50">
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">contrast</span>
              <div>
                <p className="font-title-sm text-title-sm text-on-surface font-semibold">High-Contrast AR Waypoints</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Enhanced visibility floating beacons under direct glare or sun.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-2">
              <input
                type="checkbox"
                checked={highContrastAR}
                onChange={e => {
                  setHighContrastAR(e.target.checked);
                  onShowToast(e.target.checked ? 'High contrast AR active' : 'Default AR styling');
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary" />
            </label>
          </div>

          {/* Walking Pace Selector */}
          <div className="pt-2">
            <label className="block font-label-md text-label-md text-on-surface-variant mb-1.5 font-semibold">
              Walking Pace Estimate
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['relaxed', 'normal', 'brisk'] as const).map(pace => (
                <button
                  key={pace}
                  onClick={() => {
                    setWalkingPace(pace);
                    onShowToast(`Walk pace updated to ${pace}`);
                  }}
                  className={`py-2 px-1 text-center rounded-lg font-label-md text-label-md capitalize transition-all font-semibold ${
                    walkingPace === pace
                      ? 'bg-secondary text-on-secondary shadow-xs'
                      : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {pace === 'relaxed' ? 'Relaxed (3 km/h)' : pace === 'normal' ? 'Normal (4.5 km/h)' : 'Brisk (6 km/h)'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bookmarked Destinations List */}
      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">bookmarks</span>
            <h3 className="font-title-sm text-title-sm text-on-surface font-bold">Saved Places</h3>
          </div>
          <span className="font-code-sm text-code-sm text-on-surface-variant">
            {bookmarkedDestinations.length} places
          </span>
        </div>

        <div className="space-y-2.5">
          {bookmarkedDestinations.map(d => (
            <div
              key={d.id}
              className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img src={d.imageUrl} alt={d.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                <div className="truncate">
                  <p className="font-title-sm text-title-sm text-on-surface truncate font-semibold">{d.name}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant text-[12px]">{d.locationLabel}</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateToDest(d.name, d.roomCode)}
                className="px-3 py-1.5 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md shrink-0 active:scale-95 transition-transform flex items-center gap-1 font-semibold"
              >
                <span className="material-symbols-outlined text-[15px]">near_me</span>
                Go
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Campus Emergency Hotlines */}
      <div className="bg-surface-container-high rounded-xl p-4 shadow-sm flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-error text-[22px]">emergency</span>
            <span className="font-title-sm text-title-sm text-on-surface font-bold">Campus Security &amp; Safety</span>
          </div>
          <span className="font-label-sm text-label-sm text-error bg-error-container px-2 py-0.5 rounded-full font-bold">
            24/7 Rapid Response
          </span>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Emergency call boxes are located every 50 meters along campus walkways. Dial Security directly in emergencies.
        </p>
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => onShowToast('Dialing SR Campus Security: +1 (555) 019-7800')}
            className="flex-1 h-10 rounded-lg bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center gap-1.5 font-bold active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[18px]">call</span>
            Call Security (+1 555-019-7800)
          </button>
        </div>
      </div>
    </div>
  );
};
