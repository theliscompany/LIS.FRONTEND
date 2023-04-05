import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete, { AutocompleteRenderInputParams } from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import { debounce } from '@mui/material/utils';

interface LocationAutocompleteProps {
    id: string;
    value: string;
    onChange: (value: string) => void;
    fullWidth?: boolean;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({ id, value, onChange, fullWidth }) => {
    const [options, setOptions] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [inputValue, setInputValue] = useState<string>(value);
    
    const handleInputChange = (event: any) => {
        setInputValue(event.target.value);
        debouncedSearch(event.target.value);
    };

    const search = async (value: string) => {
        setLoading(true);
        try {
            const response = await fetch(`https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${value}`, {
            headers: {
                'x-rapidapi-key': 'VTFclTfEVAmshQmaJNoPsbhlnoAcp1i978ojsnVvUKgKp4QiG6',
                'x-rapidapi-host': 'wft-geo-db.p.rapidapi.com'
            }
        });
        const data = await response.json();
        setOptions(data.data.map((city: any) => city.name));
        setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const debouncedSearch = debounce((value: string) => {
        search(value);
    }, 500);

    return (
        <Autocomplete
            id={id}
            options={options}
            getOptionLabel={(option) => option}
            value={value}
            loading={loading}
            inputValue={inputValue}
            onInputChange={handleInputChange}
            onChange={(event, newValue) => {
                onChange(newValue ?? '');
            }}
            renderInput={(params: AutocompleteRenderInputParams) => (
                <TextField
                    {...params}
                    label="Location"
                    fullWidth={fullWidth}
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

export default LocationAutocomplete;
