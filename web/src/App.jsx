import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { I18nProvider } from './i18n';
import { AuthProvider } from './hooks/useAuth';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

import { SchemesPage } from './pages/SchemesPage';
import { SchemeDetailPage } from './pages/SchemeDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { MatchesPage } from './pages/MatchesPage';
import { AlertsPage } from './pages/AlertsPage';
import { AdminReviewPage } from './pages/AdminReviewPage';
import { SourceHealthPage } from './pages/SourceHealthPage';
import { EvaluationPage } from './pages/EvaluationPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<SchemesPage />} />
              <Route path="/schemes/:id" element={<SchemeDetailPage />} />
              <Route path="/sources" element={<SourceHealthPage />} />
              <Route path="/evaluation" element={<EvaluationPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Farmer Routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/matches"
                element={
                  <ProtectedRoute>
                    <MatchesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/alerts"
                element={
                  <ProtectedRoute>
                    <AlertsPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Reviewer / Admin Route */}
              <Route
                path="/admin/review"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminReviewPage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </I18nProvider>
  );
}

export default App;

