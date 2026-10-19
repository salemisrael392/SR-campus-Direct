import React, { useState } from 'react';
import { FloorLevel } from '../types';

interface Floorplan2DViewProps {
  currentLevel?: FloorLevel;
  onSelectLevel?: (level: FloorLevel) => void;
}

export const Floorplan2DView: React.FC<Floorplan2DViewProps> = ({
  currentLevel = 'L2',
  onSelectLevel
}) => {
  const [activeFloor, setActiveFloor] = useState<FloorLevel>(currentLevel);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleLevelChange = (lvl: FloorLevel) => {
    setActiveFloor(lvl);
    if (onSelectLevel) onSelectLevel(lvl);
  };

  return (
    <div
      className={`relative w-full rounded-2xl bg-surface-container-low overflow-hidden shadow-sm flex flex-col justify-between p-4 transition-all ${
        isFullscreen ? 'h-96' : 'h-72'
      }`}
    >
      {/* SVG Architectural Blueprint */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 360 220">
        <defs>
          <pattern id="fpGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" opacity="0.6" stroke="#dae2fd" strokeWidth="0.7" />
          </pattern>
          <linearGradient id="routeGradient2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#316bf3" />
            <stop offset="100%" stopColor="#001428" />
          </linearGradient>
          <filter id="shadowGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#316bf3" floodOpacity="0.4" />
          </filter>
        </defs>

        <rect width="100%" height="100%" fill="url(#fpGrid)" />

        {/* Outer Hall Perimeter */}
        <path d="M 18,22 L 342,22 L 342,198 L 18,198 Z" fill="#faf8ff" stroke="#c3c6ce" strokeWidth="1.5" />

        {/* Main Corridors */}
        <rect x="65" y="38" width="230" height="34" rx="4" fill="#eaedff" />
        <rect x="135" y="72" width="45" height="120" rx="4" fill="#eaedff" />
        <rect x="250" y="72" width="45" height="120" rx="4" fill="#eaedff" />

        {/* Stair B */}
        <rect x="24" y="80" width="55" height="105" rx="4" fill="#f2f3ff" stroke="#dae2fd" strokeWidth="1" />
        <text x="32" y="125" className="font-code-sm text-[11px] fill-on-surface-variant font-semibold">
          Stair B
        </text>
        <line x1="28" y1="135" x2="70" y2="135" stroke="#c3c6ce" strokeDasharray="3 3" />
        <line x1="28" y1="145" x2="70" y2="145" stroke="#c3c6ce" strokeDasharray="3 3" />

        {/* Central Elevator */}
        <rect x="85" y="80" width="46" height="105" rx="4" fill="#f2f3ff" stroke="#dae2fd" strokeWidth="1" />
        <text x="90" y="125" className="font-code-sm text-[11px] fill-on-surface-variant font-semibold">
          Elevator
        </text>
        <circle cx="108" cy="148" r="8" fill="#dbe1ff" />
        <path d="M 104,148 L 112,148 M 108,144 L 108,152" stroke="#0051d5" strokeWidth="1.5" />

        {/* Lab 202 */}
        <rect x="185" y="80" width="60" height="105" rx="4" fill="#e2e7ff" stroke="#dae2fd" strokeWidth="1" />
        <text x="192" y="125" className="font-code-sm text-[11px] fill-on-surface-variant font-semibold">
          Lab 202
        </text>
        <text x="190" y="142" className="font-label-sm text-[9px] fill-on-surface-variant">
          Robotics Lab
        </text>

        {/* Target Room 204 */}
        <rect
          x="300"
          y="80"
          width="40"
          height="105"
          rx="6"
          fill="#d1e4ff"
          stroke="#0051d5"
          strokeWidth="2.5"
          filter="url(#shadowGlow)"
        />
        <text x="304" y="120" className="font-title-sm text-[11px] fill-primary font-bold">
          204
        </text>
        <text x="304" y="136" className="font-code-sm text-[8px] fill-secondary font-bold">
          Lecture
        </text>

        {/* Animated Guided Route Path */}
        <path
          d="M 52,90 L 52,55 L 320,55 L 320,90"
          fill="none"
          stroke="url(#routeGradient2)"
          strokeWidth="4"
          strokeDasharray="8,5"
          strokeLinecap="round"
        >
          <animate attributeName="stroke-dashoffset" values="39;0" dur="1.4s" repeatCount="indefinite" />
        </path>

        {/* User Beacon */}
        <circle cx="52" cy="90" r="7" fill="#316bf3">
          <animate attributeName="r" values="5;9;5" dur="1.8s" repeatCount="indefinite" />
        </circle>
        <circle cx="52" cy="90" r="3" fill="#ffffff" />

        {/* Destination Target Pin */}
        <circle cx="320" cy="90" r="6" fill="#ba1a1a" />
        <circle cx="320" cy="90" r="2" fill="#ffffff" />
      </svg>

      {/* Floating Badges Header */}
      <div className="relative z-10 flex items-center justify-between w-full">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container-lowest/95 backdrop-blur-md shadow-sm font-label-sm text-label-sm text-primary">
          <span className="material-symbols-outlined text-[15px] text-secondary">wifi_find</span>
          Indoor Beacon: Newton-L2-Core
        </span>
        <button
          onClick={() => setIsFullscreen(prev => !prev)}
          aria-label="Expand Blueprint"
          className="w-7 h-7 rounded-full bg-surface-container-lowest text-primary shadow flex items-center justify-center hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">
            {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
          </span>
        </button>
      </div>

      {/* Floating Badges Footer */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container-lowest/90 px-2.5 py-1 rounded-md shadow-xs">
          Floor Elevation: +4.2m
        </span>
        <span className="font-label-sm text-label-sm text-secondary bg-secondary-fixed px-3 py-1 rounded-full font-bold shadow-xs">
          Inside Hallway 2B
        </span>
      </div>
    </div>
  );
};
