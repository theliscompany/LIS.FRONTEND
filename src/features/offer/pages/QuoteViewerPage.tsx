import React from 'react';
import { useParams } from 'react-router-dom';
import QuoteViewer from '../components/QuoteViewer';

const QuoteViewerPage: React.FC = () => {
  const { quoteId } = useParams<{ quoteId: string }>();

  if (!quoteId) {
    return (
      <div>
        <p>ID du devis manquant</p>
      </div>
    );
  }

  return (
    <QuoteViewer 
      quoteId={quoteId}
      showActions={true}
    />
  );
};

export default QuoteViewerPage; 