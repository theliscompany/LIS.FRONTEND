import { PopupRequest } from "@azure/msal-browser";

export const msalConfig: any = {
  auth: {
    clientId: "014e295e-2acf-4ac5-a773-890952f66d1f",
    authority: "https://login.microsoftonline.com/8c303844-5ee3-4276-8154-15bc7d1bf1b1",
    redirectUri: "/admin/",
    //postLogoutRedirectUri: "/landing",
    navigateToLoginRequestUrl: false
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: true
  }
};

export const loginRequest: PopupRequest = {
  scopes: [
    "api://014e295e-2acf-4ac5-a773-890952f66d1f/ReadQuotes",
    //"https://graph.microsoft.com/User.ReadBasic.All"
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
  }
}