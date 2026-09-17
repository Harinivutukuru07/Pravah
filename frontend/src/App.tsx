import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/Login/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import EnquiriesPage from './pages/Enquiries/EnquiriesPage';
import QuotationsPage from './pages/Quotations/QuotationsPage';
import SalesOrdersPage from './pages/SalesOrders/SalesOrdersPage';
import InventoryPage from './pages/Inventory/InventoryPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1d27',
              color: '#f1f5f9',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              borderRadius: '10px',
              fontSize: '0.875rem',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/enquiries" element={<EnquiriesPage />} />
            <Route path="/quotations" element={<QuotationsPage />} />
            <Route path="/sales-orders" element={<SalesOrdersPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
