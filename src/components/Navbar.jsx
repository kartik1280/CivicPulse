// src/components/Navbar.jsx
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggleDark } from '../store/uiSlice';
import { useAuth } from '../contexts/AuthContext';

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.66-9h-1M4.34 12h-1m15.07-6.07-.7.7M6.34 17.66l-.7.7m12.02 0-.7-.7M6.34 6.34l-.7-.7M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
  </svg>
);
const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
  </svg>
);
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);
const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0-4-4m4 4H7m6 4v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1" />
  </svg>
);

function Navbar() {
  const dispatch    = useDispatch();
  const darkMode    = useSelector((s) => s.ui.darkMode);
  const { currentUser, logout } = useAuth();
  const navigate    = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium px-3 py-2 rounded-lg transition-colors duration-200 ${
      isActive
        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
        : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-surface-100 dark:hover:bg-surface-800'
    }`;

  return (
    <nav className="sticky top-0 z-50 glass border-b border-surface-200/60 dark:border-surface-700/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/rooms" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <span className="text-white text-sm font-bold">CP</span>
            </div>
            <span className="font-bold text-lg gradient-text hidden sm:block">CivicPulse</span>
          </Link>

          {/* Desktop nav */}
          {currentUser && (
            <div className="hidden md:flex items-center gap-1">
              <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
              <NavLink to="/rooms"     className={navLinkClass}>Rooms</NavLink>
            </div>
          )}

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              id="dark-mode-toggle"
              onClick={() => dispatch(toggleDark())}
              className="btn-icon btn-ghost text-surface-500 dark:text-surface-400"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <SunIcon /> : <MoonIcon />}
            </button>

            {currentUser && (
              <>
                {/* User badge */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-100 dark:bg-surface-800">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {(currentUser.displayName || currentUser.email || '?')[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-surface-700 dark:text-surface-300 max-w-[120px] truncate">
                    {currentUser.displayName || currentUser.email}
                  </span>
                </div>

                {/* Logout */}
                <button
                  id="logout-btn"
                  onClick={handleLogout}
                  className="btn-ghost btn-sm hidden sm:flex items-center gap-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogoutIcon />
                  <span>Logout</span>
                </button>

                {/* Mobile hamburger */}
                <button
                  className="btn-icon btn-ghost md:hidden"
                  onClick={() => setMobileOpen((v) => !v)}
                  aria-label="Open menu"
                >
                  {mobileOpen ? <XIcon /> : <MenuIcon />}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && currentUser && (
        <div className="md:hidden border-t border-surface-200 dark:border-surface-700 bg-white/95 dark:bg-surface-900/95 backdrop-blur-xl animate-slide-up">
          <div className="px-4 py-3 space-y-1">
            <NavLink to="/dashboard" className={navLinkClass} onClick={() => setMobileOpen(false)}>Dashboard</NavLink>
            <NavLink to="/rooms"     className={navLinkClass} onClick={() => setMobileOpen(false)}>Rooms</NavLink>
            <div className="pt-2 border-t border-surface-200 dark:border-surface-700 mt-2">
              <p className="text-xs text-surface-400 dark:text-surface-500 mb-2 px-3">
                {currentUser.displayName || currentUser.email}
              </p>
              <button
                onClick={() => { handleLogout(); setMobileOpen(false); }}
                className="btn-ghost btn-sm w-full justify-start text-red-500"
              >
                <LogoutIcon /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
