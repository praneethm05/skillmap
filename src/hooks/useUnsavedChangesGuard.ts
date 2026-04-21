import { useCallback, useEffect } from 'react';

export const useUnsavedChangesGuard = (hasUnsavedChanges: boolean) => {
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) {
        return;
      }

      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const confirmNavigation = useCallback(
    (onConfirm: () => void) => {
      if (!hasUnsavedChanges) {
        onConfirm();
        return;
      }

      const confirmed = window.confirm(
        'You have unsaved changes in this journey. Leave this page anyway?',
      );

      if (confirmed) {
        onConfirm();
      }
    },
    [hasUnsavedChanges],
  );

  return { confirmNavigation };
};
