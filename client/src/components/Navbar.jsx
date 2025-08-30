import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CurrencySelector from "./CurrencySelector";
import ThemeToggle from "./ThemeToggle";
import ActivityTimer from "./ActivityTimer/ActivityTimer";
import logo from "../assets/traincape-logo.jpg";
import "../styles/navbar.css";
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
  FaBars,
  FaTimes,
} from "react-icons/fa";

/* ---------- Small helpers ---------- */

const NavLink = ({ to, children, isScrolled, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`nav-link-hover px-4 py-2 rounded-xl font-medium transition-all ${
      isScrolled
        ? "text-gray-700 dark:text-gray-300 hover:text-blue-600"
        : "text-white/90 hover:text-white"
    }`}
  >
    {children}
  </Link>
);

// Desktop dropdown trigger (no ref prop here)
const MenuButton = ({ id, title, icon: Icon, isScrolled, openMenu, setOpenMenu }) => (
  <button
    onClick={() => setOpenMenu(openMenu === id ? null : id)}
    className={`group flex items-center px-4 py-2 rounded-xl transition-all duration-300 border border-transparent ${
      isScrolled
        ? "text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 hover:border-blue-200 dark:hover:border-slate-600"
        : "text-white/90 hover:text-white hover:bg-white/10 hover:border-white/20"
    }`}
  >
    {Icon && <Icon className="mr-2 text-sm" />}
    <span className="font-medium">{title}</span>
    <svg
      className={`ml-2 h-4 w-4 transition-transform ${openMenu === id ? "rotate-180" : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>
);

// Desktop dropdown
const Dropdown = ({ items, setOpenMenu, align = "left" }) => (
  <div
  className={`absolute top-12 right-0 mt-2 w-56 rounded-2xl shadow-xl z-50 
              backdrop-blur-md bg-slate-900/90 border border-white/10`}
  role="menu"
>

    <div className="py-2">
      {items.map((item, i) =>
        item.onClick ? (
          <button
            key={i}
            onClick={() => {
              item.onClick();
              setOpenMenu(null);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200 
                       font-medium rounded-lg transition-colors duration-200
                       hover:bg-white/10 hover:text-white"
            role="menuitem"
          >
            <item.icon className="opacity-70" size={16} />
            {item.label}
          </button>
        ) : (
          <Link
            key={i}
            to={item.path}
            onClick={() => setOpenMenu(null)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200 
                       font-medium rounded-lg transition-colors duration-200
                       hover:bg-white/10 hover:text-white"
            role="menuitem"
          >
            <item.icon className="opacity-70" size={16} />
            {item.label}
          </Link>
        )
      )}
    </div>
  </div>
);



const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null); // 'sales' | 'leads' | 'admin' | 'profile' | null

  // Refs wrapping each dropdown group so inside clicks are allowed
  const dropdownRefs = {
    sales: useRef(null),
    leads: useRef(null),
    admin: useRef(null),
    profile: useRef(null),
  };

  // Mobile accordion state
  const [acc, setAcc] = useState({ sales: true, leads: true, admin: true });

  /* ---------- Effects ---------- */

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ✅ Proper outside-click: only check the currently open menu
  useEffect(() => {
    const onDown = (e) => {
      if (!openMenu) return;
      const wrapper = dropdownRefs[openMenu]?.current;
      if (wrapper && !wrapper.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openMenu]);

  // Prevent body scroll when drawer open (iOS-safe)
  useEffect(() => {
    document.body.classList.toggle("no-scroll", isDrawerOpen);
    return () => document.body.classList.remove("no-scroll");
  }, [isDrawerOpen]);

  // ESC to close drawer
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setIsDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ---------- Data ---------- */

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsDrawerOpen(false);
    setOpenMenu(null);
  };

  const salesItems = [
    { label: "Sales Tracking", path: "/sales-tracking", icon: FaChartLine },
    { label: "Prospects", path: "/prospects", icon: FaUsers },
  ];
  const leadsItems = [
    { label: "Leads", path: "/leads", icon: FaUsers },
    { label: "Lead Sales Sheet", path: "/lead-sales-sheet", icon: FaChartLine },
  ];
  const adminItems = [
    { label: "Dashboard", path: "/admin", icon: FaHome },
    { label: "Manage Users", path: "/admin/users", icon: FaUsers },
    { label: "Manage Leads", path: "/admin/leads", icon: FaChartLine },
    { label: "Import Data", path: "/admin/import", icon: FaUsers },
    { label: "Activity Logs", path: "/admin/activity-logs", icon: FaBell },
  ];
  const profileItems = [
    { label: "Profile", path: "/profile", icon: FaUser },
    { label: "Settings", path: "/settings", icon: FaCog },
    { label: "Logout", onClick: handleLogout, icon: FaSignOutAlt },
  ];

  /* ---------- Render ---------- */

  return (
    <>
      {/* Top bar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "navbar-glass-dark shadow-lg"
            : "bg-gradient-to-r from-blue-600/95 via-purple-600/95 to-indigo-700/95"
        }`}
      >
        <nav className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <Link
              to="/"
              className="group flex items-center space-x-2 md:space-x-3 hover:scale-[1.02] transition-transform"
              onClick={() => setOpenMenu(null)}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur opacity-70 group-hover:opacity-100" />
                <div className="relative bg-white/10 backdrop-blur-sm p-1.5 md:p-2 rounded-2xl border border-white/20">
                  <img src={logo} alt="TrainCape" className="h-8 w-8 md:h-10 md:w-10 rounded-xl" />
                  <FaRocket className="absolute -top-1 -right-1 text-yellow-400 text-xs animate-pulse" />
                </div>
              </div>
              <div>
                <span className={`text-lg md:text-xl font-black ${isScrolled ? "text-gradient" : "text-white"}`}>
                  TrainCape
                </span>
                <div className={`${isScrolled ? "opacity-70" : "text-blue-100"} text-xs`}>CRM Technology</div>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center space-x-2">
              <NavLink to="/" isScrolled={isScrolled} onClick={() => setOpenMenu(null)}>
                <FaHome className="inline mr-2 -mt-0.5" /> Home
              </NavLink>

              {user && user.role === "Customer" && (
                <NavLink to="/customer" isScrolled={isScrolled} onClick={() => setOpenMenu(null)}>
                  <FaHome className="inline mr-2 -mt-0.5" /> Dashboard
                </NavLink>
              )}

              {user && ["Sales Person", "Manager", "Admin"].includes(user.role) && (
                <div className="relative" ref={dropdownRefs.sales}>
                  <MenuButton
                    id="sales"
                    title="Sales"
                    icon={FaChartLine}
                    isScrolled={isScrolled}
                    openMenu={openMenu}
                    setOpenMenu={setOpenMenu}
                  />
                  {openMenu === "sales" && (
                    <Dropdown
                      title="Sales"
                      items={salesItems}
                      isScrolled={isScrolled}
                      setOpenMenu={setOpenMenu}
                      align="left"
                    />
                  )}
                </div>
              )}

              {user && ["Lead Person", "Manager", "Admin"].includes(user.role) && (
                <div className="relative" ref={dropdownRefs.leads}>
                  <MenuButton
                    id="leads"
                    title="Leads"
                    icon={FaUsers}
                    isScrolled={isScrolled}
                    openMenu={openMenu}
                    setOpenMenu={setOpenMenu}
                  />
                  {openMenu === "leads" && (
                    <Dropdown
                      title="Leads"
                      items={leadsItems}
                      isScrolled={isScrolled}
                      setOpenMenu={setOpenMenu}
                      align="left"
                    />
                  )}
                </div>
              )}

              {user && user.role === "Admin" && (
                <div className="relative" ref={dropdownRefs.admin}>
                  <MenuButton
                    id="admin"
                    title="Admin"
                    icon={FaCog}
                    isScrolled={isScrolled}
                    openMenu={openMenu}
                    setOpenMenu={setOpenMenu}
                  />
                  {openMenu === "admin" && (
                    <Dropdown
                      title="Admin"
                      items={adminItems}
                      isScrolled={isScrolled}
                      setOpenMenu={setOpenMenu}
                      align="left"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              <button className={`p-2 rounded-lg ${isScrolled ? "text-gray-700/80" : "text-white/90"} hidden md:block`}>
                <FaSearch />
              </button>
              <button className={`p-2 rounded-lg ${isScrolled ? "text-gray-700/80" : "text-white/90"} hidden md:block`}>
                <FaBell />
              </button>

              {/* Desktop utilities (currency only on desktop) */}
              <div className="hidden lg:flex items-center gap-2 utility-container">
                <CurrencySelector />
                <div className="w-px h-4 bg-white/20" />
                <ThemeToggle />
                <div className="w-px h-4 bg-white/20" />
                <ActivityTimer />
              </div>

              {/* Desktop profile */}
              {user && (
                <div className="hidden lg:flex items-center gap-2 relative" ref={dropdownRefs.profile}>
                  <button
                    onClick={() => setOpenMenu(openMenu === "profile" ? null : "profile")}
                    className={`px-2 py-1 rounded-lg border border-transparent ${
                      isScrolled
                        ? "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-slate-700"
                        : "text-white/90 hover:bg-white/10"
                    }`}
                    aria-haspopup="true"
                    aria-expanded={openMenu === "profile"}
                  >
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold">{user.fullName}</div>
                      <div className="avatar-glow relative">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-semibold text-xs">
                          {user.fullName?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-400 border-2 border-white rounded-full" />
                      </div>
                    </div>
                  </button>
                  {openMenu === "profile" && (
                    <Dropdown
                      title="Profile"
                      items={profileItems}
                      isScrolled={isScrolled}
                      setOpenMenu={setOpenMenu}
                      align="right"
                    />
                  )}
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                className="lg:hidden p-2 rounded-lg text-white focus:outline-none"
                onClick={() => setIsDrawerOpen(true)}
                aria-label="Open menu"
              >
                <FaBars />
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile/Tablet Drawer */}
      {isDrawerOpen && (
        <div className="drawer open" role="dialog" aria-modal="true" aria-label="Main menu">
          <button className="drawer-overlay" onClick={() => setIsDrawerOpen(false)} aria-label="Close menu overlay" />
          <aside className="drawer-panel safe-area">
            <div className="drawer-header">
              <div className="flex items-center gap-2">
                <img src={logo} alt="TrainCape" className="h-8 w-8 rounded-xl" />
                <div className="leading-tight">
                  <div className="text-white font-bold">TrainCape</div>
                  <div className="text-white/70 text-xs">CRM Technology</div>
                </div>
              </div>
              <button className="drawer-close" onClick={() => setIsDrawerOpen(false)} aria-label="Close menu">
                <FaTimes />
              </button>
            </div>

            <div className="menu-scroll">
              <Link to="/" className="drawer-link" onClick={() => setIsDrawerOpen(false)}>
                <FaHome className="mr-3" /> Home
              </Link>

              {user && user.role === "Customer" && (
                <Link to="/customer" className="drawer-link" onClick={() => setIsDrawerOpen(false)}>
                  <FaHome className="mr-3" /> Dashboard
                </Link>
              )}

              {user && ["Sales Person", "Manager", "Admin"].includes(user.role) && (
                <div className="drawer-section">
                  <button className="drawer-section-btn" onClick={() => setAcc((s) => ({ ...s, sales: !s.sales }))}>
                    <FaChartLine className="mr-3" /> Sales
                    <span className={`ml-auto chevron ${acc.sales ? "open" : ""}`} />
                  </button>
                  {acc.sales && (
                    <div className="drawer-sub">
                      {salesItems.map((it, i) => (
                        <Link key={i} to={it.path} className="drawer-sublink" onClick={() => setIsDrawerOpen(false)}>
                          <it.icon className="mr-3 opacity-80" />
                          {it.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {user && ["Lead Person", "Manager", "Admin"].includes(user.role) && (
                <div className="drawer-section">
                  <button className="drawer-section-btn" onClick={() => setAcc((s) => ({ ...s, leads: !s.leads }))}>
                    <FaUsers className="mr-3" /> Leads
                    <span className={`ml-auto chevron ${acc.leads ? "open" : ""}`} />
                  </button>
                  {acc.leads && (
                    <div className="drawer-sub">
                      {leadsItems.map((it, i) => (
                        <Link key={i} to={it.path} className="drawer-sublink" onClick={() => setIsDrawerOpen(false)}>
                          <it.icon className="mr-3 opacity-80" />
                          {it.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {user && user.role === "Admin" && (
                <div className="drawer-section">
                  <button className="drawer-section-btn" onClick={() => setAcc((s) => ({ ...s, admin: !s.admin }))}>
                    <FaCog className="mr-3" /> Admin
                    <span className={`ml-auto chevron ${acc.admin ? "open" : ""}`} />
                  </button>
                  {acc.admin && (
                    <div className="drawer-sub">
                      {adminItems.map((it, i) => (
                        <Link key={i} to={it.path} className="drawer-sublink" onClick={() => setIsDrawerOpen(false)}>
                          <it.icon className="mr-3 opacity-80" />
                          {it.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="drawer-footer">
              <div className="flex items-center justify-center gap-3 mb-3">
                {/* CurrencySelector intentionally not included on mobile/tablet */}
                <ThemeToggle />
                <ActivityTimer />
              </div>
              {user ? (
                <button className="logout" onClick={handleLogout}>
                  <FaSignOutAlt className="mr-2" />
                  Logout
                </button>
              ) : (
                <Link to="/login" className="signin" onClick={() => setIsDrawerOpen(false)}>
                  <FaUser className="mr-2" />
                  Sign In
                </Link>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Spacer under fixed header */}
      <div className="h-16 sm:h-20" />
    </>
  );
};

export default Navbar;
