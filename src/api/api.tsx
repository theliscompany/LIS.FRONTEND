import { useAccount, useMsal } from "@azure/msal-react";
import { useEffect } from "react";
import { createContext, useContext, useState } from "react";
import { crmRequest, loginRequest, pricingRequest, transportRequest } from "../config/authConfig";
import { BackendService } from "../utils/services/fetch";
import { getAccessToken } from "../utils/functions";

export const AuthorizedBackendApiContext = createContext<any | null>(null!);

export const useAuthorizedBackendApi = (): any | null => {
    return useContext(AuthorizedBackendApiContext);
}

export function AuthorizedBackendApiProvider(props:any):any {
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
    const [loginToken, setLoginToken] = useState<string>();
    const [transportToken, setTransportToken] = useState<string>();
    const [crmToken, setCrmToken] = useState<string>();
    const [pricingToken, setPricingToken] = useState<string>();

    useEffect(() => {
        if (account && instance) {
            const getTokens = async () => {
                const token1 = await getAccessToken(instance, loginRequest, account);
                const token2 = await getAccessToken(instance, transportRequest, account);
                const token3 = await getAccessToken(instance, crmRequest, account);
                const token4 = await getAccessToken(instance, pricingRequest, account);

                setLoginToken(token1);
                setTransportToken(token2);
                setCrmToken(token3);
                setPricingToken(token4);
            }
    
            getTokens();        
        }
    },[account, instance, account]);
    
    return (
        <>
        {
            loginToken && transportToken && crmToken && pricingToken && 
            <AuthorizedBackendApiContext.Provider value={{
                service: new BackendService(),
                tokenLogin: loginToken, 
                tokenCrm: crmToken,
                tokenPricing: pricingToken,
                tokenTransport: transportToken
            }}>
                <>{props.children}</>
            </AuthorizedBackendApiContext.Provider>
        }
        </>
        
    );
}
