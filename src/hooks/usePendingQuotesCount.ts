import { useQuery } from '@tanstack/react-query';
import { postApiQuotesSearch } from '../features/offer/api/sdk.gen';

export const usePendingQuotesCount = () => {
  return useQuery({
    queryKey: ['pendingQuotesCount'],
    queryFn: async () => {
      try {
        const response = await postApiQuotesSearch({
          body: {
            status: 'PENDING_APPROVAL',
            pageNumber: 1,
            pageSize: 100 // Taille maximale autorisée par l'API (entre 1 et 100)
          }
        });
        
        // La structure exacte dépend de votre API, ajustez selon votre réponse
        if (response?.data && typeof response.data === 'object') {
          // Si c'est un tableau direct
          if (Array.isArray(response.data)) {
            return response.data.length;
          }
          // Si c'est un objet avec une propriété data
          if ('data' in response.data && Array.isArray(response.data.data)) {
            return response.data.data.length;
          }
          // Si c'est un objet avec une propriété items (pagination)
          if ('items' in response.data && Array.isArray(response.data.items)) {
            return (response.data as any).items.length;
          }
          // Si c'est un objet avec totalCount
          if ('totalCount' in response.data) {
            return (response.data as any).totalCount;
          }
        }
        return 0;
      } catch (error) {
        console.error('Erreur lors du chargement du nombre de devis en attente:', error);
        return 0;
      }
    },
    staleTime: 30 * 1000, // 30 secondes
    refetchInterval: 60 * 1000, // Rafraîchir toutes les minutes
  });
}; 