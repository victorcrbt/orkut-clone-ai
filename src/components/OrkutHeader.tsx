'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../firebase/AuthContext';
import { useState } from 'react';

export default function OrkutHeader() {
  const router = useRouter();
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
        {/* Barra superior responsiva */}
        <div className="flex justify-between items-center">
          <h1 className="text-white text-2xl font-bold">
            <Link href="/dashboard" className="flex items-center">
              <span className="text-pink-500 font-bold">orkut</span><span className="text-xs ml-0.5 text-white">•</span>
            </Link>
          </h1>
          
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
          
          {/* Elementos para desktop */}
          <div className="hidden md:flex items-center">
            <form onSubmit={handleSearch} className="relative mr-2">
              <input 
                type="text" 
                placeholder="pesquisa do orkut"
                className="bg-[#f1f9ff] text-gray-800 px-2 py-0.5 text-[11px] rounded-sm w-40"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button 
                type="submit"
                className="absolute right-1 top-0.5 bg-[#3b5998] text-white px-1 rounded-sm"
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
        
        {/* Menu de navegação que muda entre mobile e desktop */}
        <nav className={`${menuOpen ? 'block' : 'hidden'} md:block mt-2 md:mt-0`}>
          <ul className="flex flex-col md:flex-row md:space-x-4">
            <li className="py-1 md:py-0"><Link href="/dashboard" className="text-white hover:underline text-[11px] block">Início</Link></li>
            <li className="py-1 md:py-0"><Link href="/perfil" className="text-white hover:underline text-[11px] block">Perfil</Link></li>
            <li className="py-1 md:py-0"><Link href="/buscar" className="text-white hover:underline text-[11px] block">Buscar amigos</Link></li>
            <li className="py-1 md:py-0"><Link href="/amigos" className="text-white hover:underline text-[11px] block">Amigos</Link></li>
            <li className="py-1 md:py-0"><Link href="#" className="text-white hover:underline text-[11px] block">Comunidades</Link></li>
          </ul>
        </nav>
        
        {/* Barra de pesquisa e botão de logout para mobile */}
        <div className={`${menuOpen ? 'block' : 'hidden'} md:hidden mt-2 pb-2`}>
          <form onSubmit={handleSearch} className="relative mb-2 w-full">
            <input 
              type="text" 
              placeholder="pesquisa do orkut"
              className="bg-[#f1f9ff] text-gray-800 px-2 py-1.5 text-[11px] rounded-sm w-full"
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