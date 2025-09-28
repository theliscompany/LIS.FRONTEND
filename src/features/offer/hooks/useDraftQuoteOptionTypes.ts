import { useQuery } from '@tanstack/react-query';
import { getApiDraftQuotesOptionTypesOptions } from '../api/@tanstack/react-query.gen';

/**
 * Hook pour récupérer les types d'options disponibles pour les devis brouillons
 */
export const useDraftQuoteOptionTypes = () => {
  return useQuery({
    ...getApiDraftQuotesOptionTypesOptions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export default useDraftQuoteOptionTypes;
