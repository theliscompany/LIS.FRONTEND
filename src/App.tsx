import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Layout from './components/shared/Layout';
import Landing from './pages/Landing';
import Requests from './pages/Requests';
import Privacy from './pages/Privacy';
import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import NotFound from './pages/NotFound';
import Request from './pages/Request';
import { AuthorizedBackendApiProvider } from './api/api';
import RequestsSearch from './pages/RequestsSearch';
import Tracking from './pages/Tracking';
import NewRequest from './pages/NewRequest';
import UsersAssignment from './pages/UsersAssignment';
import Histories from './pages/Histories';
import MyRequests from './pages/MyRequests';
import PriceOffers from './pages/PriceOffers';
import ManagePriceOffer from './pages/ManagePriceOffer';

// Remove if locales are not used
import './locales/i18n';
import Login from './pages/Login';
import Seafreights from './pages/Seafreights';
import Haulages from './pages/Haulages';
import Miscellaneous from './pages/Miscellaneous';
import AcceptOffer from './pages/AcceptOffer';
import RefuseOffer from './pages/RefuseOffer';
import Templates from './pages/Templates';
import MasterDataServices from './pages/MasterDataServices';
import MasterDataProducts from './pages/MasterDataProducts';
import MasterDataPorts from './pages/MasterDataPorts';
import MasterDataContacts from './pages/MasterDataContacts';
import MasterDataFiles from './pages/MasterDataFiles';
import ValidatedRequests from './pages/ValidatedRequests';
import HandleRequest from './pages/HandleRequest';
import { Provider } from 'react-redux';
import { store } from './store';
import MasterDataHSCodes from './pages/MasterDataHSCodes';
import Orders from './pages/Orders';

const App = () => {
  return (
    <>
		<BrowserRouter>
			<AuthenticatedTemplate>
				<AuthorizedBackendApiProvider>
					<Provider store={store}>
						<Routes>
							<Route path='admin/*' element={<Layout />}>
								<Route path="" element={<Histories />} />
								<Route path="admin" element={<Histories />} />
								<Route path="requests" element={<Requests />} />
								<Route path="search/:search" element={<RequestsSearch />} />
								<Route path="search" element={<RequestsSearch />} />
								<Route path="request/:id" element={<Request />} />
								<Route path="handle-request/:id" element={<HandleRequest />} />
								<Route path="new-request" element={<NewRequest />} />
								<Route path="my-requests" element={<MyRequests />} />
								<Route path="pending-requests" element={<ValidatedRequests />} />
								<Route path="quote-offers" element={<PriceOffers />} />
								<Route path="quote-offers/:id" element={<ManagePriceOffer />} />
								<Route path="orders" element={<Orders />} />
								<Route path="users" element={<UsersAssignment />} />
								<Route path="seafreights" element={<Seafreights />} />
								<Route path="haulages" element={<Haulages />} />
								<Route path="miscellaneous" element={<Miscellaneous />} />
								<Route path="templates" element={<Templates />} />
								<Route path="services" element={<MasterDataServices />} />
								<Route path="products" element={<MasterDataProducts />} />
								<Route path="hscodes" element={<MasterDataHSCodes />} />
								<Route path="ports" element={<MasterDataPorts />} />
								<Route path="contacts" element={<MasterDataContacts />} />
								<Route path="files" element={<MasterDataFiles />} />
							</Route> 
							<Route path="/" element={<Layout children={<Requests />} />} />
							<Route path="login" element={<Layout children={<Requests />} />} />
							<Route path="landing" element={<Landing />} />
							<Route path="quote/:lang" element={<Landing />} />
							<Route path="privacy-policy" element={<Privacy />} />
							<Route path="tracking" element={<Tracking />} />
							<Route path="tracking/:id" element={<Tracking />} />
							<Route path="acceptOffer/:id" element={<AcceptOffer />} />
							<Route path="refuseOffer/:id" element={<RefuseOffer />} />
							<Route path="*" element={<NotFound />} />
						</Routes>
					</Provider>
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
					<Route path="acceptOffer/:id" element={<AcceptOffer />} />
					<Route path="refuseOffer/:id" element={<RefuseOffer />} />
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
