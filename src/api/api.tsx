import { useEffect, useState } from "react";
import { getAccessToken } from "@utils/functions";
import { useAccount, useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { crmRequest, documentRequest, offerRequest, pricingRequest, quoteRequest, sessionstorageRequest, shipmentRequest, templateRequest, transportRequest } from "../config/msalConfig";
import { client as shipmentClient } from "@features/shipment/api";
import { client as masterdataClient } from "@features/masterdata/api";
import { client as documentClient } from "@features/document/api";
import { client as crmClient } from "@features/crm/api";
import { client as pricingnewClient } from "@features/pricingnew/api";
import { client as templateClient } from "@features/template/api";
import { client as offerClient } from "@features/offer/api";
import { client as quoteClient } from "@features/request/api";
import { client as sessionstorageClient } from "@features/sessionstorage/api";

// Fonction utilitaire typée pour obtenir la bonne baseURL selon l'environnement et le service
function getBaseUrl(serviceKey: string): string {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  // Convention :
  // - Pour le local : VITE_API_LIS_<SERVICE>_ENDPOINT
  // - Pour APIM : VITE_APIM_URL + VITE_<SERVICE>_API_URL_SUFFIX
  const upperKey = serviceKey.toUpperCase();
  if (isLocal) {
    const localUrl = import.meta.env[`VITE_API_LIS_${upperKey}_ENDPOINT` as keyof ImportMetaEnv];
    if (!localUrl) throw new Error(`VITE_API_LIS_${upperKey}_ENDPOINT is not defined in .env`);
    return localUrl;
  }
  const apimUrl = import.meta.env.VITE_APIM_URL;
  const suffix = import.meta.env[`VITE_${upperKey}_API_URL_SUFFIX` as keyof ImportMetaEnv];
  if (!apimUrl || !suffix) throw new Error(`VITE_APIM_URL or VITE_${upperKey}_API_URL_SUFFIX is not defined in .env`);
  return apimUrl + suffix;
}

const BackendServiceProvider = ({children}:{children:React.ReactNode}) => {
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
    
    const [tokensLoading, setTokensLoading] = useState<boolean>(true);
    
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
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
          const _tokenTransport = await getAccessToken(instance, transportRequest, account, InteractionStatus.None);
          const _tokenDocument = await getAccessToken(instance, documentRequest, account, InteractionStatus.None);
          const _tokenShipment = await getAccessToken(instance, shipmentRequest, account, InteractionStatus.None);
          const _tokenCrm = await getAccessToken(instance, crmRequest, account, InteractionStatus.None);
          const _tokenPricing = await getAccessToken(instance, pricingRequest, account, InteractionStatus.None);
          const _tokenTemplate = await getAccessToken(instance, templateRequest, account, InteractionStatus.None);
          const _tokenOffer = await getAccessToken(instance, offerRequest, account, InteractionStatus.None);
          const _tokenQuote = await getAccessToken(instance, quoteRequest, account, InteractionStatus.None);
          const _tokenSessionstorage = await getAccessToken(instance, sessionstorageRequest, account, InteractionStatus.None);
    
          // Configurez les clients avec les tokens
          shipmentClient.setConfig({
            baseURL: getBaseUrl('shipment'),
            headers: { Authorization: `Bearer ${_tokenShipment}` },
          });
    
          masterdataClient.setConfig({
            baseURL: getBaseUrl('masterdata'),
            headers: { Authorization: `Bearer ${_tokenTransport}` },
          });

          documentClient.setConfig({
            baseURL: getBaseUrl('document'),
            headers: { Authorization: `Bearer ${_tokenDocument}` },
          });

          crmClient.setConfig({
            baseURL: getBaseUrl('crm'),
            headers: { Authorization: `Bearer ${_tokenCrm}` },
            withCredentials: true
          });

        
          pricingnewClient.setConfig({
            baseURL: getBaseUrl('pricingnew'),
            //headers: { Authorization: `Bearer ${_tokenPricing}` },
          });

          try {
            templateClient.setConfig({
              baseURL: getBaseUrl('template'),
              headers: { Authorization: `Bearer ${_tokenTemplate}` },
            });
          } catch (error) {
            console.warn('Template API configuration failed, using fallback:', error);
            templateClient.setConfig({
              baseURL: 'http://localhost:5025/',
              headers: { Authorization: `Bearer ${_tokenTemplate}` },
            });
          }

          offerClient.setConfig({
            baseURL: getBaseUrl('offer'),
            headers: { Authorization: `Bearer ${_tokenOffer}` },
          });

          quoteClient.setConfig({
            baseURL: getBaseUrl('quote'),
            headers: { Authorization: `Bearer ${_tokenQuote}` },
          });

          sessionstorageClient.setConfig({
            baseURL: getBaseUrl('sessionstorage'),
            headers: { Authorization: `Bearer ${_tokenSessionstorage}` },
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
    
          
          pricingnewClient.setConfig({
            baseURL: import.meta.env.VITE_API_LIS_PRICINGNEW_ENDPOINT,
          });

          try {
            templateClient.setConfig({
              baseURL: import.meta.env.VITE_APIM_URL + import.meta.env.VITE_TEMPLATE_API_URL_SUFFIX
            });
          } catch (error) {
            console.warn('Template API configuration failed, using fallback:', error);
            templateClient.setConfig({
              baseURL: 'http://localhost:5025/'
            });
          }
    
          offerClient.setConfig({
            baseURL: import.meta.env.VITE_APIM_URL + import.meta.env.VITE_OFFER_API_URL_SUFFIX,
          });
    
          // Si on est en local, utiliser le baseURL local pour quoteClient
          quoteClient.setConfig({
            baseURL: isLocal ? 'https://localhost:7089/' : (import.meta.env.VITE_APIM_URL + import.meta.env.VITE_QUOTE_API_URL_SUFFIX),
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