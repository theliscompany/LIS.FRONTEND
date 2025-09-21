import { useQuery } from '@tanstack/react-query';
import { getApiDraftQuotes } from '../features/offer/api/sdk.gen';

export const usePendingQuotesCount = () => {
  return useQuery({
    queryKey: ['pendingQuotesCount'],
    queryFn: async () => {
      try {
        // Récupérer tous les brouillons de devis
        const response = await getApiDraftQuotes({
          query: {
            pageNumber: 1,
            pageSize: 100 // Taille maximale autorisée par l'API
          }
        });
        
        // Filtrer les brouillons en attente d'approbation
        if (response?.data?.data) {
          const pendingQuotes = response.data.data.filter((quote: any) => 
            quote.status === 'pending_approval' || 
            quote.status === 'PENDING_APPROVAL' ||
            quote.status === 'pending'
          );
          return pendingQuotes.length;
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