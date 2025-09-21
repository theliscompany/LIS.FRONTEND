import React, { useState, useEffect } from 'react';
import type { DraftQuoteOption, DraftQuoteOptionContainer, DraftQuoteOptionHaulage, DraftQuoteOptionService } from '../types/DraftQuote';
import { calculateOptionTotals } from '../services/draftQuoteService';

interface DraftQuoteOptionEditorProps {
  option: DraftQuoteOption;
  onUpdate: (option: DraftQuoteOption) => void;
  onDelete: () => void;
  isSelected: boolean;
  onSelect: () => void;
}

export const DraftQuoteOptionEditor: React.FC<DraftQuoteOptionEditorProps> = ({
  option,
  onUpdate,
  onDelete,
  isSelected,
  onSelect,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localOption, setLocalOption] = useState<DraftQuoteOption>(option);

  // Synchroniser avec les props
  useEffect(() => {
    setLocalOption(option);
  }, [option]);

  // Mise à jour locale
  const updateLocalOption = (updates: Partial<DraftQuoteOption>) => {
    const updated = { ...localOption, ...updates };
    setLocalOption(updated);
    onUpdate(updated);
  };

  // Gestion des conteneurs
  const addContainer = () => {
    const newContainer: DraftQuoteOptionContainer = {
      containerType: '20GP',
      quantity: 1,
    };
    
    updateLocalOption({
      containers: [...(localOption.containers || []), newContainer],
    });
  };

  const updateContainer = (index: number, updates: Partial<DraftQuoteOptionContainer>) => {
    const updatedContainers = localOption.containers?.map((container, i) => 
      i === index ? { ...container, ...updates } : container
    ) || [];
    
    updateLocalOption({ containers: updatedContainers });
  };

  const deleteContainer = (index: number) => {
    const updatedContainers = localOption.containers?.filter((_, i) => i !== index) || [];
    updateLocalOption({ containers: updatedContainers });
  };

  // Gestion du transport routier
  const addHaulage = () => {
    const newHaulage: DraftQuoteOptionHaulage = {
      id: `haulage_${Date.now()}`,
      phase: 'pre',
      mode: 'road',
      from: '',
      to: '',
      pricingScope: 'per_container',
      containerFilter: [],
      basePrice: 0,
      surcharges: [],
    };
    
    updateLocalOption({
      haulages: [...(localOption.haulages || []), newHaulage],
    });
  };

  const updateHaulage = (index: number, updates: Partial<DraftQuoteOptionHaulage>) => {
    const updatedHaulages = localOption.haulages?.map((haulage, i) => 
      i === index ? { ...haulage, ...updates } : haulage
    ) || [];
    
    updateLocalOption({ haulages: updatedHaulages });
  };

  const deleteHaulage = (index: number) => {
    const updatedHaulages = localOption.haulages?.filter((_, i) => i !== index) || [];
    updateLocalOption({ haulages: updatedHaulages });
  };

  // Gestion des services
  const addService = () => {
    const newService: DraftQuoteOptionService = {
      code: `SVC_${Date.now()}`,
      label: 'New Service',
      calc: 'flat',
      unit: 'per_shipment',
      value: 0,
      currency: 'EUR',
      taxable: false,
    };
    
    updateLocalOption({
      services: [...(localOption.services || []), newService],
    });
  };

  const updateService = (index: number, updates: Partial<DraftQuoteOptionService>) => {
    const updatedServices = localOption.services?.map((service, i) => 
      i === index ? { ...service, ...updates } : service
    ) || [];
    
    updateLocalOption({ services: updatedServices });
  };

  const deleteService = (index: number) => {
    const updatedServices = localOption.services?.filter((_, i) => i !== index) || [];
    updateLocalOption({ services: updatedServices });
  };

  // Recalculer les totaux
  const recalculateTotals = () => {
    const calculated = calculateOptionTotals(localOption);
    updateLocalOption(calculated);
  };

  return (
    <div className={`option-editor ${isSelected ? 'selected' : ''}`}>
      <div className="option-header">
        <div className="option-selector">
          <input
            type="radio"
            checked={isSelected}
            onChange={onSelect}
          />
          <input
            type="text"
            value={localOption.label || ''}
            onChange={(e) => updateLocalOption({ label: e.target.value })}
            placeholder="Option label"
            className="option-label-input"
          />
        </div>
        
        <div className="option-totals">
          <span className="total-amount">
            {localOption.totals?.grandTotal?.toFixed(2)} {localOption.currency}
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn btn-sm btn-secondary"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="option-details">
          {/* Informations de base */}
          <div className="form-section">
            <h4>Basic Information</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Valid Until:</label>
                <input
                  type="date"
                  value={localOption.validUntil ? new Date(localOption.validUntil).toISOString().split('T')[0] : ''}
                  onChange={(e) => updateLocalOption({ validUntil: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Currency:</label>
                <select
                  value={localOption.currency || 'EUR'}
                  onChange={(e) => updateLocalOption({ currency: e.target.value })}
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>
          </div>

          {/* Conteneurs */}
          <div className="form-section">
            <div className="section-header">
              <h4>Containers</h4>
              <button onClick={addContainer} className="btn btn-sm btn-primary">
                Add Container
              </button>
            </div>
            
            {localOption.containers?.map((container, index) => (
              <div key={index} className="container-item">
                <div className="form-row">
                  <div className="form-group">
                    <label>Type:</label>
                    <select
                      value={container.containerType || ''}
                      onChange={(e) => updateContainer(index, { containerType: e.target.value })}
                    >
                      <option value="20GP">20GP</option>
                      <option value="40GP">40GP</option>
                      <option value="40HC">40HC</option>
                      <option value="45HC">45HC</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Quantity:</label>
                    <input
                      type="number"
                      value={container.quantity || 0}
                      onChange={(e) => updateContainer(index, { quantity: parseInt(e.target.value) || 0 })}
                      min="1"
                    />
                  </div>
                  <button
                    onClick={() => deleteContainer(index)}
                    className="btn btn-sm btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Transport routier */}
          <div className="form-section">
            <div className="section-header">
              <h4>Haulage</h4>
              <button onClick={addHaulage} className="btn btn-sm btn-primary">
                Add Haulage
              </button>
            </div>
            
            {localOption.haulages?.map((haulage, index) => (
              <div key={index} className="haulage-item">
                <div className="form-row">
                  <div className="form-group">
                    <label>Phase:</label>
                    <select
                      value={haulage.phase || ''}
                      onChange={(e) => updateHaulage(index, { phase: e.target.value })}
                    >
                      <option value="pre">Pre</option>
                      <option value="post">Post</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>From:</label>
                    <input
                      type="text"
                      value={haulage.from || ''}
                      onChange={(e) => updateHaulage(index, { from: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>To:</label>
                    <input
                      type="text"
                      value={haulage.to || ''}
                      onChange={(e) => updateHaulage(index, { to: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Base Price:</label>
                    <input
                      type="number"
                      value={haulage.basePrice || 0}
                      onChange={(e) => updateHaulage(index, { basePrice: parseFloat(e.target.value) || 0 })}
                      step="0.01"
                    />
                  </div>
                  <button
                    onClick={() => deleteHaulage(index)}
                    className="btn btn-sm btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Services */}
          <div className="form-section">
            <div className="section-header">
              <h4>Services</h4>
              <button onClick={addService} className="btn btn-sm btn-primary">
                Add Service
              </button>
            </div>
            
            {localOption.services?.map((service, index) => (
              <div key={index} className="service-item">
                <div className="form-row">
                  <div className="form-group">
                    <label>Code:</label>
                    <input
                      type="text"
                      value={service.code || ''}
                      onChange={(e) => updateService(index, { code: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Label:</label>
                    <input
                      type="text"
                      value={service.label || ''}
                      onChange={(e) => updateService(index, { label: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Value:</label>
                    <input
                      type="number"
                      value={service.value || 0}
                      onChange={(e) => updateService(index, { value: parseFloat(e.target.value) || 0 })}
                      step="0.01"
                    />
                  </div>
                  <div className="form-group">
                    <label>Currency:</label>
                    <select
                      value={service.currency || 'EUR'}
                      onChange={(e) => updateService(index, { currency: e.target.value })}
                    >
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                  <button
                    onClick={() => deleteService(index)}
                    className="btn btn-sm btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Totaux */}
          <div className="form-section">
            <div className="section-header">
              <h4>Totals</h4>
              <button onClick={recalculateTotals} className="btn btn-sm btn-secondary">
                Recalculate
              </button>
            </div>
            
            <div className="totals-display">
              <div className="total-row">
                <span>Seafreight Base:</span>
                <span>{localOption.totals?.seafreightBaseTotal?.toFixed(2)} {localOption.currency}</span>
              </div>
              <div className="total-row">
                <span>Haulage Total:</span>
                <span>{localOption.totals?.haulageTotal?.toFixed(2)} {localOption.currency}</span>
              </div>
              <div className="total-row">
                <span>Services Total:</span>
                <span>{localOption.totals?.servicesTotal?.toFixed(2)} {localOption.currency}</span>
              </div>
              <div className="total-row">
                <span>Surcharges Total:</span>
                <span>{localOption.totals?.surchargesTotal?.toFixed(2)} {localOption.currency}</span>
              </div>
              <div className="total-row total-grand">
                <span>Grand Total:</span>
                <span>{localOption.totals?.grandTotal?.toFixed(2)} {localOption.currency}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="option-actions">
            <button onClick={onDelete} className="btn btn-danger">
              Delete Option
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftQuoteOptionEditor;
