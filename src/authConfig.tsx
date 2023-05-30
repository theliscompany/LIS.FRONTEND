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
    "api://e0e63c6a-8095-4823-a523-2c7b007e9cf5/PricingsRead",
    // "api://a9d2f4e4-a410-4588-8fbf-1be9101209b3/LIS.Quote.ReadWrite",
    // "api://e0e63c6a-8095-4823-a523-2c7b007e9cf5/.default",
    // "https://graph.microsoft.com/User.ReadBasic.All"
  ]
};

export const graphRequest: PopupRequest = {
  scopes: [
    "https://graph.microsoft.com/User.ReadBasic.All"
  ]
};

export const protectedResources = {
  apiLisQuotes: {
    endPoint: "https://lisquotes-svc.azurewebsites.net/api"
  },
  apiLisPricing: {
    endPoint: "https://lis-pricing-dev.azurewebsites.net/api"
  }
}