import { useState, useEffect, useCallback, useRef, DependencyList } from 'react';

export interface QueryState<TData, TError = Error> {
  data: TData | null;
  error: TError | null;
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;
}

export interface QueryOptions<TData, TError = Error> {
  enabled?: boolean;
  retry?: number;
  retryDelay?: number;
  staleTime?: number;
  cacheTime?: number;
  refetchOnMount?: boolean;
  refetchOnReconnect?: boolean;
  refetchOnWindowFocus?: boolean;
  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
  initialData?: TData;
}

interface CacheEntry<TData> {
  data: TData;
  timestamp: number;
  staleTime: number;
}

const queryCache = new Map<string, CacheEntry<any>>();

export function useQuery<TData, TError = Error>(
  queryKey: string,
  queryFn: () => Promise<TData>,
  options: QueryOptions<TData, TError> = {}
): QueryState<TData, TError> & {
  refetch: () => Promise<void>;
  invalidate: () => void;
} {
  const {
    enabled = true,
    retry = 3,
    retryDelay = 1000,
    staleTime = 5 * 60 * 1000,
    cacheTime = 30 * 60 * 1000,
    refetchOnMount = true,
    refetchOnReconnect = true,
    refetchOnWindowFocus = true,
    onSuccess,
    onError,
    initialData,
  } = options;

  const [state, setState] = useState<QueryState<TData, TError>>({
    data: initialData ?? null,
    error: null,
    isLoading: enabled,
    isFetching: enabled,
    isSuccess: false,
    isError: false,
  });

  const retryCountRef = useRef(0);
  const isMountedRef = useRef(true);

  const safeSetState = useCallback((newState: Partial<QueryState<TData, TError>>) => {
    if (isMountedRef.current) {
      setState(prev => ({ ...prev, ...newState }));
    }
  }, []);

  const fetchData = useCallback(async (isRefetch = false) => {
    if (!enabled) return;

    const cachedEntry = queryCache.get(queryKey);
    const now = Date.now();
    
    if (cachedEntry && now - cachedEntry.timestamp < staleTime) {
      safeSetState({
        data: cachedEntry.data,
        isLoading: false,
        isFetching: false,
        isSuccess: true,
        isError: false,
      });
      return;
    }

    if (!isRefetch && cachedEntry) {
      safeSetState({
        data: cachedEntry.data,
        isFetching: true,
      });
    } else {
      safeSetState({
        isLoading: !isRefetch,
        isFetching: true,
      });
    }

    retryCountRef.current = 0;

    const executeQuery = async (): Promise<TData> => {
      try {
        const data = await queryFn();
        
        queryCache.set(queryKey, {
          data,
          timestamp: Date.now(),
          staleTime,
        });

        if (isMountedRef.current) {
          safeSetState({
            data,
            error: null,
            isLoading: false,
            isFetching: false,
            isSuccess: true,
            isError: false,
          });
          onSuccess?.(data);
        }

        return data;
      } catch (error) {
        if (retryCountRef.current < retry) {
          retryCountRef.current++;
          await new Promise(resolve => setTimeout(resolve, retryDelay * retryCountRef.current));
          return executeQuery();
        }

        if (isMountedRef.current) {
          safeSetState({
            error: error as TError,
            isLoading: false,
            isFetching: false,
            isSuccess: false,
            isError: true,
          });
          onError?.(error as TError);
        }

        throw error;
      }
    };

    await executeQuery();
  }, [
    queryKey,
    queryFn,
    enabled,
    staleTime,
    cacheTime,
    retry,
    retryDelay,
    onSuccess,
    onError,
    safeSetState,
  ]);

  const refetch = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  const invalidate = useCallback(() => {
    queryCache.delete(queryKey);
  }, [queryKey]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (enabled && refetchOnMount) {
      fetchData();
    }
  }, [enabled, refetchOnMount, fetchData]);

  useEffect(() => {
    if (!refetchOnReconnect) return;

    const handleOnline = () => fetchData(true);
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [refetchOnReconnect, fetchData]);

  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => fetchData(true);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnWindowFocus, fetchData]);

  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of queryCache.entries()) {
        if (now - entry.timestamp > entry.staleTime + cacheTime) {
          queryCache.delete(key);
        }
      }
    }, 60000);

    return () => clearInterval(cleanupInterval);
  }, [cacheTime]);

  return {
    ...state,
    refetch,
    invalidate,
  };
}

export function invalidateQuery(queryKey: string): void {
  queryCache.delete(queryKey);
}

export function clearQueryCache(): void {
  queryCache.clear();
}
