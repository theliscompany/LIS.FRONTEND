import { useState } from "react";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { debounce } from "@mui/material/utils";
import axios from "axios";
import { useTranslation } from "react-i18next";

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

    const { i18n } = useTranslation();

    const regionNames = new Intl.DisplayNames(['en'], {type: 'region'});
      
    const debouncedSearch = debounce(async (value: string) => {
        setLoading(true);
        try {
            // const response = await axios.get(
            //     `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?limit=5&namePrefix=${value}&sort=-population&languageCode=${i18n.language}`,
            //     {
            //         headers: {
            //             "x-rapidapi-key": "VTFclTfEVAmshQmaJNoPsbhlnoAcp1i978ojsnVvUKgKp4QiG6",
            //             "x-rapidapi-host": "wft-geo-db.p.rapidapi.com",
            //         },
            //     }
            // );
            // setOptions(response.data.data);
            const response = await axios.get(
                `http://api.geonames.org/postalCodeSearchJSON?formatted=true&postalcode=${value}&maxRows=500&username=blackstarmc97`
            );
            if (response.data.postalCodes.length === 0) {
                const response = await axios.get(
                    `http://api.geonames.org/search?q=${value}&formatted=true&type=json&username=blackstarmc97`
                );
                setOptions(response.data.geonames.map((elm: any) => { return { id: elm.geonameId, city: elm.name, country: regionNames.of(elm.countryCode), postalCode: null, latitude: elm.lat, longitude: elm.lng }  }))
            }
            else {
                setOptions(response.data.postalCodes.map((elm: any) => { return { city: elm.placeName, country: regionNames.of(elm.countryCode), postalCode: elm.postalCode, latitude: elm.lat, longitude: elm.lng }  }))
            }
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    }, 1000);

    const { t } = useTranslation();

    return (
        <Autocomplete
            id={id}
            fullWidth={fullWidth}
            disablePortal
            options={options}
            loading={loading}
            noOptionsText={t('typeSomething')}
            getOptionLabel={(option) => { 
                if (option !== undefined && option !== null && option.city !== "" && option.country !== "") {
                    if (option.postalCode !== null && option.postalCode !== undefined) {
                        return `${option.city}, ${option.postalCode}, ${option.country}`;
                    }
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
