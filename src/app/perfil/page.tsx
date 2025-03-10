'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import OrkutHeader from '@self/components/OrkutHeader';
import OrkutFooter from '@self/components/OrkutFooter';
import ProtectedRoute from '@self/components/ProtectedRoute';
import { useAuth } from '@self/firebase/AuthContext';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getUserFriends, UserProfile } from '@self/firebase/userService';
import { getUserProfile, getPendingFriendRequests } from '@self/firebase/userService';
import { getUserCommunities, Community } from '@self/firebase/communityService';

export default function PerfilPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userFriends, setUserFriends] = useState<UserProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<UserProfile[]>([]);
  const [userCommunities, setUserCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const router = useRouter();

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

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        const db = getFirestore();
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const profileData = userSnap.data() as UserProfile;
          setUserProfile(profileData);
          
          // Carregar amigos do usuário
          const friends = await getUserFriends(currentUser.uid);
          setUserFriends(friends);
          
          // Buscar solicitações pendentes
          const requests = await getPendingFriendRequests(currentUser.uid);
          setPendingRequests(requests);
          
          // Buscar comunidades do usuário
          const communities = await getUserCommunities(currentUser.uid);
          setUserCommunities(communities);
        } else {
          console.error("Perfil do usuário não encontrado");
          router.push('/complete-profile');
          return;
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserProfile();
  }, [currentUser, router]);

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
        <OrkutHeader />

        <main className="flex-1 container mx-auto p-2 sm:p-4">
          <div className="bg-white rounded-md overflow-hidden shadow-sm">
            {/* Header com foto e nome - Responsivo */}
            <div className="bg-[#f0f7ff] p-4 border-b border-[#c9d6eb]">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-[150px] h-[150px]">
                  <Image
                    src={userProfile?.photoURL || "https://via.placeholder.com/150"}
                    alt={userProfile?.displayName || "Perfil"}
                    width={150}
                    height={150}
                    className="border border-gray-300"
                  />
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-[#315c99] text-xl font-bold">{userProfile?.displayName}</h1>
                  <p className="text-gray-600 text-sm">
                    {userProfile?.gender === 'feminino' ? 'feminino' : 'masculino'}, 
                    {userProfile?.relationship || 'solteiro(a)'}
                  </p>
                  <p className="text-gray-600 text-sm">{userProfile?.country || 'Brasil'}</p>
                </div>
                <div className="sm:ml-auto">
                  <Link href="/perfil/editar">
                    <button className="bg-[#6d84b4] text-white text-xs px-4 py-1 rounded">
                      editar
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Conteúdo principal - Mobile First */}
            <div className="flex flex-col md:flex-row">
              {/* Menu lateral - Em mobile fica em cima */}
              <div className="w-full md:w-[180px] p-3 border-b md:border-b-0 md:border-r border-gray-200">
                <ul className="flex flex-wrap md:flex-col gap-1 md:gap-2">
                  <li className="flex items-center text-xs w-1/2 md:w-auto">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">✏️</span>
                    <Link href="/perfil/editar" className="text-[#315c99] hover:underline">editar perfil</Link>
                  </li>
                  <li className="flex items-center text-xs w-1/2 md:w-auto">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">👤</span>
                    <Link href="/perfil" className="text-[#315c99] hover:underline">perfil</Link>
                  </li>
                  <li className="flex items-center text-xs w-1/2 md:w-auto">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">👥</span>
                    <Link href="/amigos" className="text-[#315c99] hover:underline">amigos</Link>
                  </li>
                  <li className="flex items-center text-xs w-1/2 md:w-auto">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">✉️</span>
                    <Link href="#" className="text-[#315c99] hover:underline">recados</Link>
                  </li>
                  <li className="flex items-center text-xs w-1/2 md:w-auto">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">🖼️</span>
                    <Link href="#" className="text-[#315c99] hover:underline">álbum</Link>
                  </li>
                  <li className="flex items-center text-xs w-1/2 md:w-auto">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">🎥</span>
                    <Link href="#" className="text-[#315c99] hover:underline">vídeos</Link>
                  </li>
                  <li className="flex items-center text-xs w-1/2 md:w-auto">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">📰</span>
                    <Link href="#" className="text-[#315c99] hover:underline">feeds</Link>
                  </li>
                  <li className="flex items-center text-xs w-1/2 md:w-auto">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">📋</span>
                    <Link href="#" className="text-[#315c99] hover:underline">listas</Link>
                  </li>
                  <li className="flex items-center text-xs w-1/2 md:w-auto">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">💬</span>
                    <Link href="#" className="text-[#315c99] hover:underline">mensagens</Link>
                  </li>
                  <li className="flex items-center text-xs w-1/2 md:w-auto">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">⭐</span>
                    <Link href="#" className="text-[#315c99] hover:underline">depoimentos</Link>
                  </li>
                  <li className="flex items-center text-xs w-1/2 md:w-auto">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">⚙️</span>
                    <Link href="#" className="text-[#315c99] hover:underline">configurações</Link>
                  </li>
                </ul>
              </div>
              
              {/* Conteúdo central */}
              <div className="flex-1 p-3">
                <div className="mb-3">
                  <h2 className="text-[#315c99] text-lg font-bold mb-1">{userProfile?.displayName}</h2>
                  <p className="text-xs text-gray-600 italic">
                    {userProfile?.bio ? `"${userProfile.bio}"` : '"Where you invest your love, you invest your life."'}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 border-t border-b border-gray-200 py-2 mb-3">
                  <div className="text-xs">
                    <span className="text-gray-600">recados</span>
                    <span className="ml-1 text-[#315c99]">0</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-600">fotos</span>
                    <span className="ml-1 text-[#315c99]">0</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-600">vídeos</span>
                    <span className="ml-1 text-[#315c99]">0</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-600">fãs</span>
                    <span className="ml-1 text-[#315c99]">0</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-600">confiável</span>
                    <span className="ml-1 text-[#315c99]">0</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-600">legal</span>
                    <span className="ml-1 text-[#315c99]">0</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-600">sexy</span>
                    <span className="ml-1 text-[#315c99]">0</span>
                  </div>
                </div>
                
                {/* Informações do perfil */}
                <div className="mb-4">
                  <h3 className="text-sm text-[#315c99] font-semibold mb-2">Informações pessoais</h3>
                  <div className="text-xs space-y-1">
                    <div className="grid grid-cols-3">
                      <span className="text-gray-600">país:</span>
                      <span className="col-span-2">{userProfile?.country || 'Brasil'}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-gray-600">relacionamento:</span>
                      <span className="col-span-2">{userProfile?.relationship || 'solteiro(a)'}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-gray-600">nascimento:</span>
                      <span className="col-span-2">{formatBirthDate(userProfile?.birthDate)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Amigos */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm text-[#315c99] font-semibold">Amigos ({userFriends.length})</h3>
                    {userFriends.length > 0 && (
                      <Link href="/amigos" className="text-xs text-[#315c99] hover:underline">
                        ver todos
                      </Link>
                    )}
                  </div>
                  
                  {userFriends.length === 0 ? (
                    <div className="bg-gray-50 p-2 rounded text-center">
                      <p className="text-xs text-gray-500 mb-1">Você ainda não tem amigos.</p>
                      <Link href="/buscar" className="text-xs text-[#315c99] font-medium hover:underline">
                        Clique aqui para buscar amigos
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
                      {userFriends.slice(0, 9).map((friend) => (
                        <Link href={`/perfil/${friend.uid}`} key={friend.uid} className="text-center">
                          <div className="mb-1">
                            <Image
                              src={friend.photoURL || "https://via.placeholder.com/50"}
                              alt={friend.displayName}
                              width={50}
                              height={50}
                              className="border border-gray-300 mx-auto"
                            />
                          </div>
                          <span className="text-xs text-[#315c99] hover:underline line-clamp-1">
                            {friend.displayName}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Solicitações de amizade recebidas */}
                  {userProfile?.friendRequests && userProfile.friendRequests.length > 0 && (
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm text-[#315c99] font-semibold">
                          Solicitações pendentes ({userProfile.friendRequests.length})
                        </h3>
                        <Link href="/amigos?tab=solicitacoes" className="text-xs text-[#315c99] hover:underline">
                          ver todas
                        </Link>
                      </div>
                      
                      <div className="bg-[#f0f7ff] border border-[#c9d6eb] rounded p-2">
                        <p className="text-xs text-gray-600 mb-1">
                          Você tem {userProfile.friendRequests.length} {userProfile.friendRequests.length === 1 ? 'solicitação' : 'solicitações'} de amizade pendente{userProfile.friendRequests.length !== 1 ? 's' : ''}.
                        </p>
                        <Link href="/amigos?tab=solicitacoes" className="text-xs bg-[#6d84b4] text-white px-3 py-1 rounded inline-block mt-1 hover:bg-[#5d74a4]">
                          Responder agora
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white p-4 shadow-sm rounded-md mb-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm text-[#315c99] font-semibold">Comunidades ({userCommunities.length})</h3>
                      <Link href="/comunidades" className="text-xs text-[#315c99] hover:underline">
                        ver todas
                      </Link>
                    </div>
                    
                    {userCommunities.length === 0 ? (
                      <div className="bg-[#f8fafc] p-3 rounded text-center">
                        <p className="text-xs text-gray-600 mb-2">Você ainda não participa de nenhuma comunidade.</p>
                        <Link 
                          href="/comunidades" 
                          className="text-xs text-[#315c99] font-medium hover:underline inline-block"
                        >
                          Descobrir comunidades
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {userCommunities.slice(0, 9).map((community) => (
                          <Link href={`/comunidades/${community.id}`} key={community.id} className="text-center group">
                            <div className="mb-1 transition-transform group-hover:scale-105">
                              <Image
                                src={community.photoURL || `https://via.placeholder.com/50x50/6e83b7/FFFFFF?text=${community.name.substring(0, 1)}`}
                                alt={community.name}
                                width={50}
                                height={50}
                                className="border border-gray-300 mx-auto"
                              />
                            </div>
                            <span className="text-xs text-[#315c99] hover:underline line-clamp-1">
                              {community.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
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