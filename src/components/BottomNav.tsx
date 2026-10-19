import React from 'react';
import { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'explore' as TabType, label: 'Explore', icon: 'map' },
    { id: 'timetable' as TabType, label: 'Timetable', icon: 'calendar_today' },
    { id: 'wayfinder' as TabType, label: 'Wayfinder', icon: 'near_me' },
    { id: 'profile' as TabType, label: 'Profile', icon: 'badge' }
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface-container-lowest/95 backdrop-blur-xl shadow-[0_-2px_12px_rgba(15,41,66,0.06)] border-t border-surface-container-high/60">
      <div className="flex justify-around items-center h-[58px] px-space-xs max-w-xl mx-auto">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center min-w-[72px] h-11 transition-all gap-0.5 active:scale-95 ${
                isActive ? 'text-secondary font-semibold' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {tab.icon}
              </span>
              <span className="font-label-md text-label-md">{tab.label}</span>
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-secondary -mt-0.5" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
