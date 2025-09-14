import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getApiServiceOptions } from '@features/masterdata/api/@tanstack/react-query.gen';
import { ServiceViewModel } from '@features/masterdata/api';
import { ServiceTypeEnum } from '@utils/misc/enumsCommon';

interface AutoCompleteServiceProps {
  value: ServiceViewModel | null;
  onChange: (service: ServiceViewModel | null) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  onServiceTypeChange?: (serviceType: string | null) => void;
}

const AutoCompleteService: React.FC<AutoCompleteServiceProps> = ({
  value,
  onChange,
  label = "Nom du service",
  placeholder = "Rechercher un service...",
  disabled = false,
  required = false,
  error = false,
  helperText,
  onServiceTypeChange
}) => {
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Query pour récupérer les services
  const { data: services = [], isLoading } = useQuery({
    ...getApiServiceOptions(),
    enabled: true // Toujours activé pour avoir les 10 premiers services par défaut
  });

  // Filtrer les services basé sur la recherche
  const filteredServices = services.filter((service: ServiceViewModel) => {
    if (!searchTerm) return true;
    return service.serviceName?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Limiter à 10 résultats pour les performances
  const displayServices = filteredServices.slice(0, 10);

  // Gérer le changement de service sélectionné
  const handleServiceChange = (newValue: ServiceViewModel | null) => {
    onChange(newValue);
    
    // Déterminer le type de service et le passer au callback
    if (newValue && newValue.servicesTypeId && newValue.servicesTypeId.length > 0) {
      const serviceTypeId = newValue.servicesTypeId[0]; // Prendre le premier type
      const serviceTypeName = ServiceTypeEnum[serviceTypeId as keyof typeof ServiceTypeEnum];
      onServiceTypeChange?.(serviceTypeName || null);
    } else {
      onServiceTypeChange?.(null);
    }
  };

  // Gérer le changement de valeur de saisie
  const handleInputChange = (event: React.SyntheticEvent, newInputValue: string) => {
    setInputValue(newInputValue);
    setSearchTerm(newInputValue);
  };

  return (
    <Autocomplete
      value={value}
      onChange={(event, newValue) => handleServiceChange(newValue)}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      options={displayServices}
      getOptionLabel={(option) => option.serviceName || ''}
      isOptionEqualToValue={(option, value) => option.serviceId === value.serviceId}
      loading={isLoading}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          required={required}
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
        />
      )}
      renderOption={(props, option) => (
        <li {...props}>
          <div>
            <div style={{ fontWeight: 'bold' }}>{option.serviceName}</div>
            {option.serviceDescription && (
              <div style={{ fontSize: '0.875rem', color: 'rgba(0, 0, 0, 0.6)' }}>
                {option.serviceDescription}
              </div>
            )}
          </div>
        </li>
      )}
      noOptionsText="Aucun service trouvé"
      loadingText="Chargement des services..."
    />
  );
};

export default AutoCompleteService; 