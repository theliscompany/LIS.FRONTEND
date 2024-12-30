import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react'
import Landing from './pages/Landing'
import './locales/i18n';
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
import AcceptOffer from './pages/offer/AcceptOffer';
import ManagePriceOffer from './pages/offer/ManagePriceOffer';
import PriceOffers from './pages/offer/PriceOffers';
import RefuseOffer from './pages/offer/RefuseOffer';
import HandleRequest from './pages/request/HandleRequest';
import MyRequests from './pages/request/MyRequests';
import NewRequest from './pages/request/NewRequest';
import Requests from './pages/request/Requests';
import RequestsSearch from './pages/request/RequestsSearch';
import ValidatedRequests from './pages/request/ValidatedRequests';
import Request from './pages/request/Request';
// import Histories from './pages/Histories';
import UsersAssignment from './pages/UsersAssignment';
import MasterDataHSCodes from './pages/masterdata/MasterDataHSCodes';
import Shipments from './pages/Shipments';

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
                  <Route path="users" element={<UsersAssignment />} />
                  <Route path="requests" element={<Requests />} />
                  <Route path="search/:search" element={<RequestsSearch />} />
                  <Route path="search" element={<RequestsSearch />} />
                  <Route path="request/:id" element={<Request />} />
                  <Route path="handle-request/:id" element={<HandleRequest />} />
                  <Route path="new-request" element={<NewRequest />} />
                  <Route path="my-requests" element={<MyRequests />} />
                  <Route path="pending-requests" element={<ValidatedRequests />} />
                  <Route path='ports' element={<MasterDataPorts />} />
                  <Route path='products' element={<MasterDataProducts />} />
                  <Route path='services' element={<MasterDataServices />} />
                  <Route path='contacts' element={<MasterDataContacts />} />
                  <Route path='templates' element={<MasterDataTemplates />} />
                  <Route path='hscodes' element={<MasterDataHSCodes />} />
                  <Route path='haulages' element={<Haulages />} />
                  <Route path='seafreights' element={<Seafreights />} />
                  <Route path='miscellaneous' element={<Miscellaneous />} />
                  <Route path="quote-offers" element={<PriceOffers />} />
                  <Route path="quote-offers/:id" element={<ManagePriceOffer />} />
                  <Route path="acceptOffer/:id" element={<AcceptOffer />} />
                  <Route path='*' element={<NotFound />} />
                </Route>
              </Routes>
            </BackendServiceProvider>
            <ReactQueryDevtools />
          </QueryClientProvider>
        </AuthenticatedTemplate>
        <UnauthenticatedTemplate>
          <BackendServiceProvider>
            <Routes>
              <Route path='/' element={<Landing />} />
              <Route path="login" element={<Login />} />
              <Route path="privacy-policy" element={<Privacy />} />
              <Route path="acceptOffer/:id" element={<AcceptOffer />} />
              <Route path="refuseOffer/:id" element={<RefuseOffer />} />
              <Route path='*' element={<NotFound />} />
            </Routes>
            </BackendServiceProvider>
        </UnauthenticatedTemplate>
      
    </BrowserRouter>
  )
}

export default App
