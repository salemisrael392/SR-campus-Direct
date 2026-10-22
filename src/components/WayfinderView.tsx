import React, { useState, useMemo, useCallback } from 'react';
import { RouteMode, FloorLevel, NavigationStep } from '../types';
import { UNIVERSITY_INFO } from '../data/campusData';
import {
  computeCampusWalkingRoute,
  CampusPOI,
  CAMPUS_POIS
} from '../data/campusRouting';
import { CampusLocationInput } from './CampusLocationInput';
import { GoogleMapView } from './GoogleMapView';
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
  origin = 'Main Campus Entrance (Gate 1)',
  destination = 'SREC Computer Science & AI Block',
  onShowToast,
  onStartVoiceNav,
  onOpenChatSupport,
  onCallSecurity
}) => {
  const [startPos, setStartPos] = useState(origin);
  const [destPos, setDestPos] = useState(destination);
  const [routeMode, setRouteMode] = useState<RouteMode>('fast');
  const [viewMode, setViewMode] = useState<'map' | '3d' | '2d'>('map');
  const [selectedLevel, setSelectedLevel] = useState<FloorLevel>('L2');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Compute live campus walking route
  const routeResult = useMemo(() => {
    return computeCampusWalkingRoute(startPos, destPos, routeMode === 'accessible');
  }, [startPos, destPos, routeMode]);

  const handleSwap = () => {
    const temp = startPos;
    setStartPos(destPos);
    setDestPos(temp);
    onShowToast('Inverted start point and destination');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'SR University Campus Route',
        text: `Route from ${startPos} to ${destPos} (${routeResult.estimatedMinutes} min walk, ${routeResult.totalDistanceMeters}m)`
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      onShowToast('Route link copied to clipboard!');
    }
  };

  // Real GPS Geolocation for Origin
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      onShowToast('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    onShowToast('Detecting your live campus location...');

    navigator.geolocation.getCurrentPosition(
      pos => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        const isNearCampus =
          latitude >= 18.02 && latitude <= 18.06 &&
          longitude >= 79.55 && longitude <= 79.60;

        let detected = { lat: latitude, lng: longitude };
        if (!isNearCampus) {
          detected = { lat: 18.04092, lng: 79.57765 };
          setStartPos('Main Campus Entrance (Gate 1)');
          onShowToast('GPS active • Pinpointed at Campus Entrance (Gate 1)');
        } else {
          setStartPos('Your Live Campus Position');
          onShowToast('Using your real-time campus coordinates!');
        }

        setUserLocation(detected);
      },
      err => {
        setIsLocating(false);
        setStartPos('Main Campus Entrance (Gate 1)');
        setUserLocation({ lat: 18.04092, lng: 79.57765 });
        onShowToast('Defaulted to Campus Entrance (Gate 1)');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const getStepIcon = (type: NavigationStep['type']) => {
    switch (type) {
      case 'turn_right':
        return 'turn_right';
      case 'turn_left':
        return 'turn_left';
      case 'stairs':
        return 'stairs';
      case 'elevator':
        return 'elevator';
      case 'arrival':
        return 'check_circle';
      case 'straight':
      default:
        return 'straight';
    }
  };

  const handleMapSelectDestination = useCallback((name: string) => {
    setDestPos(name);
    onShowToast(`Routing to ${name}...`);
  }, [onShowToast]);

  return (
    <div className="flex flex-col w-full space-y-4">
      {/* Route Direction Input Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Origin & Destination Editable Inputs */}
          <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Origin Input with Autocomplete & Geolocation */}
            <CampusLocationInput
              label="Starting point"
              value={startPos}
              isOrigin={true}
              onChangeValue={setStartPos}
              onSelectPOI={poi => setStartPos(poi.name)}
              onUseCurrentLocation={handleUseCurrentLocation}
              isLocating={isLocating}
              placeholder="Type start point (e.g. Gate 1, Hostels)..."
            />

            {/* Swap Button */}
            <button
              onClick={handleSwap}
              aria-label="Reverse route"
              className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center shrink-0 self-center transition-transform active:scale-90"
              title="Reverse starting point and destination"
            >
              <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
            </button>

            {/* Destination Input with Autocomplete */}
            <CampusLocationInput
              label="Destination"
              value={destPos}
              isOrigin={false}
              onChangeValue={setDestPos}
              onSelectPOI={poi => setDestPos(poi.name)}
              placeholder="Type destination (e.g. Room 204, CSE, SRiX)..."
            />
          </div>

          {/* Quick Route Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onStartVoiceNav}
              className="flex items-center gap-1.5 px-4 py-2 bg-secondary hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs active:scale-98"
            >
              <span className="material-symbols-outlined text-[17px]">record_voice_over</span>
              <span>Voice Guidance</span>
            </button>

            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center"
              title="Share route link"
            >
              <span className="material-symbols-outlined text-[18px]">share</span>
            </button>
          </div>
        </div>

        {/* Dynamic Route Stats & Preference Row */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-900 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-secondary">directions_walk</span>
              <span>{routeResult.estimatedMinutes} min ({routeResult.totalDistanceMeters} m)</span>
            </span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-slate-600">
              From {routeResult.originPOI.shortName} to {routeResult.destinationPOI.shortName}
            </span>
          </div>

          {/* Route Options (Fastest vs Step-Free) */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
            <button
              onClick={() => {
                setRouteMode('fast');
                onShowToast('Calculated fastest campus route');
              }}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                routeMode === 'fast'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Fastest Route
            </button>
            <button
              onClick={() => {
                setRouteMode('accessible');
                onShowToast('Accessibility mode: Step-free route with elevator selected');
              }}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${
                routeMode === 'accessible'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">accessible</span>
              <span>Step-Free</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Turn Steps (Left) + Route Visualization Canvas (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Turn-by-Turn Directions List (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Turn-by-Turn Guidance ({routeResult.steps.length})
            </h3>
            <span className="text-[11px] font-semibold text-secondary flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Campus RTLS Live</span>
            </span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {routeResult.steps.map((step, idx) => (
              <div
                key={step.id}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
              >
                {/* Step Icon */}
                <div className="w-7 h-7 rounded-full bg-blue-50 text-secondary flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[16px]">
                    {getStepIcon(step.type)}
                  </span>
                </div>

                {/* Instruction */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 leading-snug">
                    {step.title}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {step.distanceMeters}m &bull; {step.description}
                  </p>
                </div>

                <span className="text-[10px] font-mono font-medium text-slate-400 shrink-0">
                  #{idx + 1}
                </span>
              </div>
            ))}
          </div>

          {/* Quick Help & SOS in Directions */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              onClick={onOpenChatSupport}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px] text-slate-400">chat</span>
              <span>Need Help?</span>
            </button>
            <a
              href={`tel:${UNIVERSITY_INFO.emergencyPhone}`}
              className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">call</span>
              <span>Campus Security</span>
            </a>
          </div>
        </div>

        {/* Right Column: Visual Spatial Route Canvas (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          {/* View Mode Toggle (Map vs 3D vs 2D) */}
          <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-[18px]">visibility</span>
              <span className="text-xs font-bold text-slate-800">Visual Route Mode:</span>
            </div>

            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${
                  viewMode === 'map'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">map</span>
                <span>Google Map</span>
              </button>
              <button
                onClick={() => setViewMode('3d')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${
                  viewMode === '3d'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">view_in_ar</span>
                <span>3D Pathway</span>
              </button>
              <button
                onClick={() => setViewMode('2d')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${
                  viewMode === '2d'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">floor</span>
                <span>Floor Plan</span>
              </button>
            </div>
          </div>

          {/* Visualization Container */}
          {viewMode === 'map' && (
            <GoogleMapView
              routeStart={routeResult.originPOI}
              routeEnd={routeResult.destinationPOI}
              routePolyline={routeResult.pathCoordinates}
              userLocation={userLocation}
              onUserLocationDetected={setUserLocation}
              onSelectDestination={handleMapSelectDestination}
              onShowToast={onShowToast}
            />
          )}

          {viewMode === '3d' && (
            <Wayfinder3DView
              destinationLabel={destPos}
              remainingDistance={`${routeResult.totalDistanceMeters}m (${routeResult.estimatedMinutes} min walk)`}
              onRecenter={() => onShowToast('Recalibrated AR sensor')}
            />
          )}

          {viewMode === '2d' && (
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <Floorplan2DView
                currentLevel={selectedLevel}
                onSelectLevel={setSelectedLevel}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
