// src/pages/HomePage.jsx
import React from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import { useAuth } from "../context/AuthContext";
import { componentClasses, darkModeClasses } from '../utils/darkModeClasses';
import GuestChat from "../components/Chat/GuestChat";

import { professionalClasses, transitions, shadows } from '../utils/professionalDarkMode';
const HomePage = () => {
  const { user } = useAuth();

  return (
    <Layout>
      {/* Hero Section - Improved responsiveness */}
      <div className="bg-gradient-to-br from-blue-700 to-indigo-800 text-white py-12 md:py-20 flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-center sm:text-left">TrainCape CRM</h1>
            <p className="text-lg sm:text-xl mb-6 text-center sm:text-left">Manage leads and track sales in one centralized platform.</p>
            {!user ? (
              <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                <Link to="/login" className="w-full sm:w-auto px-6 py-3 bg-blue-800 text-white font-semibold rounded-lg shadow-md dark:shadow-black/25 hover:bg-blue-900 transition text-center">
                  Sign In
                </Link>
                <Link to="/customer-signup" className="w-full sm:w-auto px-6 py-3 bg-blue-800 text-white font-semibold rounded-lg shadow-md dark:shadow-black/25 hover:bg-blue-900 transition text-center">
                  Customer Sign Up
                </Link>
              </div>
            ) : (
              <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                {user.role === "Sales Person" && (
                  <Link to="/sales" className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out text-center shadow-sm">
                    My Leads
                  </Link>
                )}
                {(user.role === "Lead Person" || user.role === "Manager" || user.role === "Admin") && (
                  <Link to="/leads" className="w-full sm:w-auto px-6 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white dark:bg-slate-900 transition-all duration-200 ease-out text-center">
                    Manage Leads
                  </Link>
                )}
                <Link to="/profile" className="w-full sm:w-auto px-6 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white dark:bg-slate-900 transition-all duration-200 ease-out text-center">
                  My Profile
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Quick Access Cards - Improved for mobile */}
      <div className="bg-gray-50 dark:bg-slate-800 transition-all duration-200 ease-out py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 md:-mt-10 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 ease-out">
              <div className="flex flex-col sm:flex-row items-center sm:items-start">
                <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 p-3 rounded-lg mb-3 sm:mb-0 sm:mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg font-bold mb-1 text-gray-900 dark:text-white">Contact Management</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Organize client data with powerful filters and segments.</p>
                  <Link to="/management-contacts" className="text-blue-700 dark:text-blue-400 font-medium text-sm mt-2 inline-block hover:underline">Access Contacts →</Link>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 ease-out">
              <div className="flex flex-col sm:flex-row items-center sm:items-start">
                <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-3 rounded-lg mb-3 sm:mb-0 sm:mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg font-bold mb-1 text-gray-900 dark:text-white">Sales Pipeline</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Track deals from lead to close with customizable processes.</p>
                  <Link to="/sales" className="text-green-700 dark:text-green-400 font-medium text-sm mt-2 inline-block hover:underline">View Pipeline →</Link>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 ease-out">
              <div className="flex flex-col sm:flex-row items-center sm:items-start">
                <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 p-3 rounded-lg mb-3 sm:mb-0 sm:mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg font-bold mb-1 text-gray-900 dark:text-white">Task Management</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Schedule exams and get automated reminders.</p>
                  <Link to="/tasks" className="text-purple-700 dark:text-purple-400 font-medium text-sm mt-2 inline-block hover:underline">Manage Tasks →</Link>
                </div>
              </div>
            </div>
            
            {user && (user.role === "Manager" || user.role === "Admin") && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 ease-out">
                <div className="flex flex-col sm:flex-row items-center sm:items-start">
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 p-3 rounded-lg mb-3 sm:mb-0 sm:mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg font-bold mb-1 text-gray-900 dark:text-white">Manager Dashboard</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Manage users, roles and system access.</p>
                    <Link to="/manager" className="text-indigo-700 dark:text-indigo-400 font-medium text-sm mt-2 inline-block hover:underline">Access Dashboard →</Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Quick Stats - Made mobile friendly */}
      <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out py-8 sm:py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: "Leads", value: "Today", icon: "📊" },
              { label: "Tasks", value: "Pending", icon: "✅" },
              { label: "Sales", value: "This Month", icon: "💰" },
              { label: "Team", value: "Members", icon: "👥" }
            ].map((stat, index) => (
              <Link key={index} to={index === 0 ? "sales" : index === 1 ? "/tasks" : index === 2 ? "sales-tracking" : "/profile"} 
                className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3 sm:p-4 text-center hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200 ease-out">
                <div className="text-xl sm:text-2xl mb-1">{stat.icon}</div>
                <div className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{stat.label}</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{stat.value}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      {/* Role-based Access - Improved layout for mobile */}
      <div className="bg-gray-50 dark:bg-slate-800 transition-all duration-200 ease-out py-8 sm:py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-gray-900 dark:text-white">Your Role: {user?.role || "Not Logged In"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out p-4 sm:p-5 rounded-lg shadow shadow-sm dark:shadow-black/25">
              <h3 className="font-bold text-blue-700 dark:text-blue-400 mb-2 text-center sm:text-left">Lead Person</h3>
              <ul className="space-y-2">
                <li className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                  <svg className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Create and manage leads</span>
                </li>
                <li className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                  <svg className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Assign leads to team members</span>
                </li>
                <li className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                  <svg className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Track lead progress</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out p-4 sm:p-5 rounded-lg shadow shadow-sm dark:shadow-black/25">
              <h3 className="font-bold text-green-700 dark:text-green-400 mb-2 text-center sm:text-left">Sales Person</h3>
              <ul className="space-y-2">
                <li className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                  <svg className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Access assigned leads</span>
                </li>
                <li className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                  <svg className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Update lead status</span>
                </li>
                <li className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                  <svg className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Schedule and track exams</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out p-4 sm:p-5 rounded-lg shadow shadow-sm dark:shadow-black/25">
              <h3 className="font-bold text-purple-700 dark:text-purple-400 mb-2 text-center sm:text-left">Manager/Admin</h3>
              <ul className="space-y-2">
                <li className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                  <svg className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Full system access</span>
                </li>
                <li className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                  <svg className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>View all leads and sales</span>
                </li>
                <li className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                  <svg className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Manage team and generate reports</span>
                </li>
                {user && (user.role === "Manager" || user.role === "Admin") && (
                  <li className="mt-4">
                    <Link to="/manager" className="inline-block w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded text-center transition">
                      Access Manager Dashboard
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section - Improved for mobile */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-8 sm:py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {!user ? (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-white">Sign in to access your dashboard</h2>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/login" className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-blue-700 dark:text-blue-400 font-semibold rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-all duration-200 ease-out inline-block">
                  Login
                </Link>
                <Link to="/customer-signup" className="px-6 py-3 bg-blue-800 text-white font-semibold rounded-lg shadow hover:bg-blue-900 transition inline-block">
                  Customer Sign Up
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-3 text-white">Welcome, {user.fullName}</h2>
              <p className="mb-4 text-sm sm:text-base text-white">Access your dashboard to manage your tasks.</p>
              <Link 
                to={
                  user.role === "Customer" ? "/customer" :
                  user.role === "Sales Person" ? "/sales" : "/leads"
                } 
                className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-blue-700 dark:text-blue-400 font-semibold rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-all duration-200 ease-out inline-block w-full sm:w-auto"
              >
                Go to Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Guest Chat for non-registered users */}
      {!user && <GuestChat />}
    </Layout>
  );
};

export default HomePage;
