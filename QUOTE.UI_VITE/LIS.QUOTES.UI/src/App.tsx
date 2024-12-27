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
import MasterDataPorts from './pages/masterdata/MasterDataPorts';
import MasterDataProducts from './pages/masterdata/MasterDataProducts';
import MasterDataServices from './pages/masterdata/MasterDataServices';
import MasterDataContacts from './pages/masterdata/MasterDataContacts';
import NotFound from './pages/NotFound';
import { Login } from '@mui/icons-material';
import Privacy from './pages/Privacy';
import MasterDataTemplates from './pages/masterdata/MasterDataTemplates';
import Haulages from './pages/pricing/Haulages';
import Seafreights from './pages/pricing/Seafreights';
import Miscellaneous from './pages/pricing/Miscellaneous';

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
                  <Route path='ports' element={<MasterDataPorts />} />
                  <Route path='products' element={<MasterDataProducts />} />
                  <Route path='services' element={<MasterDataServices />} />
                  <Route path='contacts' element={<MasterDataContacts />} />
                  <Route path='templates' element={<MasterDataTemplates />} />
                  <Route path='haulages' element={<Haulages />} />
                  <Route path='seafreights' element={<Seafreights />} />
                  <Route path='miscellaneous' element={<Miscellaneous />} />
                  <Route path='*' element={<NotFound />} />
                </Route>
              </Routes>
            </BackendServiceProvider>
            <ReactQueryDevtools />
          </QueryClientProvider>
        </AuthenticatedTemplate>
        <UnauthenticatedTemplate>
          <Routes>
            <Route path='/' element={<Landing />} />
            <Route path="login" element={<Login />} />
					  <Route path="privacy-policy" element={<Privacy />} />
					  <Route path='*' element={<NotFound />} />
          </Routes>
        </UnauthenticatedTemplate>
      
    </BrowserRouter>
  )
}

export default App
