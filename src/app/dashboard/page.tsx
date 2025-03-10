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
import { getPendingFriendRequests, getUserFriends, UserProfile } from '@self/firebase/userService';
import { getUserCommunities, Community } from '@self/firebase/communityService';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [userFriends, setUserFriends] = useState<UserProfile[]>([]);
  const [userCommunities, setUserCommunities] = useState<Community[]>([]);
  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (currentUser) {
      checkProfileAndLoadUser();
    }
  }, [currentUser]);

  const checkProfileAndLoadUser = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    
    try {
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        if (!userData.profileCompleted) {
          // Redirecionar para completar o perfil
          router.push('/perfil/completar');
          return;
        }
        
        setUser({
          id: currentUser.uid,
          email: currentUser.email || '',
          name: userData.displayName || '',
          profilePicture: userData.photoURL || '',
          password: '',
          birthDate: userData.birthDate,
          gender: userData.gender,
          relationship: userData.relationship,
          bio: userData.bio || '',
          country: userData.country || '',
          profileCompleted: true
        });
        
        // Buscar solicitações de amizade pendentes
        const pendingRequests = await getPendingFriendRequests(currentUser.uid);
        setPendingRequestsCount(pendingRequests.length);
        
        // Buscar amigos do usuário
        const friends = await getUserFriends(currentUser.uid);
        setUserFriends(friends);
        
        // Buscar comunidades do usuário
        const communities = await getUserCommunities(currentUser.uid);
        setUserCommunities(communities);
      } else {
        // Usuário não existe, redirecionar para completar o perfil
        router.push('/perfil/completar');
        return;
      }
    } catch (error) {
      console.error("Erro ao verificar perfil:", error);
    } finally {
      setLoading(false);
    }
  };

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
          <div className="container mx-auto px-4 mt-2">
            <div className="bg-white border border-pink-200 rounded-md p-3 flex items-center justify-between">
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
          </div>
        )}

        {/* Layout principal em 3 colunas - estilo clássico do Orkut */}
        <main className="container mx-auto p-4">
          <div className="bg-white rounded-md overflow-hidden">
            <div className="flex flex-wrap">
              {/* Coluna da esquerda - Foto e menu */}
              <div className="w-full md:w-[190px] p-3 md:border-r border-gray-200">
                <Image
                  src={user?.profilePicture || "https://via.placeholder.com/150"}
                  alt={user?.name || "Perfil"}
                  width={150}
                  height={150}
                  className="border border-gray-300"
                />
                <h3 className="mt-2 text-sm font-bold text-[#315c99]">{user?.name || "Usuário de Teste"}</h3>
                <p className="text-xs text-gray-600">{user?.gender === 'feminino' ? 'feminino' : 'masculino'}, {user?.relationship || 'solteiro(a)'}</p>
                <p className="text-xs text-gray-600 mb-3">{user?.country || 'Brasil'}</p>
                
                <ul className="space-y-1">
                  <li className="flex items-center text-xs">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">✏️</span>
                    <Link href="/perfil/editar" className="text-[#315c99] hover:underline">editar perfil</Link>
                  </li>
                  <li className="flex items-center text-xs">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">👤</span>
                    <Link href="/perfil" className="text-[#315c99] hover:underline">perfil</Link>
                  </li>
                  <li className="flex items-center text-xs">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">✉️</span>
                    <Link href="#" className="text-[#315c99] hover:underline">recados</Link>
                  </li>
                  <li className="flex items-center text-xs">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">🖼️</span>
                    <Link href="#" className="text-[#315c99] hover:underline">álbum</Link>
                  </li>
                  <li className="flex items-center text-xs">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">🎥</span>
                    <Link href="#" className="text-[#315c99] hover:underline">vídeos</Link>
                  </li>
                  <li className="flex items-center text-xs">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">📰</span>
                    <Link href="#" className="text-[#315c99] hover:underline">feeds</Link>
                  </li>
                  <li className="flex items-center text-xs">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">📋</span>
                    <Link href="#" className="text-[#315c99] hover:underline">listas</Link>
                  </li>
                  <li className="flex items-center text-xs">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">💬</span>
                    <Link href="#" className="text-[#315c99] hover:underline">mensagens</Link>
                  </li>
                  <li className="flex items-center text-xs">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">⭐</span>
                    <Link href="#" className="text-[#315c99] hover:underline">depoimentos</Link>
                  </li>
                  <li className="flex items-center text-xs">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">⚙️</span>
                    <Link href="#" className="text-[#315c99] hover:underline">configurações</Link>
                  </li>
                </ul>
              </div>
              
              {/* Coluna central - Informações do perfil */}
              <div className="w-full md:w-[calc(100%-190px-230px)] p-3 md:border-r border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-bold text-[#315c99]">{user?.name}</h2>
                  <Link href="/perfil/editar">
                    <button className="bg-[#6d84b4] text-white px-3 py-1 text-xs rounded-sm">editar</button>
                  </Link>
                </div>
                
                <div className="mb-3">
                  <p className="text-xs text-gray-600 italic">{user?.bio ? `"${user.bio}"` : '"Olá pessoal, sou eu de novo"'}</p>
                </div>
                
                <div className="flex flex-wrap border-t border-b border-gray-200 py-1 text-xs">
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
                  <div className="bg-[#f0f7ff] rounded-sm mb-2">
                    <div className="bg-[#6d84b4] px-2 py-1">
                      <h3 className="text-white text-xs font-bold">social</h3>
                    </div>
                    <div className="p-2">
                      <table className="w-full text-xs">
                        <tbody>
                          <tr>
                            <td className="py-1 text-right pr-3 text-gray-600 w-1/4 align-top">aniversário:</td>
                            <td className="py-1">{formatBirthDate(user?.birthDate)}</td>
                          </tr>
                          <tr>
                            <td className="py-1 text-right pr-3 text-gray-600 align-top">relacionamento:</td>
                            <td className="py-1">{user?.relationship || 'casado(a)'}</td>
                          </tr>
                          <tr>
                            <td className="py-1 text-right pr-3 text-gray-600 align-top">quem sou eu:</td>
                            <td className="py-1">{user?.bio || 'Olá pessoal, sou eu de novo'}</td>
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
              <div className="w-full md:w-[230px] p-3">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-bold text-[#315c99]">
                      meus amigos <span className="text-[#315c99]">({userFriends.length})</span>
                    </h3>
                    <Link href="/amigos" className="text-[10px] text-[#315c99] hover:underline">ver todos</Link>
                  </div>
                  
                  {userFriends.length === 0 ? (
                    <div>
                      <p className="text-[11px] text-gray-600 mb-1">você ainda não adicionou nenhum amigo</p>
                      <Link href="/buscar" className="inline-block mt-1 text-[11px] text-white bg-[#6d84b4] px-2 py-1 rounded-sm hover:bg-[#5b71a0]">
                        adicionar amigos
                      </Link>
                    </div>
                  ) : (
                    <div>
                      <div className="grid grid-cols-3 gap-1 mb-2">
                        {userFriends.slice(0, 9).map((friend) => (
                          <Link key={friend.uid} href={`/perfil/${friend.uid}`} className="text-center">
                            <div className="w-12 h-12 overflow-hidden mx-auto mb-1">
                              <Image
                                src={friend.photoURL || "https://via.placeholder.com/48"}
                                alt={friend.displayName}
                                width={48}
                                height={48}
                                className="border border-gray-300"
                              />
                            </div>
                            <p className="text-[10px] text-[#315c99] hover:underline overflow-hidden whitespace-nowrap overflow-ellipsis">
                              {friend.displayName}
                            </p>
                          </Link>
                        ))}
                      </div>
                      <div className="text-center">
                        <Link href="/buscar" className="text-[10px] text-[#315c99] hover:underline">
                          adicionar amigos
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-bold text-[#315c99]">
                      minhas comunidades <span className="text-[#315c99]">({userCommunities.length})</span>
                    </h3>
                    <Link href="/comunidades" className="text-[10px] text-[#315c99] hover:underline">ver todas</Link>
                  </div>
                  
                  {userCommunities.length === 0 ? (
                    <div className="bg-[#f8fafc] p-2 rounded text-center">
                      <p className="text-[11px] text-gray-600 mb-2">você ainda não participa de nenhuma comunidade</p>
                      <Link 
                        href="/comunidades" 
                        className="inline-block text-[11px] text-white bg-[#6d84b4] px-3 py-1.5 rounded-sm hover:bg-[#5b71a0] transition-colors"
                      >
                        descobrir comunidades
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        {userCommunities.slice(0, 2).map((community) => (
                          <div key={community.id} className="text-center group">
                            <div className="w-14 h-14 mx-auto mb-1 overflow-hidden transition-transform group-hover:scale-105">
                              <Image
                                src={community.photoURL || `https://via.placeholder.com/64x64/6e83b7/FFFFFF?text=${community.name.substring(0, 1)}`}
                                alt={community.name}
                                width={56}
                                height={56}
                                className="border border-gray-300"
                              />
                            </div>
                            <Link 
                              href={`/comunidades/${community.id}`} 
                              className="text-[10px] text-[#315c99] hover:underline line-clamp-1"
                            >
                              {community.name}
                            </Link>
                          </div>
                        ))}
                      </div>
                      <div className="text-center">
                        <Link href="/comunidades/gerenciar" className="text-[10px] text-[#315c99] hover:underline">
                          gerenciar
                        </Link>
                      </div>
                    </>
                  )}
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