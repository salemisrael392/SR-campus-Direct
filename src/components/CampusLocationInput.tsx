import React, { useState, useRef, useEffect } from 'react';
import { CAMPUS_POIS, CampusPOI } from '../data/campusRouting';

interface CampusLocationInputProps {
  label: string;
  value: string;
  placeholder?: string;
  isOrigin?: boolean;
  onSelectPOI: (poi: CampusPOI) => void;
  onChangeValue: (val: string) => void;
  onUseCurrentLocation?: () => void;
  isLocating?: boolean;
}

export const CampusLocationInput: React.FC<CampusLocationInputProps> = ({
  label,
  value,
  placeholder = 'Type campus building or room...',
  isOrigin = false,
  onSelectPOI,
  onChangeValue,
  onUseCurrentLocation,
  isLocating = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter matching campus POIs
  const query = value.trim().toLowerCase();
  const filteredPOIs = CAMPUS_POIS.filter(poi => {
    if (!query) return true;
    return (
      poi.name.toLowerCase().includes(query) ||
      poi.shortName.toLowerCase().includes(query) ||
      poi.code.toLowerCase().includes(query) ||
      poi.categoryLabel.toLowerCase().includes(query) ||
      (poi.roomDetails && poi.roomDetails.toLowerCase().includes(query)) ||
      poi.aliases.some(a => a.toLowerCase().includes(query))
    );
  });

  const handleSelect = (poi: CampusPOI) => {
    onChangeValue(poi.name);
    onSelectPOI(poi);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChangeValue('');
    setIsOpen(true);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0">
      {/* Input Box */}
      <div
        className={`flex items-center gap-2.5 px-3 py-2 bg-slate-50 border rounded-lg transition-all ${
          isOpen ? 'ring-2 ring-secondary/30 border-secondary bg-white shadow-xs' : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        {/* Origin / Destination Icon Indicator */}
        {isOrigin ? (
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-blue-200 shrink-0" />
        ) : (
          <span className="material-symbols-outlined text-red-600 text-[18px] shrink-0">
            location_on
          </span>
        )}

        <div className="flex-1 min-w-0 flex flex-col">
          <label className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">
            {label}
          </label>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={e => {
              onChangeValue(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="w-full text-xs font-semibold text-slate-900 bg-transparent placeholder:text-slate-400 focus:outline-none truncate"
          />
        </div>

        {/* Action icons (Clear or Geolocation) */}
        <div className="flex items-center gap-1 shrink-0">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear location input"
              className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
              title="Clear"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}

          {isOrigin && onUseCurrentLocation && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onUseCurrentLocation();
              }}
              disabled={isLocating}
              aria-label="Use current location"
              className={`p-1 rounded text-secondary hover:text-blue-700 hover:bg-blue-50 transition-colors ${
                isLocating ? 'animate-spin text-blue-400' : ''
              }`}
              title="Locate me with GPS"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isLocating ? 'sync' : 'my_location'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden max-h-72 flex flex-col animate-in fade-in zoom-in-95 duration-100">
          {/* Quick Option: Use Live Current GPS Position */}
          {onUseCurrentLocation && (
            <button
              type="button"
              onClick={() => {
                onUseCurrentLocation();
                setIsOpen(false);
              }}
              className="w-full px-3 py-2.5 bg-blue-50/70 hover:bg-blue-100/70 border-b border-blue-100 text-left flex items-center gap-2.5 text-secondary text-xs font-semibold transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] text-blue-600">
                near_me
              </span>
              <div className="flex-1">
                <span>Your Current Location</span>
                <span className="block text-[10px] font-normal text-blue-600/80">
                  Pinpoint automatically with campus GPS
                </span>
              </div>
            </button>
          )}

          {/* Popular Campus Chips */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/70 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 pl-1">
              Quick:
            </span>
            {['Gate 1', 'CSE Block', 'Library', 'Hostels', 'SRiX'].map(short => {
              const matched = CAMPUS_POIS.find(p => p.shortName.toLowerCase().includes(short.toLowerCase()));
              if (!matched) return null;
              return (
                <button
                  key={short}
                  type="button"
                  onClick={() => handleSelect(matched)}
                  className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 whitespace-nowrap transition-colors shrink-0"
                >
                  {short}
                </button>
              );
            })}
          </div>

          {/* Matching Campus Places List */}
          <div className="overflow-y-auto max-h-52 divide-y divide-slate-100">
            {filteredPOIs.map(poi => (
              <button
                key={poi.id}
                type="button"
                onClick={() => handleSelect(poi)}
                className="w-full px-3 py-2 text-left hover:bg-slate-50 transition-colors flex items-center justify-between gap-2.5 group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-secondary truncate">
                      {poi.name}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-700 shrink-0">
                      {poi.code}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {poi.categoryLabel} &bull; {poi.description}
                  </p>
                </div>
                <span className="material-symbols-outlined text-[16px] text-slate-300 group-hover:text-secondary shrink-0">
                  north_east
                </span>
              </button>
            ))}

            {filteredPOIs.length === 0 && (
              <div className="px-4 py-6 text-center text-xs text-slate-400">
                No campus location found matching "{value}". Try "Gate 1", "CSE", or "Library".
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
