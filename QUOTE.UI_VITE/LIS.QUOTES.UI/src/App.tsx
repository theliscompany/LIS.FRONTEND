import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react'
import Landing from './pages/Landing'
import './locales/i18n';
import Shipments from './pages/Shipments';
import Layout from './layout/Layout';
import BackendServiceProvider from './api/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient();

function App() {

  return (
    <BrowserRouter>
        <AuthenticatedTemplate>
          <QueryClientProvider client={queryClient}>
            <BackendServiceProvider>
              <Routes>
                <Route path='/*' element={<Layout />}>
                  <Route path='' element={<Shipments />} />
                </Route>
              </Routes>
            </BackendServiceProvider>
            <ReactQueryDevtools />
          </QueryClientProvider>
          
          
        </AuthenticatedTemplate>
        <UnauthenticatedTemplate>
          <Routes>
            <Route path='/' element={<Landing />} />
          </Routes>
          
        </UnauthenticatedTemplate>
      
    </BrowserRouter>
  )
}

export default App
