import { useQuery } from '@tanstack/react-query';
import { getApiDraftQuotesByIdOptions } from '@features/offer/api/@tanstack/react-query.gen';

export const useDraftQuoteData = (draftId: string | undefined) => {
  return useQuery({
    ...getApiDraftQuotesByIdOptions({ path: { id: draftId || '' } }),
    enabled: !!draftId,
  });
};
