import { useState } from "react";
import { Autocomplete, CircularProgress, Skeleton, TextField } from "@mui/material";
import { debounce } from "@mui/material/utils";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { AuthenticationResult } from "@azure/msal-browser";
import { useMsal, useAccount } from "@azure/msal-react";
import { useAuthorizedBackendApi } from "../../api/api";
import { crmRequest, protectedResources } from "../../config/authConfig";
import { BackendService } from "../../utils/services/fetch";

interface CompanyAutocompleteProps {
    id: string;
    value: string;
    onChange: (value: any) => void;
    fullWidth?: boolean;
    disabled?: boolean;
    category: number;
    callBack?: (value: any) => void;
}

const CompanySearch: React.FC<CompanyAutocompleteProps> = ({ id, value, onChange, fullWidth, disabled, category, callBack }) => {
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState<any[]>([]);

    const { instance, accounts } = useMsal();
    const context = useAuthorizedBackendApi();
    const account = useAccount(accounts[0] || {});

    const debouncedSearch = debounce(async (search: string) => {
        if (context && account) {
            setLoading(true);
            const token = await instance.acquireTokenSilent({
                scopes: crmRequest.scopes,
                account: account
            })
            .then((response: AuthenticationResult) => {
                return response.accessToken;
            })
            .catch(() => {
                return instance.acquireTokenPopup({
                    ...crmRequest,
                    account: account
                    }).then((response) => {
                        return response.accessToken;
                    });
                }
            );
            
            var requestString = protectedResources.apiLisClient.endPoint+"/Contact/GetContactsByCategory?contactName="+search+"&category="+category;
            if (category === 0) {
                requestString = protectedResources.apiLisClient.endPoint+"/Contact/GetContactsByName?value="+search;
            }
            
            const response = await (context as BackendService<any>).getWithToken(requestString, token);
            if (response !== null && response !== undefined && response.length !== 0) {
                console.log(response);
                setOptions(response);
            }  
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
                    // console.log(option);
                    if (option !== undefined && option !== null && option !== "") {
                        return `${option.contactName}`;
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
            : <Skeleton />
        }
        </>
    );
};

CompanySearch.defaultProps = {
    disabled: false
}

export default CompanySearch;
