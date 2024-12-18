import {Configuration, PopupRequest} from "@azure/msal-browser"

export const msalConfig: Configuration = {
    auth: {
      clientId: import.meta.env.VITE_CLIENT_ID,
      authority: import.meta.env.VITE_AUTHORITY,
      redirectUri: import.meta.env.VITE_REDIRECT_URI,
    },
    cache: {
      cacheLocation: "localStorage",
      storeAuthStateInCookie: false,
    },
  };
  
  export default msalConfig;

  export const loginRequest: PopupRequest = {
    scopes: []
  };

  export const shipmentRequest: PopupRequest = {
    scopes: [
      import.meta.env.VITE_SHIPMENT_REQUEST_SCOPE !== undefined ? import.meta.env.VITE_SHIPMENT_REQUEST_SCOPE : ""
    ]
  };

  export const transportRequest: PopupRequest = {
    scopes: [
      import.meta.env.VITE_TRANSPORT_REQUEST_SCOPE !== undefined ? import.meta.env.VITE_TRANSPORT_REQUEST_SCOPE : ""
    ]
  }