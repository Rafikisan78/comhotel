'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from './ui';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  const checkAuth = () => {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');
    setIsLoggedIn(!!token);
    setUserRole(role);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_role');
    setIsLoggedIn(false);
    setUserRole(null);
    router.push('/');
  };

  // Ne pas afficher la navbar sur les pages d'authentification
  if (pathname?.startsWith('/login') || pathname?.startsWith('/register')) {
    return null;
  }

  const isActive = (path: string) => pathname === path;

  const navLinkClass = (path: string) =>
    `px-3 py-2 rounded-md font-medium transition-colors touch-target ${
      isActive(path)
        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
        : 'text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800'
    }`;

  return (
    <nav
      className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50 transition-colors"
      role="navigation"
      aria-label="Navigation principale"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 touch-target">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              Comhotel
            </span>
          </Link>

          {/* Menu burger mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden btn btn-ghost"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            <span className="sr-only">{mobileMenuOpen ? 'Fermer' : 'Ouvrir'} le menu</span>
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Menu de navigation desktop */}
          <div className="hidden md:flex items-center space-x-2">
            <Link href="/" className={navLinkClass('/')}>
              Accueil
            </Link>
            <Link href="/hotels" className={navLinkClass('/hotels')}>
              Hôtels
            </Link>

            {isLoggedIn ? (
              <>
                <Link href="/profile" className={navLinkClass('/profile')}>
                  Profil
                </Link>

                <Link
                  href="/bookings/my-bookings"
                  className={navLinkClass('/bookings/my-bookings')}
                >
                  Mes Réservations
                </Link>

                {(userRole === 'admin' || userRole === 'hotel_owner') && (
                  <>
                    {userRole === 'admin' && (
                      <Link
                        href="/admin/users"
                        className={navLinkClass('/admin/users')}
                      >
                        Utilisateurs
                      </Link>
                    )}
                    <Link
                      href="/admin/hotels"
                      className={navLinkClass('/admin/hotels')}
                    >
                      Gestion Hôtels
                    </Link>
                  </>
                )}

                <div
                  className="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-sm"
                  role="status"
                  aria-label="Statut de connexion"
                >
                  <span
                    className="w-2 h-2 bg-green-500 rounded-full"
                    aria-hidden="true"
                  />
                  <span className="font-medium">
                    {userRole === 'admin'
                      ? 'Admin'
                      : userRole === 'hotel_owner'
                        ? 'Propriétaire'
                        : 'Connecté'}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="btn btn-danger btn-sm"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-secondary btn-sm">
                  Connexion
                </Link>
                <Link href="/register" className="btn btn-primary btn-sm">
                  Inscription
                </Link>
              </>
            )}

            {/* Toggle Dark Mode */}
            <ThemeToggle />
          </div>
        </div>

        {/* Menu mobile */}
        {mobileMenuOpen && (
          <div
            id="mobile-menu"
            className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700 animate-slide-down"
          >
            <div className="flex flex-col space-y-2">
              <Link
                href="/"
                className={navLinkClass('/')}
                onClick={() => setMobileMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link
                href="/hotels"
                className={navLinkClass('/hotels')}
                onClick={() => setMobileMenuOpen(false)}
              >
                Hôtels
              </Link>

              {isLoggedIn ? (
                <>
                  <Link
                    href="/profile"
                    className={navLinkClass('/profile')}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profil
                  </Link>
                  <Link
                    href="/bookings/my-bookings"
                    className={navLinkClass('/bookings/my-bookings')}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mes Réservations
                  </Link>

                  {(userRole === 'admin' || userRole === 'hotel_owner') && (
                    <>
                      {userRole === 'admin' && (
                        <Link
                          href="/admin/users"
                          className={navLinkClass('/admin/users')}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Utilisateurs
                        </Link>
                      )}
                      <Link
                        href="/admin/hotels"
                        className={navLinkClass('/admin/hotels')}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Gestion Hôtels
                      </Link>
                    </>
                  )}

                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="btn btn-danger w-full"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-2">
                  <Link
                    href="/login"
                    className="btn btn-secondary w-full"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    className="btn btn-primary w-full"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Inscription
                  </Link>
                </div>
              )}

              {/* Toggle Dark Mode mobile */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Thème
                </span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
