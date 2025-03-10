'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import OrkutHeader from '@self/components/OrkutHeader';
import OrkutFooter from '@self/components/OrkutFooter';
import ProtectedRoute from '@self/components/ProtectedRoute';
import { useAuth } from '@self/firebase/AuthContext';
import { 
  UserProfile, 
  getUserFriends, 
  getPendingFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend
} from '@self/firebase/userService';

export default function AmigosPage() {
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [friendRequests, setFriendRequests] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'amigos' | 'solicitacoes'>('amigos');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { currentUser } = useAuth();
  const router = useRouter();

  // Carregar amigos e solicitações pendentes
  useEffect(() => {
    const loadFriendsAndRequests = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        // Carregar amigos
        const friendsList = await getUserFriends(currentUser.uid);
        setFriends(friendsList);
        
        // Carregar solicitações pendentes
        const pendingRequests = await getPendingFriendRequests(currentUser.uid);
        setFriendRequests(pendingRequests);
      } catch (error) {
        console.error('Erro ao carregar amigos:', error);
        setErrorMessage('Não foi possível carregar seus amigos. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    loadFriendsAndRequests();
  }, [currentUser]);
  
  // Função para aceitar solicitação de amizade
  const handleAcceptRequest = async (requesterUid: string) => {
    if (!currentUser) return;
    
    try {
      const success = await acceptFriendRequest(currentUser.uid, requesterUid);
      
      if (success) {
        // Atualizar UI
        const acceptedUser = friendRequests.find(req => req.uid === requesterUid);
        if (acceptedUser) {
          setFriends(prevFriends => [...prevFriends, acceptedUser]);
          setFriendRequests(prevRequests => 
            prevRequests.filter(req => req.uid !== requesterUid)
          );
        }
        setSuccessMessage('Solicitação de amizade aceita com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao aceitar solicitação:', error);
      setErrorMessage('Não foi possível aceitar a solicitação. Tente novamente.');
    }
    
    // Limpar mensagens após alguns segundos
    setTimeout(() => {
      setSuccessMessage('');
      setErrorMessage('');
    }, 3000);
  };
  
  // Função para rejeitar solicitação de amizade
  const handleRejectRequest = async (requesterUid: string) => {
    if (!currentUser) return;
    
    try {
      const success = await rejectFriendRequest(currentUser.uid, requesterUid);
      
      if (success) {
        // Atualizar UI
        setFriendRequests(prevRequests => 
          prevRequests.filter(req => req.uid !== requesterUid)
        );
        setSuccessMessage('Solicitação de amizade rejeitada.');
      }
    } catch (error) {
      console.error('Erro ao rejeitar solicitação:', error);
      setErrorMessage('Não foi possível rejeitar a solicitação. Tente novamente.');
    }
    
    // Limpar mensagens após alguns segundos
    setTimeout(() => {
      setSuccessMessage('');
      setErrorMessage('');
    }, 3000);
  };
  
  // Função para remover um amigo
  const handleRemoveFriend = async (friendUid: string) => {
    if (!currentUser) return;
    
    if (window.confirm('Tem certeza que deseja remover este amigo?')) {
      try {
        const success = await removeFriend(currentUser.uid, friendUid);
        
        if (success) {
          // Atualizar UI
          setFriends(prevFriends => 
            prevFriends.filter(friend => friend.uid !== friendUid)
          );
          setSuccessMessage('Amigo removido com sucesso.');
        }
      } catch (error) {
        console.error('Erro ao remover amigo:', error);
        setErrorMessage('Não foi possível remover o amigo. Tente novamente.');
      }
      
      // Limpar mensagens após alguns segundos
      setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
      }, 3000);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-[#e8eefa]">
        <OrkutHeader />

        <main className="flex-1 container mx-auto p-4">
          <div className="bg-white rounded-md shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button
                className={`flex-1 py-2 px-4 text-sm font-medium ${
                  activeTab === 'amigos' 
                    ? 'bg-[#f0f7ff] text-[#315c99] border-b-2 border-[#315c99]' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('amigos')}
              >
                Meus Amigos ({friends.length})
              </button>
              <button
                className={`flex-1 py-2 px-4 text-sm font-medium ${
                  activeTab === 'solicitacoes' 
                    ? 'bg-[#f0f7ff] text-[#315c99] border-b-2 border-[#315c99]' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('solicitacoes')}
              >
                Solicitações ({friendRequests.length})
              </button>
            </div>
            
            <div className="p-4">
              {/* Mensagens de sucesso/erro */}
              {successMessage && (
                <div className="bg-green-100 text-green-700 p-2 rounded mb-4 text-sm">
                  {successMessage}
                </div>
              )}
              
              {errorMessage && (
                <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
                  {errorMessage}
                </div>
              )}
              
              {/* Conteúdo com base na aba ativa */}
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Carregando...</p>
                </div>
              ) : (
                <>
                  {activeTab === 'amigos' && (
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg text-[#315c99] font-bold">Meus Amigos</h2>
                        <Link href="/buscar" className="text-sm text-[#315c99] hover:underline">
                          Buscar novos amigos
                        </Link>
                      </div>
                      
                      {friends.length === 0 ? (
                        <div className="bg-gray-50 p-4 rounded text-center">
                          <p className="text-gray-600 mb-2">Você ainda não tem amigos.</p>
                          <Link href="/buscar" className="text-[#315c99] font-medium hover:underline">
                            Clique aqui para buscar amigos
                          </Link>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {friends.map((friend) => (
                            <div key={friend.uid} className="border border-gray-200 rounded-md p-3 flex items-start">
                              <div className="flex-shrink-0 mr-3">
                                <Image
                                  src={friend.photoURL || "https://via.placeholder.com/64"}
                                  alt={friend.displayName}
                                  width={64}
                                  height={64}
                                  className="border border-gray-300"
                                />
                              </div>
                              
                              <div className="flex-1">
                                <Link href={`/perfil/${friend.uid}`} className="text-[#315c99] font-bold hover:underline">
                                  {friend.displayName}
                                </Link>
                                
                                <p className="text-xs text-gray-600 mt-1">
                                  {friend.gender === 'feminino' ? 'feminino' : 'masculino'}, 
                                  {friend.relationship || 'solteiro(a)'}
                                </p>
                                
                                <div className="mt-2 flex space-x-2">
                                  <Link href={`/perfil/${friend.uid}`}>
                                    <button className="text-xs bg-[#6d84b4] text-white px-2 py-1 rounded">
                                      Ver perfil
                                    </button>
                                  </Link>
                                  <button
                                    onClick={() => handleRemoveFriend(friend.uid)}
                                    className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"
                                  >
                                    Remover
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  
                  {activeTab === 'solicitacoes' && (
                    <>
                      <h2 className="text-lg text-[#315c99] font-bold mb-4">Solicitações de Amizade</h2>
                      
                      {friendRequests.length === 0 ? (
                        <div className="bg-gray-50 p-4 rounded text-center">
                          <p className="text-gray-600">Você não tem solicitações de amizade pendentes.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {friendRequests.map((request) => (
                            <div key={request.uid} className="border border-gray-200 rounded-md p-3 flex items-start">
                              <div className="flex-shrink-0 mr-3">
                                <Image
                                  src={request.photoURL || "https://via.placeholder.com/64"}
                                  alt={request.displayName}
                                  width={64}
                                  height={64}
                                  className="border border-gray-300"
                                />
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <Link href={`/perfil/${request.uid}`} className="text-[#315c99] font-bold hover:underline">
                                    {request.displayName}
                                  </Link>
                                  <span className="text-xs text-gray-500">
                                    Quer ser seu amigo
                                  </span>
                                </div>
                                
                                <p className="text-xs text-gray-600 mt-1">
                                  {request.gender === 'feminino' ? 'feminino' : 'masculino'}, 
                                  {request.relationship || 'solteiro(a)'}
                                </p>
                                
                                <div className="mt-3 flex space-x-2">
                                  <button
                                    onClick={() => handleAcceptRequest(request.uid)}
                                    className="text-xs bg-[#6d84b4] text-white px-3 py-1 rounded"
                                  >
                                    Aceitar
                                  </button>
                                  <button
                                    onClick={() => handleRejectRequest(request.uid)}
                                    className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
                                  >
                                    Rejeitar
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </main>

        <OrkutFooter />
      </div>
    </ProtectedRoute>
  );
} 