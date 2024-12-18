import { useEffect, useState } from "react";
import { getAccessToken } from "../utils/functions";
import { useAccount, useMsal } from "@azure/msal-react";
import { shipmentRequest, transportRequest } from "../config/msalConfig";
import { client as shipmentClient } from "./client/shipment";
import { client as shipmentTransport } from "./client/transport";

const BackendServiceProvider = ({children}:{children:React.ReactNode}) => {

    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});

    const [tokensLoading, setTokensLoading] = useState<boolean>(true)
    
    useEffect(() => {
      const getTokens = async () => {
        const _tokenTransport = await getAccessToken(instance, transportRequest, account);
        const _tokenShipment = await getAccessToken(instance, shipmentRequest, account);
        
        shipmentClient.setConfig({
          baseURL: import.meta.env.VITE_API_LIS_SHIPMENT_ENDPOINT,
          headers: {
            Authorization: `Bearer ${_tokenShipment}`
          }
        })

        shipmentTransport.setConfig({
            baseURL: import.meta.env.VITE_API_LIS_TRANSPORT_ENDPOINT,
            headers: {
              Authorization: `Bearer ${_tokenTransport}`
            }
          })

          setTokensLoading(false)
      }

      if (account && instance){
        getTokens()
      }
    }, [account,instance])
    
    if(!tokensLoading){
        return (
            <>{children}</>
        )
    }
    
}

export default BackendServiceProvider;