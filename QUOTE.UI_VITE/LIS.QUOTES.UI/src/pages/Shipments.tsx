import { useEffect } from "react";
import { getOrders } from "../api/client/shipment";

const Shipments = () => {
    useEffect(() => {
        
      const getData = async () => {
         await getOrders({query:{
            Fiscal:2024
        }})
      }

      getData()
    }, [])
    
    
    return (
        <><h1>TEST</h1></>
    )
}

export default Shipments;