import React from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Toasts } from './components/ui';
import { useData } from './data/store';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Clients from './pages/Clients';
import Subscriptions from './pages/Subscriptions';
import Payments from './pages/Payments';
import Proposals from './pages/Proposals';
import Shootings from './pages/Shootings';
import Media from './pages/Media';
import Videos from './pages/Videos';
import Timeline from './pages/Timeline';
import Staff from './pages/Staff';
import Equipment from './pages/Equipment';
import Learning from './pages/Learning';
import Settings from './pages/Settings';

export default function App() {
  return (
    <HashRouter>
      <Shell />
    </HashRouter>
  );
}

function Shell() {
  const { toasts } = useData();
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/proposals" element={<Proposals />} />
        <Route path="/shootings" element={<Shootings />} />
        <Route path="/media" element={<Media />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="/equipment" element={<Equipment />} />
        <Route path="/learning" element={<Learning />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
      <Toasts items={toasts} />
    </Layout>
  );
}
