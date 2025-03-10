'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@self/firebase/AuthContext';
import { getUserCommunities, Community } from '@self/firebase/communityService';
import OrkutHeader from '@self/components/OrkutHeader';
import OrkutFooter from '@self/components/OrkutFooter';
import ProtectedRoute from '@self/components/ProtectedRoute';

export default function GerenciarComunidadesPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  
  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [ownedCommunities, setOwnedCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadCommunities() {
      if (!currentUser) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Carregar minhas comunidades
        const userCommunitiesData = await getUserCommunities(currentUser.uid);
        setMyCommunities(userCommunitiesData);
        
        // Filtrar comunidades que o usuário é dono
        const owned = userCommunitiesData.filter(community => community.createdBy === currentUser.uid);
        setOwnedCommunities(owned);
      } catch (error) {
        console.error("Erro ao carregar comunidades:", error);
        setError("Não foi possível carregar suas comunidades. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    }
    
    loadCommunities();
  }, [currentUser]);
  
  // Função para redirecionar para a criação de uma nova comunidade
  const handleCreateCommunity = () => {
    router.push('/comunidades/criar');
  };
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-[#e8eefa]">
        <OrkutHeader />
        
        <main className="flex-1 container mx-auto p-4">
          <div className="bg-white rounded-md shadow-sm">
            {/* Cabeçalho */}
            <div className="p-4 border-b border-gray-200">
              <h1 className="text-xl text-[#315c99] font-bold mb-4">Gerenciar Comunidades</h1>
              
              {/* Botão para criar comunidade */}
              <div className="mb-2 flex justify-end">
                <button
                  onClick={handleCreateCommunity}
                  className="bg-[#6d84b4] text-white px-4 py-2 rounded-md text-sm hover:bg-[#5d74a4]"
                >
                  Criar nova comunidade
                </button>
              </div>
            </div>
            
            {/* Conteúdo */}
            <div className="p-4">
              {error && (
                <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
                  {error}
                </div>
              )}
              
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Carregando suas comunidades...</p>
                </div>
              ) : (
                <>
                  {/* Comunidades que sou dono */}
                  <div className="mb-8">
                    <h2 className="text-lg text-[#315c99] font-semibold mb-4">Comunidades que criei</h2>
                    
                    {ownedCommunities.length === 0 ? (
                      <div className="bg-gray-50 p-4 rounded text-center">
                        <p className="text-gray-600 mb-2">Você ainda não criou nenhuma comunidade.</p>
                        <button
                          onClick={handleCreateCommunity}
                          className="text-[#315c99] underline text-sm"
                        >
                          Criar minha primeira comunidade
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {ownedCommunities.map((community) => (
                          <div key={community.id} className="border border-gray-200 rounded p-3 flex items-start">
                            <div className="w-16 h-16 mr-3 overflow-hidden flex-shrink-0">
                              <Image
                                src={community.photoURL || "https://via.placeholder.com/64x64/6e83b7/FFFFFF?text=C"}
                                alt={community.name}
                                width={64}
                                height={64}
                                className="border border-gray-300"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <Link href={`/comunidades/${community.id}`} className="text-[#315c99] font-medium hover:underline text-sm line-clamp-1">
                                  {community.name}
                                </Link>
                                <Link href={`/comunidades/${community.id}/gerenciar`} className="text-xs text-[#315c99] bg-[#f0f7ff] px-2 py-1 rounded-sm border border-[#d0e1f9] hover:bg-[#e1eeff]">
                                  Gerenciar
                                </Link>
                              </div>
                              <p className="text-xs text-gray-500 mb-1">
                                {community.members.length} {community.members.length === 1 ? 'membro' : 'membros'}
                              </p>
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {community.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Todas minhas comunidades */}
                  <div>
                    <h2 className="text-lg text-[#315c99] font-semibold mb-4">Comunidades que participo</h2>
                    
                    {myCommunities.length === 0 ? (
                      <div className="bg-gray-50 p-4 rounded text-center">
                        <p className="text-gray-600 mb-2">Você ainda não participa de nenhuma comunidade.</p>
                        <Link href="/comunidades" className="text-[#315c99] underline text-sm">
                          Descubra comunidades para participar
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {myCommunities.map((community) => (
                          <div key={community.id} className="border border-gray-200 rounded p-3 flex items-start">
                            <div className="w-12 h-12 mr-3 overflow-hidden flex-shrink-0">
                              <Image
                                src={community.photoURL || "https://via.placeholder.com/48x48/6e83b7/FFFFFF?text=C"}
                                alt={community.name}
                                width={48}
                                height={48}
                                className="border border-gray-300"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <Link href={`/comunidades/${community.id}`} className="text-[#315c99] font-medium hover:underline text-sm line-clamp-1">
                                {community.name}
                              </Link>
                              <p className="text-xs text-gray-500">
                                {community.members.length} {community.members.length === 1 ? 'membro' : 'membros'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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