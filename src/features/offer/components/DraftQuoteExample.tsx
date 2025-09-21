import React, { useState } from 'react';
import { DraftQuoteManager } from './DraftQuoteManager';
import DraftQuoteEditor from './DraftQuoteEditor';
import type { DraftQuote } from '../types/DraftQuote';
import '../styles/DraftQuote.css';

const DraftQuoteExample: React.FC = () => {
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const handleDraftSelected = (draftId: string) => {
    setSelectedDraftId(draftId);
    setShowEditor(true);
  };

  const handleQuoteCreated = (quoteId: string) => {
    console.log('Quote created with ID:', quoteId);
    setShowEditor(false);
    setSelectedDraftId(null);
    // Ici vous pourriez rediriger vers la page des devis ou afficher une notification
  };

  const handleSaveDraft = (draftQuote: Partial<DraftQuote>) => {
    console.log('Saving draft quote:', draftQuote);
    // Ici vous appelleriez l'API pour sauvegarder le brouillon
  };

  const handleFinalizeDraft = (selectedOptionId: string) => {
    console.log('Finalizing draft with option:', selectedOptionId);
    // Ici vous appelleriez l'API pour finaliser le brouillon
  };

  return (
    <div className="draft-quote-example">
      <div className="example-header">
        <h1>Draft Quote Management System</h1>
        <p>This example demonstrates the new DraftQuote structure integration with the backend API.</p>
      </div>

      {!showEditor ? (
        <DraftQuoteManager
          onDraftSelected={handleDraftSelected}
          onQuoteCreated={handleQuoteCreated}
        />
      ) : (
        <div className="editor-container">
          <div className="editor-header">
            <button 
              onClick={() => setShowEditor(false)} 
              className="btn btn-secondary"
            >
              ← Back to List
            </button>
            <h2>Edit Draft Quote</h2>
          </div>
          
          <DraftQuoteEditor
            onSave={handleSaveDraft}
            onCancel={() => setShowEditor(false)}
            onFinalize={handleFinalizeDraft}
          />
        </div>
      )}

      <div className="example-info">
        <h3>Features Implemented:</h3>
        <ul>
          <li>✅ Complete DraftQuote type definitions matching the API</li>
          <li>✅ React Query integration for API calls</li>
          <li>✅ Draft quote CRUD operations</li>
          <li>✅ Option management (add, edit, delete)</li>
          <li>✅ Real-time validation</li>
          <li>✅ State management with custom hooks</li>
          <li>✅ Responsive UI components</li>
          <li>✅ Quote finalization workflow</li>
        </ul>

        <h3>API Endpoints Used:</h3>
        <ul>
          <li><code>POST /api/draft-quotes</code> - Create draft quote</li>
          <li><code>GET /api/draft-quotes</code> - List draft quotes</li>
          <li><code>GET /api/draft-quotes/{id}</code> - Get draft quote by ID</li>
          <li><code>PUT /api/draft-quotes/{id}</code> - Update draft quote</li>
          <li><code>DELETE /api/draft-quotes/{id}</code> - Delete draft quote</li>
          <li><code>POST /api/draft-quotes/{id}/options</code> - Add option</li>
          <li><code>DELETE /api/draft-quotes/{id}/options/{optionId}</code> - Delete option</li>
          <li><code>POST /api/draft-quotes/{id}/finalize</code> - Finalize draft quote</li>
          <li><code>POST /api/quotes</code> - Create quote from draft</li>
        </ul>

        <h3>Key Components:</h3>
        <ul>
          <li><strong>DraftQuoteManager</strong> - Main management interface</li>
          <li><strong>DraftQuoteEditor</strong> - Full-featured editor</li>
          <li><strong>DraftQuoteOptionEditor</strong> - Option-specific editor</li>
          <li><strong>useDraftQuoteState</strong> - State management hook</li>
          <li><strong>draftQuoteService</strong> - API service layer</li>
        </ul>
      </div>
    </div>
  );
};

export default DraftQuoteExample;
