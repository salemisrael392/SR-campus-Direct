import React from 'react';
import { UNIVERSITY_INFO } from '../data/campusData';
import { TabType } from '../types';

interface FooterProps {
  onTabChange: (tab: TabType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onTabChange }) => {
  return (
    <footer className="w-full bg-slate-900 text-slate-400 border-t border-slate-800 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          {/* Left: Brand & Coordinates */}
          <div className="flex items-center gap-3">
            <img
              src={UNIVERSITY_INFO.logoUrl}
              alt="SR University"
              className="h-7 w-auto object-contain brightness-200"
            />
            <div className="flex items-center gap-2 text-slate-300">
              <span className="font-semibold text-white">{UNIVERSITY_INFO.name}</span>
              <span>&bull;</span>
              <span>Warangal, Telangana</span>
              <span className="hidden sm:inline text-slate-500 font-mono">(18.0418° N, 79.5788° E)</span>
            </div>
          </div>

          {/* Center: Quick navigation links */}
          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <button
              onClick={() => onTabChange('explore')}
              className="hover:text-white transition-colors"
            >
              Campus Map
            </button>
            <button
              onClick={() => onTabChange('wayfinder')}
              className="hover:text-white transition-colors"
            >
              Directions
            </button>
            <button
              onClick={() => onTabChange('timetable')}
              className="hover:text-white transition-colors"
            >
              Timetable
            </button>
            <button
              onClick={() => onTabChange('directory')}
              className="hover:text-white transition-colors"
            >
              Directory
            </button>
            <a
              href={`tel:${UNIVERSITY_INFO.emergencyPhone}`}
              className="text-red-400 hover:text-red-300 font-semibold"
            >
              SOS: {UNIVERSITY_INFO.emergencyPhone}
            </a>
          </div>

          {/* Right: Official Portal Link */}
          <div className="text-slate-500 text-[11px]">
            Official SR University Navigation Portal &copy; {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </footer>
  );
};
