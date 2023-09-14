import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Layout from './components/shared/Layout';
import Landing from './components/landing/Landing';
import Requests from './components/admin/Requests';
import Privacy from './components/landing/Privacy';
import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import NotFound from './components/shared/NotFound';
import Request from './components/admin/Request';
import { AuthorizedBackendApiProvider } from './api/api';
import RequestsSearch from './components/admin/RequestsSearch';
import Tracking from './components/landing/Tracking';
import NewRequest from './components/admin/NewRequest';
import UsersAssignment from './components/admin/UsersAssignment';
import Histories from './components/admin/Histories';
import MyRequests from './components/admin/MyRequests';
import PriceOffers from './components/admin/PriceOffers';
import ManagePriceOffer from './components/admin/ManagePriceOffer';
import ApproveOffer from './components/admin/ApproveOffer';

// Remove if locales are not used
import './locales/i18n';
import Login from './components/others/Login';

const App = () => {
  return (
    <>
      <BrowserRouter>
        <AuthenticatedTemplate>
          <AuthorizedBackendApiProvider>
            <Routes>
              <Route path='admin/*' element={<Layout />}>
                <Route path="" element={<Histories />} />
                <Route path="admin" element={<Histories />} />
                <Route path="requests" element={<Requests />} />
                <Route path="search/:search" element={<RequestsSearch />} />
                <Route path="search" element={<RequestsSearch />} />
                <Route path="request/:id" element={<Request />} />
                <Route path="new-request" element={<NewRequest />} />
                <Route path="my-requests" element={<MyRequests />} />
                <Route path="quote-offers" element={<PriceOffers />} />
                <Route path="quote-offers/:id" element={<ManagePriceOffer />} />
                <Route path="users" element={<UsersAssignment />} />
              </Route> 
              <Route path="/" element={<Layout children={<Requests />} />} />
              <Route path="login" element={<Layout children={<Requests />} />} />
              <Route path="landing" element={<Landing />} />
              <Route path="quote/:lang" element={<Landing />} />
              <Route path="privacy-policy" element={<Privacy />} />
              <Route path="tracking" element={<Tracking />} />
              <Route path="tracking/:id" element={<Tracking />} />
              <Route path="quote-offers/approve/:id" element={<ApproveOffer />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthorizedBackendApiProvider>
        </AuthenticatedTemplate>
        <UnauthenticatedTemplate>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="admin/" element={<Login />} />
            <Route path="admin/*" element={<Login />} />
            <Route path="landing" element={<Landing />} />
            <Route path="login" element={<Login />} />
            <Route path="privacy-policy" element={<Privacy />} />
            <Route path="tracking" element={<Tracking />}>
              <Route path=":id" element={<Tracking />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </UnauthenticatedTemplate>      
      </BrowserRouter>         
    </>
  );
};

export default App;
