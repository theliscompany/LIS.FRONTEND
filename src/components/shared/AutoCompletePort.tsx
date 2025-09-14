import { useState, useEffect, useMemo } from 'react';
import { Autocomplete, TextField, CircularProgress, Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getApiPortOptions } from '@features/masterdata/api/@tanstack/react-query.gen';
import { PortViewModel } from '@features/masterdata/api/types.gen';
import debounce from 'lodash.debounce';

interface AutoCompletePortProps {
  value: { portId: number; portName: string; country: string } | null;
  onChange: (value: { portId: number; portName: string; country: string } | null) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
}

const AutoCompletePort: React.FC<AutoCompletePortProps> = ({
  value,
  onChange,
  placeholder = "Rechercher un port...",
  disabled = false,
  error = false,
  helperText
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);

  // Récupération des ports avec React Query
  const { data: ports = [], isLoading } = useQuery({
    ...getApiPortOptions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: open // Ne charge que quand l'autocomplete est ouvert
  });

  // Filtrage des ports basé sur la recherche
  const filteredPorts = useMemo(() => {
    if (!searchTerm) return ports.slice(0, 20); // Limite à 20 résultats par défaut
    
    const search = searchTerm.toLowerCase();
    return ports
      .filter((port) => 
        port.portName?.toLowerCase().includes(search) ||
        port.country?.toLowerCase().includes(search)
      )
      .slice(0, 20);
  }, [ports, searchTerm]);

  // Debounce pour la recherche
  const debouncedSetSearchTerm = useMemo(
    () => debounce((value: string) => setSearchTerm(value), 300),
    []
  );

  // Nettoyage du debounce
  useEffect(() => {
    return () => {
      debouncedSetSearchTerm.cancel();
    };
  }, [debouncedSetSearchTerm]);

  const handleInputChange = (_: any, newInputValue: string) => {
    debouncedSetSearchTerm(newInputValue);
  };

  const handleChange = (_: any, newValue: PortViewModel | null) => {
    if (newValue) {
      onChange({
        portId: newValue.portId || 0,
        portName: newValue.portName || '',
        country: newValue.country || ''
      });
    } else {
      onChange(null);
    }
  };

  return (
    <Box>
      <Autocomplete
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        options={filteredPorts}
        loading={isLoading}
        getOptionLabel={(option) => {
          if (typeof option === 'string') return option;
          return option.portName && option.country 
            ? `${option.portName}, ${option.country}`
            : option.portName || '';
        }}
        isOptionEqualToValue={(option, value) => 
          option.portId === value.portId
        }
        value={value}
        onChange={handleChange}
        onInputChange={handleInputChange}
        filterOptions={(x) => x} // Désactive le filtrage côté client
        disabled={disabled}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            variant="outlined"
            error={error}
            helperText={helperText}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: 56,
                '& fieldset': {
                  borderColor: error ? '#d32f2f' : '#e0e0e0',
                },
                '&:hover fieldset': {
                  borderColor: error ? '#d32f2f' : '#bdbdbd',
                },
                '&.Mui-focused fieldset': {
                  borderColor: error ? '#d32f2f' : '#1976d2',
                },
              },
            }}
          />
        )}
        renderOption={(props, option) => (
          <li {...props} key={option.portId}>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {option.portName}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {option.country}
              </Typography>
            </Box>
          </li>
        )}
        noOptionsText="Aucun port trouvé"
        loadingText="Chargement des ports..."
      />
    </Box>
  );
};

export default AutoCompletePort; 