import { useGetHistoryQuery } from '../slices/playerApiSlice';
import { useMemo } from 'react';

export default function usePlayerHistory(playerId) {
  const { data, isLoading, isError, error } = useGetHistoryQuery(playerId, { skip: !playerId });
  return useMemo(() => data || [], [data]);
}