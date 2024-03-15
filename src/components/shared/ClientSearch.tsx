import { useState } from "react";
import { Autocomplete, CircularProgress, Skeleton, TextField } from "@mui/material";
import { debounce } from "@mui/material/utils";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { BackendService } from "../../utils/services/fetch";
import { useAuthorizedBackendApi } from "../../api/api";
import { useAccount, useMsal } from "@azure/msal-react";
import { crmRequest, protectedResources } from "../../config/authConfig";
import { AuthenticationResult } from "@azure/msal-browser";

interface LocationAutocompleteProps {
    id: string;
    value: string;
    onChange: (value: any) => void;
    fullWidth?: boolean;
    disabled?: boolean;
    callBack?: (value: any) => void;
}


function checkFormatCode(code: string) {
    // Définir une expression régulière pour le format attendu
    var regex = /^BE-\d{5}$/;
  
    // Utiliser la méthode test() pour vérifier si la chaîne de caractères correspond à l'expression régulière
    if (regex.test(code)) {
        return true; // La chaîne de caractères respecte le format
    } 
    else {
        return false; // La chaîne de caractères ne respecte pas le format
    }
}

const ClientSearch: React.FC<LocationAutocompleteProps> = ({ id, value, onChange, fullWidth, disabled, callBack }) => {
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
            
            if (checkFormatCode(search)) {
                // First i search by contact number
                const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisCrm.endPoint+"/Contact/GetContactsByContactNumber?contactNumber="+search+"&category=1", token);
                // const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisCrm.endPoint+"/Contact/GetContacts", token);
                if (response !== null && response !== undefined && response.length !== 0) {
                    console.log(response);
                    // Removing duplicates from result before rendering
                    setOptions(response.filter((obj: any, index: number, self: any) => index === self.findIndex((o: any) => o.contactName === obj.contactName)));
                }
            } 
            else {
                // If i dont find i search by contact name
                const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisCrm.endPoint+"/Contact/GetContactsByCategory?contactName="+search+"&category=1", token);
                if (response !== null && response !== undefined) {
                    console.log(response);
                    // Removing duplicates from result before rendering
                    setOptions(response.filter((obj: any, index: number, self: any) => index === self.findIndex((o: any) => o.contactName === obj.contactName)));
                }   
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
                // freeSolo
                autoSelect
                options={options}
                loading={loading}
                noOptionsText={t('typeSomething')}
                getOptionLabel={(option) => { 
                    // console.log(option);
                    if (option !== undefined && option !== null && option !== "") {
                        if (option.contactName !== undefined && option.contactName !== null) {
                            return `${option.contactNumber === "" ? "0" : option.contactNumber}, ${option.contactName}`;
                        }
                        return `${option.contactNumber === "" ? "0" : option.contactNumber}`;
                    }
                    return "";
                }}
                value={value}
                onChange={(event, newValue) => {
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
