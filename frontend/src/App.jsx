import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import UpstreamPage from './pages/UpstreamPage';
import MidstreamPage from './pages/MidstreamPage';
import FinishedGoodsPage from './pages/FinishedGoodsPage';
import AlertsPage from './pages/AlertsPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/upstream" element={<UpstreamPage />} />
        <Route path="/midstream" element={<MidstreamPage />} />
        <Route path="/finished-goods" element={<FinishedGoodsPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
      </Route>
    </Routes>
  );
}
