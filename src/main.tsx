
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PublicClientApplication } from '@azure/msal-browser'
import { MsalProvider } from '@azure/msal-react'

import { msalConfig } from './config/msalConfig.ts';
import { SnackbarProvider } from 'notistack'
import { StrictMode } from 'react'

const msalInstance = new PublicClientApplication(msalConfig);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MsalProvider instance={msalInstance}>
      <SnackbarProvider maxSnack={3}>
        <App />
      </SnackbarProvider>
        
    </MsalProvider>
  </StrictMode>,
)
