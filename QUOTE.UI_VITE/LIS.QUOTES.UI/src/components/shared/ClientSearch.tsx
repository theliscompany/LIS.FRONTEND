import { useState } from "react";
import { Autocomplete, CircularProgress, Skeleton, TextField } from "@mui/material";
import { debounce } from "@mui/material/utils";
import { useTranslation } from "react-i18next";
import { getContactGetContacts } from "../../api/client/crm";

interface LocationAutocompleteProps {
    id: string;
    name: string;
    value: string;
    onChange: (value: any) => void;
    fullWidth?: boolean;
    disabled?: boolean;
    callBack?: (value: any) => void;
}


function checkFormatCode(code: string) {
    var regex = /^BE-\d{5}$/;
    if (regex.test(code)) {
        return true; // La chaîne de caractères respecte le format
    } 
    else {
        return false; // La chaîne de caractères ne respecte pas le format
    }
}

const ClientSearch: React.FC<LocationAutocompleteProps> = ({ id, name, value, onChange, fullWidth, disabled, callBack }) => {
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState<any[]>([]);

    const debouncedSearch = debounce(async (search: string) => {
        setLoading(true);
        if (checkFormatCode(search)) {
            // First i search by contact number
            const response = await getContactGetContacts({query: { contactNumber: search, category: "CUSTOMERS" }});
            if (response !== null && response !== undefined) {
                console.log(response);
                // Removing duplicates from result before rendering
                setOptions(response.data?.data?.filter((obj: any, index: number, self: any) => index === self.findIndex((o: any) => o.contactName === obj.contactName)) || []);
            }
        } 
        else {
            // If i dont find i search by contact name
            const response = await getContactGetContacts({query: { contactName: search, category: "CUSTOMERS" }});
            if (response !== null && response !== undefined) {
                console.log(response);
                // Removing duplicates from result before rendering
                setOptions(response.data?.data?.filter((obj: any, index: number, self: any) => index === self.findIndex((o: any) => o.contactName === obj.contactName)) || []);
            }   
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
                // componentName={name}
                fullWidth={fullWidth}
                disablePortal
                // freeSolo
                autoSelect
                options={options}
                loading={loading}
                noOptionsText={t('typeSomething')}
                getOptionLabel={(option) => { 
                    if (option !== undefined && option !== null && option !== "") {
                        if (option.contactName !== undefined && option.contactName !== null) {
                            return `${option.contactNumber === "" ? "0" : option.contactNumber}, ${option.contactName}`;
                        }
                        return `${option.contactNumber === "" ? "0" : option.contactNumber}`;
                    }
                    return "";
                }}
                value={value}
                size="small"
                onChange={(_, newValue) => {
                    onChange(newValue);
                    console.log(newValue);
                    if (newValue !== null) {
                        if (callBack) {
                            callBack(newValue);
                        }
                    }                    
                }}
                disabled={disabled}
                renderInput={(params: any) => (
                    <TextField
                        {...params}
                        onChange={(event) => {
                            debouncedSearch(event.target.value);
                        }}
                        name={name}
                        sx={{ mt: 1 }}
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
            />
            : <Skeleton />
        }
        </>
    );
};

export default ClientSearch;
