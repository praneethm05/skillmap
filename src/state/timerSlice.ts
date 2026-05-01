import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { PlanSubtopic } from '../types/domain';

interface TimerState {
  isActive: boolean;
  isExpanded: boolean;
  timeRemaining: number;
  initialDuration: number;
  activePlanId: string | null;
  activeSubtopicId: string | null;
  activeTopicData: PlanSubtopic | null;
}

const initialState: TimerState = {
  isActive: false,
  isExpanded: false,
  timeRemaining: 0,
  initialDuration: 0,
  activePlanId: null,
  activeSubtopicId: null,
  activeTopicData: null,
};

export const timerSlice = createSlice({
  name: 'timer',
  initialState,
  reducers: {
    startFocus: (
      state,
      action: PayloadAction<{
        planId?: string;
        subtopicId?: string;
        topicData?: PlanSubtopic;
        durationMinutes: number;
        title?: string;
      }>
    ) => {
      state.isActive = true;
      state.isExpanded = true;
      state.activePlanId = action.payload.planId || null;
      state.activeSubtopicId = action.payload.subtopicId || null;
      state.activeTopicData = action.payload.topicData || (action.payload.title ? { title: action.payload.title, id: '', description: '', isCompleted: false, estimatedHours: 0, resources: [] } : null);
      state.initialDuration = action.payload.durationMinutes * 60;
      state.timeRemaining = action.payload.durationMinutes * 60;
    },
    tick: (state) => {
      if (state.isActive && state.timeRemaining > 0) {
        state.timeRemaining -= 1;
      } else if (state.timeRemaining === 0) {
        state.isActive = false; // Auto-pause when timer reaches 0
      }
    },
    pauseFocus: (state) => {
      state.isActive = false;
    },
    resumeFocus: (state) => {
      if (state.timeRemaining > 0) {
        state.isActive = true;
      }
    },
    stopFocus: (state) => {
      state.isActive = false;
      state.isExpanded = false;
      state.timeRemaining = 0;
      state.initialDuration = 0;
      state.activePlanId = null;
      state.activeSubtopicId = null;
      state.activeTopicData = null;
    },
    toggleExpanded: (state) => {
      state.isExpanded = !state.isExpanded;
    },
    setExpanded: (state, action: PayloadAction<boolean>) => {
      state.isExpanded = action.payload;
    },
  },
});

export const {
  startFocus,
  tick,
  pauseFocus,
  resumeFocus,
  stopFocus,
  toggleExpanded,
  setExpanded,
} = timerSlice.actions;

export default timerSlice.reducer;
