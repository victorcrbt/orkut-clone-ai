'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User } from '@self/mocks/users';
import OrkutHeader from '@self/components/OrkutHeader';
import OrkutFooter from '@self/components/OrkutFooter';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verificar se o usuário está logado
    const storedUser = sessionStorage.getItem('currentUser');
    
    if (!storedUser) {
      // Redirecionar para a página de login se não estiver logado
      router.push('/');
      return;
    }
    
    setUser(JSON.parse(storedUser));
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    // Limpar a sessão e redirecionar para o login
    sessionStorage.removeItem('currentUser');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <OrkutHeader />

      {/* Cabeçalho */}
      <header className="bg-[#3b5998] text-white shadow-md">
        <div className="max-w-6xl mx-auto py-2 px-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="orkut-logo text-white mr-8">orkut</h1>
            <nav>
              <ul className="flex space-x-6">
                <li><Link href="/dashboard" className="text-white hover:underline">Início</Link></li>
                <li><Link href="#" className="text-white hover:underline">Perfil</Link></li>
                <li><Link href="#" className="text-white hover:underline">Amigos</Link></li>
                <li><Link href="#" className="text-white hover:underline">Comunidades</Link></li>
                <li><Link href="#" className="text-white hover:underline">Recados</Link></li>
              </ul>
            </nav>
          </div>
          <div>
            <button 
              onClick={handleLogout} 
              className="orkut-button bg-red-600"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="flex-1 max-w-6xl mx-auto mt-4 p-4">
        <h2 className="text-2xl font-bold mb-4">Bem-vindo, {user?.name}!</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Coluna da esquerda */}
          <div>
            <div className="bg-gray-800 p-3 rounded">
              <h3 className="text-lg font-semibold mb-3">Perfil</h3>
              <div className="bg-gray-900 p-3 rounded">
                <div className="w-32 h-32 mx-auto bg-gray-700 rounded mb-3"></div>
                <p className="text-center font-medium mb-1">{user?.name}</p>
                <p className="text-center text-sm text-gray-400">{user?.email}</p>
              </div>
            </div>
          </div>
          
          {/* Coluna central */}
          <div>
            <div className="bg-gray-800 p-3 rounded">
              <h3 className="text-lg font-semibold mb-3">Recados</h3>
              <div className="bg-gray-900 p-3 rounded">
                <p className="text-center text-gray-400">Nenhum recado ainda.</p>
              </div>
            </div>
          </div>
          
          {/* Coluna da direita */}
          <div>
            <div className="bg-gray-800 p-3 rounded">
              <h3 className="text-lg font-semibold mb-3">Amigos</h3>
              <div className="bg-gray-900 p-3 rounded">
                <p className="text-center text-gray-400">Nenhum amigo ainda.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <OrkutFooter />
    </div>
  );
} 