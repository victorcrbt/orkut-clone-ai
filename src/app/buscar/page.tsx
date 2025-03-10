'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import OrkutHeader from '@self/components/OrkutHeader';
import OrkutFooter from '@self/components/OrkutFooter';
import ProtectedRoute from '@self/components/ProtectedRoute';
import { useAuth } from '@self/firebase/AuthContext';
import { 
  searchUsers, 
  UserProfile, 
  sendFriendRequest, 
  getUserProfile,
  updateAllUsersSearchFields
} from '@self/firebase/userService';

export default function BuscarUsuariosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);
  const { currentUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Carregar informações do usuário atual
  useEffect(() => {
    const loadCurrentUser = async () => {
      if (currentUser) {
        const profile = await getUserProfile(currentUser.uid);
        setCurrentUserProfile(profile);
        setPendingRequests(profile?.pendingRequests || []);
      }
    };

    loadCurrentUser();

    // Buscar usando o parâmetro de consulta, se disponível
    const query = searchParams.get('q');
    if (query) {
      setSearchTerm(query);
      handleSearch(query);
    }
  }, [currentUser, searchParams]);

  // Função para buscar usuários
  const handleSearch = async (term?: string) => {
    const searchQuery = term || searchTerm;
    
    if (!searchQuery.trim()) {
      setErrorMessage('Por favor, digite um nome para buscar.');
      return;
    }

    setLoading(true);
    setSearchResults([]);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const results = await searchUsers(searchQuery);
      
      // Filtra o próprio usuário da lista de resultados
      const filteredResults = results.filter(user => 
        user.uid !== currentUser?.uid
      );
      
      setSearchResults(filteredResults);
      
      if (filteredResults.length === 0) {
        setErrorMessage(`Nenhum usuário encontrado para "${searchQuery}". Tente outros termos ou verifique a ortografia.`);
      } else if (filteredResults.length === 1) {
        setSuccessMessage(`1 usuário encontrado para "${searchQuery}".`);
      } else {
        setSuccessMessage(`${filteredResults.length} usuários encontrados para "${searchQuery}".`);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setErrorMessage('Ocorreu um erro ao buscar usuários. Por favor, tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Submeter busca
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  // Função para adicionar um amigo
  const handleAddFriend = async (targetUserId: string) => {
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const success = await sendFriendRequest(currentUser.uid, targetUserId);
      
      if (success) {
        setPendingRequests([...pendingRequests, targetUserId]);
        setSuccessMessage('Solicitação de amizade enviada com sucesso!');
      } else {
        setErrorMessage('Não foi possível enviar a solicitação de amizade.');
      }
    } catch (error: any) {
      console.error('Erro ao adicionar amigo:', error);
      setErrorMessage(error.message || 'Erro ao enviar solicitação de amizade.');
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar índices de busca (apenas para administradores)
  const handleUpdateSearchIndices = async () => {
    if (!currentUser || !currentUser.email) return;
    
    // Verifique se o usuário tem permissões administrativas (opcional)
    // Esta é uma verificação básica, pode ser melhorada
    const adminEmails = ['seu-email-admin@exemplo.com'];
    
    if (!adminEmails.includes(currentUser.email)) {
      setErrorMessage('Você não tem permissão para realizar esta operação.');
      return;
    }
    
    setLoading(true);
    try {
      await updateAllUsersSearchFields();
      setSuccessMessage('Índices de busca atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar índices de busca:', error);
      setErrorMessage('Erro ao atualizar índices de busca.');
    } finally {
      setLoading(false);
    }
  };

  // Verifica se já existe solicitação pendente para este usuário
  const isPendingRequest = (userId: string) => {
    return pendingRequests.includes(userId);
  };

  const isAdminUser = currentUser?.email === 'seu-email-admin@exemplo.com';

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-[#e8eefa]">
        <OrkutHeader />

        <main className="flex-1 container mx-auto p-4">
          <div className="bg-white rounded-md shadow-sm p-4 mb-4">
            <h1 className="text-xl text-[#315c99] font-bold mb-4">Buscar Amigos</h1>
            
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2 mb-4">
              <input
                type="text"
                placeholder="Digite o nome de um amigo..."
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm bg-[#f1f9ff]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                className="bg-[#6d84b4] text-white px-4 py-2 rounded-md text-sm disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </button>
            </form>
            
            {/* Botão de administrador para atualizar índices (visível apenas para admins) */}
            {isAdminUser && (
              <div className="mt-2 mb-4 text-right">
                <button
                  onClick={handleUpdateSearchIndices}
                  className="bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded hover:bg-gray-300"
                  disabled={loading}
                >
                  Atualizar índices de busca
                </button>
              </div>
            )}
            
            {/* Mensagens de sucesso e erro */}
            {errorMessage && (
              <div className="text-red-500 text-sm mb-4">
                {errorMessage}
              </div>
            )}
            
            {successMessage && (
              <div className="text-green-500 text-sm mb-4">
                {successMessage}
              </div>
            )}

            {/* Resultados da busca */}
            {searchResults.length > 0 && (
              <div className="mt-4">
                <h2 className="text-lg text-[#315c99] font-bold mb-2">Resultados da busca</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.map((user) => (
                    <div key={user.uid} className="border border-gray-200 rounded-md p-3 flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        <Image
                          src={user.photoURL || "https://via.placeholder.com/64"}
                          alt={user.displayName}
                          width={64}
                          height={64}
                          className="border border-gray-300"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <Link href={`/perfil/${user.uid}`} className="text-[#315c99] font-bold hover:underline">
                          {user.displayName}
                        </Link>
                        
                        <p className="text-xs text-gray-600 mt-1">
                          {user.gender === 'feminino' ? 'feminino' : 'masculino'}, 
                          {user.relationship || 'solteiro(a)'}
                        </p>
                        
                        <p className="text-xs text-gray-600">
                          {user.country || 'Brasil'}
                        </p>
                        
                        <div className="mt-2">
                          {isPendingRequest(user.uid) ? (
                            <span className="text-xs text-gray-500 italic">
                              Solicitação enviada
                            </span>
                          ) : (
                            <button
                              onClick={() => handleAddFriend(user.uid)}
                              className="bg-[#6d84b4] text-white text-xs px-3 py-1 rounded"
                              disabled={loading}
                            >
                              Adicionar como amigo
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        <OrkutFooter />
      </div>
    </ProtectedRoute>
  );
} 