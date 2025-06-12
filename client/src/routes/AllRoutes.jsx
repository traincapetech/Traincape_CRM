// src/routes/AllRoutes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import Login from "../components/Auth/Login";
import SignUp from "../components/Auth/SignUp";
import CustomerSignUp from "../components/Auth/CustomerSignUp";
import LeadsPage from "../pages/LeadsPage";
import SalesPage from "../pages/SalesPage";
import SalesTrackingPage from "../pages/SalesTrackingPage";
import SalesCreatePage from "../pages/SalesCreatePage";
import ProfilePage from "../pages/ProfilePage";
import TokenDebugPage from "../pages/TokenDebugPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import AdminUsersPage from "../pages/AdminUsersPage";
import AdminLeadsPage from "../pages/AdminLeadsPage";
import AdminImportPage from "../pages/AdminImportPage";
import AdminReportsPage from "../pages/AdminReportsPage";
import AdminActivityPage from "../pages/AdminActivityPage";
import ProtectedRoute from "./ProtectedRoute";
import ForgotPassword from "../components/Auth/ForgotPassword";
import LeadSalesSheet from '../pages/LeadSalesSheet';
import LeadSalesUpdatePage from '../pages/LeadSalesUpdatePage';
import TutorialsPage from '../pages/TutorialsPage';
import TaskManagementPage from '../pages/TaskManagementPage';
import RepeatCustomersPage from '../pages/RepeatCustomersPage';
import CountriesPage from '../pages/Countries';
import ManagementContactsPage from '../pages/ManagementContactsPage';
import GeminiAIPage from '../pages/GeminiAIPage';
import ManagerDashboard from '../pages/ManagerDashboard';
import TestNotificationsPage from '../pages/TestNotificationsPage';
import CustomerDashboard from "../pages/CustomerDashboard";
import ProspectsPage from '../pages/ProspectsPage';

// Removed Router wrapper so it can be used at a higher level
const AllRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      {/* <Route path="/signup" element={<SignUp />} /> */}
      <Route path="/customer-signup" element={<CustomerSignUp />} />
      <Route path="/debug" element={<TokenDebugPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/tutorials" element={<TutorialsPage />} />
      <Route path="/management-contacts" element={<ManagementContactsPage />} />
      <Route path="/countries" element={<CountriesPage />} />
      
      {/* Customer Dashboard */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute allowedRoles={["Customer"]}>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Gemini AI Assistant - available to all users including customers */}
      <Route path="/ai-assistant" element={<GeminiAIPage />} />

      {/* Test Notifications - for testing exam notifications */}
      <Route
        path="/test-notifications"
        element={
          <ProtectedRoute allowedRoles={["Sales Person", "Lead Person", "Manager", "Admin"]}>
            <TestNotificationsPage />
          </ProtectedRoute>
        }
      />

      {/* Manager Dashboard */}
      <Route
        path="/manager"
        element={
          <ProtectedRoute allowedRoles={["Manager", "Admin"]}>
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />
      
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
      
      {/* Sales Create Route - for sales persons to create sales for lead persons */}
      <Route
        path="/create-sale"
        element={
          <ProtectedRoute allowedRoles={["Sales Person", "Manager", "Admin"]}>
            <SalesCreatePage />
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
      
      {/* Profile Route - accessible to all authenticated users including customers */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["Sales Person", "Lead Person", "Manager", "Admin", "Customer"]}>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      
      {/* Admin Routes - Allow Lead Person to access dashboard for lead stage analytics */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["Admin", "Lead Person"]}>
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
      
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminReportsPage />
          </ProtectedRoute>
        }
      />
      
      {/* Admin Activity Page - accessible to Admin and Manager */}
      <Route
        path="/admin/activity"
        element={
          <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
            <AdminActivityPage />
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
      
      {/* Contact Management Page - accessible to all authenticated users */}
      {/* Disabled since we're using ManagementContactsPage instead
      <Route
        path="/contact-management"
        element={
          <ProtectedRoute allowedRoles={["Sales Person", "Lead Person", "Manager", "Admin"]}>
            <ContactManagementPage />
          </ProtectedRoute>
        }
      />
      */}
      
      {/* Prospects - Sales Person, Manager, Admin only */}
      <Route 
        path="/prospects" 
        element={
          <ProtectedRoute allowedRoles={['Sales Person', 'Manager', 'Admin']}>
            <ProspectsPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Catch-all route for 404 errors */}
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
};

export default AllRoutes;
