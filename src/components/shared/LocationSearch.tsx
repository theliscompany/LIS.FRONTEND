import { useState } from "react";
import { Autocomplete, Box, CircularProgress, Skeleton, TextField } from "@mui/material";
import { debounce } from "@mui/material/utils";
import axios from "axios";

interface LocationAutocompleteProps {
    id: string;
    value: string;
    placeholder?: string;
    onChange: (value: any) => void;
    fullWidth?: boolean;
    disabled?: boolean;
    callBack?: (value: any) => void;
}

// List of African country ISO 3166-1 alpha-2 codes
// const africanCountryCodes = [
//     'DZ', 'AO', 'BJ', 'BW', 'BF', 'BI', 'CV', 'CM', 'CF', 'TD', 'KM', 'CG', 'CD', 'DJ', 'EG', 
//     'GQ', 'ER', 'SZ', 'ET', 'GA', 'GM', 'GH', 'GN', 'GW', 'CI', 'KE', 'LS', 'LR', 'LY', 'MG', 
//     'MW', 'ML', 'MR', 'MU', 'YT', 'MA', 'MZ', 'NA', 'NE', 'NG', 'RE', 'RW', 'SH', 'ST', 'SN', 
//     'SC', 'SL', 'SO', 'ZA', 'SS', 'SD', 'TZ', 'TG', 'TN', 'UG', 'EH', 'ZM', 'ZW'
// ];
  
// // Function to check if a country code is from Africa
// function isCountryCodeFromAfrica(countryCode: string) {
//     return africanCountryCodes.includes(countryCode.toUpperCase());
// }

const LocationSearch: React.FC<LocationAutocompleteProps> = ({ id, value, placeholder="", onChange, fullWidth, disabled, callBack }) => {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<any[]>([]);
    // const regionNames = new Intl.DisplayNames(['en'], {type: 'region'});
    
    const debouncedSearch = debounce(async (value: string) => {
        try {
            setLoading(true);
            setOptions([]);
            // const regex = /^(.+) \/ ([a-zA-Z]{2,3})$/;
            // const regex = /^(.*?),\s*(.*)$/;
            // const match = value.match(regex);

            // var townText = value;
            // var countryCode = "";
            
            if (1) {
                if (1) {
                    const response2 = await axios.get(
                        `https://secure.geonames.org/search?name_startsWith=${value}&formatted=true&type=json&maxRows=500&username=blackstarmc97`
                    );
                    
                    var auxResponse = response2.data.geonames.map((elm: any) => { return { id: elm.geonameId, region: elm.adminName1||"", city: elm.name, country: elm.countryName, postalCode: null, latitude: elm.lat, longitude: elm.lng } });
                    let result = auxResponse.filter((e: any, i: number) => {
                        return auxResponse.findIndex((x: any) => {
                        return x.city == e.city && x.country == e.country && x.region == e.region;}) == i;
                    });
                    console.log("Choice 3 : ", result);
                    setOpen(true);
                    setOptions(result);
                }
            }            
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    }, 1000);

    return (
        <Box sx={{ position: "relative "}}>
        {
            !loading ?
            <Autocomplete
                key={value || "key+"+id}
                id={id}
                fullWidth={fullWidth}
                // freeSolo
                disablePortal
                options={options}
                loading={loading}
                open={open}
                onOpen={() => { setOpen(true); }}
                onClose={() => { setOpen(false); }}
                // noOptionsText={t('typeSomething')}
                getOptionLabel={(option) => { 
                    if (option !== undefined && option !== null && option.city !== "" && option.country !== "") {
                        if (option.postalCode !== null && option.postalCode !== undefined) {
                            return `${option.city.toUpperCase()}, ${option.postalCode}, ${option.country}`;
                        }
                        if (option.region !== null && option.region !== undefined) {
                            return `${option.city.toUpperCase()}, ${option.country} - ${option.region}`;
                        }
                        return `${option.city.toUpperCase()}, ${option.country}`;
                    }
                    return "";
                }}
                value={value}
                onChange={(_: any, newValue: any) => {
                    onChange(newValue);
                    if (callBack) {
                        callBack(newValue);
                    }
                }}
                openOnFocus
                disabled={disabled}
                size="small"
                renderInput={(params: any) => (
                    <TextField
                        {...params}
                        onChange={(event) => {
                            debouncedSearch(event.target.value);
                        }}
                        sx={{ mt: 1 }}
                        placeholder={placeholder}
                        slotProps={{
                            input: {
                                ...params.InputProps,
                                endAdornment: (
                                <>
                                    {loading ? (
                                        <CircularProgress color="inherit" size={15} />
                                    ) : null}
                                    {params.InputProps.endAdornment}
                                </>
                                ),    
                            }
                        }}
                    />
                )}
            /> : 
            <Skeleton variant="rectangular" height={44} sx={{ mt: 1 }} />
        }
        </Box>
    );
};

export default LocationSearch;