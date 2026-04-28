import { useState } from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import { useClerk } from '@clerk/clerk-react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/journey', label: 'Journey' },
] as const;

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { signOut } = useClerk();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b border-[var(--color-border-light)]"
      style={{
        background: 'var(--color-surface-glass)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
      aria-label="Main navigation"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          {/* Wordmark */}
          <Link to="/" className="flex items-center gap-0.5 transition-opacity hover:opacity-80">
            <span
              className="tracking-tight text-[var(--color-text)]"
              style={{ fontSize: '1.125rem', fontWeight: 700 }}
            >
              Skill
            </span>
            <span
              className="tracking-tight text-[var(--color-accent)]"
              style={{ fontSize: '1.125rem', fontWeight: 700 }}
            >
              Map
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative rounded-lg px-3 py-1.5 transition-colors ${
                  isActive(link.to)
                    ? 'text-[var(--color-text)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
                style={{ fontSize: 'var(--text-caption)', fontWeight: 500 }}
              >
                {link.label}
                {isActive(link.to) ? (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[var(--color-accent)]" />
                ) : null}
              </Link>
            ))}

            <div className="ml-4 h-5 w-px bg-[var(--color-border)]" />

            <button
              onClick={handleLogout}
              className="btn-ghost ml-2"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="btn-ghost"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-out md:hidden ${
            isMobileMenuOpen ? 'max-h-64 opacity-100 pb-4' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="space-y-1 border-t border-[var(--color-border-light)] pt-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block rounded-lg px-4 py-2.5 transition-colors ${
                  isActive(link.to)
                    ? 'bg-[var(--color-accent-soft)] text-[var(--color-text)]'
                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]'
                }`}
                style={{ fontSize: 'var(--text-body)', fontWeight: 500 }}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]"
              style={{ fontSize: 'var(--text-body)', fontWeight: 500 }}
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
