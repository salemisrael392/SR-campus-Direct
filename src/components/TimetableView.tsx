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
  const [previewDrawerClass, setPreviewDrawerClass] = useState<ClassSession | null>(null);

  const classes = CLASSES_BY_DAY[selectedDayNumber] || [];

  const handleSyncCalendar = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      onShowToast('Synced with SR Registrar & Academic Calendar');
    }, 700);
  };

  const getDayLabel = (dateNum: number) => {
    switch (dateNum) {
      case 21:
        return 'Monday, October 21';
      case 22:
        return 'Tuesday, October 22';
      case 23:
        return 'Wednesday, October 23';
      case 24:
        return 'Thursday, October 24';
      case 25:
        return 'Friday, October 25';
      case 26:
        return 'Saturday, October 26';
      default:
        return 'Thursday, October 24';
    }
  };

  return (
    <div className="flex flex-col w-full pb-8">
      {/* Top Greeting & Date Block */}
      <section className="px-gutter pt-4 pb-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
              Fall Semester 2024
            </p>
            <h1 className="font-headline-sm text-headline-sm text-on-surface">
              {getDayLabel(selectedDayNumber)}
            </h1>
          </div>
          <button
            onClick={handleSyncCalendar}
            aria-label="Sync Academic Calendar"
            className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary transition-transform active:scale-95 shadow-sm"
            id="calendar-sync-btn"
          >
            <span className={`material-symbols-outlined text-[20px] ${isSyncing ? 'animate-spin text-secondary' : ''}`}>
              sync
            </span>
          </button>
        </div>

        {/* Daily Status Pill */}
        <div className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant shadow-sm">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="font-label-md text-label-md font-semibold">
            {classes.length} {classes.length === 1 ? 'Class' : 'Classes'} Today • First session starts at{' '}
            {classes[0]?.startTime || '10:00 AM'}
          </span>
        </div>
      </section>

      {/* Horizontal Week Day Selector */}
      <section className="w-full pb-3">
        <div className="flex items-center gap-2 overflow-x-auto px-gutter no-scrollbar py-1" id="day-selector-track">
          {SCHEDULE_DAYS.map(item => {
            const isSelected = selectedDayNumber === item.dateNumber;
            return (
              <button
                key={item.dateNumber}
                onClick={() => setSelectedDayNumber(item.dateNumber)}
                className={`day-chip flex flex-col items-center justify-center min-w-[54px] py-2 px-2.5 rounded-2xl transition-all active:scale-95 ${
                  isSelected
                    ? 'active-day min-w-[58px] bg-secondary text-on-secondary shadow-md scale-[1.03]'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="font-label-sm text-label-sm opacity-80 font-bold">{item.day}</span>
                <span className="font-title-sm text-title-sm mt-0.5 font-bold">{item.dateNumber}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-on-secondary mt-1" />}
              </button>
            );
          })}
        </div>
      </section>

      {/* Live Reminder & Wayfinder Alert Banner */}
      <section className="px-gutter mb-4">
        <div className="relative overflow-hidden bg-primary-container text-on-primary rounded-2xl p-4 shadow-sm">
          <div className="absolute -right-6 -bottom-8 w-28 h-28 rounded-full bg-secondary/20 pointer-events-none blur-xl" />
          <div className="flex items-start gap-3 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0 text-on-secondary shadow-sm">
              <span className="material-symbols-outlined text-[20px]">view_in_ar</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-title-sm text-title-sm text-on-primary font-semibold">
                  Daily Class Reminder Active
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-tertiary-fixed-dim text-on-tertiary-fixed font-label-sm text-label-sm font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
                  AR Live Guide
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-surface-container-high mt-0.5 line-clamp-2">
                Notification set 15m prior with instant 3D indoor camera wayfinding and live walk-time calculation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Classes Timeline Section */}
      <section className="px-gutter flex flex-col gap-4 mb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-title-md text-title-md text-on-surface">Schedule Sequence</span>
            <span className="font-code-sm text-code-sm px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-semibold">
              {classes.length} Sessions
            </span>
          </div>
          <span className="font-label-md text-label-md text-secondary font-medium">Campus East Zone</span>
        </div>

        {classes.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-2xl p-8 text-center text-on-surface-variant shadow-sm">
            <span className="material-symbols-outlined text-[36px] text-secondary mb-2">event_available</span>
            <p className="font-title-sm text-title-sm text-on-surface">No classes scheduled for this day</p>
            <p className="font-body-sm text-body-sm mt-1">Enjoy your study break or check university events.</p>
          </div>
        ) : (
          classes.map((cls, index) => {
            const isHero = index === 0 && selectedDayNumber === 24;

            if (isHero) {
              return (
                <article
                  key={cls.id}
                  className="bg-surface-container-lowest rounded-2xl p-4 shadow-md transition-all hover:shadow-lg relative overflow-hidden"
                >
                  {/* Active marker ribbon */}
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-secondary" />
                  <div className="pl-2">
                    {/* Status & Time Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-title-sm text-title-sm text-primary font-bold">
                          {cls.startTime} - {cls.endTime}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping" />
                          {cls.tag}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm font-semibold">
                        {cls.major}
                      </span>
                    </div>

                    {/* Course Meta */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <h2 className="font-title-md text-title-md text-on-surface truncate">{cls.title}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <img
                            className="w-6 h-6 rounded-full object-cover"
                            src={cls.professor.avatar}
                            alt={cls.professor.name}
                          />
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            {cls.professor.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Venue Pill Badge & Live AR Wayfinder Badge */}
                    <div className="p-3 rounded-xl bg-surface-container-low flex flex-col gap-2 mb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="material-symbols-outlined text-[18px] text-secondary">location_on</span>
                          <span className="font-label-lg text-label-lg text-primary truncate">
                            {cls.building} • {cls.floor}
                          </span>
                        </div>
                        <span className="font-code-sm text-code-sm font-semibold px-2 py-0.5 rounded-md bg-surface-container-highest text-secondary">
                          {cls.room}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 font-body-sm text-body-sm text-on-surface-variant">
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-outline">directions_walk</span>
                          {cls.walkMinutes} min walking distance ({cls.walkMeters}m)
                        </span>
                        <span className="inline-flex items-center gap-1 text-secondary font-semibold font-label-sm text-label-sm bg-secondary-fixed/50 px-2 py-0.5 rounded-full">
                          <span className="material-symbols-outlined text-[14px]">view_in_ar</span> Live AR Ready
                        </span>
                      </div>
                    </div>

                    {/* Primary Action Trigger for 3D AR Wayfinder */}
                    <button
                      onClick={() => setPreviewDrawerClass(cls)}
                      className="w-full h-11 bg-secondary text-on-secondary rounded-xl font-label-lg text-label-lg flex items-center justify-center gap-2 shadow-md transition-transform active:scale-[0.98]"
                    >
                      <span className="material-symbols-outlined text-[20px]">view_in_ar</span>
                      <span className="font-bold">Launch 3D AR Wayfinder</span>
                      <span className="ml-1 px-1.5 py-0.2 rounded bg-surface-container-lowest/20 text-on-secondary font-label-sm text-label-sm uppercase tracking-wide">
                        3D View
                      </span>
                    </button>
                  </div>
                </article>
              );
            }

            return (
              <article
                key={cls.id}
                className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-title-sm text-title-sm text-on-surface-variant font-medium">
                    {cls.startTime} - {cls.endTime}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                    {cls.major}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <h2 className="font-title-md text-title-md text-on-surface truncate">{cls.title}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <img
                        className="w-6 h-6 rounded-full object-cover"
                        src={cls.professor.avatar}
                        alt={cls.professor.name}
                      />
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {cls.professor.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Venue Pill Badge */}
                <div className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                      {cls.room.includes('Lab') ? 'science' : 'apartment'}
                    </span>
                    <span className="font-label-lg text-label-lg text-primary truncate">
                      {cls.building} {cls.floor ? `• ${cls.floor}` : ''}
                    </span>
                  </div>
                  <span className="font-code-sm text-code-sm font-semibold px-2 py-0.5 rounded-md bg-surface-container-highest text-primary">
                    {cls.room}
                  </span>
                </div>

                {/* Secondary AR Trigger Button */}
                <button
                  onClick={() => setPreviewDrawerClass(cls)}
                  className="w-full h-10 bg-surface-container-high text-primary rounded-xl font-label-lg text-label-lg flex items-center justify-between px-3 transition-transform active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[19px] text-secondary">view_in_ar</span>
                    <span className="font-semibold">AR Route to {cls.room}</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded-md bg-secondary text-on-secondary font-label-sm text-label-sm font-bold">
                    3D AR
                  </span>
                </button>
              </article>
            );
          })
        )}
      </section>

      {/* Quick Action & Timetable Syllabus Upload Card */}
      <section className="px-gutter mb-6">
        <div className="bg-surface-container rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[22px]">auto_stories</span>
              <h3 className="font-title-sm text-title-sm text-on-surface font-semibold">
                Curriculum &amp; Timetable Sync
              </h3>
            </div>
            <span className="font-code-sm text-code-sm px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-semibold">
              Sem 3
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-lowest">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[18px]">school</span>
              </div>
              <div className="min-w-0">
                <p className="font-label-lg text-label-lg text-primary truncate font-semibold">
                  B.Sc Computer Science
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Cohort 2023–2027 • Year 2</p>
              </div>
            </div>
            <button
              onClick={onOpenUploadSchedule}
              className="text-secondary font-label-md text-label-md flex items-center gap-0.5 shrink-0 hover:underline font-semibold"
            >
              Change
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </button>
          </div>

          {/* Action Button for PDF/Schedule import */}
          <button
            onClick={onOpenUploadSchedule}
            className="w-full h-11 rounded-xl bg-primary-container text-on-primary flex items-center justify-center gap-2 font-label-lg text-label-lg shadow-sm active:scale-[0.98] transition-transform"
          >
            <span className="material-symbols-outlined text-[19px]">upload_file</span>
            <span>Upload New Timetable or PDF Syllabus</span>
          </button>
          <p className="font-label-sm text-label-sm text-center text-outline">
            Auto-parses room numbers, professor schedules, and building codes into Wayfinder.
          </p>
        </div>
      </section>

      {/* 3D AR Wayfinder Navigation Preview Overlay Drawer */}
      {previewDrawerClass && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-primary/60 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-xl mx-auto bg-surface-container-lowest rounded-t-3xl shadow-xl p-4 flex flex-col gap-3 pb-8 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            {/* Drag Handle */}
            <div className="w-10 h-1 bg-outline-variant rounded-full self-center mb-1" />

            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-secondary text-on-secondary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">view_in_ar</span>
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">3D AR Wayfinder</h3>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Live Indoor Camera Navigation • {previewDrawerClass.building} {previewDrawerClass.floor}
                </p>
              </div>
              <button
                onClick={() => setPreviewDrawerClass(null)}
                className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* 3D Preview Visual Card */}
            <div className="relative w-full h-44 rounded-2xl bg-primary-container overflow-hidden flex flex-col justify-between p-3 text-on-primary">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-30"
                style={{
                  backgroundImage:
                    'url("https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80")'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-primary/40 pointer-events-none" />

              {/* Top AR Status Badges */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm font-semibold shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-on-secondary animate-pulse" />
                  Instant AR Corridor Sync
                </span>
                <span className="px-2 py-0.5 rounded-md bg-surface-container-lowest/20 backdrop-blur-md text-on-primary font-code-sm text-code-sm">
                  60 FPS • LiDAR Active
                </span>
              </div>

              {/* Center AR Reticle & 3D Pathway Mock */}
              <div className="relative z-10 flex flex-col items-center justify-center my-auto">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-tertiary-fixed-dim flex items-center justify-center animate-spin">
                  <span className="material-symbols-outlined text-[24px] text-tertiary-fixed-dim">near_me</span>
                </div>
                <span className="font-label-md text-label-md text-on-primary mt-1 font-bold tracking-wide">
                  Target: {previewDrawerClass.room} ({previewDrawerClass.walkMeters}m Ahead)
                </span>
              </div>

              {/* Bottom AR Info Strip */}
              <div className="relative z-10 flex items-center justify-between text-surface-container-high font-body-sm text-body-sm bg-primary/60 backdrop-blur-md px-2.5 py-1.5 rounded-xl">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-tertiary-fixed-dim">stairs</span> Take{' '}
                  {previewDrawerClass.building} Elevator or Stairs to {previewDrawerClass.floor}
                </span>
                <span className="font-semibold text-tertiary-fixed-dim">{previewDrawerClass.walkMinutes} min</span>
              </div>
            </div>

            {/* Route Guidance Points */}
            <div className="grid grid-cols-2 gap-2 text-on-surface">
              <div className="p-2.5 rounded-xl bg-surface-container-low flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">camera</span>
                <div className="min-w-0">
                  <p className="font-label-sm text-label-sm text-outline uppercase">View</p>
                  <p className="font-label-md text-label-md font-semibold truncate">Camera AR Overlay</p>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-container-low flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">turn_right</span>
                <div className="min-w-0">
                  <p className="font-label-sm text-label-sm text-outline uppercase">Next Step</p>
                  <p className="font-label-md text-label-md font-semibold truncate">Turn Right at Atrium</p>
                </div>
              </div>
            </div>

            {/* Primary CTA */}
            <button
              onClick={() => {
                const target = previewDrawerClass;
                setPreviewDrawerClass(null);
                onNavigateToClass(target);
              }}
              className="w-full h-12 bg-secondary text-on-secondary rounded-xl font-label-lg text-label-lg flex items-center justify-center gap-2 shadow-md transition-transform active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[22px]">view_in_ar</span>
              <span className="font-bold">Open Full AR Wayfinder</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
