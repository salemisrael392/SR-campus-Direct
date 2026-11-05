
import React, { useMemo, useState } from 'react';
import {
  CalendarDays,
  CalendarPlus,
  Clock3,
  Moon,
  Plus,
  Sun,
  X,
  MapPin,
  UserRound,
  Trash2,
  Building2,
  ChevronRight,
} from 'lucide-react';
import type { ClassSession } from '../types';

interface TimetableViewProps {
  classes: ClassSession[];
  onAddClass: (cls: ClassSession) => Promise<boolean>;
  onUpdateClass: (cls: ClassSession) => Promise<boolean>;
  onRemoveClass: (id: string) => Promise<boolean>;
  onNavigateToClass: (cls: ClassSession) => void;
  onOpenUploadSchedule: () => void;
  onShowToast: (msg: string) => void;
  sruxActive?: boolean;
}

const DAYS = [
  { label: 'Monday', short: 'MON' },
  { label: 'Tuesday', short: 'TUE' },
  { label: 'Wednesday', short: 'WED' },
  { label: 'Thursday', short: 'THU' },
  { label: 'Friday', short: 'FRI' },
  { label: 'Saturday', short: 'SAT' },
  { label: 'Sunday', short: 'SUN' },
];

const START_MINUTES = 8 * 60 + 30;
const END_MINUTES = 21 * 60 + 30;
const SLOT_MINUTES = 60;
const ROW_HEIGHT = 76;

const TIME_SLOTS = Array.from(
  { length: (END_MINUTES - START_MINUTES) / SLOT_MINUTES },
  (_, index) => START_MINUTES + index * SLOT_MINUTES,
);

const TIME_OPTIONS = Array.from(
  { length: (END_MINUTES - START_MINUTES) / 30 + 1 },
  (_, index) => START_MINUTES + index * 30,
);

