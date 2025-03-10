'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../firebase/AuthContext';
import { useState, useEffect } from 'react';
import { getPendingFriendRequests } from '../firebase/userService';

export default function OrkutHeader() {
  const router = useRouter();
  const { logout, currentUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPendingRequests = async () => {
      if (!currentUser) {
        setPendingRequestsCount(0);
        setLoading(false);
        return;
      }
      
      try {
        const requests = await getPendingFriendRequests(currentUser.uid);
        setPendingRequestsCount(requests.length);
      } catch (error) {
        console.error('Erro ao carregar solicitações pendentes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadPendingRequests();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <header className="bg-[#6e83b7] text-white border-b border-[#3b5998] shadow-sm">
      <div className="container mx-auto py-1 px-4">
        {/* Layout estilo clássico orkut */}
        <div className="flex justify-between items-center">
          <div className="hidden md:flex items-center space-x-4">
            <h1 className="text-pink-500 text-2xl font-bold">
              <Link href="/dashboard" className="flex items-center">
                <span>orkut</span><span className="text-xs ml-0.5 text-white">•</span>
              </Link>
            </h1>
            <nav className="flex space-x-4">
              <Link href="/dashboard" className="text-white hover:underline text-[11px]">Início</Link>
              <Link href="/perfil" className="text-white hover:underline text-[11px]">Perfil</Link>
              <Link href="/buscar" className="text-white hover:underline text-[11px]">Buscar amigos</Link>
              <Link href="/amigos" className="text-white hover:underline text-[11px] flex items-center">
                Amigos
                {pendingRequestsCount > 0 && (
                  <span className="ml-1 bg-pink-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {pendingRequestsCount}
                  </span>
                )}
              </Link>
              <Link href="/comunidades" className="text-white hover:underline text-[11px]">Comunidades</Link>
            </nav>
          </div>

          {/* Logo mobile */}
          <div className="md:hidden">
            <h1 className="text-pink-500 text-2xl font-bold">
              <Link href="/dashboard" className="flex items-center">
                <span>orkut</span><span className="text-xs ml-0.5 text-white">•</span>
              </Link>
            </h1>
          </div>
          
          {/* Barra de pesquisa e botão de logout - desktop */}
          <div className="hidden md:flex items-center">
            <form onSubmit={handleSearch} className="relative mr-2 flex items-center">
              <span className="text-xs text-gray-200 mr-1">pesquisa do orkut</span>
              <input 
                type="text" 
                className="bg-white text-gray-800 px-2 py-0.5 text-[11px] rounded-sm w-40"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button 
                type="submit"
                className="bg-[#3b5998] text-white px-1 rounded-sm ml-1"
              >
                <span className="text-xs">🔍</span>
              </button>
            </form>
            <button
              onClick={handleLogout}
              className="text-white hover:underline text-[11px]"
            >
              Sair
            </button>
          </div>

          {/* Botão de menu mobile */}
          <button 
            className="md:hidden text-white focus:outline-none"
            onClick={toggleMenu}
            aria-label="Menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
        
        {/* Menu de navegação mobile */}
        <div className={`${menuOpen ? 'block' : 'hidden'} md:hidden mt-2 pb-2`}>
          <nav className="mb-3">
            <ul className="flex flex-col space-y-2">
              <li><Link href="/dashboard" className="text-white hover:underline text-[11px] block">Início</Link></li>
              <li><Link href="/perfil" className="text-white hover:underline text-[11px] block">Perfil</Link></li>
              <li><Link href="/buscar" className="text-white hover:underline text-[11px] block">Buscar amigos</Link></li>
              <li>
                <Link href="/amigos" className="text-white hover:underline text-[11px] flex items-center">
                  Amigos
                  {pendingRequestsCount > 0 && (
                    <span className="ml-1 bg-pink-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      {pendingRequestsCount}
                    </span>
                  )}
                </Link>
              </li>
              <li><Link href="/comunidades" className="text-white hover:underline text-[11px] block">Comunidades</Link></li>
            </ul>
          </nav>
          
          <form onSubmit={handleSearch} className="relative mb-2 w-full">
            <input 
              type="text" 
              placeholder="pesquisa do orkut"
              className="bg-white text-gray-800 px-2 py-1.5 text-[11px] rounded-sm w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button 
              type="submit"
              className="absolute right-1 top-1 bg-[#3b5998] text-white px-1 rounded-sm"
            >
              <span className="text-xs">🔍</span>
            </button>
          </form>
          
          <button
            onClick={handleLogout}
            className="text-white hover:underline text-[11px]"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
} 