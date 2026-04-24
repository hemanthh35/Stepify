import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const linkClass = ({ isActive }) =>
  `text-sm font-medium transition ${isActive ? 'text-accent' : 'text-ink hover:text-accent'}`;

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="border-b border-line bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="text-lg font-semibold tracking-tight text-ink">
          Stepify
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6" aria-label="Main">
          <NavLink to="/" className={linkClass} end>
            Home
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" className={linkClass}>
                Dashboard
              </NavLink>
              <span className="hidden text-sm text-gray-500 sm:inline" title={user?.email}>
                {user?.email}
              </span>
              <button type="button" onClick={logout} className="btn-secondary px-4 py-2 text-xs sm:text-sm">
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Log in
              </NavLink>
              <Link to="/signup" className="btn-primary px-4 py-2 text-xs sm:text-sm">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