const formatTime = (totalMinutes: number) => {
  const hour = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;

  return `${String(displayHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
};

const timeToMinutes = (time: string) => {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return -1;

  let hour = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3].toUpperCase();

  if (hour < 1 || hour > 12 || minutes < 0 || minutes > 59) {
    return -1;
  }

  if (period === 'AM' && hour === 12) hour = 0;
  if (period === 'PM' && hour !== 12) hour += 12;

  return hour * 60 + minutes;
};

const inputClass =
  'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100';

export const TimetableView: React.FC<TimetableViewProps> = ({
  classes,
  onAddClass,
  onUpdateClass,
  onRemoveClass,
  onNavigateToClass,
  onOpenUploadSchedule,
  onShowToast,
  sruxActive = false,
}) => {
  const [isDark, setIsDark] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedClass, setSelectedClass] =
    useState<ClassSession | null>(null);
  const [editingClass, setEditingClass] =
    useState<ClassSession | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [selectedViewDay, setSelectedViewDay] = useState(() => {
    const weekdayCodes = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return weekdayCodes[new Date().getDay()];
  });

  const visibleDays = viewMode === 'daily'
    ? DAYS.filter((day) => day.short === selectedViewDay)
    : DAYS;

  const [selectedDay, setSelectedDay] = useState('MON');
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [startTime, setStartTime] = useState(formatTime(START_MINUTES));
  const [endTime, setEndTime] = useState(
    formatTime(START_MINUTES + 60),
  );
  const [building, setBuilding] = useState('');
  const [room, setRoom] = useState('');
  const [lecturer, setLecturer] = useState('');
  const [formError, setFormError] = useState('');

  const page = isDark
    ? 'bg-slate-950 text-slate-100'
    : 'bg-slate-50 text-slate-900';

  const panel = isDark
    ? 'border-slate-800 bg-slate-900'
    : 'border-slate-200 bg-white';

  const muted = isDark ? 'text-slate-400' : 'text-slate-500';
  const gridBorder = isDark ? 'border-slate-800' : 'border-slate-200';

  const button =
    'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500';

  const classesByDay = useMemo(() => {
    const grouped: Record<string, ClassSession[]> = {
      MON: [],
      TUE: [],
      WED: [],
      THU: [],
      FRI: [],
      SAT: [],
      SUN: [],
    };

    for (const cls of classes) {
      if (grouped[cls.day]) {
        grouped[cls.day].push(cls);
      }
    }

    Object.values(grouped).forEach((items) =>
      items.sort(
        (a, b) =>
          timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
      ),
    );

    return grouped;
  }, [classes]);

  const openAddForm = (
    day = 'MON',
    slotStart = START_MINUTES,
  ) => {
    if (isSaving || sruxActive) return;

    setEditingClass(null);
    setSelectedDay(day);
    setCourseName('');
    setCourseCode('');
    setStartTime(formatTime(slotStart));
    setEndTime(
      formatTime(Math.min(slotStart + 60, END_MINUTES)),
    );
    setBuilding('');
    setRoom('');
    setLecturer('');
    setFormError('');
    setIsAddOpen(true);
  };

  const openEditForm = (cls: ClassSession) => {
    if (isSaving || sruxActive || cls.source !== 'manual') return;

    setEditingClass(cls);
    setSelectedDay(cls.day);
    setCourseName(cls.title);
    setCourseCode(cls.code);
    setStartTime(cls.startTime);
    setEndTime(cls.endTime);
    setBuilding(
      cls.building === 'Building not specified' ? '' : cls.building,
    );
    setRoom(cls.room === 'Room not specified' ? '' : cls.room);
    setLecturer(cls.professor?.name ?? '');
    setFormError('');
    setSelectedClass(null);
    setIsAddOpen(true);
  };

  const handleAddClass = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    if (isSaving || sruxActive) return;

    setFormError('');

    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);

    if (!courseName.trim() || !courseCode.trim()) {
      setFormError(
        'Enter both the course name and course code.',
      );
      return;
    }

    if (
      start < START_MINUTES ||
      end > END_MINUTES ||
      start >= end
    ) {
      setFormError(
        'Choose a valid time between 08:30 AM and 09:30 PM.',
      );
      return;
    }

    const conflict = classes.some((existing) => {
      if (
        existing.day !== selectedDay ||
        existing.id === editingClass?.id
      ) {
        return false;
      }

      const existingStart = timeToMinutes(existing.startTime);
      const existingEnd = timeToMinutes(existing.endTime);

      return start < existingEnd && end > existingStart;
    });

    if (conflict) {
      setFormError(
        'This time overlaps another class on that day. Choose a different time.',
      );
      return;
    }

    const newClass: ClassSession = {
      id:
        editingClass?.id ??
        `class-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      code: courseCode.trim().toUpperCase(),
      title: courseName.trim(),
      startTime,
      endTime,
      tag: 'Class',
      major: '',
      professor: {
        name: lecturer.trim(),
        avatar: '',
      },
      building: building.trim() || 'Building not specified',
      floor: '',
      room: room.trim() || 'Room not specified',
      walkMinutes: 0,
      walkMeters: 0,
      day: selectedDay,
      dateNumber: 0,
      source: editingClass?.source ?? 'manual',
    };

    setIsSaving(true);

    try {
      const saved = editingClass
        ? await onUpdateClass(newClass)
        : await onAddClass(newClass);

      if (saved) {
        setIsAddOpen(false);
        setEditingClass(null);
      } else {
        setFormError(
          'Could not save this class. Please check your connection and try again.',
        );
      }
    } catch {
      setFormError(
        'Could not save this class. Please check your connection and try again.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveClass = async (): Promise<void> => {
    if (
      !selectedClass ||
      isRemoving ||
      sruxActive ||
      selectedClass.source !== 'manual'
    ) {
      return;
    }

    const classToRemove = selectedClass;
    setIsRemoving(true);

    try {
      const removed = await onRemoveClass(classToRemove.id);

      if (removed) {
        setSelectedClass(null);
      }
    } catch {
      onShowToast(
        'Could not remove this class. Please try again.',
      );
    } finally {
      setIsRemoving(false);
    }
  };

  const empty = classes.length === 0;

  const selectedDayLabel =
    DAYS.find((day) => day.short === selectedClass?.day)?.label ??
    selectedClass?.day ??
    '';

  const canManageSelectedClass =
    selectedClass?.source === 'manual' && !sruxActive;

  const closeClassDetails = () => {
    if (!isRemoving) {
      setSelectedClass(null);
    }
  };

  const closeAddForm = () => {
    if (!isSaving) {
      setIsAddOpen(false);
      setEditingClass(null);
      setFormError('');
    }
  };

  return (
    <section
      className={`min-h-[70vh] w-full min-w-0 transition-colors ${page}`}
    >
      <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className={`mb-2 flex items-center gap-2 text-sm ${muted}`}>
            <CalendarDays size={16} aria-hidden="true" />
            <span>Campus Companion</span>
            <span aria-hidden="true">/</span>
            <span>Timetable</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            My Timetable
          </h1>

          <p
            className={`mt-2 max-w-2xl text-sm leading-6 sm:text-base ${muted}`}
          >
            Organise your university week, one class at a time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsDark((current) => !current)}
            className={`${button} ${panel}`}
            aria-label={
              isDark ? 'Switch to light theme' : 'Switch to dark theme'
            }
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
            <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenUploadSchedule}
            className={`${button} ${panel}`}
          >
            <CalendarPlus size={17} />
            Import timetable
          </button>

          {!sruxActive && (
            <button
              type="button"
              onClick={() => openAddForm()}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              <Plus size={18} />
              Add class
            </button>
          )}
        </div>
      </header>

      <div
        className={`mb-5 flex items-start gap-3 rounded-xl border p-4 ${
          isDark
            ? 'border-emerald-900 bg-emerald-950/30'
            : 'border-emerald-100 bg-emerald-50'
        }`}
      >
        <CalendarDays
          size={21}
          className="mt-0.5 shrink-0 text-emerald-700"
        />

        <div>
          <p
            className={`text-sm font-semibold ${
              isDark ? 'text-emerald-200' : 'text-emerald-950'
            }`}
          >
            {sruxActive
              ? empty
                ? 'Your official SRUX timetable is active'
                : `${classes.length} official ${classes.length === 1 ? 'class' : 'classes'} scheduled`
              : empty
                ? 'Your timetable is ready to personalise'
                : `${classes.length} ${classes.length === 1 ? 'class' : 'classes'} scheduled`}
          </p>

          <p
            className={`mt-1 text-sm leading-5 ${
              isDark
                ? 'text-emerald-200/80'
                : 'text-emerald-900/80'
            }`}
          >
            {sruxActive
              ? 'Your official SRUX timetable is active. Select a class to view its details. Manage your subscription through Import timetable.'
              : 'Add your actual classes or import your official SRUX timetable. Select any class card to see its full details and available actions.'}
          </p>
        </div>
      </div>

      <div className={`overflow-hidden rounded-2xl border shadow-sm ${panel}`}>
        <div className="flex flex-col gap-3 border-b border-inherit p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="min-w-0">
            <h2 className="text-lg font-bold sm:text-xl">
              {viewMode === 'daily' ? 'Daily timetable' : 'Weekly timetable'}
            </h2>

            <p className={`mt-1 text-sm ${muted}`}>
              {viewMode === 'daily'
                ? `${DAYS.find((day) => day.short === selectedViewDay)?.label ?? 'Selected day'} · 08:30 AM – 09:30 PM`
                : 'Monday – Sunday · 08:30 AM – 09:30 PM'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className={`inline-flex rounded-xl border p-1 ${gridBorder} ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
              <button
                type="button"
                onClick={() => setViewMode('daily')}
                aria-pressed={viewMode === 'daily'}
                className={`min-h-9 rounded-lg px-3 text-sm font-semibold transition ${
                  viewMode === 'daily'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : `${muted} hover:bg-emerald-50 hover:text-emerald-800`
                }`}
              >
                Daily
              </button>
              <button
                type="button"
                onClick={() => setViewMode('weekly')}
                aria-pressed={viewMode === 'weekly'}
                className={`min-h-9 rounded-lg px-3 text-sm font-semibold transition ${
                  viewMode === 'weekly'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : `${muted} hover:bg-emerald-50 hover:text-emerald-800`
                }`}
              >
                Weekly
              </button>
            </div>

            {viewMode === 'daily' && (
              <select
                value={selectedViewDay}
                onChange={(event) => setSelectedViewDay(event.target.value)}
                aria-label="Select timetable day"
                className={`min-h-10 rounded-xl border px-3 text-sm font-semibold outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 ${
                  isDark
                    ? 'border-slate-700 bg-slate-950 text-slate-100'
                    : 'border-slate-200 bg-white text-slate-800'
                }`}
              >
                {DAYS.map((day) => (
                  <option key={day.short} value={day.short}>{day.label}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className={viewMode === 'daily' ? 'min-w-[360px]' : 'min-w-[1400px]'}>
            <div
              className={`grid ${viewMode === 'daily' ? 'grid-cols-[76px_minmax(0,1fr)]' : 'grid-cols-[100px_repeat(7,minmax(0,1fr))]'} border-b ${gridBorder}`}
            >
              <div
                className={`flex items-center justify-center border-r p-3 ${gridBorder}`}
              >
                <Clock3
                  size={17}
                  className={muted}
                  aria-label="Time"
                />
              </div>

              {visibleDays.map((day) => (
                <div
                  key={day.short}
                  className={`flex min-h-[68px] flex-col items-center justify-center border-r px-2 py-3 last:border-r-0 ${gridBorder}`}
                >
                  <span className="text-sm font-semibold">
                    {day.label}
                  </span>
                </div>
              ))}
            </div>

            <div className={`grid ${viewMode === 'daily' ? 'grid-cols-[76px_minmax(0,1fr)]' : 'grid-cols-[100px_repeat(7,minmax(0,1fr))]'}`}>
              <div>
                {TIME_SLOTS.map((slotStart) => (
                  <div
                    key={slotStart}
                    className={`relative h-[76px] border-b border-r ${gridBorder}`}
                  >
                    <span
                      className={`absolute -top-2.5 right-2 text-[11px] font-medium ${muted}`}
                    >
                      {formatTime(slotStart)}
                    </span>
                  </div>
                ))}
              </div>

              {visibleDays.map((day) => (
                <div
                  key={day.short}
                  className={`relative grid border-r last:border-r-0 ${gridBorder}`}
                  style={{
                    gridTemplateRows: `repeat(${TIME_SLOTS.length}, ${ROW_HEIGHT}px)`,
                  }}
                >
                  {TIME_SLOTS.map((slotStart) => (
                    <button
                      key={`${day.short}-${slotStart}`}
                      type="button"
                      onClick={() => openAddForm(day.short, slotStart)}
                      disabled={sruxActive}
                      aria-label={`Add a class on ${day.label} at ${formatTime(slotStart)}`}
                      className={`border-b transition ${
                        sruxActive
                          ? 'cursor-default'
                          : isDark
                            ? 'border-slate-800 hover:bg-slate-800/60'
                            : 'border-slate-100 hover:bg-emerald-50/70'
                      }`}
                    />
                  ))}

                  {classesByDay[day.short].map((cls) => {
                    const start = timeToMinutes(cls.startTime);
                    const end = timeToMinutes(cls.endTime);

                    if (
                      start < START_MINUTES ||
                      end > END_MINUTES ||
                      end <= start
                    ) {
                      return null;
                    }

                    const top =
                      ((start - START_MINUTES) / SLOT_MINUTES) *
                        ROW_HEIGHT +
                      3;

                    const height =
                      ((end - start) / SLOT_MINUTES) * ROW_HEIGHT - 6;

                    const duration = end - start;

                    return (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => setSelectedClass(cls)}
                        aria-label={`View ${cls.code}, ${cls.title}, ${cls.startTime} to ${cls.endTime}`}
                        title={`${cls.code}: ${cls.title}. Select to view details.`}
                        className={`group absolute left-1 right-1 z-10 flex flex-col items-start overflow-hidden rounded-xl border border-emerald-300 bg-emerald-100 text-left text-emerald-950 shadow-sm transition hover:border-emerald-500 hover:bg-emerald-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1 ${
                          viewMode === 'weekly' ? 'p-1.5 sm:p-2' : 'p-2'
                        } ${
                          isDark
                            ? 'border-emerald-800 bg-emerald-950 text-emerald-100 hover:bg-emerald-900'
                            : ''
                        }`}
                        style={{ top, height: Math.max(height, 30) }}
                      >
                        {viewMode === 'weekly' ? (
                          <>
                            {cls.source === 'official' && (
                              <span className="absolute right-1.5 top-1.5 rounded bg-blue-700 px-1 py-0.5 text-[8px] font-bold leading-none text-white">
                                SRUX
                              </span>
                            )}

                            <span className={`mt-0.5 line-clamp-3 w-full min-w-0 break-words pr-7 text-[11px] font-bold leading-[1.2] sm:text-xs ${
                              isDark ? 'text-emerald-100' : 'text-emerald-950'
                            }`}>
                              {cls.title}
                            </span>
                          </>
                        ) : (
                          <>
                            {(cls.code || cls.source === 'official') && (
                              <div className="flex w-full min-w-0 shrink-0 items-center justify-between gap-1">
                                {cls.code ? (
                                  <span className="min-w-0 truncate text-[10px] font-bold tracking-wide opacity-75 sm:text-xs">
                                    {cls.code}
                                  </span>
                                ) : (
                                  <span />
                                )}

                                {cls.source === 'official' && (
                                  <span className="shrink-0 rounded-md bg-blue-700 px-1.5 py-0.5 text-[9px] font-bold text-white">
                                    SRUX
                                  </span>
                                )}
                              </div>
                            )}

                            <span className="mt-1 line-clamp-2 w-full min-w-0 break-words text-xs font-bold leading-snug sm:text-sm">
                              {cls.title}
                            </span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className={`flex items-center gap-2 border-t p-4 text-xs leading-5 ${gridBorder} ${muted}`}
        >
          <Clock3 size={15} aria-hidden="true" />
          <p>
            Timetable hours run from 08:30 AM to 09:30 PM, Monday through Sunday.
            {sruxActive
              ? ' Your official SRUX classes are read-only.'
              : ' Select an empty slot to add a class, or select an existing class to view its details.'}
          </p>
        </div>
      </div>

      {empty && (
        <div
          className={`mt-6 flex flex-col items-center rounded-2xl border border-dashed px-5 py-8 text-center sm:py-10 ${
            isDark ? 'border-slate-700' : 'border-slate-300'
          }`}
        >
          <div
            className={`mb-3 flex size-12 items-center justify-center rounded-2xl ${
              isDark
                ? 'bg-slate-800 text-slate-300'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            <CalendarDays size={24} />
          </div>

          <h3 className="text-base font-bold">
            {sruxActive
              ? 'No official classes are currently available'
              : 'Nothing scheduled yet'}
          </h3>

          <p className={`mt-2 max-w-md text-sm leading-6 ${muted}`}>
            {sruxActive
              ? 'Your SRUX subscription is active, but no classes are currently being displayed. Your last successful timetable will remain available if a temporary source problem occurs.'
              : 'Start by adding your first class. It will appear on the weekly grid at the selected day and time.'}
          </p>

          {!sruxActive && (
            <button
              type="button"
              onClick={() => openAddForm()}
              className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              <Plus size={17} />
              Add your first class
            </button>
          )}
        </div>
      )}

      {selectedClass && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !isRemoving
            ) {
              closeClassDetails();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="class-details-title"
            className="my-auto w-full max-w-lg overflow-hidden rounded-2xl bg-white text-slate-900 shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6">
              <div className="min-w-0 pr-3">
                <span className="inline-flex rounded-lg bg-emerald-100 px-3 py-1 text-xs font-extrabold tracking-wide text-emerald-900">
                  {selectedClass.code || 'Class'}
                </span>

                <h2
                  id="class-details-title"
                  className="mt-3 break-words text-xl font-bold sm:text-2xl"
                >
                  {selectedClass.title}
                </h2>

                <p className="mt-2 text-sm font-medium text-slate-500">
                  {selectedDayLabel}
                </p>

                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {selectedClass.source === 'official'
                    ? 'Official SRUX timetable'
                    : selectedClass.source === 'upload'
                      ? 'Imported timetable'
                      : 'Manually entered class'}
                </p>
              </div>

              <button
                type="button"
                onClick={closeClassDetails}
                disabled={isRemoving}
                aria-label="Close class details"
                className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-5 sm:p-6">
              <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                <Clock3
                  className="mt-0.5 shrink-0 text-emerald-700"
                  size={20}
                />

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Class time
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    {selectedClass.startTime} – {selectedClass.endTime}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                <Building2
                  className="mt-0.5 shrink-0 text-emerald-700"
                  size={20}
                />

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    Location
                  </p>

                  <p className="mt-1 break-words text-sm text-slate-600">
                    {selectedClass.building}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    {selectedClass.room}
                    {selectedClass.floor
                      ? ` · ${selectedClass.floor}`
                      : ''}
                  </p>
                </div>
              </div>

              {selectedClass.professor?.name && (
                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                  <UserRound
                    className="mt-0.5 shrink-0 text-emerald-700"
                    size={20}
                  />

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Lecturer
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      {selectedClass.professor.name}
                    </p>
                  </div>
                </div>
              )}

              {selectedClass.source !== 'manual' && (
                <p className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm leading-5 text-blue-900">
                  {selectedClass.source === 'official'
                    ? 'This class comes from the official SRUX timetable and cannot be edited or removed individually. Unsubscribe from the SRUX timetable to remove the official schedule.'
                    : 'This imported class cannot be edited or removed individually here.'}
                </p>
              )}

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:flex-wrap">
                {canManageSelectedClass && (
                  <button
                    type="button"
                    disabled={isRemoving || isSaving}
                    onClick={() => openEditForm(selectedClass)}
                    className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-200 px-4 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Edit class
                  </button>
                )}

                <button
                  type="button"
                  disabled={isRemoving}
                  onClick={() => {
                    const cls = selectedClass;
                    closeClassDetails();
                    onNavigateToClass(cls);
                  }}
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <MapPin size={17} />
                  Navigate to class
                </button>

                {canManageSelectedClass && (
                  <button
                    type="button"
                    onClick={handleRemoveClass}
                    disabled={isRemoving}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 size={17} />
                    {isRemoving ? 'Removing…' : 'Remove class'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isAddOpen && !sruxActive && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !isSaving
            ) {
              closeAddForm();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-class-title"
            className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white text-slate-900 shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6">
              <div>
                <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <CalendarPlus size={21} />
                </div>

                <h2 id="add-class-title" className="text-xl font-bold">
                  {editingClass ? 'Edit class' : 'Add a class'}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingClass
                    ? 'Update the course details and schedule.'
                    : 'Enter your course details and schedule.'}
                </p>
              </div>

              <button
                type="button"
                onClick={closeAddForm}
                disabled={isSaving}
                aria-label="Close add class form"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleAddClass}
              className="space-y-5 p-5 sm:p-6"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold">
                  Course name *
                  <input
                    required
                    value={courseName}
                    onChange={(event) =>
                      setCourseName(event.target.value)
                    }
                    placeholder="e.g. Object-Oriented Programming"
                    className={inputClass}
                    maxLength={100}
                    disabled={isSaving}
                  />
                </label>

                <label className="text-sm font-semibold">
                  Course code *
                  <input
                    required
                    value={courseCode}
                    onChange={(event) =>
                      setCourseCode(event.target.value)
                    }
                    placeholder="e.g. CS203"
                    className={inputClass}
                    maxLength={20}
                    disabled={isSaving}
                  />
                </label>
              </div>

              <label className="block text-sm font-semibold">
                Weekday *
                <select
                  value={selectedDay}
                  onChange={(event) =>
                    setSelectedDay(event.target.value)
                  }
                  className={inputClass}
                  disabled={isSaving}
                >
                  {DAYS.map((day) => (
                    <option key={day.short} value={day.short}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold">
                  Starts at *
                  <select
                    value={startTime}
                    onChange={(event) => {
                      const nextStart = event.target.value;
                      setStartTime(nextStart);

                      if (
                        timeToMinutes(endTime) <=
                        timeToMinutes(nextStart)
                      ) {
                        const next = TIME_OPTIONS.find(
                          (time) =>
                            time > timeToMinutes(nextStart),
                        );

                        if (next !== undefined) {
                          setEndTime(formatTime(next));
                        }
                      }
                    }}
                    className={inputClass}
                    disabled={isSaving}
                  >
                    {TIME_OPTIONS.slice(0, -1).map((time) => (
                      <option key={time} value={formatTime(time)}>
                        {formatTime(time)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-semibold">
                  Ends at *
                  <select
                    value={endTime}
                    onChange={(event) =>
                      setEndTime(event.target.value)
                    }
                    className={inputClass}
                    disabled={isSaving}
                  >
                    {TIME_OPTIONS.filter(
                      (time) =>
                        time > timeToMinutes(startTime),
                    ).map((time) => (
                      <option key={time} value={formatTime(time)}>
                        {formatTime(time)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold">
                  Building
                  <input
                    value={building}
                    onChange={(event) =>
                      setBuilding(event.target.value)
                    }
                    placeholder="e.g. Computer Science Block"
                    className={inputClass}
                    maxLength={100}
                    disabled={isSaving}
                  />
                </label>

                <label className="text-sm font-semibold">
                  Room
                  <input
                    value={room}
                    onChange={(event) =>
                      setRoom(event.target.value)
                    }
                    placeholder="e.g. Room 204"
                    className={inputClass}
                    maxLength={50}
                    disabled={isSaving}
                  />
                </label>
              </div>

              <label className="block text-sm font-semibold">
                Lecturer (optional)
                <span className="relative mt-1.5 block">
                  <UserRound
                    size={17}
                    className="absolute left-3 top-3 text-slate-400"
                  />

                  <input
                    value={lecturer}
                    onChange={(event) =>
                      setLecturer(event.target.value)
                    }
                    placeholder="Lecturer's name"
                    className={`${inputClass} mt-0 pl-9`}
                    maxLength={100}
                    disabled={isSaving}
                  />
                </span>
              </label>

              {formError && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700"
                >
                  {formError}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeAddForm}
                  disabled={isSaving}
                  className="min-h-11 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving || sruxActive}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus size={17} />
                  {isSaving
                    ? 'Saving…'
                    : editingClass
                      ? 'Save changes'
                      : 'Save class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
