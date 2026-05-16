import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LogOut, User as UserIcon, Menu, Sun, Moon, Search } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
}

/* Map route → page title */
const PAGE_TITLES: Record<string, string> = {
  '/':         'Dashboard',
  '/projects': 'Projects',
  '/tasks':    'Task Board',
  '/users':    'User Management',
  '/settings': 'Settings',
  '/profile':  'My Profile',
};

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout }   = useAuth();
  const { theme, setTheme } = useTheme();
  const location            = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Team Task Manager';

  /* close dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || '?';

  return (
    <header className="sticky top-0 z-30">
      {/* ── Gradient band ── */}
      <div
        className="flex items-center justify-between h-16 px-4 sm:px-6"
        style={{ background: 'var(--header-bg)' }}
      >
        {/* Left: hamburger + breadcrumb */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            onClick={onMenuClick}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile logo */}
          <span className="lg:hidden text-sm font-black leading-tight"
            style={{ background: 'var(--logo-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Team Task Manager
          </span>

          {/* Desktop page title */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="w-1.5 h-5 rounded-full"
              style={{ background: 'var(--logo-text)' }} />
            <h1 className="text-sm font-bold text-white/80 tracking-wide">{pageTitle}</h1>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">

          {/* Search button */}
          <button className="hidden sm:flex w-9 h-9 items-center justify-center rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors">
            <Search className="w-4 h-4" />
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : (theme === 'dark' ? 'midnight' : (theme === 'midnight' ? 'forest' : 'light')))}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Profile avatar + dropdown */}
          <div className="relative ml-1" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-white/10 transition-colors group"
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                style={{ background: 'var(--avatar-bg)' }}>
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-white/85 leading-none">{user?.full_name?.split(' ')[0] || 'User'}</p>
                <p className="text-[10px] text-white/40 mt-0.5 capitalize">{user?.role}</p>
              </div>
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-2xl shadow-2xl overflow-hidden border border-white/10"
                style={{ background: 'var(--header-bg)' }}>
                {/* User info */}
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-sm font-bold text-white truncate">{user?.full_name || 'User'}</p>
                  <p className="text-xs text-white/40 truncate mt-0.5">{user?.email}</p>
                  <span className="inline-flex mt-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wide"
                    style={{ background: user?.role === 'admin' ? 'rgba(167,139,250,0.2)' : 'rgba(34,211,238,0.15)', color: user?.role === 'admin' ? '#c4b5fd' : '#22d3ee' }}>
                    {user?.role}
                  </span>
                </div>

                <Link to="/profile" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/8 transition-colors">
                  <UserIcon className="w-4 h-4" />
                  My Profile
                </Link>

                <button onClick={logout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors border-t border-white/10">
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Thin rainbow underline ── */}
      <div className="h-0.5"
        style={{ background: 'linear-gradient(90deg,#7c3aed,#06b6d4,#a78bfa,#e879f9,#fbbf24)' }} />
    </header>
  );
};
