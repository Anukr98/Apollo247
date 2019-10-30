import { useEffect, useState } from 'react';

export const useFetch = <TData = any, TError = any>(apiCall: () => Promise<TData>) => {
  const [error, setError] = useState<TError | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TData | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await apiCall();
        setData(response);
      } catch (e) {
        setError(e);
      }
      setLoading(false);
    })();
  }, []);

  return { error, loading, data };
};
