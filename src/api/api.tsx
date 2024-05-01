import { AuthenticationResult } from "@azure/msal-browser";
import { useAccount, useMsal } from "@azure/msal-react";
import { useEffect } from "react";
import { createContext, useContext, useState } from "react";
import { loginRequest } from "../config/authConfig";
import { BackendService } from "../utils/services/fetch";

export const AuthorizedBackendApiContext = createContext<BackendService<unknown> | null>(null!);

export const useAuthorizedBackendApi = (): BackendService<unknown> | null => {
    return useContext(AuthorizedBackendApiContext);
}

export function AuthorizedBackendApiProvider(props:any):any {
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
    const [accessToken, setAccessToken] = useState<string>();

    useEffect(()=>{
        const getToken = async () => {
            if (account && instance) {
                const token = await instance.acquireTokenSilent({
                    scopes: loginRequest.scopes,
                    account: account
                })
                .then((response: AuthenticationResult)=>{
                    return response.accessToken;
                })
                .catch(()=>{
                    return instance.acquireTokenPopup({
                        ...loginRequest,
                        account: account
                        }).then((response) => {
                            return response.accessToken;
                    });
                });

                console.log(token);
                setAccessToken(token);
            }
        }

        getToken();
    },[account, instance]);
    
    return (
        <>
        {
            accessToken &&
            <AuthorizedBackendApiContext.Provider value={new BackendService(accessToken)}>
                <>{props.children}</>
            </AuthorizedBackendApiContext.Provider>
        }
        </>
        
    );
}
