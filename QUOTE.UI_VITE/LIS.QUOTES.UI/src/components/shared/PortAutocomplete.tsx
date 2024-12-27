import { Autocomplete, TextField } from '@mui/material';
import React from 'react';

interface PortAutocompleteProps {
    id: string;
    value: any;
    onChange: (value: any) => void;
    fullWidth?: boolean;
    options: any;
    disabled?: boolean;
}

const PortAutocomplete: React.FC<PortAutocompleteProps> = ({id, value, onChange, fullWidth, options, disabled}) => {
    return (
        <Autocomplete
            disablePortal
            id={id}
            options={options}
            size="small"
            renderOption={(props, option) => {
                return (
                    <li {...props} key={option.portId}>
                        {option.portName+", "+option.country}
                    </li>
                );
            }}
            getOptionLabel={(option: any) => { 
                if (option !== null && option !== undefined) {
                    return option.portName+', '+option.country;
                }
                return ""; 
            }}
            value={value}
            sx={{ mt: 1 }}
            disabled={disabled}
            renderInput={(params: any) => <TextField {...params} />}
            onChange={(_: any, newValue: any) => { 
                onChange(newValue);
            }}
            fullWidth={fullWidth}
        />
    );
};

export default PortAutocomplete;
