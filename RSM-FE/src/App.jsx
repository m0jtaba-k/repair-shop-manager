import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import WorkOrdersListPage from './pages/WorkOrdersListPage';
import WorkOrderCreatePage from './pages/WorkOrderCreatePage';
import WorkOrderDetailPage from './pages/WorkOrderDetailPage';
import CustomersListPage from './pages/CustomersListPage';
import CustomerCreatePage from './pages/CustomerCreatePage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import CsvImportPage from './pages/CsvImportPage';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

function App() {
  console.log('App rendering');
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/work-orders"
          element={
            <ProtectedRoute>
              <WorkOrdersListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/work-orders/create"
          element={
            <ProtectedRoute>
              <WorkOrderCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/work-orders/:id"
          element={
            <ProtectedRoute>
              <WorkOrderDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <CustomersListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers/create"
          element={
            <ProtectedRoute>
              <CustomerCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers/:id"
          element={
            <ProtectedRoute>
              <CustomerDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/csv-import"
          element={
            <ProtectedRoute>
              <CsvImportPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App
