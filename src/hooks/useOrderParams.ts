import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { parseQuery, serializeQuery, type OrderQuery } from '@/lib/searchParams';

export function useOrderParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.toString();
  const query = useMemo(() => parseQuery(new URLSearchParams(search)), [search]);

  const updateQuery = useCallback(
    (patch: Partial<OrderQuery>) => {
      setSearchParams((current) => serializeQuery({ ...parseQuery(current), page: 1, ...patch }));
    },
    [setSearchParams],
  );

  const resetQuery = useCallback(() => setSearchParams(new URLSearchParams()), [setSearchParams]);

  return { query, updateQuery, resetQuery };
}
