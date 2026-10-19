import React, { useState } from 'react';
import { Destination } from '../types';
import { POPULAR_DESTINATIONS, UNIVERSITY_INFO } from '../data/campusData';

interface ExploreViewProps {
  onNavigateTo: (destName: string, roomCode?: string) => void;
  onShowToast: (msg: string) => void;
  onOpenAccessibilitySettings?: () => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  onNavigateTo,
  onShowToast,
  onOpenAccessibilitySettings
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFloor, setSelectedFloor] = useState<'Outdoor' | 'L1' | 'L2'>('Outdoor');
  const [mapDisplayMode, setMapDisplayMode] = useState<'2.5d' | 'google_maps'>('2.5d');
  const [destinations, setDestinations] = useState<Destination[]>(POPULAR_DESTINATIONS);
  const [isCentered, setIsCentered] = useState(true);
  const [showWebSyncModal, setShowWebSyncModal] = useState(false);
  const [isSyncingWeb, setIsSyncingWeb] = useState(false);

  const categories = [
    { id: 'all', label: 'All Places', icon: 'explore' },
    { id: 'hall', label: 'Academic Blocks', icon: 'domain' },
    { id: 'library', label: 'Central Library', icon: 'local_library' },
    { id: 'dining', label: 'Dining & Quads', icon: 'restaurant' },
    { id: 'admin', label: 'Main Entrance & Admin', icon: 'badge' },
    { id: 'lab', label: 'SRiX & Tech Labs', icon: 'biotech' }
  ];

  const handleToggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDestinations(prev =>
      prev.map(dest => {
        if (dest.id === id) {
          const nextState = !dest.bookmarked;
          onShowToast(nextState ? `Saved ${dest.name} to bookmarks` : `Removed ${dest.name}`);
          return { ...dest, bookmarked: nextState };
        }
        return dest;
      })
    );
  };

  const handleSyncFromWebsite = () => {
    setIsSyncingWeb(true);
    setTimeout(() => {
      setIsSyncingWeb(false);
      onShowToast('Synced verified data from sru.edu.in & Google Maps!');
    }, 900);
  };

  const filteredDestinations = destinations.filter(dest => {
    const matchesSearch =
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.locationLabel.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || dest.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex flex-col w-full pb-6 space-y-4">
      {/* Official School Entrance Gate Hero Card */}
      <div className="px-gutter pt-2">
        <div className="relative overflow-hidden rounded-2xl shadow-md border border-surface-container-high group bg-surface-container-lowest">
          <div className="relative h-48 w-full overflow-hidden bg-slate-900">
            <img
              src={UNIVERSITY_INFO.entranceGateUrl}
              alt="SR University Official Campus Entrance Gate"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent" />

            {/* Top Badges over Entrance Image */}
            <div className="absolute top-3 inset-x-3 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-primary font-label-sm text-label-sm font-bold shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Main Campus Entrance • Gate 1
              </span>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('SR University, Ananthasagar, Hasanparthy, Warangal')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary text-white font-label-sm text-label-sm font-bold shadow-md active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[14px]">map</span>
                Google Maps
              </a>
            </div>

            {/* Bottom Caption on Entrance Image */}
            <div className="absolute bottom-3 inset-x-3 text-white">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-title-sm text-title-sm font-bold text-white drop-shadow">
                  SR University Campus
                </span>
                <span className="px-2 py-0.5 rounded bg-white/20 backdrop-blur-md text-[11px] font-code-sm font-semibold">
                  170 Acres
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-surface-container-high text-[12px] line-clamp-1 drop-shadow">
                {UNIVERSITY_INFO.address}
              </p>
            </div>
          </div>

          {/* Quick Info & Direct Web Handshake Bar */}
          <div className="p-3 bg-surface-container-lowest flex items-center justify-between border-t border-surface-container-high/60 gap-2">
            <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm truncate">
              <span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
              <span className="truncate">Official Website: <strong className="text-primary">sru.edu.in</strong></span>
            </div>
            <button
              onClick={handleSyncFromWebsite}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-high text-primary hover:bg-surface-container-highest transition-colors font-label-sm text-label-sm font-bold shrink-0 active:scale-95"
            >
              <span className={`material-symbols-outlined text-[16px] text-secondary ${isSyncingWeb ? 'animate-spin' : ''}`}>
                cloud_sync
              </span>
              Pull Web Info
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Search & Filters Area */}
      <div className="px-gutter space-y-3">
        {/* Search Bar */}
        <div className="relative w-full shadow-sm rounded-xl">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </div>
          <input
            id="campusSearchInput"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search SREC, CS Pavilion, Library, SRiX, Hostels..."
            className="w-full h-12 pl-10 pr-10 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-xl outline-none placeholder:text-on-surface-variant/60 focus:bg-surface-container-low transition-all"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-on-surface-variant hover:text-secondary transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          ) : (
            <button
              onClick={() => onShowToast('Listening for campus search query...')}
              aria-label="Voice or barcode search"
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-on-surface-variant hover:text-secondary transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">mic</span>
            </button>
          )}
        </div>

        {/* Quick Categorical Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-gutter px-gutter py-1">
          {categories.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  onShowToast(`Filtering for ${cat.label}`);
                }}
                className={`filter-chip inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label-md text-label-md shrink-0 transition-transform active:scale-95 shadow-sm ${
                  isSelected
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Next Class Urgent Navigator Banner */}
      <div className="px-gutter">
        <div className="relative overflow-hidden bg-primary text-on-primary rounded-xl p-4 shadow-md">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-secondary/20 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <span className="material-symbols-outlined text-on-secondary text-[22px]">timer</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                    In 24 mins
                  </span>
                  <span className="font-label-sm text-label-sm text-secondary-fixed-dim flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[14px]">directions_walk</span> 4 min walk
                  </span>
                </div>
                <h3 className="font-title-sm text-title-sm text-on-primary mt-1 font-bold">
                  Data Structures &amp; Algorithms
                </h3>
                <p className="font-body-sm text-body-sm text-primary-fixed-dim flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[15px]">meeting_room</span>
                  CS &amp; AI Central Pavilion • Room 204 (Level 2)
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-primary-fixed-dim/15 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-primary-fixed-dim font-label-sm text-label-sm">
              <span className="w-2 h-2 rounded-full bg-secondary-fixed-dim animate-ping inline-block mr-1" />
              Room unlocked &amp; quiet
            </div>
            <button
              onClick={() => onNavigateTo('CS & AI Central Pavilion • Room 204', 'Room 204')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md hover:bg-secondary-container transition-all active:scale-95 shadow-sm font-bold"
              id="directMeBtn"
            >
              <span className="material-symbols-outlined text-[17px]">near_me</span>
              Direct Me There
            </button>
          </div>
        </div>
      </div>

      {/* Map Mode Selector Strip */}
      <div className="px-gutter flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-secondary text-[20px]">share_location</span>
          <span className="font-title-sm text-title-sm text-on-surface font-bold">
            Interactive Campus Environment
          </span>
        </div>
        <div className="flex items-center gap-1 bg-surface-container-high rounded-lg p-0.5">
          <button
            onClick={() => {
              setMapDisplayMode('2.5d');
              onShowToast('Switched to 2.5D Isometric Architectural Map');
            }}
            className={`px-2.5 py-1 rounded font-label-sm text-label-sm font-bold transition-all ${
              mapDisplayMode === '2.5d'
                ? 'bg-secondary text-on-secondary shadow-sm'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            2.5D Campus
          </button>
          <button
            onClick={() => {
              setMapDisplayMode('google_maps');
              onShowToast('Switched to Live Google Maps Satellite & Geodata');
            }}
            className={`px-2.5 py-1 rounded font-label-sm text-label-sm font-bold transition-all ${
              mapDisplayMode === 'google_maps'
                ? 'bg-secondary text-on-secondary shadow-sm'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Google Maps
          </button>
        </div>
      </div>

      {/* Interactive Campus Map Container: 2.5D or Live Google Maps */}
      <div className="px-gutter">
        {mapDisplayMode === 'google_maps' ? (
          <div className="relative w-full h-[320px] rounded-2xl overflow-hidden shadow-md border border-surface-container-high bg-slate-900 flex flex-col justify-between">
            {/* Embedded Google Maps View centered on SR University */}
            <iframe
              title="SR University Google Maps View"
              className="w-full h-full border-0 absolute inset-0"
              src="https://maps.google.com/maps?q=SR%20University,%20Ananthasagar,%20Hasanparthy,%20Warangal&t=k&z=17&ie=UTF8&iwloc=&output=embed"
              allowFullScreen={false}
              loading="lazy"
            />

            {/* Floating Telemetry Overlay */}
            <div className="relative z-10 p-3 flex items-start justify-between pointer-events-none">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md text-white font-label-sm text-label-sm shadow-md pointer-events-auto">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>18.0418° N, 79.5788° E</span>
              </span>
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=18.041775,79.578781"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 rounded-full bg-secondary text-white font-label-sm text-label-sm font-bold shadow-md hover:bg-secondary-container pointer-events-auto flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">directions</span>
                Get Directions
              </a>
            </div>

            {/* Bottom Floating Address Bar */}
            <div className="relative z-10 p-2.5 m-2 rounded-xl bg-slate-950/90 backdrop-blur-md text-white shadow-lg pointer-events-auto flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <p className="font-title-sm text-title-sm font-bold text-white truncate">
                  SR University Main Campus
                </p>
                <p className="font-code-sm text-[11px] text-slate-300 truncate">
                  Ananthasagar, Hasanparthy, Warangal 506371
                </p>
              </div>
              <button
                onClick={() => onShowToast('Coordinates verified with campus RTLS mesh')}
                className="px-2 py-1 rounded bg-secondary text-white font-code-sm text-[11px] font-bold shrink-0"
              >
                Verified
              </button>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-[320px] rounded-2xl bg-surface-container-high overflow-hidden shadow-md select-none group">
            {/* 2.5D Architectural Isometric Map Canvas Background */}
            <svg
              className="absolute inset-0 w-full h-full object-cover"
              viewBox="0 0 400 320"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="lawnGrad" x1="0" y1="0" x2="400" y2="320" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#E2EDDF" />
                  <stop offset="1" stopColor="#D5E5D1" />
                </linearGradient>
                <linearGradient id="paveGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop stopColor="#EAEDF6" />
                  <stop offset="1" stopColor="#DDE2EF" />
                </linearGradient>
                <filter id="bldgShadow" x="-10%" y="-10%" width="130%" height="130%">
                  <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#0f2942" floodOpacity="0.14" />
                </filter>
              </defs>

              {/* Base ground lawn */}
              <rect width="400" height="320" fill="url(#lawnGrad)" />

              {/* Campus Pathways / Plazas */}
              <path
                d="M 0 170 Q 120 150 180 180 T 400 200"
                fill="none"
                stroke="url(#paveGrad)"
                strokeWidth="32"
                strokeLinecap="round"
              />
              <path
                d="M 190 0 Q 185 110 185 185 T 220 320"
                fill="none"
                stroke="url(#paveGrad)"
                strokeWidth="26"
                strokeLinecap="round"
              />
              <path
                d="M 185 180 L 330 90"
                fill="none"
                stroke="url(#paveGrad)"
                strokeWidth="20"
                strokeLinecap="round"
              />
              <circle cx="185" cy="180" r="32" fill="#E2E7FF" opacity="0.9" />

              {/* Pathway navigation dash line (Active Route to CS Pavilion) */}
              <path
                id="routePath"
                d="M 185 180 C 185 130, 240 100, 310 75"
                fill="none"
                stroke="#0051d5"
                strokeWidth="3.5"
                strokeDasharray="6 6"
              >
                <animate attributeName="stroke-dashoffset" values="24;0" dur="1.2s" repeatCount="indefinite" />
              </path>

              {/* Tree clusters & foliage */}
              <g fill="#A9CCA2" opacity="0.85">
                <circle cx="85" cy="220" r="10" />
                <circle cx="98" cy="214" r="8" />
                <circle cx="106" cy="224" r="11" />
                <circle cx="260" cy="235" r="9" />
                <circle cx="272" cy="242" r="11" />
                <circle cx="340" cy="190" r="12" />
                <circle cx="355" cy="198" r="9" />
                <circle cx="130" cy="80" r="9" />
                <circle cx="142" cy="74" r="7" />
              </g>

              {/* Building 1: SREC Engineering Academic Block */}
              <g filter="url(#bldgShadow)" className="cursor-pointer" onClick={() => onNavigateTo('SREC Main Academic Block', 'SREC-101')}>
                <path d="M 40 70 L 95 40 L 140 65 L 85 95 Z" fill="#CBD5E1" />
                <path d="M 40 70 L 85 95 L 85 130 L 40 105 Z" fill="#94A3B8" />
                <path d="M 85 95 L 140 65 L 140 100 L 85 130 Z" fill="#64748B" />
                <polygon points="50,70 95,46 130,66 85,90" fill="#E2E8F0" />
                <line x1="60" y1="73" x2="82" y2="86" stroke="#94A3B8" strokeWidth="2" />
                <line x1="72" y1="67" x2="94" y2="80" stroke="#94A3B8" strokeWidth="2" />
              </g>

              {/* Building 2: CS & AI Central Pavilion (Destination) */}
              <g filter="url(#bldgShadow)" className="cursor-pointer" onClick={() => onNavigateTo('CS & AI Central Pavilion • Room 204', 'Room 204')}>
                <path d="M 270 55 L 325 25 L 365 48 L 310 78 Z" fill="#316BF3" />
                <path d="M 270 55 L 310 78 L 310 115 L 270 92 Z" fill="#0051D5" />
                <path d="M 310 78 L 365 48 L 365 85 L 310 115 Z" fill="#0F2942" />
                <polygon points="278,56 324,31 356,49 310,74" fill="#DBE1FF" />
                <rect x="294" y="52" width="22" height="10" fill="#7BD0FF" opacity="0.8" transform="skewY(-16)" />
              </g>

              {/* Building 3: Central Library & Amphitheater */}
              <g filter="url(#bldgShadow)" className="cursor-pointer" onClick={() => onNavigateTo('Central University Library', 'LIB-MAIN')}>
                <path d="M 50 210 L 115 180 L 160 205 L 95 235 Z" fill="#CBD5E1" />
                <path d="M 50 210 L 95 235 L 95 268 L 50 243 Z" fill="#94A3B8" />
                <path d="M 95 235 L 160 205 L 160 238 L 95 268 Z" fill="#475569" />
                <polygon points="60,212 115,186 150,206 95,232" fill="#F1F5F9" />
              </g>

              {/* Building 4: SRiX Technology Incubator & Sports Stadium */}
              <g filter="url(#bldgShadow)" className="cursor-pointer" onClick={() => onNavigateTo('SRiX Technology Business Incubator', 'SRIX-HUB')}>
                <path d="M 260 220 L 320 188 L 370 215 L 310 248 Z" fill="#CBD5E1" />
                <path d="M 260 220 L 310 248 L 310 282 L 260 254 Z" fill="#94A3B8" />
                <path d="M 310 248 L 370 215 L 370 249 L 310 282 Z" fill="#334155" />
                <polygon points="270,222 320,195 360,217 310,244" fill="#E2E8F0" />
              </g>
            </svg>

            {/* Pin Overlay 1: Current User Location */}
            <div className="absolute left-[185px] top-[180px] -translate-x-1/2 -translate-y-full flex flex-col items-center pointer-events-none z-20">
              <div className="px-2 py-0.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm shadow-md whitespace-nowrap mb-1">
                You are here (Gate 1 Quad)
              </div>
              <div className="relative flex items-center justify-center">
                <span className="absolute w-7 h-7 rounded-full bg-secondary/30 animate-ping" />
                <div className="w-6 h-6 rounded-full bg-secondary border-2 border-surface-container-lowest flex items-center justify-center shadow-md text-on-secondary">
                  <span className="material-symbols-outlined text-[14px]">my_location</span>
                </div>
              </div>
            </div>

            {/* Pin Overlay 2: CS Pavilion Destination */}
            <button
              onClick={() => onNavigateTo('CS & AI Central Pavilion • Room 204', 'Room 204')}
              className="absolute left-[315px] top-[72px] -translate-x-1/2 -translate-y-full flex flex-col items-center z-20 cursor-pointer group-hover:scale-105 transition-transform"
            >
              <div className="px-2.5 py-1 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm shadow-lg whitespace-nowrap flex items-center gap-1 mb-1 font-semibold">
                <span className="material-symbols-outlined text-[13px]">school</span>
                <span>CS Pavilion • 3 min</span>
              </div>
              <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg border-2 border-secondary-fixed">
                <span className="material-symbols-outlined text-[15px]">location_on</span>
              </div>
            </button>

            {/* Pin Overlay 3: SREC Block */}
            <button
              onClick={() => onNavigateTo('SREC Main Academic Block', 'SREC-101')}
              className="absolute left-[88px] top-[90px] -translate-x-1/2 -translate-y-full flex flex-col items-center z-10 cursor-pointer"
            >
              <div className="px-2 py-0.5 rounded-md bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface font-label-sm text-label-sm shadow whitespace-nowrap mb-1 font-semibold">
                SREC Block • 4m
              </div>
              <div className="w-5 h-5 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center shadow">
                <span className="material-symbols-outlined text-[13px]">domain</span>
              </div>
            </button>

            {/* Pin Overlay 4: SRiX Hub */}
            <button
              onClick={() => onNavigateTo('SRiX Technology Business Incubator', 'SRIX-HUB')}
              className="absolute left-[310px] top-[240px] -translate-x-1/2 -translate-y-full flex flex-col items-center z-10 cursor-pointer"
            >
              <div className="px-2 py-0.5 rounded-md bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface font-label-sm text-label-sm shadow whitespace-nowrap mb-1 font-semibold">
                SRiX Hub • 6m
              </div>
              <div className="w-5 h-5 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center shadow">
                <span className="material-symbols-outlined text-[13px]">precision_manufacturing</span>
              </div>
            </button>

            {/* Map Floating Overlay Controls */}
            <div className="absolute top-3 left-3 z-30">
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-lowest/95 backdrop-blur-md text-on-surface font-label-sm text-label-sm shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>RTLS Active • ±2m Accuracy</span>
              </div>
            </div>

            <div className="absolute bottom-3 right-3 z-30 flex flex-col gap-1.5">
              <button
                onClick={() => {
                  setIsCentered(true);
                  onShowToast('Centered on Campus Central Plaza');
                }}
                aria-label="Recenter Map"
                className="w-10 h-10 rounded-xl bg-surface-container-lowest text-on-surface flex items-center justify-center shadow-md hover:bg-surface-container-high transition-transform active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px]">near_me</span>
              </button>
              <button
                onClick={() => onShowToast('Toggled Campus Layers: Elevated Skybridges & Shuttles')}
                aria-label="Map Layers"
                className="w-10 h-10 rounded-xl bg-surface-container-lowest text-on-surface flex items-center justify-center shadow-md hover:bg-surface-container-high transition-transform active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px]">layers</span>
              </button>
            </div>

            {/* Level Floor Switcher Widget */}
            <div className="absolute bottom-3 left-3 z-30 flex items-center bg-surface-container-lowest/95 backdrop-blur-md rounded-xl p-0.5 shadow-md">
              {(['Outdoor', 'L1', 'L2'] as const).map(lvl => (
                <button
                  key={lvl}
                  onClick={() => {
                    setSelectedFloor(lvl);
                    onShowToast(`Switched map view to ${lvl}`);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-label-sm text-label-sm transition-colors ${
                    selectedFloor === lvl
                      ? 'bg-primary text-on-primary font-bold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Interactive 2.5D Campus Map Canvas Visualization */}
      <div className="px-gutter">
        <div className="relative w-full h-[320px] rounded-2xl bg-surface-container-high overflow-hidden shadow-md select-none group">
          {/* 2.5D Architectural Isometric Map Canvas Background */}
          <svg
            className="absolute inset-0 w-full h-full object-cover"
            viewBox="0 0 400 320"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="lawnGrad" x1="0" y1="0" x2="400" y2="320" gradientUnits="userSpaceOnUse">
                <stop stopColor="#E2EDDF" />
                <stop offset="1" stopColor="#D5E5D1" />
              </linearGradient>
              <linearGradient id="paveGrad" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#EAEDF6" />
                <stop offset="1" stopColor="#DDE2EF" />
              </linearGradient>
              <filter id="bldgShadow" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#0f2942" floodOpacity="0.14" />
              </filter>
            </defs>

            {/* Base ground lawn */}
            <rect width="400" height="320" fill="url(#lawnGrad)" />

            {/* Campus Pathways / Plazas */}
            <path
              d="M 0 170 Q 120 150 180 180 T 400 200"
              fill="none"
              stroke="url(#paveGrad)"
              strokeWidth="32"
              strokeLinecap="round"
            />
            <path
              d="M 190 0 Q 185 110 185 185 T 220 320"
              fill="none"
              stroke="url(#paveGrad)"
              strokeWidth="26"
              strokeLinecap="round"
            />
            <path
              d="M 185 180 L 330 90"
              fill="none"
              stroke="url(#paveGrad)"
              strokeWidth="20"
              strokeLinecap="round"
            />
            <circle cx="185" cy="180" r="32" fill="#E2E7FF" opacity="0.9" />

            {/* Pathway navigation dash line (Active Route to Newton Hall) */}
            <path
              id="routePath"
              d="M 185 180 C 185 130, 240 100, 310 75"
              fill="none"
              stroke="#0051d5"
              strokeWidth="3.5"
              strokeDasharray="6 6"
            >
              <animate attributeName="stroke-dashoffset" values="24;0" dur="1.2s" repeatCount="indefinite" />
            </path>

            {/* Tree clusters & foliage */}
            <g fill="#A9CCA2" opacity="0.85">
              <circle cx="85" cy="220" r="10" />
              <circle cx="98" cy="214" r="8" />
              <circle cx="106" cy="224" r="11" />
              <circle cx="260" cy="235" r="9" />
              <circle cx="272" cy="242" r="11" />
              <circle cx="340" cy="190" r="12" />
              <circle cx="355" cy="198" r="9" />
              <circle cx="130" cy="80" r="9" />
              <circle cx="142" cy="74" r="7" />
            </g>

            {/* Building 1: Science Complex Block B (Top Left) */}
            <g filter="url(#bldgShadow)" className="cursor-pointer" onClick={() => onNavigateTo('Science Complex (Block B)', 'SC-B')}>
              <path d="M 40 70 L 95 40 L 140 65 L 85 95 Z" fill="#CBD5E1" />
              <path d="M 40 70 L 85 95 L 85 130 L 40 105 Z" fill="#94A3B8" />
              <path d="M 85 95 L 140 65 L 140 100 L 85 130 Z" fill="#64748B" />
              <polygon points="50,70 95,46 130,66 85,90" fill="#E2E8F0" />
              <line x1="60" y1="73" x2="82" y2="86" stroke="#94A3B8" strokeWidth="2" />
              <line x1="72" y1="67" x2="94" y2="80" stroke="#94A3B8" strokeWidth="2" />
            </g>

            {/* Building 2: Newton Hall (Top Right - Destination) */}
            <g filter="url(#bldgShadow)" className="cursor-pointer" onClick={() => onNavigateTo('Newton Hall • Room 204 (Level 2)', 'Room 204')}>
              <path d="M 270 55 L 325 25 L 365 48 L 310 78 Z" fill="#316BF3" />
              <path d="M 270 55 L 310 78 L 310 115 L 270 92 Z" fill="#0051D5" />
              <path d="M 310 78 L 365 48 L 365 85 L 310 115 Z" fill="#0F2942" />
              <polygon points="278,56 324,31 356,49 310,74" fill="#DBE1FF" />
              <rect x="294" y="52" width="22" height="10" fill="#7BD0FF" opacity="0.8" transform="skewY(-16)" />
            </g>

            {/* Building 3: Student Center Courtyard & Library (Center-Bottom Left) */}
            <g filter="url(#bldgShadow)">
              <path d="M 50 210 L 115 180 L 160 205 L 95 235 Z" fill="#CBD5E1" />
              <path d="M 50 210 L 95 235 L 95 268 L 50 243 Z" fill="#94A3B8" />
              <path d="M 95 235 L 160 205 L 160 238 L 95 268 Z" fill="#475569" />
              <polygon points="60,212 115,186 150,206 95,232" fill="#F1F5F9" />
            </g>

            {/* Building 4: Engineering Hub & Auditorium (Bottom Right) */}
            <g filter="url(#bldgShadow)">
              <path d="M 260 220 L 320 188 L 370 215 L 310 248 Z" fill="#CBD5E1" />
              <path d="M 260 220 L 310 248 L 310 282 L 260 254 Z" fill="#94A3B8" />
              <path d="M 310 248 L 370 215 L 370 249 L 310 282 Z" fill="#334155" />
              <polygon points="270,222 320,195 360,217 310,244" fill="#E2E8F0" />
            </g>
          </svg>

          {/* Pin Overlay 1: Current User Location */}
          <div className="absolute left-[185px] top-[180px] -translate-x-1/2 -translate-y-full flex flex-col items-center pointer-events-none z-20">
            <div className="px-2 py-0.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm shadow-md whitespace-nowrap mb-1">
              You are here
            </div>
            <div className="relative flex items-center justify-center">
              <span className="absolute w-7 h-7 rounded-full bg-secondary/30 animate-ping" />
              <div className="w-6 h-6 rounded-full bg-secondary border-2 border-surface-container-lowest flex items-center justify-center shadow-md text-on-secondary">
                <span className="material-symbols-outlined text-[14px]">my_location</span>
              </div>
            </div>
          </div>

          {/* Pin Overlay 2: Newton Hall (Destination Pin with Walk Badge) */}
          <button
            onClick={() => onNavigateTo('Newton Hall • Room 204 (Level 2)', 'Room 204')}
            className="absolute left-[315px] top-[72px] -translate-x-1/2 -translate-y-full flex flex-col items-center z-20 cursor-pointer group-hover:scale-105 transition-transform"
          >
            <div className="px-2.5 py-1 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm shadow-lg whitespace-nowrap flex items-center gap-1 mb-1 font-semibold">
              <span className="material-symbols-outlined text-[13px]">school</span>
              <span>Newton Hall • 4 min</span>
            </div>
            <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg border-2 border-secondary-fixed">
              <span className="material-symbols-outlined text-[15px]">location_on</span>
            </div>
          </button>

          {/* Pin Overlay 3: Science Complex Block B */}
          <button
            onClick={() => onNavigateTo('Science Complex (Block B)', 'SC-B')}
            className="absolute left-[88px] top-[90px] -translate-x-1/2 -translate-y-full flex flex-col items-center z-10 cursor-pointer"
          >
            <div className="px-2 py-0.5 rounded-md bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface font-label-sm text-label-sm shadow whitespace-nowrap mb-1 font-semibold">
              Sci Block B • 6m
            </div>
            <div className="w-5 h-5 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center shadow">
              <span className="material-symbols-outlined text-[13px]">biotech</span>
            </div>
          </button>

          {/* Pin Overlay 4: Engineering Hub */}
          <button
            onClick={() => onNavigateTo('Engineering Hub & Auditorium', 'ENG-HUB')}
            className="absolute left-[310px] top-[240px] -translate-x-1/2 -translate-y-full flex flex-col items-center z-10 cursor-pointer"
          >
            <div className="px-2 py-0.5 rounded-md bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface font-label-sm text-label-sm shadow whitespace-nowrap mb-1 font-semibold">
              Eng Hub • 9m
            </div>
            <div className="w-5 h-5 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center shadow">
              <span className="material-symbols-outlined text-[13px]">precision_manufacturing</span>
            </div>
          </button>

          {/* Map Floating Overlay Controls */}
          <div className="absolute top-3 left-3 z-30">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-lowest/95 backdrop-blur-md text-on-surface font-label-sm text-label-sm shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>GPS Active • Accuracy ±3m</span>
            </div>
          </div>

          <div className="absolute bottom-3 right-3 z-30 flex flex-col gap-1.5">
            <button
              onClick={() => {
                setIsCentered(true);
                onShowToast('Centered on Student Center Courtyard');
              }}
              aria-label="Recenter Map"
              className="w-10 h-10 rounded-xl bg-surface-container-lowest text-on-surface flex items-center justify-center shadow-md hover:bg-surface-container-high transition-transform active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">near_me</span>
            </button>
            <button
              onClick={() => onShowToast('Toggled Campus Layers: Accessibility & Shuttles')}
              aria-label="Map Layers"
              className="w-10 h-10 rounded-xl bg-surface-container-lowest text-on-surface flex items-center justify-center shadow-md hover:bg-surface-container-high transition-transform active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">layers</span>
            </button>
          </div>

          {/* Level Floor Switcher Widget */}
          <div className="absolute bottom-3 left-3 z-30 flex items-center bg-surface-container-lowest/95 backdrop-blur-md rounded-xl p-0.5 shadow-md">
            {(['Outdoor', 'L1', 'L2'] as const).map(lvl => (
              <button
                key={lvl}
                onClick={() => {
                  setSelectedFloor(lvl);
                  onShowToast(`Switched map view to ${lvl}`);
                }}
                className={`px-2.5 py-1 rounded-lg font-label-sm text-label-sm transition-colors ${
                  selectedFloor === lvl
                    ? 'bg-primary text-on-primary font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Route Summary Strip (Currently Selected Path) */}
      <div className="px-gutter">
        <div className="bg-surface-container rounded-xl p-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[19px]">accessible_forward</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-title-sm text-title-sm text-on-surface">Step-free corridor active</span>
                <span className="px-1.5 py-0.2 rounded bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm">
                  Ramp B
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Elevators available in Newton Atrium</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (onOpenAccessibilitySettings) onOpenAccessibilitySettings();
              else onShowToast('Routing preference: Step-free corridor with elevator access enabled');
            }}
            className="px-2.5 py-1 rounded-lg bg-surface-container-lowest text-secondary font-label-md text-label-md shrink-0 shadow-sm hover:bg-surface-container-high transition-colors"
          >
            Change
          </button>
        </div>
      </div>

      {/* Popular Campus Destinations Section */}
      <div className="px-gutter space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-title-md text-title-md text-on-surface">Popular Destinations</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Key hubs for new intakes &amp; campus visitors</p>
          </div>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              onShowToast('Showing all 28 campus locations');
            }}
            className="font-label-md text-label-md text-secondary hover:underline flex items-center gap-0.5"
          >
            View All ({destinations.length})
            <span className="material-symbols-outlined text-[15px]">chevron_right</span>
          </button>
        </div>

        {/* Cards List */}
        <div className="space-y-3" id="destinationsList">
          {filteredDestinations.map((dest, idx) => {
            const isFirst = idx === 0;
            return (
              <div
                key={dest.id}
                className="bg-surface-container-lowest rounded-xl p-3.5 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-surface-container">
                    <img
                      className="w-full h-full object-cover"
                      src={dest.imageUrl}
                      alt={dest.name}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-title-sm text-title-sm text-on-surface truncate">
                        {dest.name}
                      </span>
                      <span
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-label-sm text-label-sm shrink-0 font-semibold ${
                          isFirst
                            ? 'bg-secondary-fixed text-on-secondary-fixed-variant'
                            : 'bg-surface-container-high text-on-surface'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[12px]">directions_walk</span>{' '}
                        {dest.walkMinutes} min
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 line-clamp-1">
                      {dest.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2 font-label-sm text-label-sm text-on-surface-variant">
                      <span
                        className={`inline-flex items-center gap-1 ${
                          dest.openStatus.includes('Open') ? 'text-emerald-700' : 'text-on-surface-variant'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            dest.openStatus.includes('Open')
                              ? 'bg-emerald-600'
                              : dest.openStatus.includes('Event')
                              ? 'bg-amber-500'
                              : 'bg-secondary'
                          }`}
                        />
                        {dest.openStatus}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[13px] text-secondary">accessible</span>{' '}
                        {dest.accessibility}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-surface-container-high flex items-center justify-between">
                  <span className="font-code-sm text-code-sm text-on-surface-variant">
                    {dest.locationLabel}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={e => handleToggleBookmark(dest.id, e)}
                      aria-label="Bookmark destination"
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        dest.bookmarked
                          ? 'bg-secondary-fixed text-secondary'
                          : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                      }`}
                    >
                      <span
                        className="material-symbols-outlined text-[17px]"
                        style={{ fontVariationSettings: dest.bookmarked ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        {dest.bookmarked ? 'bookmark' : 'bookmark_border'}
                      </span>
                    </button>
                    <button
                      onClick={() => onNavigateTo(dest.name, dest.roomCode)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-label-md text-label-md transition-all active:scale-95 shadow-sm ${
                        isFirst
                          ? 'bg-secondary text-on-secondary hover:bg-secondary-container'
                          : 'bg-primary text-on-primary hover:bg-primary-container'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">turn_sharp_right</span>
                      Navigate
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
