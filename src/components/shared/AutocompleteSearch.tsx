import { useState } from "react";
import { Autocomplete, CircularProgress, InputBase, TextField } from "@mui/material";
import { debounce } from "@mui/material/utils";
import axios from "axios";

interface LocationAutocompleteProps {
    id: string;
    value: string;
    onChange: (value: any) => void;
    fullWidth?: boolean;
    disabled?: boolean;
    callBack?: (value: any) => void;
}

const AutocompleteSearch: React.FC<LocationAutocompleteProps> = ({ id, value, onChange, fullWidth, disabled, callBack }) => {
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState<any[]>([]);

    const debouncedSearch = debounce(async (value: string) => {
        setLoading(true);
        try {
            const response = await axios.get(
                //`https://wft-geo-db.p.rapidapi.com/v1/geo/cities?limit=5&namePrefix=${value}`,
                `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?limit=5&namePrefix=${value}&sort=-population&languageCode=en`,
                {
                    headers: {
                        "x-rapidapi-key": "VTFclTfEVAmshQmaJNoPsbhlnoAcp1i978ojsnVvUKgKp4QiG6",
                        "x-rapidapi-host": "wft-geo-db.p.rapidapi.com",
                    },
                }
            );
            setOptions(response.data.data);
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    }, 500);

    return (
        <Autocomplete
            id={id}
            fullWidth={fullWidth}
            disablePortal
            options={options}
            loading={loading}
            noOptionsText="Type something..."
            getOptionLabel={(option) => { 
                if (option !== undefined && option !== null && option.city !== "" && option.country !== "") {
                    return `${option.city}, ${option.country}`;
                }
                return "";
            }}
            value={value}
            onChange={(event, newValue) => {
                onChange(newValue);
                if (callBack) {
                    callBack(newValue);
                }
            }}
            disabled={disabled}
            renderInput={(params: any) => (
                <TextField
                    {...params}
                    //label="Departure Location"
                    //variant="outlined"
                    onChange={(event) => {
                        debouncedSearch(event.target.value);
                    }}
                    sx={{ mt: 1 }}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                        <>
                            {loading ? (
                                <CircularProgress color="inherit" size={15} />
                            ) : null}
                            {params.InputProps.endAdornment}
                        </>
                        ),
                    }}
                />
            )}
        />
    );
};

AutocompleteSearch.defaultProps = {
    disabled: false
}

export default AutocompleteSearch;
