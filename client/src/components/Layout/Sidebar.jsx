import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaHome, FaUser, FaUsers, FaChartLine, FaClipboardList, FaChartBar, FaCog, FaFileImport, FaCalendarCheck, FaUserCog } from 'react-icons/fa';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="h-screen bg-gray-800 text-white w-64 flex-shrink-0 hidden md:block">
      <div className="flex flex-col h-full">
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold">CRM Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Welcome, {user?.name}</p>
        </div>
        
        <nav className="flex-1 px-2 py-4">
          <ul className="space-y-2">
            <li>
              <Link
                to="/"
                className={`${
                  location.pathname === '/'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
              >
                <FaHome
                  className={`${
                    location.pathname === '/'
                      ? 'text-gray-300'
                      : 'text-gray-400 group-hover:text-gray-300'
                  } mr-3 flex-shrink-0 h-6 w-6`}
                />
                Home
              </Link>
            </li>
            
            {/* Manager Dashboard - Only visible to Manager and Admin */}
            {(user?.role === 'Manager' || user?.role === 'Admin') && (
              <li>
                <Link
                  to="/manager"
                  className={`${
                    location.pathname === '/manager'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                >
                  <FaUserCog
                    className={`${
                      location.pathname === '/manager'
                        ? 'text-gray-300'
                        : 'text-gray-400 group-hover:text-gray-300'
                    } mr-3 flex-shrink-0 h-6 w-6`}
                  />
                  Manager Dashboard
                </Link>
              </li>
            )}
            
            {/* Lead Management - Only visible to Lead Person, Manager, and Admin */}
            {(user?.role === 'Lead Person' || user?.role === 'Manager' || user?.role === 'Admin') && (
              <li>
                <Link
                  to="/leads"
                  className={`${
                    location.pathname === '/leads'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                >
                  <FaClipboardList
                    className={`${
                      location.pathname === '/leads'
                        ? 'text-gray-300'
                        : 'text-gray-400 group-hover:text-gray-300'
                    } mr-3 flex-shrink-0 h-6 w-6`}
                  />
                  Leads
                </Link>
              </li>
            )}
            
            {/* Sales Management - Only visible to Sales Person, Manager, and Admin */}
            {(user?.role === 'Sales Person' || user?.role === 'Manager' || user?.role === 'Admin') && (
              <li>
                <Link
                  to="/sales"
                  className={`${
                    location.pathname === '/sales'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                >
                  <FaChartBar
                    className={`${
                      location.pathname === '/sales'
                        ? 'text-gray-300'
                        : 'text-gray-400 group-hover:text-gray-300'
                    } mr-3 flex-shrink-0 h-6 w-6`}
                  />
                  Sales
                </Link>
              </li>
            )}
            
            {/* Create Sale for Lead Person - Only visible to Sales Person, Manager, and Admin */}
            {(user?.role === 'Sales Person' || user?.role === 'Manager' || user?.role === 'Admin') && (
              <li>
                <Link
                  to="/create-sale"
                  className={`${
                    location.pathname === '/create-sale'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                >
                  <FaChartLine
                    className={`${
                      location.pathname === '/create-sale'
                        ? 'text-gray-300'
                        : 'text-gray-400 group-hover:text-gray-300'
                    } mr-3 flex-shrink-0 h-6 w-6`}
                  />
                  Create Sale for Lead
                </Link>
              </li>
            )}
            
            {/* Task Management - Visible to all authenticated users */}
            {user && (
              <li>
                <Link
                  to="/tasks"
                  className={`${
                    location.pathname === '/tasks'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                >
                  <FaCalendarCheck
                    className={`${
                      location.pathname === '/tasks'
                        ? 'text-gray-300'
                        : 'text-gray-400 group-hover:text-gray-300'
                    } mr-3 flex-shrink-0 h-6 w-6`}
                  />
                  Task Management
                </Link>
              </li>
            )}
            
            {/* Lead Sales Sheet - Only visible to Lead Person, Manager, and Admin */}
            {(user?.role === 'Lead Person' || user?.role === 'Manager' || user?.role === 'Admin') && (
              <li>
                <Link
                  to="/lead-sales-sheet"
                  className={`${
                    location.pathname === '/lead-sales-sheet'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                >
                  <FaChartLine
                    className={`${
                      location.pathname === '/lead-sales-sheet'
                        ? 'text-gray-300'
                        : 'text-gray-400 group-hover:text-gray-300'
                    } mr-3 flex-shrink-0 h-6 w-6`}
                  />
                  My Sales Sheet
                </Link>
              </li>
            )}
            
            {/* Update Sales - Only visible to Manager and Admin, removed for Lead Person */}
            {(user?.role === 'Manager' || user?.role === 'Admin') && (
              <li>
                <Link
                  to="/update-sales"
                  className={`${
                    location.pathname === '/update-sales'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                >
                  <FaChartBar
                    className={`${
                      location.pathname === '/update-sales'
                        ? 'text-gray-300'
                        : 'text-gray-400 group-hover:text-gray-300'
                    } mr-3 flex-shrink-0 h-6 w-6`}
                  />
                  Update Sales
                </Link>
              </li>
            )}
            
            {/* Profile - Visible to all */}
            <li>
              <Link
                to="/profile"
                className={`${
                  location.pathname === '/profile'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
              >
                <FaUser
                  className={`${
                    location.pathname === '/profile'
                      ? 'text-gray-300'
                      : 'text-gray-400 group-hover:text-gray-300'
                  } mr-3 flex-shrink-0 h-6 w-6`}
                />
                Profile
              </Link>
            </li>
            
            {/* Admin Section - Only visible to Admin */}
            {user?.role === 'Admin' && (
              <>
                <li className="mt-8 mb-2">
                  <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Admin
                  </h3>
                </li>
                <li>
                  <Link
                    to="/admin/users"
                    className={`${
                      location.pathname === '/admin/users'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                  >
                    <FaUsers
                      className={`${
                        location.pathname === '/admin/users'
                          ? 'text-gray-300'
                          : 'text-gray-400 group-hover:text-gray-300'
                      } mr-3 flex-shrink-0 h-6 w-6`}
                    />
                    Users
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/import"
                    className={`${
                      location.pathname === '/admin/import'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                  >
                    <FaFileImport
                      className={`${
                        location.pathname === '/admin/import'
                          ? 'text-gray-300'
                          : 'text-gray-400 group-hover:text-gray-300'
                      } mr-3 flex-shrink-0 h-6 w-6`}
                    />
                    Import Data
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin"
                    className={`${
                      location.pathname === '/admin'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                  >
                    <FaCog
                      className={`${
                        location.pathname === '/admin'
                          ? 'text-gray-300'
                          : 'text-gray-400 group-hover:text-gray-300'
                      } mr-3 flex-shrink-0 h-6 w-6`}
                    />
                    Settings
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={logout}
            className="w-full flex items-center px-4 py-2 text-sm text-gray-300 rounded-md hover:bg-gray-700"
          >
            <svg
              className="mr-3 h-4 w-4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 