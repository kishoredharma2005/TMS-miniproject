import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DepartmentPage from './pages/DepartmentPage';
import ProgrammePage from './pages/ProgrammePage';
import BlockPage from './pages/BlockPage';
import RoomPage from './pages/RoomPage';
import RolePage from './pages/RolePage';
import UserPage from './pages/UserPage';
import ComplaintFormPage from './pages/ComplaintFormPage';
import ComplaintsDashboardPage from './pages/ComplaintsDashboardPage';
import UserComplaintDashboardPage from './pages/UserComplaintDashboardPage';
import ReportsPage from './pages/ReportsPage';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const SuperAdminRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useContext(AuthContext);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return isAuthenticated && user?.role === 'SuperAdmin' ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="bg-blobs"></div>
        <div className="app-wrapper">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<div className="page-transition-enter-active"><HomePage /></div>} />
              <Route path="/login" element={<div className="page-transition-enter-active"><LoginPage /></div>} />
              
              {/* SuperAdmin Only Routes */}
              <Route
                path="/departments"
                element={
                  <div className="page-transition-enter-active">
                    <SuperAdminRoute>
                      <DepartmentPage />
                    </SuperAdminRoute>
                  </div>
                }
              />
              <Route
                path="/programmes"
                element={
                  <div className="page-transition-enter-active">
                    <SuperAdminRoute>
                      <ProgrammePage />
                    </SuperAdminRoute>
                  </div>
                }
              />
              <Route
                path="/blocks"
                element={
                  <div className="page-transition-enter-active">
                    <SuperAdminRoute>
                      <BlockPage />
                    </SuperAdminRoute>
                  </div>
                }
              />
              <Route
                path="/rooms"
                element={
                  <div className="page-transition-enter-active">
                    <SuperAdminRoute>
                      <RoomPage />
                    </SuperAdminRoute>
                  </div>
                }
              />
              <Route
                path="/roles"
                element={
                  <div className="page-transition-enter-active">
                    <SuperAdminRoute>
                      <RolePage />
                    </SuperAdminRoute>
                  </div>
                }
              />
              <Route
                path="/users"
                element={
                  <div className="page-transition-enter-active">
                    <SuperAdminRoute>
                      <UserPage />
                    </SuperAdminRoute>
                  </div>
                }
              />
              <Route
                path="/complaints/new"
                element={
                  <div className="page-transition-enter-active">
                    <ProtectedRoute>
                      <ComplaintFormPage />
                    </ProtectedRoute>
                  </div>
                }
              />
              <Route
                path="/my-complaints"
                element={
                  <div className="page-transition-enter-active">
                    <ProtectedRoute>
                      <UserComplaintDashboardPage />
                    </ProtectedRoute>
                  </div>
                }
              />
              <Route
                path="/complaints"
                element={
                  <div className="page-transition-enter-active">
                    <ProtectedRoute>
                      <ComplaintsDashboardPage />
                    </ProtectedRoute>
                  </div>
                }
              />
              <Route
                path="/reports"
                element={
                  <div className="page-transition-enter-active">
                    <SuperAdminRoute>
                      <ReportsPage />
                    </SuperAdminRoute>
                  </div>
                }
              />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
