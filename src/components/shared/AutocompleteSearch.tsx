import { useState } from "react";
import { Autocomplete, Box, CircularProgress, IconButton, Popover, Skeleton, TextField, Typography } from "@mui/material";
import { debounce } from "@mui/material/utils";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { HelpOutline } from "@mui/icons-material";

interface LocationAutocompleteProps {
    id: string;
    value: string;
    onChange: (value: any) => void;
    fullWidth?: boolean;
    disabled?: boolean;
    callBack?: (value: any) => void;
}

const AutocompleteSearch: React.FC<LocationAutocompleteProps> = ({ id, value, onChange, fullWidth, disabled, callBack }) => {
    const [loading, setLoading] = useState(value === null ? false : true);
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<any[]>([]);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    
    const regionNames = new Intl.DisplayNames(['en'], {type: 'region'});
    const { t } = useTranslation();

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const openPop = Boolean(anchorEl);
    const idPop = openPop ? 'simple-popover' : undefined;
  
    const debouncedSearch = debounce(async (value: string) => {
        try {
            setLoading(true);
            setOptions([]);
            const regex = /^(.+) \/ ([a-zA-Z]{2,3})$/;
            const match = value.match(regex);

            var townText = value;
            var countryCode = "";
            
            if (match) {
                townText = match[1].trim();
                countryCode = match[2];
                
                const response = await axios.get(
                    `https://secure.geonames.org/postalCodeSearchJSON?formatted=true&placename_startsWith=${townText}&countryBias=${countryCode}&maxRows=500&username=blackstarmc97`
                );
                if (!(response.data.postalCodes.length === 0)) {
                    var auxResponse = response.data.postalCodes.map((elm: any, i: number) => { return { id: 'psCode-'+i, city: elm.placeName, country: regionNames.of(elm.countryCode), postalCode: elm.postalCode, latitude: elm.lat, longitude: elm.lng }});
                    console.log("Choice 1 : ", auxResponse);
                    setOptions(auxResponse);
                }
                else {
                    const response2 = await axios.get(
                        `https://secure.geonames.org/search?name_startsWith=${townText+", "+countryCode}&formatted=true&maxRows=500&type=json&username=blackstarmc97`
                    );
                    
                    var auxResponse = response2.data.geonames.map((elm: any) => { return { id: elm.geonameId, region: elm.adminName1||"", city: elm.name, country: elm.countryName, postalCode: null, latitude: elm.lat, longitude: elm.lng } });
                    let result = auxResponse.filter((e: any, i: number) => {
                        return auxResponse.findIndex((x: any) => {
                        return x.city == e.city && x.country == e.country && x.region == e.region;}) == i;
                    });
                    
                    console.log("Choice 2 : ", result);
                    setOptions(result);
                }
            }
            else {
                const response = await axios.get(
                    `https://secure.geonames.org/postalCodeSearchJSON?formatted=true&placename_startsWith=${value}&maxRows=500&username=blackstarmc97`
                );
                
                if (response.data.postalCodes.length === 0) {
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
                else {
                    console.log(response.data.postalCodes);
                    var auxResponse = response.data.postalCodes.map((elm: any, i: number) => { return { id: 'psCode-'+i, city: elm.placeName, country: regionNames.of(elm.countryCode), postalCode: elm.postalCode, latitude: elm.lat, longitude: elm.lng, region: elm.adminName1||"" } });
                    console.log("Choice 4 : ", auxResponse);
                    setOptions(auxResponse)
                }
            }            
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    }, 1000);

    return (
        <Box sx={{ position: "relative "}}>
        <IconButton onClick={handleClick} size="small" sx={!loading ? { position: "absolute", top: "-24px", right: "-4px" } : { position: "absolute", top: "-32px", right: "-4px" }}>
            <HelpOutline fontSize="small" />
        </IconButton>
        <Popover
            id={idPop}
            open={openPop}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
        >
            <Typography sx={{ p: 2, fontSize: 12 }}>
                - Type the name of the city you want. Eg : "Dakar"<br />
                - If no result, add the country code. Eg : "Dakar / sen"<br />
                - If you cant find a town, try this. Eg : "Dakar, sen"<br />
            </Typography>
        </Popover>
        {
            !loading ?
            <Autocomplete
                key={value || 'empty'}
                id={id}
                fullWidth={fullWidth}
                freeSolo
                disablePortal
                options={options}
                loading={loading}
                open={open}
                onOpen={() => {
                    setOpen(true);
                }}
                onClose={() => {
                    setOpen(false);
                }}
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
                onChange={(event: any, newValue: any) => {
                    onChange(newValue);
                    if (callBack) {
                        callBack(newValue);
                    }
                }}
                openOnFocus
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
            /> : 
            <Skeleton variant="rectangular" height={44} sx={{ mt: 1 }} />
        }
        </Box>
    );
};

AutocompleteSearch.defaultProps = {
    disabled: false
}

export default AutocompleteSearch;