import { useEffect, useState } from "react";
import { getAccessToken } from "../utils/functions";
import { useAccount, useMsal } from "@azure/msal-react";
import { crmRequest, documentRequest, offerRequest, pricingRequest, quoteRequest, sessionstorageRequest, shipmentRequest, templateRequest, transportRequest } from "../config/msalConfig";
import { client as shipmentClient } from "./client/shipment";
import { client as masterdataClient } from "./client/transport";
import { client as documentClient } from "./client/document";
import { client as crmClient } from "./client/crm";
import { client as pricingClient } from "./client/pricing";
import { client as templateClient } from "./client/template";
import { client as offerClient } from "./client/offer";
import { client as quoteClient } from "./client/quote";
import { client as sessionstorageClient } from "./client/sessionstorage";

const BackendServiceProvider = ({children}:{children:React.ReactNode}) => {
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
    
    const [tokensLoading, setTokensLoading] = useState<boolean>(true);
    
    // useEffect(() => {
    //   const getTokens = async () => {
    //     const _tokenTransport = await getAccessToken(instance, transportRequest, account);
    //     const _tokenDocument = await getAccessToken(instance, documentRequest, account);
    //     const _tokenShipment = await getAccessToken(instance, shipmentRequest, account);
    //     const _tokenCrm = await getAccessToken(instance, crmRequest, account);
    //     const _tokenPricing = await getAccessToken(instance, pricingRequest, account);
    //     const _tokenTemplate = await getAccessToken(instance, templateRequest, account);
    //     const _tokenOffer = await getAccessToken(instance, offerRequest, account);
    //     const _tokenQuote = await getAccessToken(instance, quoteRequest, account);
    //     const _tokenSessionstorage = await getAccessToken(instance, sessionstorageRequest, account);
        
    //     shipmentClient.setConfig({
    //       baseURL: import.meta.env.VITE_API_LIS_SHIPMENT_ENDPOINT,
    //       headers: {
    //         Authorization: `Bearer ${_tokenShipment}`
    //       }
    //     });

    //     transportClient.setConfig({
    //       baseURL: import.meta.env.VITE_API_LIS_TRANSPORT_ENDPOINT,
    //       headers: {
    //         Authorization: `Bearer ${_tokenTransport}`
    //       }
    //     });

    //     documentClient.setConfig({
    //       baseURL: import.meta.env.VITE_API_LIS_DOCUMENT_ENDPOINT,
    //       headers: {
    //         Authorization: `Bearer ${_tokenDocument}`
    //       }
    //     });

    //     crmClient.setConfig({
    //       baseURL: import.meta.env.VITE_API_LIS_CRM_ENDPOINT,
    //       headers: {
    //         Authorization: `Bearer ${_tokenCrm}`
    //       },
          
    //       withCredentials: true
    //     });

    //     pricingClient.setConfig({
    //       baseURL: import.meta.env.VITE_API_LIS_PRICING_ENDPOINT,
    //       headers: {
    //         Authorization: `Bearer ${_tokenPricing}`
    //       },
    //     });

    //     templateClient.setConfig({
    //       baseURL: import.meta.env.VITE_API_LIS_TEMPLATE_ENDPOINT,
    //       headers: {
    //         Authorization: `Bearer ${_tokenTemplate}`
    //       },
    //     });

    //     offerClient.setConfig({
    //       baseURL: import.meta.env.VITE_API_LIS_OFFER_ENDPOINT,
    //       headers: {
    //         Authorization: `Bearer ${_tokenOffer}`
    //       },
    //     });

    //     quoteClient.setConfig({
    //       baseURL: import.meta.env.VITE_API_LIS_QUOTE_ENDPOINT,
    //       headers: {
    //         Authorization: `Bearer ${_tokenQuote}`
    //       },
    //     });

    //     sessionstorageClient.setConfig({
    //       baseURL: import.meta.env.VITE_API_LIS_SESSIONSTORAGE_ENDPOINT,
    //       headers: {
    //         Authorization: `Bearer ${_tokenSessionstorage}`
    //       },
    //     });

    //     setTokensLoading(false);
    //   }

    //   if (account && instance){
    //     getTokens();
    //   }
    // }, [account,instance]);
    
    useEffect(() => {
      const configureClients = async () => {
        if (account && instance) {
          // alert("Superss");
          // Obtenez les tokens uniquement si l'utilisateur est connecté
          const _tokenTransport = await getAccessToken(instance, transportRequest, account);
          const _tokenDocument = await getAccessToken(instance, documentRequest, account);
          const _tokenShipment = await getAccessToken(instance, shipmentRequest, account);
          const _tokenCrm = await getAccessToken(instance, crmRequest, account);
          const _tokenPricing = await getAccessToken(instance, pricingRequest, account);
          const _tokenTemplate = await getAccessToken(instance, templateRequest, account);
          const _tokenOffer = await getAccessToken(instance, offerRequest, account);
          const _tokenQuote = await getAccessToken(instance, quoteRequest, account);
          const _tokenSessionstorage = await getAccessToken(instance, sessionstorageRequest, account);
    
          // Configurez les clients avec les tokens
          shipmentClient.setConfig({
            baseURL: import.meta.env.VITE_API_LIS_SHIPMENT_ENDPOINT,
            headers: {
              Authorization: `Bearer ${_tokenShipment}`,
            },
          });
    
          masterdataClient.setConfig({
            baseURL: import.meta.env.VITE_APIM_URL+ import.meta.env.VITE_MASTERDATA_API_URL_SUFFIX,
            headers: {
              Authorization: `Bearer ${_tokenTransport}`,
            },
          });

          documentClient.setConfig({
            baseURL: import.meta.env.VITE_APIM_URL + import.meta.env.VITE_DOCUMENT_API_URL_SUFFIX,
            headers: {
              Authorization: `Bearer ${_tokenDocument}`
            }
          });

          crmClient.setConfig({
            baseURL: import.meta.env.VITE_APIM_URL + import.meta.env.VITE_CRM_API_URL_SUFFIX,
            headers: {
              Authorization: `Bearer ${_tokenCrm}`
            },
            
            withCredentials: true
          });

          pricingClient.setConfig({
            baseURL: import.meta.env.VITE_APIM_URL,
            headers: {
              Authorization: `Bearer ${_tokenPricing}`
            },
          });

          templateClient.setConfig({
            baseURL: import.meta.env.VITE_APIM_URL + import.meta.env.VITE_TEMPLATE_API_URL_SUFFIX,
            headers: {
              Authorization: `Bearer ${_tokenTemplate}`
            },
          });

          offerClient.setConfig({
            baseURL: import.meta.env.VITE_APIM_URL + import.meta.env.VITE_OFFER_API_URL_SUFFIX,
            headers: {
              Authorization: `Bearer ${_tokenOffer}`
            },
          });

          quoteClient.setConfig({
            baseURL: import.meta.env.VITE_APIM_URL + import.meta.env.VITE_QUOTE_API_URL_SUFFIX,
            headers: {
              Authorization: `Bearer ${_tokenQuote}`
            },
          });

          sessionstorageClient.setConfig({
            baseURL: import.meta.env.VITE_APIM_URL + import.meta.env.VITE_SESSION_API_URL_SUFFIX,
            headers: {
              Authorization: `Bearer ${_tokenSessionstorage}`
            },
          });
        } 
        else {
          // Si l'utilisateur n'est pas connecté, configurez les clients sans en-têtes d'authentification
          // alert("Cheese");
          shipmentClient.setConfig({
            baseURL: import.meta.env.VITE_API_LIS_SHIPMENT_ENDPOINT,
          });
    
          masterdataClient.setConfig({
            baseURL: import.meta.env.VITE_APIM_URL+ import.meta.env.VITE_MASTERDATA_API_URL_SUFFIX,
          });
    
          documentClient.setConfig({
            baseURL: import.meta.env.VITE_APIM_URL+ import.meta.env.VITE_DOCUMENT_API_URL_SUFFIX,
          });
    
          crmClient.setConfig({
            baseURL: import.meta.env.VITE_API_LIS_CRM_ENDPOINT,
            withCredentials: true,
          });
    
          pricingClient.setConfig({
            baseURL: import.meta.env.VITE_APIM_URL,
          });
    
          templateClient.setConfig({
            baseURL: import.meta.env.VITE_APIM_URL + import.meta.env.VITE_TEMPLATE_API_URL_SUFFIX
          });
    
          offerClient.setConfig({
            baseURL: import.meta.env.VITE_APIM_URL + import.meta.env.VITE_OFFER_API_URL_SUFFIX,
          });
    
          quoteClient.setConfig({
            baseURL: import.meta.env.VITE_APIM_URL + import.meta.env.VITE_QUOTE_API_URL_SUFFIX,
          });
    
          sessionstorageClient.setConfig({
            baseURL: import.meta.env.VITE_APIM_URL + import.meta.env.VITE_SESSION_API_URL_SUFFIX,
          });
        }
    
        setTokensLoading(false);
      };
    
      configureClients();
    }, [account, instance]);
    
    if (!tokensLoading){
        return (
            <>{children}</>
        )
    }
}

export default BackendServiceProvider;