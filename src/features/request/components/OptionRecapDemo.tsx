import React from 'react';
import { Box } from '@mui/material';
import OptionRecapView from './OptionRecapView';
import type { DraftOptionReal } from '../hooks/useRealDraftOptionsManager';

// Données de démonstration pour tester l'affichage
const mockOption: DraftOptionReal = {
  optionId: 'demo-1',
  name: 'Option Standard',
  description: 'Option avec transport maritime standard et services de base',
  
  originalSelections: {
    haulageSelectionId: 'haulage-1',
    seafreightSelectionIds: ['sea-1'],
    miscSelectionIds: ['misc-1', 'misc-2']
  },
  
  marginType: 'percentage',
  marginValue: 15,
  
  totals: {
    haulageTotalAmount: 400.00,
    seafreightTotalAmount: 2500.00,
    miscTotalAmount: 1150.00,
    subTotal: 4050.00,
    marginAmount: 607.50,
    finalTotal: 4657.50,
    currency: 'EUR'
  },
  
  wizardSnapshot: {
    step4Data: {},
    step5Data: {},
    step6Data: {},
    capturedAt: new Date().toISOString(),
    note: 'Demo snapshot'
  },
  
  createdAt: new Date().toISOString(),
  updatedAt: null
};

const OptionRecapDemo: React.FC = () => {
  const [editingId, setEditingId] = React.useState<string | null>(null);

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <OptionRecapView
        option={mockOption}
        isEditing={editingId === mockOption.optionId}
        onEditToggle={(opt) => {
          setEditingId(editingId === opt.optionId ? null : opt.optionId);
        }}
        onSave={(updatedOption) => {
          console.log('Option sauvegardée:', updatedOption);
          setEditingId(null);
        }}
        onDelete={(opt) => {
          console.log('Supprimer option:', opt.optionId);
        }}
      />
    </Box>
  );
};

export default OptionRecapDemo;
