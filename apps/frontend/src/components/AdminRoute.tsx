'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AdminRouteProps {
  children: React.ReactNode;
  allowHotelOwner?: boolean; // Permet aussi aux propriétaires d'hôtel
}

export default function AdminRoute({ children, allowHotelOwner = false }: AdminRouteProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('access_token');
    const userRole = localStorage.getItem('user_role');

    if (!token) {
      router.push('/login');
      return;
    }

    if (userRole !== 'admin' && !(allowHotelOwner && userRole === 'hotel_owner')) {
      router.push('/');
      alert('Accès non autorisé - Administrateur requis');
      return;
    }

    setIsAuthorized(true);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification des autorisations...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
