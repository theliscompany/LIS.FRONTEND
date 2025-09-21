import React from 'react';
import { DraftQuoteManager } from '../components/DraftQuoteManager';
import { useDraftQuoteState } from '../hooks/useDraftQuoteState';

const DraftQuotesPage: React.FC = () => {
  const handleQuoteCreated = (quoteId: string) => {
    console.log('Quote created with ID:', quoteId);
    // Rediriger vers la page des devis ou afficher une notification
  };

  return (
    <div className="draft-quotes-page">
      <div className="page-header">
        <h1>Draft Quotes Management</h1>
        <p>Create and manage draft quotes before finalizing them into official quotes.</p>
      </div>
      
      <DraftQuoteManager
        onQuoteCreated={handleQuoteCreated}
      />
    </div>
  );
};

export default DraftQuotesPage;
