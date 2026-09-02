import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import HomePage from './pages/HomePage';
import GuidedFlowPage from './pages/GuidedFlowPage';
import EvidenceVaultPage from './pages/EvidenceVaultPage';
import TrackerPage from './pages/TrackerPage';
import CasesPage from './pages/CasesPage';
import CaseDetailPage from './pages/CaseDetailPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/flow" element={<GuidedFlowPage />} />
          <Route path="/flow/:categoryId" element={<GuidedFlowPage />} />
          <Route path="/vault" element={<EvidenceVaultPage />} />
          <Route path="/tracker" element={<TrackerPage />} />
          <Route path="/cases" element={<CasesPage />} />
          <Route path="/cases/:id" element={<CaseDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
