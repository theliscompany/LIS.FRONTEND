// === HOOK POUR LE DEBUG LOGGING CONDITIONNEL ===
import { useCallback } from 'react';

export const useDebugLogger = (enabled = process.env.NODE_ENV === 'development') => {
  return useCallback((message: string, data?: any) => {
    if (enabled) {
      console.log(`[WIZARD] ${message}`, data);
    }
  }, [enabled]);
};
