import React, { useState, useEffect } from 'react';

interface VoiceNavigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: string;
  onShowToast: (msg: string) => void;
}

export const VoiceNavigationModal: React.FC<VoiceNavigationModalProps> = ({
  isOpen,
  onClose,
  destination,
  onShowToast
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const voiceSteps = [
    {
      instruction: 'Head North past Campus Entrance Gate 1',
      detail: 'Continue straight for 120 meters along the tree-lined central avenue towards SREC Academic Quad.',
      distance: '120m',
      icon: 'straight'
    },
    {
      instruction: 'In 60 meters, enter SREC Computer Science Block',
      detail: 'Approach the ground concourse entrance into the CSE academic wing.',
      distance: '60m',
      icon: 'turn_right'
    },
    {
      instruction: 'Take Staircase B or Central Elevator to Level 2',
      detail: 'Located in the CSE concourse lobby. Ascend to Level 2 breezeway.',
      distance: '35m',
      icon: 'stairs'
    },
    {
      instruction: 'Turn left down Computing Wing to Room 204',
      detail: 'Your classroom is 30 meters ahead on your right. Adjacent to AI Research Lab.',
      distance: '30m',
      icon: 'turn_left'
    },
    {
      instruction: 'You have arrived at Room 204',
      detail: 'Data Structures & Algorithms with Prof. Sarah Vance.',
      distance: '0m',
      icon: 'done_all'
    }
  ];

  const current = voiceSteps[currentStepIndex];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      setIsPaused(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStepIndex < voiceSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      onShowToast(`Proceeding to checkpoint ${currentStepIndex + 2}`);
    } else {
      onShowToast('You have reached your destination!');
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-primary/70 backdrop-blur-md">
      <div className="w-full max-w-xl bg-surface-container-lowest rounded-t-3xl shadow-2xl p-5 flex flex-col gap-4 animate-in slide-in-from-bottom duration-300 pb-safe">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-secondary animate-ping" />
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
              Turn-by-Turn Voice Active
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(prev => !prev)}
              aria-label="Mute Voice"
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                isMuted
                  ? 'bg-error-container text-on-error-container'
                  : 'bg-surface-container text-on-surface-variant hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isMuted ? 'volume_off' : 'volume_up'}
              </span>
            </button>
            <button
              onClick={onClose}
              aria-label="End Navigation"
              className="w-9 h-9 rounded-full bg-surface-container text-on-surface-variant hover:text-error flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* Hero Current Turn Banner */}
        <div className="bg-primary text-on-primary rounded-2xl p-4 flex items-center gap-4 shadow-md relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-on-secondary shrink-0 shadow-md">
            <span className="material-symbols-outlined text-[36px]">{current.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-headline-sm text-headline-sm text-white font-bold truncate">
                {current.instruction}
              </span>
              <span className="font-code-sm text-code-sm text-secondary-fixed font-bold shrink-0">
                {current.distance}
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-surface-container-high mt-0.5 line-clamp-2">
              {current.detail}
            </p>
          </div>
        </div>

        {/* Audio Wave Simulation */}
        <div className="flex items-center justify-center gap-1.5 py-2">
          {!isMuted && !isPaused ? (
            Array.from({ length: 18 }).map((_, i) => (
              <span
                key={i}
                className="w-1 bg-secondary rounded-full animate-pulse"
                style={{
                  height: `${12 + Math.sin(i * 0.8) * 14 + (i % 3) * 6}px`,
                  animationDelay: `${(i % 5) * 0.15}s`
                }}
              />
            ))
          ) : (
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {isMuted ? 'Voice prompts muted' : 'Guidance paused'}
            </span>
          )}
        </div>

        {/* Route Progress Dots */}
        <div className="flex items-center justify-between px-2">
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            Checkpoint {currentStepIndex + 1} of {voiceSteps.length}
          </span>
          <div className="flex items-center gap-1.5">
            {voiceSteps.map((_, i) => (
              <span
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === currentStepIndex
                    ? 'w-6 bg-secondary'
                    : i < currentStepIndex
                    ? 'w-2 bg-secondary/50'
                    : 'w-2 bg-surface-container-highest'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Actions Controls */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="h-11 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md flex items-center justify-center gap-1 disabled:opacity-40 transition-all font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            Prev
          </button>

          <button
            onClick={() => setIsPaused(prev => !prev)}
            className="h-11 rounded-xl bg-surface-container-high text-primary font-label-md text-label-md flex items-center justify-center gap-1 transition-all font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isPaused ? 'play_arrow' : 'pause'}
            </span>
            {isPaused ? 'Resume' : 'Pause'}
          </button>

          <button
            onClick={handleNext}
            className="h-11 rounded-xl bg-secondary text-on-secondary font-label-md text-label-md flex items-center justify-center gap-1 transition-all font-bold shadow-sm"
          >
            {currentStepIndex === voiceSteps.length - 1 ? 'Finish' : 'Next'}
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
};
