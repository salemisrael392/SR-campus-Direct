import React, { useState } from 'react';
import { ClassSession } from '../types';
import { SCHEDULE_DAYS, CLASSES_BY_DAY } from '../data/campusData';

interface TimetableViewProps {
  onNavigateToClass: (cls: ClassSession) => void;
  onOpenUploadSchedule: () => void;
  onShowToast: (msg: string) => void;
}

export const TimetableView: React.FC<TimetableViewProps> = ({
  onNavigateToClass,
  onOpenUploadSchedule,
  onShowToast
}) => {
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(24);
  const [isSyncing, setIsSyncing] = useState(false);

  const classes = CLASSES_BY_DAY[selectedDayNumber] || [];

  const handleSyncCalendar = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      onShowToast('Synced schedule with SR University Academic Portal');
    }, 600);
  };

  const getDayHeading = (dateNum: number) => {
    switch (dateNum) {
      case 21:
        return 'Monday, October 21';
      case 22:
        return 'Tuesday, October 22';
      case 23:
        return 'Wednesday, October 23';
      case 24:
        return 'Thursday, October 24 (Today)';
      case 25:
        return 'Friday, October 25';
      case 26:
        return 'Saturday, October 26';
      default:
        return 'Thursday, October 24';
    }
  };

  return (
    <div className="flex flex-col w-full space-y-4">
      {/* Top Controls Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            {getDayHeading(selectedDayNumber)}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            School of Computer Science &amp; AI &bull; {classes.length} {classes.length === 1 ? 'session' : 'sessions'} scheduled
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncCalendar}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
          >
            <span className={`material-symbols-outlined text-[16px] text-secondary ${isSyncing ? 'animate-spin' : ''}`}>
              sync
            </span>
            <span>Sync</span>
          </button>

          <button
            onClick={onOpenUploadSchedule}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary hover:bg-blue-600 text-xs font-bold text-white transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">upload_file</span>
            <span>Upload Schedule</span>
          </button>
        </div>
      </div>

      {/* Weekday Switcher Strip */}
      <div className="grid grid-cols-6 gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
        {SCHEDULE_DAYS.map(item => {
          const isSelected = selectedDayNumber === item.dateNumber;
          return (
            <button
              key={item.dateNumber}
              onClick={() => setSelectedDayNumber(item.dateNumber)}
              className={`py-2 px-1 rounded-lg flex flex-col items-center justify-center transition-all ${
                isSelected
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
              }`}
            >
              <span className="text-[10px] uppercase opacity-75">{item.day}</span>
              <span className="text-sm font-bold mt-0.5">{item.dateNumber}</span>
              {item.isToday && (
                <span className={`text-[8px] font-bold px-1 rounded mt-0.5 ${isSelected ? 'bg-secondary text-white' : 'text-secondary'}`}>
                  TODAY
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Class Schedule Cards List */}
      <div className="space-y-3">
        {classes.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center text-slate-500 border border-slate-200 shadow-xs">
            <span className="material-symbols-outlined text-[36px] text-slate-300 mb-2">event_available</span>
            <h3 className="text-sm font-bold text-slate-800">No classes scheduled for this day</h3>
            <p className="text-xs text-slate-500 mt-1">Enjoy your study break or visit the SRiX MakerSpace.</p>
          </div>
        ) : (
          classes.map((cls, idx) => {
            const isNext = idx === 0 && selectedDayNumber === 24;
            return (
              <div
                key={cls.id}
                className={`bg-white rounded-xl p-4 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs ${
                  isNext
                    ? 'border-secondary/50 ring-1 ring-secondary/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Time & Session Info */}
                <div className="flex items-start gap-3.5">
                  <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-lg p-2.5 min-w-[85px] text-center">
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {cls.startTime}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {cls.endTime}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-secondary">
                        {cls.code}
                      </span>
                      {cls.tag && (
                        <span className="px-1.5 py-0.2 bg-amber-50 text-amber-800 text-[10px] font-bold rounded border border-amber-200">
                          {cls.tag}
                        </span>
                      )}
                      {isNext && (
                        <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded border border-emerald-200">
                          Next Up
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                      {cls.title}
                    </h3>

                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                      <span className="material-symbols-outlined text-[15px] text-slate-400">location_on</span>
                      <span>{cls.building} &bull; {cls.room} ({cls.floor})</span>
                    </p>
                  </div>
                </div>

                {/* Direct Action Button */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => onNavigateToClass(cls)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-secondary hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-all shadow-xs active:scale-98"
                  >
                    <span className="material-symbols-outlined text-[16px]">directions</span>
                    <span>Show on Map</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
