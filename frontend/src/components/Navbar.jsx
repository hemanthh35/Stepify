import { useMemo, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const linkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-violet-50 text-accent' : 'text-ink hover:bg-surfaceMuted hover:text-accent'
  }`;

export function Navbar() {
  const { isAuthenticated, loading, token, user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const isRestoringSession = loading && Boolean(token);
  const showAuthenticatedNav = isAuthenticated || isRestoringSession;

  const userInitials = useMemo(() => {
    if (!user?.email) return 'ST';
    const name = user.email.split('@')[0];
    return name.slice(0, 2).toUpperCase();
  }, [user?.email]);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-white/90 backdrop-blur-md">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accentMuted to-transparent" />
      <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="group inline-flex items-center gap-3" onClick={closeMenu}>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-violet-400 text-sm font-semibold text-white shadow-sm transition group-hover:scale-105">
              SF
            </span>
            <span className="text-lg font-semibold tracking-tight text-ink">Stepify</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="btn-secondary px-3 py-2 text-xs md:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
          >
            {isOpen ? 'Close' : 'Menu'}
          </button>

          <div className="hidden items-center gap-2 md:flex">
            <nav className="flex items-center gap-1 rounded-xl border border-line bg-white/80 p-1.5 shadow-sm" aria-label="Main">
              <NavLink to="/" className={linkClass} end>
                Home
              </NavLink>
              {showAuthenticatedNav ? (
                <NavLink to="/dashboard" className={linkClass}>
                  Dashboard
                </NavLink>
              ) : null}
            </nav>

            {showAuthenticatedNav ? (
              <div className="ml-2 flex items-center gap-2 rounded-xl border border-line bg-white/80 p-1.5 shadow-sm">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-xs font-semibold text-accent">
                  {isRestoringSession ? '...' : userInitials}
                </span>
                <span className="max-w-[180px] truncate text-sm text-gray-600" title={user?.email}>
                  {isRestoringSession ? 'Restoring session...' : user?.email}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  disabled={isRestoringSession}
                  className="btn-secondary px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="ml-2 flex items-center gap-2">
                <NavLink to="/login" className={linkClass}>
                  Log in
                </NavLink>
                <Link to="/signup" className="btn-primary px-4 py-2 text-xs sm:text-sm">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>

        {isOpen ? (
          <div className="mt-3 rounded-xl border border-line bg-white p-3 shadow-sm md:hidden">
            <nav className="space-y-1" aria-label="Mobile">
              <NavLink to="/" className={linkClass} end onClick={closeMenu}>
                Home
              </NavLink>
              {showAuthenticatedNav ? (
                <NavLink to="/dashboard" className={linkClass} onClick={closeMenu}>
                  Dashboard
                </NavLink>
              ) : null}
            </nav>
            <div className="mt-3 border-t border-line pt-3">
              {showAuthenticatedNav ? (
                <div className="space-y-3">
                  <p className="truncate text-sm text-gray-600" title={user?.email}>
                    {isRestoringSession ? 'Restoring session...' : `Signed in as ${user?.email}`}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      logout();
                    }}
                    disabled={isRestoringSession}
                    className="btn-secondary w-full disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <NavLink to="/login" className="btn-secondary w-full" onClick={closeMenu}>
                    Log in
                  </NavLink>
                  <Link to="/signup" className="btn-primary w-full" onClick={closeMenu}>
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
