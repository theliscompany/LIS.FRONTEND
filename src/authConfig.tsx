import { PopupRequest } from "@azure/msal-browser";

export const msalConfig: any = {
  auth: {
    clientId: "d43ec3b1-e8a1-492a-9a94-6c5c4285e8ab",
    authority: "https://login.microsoftonline.com/abb93e13-2d77-476f-a287-59892d6b3c24",
    redirectUri: "/",
    navigateToLoginRequestUrl: false
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: true
  }
};

export const loginRequest: PopupRequest = {
  scopes: [
    "api://a9d2f4e4-a410-4588-8fbf-1be9101209b3/LIS.Quote.ReadWrite",
  ]
};

export const graphRequest: PopupRequest = {
  scopes: [
    "https://graph.microsoft.com/User.ReadBasic.All"
  ]
};

export const pricingRequest: PopupRequest = {
  scopes: [
    "api://e0e63c6a-8095-4823-a523-2c7b007e9cf5/PricingsRead",
  ]
};

export const transportRequest: PopupRequest = {
  scopes: [
    "api://f0b35c43-ffd4-4096-bb75-32306b1e7109/LIS.TRANSPORT.PortsRead",
    "api://f0b35c43-ffd4-4096-bb75-32306b1e7109/LIS.TRANSPORT.CitiesRead",
    "api://f0b35c43-ffd4-4096-bb75-32306b1e7109/LIS.TRANSPORT.ContainersRead"
  ]
};

export const protectedResources = {
  apiLisQuotes: {
    endPoint: "https://lisquotes-svc.azurewebsites.net/api"
  },
  apiLisPricing: {
    endPoint: "https://lis-pricing-dev.azurewebsites.net/api"
  },
  apiLisTransport: {
    endPoint: "https://listransport.azurewebsites.net"
  }
}