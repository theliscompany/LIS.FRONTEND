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
import ApproveOffer from './pages/ApproveOffer';

// Remove if locales are not used
import './locales/i18n';
import Login from './pages/Login';
import Seafreights from './pages/Seafreights';
import Haulages from './pages/Haulages';
import Miscellaneous from './pages/Miscellaneous';
import AcceptOffer from './pages/AcceptOffer';
import RefuseOffer from './pages/RefuseOffer';
import Templates from './pages/Templates';
// import Seafreights from './utils/others/Seafreights';

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
							<Route path="seafreights" element={<Seafreights />} />
							<Route path="haulages" element={<Haulages />} />
							<Route path="miscellaneous" element={<Miscellaneous />} />
							<Route path="templates" element={<Templates />} />
						</Route> 
						<Route path="/" element={<Layout children={<Requests />} />} />
						<Route path="login" element={<Layout children={<Requests />} />} />
						<Route path="landing" element={<Landing />} />
						<Route path="quote/:lang" element={<Landing />} />
						<Route path="privacy-policy" element={<Privacy />} />
						<Route path="tracking" element={<Tracking />} />
						<Route path="tracking/:id" element={<Tracking />} />
						<Route path="quote-offers/approve/:id" element={<ApproveOffer />} />
						<Route path="acceptOffer/:id" element={<AcceptOffer />} />
						<Route path="refuseOffer/:id" element={<RefuseOffer />} />
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
