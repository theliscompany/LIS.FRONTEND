import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import Step7Recap from './Step7Recap';
import type { DraftOptionReal } from '../hooks/useRealDraftOptionsManagerSimple';

interface OptionEditWithRecapProps {
  option: DraftOptionReal | null;
  draftQuote: any;
  open: boolean;
  onClose: () => void;
  onOptionUpdated: (updatedOption: DraftOptionReal) => void;
}

const OptionEditWithRecap: React.FC<OptionEditWithRecapProps> = ({
  option,
  draftQuote,
  open,
  onClose,
  onOptionUpdated
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!option) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen
      PaperProps={{
        sx: {
          height: '100vh',
          m: 0,
          borderRadius: 0
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight="bold">
            ✏️ Modification Complète - {option.name}
          </Typography>
          <IconButton onClick={onClose} size="large">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, overflow: 'auto' }}>
        <Step7Recap
          draftQuote={draftQuote}
          editingOption={option}
          onOptionUpdated={(updatedOption) => {
            onOptionUpdated(updatedOption);
            setIsUpdating(false);
          }}
          onCancelOptionEdit={onClose}
          showOptionsManagement={false}
        />
      </DialogContent>
    </Dialog>
  );
};

export default OptionEditWithRecap;
