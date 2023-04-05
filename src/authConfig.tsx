import { PopupRequest } from "@azure/msal-browser";

export const msalConfig: any = {
    auth: {
      // clientId: "232e854d-4f27-4ce7-824b-02c8743aa8d6",
      // authority: "https://login.microsoftonline.com/dd4939d2-4530-4d1e-8432-8f6219e45712",
      // redirectUri: "http://localhost:3000/",
      // postLogoutRedirectUri: "http://localhost:3000/"
      clientId: "014e295e-2acf-4ac5-a773-890952f66d1f",
      authority: "https://login.microsoftonline.com/8c303844-5ee3-4276-8154-15bc7d1bf1b1",
      redirectUri: "http://localhost:3000/admin/",
      postLogoutRedirectUri: "http://localhost:3000/",
      navigateToLoginRequestUrl: false
    },
    cache: {
      cacheLocation: "localStorage",
      storeAuthStateInCookie: true
    }
};

export const loginRequest: PopupRequest = {
  scopes: [
    "api://014e295e-2acf-4ac5-a773-890952f66d1f/ReadQuotesRequests/ReadQuotes"
  ]
};