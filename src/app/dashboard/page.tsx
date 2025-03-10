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
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getPendingFriendRequests } from '@self/firebase/userService';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkProfileAndLoadUser = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        // Verificar se o perfil está completo no Firestore
        const db = getFirestore();
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          
          // Se o perfil não estiver completo, redirecionar
          if (userData.profileCompleted !== true) {
            router.push('/complete-profile');
            return;
          }
          
          // Usar os dados do Firestore para o usuário - incluindo dados sociais
          setUser({
            id: userData.uid,
            email: userData.email,
            name: userData.displayName,
            profilePicture: userData.photoURL,
            password: '', // Campo obrigatório na interface, mas não usado
            birthDate: userData.birthDate,
            gender: userData.gender,
            relationship: userData.relationship,
            bio: userData.bio,
            country: userData.country,
            profileCompleted: userData.profileCompleted
          });
          
          // Carregar solicitações de amizade pendentes
          const friendRequests = await getPendingFriendRequests(currentUser.uid);
          setPendingRequestsCount(friendRequests.length);
        } else {
          // Se não encontrar os dados no Firestore, verificar o sessionStorage
          const storedUser = sessionStorage.getItem('currentUser');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
            // Se não tiver dados em lugar nenhum, redirecionar para completar perfil
            router.push('/complete-profile');
            return;
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkProfileAndLoadUser();
  }, [currentUser, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Carregando...</p>
      </div>
    );
  }

  // Função para formatar a data de nascimento
  const formatBirthDate = (dateString?: string) => {
    if (!dateString) return '••/••/••••';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return '••/••/••••';
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-[#e8eefa]">
        {/* Usar o componente OrkutHeader */}
        <OrkutHeader />

        {/* Notificação de solicitações de amizade pendentes */}
        {pendingRequestsCount > 0 && (
          <div className="mb-4 bg-white border border-pink-200 rounded-md p-3 flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-pink-500 mr-2 text-xl">🔔</span>
              <p className="text-sm">
                Você tem {pendingRequestsCount} {pendingRequestsCount === 1 ? 'solicitação' : 'solicitações'} de amizade pendente{pendingRequestsCount !== 1 ? 's' : ''}.
              </p>
            </div>
            <Link href="/amigos?tab=solicitacoes" className="bg-[#6d84b4] text-white text-xs px-3 py-1 rounded hover:bg-[#5d74a4]">
              Ver agora
            </Link>
          </div>
        )}

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
                <p className="text-[11px] text-gray-600">{user?.gender || 'feminino'}, {user?.relationship || 'solteiro(a)'}</p>
                <p className="text-[11px] text-gray-600 mb-3">{user?.country || 'Brasil'}</p>
                
                <ul className="space-y-1">
                  <li className="flex items-center text-[11px]">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">✏️</span>
                    <Link href="/perfil/editar" className="text-[#315c99] hover:underline">editar perfil</Link>
                  </li>
                  <li className="flex items-center text-[11px]">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">👤</span>
                    <Link href="/perfil" className="text-[#315c99] hover:underline">perfil</Link>
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
                  <Link href="/perfil/editar">
                    <button className="bg-[#6d84b4] text-white px-3 py-1 text-[12px] rounded-sm">editar</button>
                  </Link>
                </div>
                
                <div className="mb-3">
                  <p className="text-[12px] text-gray-600 italic">{user?.bio ? `"${user.bio}"` : '"Where you invest your love, you invest your life."'}</p>
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
                            <td className="py-1">{formatBirthDate(user?.birthDate)}</td>
                          </tr>
                          <tr>
                            <td className="py-1 text-right pr-3 text-gray-600 align-top">relacionamento:</td>
                            <td className="py-1">{user?.relationship || 'solteiro(a)'}</td>
                          </tr>
                          <tr>
                            <td className="py-1 text-right pr-3 text-gray-600 align-top">quem sou eu:</td>
                            <td className="py-1">{user?.bio || 'Jornalista carioca que ama livros, músicas e filmes.'}</td>
                          </tr>
                          <tr>
                            <td className="py-1 text-right pr-3 text-gray-600 align-top">país:</td>
                            <td className="py-1">{user?.country || 'Brasil'}</td>
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
                      <p className="text-[10px] text-[#315c99] hover:underline">EU AMO CHOCOLATE</p>
                    </div>
                    <div className="text-center">
                      <div className="relative w-14 h-14 mx-auto mb-1 overflow-hidden">
                        <Image
                          src="https://via.placeholder.com/64x64/6e83b7/FFFFFF?text=Dev"
                          alt="Desenvolvedores"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="text-[10px] text-[#315c99] hover:underline">Desenvolvedores</p>
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