import { useState, useCallback } from 'react';

/**
 * Response interface for the useApi hook
 */
interface ApiResponse<T, Args extends unknown[]> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: Args) => Promise<T | null>;
}

/**
 * Custom hook for making API calls with loading and error states
 * 
 * @param apiFunction - The API function to call
 * @returns Object with data, loading state, error, and execute function
 * 
 * @example
 * const { data, loading, error, execute } = useApi(getPatients);
 * 
 * // Call the API function
 * useEffect(() => {
 *   execute();
 * }, [execute]);
 */
export const useApi = <T, Args extends unknown[]>(
  apiFunction: (...args: Args) => Promise<T>
): ApiResponse<T, Args> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await apiFunction(...args);
        setData(result);
        return result;
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error('An unknown error occurred');
        setError(errorObj);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  return { data, loading, error, execute };
}; 