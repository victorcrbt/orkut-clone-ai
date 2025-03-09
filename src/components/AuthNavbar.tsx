'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../firebase/AuthContext';

export default function AuthNavbar() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <nav className="bg-white shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-pink-500">
          orkut
        </Link>
        
        <div className="space-x-4">
          {currentUser ? (
            <>
              <span className="text-gray-600">
                Olá, {currentUser.email?.split('@')[0] || 'Usuário'}
              </span>
              <Link 
                href="/dashboard"
                className="text-pink-500 hover:text-pink-700 transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-pink-500 hover:text-pink-700 transition-colors"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/"
                className="text-pink-500 hover:text-pink-700 transition-colors"
              >
                Login
              </Link>
              <Link 
                href="/auth/signup"
                className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
              >
                Cadastre-se
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
} 