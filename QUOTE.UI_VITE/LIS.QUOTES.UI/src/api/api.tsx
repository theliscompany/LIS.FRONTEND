import { useEffect, useState } from "react";
import { getAccessToken } from "../utils/functions";
import { useAccount, useMsal } from "@azure/msal-react";
import { crmRequest, documentRequest, pricingRequest, shipmentRequest, templateRequest, transportRequest } from "../config/msalConfig";
import { client as shipmentClient } from "./client/shipment";
import { client as transportClient } from "./client/transport";
import { client as documentClient } from "./client/document";
import { client as crmClient } from "./client/crm";
import { client as pricingClient } from "./client/pricing";
import { client as templateClient } from "./client/template";

const BackendServiceProvider = ({children}:{children:React.ReactNode}) => {
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});

    const [tokensLoading, setTokensLoading] = useState<boolean>(true);
    
    useEffect(() => {
      const getTokens = async () => {
        const _tokenTransport = await getAccessToken(instance, transportRequest, account);
        const _tokenDocument = await getAccessToken(instance, documentRequest, account);
        const _tokenShipment = await getAccessToken(instance, shipmentRequest, account);
        const _tokenCrm = await getAccessToken(instance, crmRequest, account);
        const _tokenPricing = await getAccessToken(instance, pricingRequest, account);
        const _tokenTemplate = await getAccessToken(instance, templateRequest, account);
        
        shipmentClient.setConfig({
          baseURL: import.meta.env.VITE_API_LIS_SHIPMENT_ENDPOINT,
          headers: {
            Authorization: `Bearer ${_tokenShipment}`
          }
        });

        transportClient.setConfig({
          baseURL: import.meta.env.VITE_API_LIS_TRANSPORT_ENDPOINT,
          headers: {
            Authorization: `Bearer ${_tokenTransport}`
          }
        });

        documentClient.setConfig({
          baseURL: import.meta.env.VITE_API_LIS_DOCUMENT_ENDPOINT,
          headers: {
            Authorization: `Bearer ${_tokenDocument}`
          }
        });

        crmClient.setConfig({
          baseURL: import.meta.env.VITE_API_LIS_CRM_ENDPOINT,
          headers: {
            Authorization: `Bearer ${_tokenCrm}`
          },
          
          withCredentials: true
        });

        pricingClient.setConfig({
          baseURL: import.meta.env.VITE_API_LIS_PRICING_ENDPOINT,
          headers: {
            Authorization: `Bearer ${_tokenPricing}`
          },
        });

        templateClient.setConfig({
          baseURL: import.meta.env.VITE_API_LIS_TEMPLATE_ENDPOINT,
          headers: {
            Authorization: `Bearer ${_tokenTemplate}`
          },
        });

          setTokensLoading(false);
      }

      if (account && instance){
        getTokens();
      }
    }, [account,instance]);
    
    if (!tokensLoading){
        return (
            <>{children}</>
        )
    }
}

export default BackendServiceProvider;