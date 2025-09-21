// Configuration pour le SDK Request API
import { client as generatedClient } from './sdk.gen';

// Déterminer si on est en local
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Configuration du client avec la bonne URL
const baseURL = isLocal ? 'http://localhost:5153/' : (import.meta.env.VITE_APIM_URL + import.meta.env.VITE_QUOTE_API_URL_SUFFIX);

// Configurer le client généré
generatedClient.setConfig({
  baseURL: baseURL,
});

export { generatedClient as client };




