import React from 'react';
import { useDraftQuoteState } from '../hooks/useDraftQuoteState';
import DraftQuoteOptionEditor from './DraftQuoteOptionEditor';
import type { DraftQuote } from '../types/DraftQuote';

interface DraftQuoteEditorProps {
  draftQuote?: Partial<DraftQuote>;
  onSave: (draftQuote: Partial<DraftQuote>) => void;
  onCancel: () => void;
  onFinalize?: (selectedOptionId: string) => void;
}

export const DraftQuoteEditor: React.FC<DraftQuoteEditorProps> = ({
  draftQuote: initialDraftQuote,
  onSave,
  onCancel,
  onFinalize,
}) => {
  const {
    draftQuote,
    selectedOptionId,
    isEditing,
    validation,
    selectedOption,
    hasOptions,
    canFinalize,
    totalOptions,
    totalValue,
    updateCustomer,
    updateShipment,
    updateWizard,
    addOption,
    updateOption,
    deleteOption,
    setSelectedOptionId,
    setStatus,
    startEditing,
    stopEditing,
  } = useDraftQuoteState({
    initialDraftQuote,
    onValidationChange: (isValid, errors) => {
      console.log('Validation:', { isValid, errors });
    },
  });

  const handleSave = () => {
    if (validation.isValid) {
      onSave(draftQuote);
    }
  };

  const handleFinalize = () => {
    if (canFinalize && selectedOptionId && onFinalize) {
      onFinalize(selectedOptionId);
    }
  };

  const handleAddOption = () => {
    const newOption = addOption();
    setSelectedOptionId(newOption.optionId || null);
  };

  return (
    <div className="draft-quote-editor">
      <div className="editor-header">
        <h2>Draft Quote Editor</h2>
        <div className="editor-actions">
          {!isEditing ? (
            <button onClick={startEditing} className="btn btn-primary">
              Edit
            </button>
          ) : (
            <>
              <button onClick={handleSave} className="btn btn-success" disabled={!validation.isValid}>
                Save
              </button>
              <button onClick={stopEditing} className="btn btn-secondary">
                Cancel Edit
              </button>
            </>
          )}
          <button onClick={onCancel} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>

      {validation.errors.length > 0 && (
        <div className="validation-errors">
          <h4>Validation Errors:</h4>
          <ul>
            {validation.errors.map((error, index) => (
              <li key={index} className="error">{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="editor-content">
        {/* Informations de base */}
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Request Quote ID:</label>
              <input
                type="text"
                value={draftQuote.requestQuoteId || ''}
                readOnly
                className="readonly"
              />
            </div>
            <div className="form-group">
              <label>Status:</label>
              <select
                value={draftQuote.status || 'draft'}
                onChange={(e) => setStatus(e.target.value as any)}
                disabled={!isEditing}
              >
                <option value="draft">Draft</option>
                <option value="in_progress">In Progress</option>
                <option value="finalized">Finalized</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="form-group">
              <label>Currency:</label>
              <select
                value={draftQuote.currency || 'EUR'}
                onChange={(e) => updateCustomer({})} // TODO: Implement currency update
                disabled={!isEditing}
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            <div className="form-group">
              <label>Incoterm:</label>
              <select
                value={draftQuote.incoterm || 'FOB'}
                onChange={(e) => updateCustomer({})} // TODO: Implement incoterm update
                disabled={!isEditing}
              >
                <option value="FOB">FOB</option>
                <option value="CIF">CIF</option>
                <option value="EXW">EXW</option>
                <option value="DDP">DDP</option>
              </select>
            </div>
          </div>
        </div>

        {/* Informations client */}
        <div className="form-section">
          <h3>Customer Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Customer Name:</label>
              <input
                type="text"
                value={draftQuote.customer?.name || ''}
                onChange={(e) => updateCustomer({ name: e.target.value })}
                disabled={!isEditing}
                required
              />
            </div>
            <div className="form-group">
              <label>Customer Type:</label>
              <select
                value={draftQuote.customer?.type || 'company'}
                onChange={(e) => updateCustomer({ type: e.target.value })}
                disabled={!isEditing}
              >
                <option value="company">Company</option>
                <option value="individual">Individual</option>
              </select>
            </div>
            <div className="form-group">
              <label>VAT Number:</label>
              <input
                type="text"
                value={draftQuote.customer?.vat || ''}
                onChange={(e) => updateCustomer({ vat: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>City:</label>
              <input
                type="text"
                value={draftQuote.customer?.address?.city || ''}
                onChange={(e) => updateCustomer({ 
                  address: { 
                    ...draftQuote.customer?.address, 
                    city: e.target.value 
                  } 
                })}
                disabled={!isEditing}
              />
            </div>
            <div className="form-group">
              <label>Country:</label>
              <input
                type="text"
                value={draftQuote.customer?.address?.country || ''}
                onChange={(e) => updateCustomer({ 
                  address: { 
                    ...draftQuote.customer?.address, 
                    country: e.target.value 
                  } 
                })}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>

        {/* Informations d'expédition */}
        <div className="form-section">
          <h3>Shipment Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Origin:</label>
              <input
                type="text"
                value={draftQuote.shipment?.origin?.location || ''}
                onChange={(e) => updateShipment({ 
                  origin: { 
                    ...draftQuote.shipment?.origin, 
                    location: e.target.value 
                  } 
                })}
                disabled={!isEditing}
                required
              />
            </div>
            <div className="form-group">
              <label>Destination:</label>
              <input
                type="text"
                value={draftQuote.shipment?.destination?.location || ''}
                onChange={(e) => updateShipment({ 
                  destination: { 
                    ...draftQuote.shipment?.destination, 
                    location: e.target.value 
                  } 
                })}
                disabled={!isEditing}
                required
              />
            </div>
            <div className="form-group">
              <label>Container Count:</label>
              <input
                type="number"
                value={draftQuote.shipment?.containerCount || 1}
                onChange={(e) => updateShipment({ containerCount: parseInt(e.target.value) || 1 })}
                disabled={!isEditing}
                min="1"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Commodity:</label>
              <input
                type="text"
                value={draftQuote.shipment?.commodity || ''}
                onChange={(e) => updateShipment({ commodity: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="form-group">
              <label>Requested Departure:</label>
              <input
                type="date"
                value={draftQuote.shipment?.requestedDeparture ? 
                  new Date(draftQuote.shipment.requestedDeparture).toISOString().split('T')[0] : ''}
                onChange={(e) => updateShipment({ 
                  requestedDeparture: e.target.value ? new Date(e.target.value) : undefined 
                })}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="form-section">
          <div className="section-header">
            <h3>Quote Options ({totalOptions})</h3>
            <div className="section-actions">
              <button 
                onClick={handleAddOption} 
                className="btn btn-primary"
                disabled={!isEditing}
              >
                Add Option
              </button>
              {canFinalize && onFinalize && (
                <button 
                  onClick={handleFinalize} 
                  className="btn btn-success"
                >
                  Finalize Quote
                </button>
              )}
            </div>
          </div>

          {draftQuote.options?.map((option) => (
            <DraftQuoteOptionEditor
              key={option.optionId}
              option={option}
              onUpdate={(updatedOption) => updateOption(option.optionId || '', updatedOption)}
              onDelete={() => deleteOption(option.optionId || '')}
              isSelected={selectedOptionId === option.optionId}
              onSelect={() => setSelectedOptionId(option.optionId || null)}
            />
          ))}

          {!hasOptions && (
            <div className="no-options">
              <p>No options available. Click "Add Option" to create the first option.</p>
            </div>
          )}
        </div>

        {/* Résumé */}
        <div className="form-section">
          <h3>Summary</h3>
          <div className="summary-stats">
            <div className="stat">
              <span className="stat-label">Total Options:</span>
              <span className="stat-value">{totalOptions}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Total Value:</span>
              <span className="stat-value">{totalValue.toFixed(2)} {draftQuote.currency}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Status:</span>
              <span className={`stat-value status-${draftQuote.status}`}>
                {draftQuote.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftQuoteEditor;
