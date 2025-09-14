import React, { useState, useMemo } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import debounce from 'lodash.debounce';
import { getContactGetContacts } from '@features/crm/api/sdk.gen';

interface AutoCompleteContactProps {
  value: any;
  onChange: (value: any) => void;
  label?: string;
}

const AutoCompleteContact: React.FC<AutoCompleteContactProps> = ({ value, onChange, label = "Nom du contact" }) => {
  const [options, setOptions] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  // Fonction de recherche avec debounce
  const fetchOptions = useMemo(() =>
    debounce(async (search: string) => {
      setLoading(true);
      try {
        const res = await getContactGetContacts({ query: { contactName: search } });
        setOptions(Array.isArray(res?.data?.data) ? res.data.data : []);
      } catch {
        setOptions([]);
      }
      setLoading(false);
    }, 300)
  , []);

  // Déclenche la recherche à chaque changement d'input
  const handleInputChange = (_: any, newInputValue: string) => {
    setInputValue(newInputValue);
    if (newInputValue.length >= 2) {
      fetchOptions(newInputValue);
    } else {
      setOptions([]);
    }
  };

  return (
    <Autocomplete
      options={options}
      getOptionLabel={option => option.contactName || ''}
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      loading={loading}
      isOptionEqualToValue={(option, value) => option.contactId === value.contactId}
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          placeholder="Tapez pour rechercher..."
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

export default AutoCompleteContact; 