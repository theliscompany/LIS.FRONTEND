import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react'
import Landing from './pages/Landing'
import './locales/i18n';
import Shipments from './pages/Shipments';
import Layout from './layout/Layout';
import BackendServiceProvider from './api/api';
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

function App() {

  return (
    <BrowserRouter>
        <AuthenticatedTemplate>
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
                <Route path="quote-offers" element={<PriceOffers />} />
								<Route path="quote-offers/:id" element={<ManagePriceOffer />} />
								<Route path='*' element={<NotFound />} />
              </Route>
            </Routes>
          </BackendServiceProvider>
          
        </AuthenticatedTemplate>
        <UnauthenticatedTemplate>
          <Routes>
            <Route path='/' element={<Landing />} />
            <Route path="login" element={<Login />} />
					  <Route path="privacy-policy" element={<Privacy />} />
					  <Route path="acceptOffer/:id" element={<AcceptOffer />} />
            <Route path="refuseOffer/:id" element={<RefuseOffer />} />
            <Route path='*' element={<NotFound />} />
          </Routes>
        </UnauthenticatedTemplate>
      
    </BrowserRouter>
  )
}

export default App
