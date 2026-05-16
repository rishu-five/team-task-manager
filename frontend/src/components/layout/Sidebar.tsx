import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LayoutDashboard, FolderKanban, CheckSquare, Settings, Users, X, Zap } from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/* Icon colour per nav item */
const NAV_COLORS = [
  { active: 'text-cyan-300',   bg: 'bg-cyan-400/20',   glow: '#22d3ee' },
  { active: 'text-violet-300', bg: 'bg-violet-400/20', glow: '#a78bfa' },
  { active: 'text-fuchsia-300',bg: 'bg-fuchsia-400/20',glow: '#e879f9' },
  { active: 'text-amber-300',  bg: 'bg-amber-400/20',  glow: '#fbbf24' },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const themeContext = useTheme();
  const t = themeContext?.t || ((k: string) => k);

  const navigation = [
    { name: t('dashboard'), href: '/',         icon: LayoutDashboard },
    { name: t('projects'),  href: '/projects',  icon: FolderKanban },
    { name: t('tasks'),     href: '/tasks',      icon: CheckSquare },
  ];
  if (user?.role === 'admin') {
    navigation.push({ name: t('users'), href: '/users', icon: Users });
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex flex-col w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ pointerEvents: isOpen || window.innerWidth >= 1024 ? 'auto' : 'none' }}
      >
        {/* ── Background: deep gradient ── */}
        <div className="flex flex-col h-full"
          style={{ background: 'var(--sidebar-bg)' }}>

          {/* Decorative blobs */}
          <div className="absolute top-0 left-0 w-48 h-48 rounded-full opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(circle, var(--brand-primary) 0%, transparent 70%)', filter: 'blur(40px)' }} />
          <div className="absolute bottom-20 right-0 w-40 h-40 rounded-full opacity-15 pointer-events-none"
            style={{ background: 'radial-gradient(circle, var(--brand-secondary) 0%, transparent 70%)', filter: 'blur(40px)' }} />

          {/* ── Logo ── */}
          <div className="flex items-center justify-between px-5 pt-6 pb-2 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--avatar-bg)' }}>
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-black tracking-tight leading-tight"
                style={{ background: 'var(--logo-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Team Task Manager
              </span>
            </div>
            <button onClick={onClose}
              className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── Label ── */}
          <p className="px-5 text-[10px] font-bold tracking-[0.2em] text-white/25 uppercase mt-6 mb-2 relative z-10">
            Navigation
          </p>

          {/* ── Nav items ── */}
          <nav className="flex-1 px-3 space-y-1 relative z-10">
            {navigation.map((item, i) => {
              const col = NAV_COLORS[i % NAV_COLORS.length];
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.href === '/'}
                  onClick={onClose}
                  className={({ isActive }) => clsx(
                    'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                    isActive
                      ? `${col.bg} ${col.active} shadow-lg`
                      : 'text-white/50 hover:text-white/90 hover:bg-white/8'
                  )}
                >
                  {({ isActive }) => (
                    <>
                      <div className={clsx(
                        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all',
                        isActive ? col.bg : 'bg-white/5 group-hover:bg-white/10'
                      )}>
                        <item.icon className={clsx(
                          'w-4 h-4 transition-colors',
                          isActive ? col.active : 'text-white/40 group-hover:text-white/70'
                        )} />
                      </div>
                      <span>{item.name}</span>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full"
                          style={{ background: col.glow, boxShadow: `0 0 6px ${col.glow}` }} />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* ── Settings ── */}
          <div className="px-3 pb-5 relative z-10 border-t border-white/10 pt-4 mt-2">
            <NavLink
              to="/settings"
              onClick={onClose}
              className={({ isActive }) => clsx(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white/90 hover:bg-white/8'
              )}
            >
              {({ isActive }) => (
                <>
                  <div className={clsx(
                    'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                    isActive ? 'bg-white/15' : 'bg-white/5 group-hover:bg-white/10'
                  )}>
                    <Settings className={clsx('w-4 h-4', isActive ? 'text-white' : 'text-white/40 group-hover:text-white/70')} />
                  </div>
                  <span>{t('settings')}</span>
                </>
              )}
            </NavLink>

            {/* User pill at very bottom */}
            {user && (
              <div className="mt-3 flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                  style={{ background: 'var(--avatar-bg)' }}>
                  {initials(user)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white/80 truncate">{user.full_name || 'User'}</p>
                  <p className="text-[10px] text-white/35 truncate">{user.role}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const initials = (user: any) => user?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase();
