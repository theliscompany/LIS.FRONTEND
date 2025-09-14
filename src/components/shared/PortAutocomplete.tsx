import React, { useEffect, useState } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';

interface Port {
  id?: string;
  unlocode?: string;
  portName?: string;
  name?: string;
  country?: string;
}

interface PortAutocompleteProps {
  label: string;
  value: Port | null;
  onChange: (port: Port | null) => void;
  disabled?: boolean;
}

const fetchPorts = async (search: string): Promise<Port[]> => {
  // Remplacer l'URL par celle de ton API de ports si besoin
  const url = `https://localhost:7271/Port?search=${encodeURIComponent(search)}`;
  const res = await fetch(url);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
};

const PortAutocomplete: React.FC<PortAutocompleteProps> = ({ label, value, onChange, disabled }) => {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<Port[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    if (inputValue.length < 2) {
      setOptions([]);
      return;
    }
    setLoading(true);
    fetchPorts(inputValue).then((ports) => {
      if (active) {
        setOptions(ports);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [inputValue]);

  return (
    <Autocomplete
      disabled={disabled}
      options={options}
      getOptionLabel={(option) =>
        option.portName || option.name || option.unlocode || ''
      }
      isOptionEqualToValue={(option, val) =>
        (option.unlocode && val.unlocode && option.unlocode === val.unlocode) ||
        (option.id && val.id && option.id === val.id)
      }
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      inputValue={inputValue}
      onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
      loading={loading}
      renderOption={(props, option) => (
        <li {...props} key={option.unlocode || option.id}>
          {option.portName || option.name} {option.country ? `(${option.country.toUpperCase()})` : ''}
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          variant="outlined"
          fullWidth
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
