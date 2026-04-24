import { useCallback, useState } from 'react';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(async (fn) => {
    setLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (e) {
      const msg = e?.response?.data?.error || e.message || 'Request failed';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, setError, run };
}
