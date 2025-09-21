import React, { useState } from 'react';
import {
  useDraftQuotes,
  useCreateDraftQuote,
  useUpdateDraftQuote,
  useDeleteDraftQuote,
  useAddDraftQuoteOption,
  useDeleteDraftQuoteOption,
  useFinalizeDraftQuote,
  mapDraftQuoteFromApi,
  mapDraftQuoteToApi,
  mapOptionToApi,
  validateDraftQuote,
  createEmptyOption,
  calculateOptionTotals,
} from '../services/draftQuoteService';
import type { DraftQuote, DraftQuoteOption, DraftQuoteStatus } from '../types/DraftQuote';

interface DraftQuoteManagerProps {
  requestQuoteId?: string;
  onQuoteCreated?: (quoteId: string) => void;
}

export const DraftQuoteManager: React.FC<DraftQuoteManagerProps> = ({
  requestQuoteId,
  onQuoteCreated,
}) => {
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState<{
    status?: DraftQuoteStatus;
    customerName?: string;
  }>({});

  // Hooks pour les requêtes
  const { data: draftQuotesData, isLoading, error } = useDraftQuotes({
    page: 1,
    pageSize: 10,
    ...filters,
  });

  const createMutation = useCreateDraftQuote();
  const updateMutation = useUpdateDraftQuote();
  const deleteMutation = useDeleteDraftQuote();
  const addOptionMutation = useAddDraftQuoteOption();
  const deleteOptionMutation = useDeleteDraftQuoteOption();
  const finalizeMutation = useFinalizeDraftQuote();

  // Gestionnaires d'événements
  const handleCreateDraftQuote = async (draftQuoteData: Partial<DraftQuote>) => {
    try {
      const validation = validateDraftQuote(draftQuoteData);
      if (!validation.isValid) {
        console.error('Validation errors:', validation.errors);
        return;
      }

      const apiData = mapDraftQuoteToApi(draftQuoteData);
      await createMutation.mutateAsync({
        body: apiData,
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating draft quote:', error);
    }
  };

  const handleUpdateDraftQuote = async (id: string, updates: Partial<DraftQuote>) => {
    try {
      await updateMutation.mutateAsync({
        path: { id },
        body: updates,
      });
    } catch (error) {
      console.error('Error updating draft quote:', error);
    }
  };

  const handleDeleteDraftQuote = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this draft quote?')) {
      try {
        await deleteMutation.mutateAsync({
          path: { id },
        });
      } catch (error) {
        console.error('Error deleting draft quote:', error);
      }
    }
  };

  const handleAddOption = async (draftId: string, option: DraftQuoteOption) => {
    try {
      const calculatedOption = calculateOptionTotals(option);
      const apiData = mapOptionToApi(calculatedOption);
      await addOptionMutation.mutateAsync({
        path: { id: draftId },
        body: apiData,
      });
    } catch (error) {
      console.error('Error adding option:', error);
    }
  };

  const handleDeleteOption = async (draftId: string, optionId: string) => {
    try {
      await deleteOptionMutation.mutateAsync({
        path: { id: draftId, optionId },
      });
    } catch (error) {
      console.error('Error deleting option:', error);
    }
  };

  const handleFinalizeDraftQuote = async (draftId: string, selectedOptionId: string) => {
    try {
      const result = await finalizeMutation.mutateAsync({
        path: { id: draftId },
        body: {
          selectedOptionId,
          validityDays: 15,
        },
      });
      
      if (result.data?.data && onQuoteCreated) {
        onQuoteCreated(result.data.data.draftQuoteId || '');
      }
    } catch (error) {
      console.error('Error finalizing draft quote:', error);
    }
  };

  if (isLoading) return <div>Loading draft quotes...</div>;
  if (error) return <div>Error loading draft quotes: {error.message}</div>;

  const draftQuotes = draftQuotesData?.data?.data || [];

  return (
    <div className="draft-quote-manager">
      <div className="header">
        <h2>Draft Quotes Management</h2>
        <div className="controls">
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary"
          >
            Create New Draft Quote
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="filters">
        <select
          value={filters.status || ''}
          onChange={(e) => setFilters(prev => ({
            ...prev,
            status: e.target.value as DraftQuoteStatus || undefined,
          }))}
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="in_progress">In Progress</option>
          <option value="finalized">Finalized</option>
          <option value="cancelled">Cancelled</option>
        </select>
        
        <input
          type="text"
          placeholder="Filter by customer name..."
          value={filters.customerName || ''}
          onChange={(e) => setFilters(prev => ({
            ...prev,
            customerName: e.target.value || undefined,
          }))}
        />
      </div>

      {/* Liste des brouillons */}
      <div className="draft-quotes-list">
        {draftQuotes.map((draftQuote) => {
          const mappedDraft = mapDraftQuoteFromApi(draftQuote);
          return (
            <DraftQuoteCard
              key={mappedDraft.draftQuoteId}
              draftQuote={mappedDraft}
              onSelect={() => setSelectedDraftId(mappedDraft.draftQuoteId || null)}
              onUpdate={(updates) => 
                mappedDraft.draftQuoteId && 
                handleUpdateDraftQuote(mappedDraft.draftQuoteId, updates)
              }
              onDelete={() => 
                mappedDraft.draftQuoteId && 
                handleDeleteDraftQuote(mappedDraft.draftQuoteId)
              }
              onAddOption={(option) => 
                mappedDraft.draftQuoteId && 
                handleAddOption(mappedDraft.draftQuoteId, option)
              }
              onDeleteOption={(optionId) => 
                mappedDraft.draftQuoteId && 
                handleDeleteOption(mappedDraft.draftQuoteId, optionId)
              }
              onFinalize={(selectedOptionId) => 
                mappedDraft.draftQuoteId && 
                handleFinalizeDraftQuote(mappedDraft.draftQuoteId, selectedOptionId)
              }
            />
          );
        })}
      </div>

      {/* Formulaire de création */}
      {showCreateForm && (
        <CreateDraftQuoteForm
          requestQuoteId={requestQuoteId}
          onSubmit={handleCreateDraftQuote}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </div>
  );
};

// Composant pour afficher une carte de brouillon
interface DraftQuoteCardProps {
  draftQuote: DraftQuote;
  onSelect: () => void;
  onUpdate: (updates: Partial<DraftQuote>) => void;
  onDelete: () => void;
  onAddOption: (option: DraftQuoteOption) => void;
  onDeleteOption: (optionId: string) => void;
  onFinalize: (selectedOptionId: string) => void;
}

const DraftQuoteCard: React.FC<DraftQuoteCardProps> = ({
  draftQuote,
  onSelect,
  onUpdate,
  onDelete,
  onAddOption,
  onDeleteOption,
  onFinalize,
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const handleAddNewOption = () => {
    const newOption = createEmptyOption();
    onAddOption(newOption);
  };

  const handleFinalize = () => {
    if (selectedOptionId) {
      onFinalize(selectedOptionId);
    }
  };

  return (
    <div className="draft-quote-card">
      <div className="card-header">
        <h3>{draftQuote.customer?.name || 'Unnamed Customer'}</h3>
        <span className={`status status-${draftQuote.status}`}>
          {draftQuote.status}
        </span>
      </div>
      
      <div className="card-content">
        <p><strong>Request ID:</strong> {draftQuote.requestQuoteId}</p>
        <p><strong>Currency:</strong> {draftQuote.currency}</p>
        <p><strong>Incoterm:</strong> {draftQuote.incoterm}</p>
        <p><strong>Created:</strong> {draftQuote.createdAt?.toLocaleDateString()}</p>
        
        {draftQuote.shipment && (
          <div className="shipment-info">
            <p><strong>Route:</strong> {draftQuote.shipment.origin?.location} → {draftQuote.shipment.destination?.location}</p>
            <p><strong>Containers:</strong> {draftQuote.shipment.containerTypes?.join(', ')}</p>
          </div>
        )}
      </div>

      <div className="card-actions">
        <button onClick={onSelect} className="btn btn-secondary">
          View Details
        </button>
        
        <button 
          onClick={() => setShowOptions(!showOptions)} 
          className="btn btn-secondary"
        >
          {showOptions ? 'Hide' : 'Show'} Options ({draftQuote.options?.length || 0})
        </button>
        
        <button onClick={handleAddNewOption} className="btn btn-primary">
          Add Option
        </button>
        
        {draftQuote.status === 'in_progress' && (
          <button 
            onClick={handleFinalize} 
            className="btn btn-success"
            disabled={!selectedOptionId}
          >
            Finalize Quote
          </button>
        )}
        
        <button onClick={onDelete} className="btn btn-danger">
          Delete
        </button>
      </div>

      {/* Options */}
      {showOptions && (
        <div className="options-section">
          <h4>Options</h4>
          {draftQuote.options?.map((option) => (
            <div key={option.optionId} className="option-item">
              <div className="option-header">
                <input
                  type="radio"
                  name={`option-${draftQuote.draftQuoteId}`}
                  value={option.optionId}
                  checked={selectedOptionId === option.optionId}
                  onChange={(e) => setSelectedOptionId(e.target.value)}
                />
                <span className="option-label">{option.label}</span>
                <span className="option-total">
                  {option.totals?.grandTotal?.toFixed(2)} {option.currency}
                </span>
              </div>
              
              <div className="option-details">
                <p><strong>Valid Until:</strong> {option.validUntil}</p>
                <p><strong>Containers:</strong> {option.containers?.map(c => `${c.quantity}x ${c.containerType}`).join(', ')}</p>
                
                {option.planning && (
                  <div className="planning">
                    <p><strong>ETD:</strong> {option.planning.etd}</p>
                    <p><strong>ETA:</strong> {option.planning.eta}</p>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => option.optionId && onDeleteOption(option.optionId)}
                className="btn btn-sm btn-danger"
              >
                Delete Option
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Composant pour créer un nouveau brouillon
interface CreateDraftQuoteFormProps {
  requestQuoteId?: string;
  onSubmit: (draftQuote: Partial<DraftQuote>) => void;
  onCancel: () => void;
}

const CreateDraftQuoteForm: React.FC<CreateDraftQuoteFormProps> = ({
  requestQuoteId,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Partial<DraftQuote>>({
    requestQuoteId: requestQuoteId || '',
    currency: 'EUR',
    incoterm: 'FOB',
    status: 'draft',
    customer: {
      type: 'company',
      name: '',
      emails: [],
      phones: [],
      address: {
        city: '',
        country: '',
      },
    },
    shipment: {
      mode: 'sea',
      containerCount: 1,
      containerTypes: ['20GP'],
      commodity: '',
      hsCodes: [],
      origin: {
        location: '',
        country: '',
      },
      destination: {
        location: '',
        country: '',
      },
      docs: {
        requiresVGM: false,
        requiresBLDraftApproval: false,
      },
      constraints: {
        minTruckLeadDays: 6,
        terminalCutoffDays: 11,
        customsDeadlineHours: 48,
      },
    },
    commercialTerms: {
      depositPolicy: {
        type: 'fixed',
        value: 0,
      },
      generalConditionsId: '',
    },
    wizard: {
      notes: '',
      selectedServiceLevel: 'standard',
      seafreights: [],
      haulages: [],
      services: [],
    },
    options: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="create-form-overlay">
      <div className="create-form">
        <h3>Create New Draft Quote</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Request Quote ID:</label>
            <input
              type="text"
              value={formData.requestQuoteId}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                requestQuoteId: e.target.value,
              }))}
              required
            />
          </div>

          <div className="form-group">
            <label>Customer Name:</label>
            <input
              type="text"
              value={formData.customer?.name || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                customer: {
                  ...prev.customer,
                  name: e.target.value,
                },
              }))}
              required
            />
          </div>

          <div className="form-group">
            <label>Origin Location:</label>
            <input
              type="text"
              value={formData.shipment?.origin?.location || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                shipment: {
                  ...prev.shipment,
                  origin: {
                    ...prev.shipment?.origin,
                    location: e.target.value,
                  },
                },
              }))}
              required
            />
          </div>

          <div className="form-group">
            <label>Destination Location:</label>
            <input
              type="text"
              value={formData.shipment?.destination?.location || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                shipment: {
                  ...prev.shipment,
                  destination: {
                    ...prev.shipment?.destination,
                    location: e.target.value,
                  },
                },
              }))}
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Create Draft Quote
            </button>
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DraftQuoteManager;
