import React, { useState, useEffect, useCallback } from 'react';
import {
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  Polyline,
  useMap
} from '@vis.gl/react-google-maps';
import {
  CAMPUS_POIS,
  CampusPOI,
  SR_CAMPUS_BOUNDS,
  SR_CAMPUS_CENTER
} from '../data/campusRouting';

interface GoogleMapViewProps {
  selectedDestinationId?: string;
  onSelectDestination?: (name: string, roomCode?: string) => void;
  onShowToast: (msg: string) => void;
  // Wayfinder route synchronization
  routeStart?: CampusPOI | null;
  routeEnd?: CampusPOI | null;
  routePolyline?: Array<{ lat: number; lng: number }> | null;
  userLocation?: { lat: number; lng: number } | null;
  onUserLocationDetected?: (loc: { lat: number; lng: number }) => void;
}

// Inner controller to pan and manage camera smoothly and fit route bounds
const MapCameraController: React.FC<{
  activePOI: CampusPOI | undefined;
  centerTrigger: number;
  routePolyline?: Array<{ lat: number; lng: number }> | null;
  userLocation?: { lat: number; lng: number } | null;
}> = ({ activePOI, centerTrigger, routePolyline, userLocation }) => {
  const map = useMap();

  // If a route polyline is active, fit map to route bounds
  useEffect(() => {
    if (!map || !routePolyline || routePolyline.length < 2) return;
    const bounds = new google.maps.LatLngBounds();
    routePolyline.forEach(pt => bounds.extend(pt));
    map.fitBounds(bounds, { top: 50, bottom: 80, left: 50, right: 50 });
  }, [map, routePolyline]);

  // If active POI changes and no full route is being drawn
  useEffect(() => {
    if (!map || routePolyline) return;
    if (activePOI) {
      map.panTo({ lat: activePOI.lat, lng: activePOI.lng });
    }
  }, [map, activePOI, routePolyline]);

  // If user requests centering
  useEffect(() => {
    if (!map || centerTrigger === 0) return;
    map.panTo(SR_CAMPUS_CENTER);
    map.setZoom(17);
  }, [map, centerTrigger]);

  return null;
};

