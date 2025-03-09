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
    <header className="bg-[#6e83b7] text-white border-b border-[#3b5998] shadow-sm">
      <div className="max-w-6xl mx-auto py-1 px-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-white text-2xl font-bold">
            <Link href="/dashboard" className="flex items-center">
              <span className="text-pink-500 font-bold">orkut</span><span className="text-xs ml-0.5 text-white">•</span>
            </Link>
          </h1>
          <nav className="ml-5">
            <ul className="flex space-x-4">
              <li><Link href="/dashboard" className="text-white hover:underline text-[11px]">Início</Link></li>
              <li><Link href="#" className="text-white hover:underline text-[11px]">Perfil</Link></li>
              <li><Link href="#" className="text-white hover:underline text-[11px]">Página de recados</Link></li>
              <li><Link href="#" className="text-white hover:underline text-[11px]">Amigos</Link></li>
              <li><Link href="#" className="text-white hover:underline text-[11px]">Comunidades</Link></li>
            </ul>
          </nav>
        </div>
        <div className="flex items-center">
          <div className="relative mr-2">
            <input 
              type="text" 
              placeholder="pesquisa do orkut"
              className="bg-white text-gray-800 px-2 py-0.5 text-[11px] rounded-sm w-40"
            />
            <button className="absolute right-1 top-0.5 bg-[#3b5998] text-white px-1 rounded-sm">
              <span className="text-xs">🔍</span>
            </button>
          </div>
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