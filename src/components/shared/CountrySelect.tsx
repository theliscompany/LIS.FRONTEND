import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { COUNTRIES } from '@utils/constants';

interface CountryAutocompleteProps {
    id: string;
    value: CountryType;
    onChange: (value: CountryType) => void;
    fullWidth?: boolean;
}

const CountrySelect: React.FC<CountryAutocompleteProps> = ({id, value, onChange, fullWidth}) => {
    return (
        <Autocomplete
            id={id}
            options={COUNTRIES}
            autoHighlight
            getOptionLabel={(option: any) => option.label}
            fullWidth={fullWidth}
            value={value}
            onChange={(_: any, newValue: any) => {
                onChange(newValue);
            }}
            renderOption={(props: any, option: any) => {
                const { key, ...otherProps } = props; // Extract the key prop
                return (
                    <Box
                        key={"keyflag-"+option.code}
                        component="li"
                        sx={{ '& > img': { mr: 2, flexShrink: 0 } }}
                        {...otherProps} // Spread the remaining props without the key
                    >
                        <img
                            loading="lazy"
                            width="20"
                            srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                            src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                            alt=""
                        />
                        {option !== null ? `${option.label} (${option.code})` : null}
                    </Box>
                );
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    // label="Choose a country"
                    sx={{ mt: 1 }}
                    size='small'
                    slotProps={{ htmlInput: {
                      ...params.inputProps,
                      autoComplete: 'new-password', // disable autocomplete and autofill
                    }}}
                />
            )}
        />
    );
}

export interface CountryType {
    code: string;
    label: string;
    phone: string;
    suggested?: boolean;
}



export default CountrySelect;