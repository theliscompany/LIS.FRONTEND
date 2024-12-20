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
              </Route>
            </Routes>
          </BackendServiceProvider>
          
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
