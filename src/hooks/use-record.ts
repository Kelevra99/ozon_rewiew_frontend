'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';

export function useRecord<T>(path: string, auth = true) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setLoading(true);
        setErrorText('');
        const result = await apiFetch<T>(path, { method: 'GET', auth });
        if (!cancelled) {
          setData(result);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorText(error instanceof Error ? error.message : 'Request failed');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [path, auth]);

  return { data, loading, errorText, setData };
}
