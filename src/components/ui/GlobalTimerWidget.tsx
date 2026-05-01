import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../state/store';
import { tick, toggleExpanded, pauseFocus, resumeFocus, stopFocus } from '../../state/timerSlice';
import { toggleSubtopicCompletion } from '../../api/progress';
import { useAppData } from '../../state/AppDataProvider';
import confetti from 'canvas-confetti';
import { Play, Pause, X, CheckCircle, ExternalLink, ChevronUp } from 'lucide-react';

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export default function GlobalTimerWidget() {
  const dispatch = useDispatch();
  const { pushToast } = useAppData();
  const widgetRef = useRef<HTMLDivElement>(null);
  
  const {
    isActive,
    isExpanded,
    timeRemaining,
    initialDuration,
    activeTopicData,
    activePlanId,
    activeSubtopicId,
  } = useSelector((state: RootState) => state.timer);

  useEffect(() => {
    let interval: number | undefined;
    if (isActive && timeRemaining > 0) {
      interval = window.setInterval(() => {
        dispatch(tick());
      }, 1000);
    } else if (isActive && timeRemaining === 0) {
      pushToast({ type: 'success', message: 'Focus session completed!' });
      dispatch(pauseFocus());
    }
    return () => clearInterval(interval);
  }, [isActive, timeRemaining, dispatch, pushToast]);

  // Click outside to collapse
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isExpanded && widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        dispatch(toggleExpanded());
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded, dispatch]);

  const fireConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.8 },
      colors: ['#1f3b2c', '#c6d1cb', '#4ade80', '#22c55e']
    });
  };

  const handleMarkComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activePlanId || !activeSubtopicId) return;
    try {
      await toggleSubtopicCompletion(activePlanId, activeSubtopicId, true);
      fireConfetti();
      pushToast({ type: 'success', message: 'Topic marked as complete!' });
      
      // Dispatch event to refresh Journey/Dashboard UI
      window.dispatchEvent(new CustomEvent('plan-updated', { 
        detail: { planId: activePlanId, subtopicId: activeSubtopicId } 
      }));
      
      dispatch(stopFocus());
    } catch (error) {
      pushToast({ type: 'error', message: 'Failed to complete topic' });
    }
  };

  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isActive) dispatch(pauseFocus());
    else dispatch(resumeFocus());
  };

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(stopFocus());
  };

  if (!activeTopicData && timeRemaining === 0) return null;

  const progressPercent = initialDuration > 0 
    ? ((initialDuration - timeRemaining) / initialDuration) * 100 
    : 0;

  return (
    <div ref={widgetRef} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
      {/* Expanded Popover (Floating above the pill) */}
      {isExpanded && (
        <div className="mb-4 w-[90vw] sm:w-[400px] bg-[var(--color-surface-elevated)]/95 backdrop-blur-xl rounded-3xl p-5 shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-[var(--color-border-light)] animate-in slide-in-from-bottom-5 fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-semibold text-[var(--color-text-subtle)] uppercase tracking-wider">
              Current Focus
            </span>
            <button
              className="text-[var(--color-text-subtle)] hover:text-[var(--color-text)] transition-colors p-1 rounded-full hover:bg-[var(--color-border-light)]"
              onClick={() => dispatch(toggleExpanded())}
            >
              <X size={16} />
            </button>
          </div>

          <div className="text-center mb-6">
            <div className={`text-6xl font-light tracking-tight mb-2 transition-colors ${timeRemaining === 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-text)]'}`}>
              {formatTime(timeRemaining)}
            </div>
            <div className="text-lg font-medium text-[var(--color-text)] px-4 leading-tight">
              {activeTopicData?.title}
            </div>
          </div>

          {activeTopicData?.resources && activeTopicData.resources.length > 0 && (
            <div className="mb-6 bg-[var(--color-surface)] rounded-2xl p-4 border border-[var(--color-border-light)]">
              <h3 className="text-xs font-semibold text-[var(--color-text-subtle)] uppercase mb-3 flex items-center gap-2">
                Resources
              </h3>
              <ul className="space-y-2.5 max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
                {activeTopicData.resources.map((res, idx) => (
                  <li key={idx}>
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-3 p-2 -mx-2 rounded-xl hover:bg-[var(--color-surface-elevated)] transition-colors"
                    >
                      <div className="mt-0.5 flex-shrink-0 w-6 h-6 flex items-center justify-center bg-[var(--color-accent-soft)] text-[var(--color-accent)] rounded-lg text-xs">
                        {res.type === 'video' ? <Play size={10} fill="currentColor" /> : <ExternalLink size={12} />}
                      </div>
                      <span className="text-sm font-medium text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors line-clamp-2">
                        {res.title}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
                isActive 
                  ? 'bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-border-light)]'
                  : 'bg-[var(--color-text)] text-[var(--color-surface)] hover:bg-[var(--color-text-muted)]'
              }`}
              onClick={togglePlayPause}
            >
              {isActive ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
              {isActive ? 'Pause' : 'Resume'}
            </button>
            <button
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[var(--color-success)] text-white hover:bg-[var(--color-success-hover)] font-medium transition-colors shadow-sm"
              onClick={handleMarkComplete}
            >
              <CheckCircle size={18} />
              Complete
            </button>
          </div>
          
          <button
            className="w-full mt-3 text-sm font-medium text-[var(--color-text-subtle)] hover:text-[var(--color-error)] py-2 transition-colors"
            onClick={handleStop}
          >
            End Session early
          </button>
        </div>
      )}

      {/* The Floating Pill (Dynamic Island style) */}
      <div
        className={`group flex items-center gap-3 rounded-full bg-[var(--color-surface-elevated)]/90 backdrop-blur-xl px-2 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[var(--color-border-light)] transition-all duration-300 cursor-pointer ${isExpanded ? 'scale-95 opacity-50 pointer-events-none' : 'hover:scale-105 hover:shadow-[0_8px_40px_rgba(0,0,0,0.16)]'}`}
        onClick={() => !isExpanded && dispatch(toggleExpanded())}
      >
        {/* Play/Pause control on the pill itself */}
        <button 
          onClick={togglePlayPause}
          className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full transition-colors ${isActive ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white' : 'bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-border-light)]'}`}
        >
          {isActive ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
        </button>

        {/* Progress Ring & Time */}
        <div className="relative flex items-center justify-center h-10 w-10">
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="none" stroke="var(--color-border-light)" strokeWidth="2.5" />
            <circle
              cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeDasharray="100"
              strokeDashoffset={100 - progressPercent}
              strokeLinecap="round"
              className={`transition-all duration-1000 ease-linear ${timeRemaining === 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-accent)]'}`}
            />
          </svg>
          <span className="text-xs font-bold font-mono tracking-tight text-[var(--color-text)] z-10">
            {Math.ceil(timeRemaining / 60)}m
          </span>
        </div>

        {/* Text Context */}
        <div className="flex flex-col pr-4 pl-1 min-w-[120px] max-w-[180px]">
          <span className="text-sm font-bold text-[var(--color-text)] leading-tight tracking-tight">
            {formatTime(timeRemaining)}
          </span>
          <span className="text-xs font-medium text-[var(--color-text-subtle)] truncate">
            {activeTopicData?.title || 'Focus Session'}
          </span>
        </div>
        
        {/* Chevron */}
        <div className="pr-3 text-[var(--color-text-subtle)] group-hover:text-[var(--color-text)] transition-colors">
          <ChevronUp size={18} />
        </div>
      </div>
    </div>
  );
}
