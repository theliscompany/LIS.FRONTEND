import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Layout from './components/shared/Layout';
import Home from './components/admin/Home';
import Login from './components/authentification/Login';
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

const App = () => {
  return (
    <>
        <BrowserRouter>
            <Routes>
                <Route path='admin/*' element={<Layout />}>
                  <Route path="admin" element={<Home />} />
                  <Route path="wizard" element={<Wizard />} />
                  <Route path="simulation" element={<Simulation />} />
                  <Route path="requests" element={<Requests />} />
                </Route>
                <Route path="/" element={<Landing />} />
                <Route path="privacy-policy" element={<Privacy />} />
                <Route path="login" element={<Login />} />
            </Routes>
        </BrowserRouter>
    </>
  );
};

export default App;
