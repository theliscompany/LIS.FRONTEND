import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './Layout';
import Home from './Home';
import Login from './Login';
// import ResponsiveAppBar from './ResponsiveAppBar';
// import Haulages from './Haulages';
// import MiniDrawer from './MiniDrawer';
// import Seafreights from './Seafreights';
import Notifications from './Notifications';
import Wizard from './Wizard';
import Simulation from './Simulation';
import Landing from './Landing';

const App = () => {
  return (
    <>
        <BrowserRouter>
            <Routes>
                <Route path='admin' element={<Layout />}>
                  <Route path="admin/" element={<Home />} />
                  <Route path='admin/wizard' element={<Wizard />} />
                  <Route path='admin/simulation' element={<Simulation />} />
                  <Route path='admin/requests' element={<Notifications />} />
                </Route>
                <Route path="/" element={<Landing />} />
                <Route path='login' element={<Login />} />
            </Routes>
        </BrowserRouter>
    </>
  );
};

export default App;
