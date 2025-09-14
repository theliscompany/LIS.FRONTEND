import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react'
import Landing from './pages/Landing'
import './locales/i18n';
import Layout from './layout/Layout';
import BackendServiceProvider from './api/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import MasterDataPorts from '@features/masterdata/pages/MasterDataPorts';
import MasterDataProducts from '@features/masterdata/pages/MasterDataProducts';
import MasterDataServices from '@features/masterdata/pages/MasterDataServices';
import MasterDataContacts from '@features/masterdata/pages/MasterDataContacts';
import NotFound from './pages/NotFound';
import { Login } from '@mui/icons-material';
import Privacy from './pages/Privacy';
import MasterDataTemplates from '@features/masterdata/pages/MasterDataTemplates';
import AcceptOffer from '@features/offer/pages/AcceptOffer';
import ManagePriceOffer from '@features/offer/pages/ManagePriceOffer';
import PriceOffers from '@features/offer/pages/PriceOffers';
import QuoteApproval from '@features/offer/pages/QuoteApproval';
import ApprovedQuotes from '@features/offer/pages/ApprovedQuotes';
import RefuseOffer from '@features/offer/pages/RefuseOffer';
import QuoteViewerPage from '@features/offer/pages/QuoteViewerPage';
import DraftQuotes from '@features/offer/pages/DraftQuotes';
import DraftQuotesSimple from '@features/offer/pages/DraftQuotes_Simple';
import HandleRequest from '@features/request/pages/HandleRequest';
import Requests from '@features/request/pages/Requests';
import RequestsSearch from '@features/request/pages/RequestsSearch';
import ValidatedRequests from '@features/request/pages/ValidatedRequests';
import MyRequests from '@features/request/pages/MyRequests';
import Request from '@features/request/components/Request';
// import Histories from './pages/Histories';
import UsersAssignment from './pages/UsersAssignment';
import MasterDataHSCodes from '@features/masterdata/pages/MasterDataHSCodes';
// import Shipments from './pages/Shipments';
import Tracking from './pages/Tracking';
import ScrollToTop from './components/shared/ScrollToTop';
import MasterDataFiles from '@features/masterdata/pages/MasterDataFiles';
//import EditHaulage from '@features/pricing/components/EditHaulage';
//import EditMiscellaneous from '@features/pricing/components/EditMiscellaneous';
import RequestWizard from '@features/request/pages/RequestWizard';
import { MiscellaneousCRUDPage, HaulagePage, HaulageCRUDPage, SeaFreightPage, SeaFreightCRUDPage, SeaFreightDetailsPage } from '@features/pricingnew';
import SupportBackdoorAll from '@features/pricingnew/pages/SupportBackdoorAll';
import { LoadScript } from '@react-google-maps/api';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import HaulageDetailsPage from './features/pricingnew/pages/HaulageDetailsPage';
import MiscellaneousDetailsPage from './features/pricingnew/pages/MiscellaneousDetailsPage';
import MiscellaneousEditPage from './features/pricingnew/pages/MiscellaneousEditPage';
import TestOnboarding from './pages/TestOnboarding';
import EmailTemplatesPage from './features/template/pages/EmailTemplatesPage';
import ObjectTypesManagementPage from './features/template/pages/ObjectTypesManagementPage';

