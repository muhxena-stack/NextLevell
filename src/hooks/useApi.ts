// src/hooks/useApi.ts
import { useState, useEffect, useCallback } from 'react';
import { AppError, ServiceResponse } from '../types/types';

export const useApi = <T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = [],
  autoFetch: boolean = true
): ServiceResponse<T> & { refetch: () => void } => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const [loading, setLoading] = useState<boolean>(autoFetch);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      setData(result);
      return result;
    } catch (err: any) {
      // Pastikan code selalu string, tidak boleh undefined
      const appError: AppError = {
        code: err.code || 'UNKNOWN_ERROR', // Default value jika undefined
        message: err.message || 'An error occurred',
        status: err.response?.status,
        details: err.response?.data || err.details,
      };
      setError(appError);
      throw appError;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    if (autoFetch) {
      execute();
    }
  }, dependencies);

  const refetch = () => {
    execute();
  };

  return {
    data,
    error,
    loading,
    refetch,
  };
};

// Hook khusus untuk polling
export const usePolling = <T>(
  apiCall: () => Promise<T>,
  interval: number,
  dependencies: any[] = [],
  enabled: boolean = true
) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [pollingCount, setPollingCount] = useState<number>(0);

  useEffect(() => {
    if (!enabled) return;

    let isMounted = true;
    let timeoutId: number | undefined; // Ubah dari NodeJS.Timeout ke number

    const executePolling = async () => {
      if (!isMounted) return;

      try {
        setLoading(true);
        const result = await apiCall();
        if (isMounted) {
          setData(result);
          setError(null);
          setPollingCount(prev => prev + 1);
        }
      } catch (err: any) {
        if (isMounted) {
          const appError: AppError = {
            code: err.code || 'POLLING_ERROR', // Default value
            message: err.message || 'Polling error occurred',
            status: err.response?.status,
            details: err.response?.data,
          };
          setError(appError);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }

      // Schedule next polling
      if (isMounted && enabled) {
        timeoutId = setTimeout(executePolling, interval) as unknown as number;
      }
    };

    // Start polling
    executePolling();

    // Cleanup
    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [apiCall, interval, enabled, ...dependencies]);

  return {
    data,
    error,
    loading,
    pollingCount,
    refetch: () => setPollingCount(prev => prev + 1), // Manual trigger
  };
};