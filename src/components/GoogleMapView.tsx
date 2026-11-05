import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  Polyline,
  Polygon,
  useMap
} from '@vis.gl/react-google-maps';
import {
  CAMPUS_POIS,
  CampusPOI,
  SR_CAMPUS_BOUNDS,
  SR_CAMPUS_CENTER
} from '../data/campusRouting';
import {
  CAMPUS_BUILDINGS,
  CampusBuilding
} from '../data/campusBuildings';

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
  activeBuilding: CampusBuilding | undefined;
  centerTrigger: number;
  routePolyline?: Array<{ lat: number; lng: number }> | null;
  userLocation?: { lat: number; lng: number } | null;
}> = ({ activePOI, activeBuilding, centerTrigger, routePolyline }) => {
  const map = useMap();

  // If a route polyline is active, fit map to route bounds
  useEffect(() => {
    if (!map || !routePolyline || routePolyline.length < 2) return;
    const bounds = new google.maps.LatLngBounds();
    routePolyline.forEach(pt => bounds.extend(pt));
    map.fitBounds(bounds, { top: 50, bottom: 80, left: 50, right: 50 });
  }, [map, routePolyline]);

  // If active building changes and no route is active
  useEffect(() => {
    if (!map || routePolyline) return;
    if (activeBuilding) {
      map.panTo(activeBuilding.center);
      map.setZoom(18);
    }
  }, [map, activeBuilding, routePolyline]);

  // If active POI changes and no route or building is targeted
  useEffect(() => {
    if (!map || routePolyline || activeBuilding) return;
    if (activePOI) {
      map.panTo({ lat: activePOI.lat, lng: activePOI.lng });
    }
  }, [map, activePOI, activeBuilding, routePolyline]);

  // Center campus trigger
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
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>('bldg-cse');
  const [showBuildingFootprints, setShowBuildingFootprints] = useState(true);
  const [showBuildingCarousel, setShowBuildingCarousel] = useState(false);
  const [activeFloorIndex, setActiveFloorIndex] = useState(0);
  const [infoWindowOpen, setInfoWindowOpen] = useState(false);
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
      // Also match building if applicable
      const matchedBldg = CAMPUS_BUILDINGS.find(b =>
        selectedDestinationId.includes(b.id.replace('bldg-', '')) ||
        b.name.toLowerCase().includes(selectedDestinationId.toLowerCase())
      );
      if (matchedBldg) {
        setSelectedBuildingId(matchedBldg.id);
      }
    }
  }, [selectedDestinationId]);

  const activePOI = useMemo(() => {
    return CAMPUS_POIS.find(p => {
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
  }, [activePinId]);

  const activeBuilding = useMemo(() => {
    return CAMPUS_BUILDINGS.find(b => b.id === selectedBuildingId) || CAMPUS_BUILDINGS[1];
  }, [selectedBuildingId]);

  const handlePOIClick = useCallback((poi: CampusPOI) => {
    setActivePinId(poi.id);
    setInfoWindowOpen(true);
    // Find matching building
    const matchedBldg = CAMPUS_BUILDINGS.find(b =>
      poi.name.toLowerCase().includes(b.shortName.toLowerCase()) ||
      b.name.toLowerCase().includes(poi.shortName.toLowerCase())
    );
    if (matchedBldg) {
      setSelectedBuildingId(matchedBldg.id);
    }
    onShowToast(`Selected ${poi.name}`);
  }, [onShowToast]);

  const handleBuildingSelect = useCallback((building: CampusBuilding) => {
    setSelectedBuildingId(building.id);
    setActiveFloorIndex(0);
    // Match with corresponding POI
    const matchPOI = CAMPUS_POIS.find(p =>
      p.name.toLowerCase().includes(building.shortName.toLowerCase()) ||
      building.name.toLowerCase().includes(p.shortName.toLowerCase())
    );
    if (matchPOI) {
      setActivePinId(matchPOI.id);
    }
    onShowToast(`Inspecting ${building.name}`);
  }, [onShowToast]);

  const handleCenterCampus = () => {
    setCenterTrigger(prev => prev + 1);
    setActivePinId('poi-srec-main');
    setSelectedBuildingId('bldg-srec-main');
    onShowToast('Centered on SR University Campus Core');
  };

  const handleGetDirections = (poiName: string, roomCode?: string) => {
    if (onSelectDestination) {
      onSelectDestination(poiName, roomCode);
    }
    onShowToast(`Routing to ${poiName}...`);
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

        // Check if user is within SR University Warangal bounds
        const isNearCampus =
          latitude >= 18.02 && latitude <= 18.06 &&
          longitude >= 79.55 && longitude <= 79.60;

        let detectedLoc = { lat: latitude, lng: longitude };
        if (!isNearCampus) {
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
      () => {
        setIsLocating(false);
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
        isFullscreen ? 'fixed inset-4 z-50 rounded-2xl' : 'h-[550px] lg:h-[650px]'
      }`}
    >
      {/* Top Google Maps Controls Header */}
      <div className="absolute top-3 inset-x-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Map Type Switcher & Building Footprints Toggle */}
        <div className="pointer-events-auto flex items-center bg-white/95 backdrop-blur-md shadow-md rounded-lg p-1 border border-slate-200 gap-1">
          {(['roadmap', 'satellite', 'terrain'] as const).map(type => (
            <button
              key={type}
              onClick={() => {
                setMapType(type);
                onShowToast(`Switched to ${type.charAt(0).toUpperCase() + type.slice(1)} view`);
              }}
              className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-md transition-colors capitalize ${
                mapType === type
                  ? 'bg-secondary text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {type === 'roadmap' ? 'Map' : type}
            </button>
          ))}

          <div className="w-px h-4 bg-slate-200 mx-0.5" />

          {/* Building View Toggle Button */}
          <button
            onClick={() => {
              setShowBuildingFootprints(!showBuildingFootprints);
              onShowToast(showBuildingFootprints ? 'Building footprints hidden' : 'Building footprints highlighted');
            }}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${
              showBuildingFootprints
                ? 'bg-blue-50 text-secondary border border-blue-200 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Toggle school environment building footprints"
          >
            <span className="material-symbols-outlined text-[16px]">domain</span>
            <span>Buildings</span>
          </button>

          {/* Browse Buildings Carousel Toggle */}
          <button
            onClick={() => setShowBuildingCarousel(!showBuildingCarousel)}
            className={`px-2 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${
              showBuildingCarousel
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Browse all campus buildings"
          >
            <span className="material-symbols-outlined text-[16px]">apartment</span>
            <span className="hidden sm:inline">List ({CAMPUS_BUILDINGS.length})</span>
          </button>
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
          activeBuilding={activeBuilding}
          centerTrigger={centerTrigger}
          routePolyline={routePolyline}
          userLocation={userLocation}
        />

        {/* Dynamic Route Polyline between Start and Destination */}
        {routePolyline && routePolyline.length > 1 && (
          <>
            <Polyline
              path={routePolyline}
              strokeColor="#60a5fa"
              strokeOpacity={0.6}
              strokeWeight={8}
            />
            <Polyline
              path={routePolyline}
              strokeColor="#0051d5"
              strokeOpacity={0.95}
              strokeWeight={4}
            />
          </>
        )}

        {/* Campus Building Polygons (Physical Footprints within School Environment) */}
        {showBuildingFootprints &&
          CAMPUS_BUILDINGS.map(building => {
            const isSelected = building.id === selectedBuildingId;
            return (
              <Polygon
                key={building.id}
                paths={building.footprint}
                strokeColor={isSelected ? '#1e3a8a' : building.strokeColor}
                strokeOpacity={isSelected ? 1.0 : 0.85}
                strokeWeight={isSelected ? 3.5 : 2}
                fillColor={building.fillColor}
                fillOpacity={
                  isSelected
                    ? 0.55
                    : mapType === 'satellite'
                    ? 0.35
                    : 0.22
                }
                onClick={() => handleBuildingSelect(building)}
              />
            );
          })}

        {/* Building Labels and 3D Badges */}
        {showBuildingFootprints &&
          CAMPUS_BUILDINGS.map(building => {
            const isSelected = building.id === selectedBuildingId;
            return (
              <AdvancedMarker
                key={`label-${building.id}`}
                position={building.center}
                onClick={() => handleBuildingSelect(building)}
                title={`${building.name} (${building.code})`}
              >
                <div
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold shadow-md cursor-pointer transition-transform border flex items-center gap-1 ${
                    isSelected
                      ? 'bg-slate-900 text-white border-white scale-110 ring-2 ring-blue-500'
                      : 'bg-white/95 text-slate-800 border-slate-300 hover:scale-105'
                  }`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: building.fillColor }}
                  />
                  <span>{building.shortName}</span>
                </div>
              </AdvancedMarker>
            );
          })}

        {/* User's Live Location Pinpoint */}
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

        {/* Route Origin Marker (Green Pin) */}
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

        {/* Route Destination Marker (Red Pin) */}
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
                  onClick={() => handleGetDirections(activePOI.name, activePOI.code)}
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

      {/* Quick Campus Buildings Carousel Bar (Overlay) */}
      {showBuildingCarousel && (
        <div className="absolute top-16 inset-x-3 z-20 bg-white/95 backdrop-blur-md rounded-xl p-2.5 shadow-xl border border-slate-200 pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-secondary">domain</span>
              <span>SR University Campus Buildings ({CAMPUS_BUILDINGS.length})</span>
            </span>
            <button
              onClick={() => setShowBuildingCarousel(false)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {CAMPUS_BUILDINGS.map(bldg => {
              const isSelected = bldg.id === selectedBuildingId;
              return (
                <button
                  key={bldg.id}
                  onClick={() => handleBuildingSelect(bldg)}
                  className={`flex items-center gap-2 p-1.5 pr-3 rounded-lg border text-left shrink-0 transition-all ${
                    isSelected
                      ? 'border-secondary bg-blue-50/80 shadow-xs ring-1 ring-secondary/30'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                  }`}
                >
                  <img
                    src={bldg.photoUrl}
                    alt={bldg.name}
                    className="w-9 h-9 rounded object-cover ring-1 ring-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 block truncate max-w-[140px]">
                      {bldg.shortName}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {bldg.categoryLabel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Bottom Left: Interactive Building Inspector Drawer */}
      {activeBuilding && !routePolyline && (
        <div className="absolute bottom-3 left-3 z-10 max-w-sm sm:max-w-md w-[calc(100%-1.5rem)] sm:w-auto bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-2xl border border-slate-200 pointer-events-auto animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-start gap-3">
            {/* Building Photo */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 border border-slate-200 shadow-xs">
              <img
                src={activeBuilding.photoUrl}
                alt={activeBuilding.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded bg-black/60 text-white font-mono text-[9px] font-bold backdrop-blur-xs">
                {activeBuilding.floorsCount}F
              </span>
            </div>

            {/* Building Metadata */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">
                  {activeBuilding.categoryLabel}
                </span>
                <span className="px-1.5 py-0.2 bg-slate-100 text-slate-800 rounded text-[10px] font-mono font-bold">
                  {activeBuilding.code}
                </span>
              </div>

              <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight mt-0.5 truncate">
                {activeBuilding.name}
              </h4>

              <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">
                {activeBuilding.description}
              </p>
            </div>
          </div>

          {/* Interactive Floor Breakdown Selector */}
          <div className="mt-3 pt-2.5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Building Floorplan ({activeBuilding.floors.length} Levels)
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {activeBuilding.architecturalStyle}
              </span>
            </div>

            {/* Floor Tab Buttons */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar mb-2">
              {activeBuilding.floors.map((fl, idx) => (
                <button
                  key={fl.floorNumber}
                  onClick={() => setActiveFloorIndex(idx)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors shrink-0 ${
                    activeFloorIndex === idx
                      ? 'bg-secondary text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {fl.label}
                </button>
              ))}
            </div>

            {/* Selected Floor Details */}
            {activeBuilding.floors[activeFloorIndex] && (
              <div className="bg-slate-50 rounded-lg p-2 border border-slate-200 text-xs">
                <div className="font-bold text-slate-800 text-[11px]">
                  {activeBuilding.floors[activeFloorIndex].name}
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {activeBuilding.floors[activeFloorIndex].highlights.map((h, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 rounded bg-white text-slate-700 font-medium text-[10px] border border-slate-200"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Building Key Facilities Chips */}
          <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {activeBuilding.facilities.slice(0, 3).map((fac, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full bg-blue-50 text-secondary text-[10px] font-medium shrink-0 flex items-center gap-1"
              >
                <span className="w-1 h-1 rounded-full bg-secondary" />
                <span>{fac}</span>
              </span>
            ))}
          </div>

          {/* Action Row */}
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <span className="text-[10px] text-slate-500">
              Total Area: <span className="font-semibold text-slate-700">{activeBuilding.totalAreaSqFt}</span>
            </span>

            <button
              onClick={() => handleGetDirections(activeBuilding.name, activeBuilding.code)}
              className="px-3.5 py-1.5 bg-secondary hover:bg-blue-600 text-white text-xs font-semibold rounded-lg shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
            >
              <span className="material-symbols-outlined text-[15px]">directions</span>
              <span>Navigate to Building</span>
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
