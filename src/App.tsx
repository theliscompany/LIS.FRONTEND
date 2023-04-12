import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Layout from './components/shared/Layout';
import Home from './components/admin/Home';
import Login from './components/others/Login';
// import ResponsiveAppBar from './ResponsiveAppBar';
// import Haulages from './Haulages';
// import MiniDrawer from './MiniDrawer';
// import Seafreights from './Seafreights';
// import Notifications from './Notifications';
import Wizard from './components/admin/Wizard';
import Simulation from './components/admin/Simulation';
import Landing from './components/landing/Landing';
import Requests from './components/admin/Requests';
import Privacy from './components/landing/Privacy';
import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import NotFound from './components/shared/NotFound';
import Request from './components/admin/Request';
import { AuthorizedBackendApiProvider } from './api/api';

const App = () => {
  return (
    <>
      <BrowserRouter>
        <AuthenticatedTemplate>
          <AuthorizedBackendApiProvider>
            <Routes>
              <Route path='admin/*' element={<Layout />}>
                <Route path="admin" element={<Home />} />
                <Route path="wizard" element={<Wizard />} />
                <Route path="simulation" element={<Simulation />} />
                <Route path="requests" element={<Requests />} />
                <Route path="request/:id" element={<Request />} />
              </Route> 
              <Route path="/" element={<Landing />} />
              <Route path="privacy-policy" element={<Privacy />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthorizedBackendApiProvider>
        </AuthenticatedTemplate>
        <UnauthenticatedTemplate>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="privacy-policy" element={<Privacy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </UnauthenticatedTemplate>      
      </BrowserRouter>         
    </>
  );
};

export default App;
