import { ReactNode, useEffect } from "react";
import axios, { InternalAxiosRequestConfig } from "axios";
import { axiosInstanceShipment } from "./api/client/axiosInstanceShipment";
import { axiosInstanceTransport } from "./api/client/axiosInstanceTransport";
import { axiosInstanceCrm } from "./api/client/axiosInstanceCrm";
import { axiosInstanceQuote } from "./api/client/axiosInstanceQuote";
import { axiosInstancePricing } from "./api/client/axiosInstancePricing";

type tokensType = {
    shipment?: string,
    transport?: string,
    quote?: string,
    pricing?: string,
    crm?: string
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

        const requestCrmInterceptorId = axiosInstanceCrm.interceptors.request.use(
          (config: InternalAxiosRequestConfig<any>) => {
            config.headers.Authorization = `Bearer ${tokens.crm}`

            return config
          },
        );

        const requestQuoteInterceptorId = axiosInstanceQuote.interceptors.request.use(
          (config: InternalAxiosRequestConfig<any>) => {
            config.headers.Authorization = `Bearer ${tokens.quote}`

            return config
          },
        );

        const requestPricingInterceptorId = axiosInstancePricing.interceptors.request.use(
          (config: InternalAxiosRequestConfig<any>) => {
            config.headers.Authorization = `Bearer ${tokens.pricing}`

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
            axiosInstanceCrm.interceptors.request.eject(requestCrmInterceptorId);
            axiosInstanceQuote.interceptors.request.eject(requestQuoteInterceptorId);
            axiosInstancePricing.interceptors.request.eject(requestPricingInterceptorId);
            
            axiosInstanceShipment.interceptors.request.eject(responseInterceptorId);
            axiosInstanceTransport.interceptors.request.eject(responseInterceptorId);
            axiosInstanceCrm.interceptors.request.eject(responseInterceptorId);
            axiosInstanceQuote.interceptors.request.eject(responseInterceptorId);
            axiosInstancePricing.interceptors.request.eject(responseInterceptorId);
        };
      }, []);

      return (
        <>{children}</>
      );
}

export { AuthShipmentProvider };