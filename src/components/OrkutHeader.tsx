'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../firebase/AuthContext';
import { useState, useEffect, useCallback } from 'react';
import { getPendingFriendRequests, searchUsers, UserProfile } from '../firebase/userService';

export default function OrkutHeader() {
  const router = useRouter();
  const { logout, currentUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<UserProfile[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Função de debounce para busca
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Função para buscar sugestões
  const fetchSuggestions = async (query: string) => {
    if (query.length >= 3) {
      try {
        const results = await searchUsers(query);
        setSuggestions(results.slice(0, 3));
        setShowSuggestions(true);
      } catch (error) {
        console.error('Erro ao buscar sugestões:', error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Debounce da função de busca
  const debouncedFetchSuggestions = useCallback(
    debounce((query: string) => fetchSuggestions(query), 300),
    []
  );

  // Atualizar busca quando o termo mudar
  useEffect(() => {
    if (searchTerm.length >= 3) {
      debouncedFetchSuggestions(searchTerm);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm]);

  // Fechar sugestões quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const searchContainer = document.getElementById('search-container');
      if (searchContainer && !searchContainer.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      setShowSuggestions(false);
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
            <div id="search-container" className="relative">
              <form onSubmit={handleSearch} className="relative mr-4 flex items-center group">
                <div className="relative flex items-center bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200 pr-2">
                  <input 
                    type="text" 
                    placeholder="Buscar no orkut..."
                    className="bg-transparent text-white pl-4 pr-2 py-1.5 text-sm rounded-full w-48 focus:w-64 transition-all duration-200 outline-none placeholder-white/70"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => {
                      if (searchTerm.length >= 3) {
                        setShowSuggestions(true);
                      }
                    }}
                  />
                  <button 
                    type="submit"
                    className="p-1.5 rounded-full hover:bg-white/10 transition-colors duration-200 flex items-center"
                    aria-label="Buscar"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </form>

              {/* Caixa de sugestões */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute mt-1 w-[300px] bg-white rounded-lg shadow-lg overflow-hidden z-50 border border-gray-100">
                  <div className="divide-y divide-gray-100">
                    {suggestions.map((user) => (
                      <Link
                        key={user.uid}
                        href={`/perfil/${user.uid}`}
                        className="flex items-center px-4 py-2 hover:bg-gray-50 transition-colors duration-150"
                        onClick={() => {
                          setShowSuggestions(false);
                          setSearchTerm('');
                        }}
                      >
                        <img
                          src={user.photoURL || "https://via.placeholder.com/32"}
                          alt={user.displayName}
                          className="w-8 h-8 rounded-full border border-gray-200"
                        />
                        <div className="ml-3 flex-1">
                          <span className="text-sm text-gray-700 font-medium">{user.displayName}</span>
                          {user.country && (
                            <span className="text-xs text-gray-500 block">{user.country}</span>
                          )}
                        </div>
                      </Link>
                    ))}
                    <div className="px-4 py-2 bg-gray-50">
                      <button
                        onClick={() => {
                          setShowSuggestions(false);
                          router.push(`/buscar?q=${encodeURIComponent(searchTerm)}`);
                        }}
                        className="w-full text-center text-sm text-[#315c99] hover:underline py-1 flex items-center justify-center"
                      >
                        <span>Ver todos os resultados</span>
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={handleLogout}
              className="text-white hover:underline text-sm"
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
          
          <form onSubmit={handleSearch} className="relative mb-3 w-full">
            <div className="relative flex items-center bg-white/10 rounded-full">
              <input 
                type="text" 
                placeholder="Buscar no orkut..."
                className="bg-transparent text-white pl-4 pr-2 py-2 text-sm rounded-full w-full outline-none placeholder-white/70"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button 
                type="submit"
                className="absolute right-2 p-1.5 rounded-full hover:bg-white/10 transition-colors duration-200"
                aria-label="Buscar"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>
          
          <button
            onClick={handleLogout}
            className="text-white hover:underline text-sm"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
} 