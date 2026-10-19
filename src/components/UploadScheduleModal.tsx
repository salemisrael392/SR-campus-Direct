import React, { useState } from 'react';
import { UNIVERSITY_INFO } from '../data/campusData';

interface UploadScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const UploadScheduleModal: React.FC<UploadScheduleModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'portal' | 'manual'>('upload');
  const [department, setDepartment] = useState('School of Computing & Engineering');
  const [fileUploaded, setFileUploaded] = useState(true);
  const [fileName, setFileName] = useState('SRU_Fall24_CS_Sem3_Official.pdf');
  const [isApplying, setIsApplying] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  // Alert toggles
  const [morningBriefing, setMorningBriefing] = useState(true);
  const [preClassAlert, setPreClassAlert] = useState(true);
  const [emergencyAlert, setEmergencyAlert] = useState(true);

  // Manual code entry
  const [codeInputValue, setCodeInputValue] = useState('');
  const [courseCodes, setCourseCodes] = useState<string[]>([
    'CS301 (Alg & DS)',
    'EE210 (Logic Circuits)',
    'MTH202 (Discrete Math)'
  ]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setFileUploaded(true);
      onShowToast(`OCR parsed schedule from ${file.name}`);
    }
  };

  const handleAddCode = () => {
    if (!codeInputValue.trim()) return;
    setCourseCodes(prev => [...prev, codeInputValue.trim().toUpperCase()]);
    setCodeInputValue('');
    onShowToast('Course added to timetable parser');
  };

  const handleRemoveCode = (index: number) => {
    setCourseCodes(prev => prev.filter((_, i) => i !== index));
  };

  const handleApply = () => {
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      setIsApplied(true);
      onShowToast('Schedule successfully synced with SR Campus Beacon Mesh!');
      setTimeout(() => {
        setIsApplied(false);
        onClose();
      }, 1400);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-surface flex flex-col overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 inset-x-0 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
        <div className="h-16 px-gutter flex items-center justify-between max-w-xl mx-auto w-full">
          <div className="flex items-center gap-space-sm min-w-0">
            <button
              onClick={onClose}
              aria-label="Go back"
              className="w-11 h-11 -ml-2 flex items-center justify-center text-on-surface hover:text-secondary rounded-full transition-colors shrink-0 active:scale-95"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_back</span>
            </button>
            <img
              alt="SR University Logo"
              className="h-7 w-auto object-contain shrink-0"
              src={UNIVERSITY_INFO.logoUrl}
            />
            <div className="flex flex-col min-w-0">
              <h1 className="font-title-sm text-title-sm text-primary tracking-tight truncate font-bold">
                Upload Schedule
              </h1>
              <span className="font-label-sm text-label-sm text-on-surface-variant truncate">
                Main Campus • East Wing
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-sm shrink-0">
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-secondary-fixed"
              src={UNIVERSITY_INFO.user.avatar}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-xl mx-auto w-full pb-safe">
        <div className="flex flex-col w-full pb-12">
          {/* Intro Header & Compass Badge Banner */}
          <div className="px-gutter pt-4 pb-3">
            <div className="bg-surface-container-low rounded-xl p-space-md shadow-sm relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-secondary-fixed/30 pointer-events-none flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary text-[72px] opacity-20">explore</span>
              </div>
              <div className="flex items-start gap-space-md relative z-10">
                <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-sm shrink-0">
                  <span className="material-symbols-outlined text-[24px]">calendar_add_on</span>
                </div>
                <div className="flex flex-col min-w-0 pr-6">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
                      Smart Campus Sync
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    <span className="font-label-sm text-label-sm text-on-surface-variant">v2.4 Active</span>
                  </div>
                  <p className="font-title-sm text-title-sm text-on-surface leading-tight font-bold">
                    Schedule &amp; Wayfinding Setup
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Sync once to unlock automated classroom navigation and timed walking departure cues.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Student & Department Info Card */}
          <section className="px-gutter mb-space-lg">
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
              <div className="flex items-center justify-between mb-space-md">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[20px]">school</span>
                  <h2 className="font-title-sm text-title-sm text-on-surface font-semibold">Academic Profile</h2>
                </div>
                <span className="font-code-sm text-code-sm bg-surface-container px-2 py-0.5 rounded-full text-on-surface-variant font-medium">
                  ID: {UNIVERSITY_INFO.user.id}
                </span>
              </div>

              <div className="space-y-space-md">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-1 font-semibold">
                    Faculty &amp; Department
                  </label>
                  <div className="relative bg-surface-container-low rounded-lg transition-all focus-within:bg-surface-container-highest">
                    <div className="flex items-center px-3 py-2.5">
                      <span className="material-symbols-outlined text-on-surface-variant text-[20px] mr-2">
                        account_balance
                      </span>
                      <select
                        value={department}
                        onChange={e => setDepartment(e.target.value)}
                        className="w-full bg-transparent font-body-md text-body-md text-on-surface outline-none appearance-none cursor-pointer pr-6"
                      >
                        <option>School of Computing &amp; Engineering</option>
                        <option>School of Business &amp; Economics</option>
                        <option>College of Architecture &amp; Design</option>
                        <option>Faculty of Health &amp; Medical Sciences</option>
                        <option>School of Humanities &amp; Social Sciences</option>
                      </select>
                      <span className="material-symbols-outlined text-on-surface-variant text-[20px] absolute right-3 pointer-events-none">
                        expand_more
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-1 font-semibold">
                    Degree Program &amp; Term
                  </label>
                  <div className="bg-surface-container-low rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                        <span className="material-symbols-outlined text-[18px]">terminal</span>
                      </div>
                      <div className="truncate">
                        <p className="font-title-sm text-title-sm text-on-surface truncate font-semibold">
                          {UNIVERSITY_INFO.user.program}
                        </p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          {UNIVERSITY_INFO.user.term}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onShowToast('Degree program verified with university registrar')}
                      className="font-label-md text-label-md text-secondary hover:text-secondary-container px-2 py-1 rounded transition-colors shrink-0 font-semibold"
                    >
                      Change
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Upload Methods Segmented Control & Tab Area */}
          <section className="px-gutter mb-space-lg">
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-title-sm text-title-sm text-on-surface flex items-center gap-2 font-semibold">
                  <span className="material-symbols-outlined text-secondary text-[20px]">sync_alt</span>
                  Import Schedule
                </h2>
                <span className="font-label-sm text-label-sm text-secondary bg-secondary-fixed px-2 py-0.5 rounded-full font-bold">
                  Step 2 of 3
                </span>
              </div>

              {/* Segmented Buttons */}
              <div className="grid grid-cols-3 gap-1 bg-surface-container p-1 rounded-xl mb-4">
                <button
                  className={`py-2 px-1 text-center rounded-lg font-label-md text-label-md transition-all font-semibold ${
                    activeTab === 'upload'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                  onClick={() => setActiveTab('upload')}
                >
                  Upload File
                </button>
                <button
                  className={`py-2 px-1 text-center rounded-lg font-label-md text-label-md transition-all font-semibold ${
                    activeTab === 'portal'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                  onClick={() => setActiveTab('portal')}
                >
                  Portal Sync
                </button>
                <button
                  className={`py-2 px-1 text-center rounded-lg font-label-md text-label-md transition-all font-semibold ${
                    activeTab === 'manual'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                  onClick={() => setActiveTab('manual')}
                >
                  Code Entry
                </button>
              </div>

              {/* Tab 1: File Upload */}
              {activeTab === 'upload' && (
                <div className="flex flex-col">
                  <div className="border-2 border-dashed border-outline-variant/60 hover:border-secondary bg-surface-container-low/60 rounded-xl p-5 text-center transition-all cursor-pointer relative group">
                    <input
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                      id="timetableInput"
                      type="file"
                      accept=".pdf,.xlsx,.ics,image/*"
                      onChange={handleFileUpload}
                    />
                    <div className="w-12 h-12 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-[26px]">upload_file</span>
                    </div>
                    <p className="font-title-sm text-title-sm text-on-surface font-semibold">
                      Drag timetable here or{' '}
                      <span className="text-secondary font-bold underline decoration-2 underline-offset-2">browse</span>
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                      Accepts PDF, XLSX, Apple/Google Calendar .ICS, or camera snapshot
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <span className="font-code-sm text-code-sm bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded font-medium">
                        .PDF
                      </span>
                      <span className="font-code-sm text-code-sm bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded font-medium">
                        .XLSX
                      </span>
                      <span className="font-code-sm text-code-sm bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded font-medium">
                        .ICS
                      </span>
                      <span className="font-code-sm text-code-sm bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded font-medium">
                        JPG / PNG
                      </span>
                    </div>
                  </div>

                  {/* Parsed File Banner */}
                  {fileUploaded && (
                    <div className="mt-3 bg-surface-container-low rounded-lg p-2.5 flex items-center justify-between border border-surface-container-high">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="material-symbols-outlined text-secondary text-[22px] shrink-0">task_alt</span>
                        <div className="truncate">
                          <p className="font-label-md text-label-md text-on-surface truncate font-semibold">
                            {fileName}
                          </p>
                          <p className="font-code-sm text-code-sm text-on-surface-variant">
                            1.4 MB • OCR Parsing completed in 0.6s
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setFileUploaded(false);
                          onShowToast('Cleared timetable file');
                        }}
                        className="w-7 h-7 flex items-center justify-center text-on-surface-variant hover:text-error rounded-full shrink-0"
                      >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: SR Portal Sync */}
              {activeTab === 'portal' && (
                <div className="flex flex-col gap-3">
                  <div className="bg-surface-container-low rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[22px]">vpn_key</span>
                      </div>
                      <div>
                        <p className="font-title-sm text-title-sm text-on-surface font-semibold">
                          SR University Student Portal
                        </p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Direct handshake with Campus Information System (CIS)
                        </p>
                      </div>
                    </div>

                    <div className="bg-surface-container-lowest rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-body-sm text-body-sm text-on-surface-variant">Connected Account</span>
                        <span className="font-label-md text-label-md text-on-surface font-bold">
                          {UNIVERSITY_INFO.user.email}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-body-sm text-body-sm text-on-surface-variant">Last Registrar Sync</span>
                        <span className="font-code-sm text-code-sm text-secondary font-bold">Today, 08:14 AM</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onShowToast('Successfully synced 14 registered classes from SIS Registrar!')}
                      className="w-full bg-secondary text-on-secondary font-label-lg text-label-lg py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-secondary-container transition-colors shadow-xs font-bold"
                    >
                      <span className="material-symbols-outlined text-[18px]">cloud_sync</span>
                      Fetch Enrolled Classes from SIS
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 3: Manual Course Code Entry */}
              {activeTab === 'manual' && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1 bg-surface-container-low rounded-lg">
                      <input
                        value={codeInputValue}
                        onChange={e => setCodeInputValue(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddCode()}
                        className="w-full px-3 py-2.5 bg-transparent font-body-md text-body-md text-on-surface placeholder:text-outline outline-none"
                        placeholder="e.g. CS301, EE210, MTH204"
                        type="text"
                      />
                    </div>
                    <button
                      onClick={handleAddCode}
                      className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md text-label-md flex items-center gap-1 shadow-xs hover:bg-primary-container font-semibold"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {courseCodes.map((code, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 bg-secondary-fixed text-on-secondary-fixed-variant font-code-sm text-code-sm px-2.5 py-1 rounded-full font-semibold"
                      >
                        {code}
                        <button
                          onClick={() => handleRemoveCode(idx)}
                          className="material-symbols-outlined text-[14px] cursor-pointer hover:text-error"
                        >
                          close
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Parsed Schedule Preview Mini-Table */}
          <section className="px-gutter mb-space-lg">
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[20px]">view_timeline</span>
                  <h2 className="font-title-sm text-title-sm text-on-surface font-semibold">
                    Parsed Classes Preview
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 bg-surface-container-high px-2.5 py-0.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  <span className="font-label-sm text-label-sm text-primary font-bold">14 Sessions / Wk</span>
                </div>
              </div>

              {/* Compact Session Cards List */}
              <div className="space-y-2">
                {/* Class 1 */}
                <div className="bg-surface-container-low rounded-lg p-3 flex items-center justify-between hover:bg-surface-container transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 flex flex-col items-center justify-center bg-surface-container-high rounded-md py-1 shrink-0">
                      <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">MON</span>
                      <span className="font-code-sm text-code-sm font-bold text-primary">09:00</span>
                    </div>
                    <div className="truncate">
                      <p className="font-title-sm text-title-sm text-on-surface truncate font-semibold">
                        Algorithms &amp; Data Structures
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 truncate">
                        <span>Dr. Marcus Reed</span>
                        <span>•</span>
                        <span className="text-secondary font-semibold">CS-301</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0 pl-2">
                    <span className="font-code-sm text-code-sm font-bold bg-secondary-fixed text-on-secondary-fixed-variant px-2 py-0.5 rounded-full">
                      Hall E-204
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">East Wing</span>
                  </div>
                </div>

                {/* Class 2 */}
                <div className="bg-surface-container-low rounded-lg p-3 flex items-center justify-between hover:bg-surface-container transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 flex flex-col items-center justify-center bg-surface-container-high rounded-md py-1 shrink-0">
                      <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">MON</span>
                      <span className="font-code-sm text-code-sm font-bold text-primary">11:30</span>
                    </div>
                    <div className="truncate">
                      <p className="font-title-sm text-title-sm text-on-surface truncate font-semibold">
                        Digital Logic Systems Lab
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 truncate">
                        <span>Prof. S. H. Varma</span>
                        <span>•</span>
                        <span className="text-secondary font-semibold">EE-210L</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0 pl-2">
                    <span className="font-code-sm text-code-sm font-bold bg-secondary-fixed text-on-secondary-fixed-variant px-2 py-0.5 rounded-full">
                      Lab 4B
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">Turing Block</span>
                  </div>
                </div>

                {/* Class 3 */}
                <div className="bg-surface-container-low rounded-lg p-3 flex items-center justify-between hover:bg-surface-container transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 flex flex-col items-center justify-center bg-surface-container-high rounded-md py-1 shrink-0">
                      <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">TUE</span>
                      <span className="font-code-sm text-code-sm font-bold text-primary">10:15</span>
                    </div>
                    <div className="truncate">
                      <p className="font-title-sm text-title-sm text-on-surface truncate font-semibold">
                        Database Architectures
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 truncate">
                        <span>Prof. Elena Rostova</span>
                        <span>•</span>
                        <span className="text-secondary font-semibold">CS-240</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0 pl-2">
                    <span className="font-code-sm text-code-sm font-bold bg-secondary-fixed text-on-secondary-fixed-variant px-2 py-0.5 rounded-full">
                      Auditorium 1
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">Main Quad</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 flex items-center justify-between text-on-surface-variant">
                <span className="font-body-sm text-body-sm">+11 more lectures &amp; labs mapped</span>
                <button
                  onClick={() => onShowToast('Full semester course catalog mapping verified')}
                  className="font-label-md text-label-md text-secondary hover:text-secondary-container flex items-center gap-0.5 font-semibold"
                >
                  Review Full Week
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>
          </section>

          {/* Notification & Alerts Preferences */}
          <section className="px-gutter mb-space-lg">
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-secondary text-[20px]">notifications_active</span>
                <h2 className="font-title-sm text-title-sm text-on-surface font-semibold">
                  Daily Alert &amp; Wayfinding Triggers
                </h2>
              </div>

              <div className="space-y-3">
                {/* Toggle 1: Morning Briefing */}
                <div className="flex items-start justify-between gap-3 p-2 rounded-lg bg-surface-container-low/50">
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">wb_sunny</span>
                    <div>
                      <p className="font-title-sm text-title-sm text-on-surface font-semibold">
                        Daily Morning Briefing
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        7:30 AM summary with weather, venue notices &amp; today's route.
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input
                      checked={morningBriefing}
                      onChange={e => setMorningBriefing(e.target.checked)}
                      className="sr-only peer"
                      type="checkbox"
                    />
                    <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary" />
                  </label>
                </div>

                {/* Toggle 2: Departure alerts with walking time */}
                <div className="flex items-start justify-between gap-3 p-2 rounded-lg bg-surface-container-low/50">
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">
                      directions_walk
                    </span>
                    <div>
                      <p className="font-title-sm text-title-sm text-on-surface font-semibold">
                        Pre-Class Departure Alert
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Calculates live walking distance and alerts 15m prior to room departure.
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input
                      checked={preClassAlert}
                      onChange={e => setPreClassAlert(e.target.checked)}
                      className="sr-only peer"
                      type="checkbox"
                    />
                    <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary" />
                  </label>
                </div>

                {/* Toggle 3: Room Changes */}
                <div className="flex items-start justify-between gap-3 p-2 rounded-lg bg-surface-container-low/50">
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">
                      emergency_home
                    </span>
                    <div>
                      <p className="font-title-sm text-title-sm text-on-surface font-semibold">
                        Emergency Room &amp; Gate Changes
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Instant push notification if department updates professor or hall.
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input
                      checked={emergencyAlert}
                      onChange={e => setEmergencyAlert(e.target.checked)}
                      className="sr-only peer"
                      type="checkbox"
                    />
                    <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary" />
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Sticky Apply Action Bar */}
          <div className="px-gutter pt-2">
            <button
              onClick={handleApply}
              disabled={isApplying}
              className={`w-full font-title-sm text-title-sm h-12 rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all font-bold ${
                isApplied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-primary hover:bg-primary-container text-on-primary'
              }`}
            >
              {isApplying ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                  <span>Syncing to Navigation Mesh...</span>
                </>
              ) : isApplied ? (
                <>
                  <span className="material-symbols-outlined text-[20px]">verified</span>
                  <span>Schedule Active &amp; Synced!</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  <span>Apply Schedule to SR Compass</span>
                </>
              )}
            </button>
            <p className="text-center font-label-sm text-label-sm text-on-surface-variant mt-2 flex items-center justify-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[14px] text-secondary">verified_user</span>
              Auto-syncs with campus beacon mesh for classroom proximity checks
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
