import { ReactNode, useEffect } from "react";
import { axiosInstanceShipment } from "./api/client/axiosInstanceShipment";
import axios, { InternalAxiosRequestConfig } from "axios";
import { axiosInstanceTransport } from "./api/client/axiosInstanceTransport";

type tokensType = {
    shipment?: string,
    transport?: string
  }

type AuthProviderProps = { children: ReactNode; tokens: tokensType };

const createApiError = <T extends {}>(error?: T): T => {
    return {
      code: 'INTERNALSERVERERROR',
      message: '',
      ...error,
    } as any as T;
  };

  

const AuthShipmentProvider = ({ children, tokens }: AuthProviderProps) => {

    useEffect(() => {
        const requestShipmentInterceptorId = axiosInstanceShipment.interceptors.request.use(
          (config: InternalAxiosRequestConfig<any>) => {
            config.headers.Authorization = `Bearer ${tokens.shipment}`

            return config
          },
        );

        const requestTransportInterceptorId = axiosInstanceTransport.interceptors.request.use(
            (config: InternalAxiosRequestConfig<any>) => {
              config.headers.Authorization = `Bearer ${tokens.transport}`
  
              return config
            },
          );

        const responseInterceptorId = axios.interceptors.response.use(
            undefined,
            () => {
              return Promise.reject(createApiError());
            },
          );
    
        return () => {
            axiosInstanceShipment.interceptors.request.eject(requestShipmentInterceptorId);
            axiosInstanceTransport.interceptors.request.eject(requestTransportInterceptorId);
            
            axiosInstanceShipment.interceptors.request.eject(responseInterceptorId);
            axiosInstanceTransport.interceptors.request.eject(responseInterceptorId);
        };
      }, []);

      return (
        <>{children}</>
      );
}

export { AuthShipmentProvider };