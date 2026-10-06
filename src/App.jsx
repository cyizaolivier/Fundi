import { HashRouter, Routes, Route } from 'react-router-dom';
import { SessionProvider } from './context/SessionContext';
import { I18nProvider } from './i18n/I18nContext';
import Header from './components/Header';
import Footer from './components/Footer';
import DemoModeNotice from './components/DemoModeNotice';
import ScrollToTop from './components/ScrollToTop';
import RequireRole from './components/RequireRole';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardClient from './pages/DashboardClient';
import DashboardFundi from './pages/DashboardFundi';
import AdminOverview from './pages/AdminOverview';
import AdminLogin from './pages/AdminLogin';
import FundiProfile from './pages/FundiProfile';

// HashRouter needs no server-side rewrite rules, so the built app can be
// dropped straight into an Apache folder alongside the PHP api/ endpoints
// (routes look like /#/about instead of /about).
export default function App() {
  return (
    <I18nProvider>
      <SessionProvider>
        <HashRouter>
          <ScrollToTop />
          <DemoModeNotice />
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/fundis/:username" element={<FundiProfile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard/client" element={<RequireRole role="client"><DashboardClient /></RequireRole>} />
            <Route path="/dashboard/fundi" element={<RequireRole role="fundi"><DashboardFundi /></RequireRole>} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin/overview" element={<RequireRole role="admin" redirectTo="/admin"><AdminOverview /></RequireRole>} />
          </Routes>
          <Footer />
        </HashRouter>
      </SessionProvider>
    </I18nProvider>
  );
}
