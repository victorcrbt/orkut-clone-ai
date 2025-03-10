'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import OrkutHeader from '@self/components/OrkutHeader';
import OrkutFooter from '@self/components/OrkutFooter';
import ProtectedRoute from '@self/components/ProtectedRoute';
import { useAuth } from '@self/firebase/AuthContext';
import { 
  getUserProfile, 
  UserProfile, 
  sendFriendRequest, 
  getUserFriends 
} from '@self/firebase/userService';

export default function PerfilUsuarioPage({ params }: { params: { userId: string } }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [userFriends, setUserFriends] = useState<UserProfile[]>([]);
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const { currentUser } = useAuth();
  const router = useRouter();
  const userId = params.userId;

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
    const loadProfiles = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      // Se o ID do perfil for o mesmo do usuário atual, redireciona para a página principal de perfil
      if (currentUser.uid === userId) {
        router.push('/perfil');
        return;
      }
      
      try {
        // Carregar perfil do usuário que está sendo visualizado
        const profile = await getUserProfile(userId);
        if (!profile) {
          setErrorMessage('Perfil não encontrado');
          setLoading(false);
          return;
        }
        setUserProfile(profile);
        
        // Carregar amigos do usuário
        const friends = await getUserFriends(userId);
        setUserFriends(friends);
        
        // Carregar perfil do usuário atual
        const currentProfile = await getUserProfile(currentUser.uid);
        setCurrentUserProfile(currentProfile);
        
        // Verificar se o usuário atual já é amigo ou já enviou solicitação
        if (currentProfile?.friends?.includes(userId)) {
          setIsFriend(true);
        } else if (currentProfile?.pendingRequests?.includes(userId)) {
          setFriendRequestSent(true);
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        setErrorMessage('Erro ao carregar informações do perfil');
      } finally {
        setLoading(false);
      }
    };
    
    loadProfiles();
  }, [currentUser, userId, router]);
  
  // Função para enviar solicitação de amizade
  const handleAddFriend = async () => {
    if (!currentUser || !userProfile) return;
    
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const success = await sendFriendRequest(currentUser.uid, userProfile.uid);
      
      if (success) {
        setFriendRequestSent(true);
        setSuccessMessage('Solicitação de amizade enviada com sucesso!');
      } else {
        setErrorMessage('Não foi possível enviar a solicitação de amizade');
      }
    } catch (error: any) {
      console.error('Erro ao adicionar amigo:', error);
      setErrorMessage(error.message || 'Erro ao enviar solicitação de amizade');
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-[#e8eefa]">
        <OrkutHeader />

        <main className="flex-1 container mx-auto p-2 sm:p-4">
          {errorMessage ? (
            <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
              {errorMessage}
            </div>
          ) : (
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
                    {isFriend ? (
                      <span className="bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded inline-block">
                        Amigos
                      </span>
                    ) : friendRequestSent ? (
                      <span className="bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded inline-block">
                        Solicitação enviada
                      </span>
                    ) : (
                      <button 
                        className="bg-[#6d84b4] text-white text-xs px-4 py-1 rounded disabled:opacity-50"
                        onClick={handleAddFriend}
                        disabled={loading}
                      >
                        Adicionar como amigo
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Mensagem de sucesso */}
                {successMessage && (
                  <div className="mt-3 text-green-600 text-sm bg-green-50 p-2 rounded">
                    {successMessage}
                  </div>
                )}
              </div>

              {/* Conteúdo principal - Mobile First */}
              <div className="flex flex-col md:flex-row">
                {/* Menu lateral - Em mobile fica em cima */}
                <div className="w-full md:w-[180px] p-3 border-b md:border-b-0 md:border-r border-gray-200">
                  <ul className="flex flex-wrap md:flex-col gap-1 md:gap-2">
                    <li className="flex items-center text-xs w-1/2 md:w-auto">
                      <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">👤</span>
                      <span className="text-[#315c99]">perfil</span>
                    </li>
                    <li className="flex items-center text-xs w-1/2 md:w-auto">
                      <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">✉️</span>
                      <span className="text-[#315c99]">recados</span>
                    </li>
                    <li className="flex items-center text-xs w-1/2 md:w-auto">
                      <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">🖼️</span>
                      <span className="text-[#315c99]">álbum</span>
                    </li>
                    <li className="flex items-center text-xs w-1/2 md:w-auto">
                      <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">🎥</span>
                      <span className="text-[#315c99]">vídeos</span>
                    </li>
                    <li className="flex items-center text-xs w-1/2 md:w-auto">
                      <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">⭐</span>
                      <span className="text-[#315c99]">depoimentos</span>
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
                      {userFriends.length > 9 && (
                        <Link href={`/perfil/${userId}/amigos`} className="text-xs text-[#315c99] hover:underline">
                          ver todos
                        </Link>
                      )}
                    </div>
                    
                    {userFriends.length === 0 ? (
                      <p className="text-xs text-gray-500 italic">
                        Este usuário ainda não possui amigos.
                      </p>
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
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <OrkutFooter />
      </div>
    </ProtectedRoute>
  );
} 