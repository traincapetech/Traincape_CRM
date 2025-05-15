// src/routes/AllRoutes.jsx
import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import Login from "../components/Auth/Login";
import SignUp from "../components/Auth/SignUp";
import LeadsPage from "../pages/LeadsPage";
import SalesPage from "../pages/SalesPage";
import SalesTrackingPage from "../pages/SalesTrackingPage";
import ProfilePage from "../pages/ProfilePage";
import TokenDebugPage from "../pages/TokenDebugPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import AdminUsersPage from "../pages/AdminUsersPage";
import AdminLeadsPage from "../pages/AdminLeadsPage";
import AdminImportPage from "../pages/AdminImportPage";
import ProtectedRoute from "./ProtectedRoute";
import ForgotPassword from "../components/Auth/ForgotPassword";
import LeadSalesSheet from '../pages/LeadSalesSheet';
import LeadSalesUpdatePage from '../pages/LeadSalesUpdatePage';
import TutorialsPage from '../pages/TutorialsPage';
import TaskManagementPage from '../pages/TaskManagementPage';
import RepeatCustomersPage from '../pages/RepeatCustomersPage';

const AllRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/debug" element={<TokenDebugPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/tutorials" element={<TutorialsPage />} />
        {/* Protected Routes */}
        <Route
          path="/leads"
          element={
            <ProtectedRoute allowedRoles={["Lead Person", "Manager", "Admin"]}>
              <LeadsPage />
            </ProtectedRoute>
          }
        />
        
        {/* Sales Routes */}
        <Route
          path="/sales"
          element={
            <ProtectedRoute allowedRoles={["Sales Person", "Manager", "Admin"]}>
              <SalesPage />
            </ProtectedRoute>
          }
        />
        
        {/* Sales Tracking Route */}
        <Route
          path="/sales-tracking"
          element={
            <ProtectedRoute allowedRoles={["Sales Person", "Manager", "Admin"]}>
              <SalesTrackingPage />
            </ProtectedRoute>
          }
        />
        
        {/* Task Management Route */}
        <Route
          path="/tasks"
          element={
            <ProtectedRoute allowedRoles={["Sales Person", "Lead Person", "Manager", "Admin"]}>
              <TaskManagementPage />
            </ProtectedRoute>
          }
        />
        
        {/* Profile Route - accessible to all authenticated users */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["Sales Person", "Lead Person", "Manager", "Admin"]}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        
        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/leads"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminLeadsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/import"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminImportPage />
            </ProtectedRoute>
          }
        />
        
        {/* Repeat Customers Page - accessible to Admin and Manager */}
        <Route
          path="/repeat-customers"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
              <RepeatCustomersPage />
            </ProtectedRoute>
          }
        />
        
        {/* Lead Sales Sheet - accessible to Lead Person, Manager, and Admin */}
        <Route 
          path="/lead-sales-sheet" 
          element={
            <ProtectedRoute allowedRoles={['Lead Person', 'Manager', 'Admin']}>
              <LeadSalesSheet />
            </ProtectedRoute>
          } 
        />
        
        {/* Lead Sales Update - for lead persons to update sales */}
        <Route 
          path="/update-sales" 
          element={
            <ProtectedRoute allowedRoles={['Lead Person', 'Manager', 'Admin']}>
              <LeadSalesUpdatePage />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch-all route for 404 errors */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Router>
  );
};

export default AllRoutes;
