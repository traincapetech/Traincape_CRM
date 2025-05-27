// src/components/Navbar.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CurrencySelector from "./CurrencySelector";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-blue-600 text-white py-4 shadow-md">
      <nav className="container mx-auto flex justify-between items-center">
        <a href="/"> <h1 className="text-xl font-bold">My CRM</h1></a>
        <button 
          className="text-white md:hidden" 
          onClick={toggleMenu}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
          </svg>
        </button>
        <ul className={`flex-col md:flex-row md:flex space-x-4 ${isMenuOpen ? 'flex' : 'hidden'} md:flex`}>
          {/* Home link accessible to all */}
          <li>
            <Link to="/" className="hover:text-blue-300">Home</Link>
          </li>
          
          {/* Management Contacts link accessible to all */}
          {/* <li>
            <Link to="/management-contacts" className="hover:text-blue-300">Contacts</Link>
          </li> */}

          {/* Lead Person, Manager, and Admin can access Leads page */}
          {user && (user.role === "Lead Person" || user.role === "Manager" || user.role === "Admin") && (
            <li>
              <Link to="/leads" className="hover:text-blue-300">Leads</Link>
            </li>
          )}

          {/* Lead Person can access Lead Sales Sheet and Update Sales */}
          {user && (user.role === "Lead Person" || user.role === "Manager" || user.role === "Admin") && (
            <>
              <li>
                <Link to="/lead-sales-sheet" className="hover:text-blue-300">Lead Sales Sheet</Link>
              </li>
              {/* <li>
                <Link to="/update-sales" className="hover:text-blue-300">Update Sales</Link>
              </li> */}
            </>
          )}

          {/* Sales Person can access Sales page */}
          {user && user.role === "Sales Person" && (
            <li>
              <Link to="/sales" className="hover:text-blue-300">My Leads</Link>
            </li>
          )}
          
          {/* Sales Person, Manager, and Admin can access Sales Tracking */}
          {user && (user.role === "Sales Person" || user.role === "Manager" || user.role === "Admin") && (
            <li>
              <Link to="/sales-tracking" className="hover:text-blue-300">Sales Tracking</Link>
            </li>
          )}

          {/* Admin only links */}
          {user && user.role === "Admin" && (
            <>
              <li>
                <Link to="/admin" className="hover:text-blue-300">Admin Dashboard</Link>
              </li>
              <li>
                <Link to="/admin/users" className="hover:text-blue-300">Manage Users</Link>
              </li>
              <li>
                <Link to="/admin/leads" className="hover:text-blue-300">Manage Leads</Link>
              </li>
              <li>
                <Link to="/admin/import" className="hover:text-blue-300">Import Data</Link>
              </li>
            </>
          )}

          {/* Currency Selector */}
          <li className="ml-4">
            <CurrencySelector />
          </li>

          {/* Profile and Logout buttons for authenticated users */}
          {user ? (
            <>
              <li>
                <Link to="/profile" className="hover:text-blue-300">Profile</Link>
              </li>
              <li>
                <button 
                  onClick={handleLogout} 
                  className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded-md transition duration-300"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link to="/login" className="hover:text-blue-300">Login</Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
