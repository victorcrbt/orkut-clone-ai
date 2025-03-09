'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { User } from '@self/mocks/users';
import OrkutHeader from '@self/components/OrkutHeader';
import OrkutFooter from '@self/components/OrkutFooter';
import ProtectedRoute from '@self/components/ProtectedRoute';
import { useAuth } from '@self/firebase/AuthContext';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { currentUser } = useAuth();

  useEffect(() => {
    // Em vez de verificar o sessionStorage, usamos o contexto de autenticação
    const storedUser = sessionStorage.getItem('currentUser');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Carregando...</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-[#e8eefa]">
        {/* Usar o componente OrkutHeader */}
        <OrkutHeader />

        {/* Conteúdo principal */}
        <main className="flex-1 max-w-6xl mx-auto p-4">
          <div className="bg-white rounded-md overflow-hidden">
            <div className="flex flex-wrap">
              {/* Coluna da esquerda - Foto e menu */}
              <div className="w-[190px] p-3 md:border-r border-gray-200">
                <Image
                  src={user?.profilePicture || "https://placekitten.com/150/150"}
                  alt={user?.name || "Perfil"}
                  width={150}
                  height={150}
                  className="border border-gray-300"
                />
                <h3 className="mt-2 text-[13px] font-bold text-[#315c99]">{user?.name || "Usuário de Teste"}</h3>
                <p className="text-[11px] text-gray-600">feminino, solteiro(a)</p>
                <p className="text-[11px] text-gray-600 mb-3">Brasil</p>
                
                <ul className="space-y-1">
                  <li className="flex items-center text-[11px]">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">✏️</span>
                    <Link href="#" className="text-[#315c99] hover:underline">editar perfil</Link>
                  </li>
                  <li className="flex items-center text-[11px]">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">👤</span>
                    <Link href="#" className="text-[#315c99] hover:underline">perfil</Link>
                  </li>
                  <li className="flex items-center text-[11px]">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">✉️</span>
                    <Link href="#" className="text-[#315c99] hover:underline">recados</Link>
                  </li>
                  <li className="flex items-center text-[11px]">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">🖼️</span>
                    <Link href="#" className="text-[#315c99] hover:underline">álbum</Link>
                  </li>
                  <li className="flex items-center text-[11px]">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">🎥</span>
                    <Link href="#" className="text-[#315c99] hover:underline">vídeos</Link>
                  </li>
                  <li className="flex items-center text-[11px]">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">📰</span>
                    <Link href="#" className="text-[#315c99] hover:underline">feeds</Link>
                  </li>
                  <li className="flex items-center text-[11px]">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">📋</span>
                    <Link href="#" className="text-[#315c99] hover:underline">listas</Link>
                  </li>
                  <li className="flex items-center text-[11px]">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">💬</span>
                    <Link href="#" className="text-[#315c99] hover:underline">mensagens</Link>
                  </li>
                  <li className="flex items-center text-[11px]">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">⭐</span>
                    <Link href="#" className="text-[#315c99] hover:underline">depoimentos</Link>
                  </li>
                  <li className="flex items-center text-[11px]">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">⚙️</span>
                    <Link href="#" className="text-[#315c99] hover:underline">configurações</Link>
                  </li>
                </ul>
              </div>
              
              {/* Coluna central - Informações do perfil */}
              <div className="flex-1 p-3 md:border-r border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-bold text-[#315c99]">{user?.name || "Ana Letícia Loubak"}</h2>
                  <button className="bg-[#6d84b4] text-white px-3 py-1 text-[12px] rounded-sm">editar</button>
                </div>
                
                <div className="mb-3">
                  <p className="text-[12px] text-gray-600 italic">"Where you invest your love, you invest your life."</p>
                </div>
                
                <div className="flex flex-wrap border-t border-b border-gray-200 py-1 text-[12px]">
                  <div className="mr-4">
                    <span className="text-gray-600">recados</span>
                    <span className="ml-1 text-[#315c99]">0</span>
                  </div>
                  <div className="mr-4">
                    <span className="text-gray-600">fotos</span>
                    <span className="ml-1 text-[#315c99]">0</span>
                  </div>
                  <div className="mr-4">
                    <span className="text-gray-600">vídeos</span>
                    <span className="ml-1 text-[#315c99]">0</span>
                  </div>
                  <div className="mr-4">
                    <span className="text-gray-600">fãs</span>
                    <span className="ml-1 text-[#315c99]">0</span>
                  </div>
                  <div className="mr-4">
                    <span className="text-gray-600">confiável</span>
                    <span className="ml-1 text-[#315c99]">-</span>
                  </div>
                  <div className="mr-4">
                    <span className="text-gray-600">legal</span>
                    <span className="ml-1 text-[#315c99]">-</span>
                  </div>
                  <div className="mr-4">
                    <span className="text-gray-600">sexy</span>
                    <span className="ml-1 text-[#315c99]">-</span>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="bg-[#e8eefa] rounded-sm mb-2">
                    <div className="bg-[#6d84b4] px-2 py-1 text-white text-[11px] font-bold">
                      social
                    </div>
                    <div className="p-2">
                      <table className="w-full text-[12px]">
                        <tbody>
                          <tr>
                            <td className="py-1 text-right pr-3 text-gray-600 w-1/4 align-top">aniversário:</td>
                            <td className="py-1">••/••/••••</td>
                          </tr>
                          <tr>
                            <td className="py-1 text-right pr-3 text-gray-600 align-top">relacionamento:</td>
                            <td className="py-1">solteiro(a)</td>
                          </tr>
                          <tr>
                            <td className="py-1 text-right pr-3 text-gray-600 align-top">quem sou eu:</td>
                            <td className="py-1">Jornalista carioca que ama livros, músicas e filmes.</td>
                          </tr>
                          <tr>
                            <td className="py-1 text-right pr-3 text-gray-600 align-top">país:</td>
                            <td className="py-1">Brasil</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Coluna da direita - Amigos e comunidades */}
              <div className="w-[230px] p-3">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-[13px] font-bold text-[#315c99]">
                      meus amigos <span className="text-[#315c99]">(0)</span>
                    </h3>
                    <Link href="#" className="text-[10px] text-[#315c99] hover:underline">ver todos</Link>
                  </div>
                  <p className="text-[11px] text-gray-600">você ainda não adicionou nenhum amigo</p>
                  <button className="mt-2 text-[11px] text-white bg-[#6d84b4] px-2 py-1 rounded-sm">adicionar amigos</button>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-[13px] font-bold text-[#315c99]">
                      minhas comunidades <span className="text-[#315c99]">(2)</span>
                    </h3>
                    <div className="flex items-center">
                      <Link href="#" className="text-[10px] text-[#315c99] hover:underline mr-1">ver todos</Link>
                      <Link href="#" className="text-[10px] text-[#315c99] hover:underline">gerenciar</Link>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center">
                      <div className="relative w-14 h-14 mx-auto mb-1 overflow-hidden">
                        <Image
                          src="https://via.placeholder.com/64x64/9D7E64/FFFFFF?text=Chocolate"
                          alt="EU AMO CHOCOLATE"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="text-[9px] text-[#315c99] hover:underline">EU AMO CHOCOLATE</p>
                      <p className="text-[9px] text-gray-500">(720)</p>
                    </div>
                    <div className="text-center">
                      <div className="relative w-14 h-14 mx-auto mb-1 overflow-hidden">
                        <Image
                          src="https://via.placeholder.com/64x64/3B82F6/FFFFFF?text=ZzZ"
                          alt="Eu Odeio Acordar Cedo"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="text-[9px] text-[#315c99] hover:underline">Eu Odeio Acordar Cedo</p>
                      <p className="text-[9px] text-gray-500">(20765)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <OrkutFooter />
      </div>
    </ProtectedRoute>
  );
} 