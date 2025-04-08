import { useState } from "react";
import { Autocomplete, CircularProgress, Skeleton, TextField } from "@mui/material";
import { debounce } from "@mui/material/utils";
import { useTranslation } from "react-i18next";
import { getContactGetContacts } from "../../api/client/crm";

interface CompanyAutocompleteProps {
    id: string;
    value: string;
    onChange: (value: any) => void;
    fullWidth?: boolean;
    disabled?: boolean;
    category: 'CUSTOMERS' | 'SUPPLIERS' | 'CHARGEUR' | 'RECEIVER' | 'SHIPPING_LINES' | 'BANK' | 'SHIPPING_AGENCY11' | undefined;
    callBack?: (value: any) => void;
}

const CompanySearch: React.FC<CompanyAutocompleteProps> = ({ id, value, onChange, fullWidth, disabled, category, callBack }) => {
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState<any[]>([]);

    const debouncedSearch = debounce(async (search: string) => {
        setLoading(true);
        try {
            console.log(category);
            const response = await getContactGetContacts(category === undefined ? {query: {contactName: search}} : {query: {contactName: search, category: category}});
            if (response !== null && response !== undefined) {
                console.log(response);
                setOptions(response.data?.data || []);
            }  
            setLoading(false);
        }
        catch (err: any) {
            console.log(err);
            setLoading(false);
        }
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
                options={options}
                loading={loading}
                noOptionsText={t('typeSomething')}
                getOptionLabel={(option) => { 
                    if (option !== undefined && option !== null && option !== "") {
                        return `${option.contactName}`;
                    }
                    return "";
                }}
                value={value}
                size="small"
                onChange={(_, newValue) => {
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
                        slotProps={{
                            input: {...params.InputProps,
                            endAdornment: (
                            <>
                                {loading ? (
                                    <CircularProgress color="inherit" size={15} />
                                ) : null}
                                {params.InputProps.endAdornment}
                            </>
                            ),}
                        }}
                    />
                )}
            />
            : <Skeleton />
        }
        </>
    );
};

export default CompanySearch;
