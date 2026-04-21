import { useCallback, useState } from 'react';

type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncActionState {
  status: AsyncStatus;
  error: string | null;
}

export const useAsyncAction = <TArgs extends unknown[], TResult>(
  action: (...args: TArgs) => Promise<TResult>,
) => {
  const [state, setState] = useState<AsyncActionState>({
    status: 'idle',
    error: null,
  });

  const execute = useCallback(
    async (...args: TArgs): Promise<TResult> => {
      setState({ status: 'loading', error: null });

      try {
        const result = await action(...args);
        setState({ status: 'success', error: null });
        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unexpected error';
        setState({ status: 'error', error: message });
        throw error;
      }
    },
    [action],
  );

  const reset = useCallback(() => {
    setState({ status: 'idle', error: null });
  }, []);

  return {
    execute,
    reset,
    isLoading: state.status === 'loading',
    status: state.status,
    error: state.error,
  };
};
