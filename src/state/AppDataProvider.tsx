import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import Toast, { type ToastItem } from '../components/ui/Toast';
import type { ProgressSummary } from '../types/domain';

export interface UserPreferences {
  compactMode: boolean;
}

interface AppDataContextValue {
  preferences: UserPreferences;
  activePlanId: string | null;
  progressSnapshots: Record<string, ProgressSummary>;
  setActivePlanId: (planId: string | null) => void;
  setProgressSnapshot: (planId: string, snapshot: ProgressSummary) => void;
  updatePreferences: (next: Partial<UserPreferences>) => void;
  pushToast: (toast: Omit<ToastItem, 'id'>) => void;
}

const APP_PREFERENCES_KEY = 'skillmap:preferences';

const getStoredPreferences = (): UserPreferences => {
  const raw = localStorage.getItem(APP_PREFERENCES_KEY);
  if (!raw) {
    return { compactMode: false };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    return {
      compactMode: Boolean(parsed.compactMode),
    };
  } catch {
    return { compactMode: false };
  }
};

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

export function AppDataProvider({ children }: PropsWithChildren) {
  const [preferences, setPreferences] = useState<UserPreferences>(getStoredPreferences);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [progressSnapshots, setProgressSnapshots] = useState<Record<string, ProgressSummary>>({});
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const updatePreferences = useCallback((next: Partial<UserPreferences>) => {
    setPreferences((current) => {
      const updated = { ...current, ...next };
      localStorage.setItem(APP_PREFERENCES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const pushToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const toastItem = { ...toast, id };
    setToasts((current) => [...current, toastItem]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3200);
  }, []);

  const dismissToast = useCallback((toastId: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== toastId));
  }, []);

  const setProgressSnapshot = useCallback((planId: string, snapshot: ProgressSummary) => {
    setProgressSnapshots((current) => ({
      ...current,
      [planId]: snapshot,
    }));
  }, []);

  const value = useMemo(
    () => ({
      preferences,
      activePlanId,
      progressSnapshots,
      setActivePlanId,
      setProgressSnapshot,
      updatePreferences,
      pushToast,
    }),
    [
      preferences,
      activePlanId,
      progressSnapshots,
      setActivePlanId,
      setProgressSnapshot,
      updatePreferences,
      pushToast,
    ],
  );

  return (
    <AppDataContext.Provider value={value}>
      {children}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </AppDataContext.Provider>
  );
}

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider');
  }

  return context;
};
