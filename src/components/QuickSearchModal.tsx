import React, { useState, useEffect } from 'react';
import { REAL_CAMPUS_DESTINATIONS } from '../data/campusData';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDestination: (destName: string, roomCode?: string) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectDestination
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // toggle or open
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const matches = REAL_CAMPUS_DESTINATIONS.filter(
    d =>
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.description.toLowerCase().includes(query.toLowerCase()) ||
      (d.roomCode && d.roomCode.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-24 bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="relative p-3.5 border-b border-slate-100 flex items-center">
          <span className="material-symbols-outlined text-[22px] text-slate-400 mr-2.5">search</span>
          <input
            autoFocus
            type="text"
            placeholder="Search SR University buildings, labs, room codes (e.g. Room 204, SRiX, Gate 1)..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-xs font-mono hover:bg-slate-200"
          >
            ESC
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {matches.map(dest => (
            <button
              key={dest.id}
              onClick={() => {
                onSelectDestination(dest.name, dest.roomCode);
                onClose();
              }}
              className="w-full p-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between text-left transition-colors group"
            >
              <div className="min-w-0 pr-2">
                <span className="text-xs font-bold text-slate-900 group-hover:text-secondary block truncate">
                  {dest.name}
                </span>
                <span className="text-[11px] text-slate-500 block truncate">
                  {dest.description}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {dest.roomCode && (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono text-[11px] rounded font-semibold">
                    {dest.roomCode}
                  </span>
                )}
                <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-secondary">
                  arrow_forward
                </span>
              </div>
            </button>
          ))}

          {matches.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-500">
              No campus destinations found for "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
