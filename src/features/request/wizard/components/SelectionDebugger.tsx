import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Box, Typography, Card, CardContent, Chip, Stack } from '@mui/material';
import { DraftQuoteForm } from '../schema';

export const SelectionDebugger: React.FC = () => {
  const { watch } = useFormContext<DraftQuoteForm>();
  const currentOption = watch('currentOption');
  const existingOptions = watch('existingOptions') || [];

  return (
    <Card sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5' }}>
      <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
        🐛 Debug - Sélections actuelles
      </Typography>
      
      <Stack spacing={2}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Option en cours (currentOption):
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Chip 
              label={`Seafreights: ${currentOption.seafreights.length}`} 
              color="primary" 
              size="small" 
            />
            <Chip 
              label={`Haulages: ${currentOption.haulages.length}`} 
              color="secondary" 
              size="small" 
            />
            <Chip 
              label={`Services: ${currentOption.services.length}`} 
              color="success" 
              size="small" 
            />
          </Stack>
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Options existantes: {existingOptions.length}/3
          </Typography>
          {existingOptions.map((option, index) => (
            <Chip 
              key={option.id} 
              label={`${option.name} (${option.seafreights.length + option.haulages.length + option.services.length} items)`}
              variant="outlined"
              size="small"
              sx={{ mt: 1, mr: 1 }}
            />
          ))}
        </Box>
      </Stack>
    </Card>
  );
};

export default SelectionDebugger;
