import React, { useState } from 'react';
import { UNIVERSITY_INFO } from '../data/campusData';

interface DirectoryViewProps {
  onNavigateToDest: (name: string, roomCode?: string) => void;
  onShowToast: (msg: string) => void;
}

export const DirectoryView: React.FC<DirectoryViewProps> = ({
  onNavigateToDest,
  onShowToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const contacts = [
    {
      category: 'emergency',
      name: 'Campus Emergency & Security Control',
      department: 'Central Security Dispatch',
      location: 'Main Campus Entrance (Gate 1)',
      roomCode: 'GATE-01',
      phone: UNIVERSITY_INFO.emergencyPhone,
      email: 'security@sru.edu.in',
      hours: '24/7 All Days',
      urgent: true
    },
    {
      category: 'academic',
      name: 'Department of Computer Science & Engineering',
      department: 'School of Computer Science & AI',
      location: 'SREC Computer Science Block',
      roomCode: 'Room 204',
      phone: '+91 870 281 8333',
      email: 'hod.cse@sru.edu.in',
      hours: 'Mon-Sat: 9:00 AM - 5:00 PM',
      urgent: false
    },
    {
      category: 'academic',
      name: 'Office of the Dean & Registrar',
      department: 'Academic Affairs & Examinations',
      location: 'SREC Main Academic Block',
      roomCode: 'SREC-101',
      phone: '+91 870 281 8333',
      email: 'registrar@sru.edu.in',
      hours: 'Mon-Sat: 9:30 AM - 5:00 PM',
      urgent: false
    },
    {
      category: 'research',
      name: 'SRiX Technology Business Incubator',
      department: 'MakerSpace & Startup Cohorts',
      location: 'SRiX Technology Business Incubator',
      roomCode: 'SRIX-HUB',
      phone: '+91 870 281 8400',
      email: 'incubator@srix.io',
      hours: 'Open 24/7 for Registered Cohorts',
      urgent: false
    },
    {
      category: 'services',
      name: 'Hostel & Residential Dining Office',
      department: 'Student Housing & Dining Affairs',
      location: 'Student Housing & Dining Complex',
      roomCode: 'HOSTEL-SQ',
      phone: '+91 870 281 8350',
      email: 'warden@sru.edu.in',
      hours: '6:00 AM - 10:00 PM',
      urgent: false
    },
    {
      category: 'services',
      name: 'Sports & Wellness Center',
      department: 'Physical Education & Athletics',
      location: 'SR Sports Stadium & Arena',
      roomCode: 'SPORTS-01',
      phone: '+91 870 281 8365',
      email: 'sports@sru.edu.in',
      hours: '6:00 AM - 9:00 PM',
      urgent: false
    },
    {
      category: 'academic',
      name: 'SR Central Auditorium & Events Desk',
      department: 'Cultural Affairs & Conventions',
      location: 'SR Central Auditorium & Seminar Complex',
      roomCode: 'AUD-01',
      phone: '+91 870 281 8370',
      email: 'events@sru.edu.in',
      hours: 'Mon-Sat: 9:00 AM - 6:00 PM',
      urgent: false
    }
  ];

  const filtered = contacts.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.roomCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterType === 'all' || item.category === filterType;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col w-full space-y-4">
      {/* Top Header & Emergency Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Campus Directory &amp; Key Contacts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Academic departments, student housing, administrative deans, and emergency services
          </p>
        </div>

        {/* Emergency Hotline Button */}
        <a
          href={`tel:${UNIVERSITY_INFO.emergencyPhone}`}
          className="flex items-center gap-2 px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold border border-red-200 transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-[18px] text-red-600">call</span>
          <span>Security SOS: {UNIVERSITY_INFO.emergencyPhone}</span>
        </a>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search departments, offices, rooms, deans..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
          />
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All' },
            { id: 'emergency', label: 'Emergency' },
            { id: 'academic', label: 'Academic' },
            { id: 'research', label: 'SRiX / Labs' },
            { id: 'services', label: 'Services' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                filterType === f.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((item, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl border bg-white shadow-xs flex flex-col justify-between transition-all ${
              item.urgent
                ? 'border-red-200 bg-red-50/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider">
                  {item.department}
                </span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-mono font-bold rounded">
                  {item.roomCode}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900">{item.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-slate-400">location_on</span>
                <span>{item.location}</span>
              </p>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
              <a
                href={`tel:${item.phone}`}
                className="font-semibold text-secondary hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[15px]">call</span>
                <span>{item.phone}</span>
              </a>

              <button
                onClick={() => onNavigateToDest(item.location, item.roomCode)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[15px] text-secondary">near_me</span>
                <span>Show on Map</span>
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-8 text-center text-slate-400 text-xs bg-white rounded-xl border border-dashed border-slate-200">
            No contacts found matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
};
