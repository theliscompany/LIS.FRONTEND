import { useState } from "react";
import { Autocomplete, CircularProgress, Skeleton, TextField } from "@mui/material";
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

const ClientSearch: React.FC<LocationAutocompleteProps> = ({ id, value, onChange, fullWidth, disabled, callBack }) => {
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState<any[]>([]);

    const debouncedSearch = debounce(async (search: string) => {
        setLoading(true);
        try {
            // if (Number(search)) {

            // }
            // else {

            // }
            const response = await axios.get(
                `https://liscrm-dev.azurewebsites.net/Contact/GetContactsByCategory?contactName=${search}&category=1`,
            );
            setOptions(response.data);
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    }, 1000);

    const { t } = useTranslation();

    return (
        <>
        {
            options !== null ? 
            <Autocomplete
                id={id}
                fullWidth={fullWidth}
                disablePortal
                freeSolo
                autoSelect
                options={options}
                loading={loading}
                noOptionsText={t('typeSomething')}
                getOptionLabel={(option) => { 
                    // console.log(option);
                    if (option !== undefined && option !== null && option !== "") {
                        if (option.contactName !== undefined && option.contactName !== null) {
                            return `${option.contactId}, ${option.contactName}`;
                        }
                        return `${option.contactId}`;
                    }
                    return "";
                }}
                value={value}
                onChange={(event, newValue) => {
                    console.log(newValue);
                    var splitValue = null;
                    if (newValue.contactName === undefined) {
                        splitValue = newValue.split(', ');
                    }
                    
                    if (splitValue !== null && splitValue !== undefined) {
                        if (splitValue.length !== 2) {
                            onChange({ contactId: 0, contactName: newValue});
                        }
                        else {
                            onChange({ contactId: splitValue[0], contactName: splitValue[1]});
                        }
                    }
                    else {
                        onChange(newValue);
                    }
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
            : <Skeleton />
        }
        </>
    );
};

ClientSearch.defaultProps = {
    disabled: false
}

export default ClientSearch;
