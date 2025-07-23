// src/components/Navbar.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CurrencySelector from "./CurrencySelector";
import ThemeToggle from "./ThemeToggle";
import ActivityTimer from "./ActivityTimer/ActivityTimer";
import logo from '../assets/traincape-logo.jpg';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [isSalesDropdownOpen, setIsSalesDropdownOpen] = useState(false);
  const [isLeadsDropdownOpen, setIsLeadsDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  const adminDropdownRef = useRef(null);
  const salesDropdownRef = useRef(null);
  const leadsDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target)) {
        setIsAdminDropdownOpen(false);
      }
      if (salesDropdownRef.current && !salesDropdownRef.current.contains(event.target)) {
        setIsSalesDropdownOpen(false);
      }
      if (leadsDropdownRef.current && !leadsDropdownRef.current.contains(event.target)) {
        setIsLeadsDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Dropdown menu component
  const DropdownMenu = ({ isOpen, items, title, reference }) => (
    <div ref={reference} className="relative">
      <button
        onClick={() => reference === adminDropdownRef ? setIsAdminDropdownOpen(!isOpen) :
                      reference === salesDropdownRef ? setIsSalesDropdownOpen(!isOpen) :
                      reference === leadsDropdownRef ? setIsLeadsDropdownOpen(!isOpen) :
                      setIsProfileDropdownOpen(!isOpen)}
        className="flex items-center hover:text-green-300 focus:outline-none"
      >
        {title}
        <svg className={`ml-1 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 py-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg z-50 border dark:border-slate-700">
          {items.map((item, index) => (
            item.onClick ? (
              <button
                key={index}
                onClick={() => {
                  item.onClick();
                  reference === adminDropdownRef ? setIsAdminDropdownOpen(false) :
                  reference === salesDropdownRef ? setIsSalesDropdownOpen(false) :
                  reference === leadsDropdownRef ? setIsLeadsDropdownOpen(false) :
                  setIsProfileDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                {item.label}
              </button>
            ) : (
              <Link
                key={index}
                to={item.path}
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                onClick={() => reference === adminDropdownRef ? setIsAdminDropdownOpen(false) :
                            reference === salesDropdownRef ? setIsSalesDropdownOpen(false) :
                            reference === leadsDropdownRef ? setIsLeadsDropdownOpen(false) :
                            setIsProfileDropdownOpen(false)}
              >
                {item.label}
              </Link>
            )
          ))}
        </div>
      )}
    </div>
  );

  // Define dropdown items
  const adminItems = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Manage Users', path: '/admin/users' },
    { label: 'Manage Leads', path: '/admin/leads' },
    { label: 'Import Data', path: '/admin/import' },
    { label: 'Activity Logs', path: '/admin/activity-logs' }
  ];

  const salesItems = [
    { label: 'Sales Tracking', path: '/sales-tracking' },
    { label: 'Prospects', path: '/prospects' }
  ];

  const leadsItems = [
    { label: 'Leads', path: '/leads' },
    { label: 'Lead Sales Sheet', path: '/lead-sales-sheet' }
  ];

  const profileItems = [
    { label: 'Profile', path: '/profile' },
    { label: 'Settings', path: '/settings' }
  ];

  return (
    <header className="bg-blue-600 dark:bg-slate-900 text-white py-4 shadow-md dark:shadow-black/25 transition-all duration-200 ease-out border-b border-transparent dark:border-slate-700">
      <nav className="container mx-auto flex justify-between items-center px-4">
        <a href="/" className="flex items-center space-x-3">
          <img src={logo} alt="Traincape Technology Logo" className="h-12 w-12 rounded" />
          <span className="text-xl font-bold tracking-wide hidden md:block">Traincape Technology</span>
        </a>
        
        <button 
          className="text-white md:hidden" 
          onClick={toggleMenu}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
          </svg>
        </button>

        <div className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 absolute md:relative top-16 md:top-0 left-0 md:left-auto w-full md:w-auto bg-blue-600 dark:bg-slate-900 md:bg-transparent p-4 md:p-0 z-50`}>
          {/* Home link accessible to all */}
          <Link to="/" className="hover:text-green-300">Home</Link>

          {/* Customer Dashboard */}
          {user && user.role === "Customer" && (
            <Link to="/customer" className="hover:text-green-300">Dashboard</Link>
          )}

          {/* Sales Person Links */}
          {user && (user.role === "Sales Person" || user.role === "Manager" || user.role === "Admin") && (
            <DropdownMenu
              isOpen={isSalesDropdownOpen}
              items={salesItems}
              title="Sales"
              reference={salesDropdownRef}
            />
          )}

          {/* Lead Person Links */}
          {user && (user.role === "Lead Person" || user.role === "Manager" || user.role === "Admin") && (
            <DropdownMenu
              isOpen={isLeadsDropdownOpen}
              items={leadsItems}
              title="Leads"
              reference={leadsDropdownRef}
            />
          )}

          {/* Admin Links */}
          {user && user.role === "Admin" && (
            <DropdownMenu
              isOpen={isAdminDropdownOpen}
              items={adminItems}
              title="Admin"
              reference={adminDropdownRef}
            />
          )}

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            <CurrencySelector />
            <ThemeToggle />
            <ActivityTimer />
            
            {user ? (
              <DropdownMenu
                isOpen={isProfileDropdownOpen}
                items={[
                  ...profileItems,
                  { 
                    label: 'Logout',
                    path: '#',
                    onClick: handleLogout
                  }
                ]}
                title={user.fullName || 'Profile'}
                reference={profileDropdownRef}
              />
            ) : (
              <Link to="/login" className="hover:text-green-300">Login</Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
