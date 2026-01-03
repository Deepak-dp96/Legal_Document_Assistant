import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { UploadDocumentPage } from './pages/UploadDocumentPage';
import { AgentSelectionPage } from './pages/AgentSelectionPage';
import { ClauseExtractionPage } from './pages/agents/ClauseExtractionPage';
import RiskDetectionPage from './pages/agents/RiskDetectionPage';
import { DraftingAgentPage } from './pages/agents/DraftingAgentPage';
import { SummaryAgentPage } from './pages/agents/SummaryAgentPage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpPage } from './pages/HelpPage';
import { ReportsPage } from './pages/ReportsPage';
import { ExportHistoryPage } from './pages/ExportHistoryPage';
import { MyDocumentsPage } from './pages/MyDocumentsPage';
import { RecentDocumentsPage } from './pages/RecentDocumentsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import HelpBotNavigationPage from './pages/HelpBotNavigationPage';

export function AppRouter() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/upload-document" element={
              <ProtectedRoute>
                <UploadDocumentPage />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            } />
            <Route path="/agent-selection" element={
              <ProtectedRoute>
                <AgentSelectionPage />
              </ProtectedRoute>
            } />
            <Route path="/agents/clause-extraction" element={
              <ProtectedRoute>
                <ClauseExtractionPage />
              </ProtectedRoute>
            } />
            <Route path="/agents/risk-detection" element={
              <ProtectedRoute>
                <RiskDetectionPage />
              </ProtectedRoute>
            } />
            <Route path="/agents/drafting" element={
              <ProtectedRoute>
                <DraftingAgentPage />
              </ProtectedRoute>
            } />
            <Route path="/agents/summary" element={
              <ProtectedRoute>
                <SummaryAgentPage />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            } />
            <Route path="/export-history" element={
              <ProtectedRoute>
                <ExportHistoryPage />
              </ProtectedRoute>
            } />
            <Route path="/documents" element={
              <ProtectedRoute>
                <MyDocumentsPage />
              </ProtectedRoute>
            } />
            <Route path="/recent" element={
              <ProtectedRoute>
                <RecentDocumentsPage />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />
            <Route path="/help" element={
              <ProtectedRoute>
                <HelpPage />
              </ProtectedRoute>
            } />
            <Route path="/help-bot-navigation" element={<HelpBotNavigationPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}