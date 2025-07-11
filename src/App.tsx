import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Public pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin layout and pages
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Plans from './pages/Plans';
import Subscriptions from './pages/Subscriptions';
import Transactions from './pages/Transactions';
import Invoices from './pages/Invoices';
import EmailTemplates from './pages/EmailTemplates';
import EmailCampaigns from './pages/EmailCampaigns';
import Settings from './pages/Settings';

// Subscriber layout and pages
import SubscriberLayout from './components/layout/SubscriberLayout';
import SubscriberDashboard from './pages/subscriber/Dashboard';
import Subscription from './pages/subscriber/Subscription';
import Billing from './pages/subscriber/Billing';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="plans" element={<Plans />} />
              <Route path="subscriptions" element={<Subscriptions />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="email-templates" element={<EmailTemplates />} />
              <Route path="email-campaigns" element={<EmailCampaigns />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Subscriber routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <SubscriberLayout />
              </ProtectedRoute>
            }>
              <Route index element={<SubscriberDashboard />} />
            </Route>
            <Route path="/subscription" element={
              <ProtectedRoute>
                <SubscriberLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Subscription />} />
            </Route>
            <Route path="/billing" element={
              <ProtectedRoute>
                <SubscriberLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Billing />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;