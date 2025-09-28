import { useMutation } from '@tanstack/react-query';
import { postApiQuotesByIdSelectOptionMutation } from '@features/offer/api/@tanstack/react-query.gen';
import { useSnackbar } from 'notistack';

export const useSelectQuoteOption = () => {
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    ...postApiQuotesByIdSelectOptionMutation(),
    onSuccess: (data) => {
      console.log('✅ [useSelectQuoteOption] Option sélectionnée avec succès:', data);
      enqueueSnackbar('Option sélectionnée avec succès !', { variant: 'success' });
    },
    onError: (error) => {
      console.error('❌ [useSelectQuoteOption] Erreur lors de la sélection de l\'option:', error);
      enqueueSnackbar('Erreur lors de la sélection de l\'option', { variant: 'error' });
    }
  });
};