export const GoogleMapView = React.memo<GoogleMapViewProps>(({
  selectedDestinationId,
  onSelectDestination,
  onShowToast,
  routeStart,
  routeEnd,
  routePolyline,
  userLocation: initialUserLocation,
  onUserLocationDetected
}) => {
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');
  const [activePinId, setActivePinId] = useState<string | null>(selectedDestinationId || 'poi-cse-block');
  const [infoWindowOpen, setInfoWindowOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [centerTrigger, setCenterTrigger] = useState(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(
    initialUserLocation || null
  );
  const [isLocating, setIsLocating] = useState(false);

  // Sync with prop when selected from outside
  useEffect(() => {
    if (selectedDestinationId) {
      setActivePinId(selectedDestinationId);
      setInfoWindowOpen(true);
    }
  }, [selectedDestinationId]);

  const activePOI = CAMPUS_POIS.find(p => {
    if (!activePinId) return false;
    const cleanId = activePinId.toLowerCase().replace(/^(dest-|poi-)/, '');
    const pCleanId = p.id.toLowerCase().replace(/^(dest-|poi-)/, '');
    return (
      p.id === activePinId ||
      cleanId === pCleanId ||
      p.code.toLowerCase() === activePinId.toLowerCase() ||
      p.name.toLowerCase().includes(cleanId)
    );
  }) || CAMPUS_POIS[4];

  const handlePOIClick = useCallback((poi: CampusPOI) => {
    setActivePinId(poi.id);
    setInfoWindowOpen(true);
    onShowToast(`Selected ${poi.name}`);
  }, [onShowToast]);

  const handleCenterCampus = () => {
    setCenterTrigger(prev => prev + 1);
    setActivePinId('poi-srec-main');
    setInfoWindowOpen(true);
    onShowToast('Centered on SR University Campus Core');
  };

  const handleGetDirections = (poi: CampusPOI) => {
    if (onSelectDestination) {
      onSelectDestination(poi.name, poi.code);
    }
    onShowToast(`Routing to ${poi.name}...`);
  };

  // Real HTML5 Geolocation to pinpoint user's location on campus
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      onShowToast('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    onShowToast('Acquiring campus GPS signal...');

    navigator.geolocation.getCurrentPosition(
      position => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;

        // Check if user is within or near SR University Warangal bounds
        const isNearCampus =
          latitude >= 18.02 && latitude <= 18.06 &&
          longitude >= 79.55 && longitude <= 79.60;

        let detectedLoc = { lat: latitude, lng: longitude };
        if (!isNearCampus) {
          // Graceful fallback for remote test users: pinpoint at Gate 1 Entrance
          detectedLoc = { lat: 18.04092, lng: 79.57765 };
          onShowToast('GPS active • Pinpointed at Campus Entrance (Gate 1)');
        } else {
          onShowToast('Pinpointed your live location on campus!');
        }

        setUserLocation(detectedLoc);
        if (onUserLocationDetected) {
          onUserLocationDetected(detectedLoc);
        }
      },
      error => {
        setIsLocating(false);
        // Default to Gate 1
        const fallback = { lat: 18.04092, lng: 79.57765 };
        setUserLocation(fallback);
        if (onUserLocationDetected) onUserLocationDetected(fallback);
        onShowToast('Using Campus Entrance Gate 1 as starting point');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div
      id="google-maps-container"
      className={`relative w-full overflow-hidden rounded-2xl border border-slate-200 shadow-md bg-slate-100 transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 rounded-2xl' : 'h-[520px] lg:h-[620px]'
      }`}
    >
      {/* Top Google Maps Controls Header */}
      <div className="absolute top-3 inset-x-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Map Type Switcher */}
        <div className="pointer-events-auto flex items-center bg-white/95 backdrop-blur-md shadow-md rounded-lg p-1 border border-slate-200">
          {(['roadmap', 'satellite', 'terrain'] as const).map(type => (
            <button
              key={type}
              onClick={() => {
                setMapType(type);
                onShowToast(`Switched to ${type.charAt(0).toUpperCase() + type.slice(1)} view`);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors capitalize ${
                mapType === type
                  ? 'bg-secondary text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {type === 'roadmap' ? 'Map' : type}
            </button>
          ))}
        </div>

        {/* Right: GPS Pinpoint Status & Fullscreen */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Squeezed Campus Boundary Badge */}
          <div className="hidden sm:flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 shadow-md">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>SR University Campus Grid</span>
          </div>

          {/* Locate Me Button */}
          <button
            onClick={handleLocateUser}
            disabled={isLocating}
            title="Locate my position on campus"
            className={`flex items-center gap-1 bg-white hover:bg-slate-50 text-secondary font-semibold text-xs px-3 py-1.5 rounded-lg border border-slate-200 shadow-md transition-all active:scale-95 ${
              isLocating ? 'opacity-70' : ''
            }`}
          >
            <span className={`material-symbols-outlined text-[17px] ${isLocating ? 'animate-spin' : ''}`}>
              {isLocating ? 'sync' : 'my_location'}
            </span>
            <span className="hidden md:inline">Locate Me</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="w-8 h-8 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 shadow-md flex items-center justify-center transition-all active:scale-95"
            aria-label="Toggle Fullscreen"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
            </span>
          </button>
        </div>
      </div>

      {/* Real Google Map Instance Squeezed strictly to SR University */}
      <Map
        mapId="DEMO_MAP_ID"
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        defaultCenter={SR_CAMPUS_CENTER}
        defaultZoom={17}
        minZoom={15}
        maxZoom={20}
        restriction={{
          latLngBounds: SR_CAMPUS_BOUNDS,
          strictBounds: false
        }}
        mapTypeId={mapType}
        gestureHandling="greedy"
        disableDefaultUI={false}
        keyboardShortcuts={false}
        className="w-full h-full"
      >
        <MapCameraController
          activePOI={activePOI}
          centerTrigger={centerTrigger}
          routePolyline={routePolyline}
          userLocation={userLocation}
        />

        {/* Dynamic Route Polyline between Start and Destination */}
        {routePolyline && routePolyline.length > 1 && (
          <>
            {/* Outer Route Glow / Casing */}
            <Polyline
              path={routePolyline}
              strokeColor="#60a5fa"
              strokeOpacity={0.6}
              strokeWeight={8}
            />
            {/* Solid Navigation Path */}
            <Polyline
              path={routePolyline}
              strokeColor="#0051d5"
              strokeOpacity={0.95}
              strokeWeight={4}
            />
          </>
        )}

        {/* User's Live Location Pinpoint (Pulsing Google Maps Blue Dot) */}
        {userLocation && (
          <AdvancedMarker
            position={userLocation}
            title="Your Current Location"
          >
            <div className="relative flex items-center justify-center">
              <span className="absolute w-7 h-7 rounded-full bg-blue-500/30 animate-ping" />
              <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-white" />
              </div>
            </div>
          </AdvancedMarker>
        )}

        {/* Route Origin Marker (Green Pin) if navigating */}
        {routeStart && (
          <AdvancedMarker
            position={{ lat: routeStart.lat, lng: routeStart.lng }}
            title={`Origin: ${routeStart.name}`}
          >
            <Pin
              background="#16a34a"
              borderColor="#ffffff"
              glyphColor="#ffffff"
              scale={1.3}
            >
              <span className="text-[11px] font-bold text-white">A</span>
            </Pin>
          </AdvancedMarker>
        )}

        {/* Route Destination Marker (Red Pin) if navigating */}
        {routeEnd && (
          <AdvancedMarker
            position={{ lat: routeEnd.lat, lng: routeEnd.lng }}
            title={`Destination: ${routeEnd.name}`}
          >
            <Pin
              background="#dc2626"
              borderColor="#ffffff"
              glyphColor="#ffffff"
              scale={1.35}
            >
              <span className="text-[11px] font-bold text-white">B</span>
            </Pin>
          </AdvancedMarker>
        )}

        {/* All SR University Campus POI Markers */}
        {CAMPUS_POIS.map(poi => {
          const isActive = poi.id === activePinId;
          const isOrigin = routeStart?.id === poi.id;
          const isDest = routeEnd?.id === poi.id;

          // Don't duplicate if already rendered as dedicated route endpoint
          if (isOrigin || isDest) return null;

          return (
            <AdvancedMarker
              key={poi.id}
              position={{ lat: poi.lat, lng: poi.lng }}
              onClick={() => handlePOIClick(poi)}
              title={`${poi.name} (${poi.code})`}
            >
              <Pin
                background={poi.pinColor}
                borderColor="#ffffff"
                glyphColor="#ffffff"
                scale={isActive ? 1.25 : 0.9}
              />
            </AdvancedMarker>
          );
        })}

        {/* Active POI InfoWindow */}
        {activePOI && infoWindowOpen && !routePolyline && (
          <InfoWindow
            position={{ lat: activePOI.lat, lng: activePOI.lng }}
            onCloseClick={() => setInfoWindowOpen(false)}
            pixelOffset={[0, -32]}
            shouldFocus={false}
            disableAutoPan={true}
          >
            <div className="p-2 min-w-[210px] max-w-[280px]">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">
                  {activePOI.categoryLabel}
                </span>
                <span className="px-1.5 py-0.2 bg-slate-100 text-slate-800 rounded text-[10px] font-mono font-bold">
                  {activePOI.code}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-1 leading-snug">
                {activePOI.name}
              </h4>
              <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                {activePOI.description}
              </p>
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-medium">
                  {activePOI.floorLevel || 'Ground Level'}
                </span>
                <button
                  onClick={() => handleGetDirections(activePOI)}
                  className="px-2.5 py-1 bg-secondary hover:bg-blue-600 text-white text-[11px] font-bold rounded shadow-xs transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[13px]">directions</span>
                  <span>Directions</span>
                </button>
              </div>
            </div>
          </InfoWindow>
        )}
      </Map>

      {/* Floating Bottom Left: Selected Campus POI Card */}
      {activePOI && !routePolyline && (
        <div className="absolute bottom-4 left-4 z-10 max-w-sm w-[calc(100%-2rem)] sm:w-auto bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-lg border border-slate-200 pointer-events-auto">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-semibold text-secondary uppercase tracking-wider block">
                {activePOI.categoryLabel}
              </span>
              <h4 className="text-xs font-bold text-slate-900 truncate">{activePOI.name}</h4>
              <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">{activePOI.description}</p>
            </div>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded text-[11px] font-mono font-bold shrink-0">
              {activePOI.code}
            </span>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-secondary">location_on</span>
              <span>{activePOI.floorLevel || 'Ground Level'}</span>
            </span>

            <button
              onClick={() => handleGetDirections(activePOI)}
              className="px-3 py-1.5 bg-secondary hover:bg-blue-600 text-white text-xs font-semibold rounded-lg shadow-xs transition-all flex items-center gap-1 active:scale-95"
            >
              <span className="material-symbols-outlined text-[14px]">directions</span>
              <span>Directions</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Bottom Right: Campus Recenter Tool */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1.5 pointer-events-auto">
        <button
          onClick={handleCenterCampus}
          title="Center on SR University Campus Core"
          className="w-10 h-10 bg-white hover:bg-slate-50 text-secondary rounded-lg border border-slate-200 shadow-md flex items-center justify-center transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">my_location</span>
        </button>
      </div>
    </div>
  );
});
