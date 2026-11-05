
import React, { useEffect, useMemo, useState } from 'react';

export interface SruxYearOption {
  year: string;
  batches: string[];
}

export interface SruxDegreeOption {
  degree: string;
  years: SruxYearOption[];
}

export interface SruxOptionsResponse {
  degrees: SruxDegreeOption[];
}

export interface SruxSubscription {
  id: string;
  degree: string;
  academic_year: string;
  batch_id: string;
  source_last_updated: string | null;
  last_checked_at: string | null;
  last_successful_sync_at: string | null;
  sync_status: 'pending' | 'synced' | 'stale' | 'error';
  last_error: string | null;
}

export interface SruxPreviewClass {
  source_record_id: string;
  code: string;
  title: string;
  day: string;
  weekday: number;
  start_time: string;
  end_time: string;
  start_label: string;
  end_label: string;
  lecturer: string | null;
  room: string | null;
}

export interface SruxPreview {
  degree: string;
  academic_year: string | null;
  batch: string;
  source_last_updated: string | null;
  classes: SruxPreviewClass[];
}

interface UploadScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
  subscription: SruxSubscription | null;
  loadOptions: () => Promise<SruxOptionsResponse>;
  previewTimetable: (
    degree: string,
    academicYear: string,
    batchId: string,
  ) => Promise<SruxPreview>;
  onImport: (
    degree: string,
    academicYear: string,
    batchId: string,
  ) => Promise<void>;
  onRefresh: () => Promise<void>;
  onUnsubscribe: () => Promise<void>;
}

const DAY_NAMES: Record<string, string> = {
  MON: 'Monday',
  TUE: 'Tuesday',
  WED: 'Wednesday',
  THU: 'Thursday',
  FRI: 'Friday',
  SAT: 'Saturday',
  SUN: 'Sunday',
};

const formatDate = (value: string | null): string => {
  if (!value) return 'Not available';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString();
};

const statusLabel: Record<SruxSubscription['sync_status'], string> = {
  pending: 'Pending',
  synced: 'Up to date',
  stale: 'Last successful timetable retained',
  error: 'Synchronization error',
};

