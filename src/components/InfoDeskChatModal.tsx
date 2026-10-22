import React, { useState } from 'react';

interface InfoDeskChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToDest?: (destName: string, roomCode?: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'ambassador' | 'student';
  text: string;
  time: string;
  action?: {
    label: string;
    dest: string;
    room: string;
  };
}

export const InfoDeskChatModal: React.FC<InfoDeskChatModalProps> = ({
  isOpen,
  onClose,
  onNavigateToDest
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'ambassador',
      text: 'Hello Sara! Welcome to SR University Campus Navigator. How can we help you reach your class or laboratory today?',
      time: '9:38 AM'
    }
  ]);
  const [inputVal, setInputVal] = useState('');

  if (!isOpen) return null;

  const quickPrompts = [
    'How do I find Room 204 in SREC CSE Block?',
    'Where is the step-free elevator to Level 2?',
    'When does the Campus Shuttle arrive at Gate 1?'
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'student',
      text: text.trim(),
      time: '9:40 AM'
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputVal('');

    setTimeout(() => {
      let reply = 'Our Student Ambassadors in blue vests are stationed at SREC Main Quad if you need personal assistance!';
      let action: ChatMessage['action'] = undefined;

      const lower = text.toLowerCase();
      if (lower.includes('204') || lower.includes('cse') || lower.includes('cs') || lower.includes('computer')) {
        reply =
          'Room 204 is on the 2nd Floor of SREC Computer Science Block. Take Staircase B or the CSE lobby elevator, then turn left along the corridor.';
        action = {
          label: 'Direct to SREC CSE 204',
          dest: 'SREC Computer Science Block • Room 204 (Level 2)',
          room: 'Room 204'
        };
      } else if (lower.includes('elevator') || lower.includes('step-free')) {
        reply =
          'The primary step-free elevator is located in the Central Concourse of SREC Academic Block and connects Ground, L1, L2, and L3.';
      } else if (lower.includes('shuttle') || lower.includes('gate 1')) {
        reply =
          'The Campus Shuttle departs Main Entrance (Gate 1) every 8 minutes. Next arrival is in 3 minutes.';
        action = {
          label: 'Route to Gate 1 Shuttle Stop',
          dest: 'Main Campus Entrance (Gate 1)',
          room: 'GATE-01'
        };
      }

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ambassador',
          text: reply,
          time: '9:40 AM',
          action
        }
      ]);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-primary/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 flex flex-col gap-3 animate-in slide-in-from-bottom duration-300 max-h-[85vh] h-[540px]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-container-high shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[22px]">support_agent</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-title-sm text-title-sm text-on-surface font-bold">
                  Campus Info Desk
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                Live Support • SREC Main Quad Ambassadors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
          {messages.map(m => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'student' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 shadow-xs font-body-sm text-body-sm ${
                  m.sender === 'student'
                    ? 'bg-secondary text-on-secondary rounded-br-xs'
                    : 'bg-surface-container-low text-on-surface rounded-bl-xs border border-surface-container-high'
                }`}
              >
                <p>{m.text}</p>
                {m.action && onNavigateToDest && (
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToDest(m.action!.dest, m.action!.room);
                    }}
                    className="mt-2.5 px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md flex items-center gap-1.5 shadow-sm active:scale-95 transition-all font-semibold"
                  >
                    <span className="material-symbols-outlined text-[16px]">turn_sharp_right</span>
                    {m.action.label}
                  </button>
                )}
              </div>
              <span className="font-code-sm text-[10px] text-on-surface-variant/70 mt-1 px-1">
                {m.time}
              </span>
            </div>
          ))}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 shrink-0">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm shrink-0 hover:bg-surface-container-highest transition-colors font-medium"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-surface-container-high shrink-0">
          <input
            type="text"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask campus ambassador a question..."
            className="flex-1 h-11 px-3.5 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md outline-none placeholder:text-outline focus:bg-surface-container-lowest border border-transparent focus:border-secondary transition-all"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputVal.trim()}
            className="w-11 h-11 rounded-xl bg-secondary text-on-secondary flex items-center justify-center shadow-sm disabled:opacity-40 transition-all font-bold"
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
