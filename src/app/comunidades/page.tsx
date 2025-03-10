'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@self/firebase/AuthContext';
import { getUserCommunities, getAllCommunities, Community } from '@self/firebase/communityService';
import OrkutHeader from '@self/components/OrkutHeader';
import OrkutFooter from '@self/components/OrkutFooter';
import ProtectedRoute from '@self/components/ProtectedRoute';

export default function ComunidadesPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'minhas' | 'todas'>('minhas');
  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [allCommunities, setAllCommunities] = useState<Community[]>([]);
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
        
        // Carregar todas as comunidades
        const allCommunitiesData = await getAllCommunities(20);
        setAllCommunities(allCommunitiesData);
      } catch (error) {
        console.error("Erro ao carregar comunidades:", error);
        setError("Não foi possível carregar as comunidades. Tente novamente mais tarde.");
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
            {/* Cabeçalho com abas */}
            <div className="p-4 border-b border-gray-200">
              <h1 className="text-xl text-[#315c99] font-bold mb-4">Comunidades</h1>
              
              <div className="flex space-x-1 border-b">
                <button
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'minhas'
                      ? 'text-[#315c99] border-b-2 border-[#315c99]'
                      : 'text-gray-500 hover:text-[#315c99]'
                  }`}
                  onClick={() => setActiveTab('minhas')}
                >
                  Minhas comunidades
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'todas'
                      ? 'text-[#315c99] border-b-2 border-[#315c99]'
                      : 'text-gray-500 hover:text-[#315c99]'
                  }`}
                  onClick={() => setActiveTab('todas')}
                >
                  Descubra comunidades
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
              
              {/* Botão para criar comunidade */}
              <div className="mb-6 flex justify-end">
                <button
                  onClick={handleCreateCommunity}
                  className="bg-[#6d84b4] text-white px-4 py-2 rounded-md text-sm hover:bg-[#5d74a4]"
                >
                  Criar nova comunidade
                </button>
              </div>
              
              {/* Conteúdo com base na aba ativa */}
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Carregando...</p>
                </div>
              ) : (
                <>
                  {activeTab === 'minhas' && (
                    <>
                      {myCommunities.length === 0 ? (
                        <div className="bg-gray-50 p-4 rounded text-center">
                          <p className="text-gray-600 mb-2">Você ainda não participa de nenhuma comunidade.</p>
                          <button
                            onClick={() => setActiveTab('todas')}
                            className="text-[#315c99] underline text-sm"
                          >
                            Descubra comunidades para participar
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {myCommunities.map((community) => (
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
                                <Link href={`/comunidades/${community.id}`} className="text-[#315c99] font-medium hover:underline text-sm line-clamp-1">
                                  {community.name}
                                </Link>
                                <p className="text-xs text-gray-500 mb-1">
                                  Categoria: {community.category}
                                </p>
                                <p className="text-xs text-gray-600 line-clamp-2">
                                  {community.description}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {community.members.length} {community.members.length === 1 ? 'membro' : 'membros'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  
                  {activeTab === 'todas' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {allCommunities.map((community) => (
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
                              <Link href={`/comunidades/${community.id}`} className="text-[#315c99] font-medium hover:underline text-sm line-clamp-1">
                                {community.name}
                              </Link>
                              <p className="text-xs text-gray-500 mb-1">
                                Categoria: {community.category}
                              </p>
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {community.description}
                              </p>
                              <div className="flex justify-between items-center mt-1">
                                <p className="text-xs text-gray-500">
                                  {community.members.length} {community.members.length === 1 ? 'membro' : 'membros'}
                                </p>
                                {!myCommunities.some(myCommunity => myCommunity.id === community.id) && (
                                  <Link href={`/comunidades/${community.id}`} className="text-xs text-[#315c99] hover:underline">
                                    Participar
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
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