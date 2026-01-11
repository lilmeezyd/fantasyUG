import { useMemo } from 'react';

export default function useSafeFixtures(fixtures) {    
  return useMemo(() => {
    if (!Array.isArray(fixtures)) return [];
    return [...fixtures].sort((a, b) => (a.kickOffTime > b.kickOffTime ? 1 : -1));
  }, [fixtures]);
}