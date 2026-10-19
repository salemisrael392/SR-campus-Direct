import React, { useState } from 'react';
import { RouteMode, FloorLevel, NavigationStep } from '../types';
import { TURN_BY_TURN_STEPS } from '../data/campusData';
import { Wayfinder3DView } from './Wayfinder3DView';
import { Floorplan2DView } from './Floorplan2DView';

interface WayfinderViewProps {
  origin?: string;
  destination?: string;
  onShowToast: (msg: string) => void;
  onStartVoiceNav: () => void;
  onOpenChatSupport: () => void;
  onCallSecurity: () => void;
}

export const WayfinderView: React.FC<WayfinderViewProps> = ({
  origin = 'Student Center Plaza (Fountain)',
  destination = 'Newton Hall • Room 204 (Level 2)',
  onShowToast,
  onStartVoiceNav,
  onOpenChatSupport,
  onCallSecurity
}) => {
  const [startPos, setStartPos] = useState(origin);
  const [destPos, setDestPos] = useState(destination);
  const [isSwapped, setIsSwapped] = useState(false);
  const [routeMode, setRouteMode] = useState<RouteMode>('fast');
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [selectedLevel, setSelectedLevel] = useState<FloorLevel>('L2');
  const [isNorthLocked, setIsNorthLocked] = useState(true);
  const [steps, setSteps] = useState<NavigationStep[]>(TURN_BY_TURN_STEPS);

  const handleSwap = () => {
    setIsSwapped(prev => !prev);
    const temp = startPos;
    setStartPos(destPos);
    setDestPos(temp);
    onShowToast('Inverted start point and destination');
  };

  const handleToggleNorth = () => {
    setIsNorthLocked(prev => !prev);
    onShowToast(isNorthLocked ? 'Compass auto-rotation unlocked' : 'Locked orientation to Geographic North');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'SR University Campus Wayfinder Route',
        text: `Walking route to ${destPos} (4 min walk)`
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      onShowToast('Route link copied to clipboard!');
    }
  };

  return (
    <div className="flex flex-col w-full px-gutter pb-8 gap-space-lg">
      {/* Wayfinder Header Strip & Compass Branding */}
      <div className="flex items-center justify-between pt-space-sm">
        <div className="flex items-center gap-space-sm">
          <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-secondary shadow-sm">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              explore
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-title-sm text-title-sm text-on-surface tracking-tight font-semibold">
              Indoor &amp; Campus Navigator
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Campus RTLS High Precision GPS Active
            </span>
          </div>
        </div>

        <button
          onClick={handleToggleNorth}
          aria-label="Calibrate Compass"
          className="flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-container-lowest text-secondary shadow-sm hover:bg-surface-container transition-all active:scale-95 font-semibold"
          id="toggleCompassBtn"
        >
          <span className={`material-symbols-outlined text-[16px] transition-transform ${isNorthLocked ? 'text-secondary' : 'rotate-45'}`}>
            navigation
          </span>
          <span className="font-label-sm text-label-sm">
            {isNorthLocked ? 'Live North' : 'Heading'}
          </span>
        </button>
      </div>

      {/* Origin & Destination Planner Box */}
      <div className="relative bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
        <div className="flex flex-col gap-space-sm">
          {/* Origin Field */}
          <div className="flex items-center gap-space-md p-space-sm rounded-lg bg-surface-container-low transition-colors">
            <div className="flex flex-col items-center justify-center shrink-0 w-6">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-secondary" />
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-wider font-semibold">
                Start Position
              </span>
              <span className="font-title-sm text-title-sm text-on-surface truncate block font-bold">
                {startPos}
              </span>
            </div>
            <button
              onClick={() => onShowToast('Locked to current live GPS beacon')}
              className="shrink-0 text-secondary p-1 rounded-full hover:bg-surface-container-high transition-colors"
              title="Use Precise Pin"
            >
              <span className="material-symbols-outlined text-[18px]">my_location</span>
            </button>
          </div>

          {/* Connecting Node Line & Invert Button */}
          <div className="relative flex items-center justify-center -my-2.5 z-10">
            <div className="w-full flex items-center px-4">
              <div className="h-4 w-0.5 bg-secondary/30 ml-2" />
            </div>
            <button
              onClick={handleSwap}
              aria-label="Invert Route"
              className={`absolute right-4 w-7 h-7 rounded-full bg-surface-container text-on-surface-variant shadow-sm flex items-center justify-center active:scale-90 transition-transform ${
                isSwapped ? 'rotate-180 text-secondary' : ''
              }`}
              id="swapBtn"
            >
              <span className="material-symbols-outlined text-[16px]">swap_vert</span>
            </button>
          </div>

          {/* Destination Field */}
          <div className="flex items-center gap-space-md p-space-sm rounded-lg bg-surface-container-low">
            <div className="flex items-center justify-center shrink-0 w-6 text-error">
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                location_on
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-wider font-semibold">
                Destination
              </span>
              <span className="font-title-sm text-title-sm text-on-surface truncate block font-bold">
                {destPos}
              </span>
            </div>
            <span className="shrink-0 px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-code-sm text-code-sm font-semibold">
              ENG WING
            </span>
          </div>
        </div>

        {/* Route Profile Selector Pills */}
        <div className="mt-space-md pt-space-xs flex items-center gap-space-xs overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              setRouteMode('fast');
              onShowToast('Route profile: Fastest walk path (320m)');
            }}
            className={`route-tab px-space-md py-1.5 rounded-full font-label-md text-label-md flex items-center gap-1.5 shrink-0 shadow-sm transition-all ${
              routeMode === 'fast'
                ? 'bg-primary text-on-primary font-bold'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">directions_walk</span>
            <span>Fastest (4m)</span>
          </button>

          <button
            onClick={() => {
              setRouteMode('sheltered');
              onShowToast('Route profile: Covered canopy walk during rain/sun (360m, 5m)');
            }}
            className={`route-tab px-space-md py-1.5 rounded-full font-label-md text-label-md flex items-center gap-1.5 shrink-0 transition-all ${
              routeMode === 'sheltered'
                ? 'bg-primary text-on-primary font-bold shadow-sm'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">umbrella</span>
            <span>Covered Path</span>
          </button>

          <button
            onClick={() => {
              setRouteMode('accessible');
              onShowToast('Route profile: Step-Free ramp & elevator navigation enabled');
            }}
            className={`route-tab px-space-md py-1.5 rounded-full font-label-md text-label-md flex items-center gap-1.5 shrink-0 transition-all ${
              routeMode === 'accessible'
                ? 'bg-primary text-on-primary font-bold shadow-sm'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">accessible</span>
            <span>Step-Free Elevator</span>
          </button>
        </div>
      </div>

      {/* Live Navigation Active Summary Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary-container to-primary text-on-primary p-space-md shadow-md">
        <div className="flex items-start justify-between relative z-10">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                Optimized
              </span>
              <span className="font-label-sm text-label-sm text-on-primary-container">Depart in 1m</span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-headline-md text-headline-md tracking-tight font-bold">
                {routeMode === 'sheltered' ? '5 min' : '4 min'}
              </span>
              <span className="font-body-md text-body-md text-on-primary-container">
                • {routeMode === 'sheltered' ? '360' : '320'} meters walk
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-primary-fixed mt-0.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-tertiary-fixed-dim">schedule</span>
              Target arrival:{' '}
              <span className="font-title-sm text-title-sm text-on-primary font-bold">9:55 AM</span> (5 min before CS201)
            </p>
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className="w-12 h-12 rounded-full bg-surface-container-lowest/10 backdrop-blur-md flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined text-[28px] animate-bounce">arrow_upward</span>
            </div>
            <span className="font-label-sm text-label-sm text-primary-fixed-dim">Next: 120m</span>
          </div>
        </div>

        {/* Ambient university seal compass watermark */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10 pointer-events-none text-on-primary">
          <svg className="w-full h-full fill-current" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" />
            <polygon points="50,15 57,43 85,50 57,57 50,85 43,57 15,50 43,43" />
          </svg>
        </div>
      </div>

      {/* Interactive 3D / AR Navigation & Floorplan View Container */}
      <div className="flex flex-col gap-space-xs">
        {/* View Mode & Floor Selector Bar */}
        <div className="flex items-center justify-between gap-1 flex-wrap">
          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-surface-container-high rounded-lg p-0.5">
            <button
              onClick={() => {
                setViewMode('3d');
                onShowToast('Switched to 3D AR Wayfinder view');
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-label-sm text-label-sm font-bold transition-all ${
                viewMode === '3d'
                  ? 'bg-secondary text-on-secondary shadow-sm'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">view_in_ar</span>
              <span>3D AR View</span>
            </button>
            <button
              onClick={() => {
                setViewMode('2d');
                onShowToast('Switched to 2D Architectural Floorplan');
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-label-sm text-label-sm font-bold transition-all ${
                viewMode === '2d'
                  ? 'bg-secondary text-on-secondary shadow-sm'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">map</span>
              <span>Floorplan 2D</span>
            </button>
          </div>

          {/* Floor Level Selector */}
          <div className="flex items-center gap-1 bg-surface-container-high rounded-lg p-0.5">
            {(['Level 1', 'Level 2', 'Level 3'] as const).map(lvl => {
              const code: FloorLevel = lvl === 'Level 1' ? 'L1' : lvl === 'Level 2' ? 'L2' : 'L3';
              const isSelected = selectedLevel === code;
              return (
                <button
                  key={lvl}
                  onClick={() => {
                    setSelectedLevel(code);
                    onShowToast(`Viewing ${lvl} map layer`);
                  }}
                  className={`px-2 py-0.5 rounded font-label-sm text-label-sm transition-colors ${
                    isSelected
                      ? 'bg-surface-container-lowest text-secondary shadow-sm font-bold'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {lvl}
                </button>
              );
            })}
          </div>
        </div>

        {/* View Section */}
        {viewMode === '3d' ? (
          <Wayfinder3DView destinationLabel="Room 204" remainingDistance="45m left" />
        ) : (
          <Floorplan2DView currentLevel={selectedLevel} onSelectLevel={setSelectedLevel} />
        )}
      </div>

      {/* Turn-by-Turn Route Guidance Card List */}
      <div className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <span className="font-title-sm text-title-sm text-on-surface font-semibold">Step-by-Step Directions</span>
          <span className="font-label-sm text-label-sm text-secondary font-semibold">
            {steps.length} checkpoints
          </span>
        </div>

        {/* Step 1: Active Step */}
        <div className="flex items-start gap-space-md p-space-md rounded-xl bg-surface-container-lowest shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary" />
          <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <span className="material-symbols-outlined text-[18px]">straight</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-label-sm text-label-sm text-secondary uppercase font-bold tracking-wider">
                Step 1 • Ongoing
              </span>
              <span className="font-code-sm text-code-sm text-on-surface-variant font-medium">120 meters</span>
            </div>
            <p className="font-title-sm text-title-sm text-on-surface mt-0.5 font-semibold">
              Head North past the Clock Tower
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Walk across the main stone walkway towards the Academic Quad garden archway.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-start gap-space-md p-space-md rounded-xl bg-surface-container-lowest shadow-sm">
          <div className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[18px]">turn_right</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                Step 2
              </span>
              <span className="font-code-sm text-code-sm text-on-surface-variant">60 meters</span>
            </div>
            <p className="font-title-sm text-title-sm text-on-surface mt-0.5 font-semibold">
              Enter Newton Hall North Wing
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Proceed through the automatic sliding glass doors into the main atrium.
            </p>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-[14px]">door_front</span>
                North Air-Lock Doors
              </span>
            </div>
          </div>
        </div>

        {/* Step 3: Indoor Vertical Transition */}
        <div className="flex items-start gap-space-md p-space-md rounded-xl bg-surface-container-lowest shadow-sm">
          <div className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[18px]">stairs</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                Step 3 • Indoor Floor Change
              </span>
              <span className="font-code-sm text-code-sm text-secondary font-bold">To Level 2</span>
            </div>
            <p className="font-title-sm text-title-sm text-on-surface mt-0.5 font-semibold">
              Ascend Staircase B or Central Elevator
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Located immediately behind the Atrium Coffee Kiosk. Exit stairs onto the Level 2 breezeway.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-code-sm text-code-sm font-semibold">
                <span className="material-symbols-outlined text-[13px]">elevator</span>
                Elevator B Accessible
              </span>
            </div>
          </div>
        </div>

        {/* Step 4: Arrival */}
        <div className="flex items-start gap-space-md p-space-md rounded-xl bg-surface-container-lowest shadow-sm">
          <div className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[18px]">turn_left</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                Step 4 • Arrival
              </span>
              <span className="font-code-sm text-code-sm text-on-surface-variant">30 meters</span>
            </div>
            <p className="font-title-sm text-title-sm text-on-surface mt-0.5 font-semibold">Corridor to Room 204</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Turn left down the math &amp; computing wing. Room 204 is on the right-hand side directly adjacent to Robotics Lab 202.
            </p>

            {/* Photo Preview for visual landmark */}
            <div className="mt-2.5 flex items-center gap-2.5 p-2 rounded-lg bg-surface-container-low border border-surface-container-high/50">
              <img
                className="w-14 h-14 rounded-md object-cover shrink-0"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDif131rnoqJ-40fta5IVdrFmqx7g7yFqHdyFLnw0zY4DHFEWgytbKDM7Jy4GoniVNnk-92ul6UskNxOP5ePZGmcWVcLiafan1MFfgLYDbs6oyk150hHCEiC5NEy-aSVhFQAP1nX1mqltLeCG3V550OYZxuLA5mpEV-_p5XKru4ZemOB8Hwgk-Y5j99VrOv0pfrIpzeTbR5xfYuUBkpjKTRry9pKTs-p_2pReIUjRMnnEf10YXzlnoV"
                alt="Room 204 entrance"
              />
              <div className="flex flex-col min-w-0">
                <span className="font-label-sm text-label-sm text-primary font-bold truncate">
                  Room 204 Entrance Visual
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant text-[12px] line-clamp-1">
                  Look for the blue door placard with braille index.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Campus Wayfinding Assistance & Security Callout */}
      <div className="p-space-md rounded-xl bg-surface-container-high flex flex-col gap-space-sm shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-surface-container-lowest text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">support_agent</span>
            </div>
            <span className="font-title-sm text-title-sm text-on-surface font-semibold">
              Need Help Finding Your Class?
            </span>
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">24/7 Desk</span>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          First week on campus? Information ambassadors in blue vests are stationed at Newton Quad. You can also contact campus security directly.
        </p>
        <div className="grid grid-cols-2 gap-space-sm pt-space-xs">
          <button
            onClick={onOpenChatSupport}
            className="flex items-center justify-center gap-1.5 h-10 px-space-sm rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container shadow-sm active:scale-98 transition-all font-semibold"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">chat</span>
            <span className="font-label-md text-label-md">Info Desk Chat</span>
          </button>
          <button
            onClick={onCallSecurity}
            className="flex items-center justify-center gap-1.5 h-10 px-space-sm rounded-lg bg-primary text-on-primary hover:bg-primary-container shadow-sm active:scale-98 transition-all font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">call</span>
            <span className="font-label-md text-label-md">Call Security</span>
          </button>
        </div>
      </div>

      {/* Action Bar: Recenter & Finish */}
      <div className="flex items-center gap-space-sm pt-space-xs">
        <button
          onClick={onStartVoiceNav}
          className="flex-1 h-12 rounded-xl bg-secondary text-on-secondary font-label-lg text-label-lg flex items-center justify-center gap-2 shadow-md hover:bg-secondary-container active:scale-98 transition-all font-bold"
        >
          <span className="material-symbols-outlined text-[20px]">play_arrow</span>
          <span>Start Turn-by-Turn Voice</span>
        </button>
        <button
          onClick={handleShare}
          aria-label="Share Route"
          className="w-12 h-12 rounded-xl bg-surface-container-lowest text-on-surface-variant flex items-center justify-center shadow-sm hover:text-primary active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">share</span>
        </button>
      </div>
    </div>
  );
};
