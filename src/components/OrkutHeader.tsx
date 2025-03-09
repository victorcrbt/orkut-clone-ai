'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function OrkutHeader() {
  const router = useRouter();

  const handleLogout = () => {
    // Limpar a sessão e redirecionar para o login
    sessionStorage.removeItem('currentUser');
    router.push('/');
  };

  return (
    <header className="bg-[#6d84b4] text-white border-b border-[#3b5998]">
      <div className="max-w-6xl mx-auto py-2 px-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-white text-2xl font-bold">
            <Link href="/dashboard" className="flex items-center">
              <span className="text-pink-500">orkut</span><span className="text-xs ml-1">•</span>
            </Link>
          </h1>
          <nav className="ml-6">
            <ul className="flex space-x-4">
              <li><Link href="/dashboard" className="text-white hover:underline text-sm">Início</Link></li>
              <li><Link href="#" className="text-white hover:underline text-sm">Perfil</Link></li>
              <li><Link href="#" className="text-white hover:underline text-sm">Página de recados</Link></li>
              <li><Link href="#" className="text-white hover:underline text-sm">Amigos</Link></li>
              <li><Link href="#" className="text-white hover:underline text-sm">Comunidades</Link></li>
            </ul>
          </nav>
        </div>
        <div className="flex items-center">
          <div className="relative mr-2">
            <input 
              type="text" 
              placeholder="pesquisa do orkut"
              className="bg-white text-gray-800 px-2 py-1 text-sm rounded-sm w-40"
            />
            <button className="absolute right-1 top-1 bg-[#3b5998] text-white px-1 rounded-sm">
              <span className="text-xs">🔍</span>
            </button>
          </div>
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