import { PopupRequest } from "@azure/msal-browser";

export const msalConfig: any = {
  auth: {
    clientId: process.env.REACT_APP_CLIENT_ID,
    authority: process.env.REACT_APP_AUTHORITY,
    redirectUri: process.env.REACT_APP_REDIRECT_URI,
    navigateToLoginRequestUrl: false
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: true
  }
};

export const loginRequest: PopupRequest = {
  scopes: [
    process.env.REACT_APP_LOGIN_REQUEST_SCOPE !== undefined ? process.env.REACT_APP_LOGIN_REQUEST_SCOPE : ""
  ]
};

export const graphRequest: PopupRequest = {
  scopes: [
    process.env.REACT_APP_GRAPH_REQUEST_SCOPE !== undefined ? process.env.REACT_APP_GRAPH_REQUEST_SCOPE : ""
  ]
};

export const pricingRequest: PopupRequest = {
  scopes: [
    process.env.REACT_APP_PRICING_REQUEST_SCOPE1 !== undefined ? process.env.REACT_APP_PRICING_REQUEST_SCOPE1 : "",
    process.env.REACT_APP_PRICING_REQUEST_SCOPE2 !== undefined ? process.env.REACT_APP_PRICING_REQUEST_SCOPE2 : ""
  ]
};

export const transportRequest: PopupRequest = {
  scopes: [
    process.env.REACT_APP_TRANSPORT_REQUEST_SCOPE1 !== undefined ? process.env.REACT_APP_TRANSPORT_REQUEST_SCOPE1 : "",
    process.env.REACT_APP_TRANSPORT_REQUEST_SCOPE2 !== undefined ? process.env.REACT_APP_TRANSPORT_REQUEST_SCOPE2 : "",
    process.env.REACT_APP_TRANSPORT_REQUEST_SCOPE3 !== undefined ? process.env.REACT_APP_TRANSPORT_REQUEST_SCOPE3 : "",
    process.env.REACT_APP_TRANSPORT_REQUEST_SCOPE4 !== undefined ? process.env.REACT_APP_TRANSPORT_REQUEST_SCOPE4 : "",
    // process.env.REACT_APP_TRANSPORT_REQUEST_SCOPE5 !== undefined ? process.env.REACT_APP_TRANSPORT_REQUEST_SCOPE5 : ""
  ]
};

export const crmRequest: PopupRequest = {
  scopes:[
    process.env.REACT_APP_CRM_REQUEST_SCOPE !== undefined ? process.env.REACT_APP_CRM_REQUEST_SCOPE : ""
  ]
}

export const protectedResources = {
  apiLisQuotes: {
    endPoint: process.env.REACT_APP_API_LIS_QUOTES_ENDPOINT
  },
  apiLisPricing: {
    endPoint: process.env.REACT_APP_API_LIS_PRICING_ENDPOINT
  },
  apiLisTransport: {
    endPoint: process.env.REACT_APP_API_LIS_TRANSPORT_ENDPOINT
  },
  apiLisOffer: {
    endPoint: process.env.REACT_APP_API_LIS_OFFER_ENDPOINT
  },
  apiLisCrm: {
    endPoint: process.env.REACT_APP_API_LIS_CLIENT_ENDPOINT
  },
  apiLisTemplate: {
    endPoint: process.env.REACT_APP_API_LIS_TEMPLATE_ENDPOINT
  }, 
  apiLisFiles: {
    endPoint: "https://lis-document-svc.azurewebsites.net/api"
  }
}