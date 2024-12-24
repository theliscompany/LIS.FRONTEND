import {Configuration, PopupRequest} from "@azure/msal-browser";

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

  export const documentRequest: PopupRequest = {
    scopes: [
      import.meta.env.VITE_DOCUMENT_REQUEST_SCOPE !== undefined ? import.meta.env.VITE_DOCUMENT_REQUEST_SCOPE : ""
    ]
  }

  export const crmRequest: PopupRequest = {
    scopes: [
      import.meta.env.VITE_CRM_REQUEST_SCOPE !== undefined ? import.meta.env.VITE_CRM_REQUEST_SCOPE : ""
    ]
  }

  export const pricingRequest: PopupRequest = {
    scopes: [
      import.meta.env.VITE_PRICING_REQUEST_SCOPE !== undefined ? import.meta.env.VITE_PRICING_REQUEST_SCOPE : ""
    ]
  }

  export const templateRequest: PopupRequest = {
    scopes: [
      import.meta.env.VITE_TEMPLATE_REQUEST_SCOPE !== undefined ? import.meta.env.VITE_TEMPLATE_REQUEST_SCOPE : ""
    ]
  }

  export const offerRequest: PopupRequest = {
    scopes: [
      import.meta.env.VITE_OFFER_REQUEST_SCOPE !== undefined ? import.meta.env.VITE_OFFER_REQUEST_SCOPE : ""
    ]
  }