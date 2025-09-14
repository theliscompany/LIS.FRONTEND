import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PublicClientApplication } from '@azure/msal-browser'
import { MsalProvider } from '@azure/msal-react'
import { I18nextProvider } from 'react-i18next'
import { i18n } from './locales/i18n'
import { SnackbarProvider } from 'notistack'
import { StrictMode } from 'react'

import { msalConfig } from './config/msalConfig.ts';

const msalInstance = new PublicClientApplication(msalConfig);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MsalProvider instance={msalInstance}>
      <SnackbarProvider maxSnack={3}>
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      </SnackbarProvider>
    </MsalProvider>
  </StrictMode>,
)
