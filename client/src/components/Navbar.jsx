import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CurrencySelector from "./CurrencySelector";
import ThemeToggle from "./ThemeToggle";
import ActivityTimer from "./ActivityTimer/ActivityTimer";
import logo from '../assets/traincape-logo.jpg';
import '../styles/navbar.css';
import { 
  FaHome, 
  FaChartLine, 
  FaUsers, 
  FaCog, 
  FaUser, 
  FaSignOutAlt,
  FaRocket,
  FaBell,
  FaSearch,
  FaLinkedin,
  FaTwitter,
  FaFacebook
} from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [isSalesDropdownOpen, setIsSalesDropdownOpen] = useState(false);
  const [isLeadsDropdownOpen, setIsLeadsDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const adminDropdownRef = useRef(null);
  const salesDropdownRef = useRef(null);
  const leadsDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    setIsProfileDropdownOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Enhanced Dropdown menu component with glassmorphism
  const DropdownMenu = ({ isOpen, items, title, reference, icon: Icon }) => (
    <div ref={reference} className="relative">
      <button
        onClick={() => {
          if (reference === adminDropdownRef) setIsAdminDropdownOpen(!isOpen);
          else if (reference === salesDropdownRef) setIsSalesDropdownOpen(!isOpen);
          else if (reference === leadsDropdownRef) setIsLeadsDropdownOpen(!isOpen);
          else setIsProfileDropdownOpen(!isOpen);
        }}
        className={`group flex items-center px-4 py-2 rounded-xl transition-all duration-300 ease-out border border-transparent ${
          isScrolled 
            ? 'text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 hover:border-blue-200 dark:hover:border-slate-600' 
            : 'text-white/90 hover:text-white hover:bg-white/10 hover:border-white/20'
        }`}
      >
        {Icon && <Icon className="mr-2 text-sm" />}
        <span className="font-medium">{title}</span>
        {title && (
          <svg 
            className={`ml-2 h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => {
            setIsAdminDropdownOpen(false);
            setIsSalesDropdownOpen(false);
            setIsLeadsDropdownOpen(false);
            setIsProfileDropdownOpen(false);
          }}></div>
          
          <div className={`absolute right-0 mt-3 py-3 w-64 rounded-2xl shadow-2xl z-50 transform dropdown-enter ${
            isScrolled 
              ? 'navbar-glass-dark dark:bg-slate-800/95' 
              : 'navbar-glass bg-white/95'
          }`}>
            {title && (
              <div className="px-3 pb-2 mb-2 border-b border-gray-200/50 dark:border-slate-600/50">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
              </div>
            )}
            
            {items.map((item, index) => (
              item.onClick ? (
                <button
                  key={index}
                  onClick={() => {
                    item.onClick();
                    setIsAdminDropdownOpen(false);
                    setIsSalesDropdownOpen(false);
                    setIsLeadsDropdownOpen(false);
                    setIsProfileDropdownOpen(false);
                  }}
                  className="group w-full text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-200 ease-out flex items-center rounded-xl mx-2"
                >
                  {item.icon && <item.icon className="mr-3 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />}
                  <span className="group-hover:translate-x-1 transition-transform duration-200">{item.label}</span>
                </button>
              ) : (
                <Link
                  key={index}
                  to={item.path}
                  className="group block px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-200 ease-out flex items-center rounded-xl mx-2"
                  onClick={() => {
                    setIsAdminDropdownOpen(false);
                    setIsSalesDropdownOpen(false);
                    setIsLeadsDropdownOpen(false);
                    setIsProfileDropdownOpen(false);
                  }}
                >
                  {item.icon && <item.icon className="mr-3 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />}
                  <span className="group-hover:translate-x-1 transition-transform duration-200">{item.label}</span>
                </Link>
              )
            ))}
          </div>
        </>
      )}
    </div>
  );

  // Define dropdown items with icons
  const adminItems = [
    { label: 'Dashboard', path: '/admin', icon: FaHome },
    { label: 'Manage Users', path: '/admin/users', icon: FaUsers },
    { label: 'Manage Leads', path: '/admin/leads', icon: FaChartLine },
    { label: 'Import Data', path: '/admin/import', icon: FaUsers },
    { label: 'Activity Logs', path: '/admin/activity-logs', icon: FaBell }
  ];

  const salesItems = [
    { label: 'Sales Tracking', path: '/sales-tracking', icon: FaChartLine },
    { label: 'Prospects', path: '/prospects', icon: FaUsers }
  ];

  const leadsItems = [
    { label: 'Leads', path: '/leads', icon: FaUsers },
    { label: 'Lead Sales Sheet', path: '/lead-sales-sheet', icon: FaChartLine }
  ];

  const profileItems = [
    { label: 'Profile', path: '/profile', icon: FaUser },
    { label: 'Settings', path: '/settings', icon: FaCog },
    { 
      label: 'Logout',
      path: '#',
      onClick: handleLogout,
      icon: FaSignOutAlt
    }
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        isScrolled 
          ? 'navbar-glass-dark shadow-lg' 
          : 'bg-gradient-to-r from-blue-600/95 via-purple-600/95 to-indigo-700/95'
      }`}>
                 <nav className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
           <div className="flex justify-between items-center h-16 sm:h-20">
            
                         {/* Logo Section */}
             <Link to="/" className="group flex items-center space-x-1 sm:space-x-2 md:space-x-4 hover:scale-105 transition-transform duration-300">
               <div className="relative">
                 <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                 <div className="relative bg-white/10 backdrop-blur-sm p-1 sm:p-1.5 md:p-2 rounded-2xl border border-white/20">
                   <img src={logo} alt="Traincape Technology" className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 rounded-xl" />
                   <FaRocket className="absolute -top-1 -right-1 text-yellow-400 text-xs animate-pulse" />
                 </div>
               </div>
               <div className="block">
                 <span className={`text-sm sm:text-lg md:text-xl font-black tracking-tight ${
                   isScrolled 
                     ? 'text-gradient' 
                     : 'text-white'
                 }`}>
                   TrainCape
                 </span>
                 <div className={`text-xs font-medium ${
                   isScrolled 
                     ? 'text-gray-600 dark:text-gray-400' 
                     : 'text-blue-100'
                 }`}>
                   CRM Technology
                 </div>
               </div>
             </Link>

                         {/* Mobile Menu Button */}
             <button 
               className={`lg:hidden p-1 rounded-xl transition-all duration-300 ${
                 isScrolled 
                   ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700' 
                   : 'text-white hover:bg-white/10'
               }`}
               onClick={toggleMenu}
             >
               <svg className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 transition-transform duration-300 ${isMenuOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
               </svg>
             </button>

            {/* Desktop Navigation - Responsive */}
            <div className="hidden lg:flex items-center space-x-2">
              <Link 
                to="/" 
                className={`nav-link-hover flex items-center px-3 sm:px-4 py-2 rounded-xl font-medium transition-all duration-300 ease-out text-sm sm:text-base ${
                  isScrolled 
                    ? 'text-gray-700 dark:text-gray-300 hover:text-blue-600' 
                    : 'text-white/90 hover:text-white'
                }`}
              >
                <FaHome className="mr-1.5 sm:mr-2 text-sm" />
                Home
              </Link>

              {user && user.role === "Customer" && (
                <Link 
                  to="/customer" 
                  className={`nav-link-hover flex items-center px-3 sm:px-4 py-2 rounded-xl font-medium transition-all duration-300 ease-out text-sm sm:text-base ${
                    isScrolled 
                      ? 'text-gray-700 dark:text-gray-300 hover:text-blue-600' 
                      : 'text-white/90 hover:text-white'
                  }`}
                >
                  <FaHome className="mr-1.5 sm:mr-2 text-sm" />
                  Dashboard
                </Link>
              )}

              {user && (user.role === "Sales Person" || user.role === "Manager" || user.role === "Admin") && (
                <DropdownMenu
                  isOpen={isSalesDropdownOpen}
                  items={salesItems}
                  title="Sales"
                  reference={salesDropdownRef}
                  icon={FaChartLine}
                />
              )}

              {user && (user.role === "Lead Person" || user.role === "Manager" || user.role === "Admin") && (
                <DropdownMenu
                  isOpen={isLeadsDropdownOpen}
                  items={leadsItems}
                  title="Leads"
                  reference={leadsDropdownRef}
                  icon={FaUsers}
                />
              )}

              {user && user.role === "Admin" && (
                <DropdownMenu
                  isOpen={isAdminDropdownOpen}
                  items={adminItems}
                  title="Admin"
                  reference={adminDropdownRef}
                  icon={FaCog}
                />
              )}
            </div>

                         {/* Right Side Items - Responsive */}
             <div className="flex items-center space-x-1">
               {/* Search and Notifications - Always visible */}
               <button className={`p-1 rounded-xl transition-all duration-300 ${
                 isScrolled 
                   ? 'text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700' 
                   : 'text-white/80 hover:text-white hover:bg-white/10'
               }`}>
                 <FaSearch className="text-xs sm:text-sm" />
               </button>

               <button className={`relative p-1 rounded-xl transition-all duration-300 ${
                 isScrolled 
                   ? 'text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700' 
                   : 'text-white/80 hover:text-white hover:bg-white/10'
               }`}>
                 <FaBell className="text-xs sm:text-sm" />
                 <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full notification-pulse"></div>
               </button>

               {/* Utility Components - Hidden on very small screens */}
               <div className="hidden sm:flex utility-container items-center space-x-1">
                 <CurrencySelector />
                 <div className="w-px h-3 bg-white/20"></div>
                 <ThemeToggle />
                 <div className="w-px h-3 bg-white/20"></div>
                 <ActivityTimer />
               </div>

               {/* User Profile - Responsive */}
               {user ? (
                 <div className="flex items-center space-x-1">
                   <div className={`hidden sm:block text-right ${
                     isScrolled 
                       ? 'text-gray-700 dark:text-gray-300' 
                       : 'text-white'
                   }`}>
                     <div className="text-xs font-semibold">{user.fullName}</div>
                     <div className={`text-xs ${
                       isScrolled 
                         ? 'text-gray-500 dark:text-gray-400' 
                         : 'text-blue-100'
                     }`}>
                       {user.role}
                     </div>
                   </div>
                   
                   <DropdownMenu
                     isOpen={isProfileDropdownOpen}
                     items={profileItems}
                     title=""
                     reference={profileDropdownRef}
                   />
                   
                   <div className="avatar-glow">
                     <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-semibold text-xs">
                       {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                     </div>
                     <div className="absolute -bottom-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-green-400 border-2 border-white dark:border-slate-800 rounded-full"></div>
                   </div>
                 </div>
               ) : (
                 <Link 
                   to="/login" 
                   className="group px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-gradient-to-r from-white to-blue-50 text-blue-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 border border-white/20 text-xs"
                 >
                   <span className="flex items-center">
                     <FaUser className="mr-1 text-xs" />
                     <span className="hidden sm:inline">Sign In</span>
                     <span className="sm:hidden">Login</span>
                   </span>
                 </Link>
               )}
             </div>
          </div>

          {/* Mobile Menu */}
          <div className={`lg:hidden transition-all duration-500 ease-out overflow-hidden ${
            isMenuOpen ? 'mobile-menu-enter max-h-screen opacity-100 pb-6' : 'max-h-0 opacity-0'
          }`}>
            <div className="pt-4 border-t border-white/20 dark:border-slate-700/50">
              <div className="space-y-2">
                <Link 
                  to="/" 
                  className={`nav-link-hover flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    isScrolled 
                      ? 'text-gray-700 dark:text-gray-300' 
                      : 'text-white/90'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaHome className="mr-3 text-sm" />
                  Home
                </Link>

                {user && user.role === "Customer" && (
                  <Link 
                    to="/customer" 
                    className={`nav-link-hover flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                      isScrolled 
                        ? 'text-gray-700 dark:text-gray-300' 
                        : 'text-white/90'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaHome className="mr-3 text-sm" />
                    Dashboard
                  </Link>
                )}

                {/* Mobile Sales Links */}
                {user && (user.role === "Sales Person" || user.role === "Manager" || user.role === "Admin") && (
                  <div className="space-y-1">
                    <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider ${
                      isScrolled 
                        ? 'text-gray-500 dark:text-gray-400' 
                        : 'text-blue-200'
                    }`}>
                      Sales
                    </div>
                    {salesItems.map((item, index) => (
                      <Link
                        key={index}
                        to={item.path}
                        className={`nav-link-hover flex items-center px-6 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                          isScrolled 
                            ? 'text-gray-600 dark:text-gray-400' 
                            : 'text-white/80'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <item.icon className="mr-3 text-xs" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Mobile Leads Links */}
                {user && (user.role === "Lead Person" || user.role === "Manager" || user.role === "Admin") && (
                  <div className="space-y-1">
                    <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider ${
                      isScrolled 
                        ? 'text-gray-500 dark:text-gray-400' 
                        : 'text-blue-200'
                    }`}>
                      Leads
                    </div>
                    {leadsItems.map((item, index) => (
                      <Link
                        key={index}
                        to={item.path}
                        className={`nav-link-hover flex items-center px-6 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                          isScrolled 
                            ? 'text-gray-600 dark:text-gray-400' 
                            : 'text-white/80'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <item.icon className="mr-3 text-xs" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Mobile Admin Links */}
                {user && user.role === "Admin" && (
                  <div className="space-y-1">
                    <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider ${
                      isScrolled 
                        ? 'text-gray-500 dark:text-gray-400' 
                        : 'text-blue-200'
                    }`}>
                      Admin
                    </div>
                    {adminItems.map((item, index) => (
                      <Link
                        key={index}
                        to={item.path}
                        className={`nav-link-hover flex items-center px-6 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                          isScrolled 
                            ? 'text-gray-600 dark:text-gray-400' 
                            : 'text-white/80'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <item.icon className="mr-3 text-xs" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile User Section */}
              <div className="mt-6 pt-4 border-t border-white/20 dark:border-slate-700/50">
                {user ? (
                  <div className="space-y-2">
                    <div className={`px-4 py-3 rounded-xl ${
                      isScrolled 
                        ? 'bg-gray-50 dark:bg-slate-800' 
                        : 'bg-white/10'
                    }`}>
                      <div className={`font-semibold ${
                        isScrolled 
                          ? 'text-gray-900 dark:text-white' 
                          : 'text-white'
                      }`}>
                        {user.fullName}
                      </div>
                      <div className={`text-sm ${
                        isScrolled 
                          ? 'text-gray-600 dark:text-gray-400' 
                          : 'text-blue-100'
                      }`}>
                        {user.role}
                      </div>
                    </div>
                    
                    {profileItems.map((item, index) => (
                      item.onClick ? (
                        <button
                          key={index}
                          onClick={() => {
                            item.onClick();
                            setIsMenuOpen(false);
                          }}
                          className={`w-full nav-link-hover flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                            isScrolled 
                              ? 'text-gray-600 dark:text-gray-400 hover:text-red-600' 
                              : 'text-white/80 hover:text-red-200'
                          }`}
                        >
                          <item.icon className="mr-3 text-sm" />
                          {item.label}
                        </button>
                      ) : (
                        <Link
                          key={index}
                          to={item.path}
                          className={`nav-link-hover flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                            isScrolled 
                              ? 'text-gray-600 dark:text-gray-400' 
                              : 'text-white/80'
                          }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <item.icon className="mr-3 text-sm" />
                          {item.label}
                        </Link>
                      )
                    ))}
                  </div>
                ) : (
                  <Link 
                    to="/login" 
                    className={`flex items-center justify-center px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      isScrolled 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-white text-blue-600 hover:bg-blue-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaUser className="mr-2 text-sm" />
                    Sign In
                  </Link>
                )}
              </div>

              {/* Mobile Utility Components */}
              <div className={`mt-4 pt-4 border-t border-white/20 dark:border-slate-700/50 flex items-center justify-center space-x-4 ${
                isScrolled 
                  ? 'text-gray-600 dark:text-gray-400' 
                  : 'text-white/80'
              }`}>
                <CurrencySelector />
                <ThemeToggle />
                <ActivityTimer />
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-16 sm:h-20"></div>
    </>
  );
};

export default Navbar;