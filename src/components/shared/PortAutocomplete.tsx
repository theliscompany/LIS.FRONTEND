import React, { useState } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getApiPortOptions } from '@features/masterdata/api/@tanstack/react-query.gen';
import { PortViewModel } from '@features/masterdata/api/types.gen';

interface PortAutocompleteProps {
  label: string;
  value: PortViewModel | null;
  onChange: (port: PortViewModel | null) => void;
  disabled?: boolean;
}

const PortAutocomplete: React.FC<PortAutocompleteProps> = ({ label, value, onChange, disabled }) => {
  const [inputValue, setInputValue] = useState('');
  
  // Utiliser l'API React Query pour charger les ports
  const { data: portsData, isLoading: loading, error } = useQuery({
    ...getApiPortOptions({
      baseURL: 'https://localhost:7271'
    }),
    enabled: true, // Charger immédiatement tous les ports
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Debug: Log des données reçues
  React.useEffect(() => {
    console.log('🔧 [PortAutocomplete] Données ports:', {
      portsData,
      loading,
      error,
      inputValue
    });
  }, [portsData, loading, error, inputValue]);

  // Filtrer les ports basé sur la recherche
  const filteredOptions = React.useMemo(() => {
    if (!portsData || !Array.isArray(portsData)) {
      console.log('🔧 [PortAutocomplete] Pas de données ports ou pas un array:', portsData);
      return [];
    }
    
    // Si pas de recherche, retourner les premiers 20 ports
    if (!inputValue || inputValue.length < 2) {
      const limited = portsData.slice(0, 20);
      console.log('🔧 [PortAutocomplete] Ports limités (pas de recherche):', limited);
      return limited;
    }
    
    const searchLower = inputValue.toLowerCase();
    const filtered = portsData.filter((port: PortViewModel) => 
      port.portName?.toLowerCase().includes(searchLower) ||
      port.country?.toLowerCase().includes(searchLower)
    );
    
    console.log('🔧 [PortAutocomplete] Ports filtrés:', filtered);
    return filtered;
  }, [portsData, inputValue]);

  return (
    <Autocomplete
      disabled={disabled}
      options={filteredOptions}
      getOptionLabel={(option) =>
        option.portName || ''
      }
      isOptionEqualToValue={(option, val) =>
        option.portId === val.portId
      }
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      inputValue={inputValue}
      onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
      loading={loading}
      renderOption={(props, option) => (
        <li {...props} key={option.portId}>
          {option.portName} {option.country ? `(${option.country.toUpperCase()})` : ''}
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          variant="outlined"
          fullWidth
          error={!!error}
          helperText={error ? `Erreur de chargement: ${error.message}` : ''}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default PortAutocomplete;
