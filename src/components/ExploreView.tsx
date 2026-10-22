import React, { useState, useCallback, useMemo } from 'react';
import { Destination, FloorLevel } from '../types';
import { POPULAR_DESTINATIONS } from '../data/campusData';
import { GoogleMapView } from './GoogleMapView';
import { Floorplan2DView } from './Floorplan2DView';

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
  const [selectedFloor, setSelectedFloor] = useState<FloorLevel>('Outdoor');
  const [viewMode, setViewMode] = useState<'map' | 'floorplan'>('map');
  const [selectedDestId, setSelectedDestId] = useState<string>('dest-cse-block');

  const categories = [
    { id: 'all', label: 'All Places' },
    { id: 'hall', label: 'Academic Blocks' },
    { id: 'lab', label: 'Labs & SRiX' },
    { id: 'dining', label: 'Dining & Quads' },
    { id: 'admin', label: 'Admin & Gates' }
  ];

  const filteredDestinations = useMemo(() => {
    return POPULAR_DESTINATIONS.filter(dest => {
      const matchesSearch =
        dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.locationLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (dest.roomCode && dest.roomCode.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCat = selectedCategory === 'all' || dest.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  const selectedDestination = useMemo(() => {
    return POPULAR_DESTINATIONS.find(d => d.id === selectedDestId) || POPULAR_DESTINATIONS[0];
  }, [selectedDestId]);

  const handleSelectPlace = useCallback((dest: Destination) => {
    setSelectedDestId(dest.id);
    onShowToast(`Selected ${dest.name}`);
  }, [onShowToast]);

  const handleMapSelectDestination = useCallback((name: string, roomCode?: string) => {
    const match = POPULAR_DESTINATIONS.find(d => d.name === name || d.roomCode === roomCode);
    if (match) setSelectedDestId(match.id);
    onNavigateTo(name, roomCode);
  }, [onNavigateTo]);

  return (
    <div className="flex flex-col w-full space-y-4">
      {/* Top Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search campus buildings, labs, classrooms..."
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Quick Filter Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle (Map vs Floorplan) */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg shrink-0">
          <button
            onClick={() => {
              setViewMode('map');
              onShowToast('Switched to Campus Map View');
            }}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              viewMode === 'map'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">map</span>
            <span>Campus Map</span>
          </button>
          <button
            onClick={() => {
              setViewMode('floorplan');
              onShowToast('Switched to Indoor Floor Plan View');
            }}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              viewMode === 'floorplan'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">floor</span>
            <span>Indoor Floor Plan</span>
          </button>
        </div>
      </div>

      {/* Main Google Maps Style Canvas & Side Place Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Place Information & Destinations (4 cols on desktop) */}
        <div className="lg:col-span-4 flex flex-col space-y-3 order-2 lg:order-1">
          {/* Active / Selected Destination Card */}
          {selectedDestination && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider block">
                    {selectedDestination.locationLabel}
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 leading-snug mt-0.5">
                    {selectedDestination.name}
                  </h2>
                </div>
                {selectedDestination.roomCode && (
                  <span className="px-2 py-0.5 bg-blue-50 text-secondary font-mono text-xs font-bold rounded border border-blue-200">
                    {selectedDestination.roomCode}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {selectedDestination.description}
              </p>

              <div className="mt-3 py-2.5 border-y border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-[16px] text-secondary">directions_walk</span>
                  <span>{selectedDestination.walkMinutes} min walk from Gate 1</span>
                </span>
                <span className="font-medium text-slate-500">
                  Ground &bull; Level 2
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => onNavigateTo(selectedDestination.name, selectedDestination.roomCode)}
                  className="flex-1 py-2 px-3 bg-secondary hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <span className="material-symbols-outlined text-[16px]">directions</span>
                  <span>Get Directions</span>
                </button>
                <button
                  onClick={() => {
                    setViewMode('floorplan');
                    onShowToast(`Showing floorplan for ${selectedDestination.name}`);
                  }}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">layers</span>
                  <span>Floor Plan</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick List of Nearby Campus Destinations */}
          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Campus Places ({filteredDestinations.length})
              </span>
              <span className="text-[11px] text-slate-400">
                Tap to view on map
              </span>
            </div>

            <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredDestinations.map(dest => {
                const isSelected = dest.id === selectedDestId;
                return (
                  <div
                    key={dest.id}
                    onClick={() => handleSelectPlace(dest)}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-secondary bg-blue-50/50'
                        : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {dest.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {dest.locationLabel}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-medium text-slate-600 flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[13px] text-slate-400">directions_walk</span>
                        {dest.walkMinutes}m
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateTo(dest.name, dest.roomCode);
                        }}
                        className="text-secondary hover:text-blue-700 p-1 rounded"
                        title="Route to this location"
                      >
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredDestinations.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No places found matching "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Spacious Interactive Map Canvas (8 cols on desktop) */}
        <div className="lg:col-span-8 order-1 lg:order-2">
          {viewMode === 'map' ? (
            <GoogleMapView
              selectedDestinationId={selectedDestId}
              onSelectDestination={handleMapSelectDestination}
              onShowToast={onShowToast}
            />
          ) : (
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    SREC Computer Science Block &bull; Architectural Floor Plan
                  </h3>
                  <p className="text-xs text-slate-500">
                    Interactive indoor room layout with elevators, stairwells, and emergency exits
                  </p>
                </div>
                <button
                  onClick={() => setViewMode('map')}
                  className="px-3 py-1.5 text-xs font-semibold text-secondary hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">map</span>
                  <span>Back to Campus Map</span>
                </button>
              </div>

              <Floorplan2DView
                currentLevel={selectedFloor}
                onSelectLevel={(lvl) => {
                  setSelectedFloor(lvl);
                  onShowToast(`Switched floor to ${lvl}`);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