export const UploadScheduleModal: React.FC<UploadScheduleModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
  subscription,
  loadOptions,
  previewTimetable,
  onImport,
  onRefresh,
  onUnsubscribe,
}) => {
  const [options, setOptions] = useState<SruxDegreeOption[]>([]);
  const [selectedDegree, setSelectedDegree] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');

  const [preview, setPreview] = useState<SruxPreview | null>(null);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);
  const [error, setError] = useState('');

  const selectedDegreeOption = useMemo(
    () => options.find((item) => item.degree === selectedDegree),
    [options, selectedDegree],
  );

  const availableYears = selectedDegreeOption?.years ?? [];

  const selectedYearOption = useMemo(
    () => availableYears.find((item) => item.year === selectedYear),
    [availableYears, selectedYear],
  );

  const availableBatches = selectedYearOption?.batches ?? [];

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const fetchOptions = async () => {
      setIsLoadingOptions(true);
      setError('');
      setPreview(null);

      try {
        const response = await loadOptions();

        if (cancelled) return;

        setOptions(response.degrees);

        if (response.degrees.length > 0) {
          const firstDegree = response.degrees[0];
          const firstYear = firstDegree.years[0];
          const firstBatch = firstYear?.batches[0] ?? '';

          setSelectedDegree(firstDegree.degree);
          setSelectedYear(firstYear?.year ?? '');
          setSelectedBatch(firstBatch);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load SRUX timetable options.',
          );
        }
      } finally {
        if (!cancelled) setIsLoadingOptions(false);
      }
    };

    void fetchOptions();

    return () => {
      cancelled = true;
    };
  }, [isOpen, loadOptions]);

  if (!isOpen) return null;

  const handleDegreeChange = (degree: string) => {
    const nextDegree = options.find((item) => item.degree === degree);
    const nextYear = nextDegree?.years[0];

    setSelectedDegree(degree);
    setSelectedYear(nextYear?.year ?? '');
    setSelectedBatch(nextYear?.batches[0] ?? '');
    setPreview(null);
    setError('');
  };

  const handleYearChange = (year: string) => {
    const nextYear = availableYears.find((item) => item.year === year);

    setSelectedYear(year);
    setSelectedBatch(nextYear?.batches[0] ?? '');
    setPreview(null);
    setError('');
  };

  const handlePreview = async () => {
    if (!selectedDegree || !selectedYear || !selectedBatch) {
      setError('Select a degree, academic year and batch first.');
      return;
    }

    setIsPreviewing(true);
    setError('');
    setPreview(null);

    try {
      const result = await previewTimetable(
        selectedDegree,
        selectedYear,
        selectedBatch,
      );

      setPreview(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to preview this SRUX timetable.',
      );
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleImport = async () => {
    if (!preview || !selectedBatch) return;

    setIsImporting(true);
    setError('');

    try {
      await onImport(selectedDegree, selectedYear, selectedBatch);
      onShowToast('Official SRUX timetable imported successfully.');
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to import the SRUX timetable.',
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError('');

    try {
      await onRefresh();
      onShowToast('SRUX timetable refresh completed.');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to refresh the SRUX timetable.',
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleUnsubscribe = async () => {
    const confirmed = window.confirm(
      'Unsubscribe from this official SRUX timetable? Your manually entered classes will be restored.',
    );

    if (!confirmed) return;

    setIsUnsubscribing(true);
    setError('');

    try {
      await onUnsubscribe();
      onShowToast('SRUX timetable subscription removed.');
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to unsubscribe from the SRUX timetable.',
      );
    } finally {
      setIsUnsubscribing(false);
    }
  };

  const hasSubscription = Boolean(subscription);

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-surface">
      <header className="sticky top-0 z-20 border-b border-outline-variant/30 bg-surface/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-4xl items-center justify-between px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close timetable manager"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-on-surface">
                Official timetable
              </h1>
              <p className="text-xs text-on-surface-variant">
                SR University · SRUX integration
              </p>
            </div>
          </div>

          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
            <span className="material-symbols-outlined text-sm">verified</span>
            Official source
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 space-y-5 px-4 py-6 sm:px-6">
        <section className="relative overflow-hidden rounded-2xl bg-primary p-5 text-on-primary shadow-sm sm:p-6">
          <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full border-[24px] border-white/10" />

          <div className="relative flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <span className="material-symbols-outlined text-2xl">
                calendar_month
              </span>
            </div>

            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-white/70">
                University timetable
              </p>
              <h2 className="text-xl font-bold leading-tight sm:text-2xl">
                Connect your official SRUX schedule
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/80">
                Import your university batch timetable and keep your weekly
                academic schedule synchronized with the official SRUX source.
              </p>
            </div>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300"
          >
            <span className="material-symbols-outlined shrink-0">
              error
            </span>
            <p>{error}</p>
          </div>
        )}

        {hasSubscription && subscription ? (
          <section className="space-y-5">
            <div className="rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">
                      school
                    </span>
                    <h2 className="font-bold text-on-surface">
                      Active SRUX subscription
                    </h2>
                  </div>

                  <p className="text-lg font-bold text-on-surface">
                    {subscription.degree}
                  </p>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Academic year: {subscription.academic_year}
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    Batch: {subscription.batch_id}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                    subscription.sync_status === 'synced'
                      ? 'bg-green-500/10 text-green-700 dark:text-green-300'
                      : subscription.sync_status === 'stale' ||
                          subscription.sync_status === 'error'
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                        : 'bg-primary/10 text-primary'
                  }`}
                >
                  {statusLabel[subscription.sync_status]}
                </span>
              </div>

              <div className="mt-5 grid gap-3 border-t border-outline-variant/40 pt-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-on-surface-variant">
                    Last successful synchronization
                  </p>
                  <p className="mt-1 text-sm font-medium text-on-surface">
                    {formatDate(subscription.last_successful_sync_at)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-on-surface-variant">
                    Last source update
                  </p>
                  <p className="mt-1 text-sm font-medium text-on-surface">
                    {formatDate(subscription.source_last_updated)}
                  </p>
                </div>
              </div>

              {subscription.last_error && (
                <p className="mt-4 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
                  {subscription.last_error}
                </p>
              )}

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isRefreshing || isUnsubscribing}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-on-primary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-lg">
                    sync
                  </span>
                  {isRefreshing ? 'Refreshing...' : 'Refresh timetable'}
                </button>

                <button
                  type="button"
                  onClick={handleUnsubscribe}
                  disabled={isRefreshing || isUnsubscribing}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/40 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-300"
                >
                  <span className="material-symbols-outlined text-lg">
                    link_off
                  </span>
                  {isUnsubscribing ? 'Unsubscribing...' : 'Unsubscribe'}
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-surface-container-low p-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary">
                  info
                </span>
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  Your official SRUX classes replace manually entered academic
                  classes while this subscription is active. Your manual
                  records are preserved and become visible again if you
                  unsubscribe. Individual official classes cannot be edited
                  or deleted.
                </p>
              </div>
            </div>
          </section>
        ) : (
          <section className="space-y-5">
            <div className="rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-5 shadow-sm sm:p-6">
              <div className="mb-5">
                <h2 className="font-bold text-on-surface">
                  Select your academic batch
                </h2>
                <p className="mt-1 text-sm text-on-surface-variant">
                  These options are loaded directly from the SRUX timetable
                  catalogue.
                </p>
              </div>

              {isLoadingOptions ? (
                <div className="flex items-center justify-center gap-3 py-12 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined animate-spin">
                    progress_activity
                  </span>
                  Loading university options...
                </div>
              ) : options.length === 0 ? (
                <div className="rounded-xl bg-surface-container-low p-5 text-center">
                  <span className="material-symbols-outlined text-3xl text-on-surface-variant">
                    database
                  </span>
                  <p className="mt-2 font-semibold text-on-surface">
                    No timetable options available
                  </p>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Check your connection and try again.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="srux-degree"
                      className="mb-2 block text-sm font-semibold text-on-surface"
                    >
                      Degree / Programme
                    </label>
                    <select
                      id="srux-degree"
                      value={selectedDegree}
                      onChange={(event) =>
                        handleDegreeChange(event.target.value)
                      }
                      className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      {options.map((item) => (
                        <option key={item.degree} value={item.degree}>
                          {item.degree}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="srux-year"
                      className="mb-2 block text-sm font-semibold text-on-surface"
                    >
                      Academic year
                    </label>
                    <select
                      id="srux-year"
                      value={selectedYear}
                      onChange={(event) =>
                        handleYearChange(event.target.value)
                      }
                      disabled={availableYears.length === 0}
                      className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                    >
                      {availableYears.map((item) => (
                        <option key={item.year} value={item.year}>
                          {item.year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="srux-batch"
                      className="mb-2 block text-sm font-semibold text-on-surface"
                    >
                      University batch
                    </label>
                    <select
                      id="srux-batch"
                      value={selectedBatch}
                      onChange={(event) => {
                        setSelectedBatch(event.target.value);
                        setPreview(null);
                      }}
                      disabled={availableBatches.length === 0}
                      className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                    >
                      {availableBatches.map((batch) => (
                        <option key={batch} value={batch}>
                          {batch}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handlePreview}
                    disabled={
                      isPreviewing ||
                      !selectedDegree ||
                      !selectedYear ||
                      !selectedBatch
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-lg">
                      preview
                    </span>
                    {isPreviewing ? 'Loading preview...' : 'Preview timetable'}
                  </button>
                </div>
              )}
            </div>

            {preview && (
              <section className="overflow-hidden rounded-2xl border border-outline-variant/50 bg-surface-container-lowest shadow-sm">
                <div className="border-b border-outline-variant/40 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-bold text-on-surface">
                        Timetable preview
                      </h2>
                      <p className="mt-1 text-sm text-on-surface-variant">
                        {preview.degree} · {preview.batch}
                      </p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                      {preview.classes.length} classes
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-on-surface-variant">
                    Source last updated:{' '}
                    {formatDate(preview.source_last_updated)}
                  </p>
                </div>

                <div className="max-h-[420px] divide-y divide-outline-variant/30 overflow-y-auto">
                  {preview.classes.map((item) => (
                    <article
                      key={item.source_record_id}
                      className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-on-surface">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs text-on-surface-variant">
                          {item.code || 'No course code'} ·{' '}
                          {DAY_NAMES[item.day] ?? item.day}
                        </p>
                        <p className="mt-1 text-xs text-on-surface-variant">
                          {item.lecturer || 'Lecturer not specified'}
                          {item.room ? ` · ${item.room}` : ''}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-lg bg-surface-container-low px-3 py-2 text-xs font-semibold text-on-surface">
                        {item.start_label} – {item.end_label}
                      </span>
                    </article>
                  ))}
                </div>

                <div className="border-t border-outline-variant/40 p-5">
                  <div className="mb-4 flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary">
                      info
                    </span>
                    <p className="text-xs leading-relaxed text-on-surface-variant">
                      Importing makes this official timetable your active
                      academic schedule. Existing manual academic classes
                      will be hidden, not deleted.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleImport}
                    disabled={isImporting || preview.classes.length === 0}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-on-primary shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-lg">
                      download_done
                    </span>
                    {isImporting ? 'Importing timetable...' : 'Import official timetable'}
                  </button>
                </div>
              </section>
            )}
          </section>
        )}
      </main>
    </div>
  );
};