const queryClient = new QueryClient();

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <LoadScript
        googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
        libraries={['places']}
      >
        <BrowserRouter>
          <AuthenticatedTemplate>
            <QueryClientProvider client={queryClient}>
              <BackendServiceProvider>
                <ScrollToTop />
                <Routes>
                  <Route path='/*' element={<Layout />}>
                    <Route path='' element={<Requests />} />
                    <Route path="users" element={<UsersAssignment />} />
                    <Route path="requests" element={<Requests />} />
                    <Route path="search/:search" element={<RequestsSearch />} />
                    <Route path="search" element={<RequestsSearch />} />
                    <Route path="request" element={<Request />} />
                    <Route path="request/:id" element={<Request />} />
                    <Route path="handle-request/:id" element={<HandleRequest />} />
                    <Route path="new-request" element={<RequestWizard />} />
                    <Route path="request-wizard" element={<RequestWizard />} />
                    <Route path="request-wizard/:id" element={<RequestWizard />} />
                    <Route path="my-requests" element={<MyRequests />} />
                    <Route path="pending-requests" element={<ValidatedRequests />} />
                    <Route path='ports' element={<MasterDataPorts />} />
                    <Route path='products' element={<MasterDataProducts />} />
                    <Route path='services' element={<MasterDataServices />} />
                    <Route path='contacts' element={<MasterDataContacts />} />
                    {/*<Route path='templates' element={<MasterDataTemplates />} />*/}
                    <Route path='email-templates' element={<EmailTemplatesPage />} />
                    <Route path='object-types' element={<ObjectTypesManagementPage />} />
                    <Route path='hscodes' element={<MasterDataHSCodes />} />
                    <Route path='files' element={<MasterDataFiles />} />
                    <Route path='haulages' element={<HaulagePage />} />
                    <Route path='seafreights' element={<SeaFreightPage />} />
                    <Route path='miscellaneousAll' element={<MiscellaneousCRUDPage />} />
                    <Route path="quote-offers" element={<PriceOffers />} />
                    <Route path="quote-offers/:id" element={<ManagePriceOffer />} />
                    <Route path="quote-viewer/:quoteId" element={<QuoteViewerPage />} />
                    <Route path="draft-quotes" element={<DraftQuotes />} />
                    <Route path="draft-quotes-simple" element={<DraftQuotesSimple />} />
                    <Route path="quote-approval" element={<QuoteApproval />} />
                    <Route path="approved-quotes" element={<ApprovedQuotes />} />
                    <Route path="acceptOffer/:id" element={<AcceptOffer />} />
                    <Route path="quote/:lang" element={<Landing />} />
                    <Route path="privacy-policy" element={<Privacy />} />
                    <Route path="tracking" element={<Tracking />} />
                    <Route path="tracking/:id" element={<Tracking />} />
                    <Route path='landing' element={<Landing />} />
                    <Route path='*' element={<NotFound />} />
                    {/* Removed EditHaulage, EditSeafreight, EditMiscellaneous routes due to missing components */}
                    <Route path="request-wizard" element={<RequestWizard />} />
                            <Route path="pricingnew/miscellaneous" element={<MiscellaneousCRUDPage />} />
        <Route path="pricingnew/miscellaneous/:id" element={<MiscellaneousEditPage />} />
        <Route path="pricingnew/miscellaneous/details/:id" element={<MiscellaneousDetailsPage />} />
                    <Route path="pricingnew/haulage" element={<HaulagePage />} />
                    <Route path="pricingnew/haulage/:offerId" element={<HaulageCRUDPage />} />
                    <Route path="pricingnew/haulage/details/:offerId" element={<HaulageDetailsPage />} />
                    <Route path="pricingnew/seafreight" element={<SeaFreightPage />} />
                    <Route path="pricingnew/seafreight/:id" element={<SeaFreightCRUDPage />} />
                    <Route path="pricingnew/seafreight/details/:id" element={<SeaFreightDetailsPage />} />
                    <Route path="support-backdoor" element={<SupportBackdoorAll />} />
                    <Route path="test-onboarding" element={<TestOnboarding />} />
                  </Route>
                </Routes>
              </BackendServiceProvider>
              <ReactQueryDevtools />
            </QueryClientProvider>
          </AuthenticatedTemplate>
          <UnauthenticatedTemplate>
            <BackendServiceProvider>
              <ScrollToTop />
              <Routes>
                <Route path='/' element={<Landing />} />
                <Route path="login" element={<Login />} />
                <Route path="privacy-policy" element={<Privacy />} />
                <Route path="acceptOffer/:id" element={<AcceptOffer />} />
                <Route path="refuseOffer/:id" element={<RefuseOffer />} />
                <Route path="tracking" element={<Tracking />} />
                <Route path="tracking/:id" element={<Tracking />} />
                <Route path='landing' element={<Landing />} />
                <Route path='*' element={<NotFound />} />
              </Routes>
            </BackendServiceProvider>
          </UnauthenticatedTemplate>
        </BrowserRouter>
      </LoadScript>
    </LocalizationProvider>
  );
}

export default App;
