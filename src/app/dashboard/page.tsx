'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#e8eefa]">
      {/* Usar o componente OrkutHeader */}
      <OrkutHeader />

      {/* Conteúdo principal */}
      <main className="flex-1 max-w-6xl mx-auto p-4">
        <div className="bg-white shadow-sm rounded-md overflow-hidden">
          <div className="flex">
            {/* Coluna da esquerda - Foto e menu */}
            <div className="w-48 p-4 border-r border-gray-200">
              <div className="mb-4">
                <Image
                  src={user?.profilePicture || "https://placekitten.com/150/150"}
                  alt={user?.name || "Perfil"}
                  width={150}
                  height={150}
                  className="border border-gray-300"
                />
                <h3 className="text-base font-semibold mt-2 text-gray-700">{user?.name || "Usuário"}</h3>
                <p className="text-xs text-gray-500">feminino, solteiro(a)</p>
                <p className="text-xs text-gray-500">Brasil</p>
              </div>
              
              <ul className="space-y-1">
                <li className="flex items-center text-sm">
                  <span className="mr-1">📝</span>
                  <Link href="#" className="text-blue-600 hover:underline">editar perfil</Link>
                </li>
                <li className="flex items-center text-sm">
                  <span className="mr-1">👤</span>
                  <Link href="#" className="text-blue-600 hover:underline">perfil</Link>
                </li>
                <li className="flex items-center text-sm">
                  <span className="mr-1">✉️</span>
                  <Link href="#" className="text-blue-600 hover:underline">recados</Link>
                </li>
                <li className="flex items-center text-sm">
                  <span className="mr-1">🖼️</span>
                  <Link href="#" className="text-blue-600 hover:underline">álbum</Link>
                </li>
                <li className="flex items-center text-sm">
                  <span className="mr-1">🎥</span>
                  <Link href="#" className="text-blue-600 hover:underline">vídeos</Link>
                </li>
                <li className="flex items-center text-sm">
                  <span className="mr-1">📰</span>
                  <Link href="#" className="text-blue-600 hover:underline">feeds</Link>
                </li>
                <li className="flex items-center text-sm">
                  <span className="mr-1">📋</span>
                  <Link href="#" className="text-blue-600 hover:underline">listas</Link>
                </li>
                <li className="flex items-center text-sm">
                  <span className="mr-1">💬</span>
                  <Link href="#" className="text-blue-600 hover:underline">mensagens</Link>
                </li>
                <li className="flex items-center text-sm">
                  <span className="mr-1">⭐</span>
                  <Link href="#" className="text-blue-600 hover:underline">depoimentos</Link>
                </li>
                <li className="flex items-center text-sm">
                  <span className="mr-1">⚙️</span>
                  <Link href="#" className="text-blue-600 hover:underline">configurações</Link>
                </li>
              </ul>
            </div>
            
            {/* Coluna da direita - Informações do perfil */}
            <div className="flex-1 p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">{user?.name || "Ana Letícia Loubak"}</h2>
                <button className="bg-[#6d84b4] text-white px-3 py-1 text-sm rounded">editar</button>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-600 italic">"Where you invest your love, you invest your life."</p>
              </div>
              
              <div className="flex border-t border-b border-gray-200 py-2 text-sm">
                <div className="mr-4">
                  <span className="text-gray-600">recados</span>
                  <span className="ml-2 text-blue-600">0</span>
                </div>
                <div className="mr-4">
                  <span className="text-gray-600">fotos</span>
                  <span className="ml-2 text-blue-600">0</span>
                </div>
                <div className="mr-4">
                  <span className="text-gray-600">vídeos</span>
                  <span className="ml-2 text-blue-600">0</span>
                </div>
                <div className="mr-4">
                  <span className="text-gray-600">fãs</span>
                  <span className="ml-2 text-blue-600">0</span>
                </div>
                <div className="mr-4">
                  <span className="text-gray-600">confiável</span>
                  <span className="ml-2 text-blue-600">-</span>
                </div>
                <div className="mr-4">
                  <span className="text-gray-600">legal</span>
                  <span className="ml-2 text-blue-600">-</span>
                </div>
                <div className="mr-4">
                  <span className="text-gray-600">sexy</span>
                  <span className="ml-2 text-blue-600">-</span>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="bg-[#edf0f7] p-2 rounded mb-2">
                  <h3 className="text-sm font-semibold mb-2 text-[#6d84b4]">social</h3>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr>
                        <td className="py-1 text-right pr-3 text-gray-600 w-1/4">aniversário:</td>
                        <td>••/••/••••</td>
                      </tr>
                      <tr>
                        <td className="py-1 text-right pr-3 text-gray-600">relacionamento:</td>
                        <td>solteiro(a)</td>
                      </tr>
                      <tr>
                        <td className="py-1 text-right pr-3 text-gray-600">quem sou eu:</td>
                        <td>Jornalista carioca que ama livros, músicas e filmes.</td>
                      </tr>
                      <tr>
                        <td className="py-1 text-right pr-3 text-gray-600">país:</td>
                        <td>Brasil</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            {/* Coluna da extrema direita - Amigos e comunidades */}
            <div className="w-64 p-4 border-l border-gray-200">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold text-gray-700">meus amigos <span className="text-blue-600">(0)</span></h3>
                  <Link href="#" className="text-xs text-blue-600 hover:underline">ver todos</Link>
                </div>
                <p className="text-xs text-gray-600">você ainda não adicionou nenhum amigo</p>
                <button className="mt-2 text-xs text-white bg-[#6d84b4] px-2 py-1 rounded">adicionar amigos</button>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold text-gray-700">minhas comunidades <span className="text-blue-600">(2)</span></h3>
                  <div className="flex space-x-1">
                    <Link href="#" className="text-xs text-blue-600 hover:underline">ver todos</Link>
                    <Link href="#" className="text-xs text-blue-600 hover:underline">gerenciar</Link>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-1 overflow-hidden">
                      <Image
                        src="https://via.placeholder.com/64x64/9D7E64/FFFFFF?text=Chocolate"
                        alt="EU AMO CHOCOLATE"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-[10px] text-blue-600 hover:underline">EU AMO CHOCOLATE</p>
                    <p className="text-[10px] text-gray-500">(720)</p>
                  </div>
                  <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-1 overflow-hidden">
                      <Image
                        src="https://via.placeholder.com/64x64/3B82F6/FFFFFF?text=ZzZ"
                        alt="Eu Odeio Acordar Cedo"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-[10px] text-blue-600 hover:underline">Eu Odeio Acordar Cedo</p>
                    <p className="text-[10px] text-gray-500">(20765)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <OrkutFooter />
    </div>
  );
} 