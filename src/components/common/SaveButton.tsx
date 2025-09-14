import React from 'react';
import { Button, Tooltip } from '@mui/material';
import { Save } from '@mui/icons-material';

interface SaveButtonProps {
  onSave: () => void;
  disabled?: boolean;
  variant?: 'contained' | 'outlined';
}

const SaveButton: React.FC<SaveButtonProps> = ({ 
  onSave, 
  disabled = false, 
  variant = 'outlined' 
}) => {
  const handleClick = () => {
    console.log('🔥 [SAVE_BUTTON] ======================================');
    console.log('🔥 [SAVE_BUTTON] BOUTON SAUVEGARDER CLIQUÉ !');
    console.log('🔥 [SAVE_BUTTON] État du bouton:', { disabled, variant });
    console.log('🔥 [SAVE_BUTTON] Appel de onSave() maintenant...');
    console.log('🔥 [SAVE_BUTTON] ======================================');
    onSave();
  };

  return (
    <Tooltip title="Sauvegarder le devis">
      <Button
        variant={variant}
        startIcon={<Save />}
        onClick={handleClick}
        disabled={disabled}
        sx={{ 
          position: 'fixed', 
          bottom: 20, 
          right: 20, 
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          borderRadius: 2,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
          },
          transition: 'all 0.3s ease'
        }}
      >
        Sauvegarder
      </Button>
    </Tooltip>
  );
};

export default SaveButton; 