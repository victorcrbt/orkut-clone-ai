'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@self/firebase/AuthContext';
import { getCommunity, Community } from '@self/firebase/communityService';
import OrkutHeader from '@self/components/OrkutHeader';
import OrkutFooter from '@self/components/OrkutFooter';
import ProtectedRoute from '@self/components/ProtectedRoute';

export default function GerenciarForumPage() {
  const { communityId } = useParams();
  const { currentUser } = useAuth();
  const router = useRouter();
  
  const [community, setCommunity] = useState<Community | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [isModerator, setIsModerator] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadCommunity() {
      if (!communityId || !currentUser) return;
      
      setLoading(true);
      
      try {
        const communityData = await getCommunity(communityId as string);
        
        if (!communityData) {
          router.push('/comunidades');
          return;
        }
        
        setCommunity(communityData);
        
        // Verificar permissões
        const userIsOwner = communityData.createdBy === currentUser.uid;
        const userIsModerator = communityData.moderators.includes(currentUser.uid);
        
        setIsOwner(userIsOwner);
        setIsModerator(userIsModerator);
        
        // Redirecionar se não tiver permissão
        if (!userIsOwner && !userIsModerator) {
          router.push(`/comunidades/${communityId}`);
        }
      } catch (error) {
        console.error('Erro ao carregar comunidade:', error);
        setError('Não foi possível carregar os dados da comunidade.');
      } finally {
        setLoading(false);
      }
    }
    
    loadCommunity();
  }, [communityId, currentUser, router]);
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-[#e8eefa]">
        <OrkutHeader />
        
        <main className="flex-1 container mx-auto p-4">
          <div className="bg-white rounded-md shadow-sm p-4">
            <div className="mb-4">
              <Link 
                href={`/comunidades/${communityId}/gerenciar`} 
                className="text-[#315c99] hover:underline text-sm flex items-center"
              >
                ← Voltar para gerenciar comunidade
              </Link>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Carregando...</p>
              </div>
            ) : error ? (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
                {error}
              </div>
            ) : (
              <>
                <h1 className="text-xl text-[#315c99] font-bold mb-4">
                  Gerenciar Fórum: {community?.name}
                </h1>
                
                <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
                  <h3 className="text-blue-600 font-medium mb-2">Módulo de Fórum em Desenvolvimento</h3>
                  <p className="text-sm text-gray-700">
                    O módulo de fórum está em desenvolvimento e estará disponível em breve. Você poderá criar tópicos, responder a mensagens e moderar o conteúdo da sua comunidade.
                  </p>
                </div>
                
                {/* Interface para gerenciar fórum (em desenvolvimento) */}
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded p-4">
                    <h3 className="text-lg text-[#315c99] font-medium mb-2">Configurações do Fórum</h3>
                    
                    <div className="space-y-3 mb-4">
                      <div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            disabled
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-600">Permitir que membros criem tópicos</span>
                        </label>
                      </div>
                      
                      <div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            disabled
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-600">Todos os tópicos devem ser aprovados por moderadores</span>
                        </label>
                      </div>
                      
                      <div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            disabled
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-600">Permitir anexar imagens nas postagens</span>
                        </label>
                      </div>
                    </div>
                    
                    <button
                      disabled
                      className="bg-[#6d84b4] text-white px-4 py-2 rounded-md text-sm opacity-50 cursor-not-allowed"
                    >
                      Salvar Configurações
                    </button>
                  </div>
                  
                  <div className="border border-gray-200 rounded p-4">
                    <h3 className="text-lg text-[#315c99] font-medium mb-2">Categorias de Tópicos</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Você poderá criar categorias para organizar os tópicos do fórum.
                    </p>
                    
                    <button
                      disabled
                      className="bg-[#6d84b4] text-white px-4 py-2 rounded-md text-sm opacity-50 cursor-not-allowed"
                    >
                      Adicionar Categoria
                    </button>
                  </div>
                  
                  <div className="border border-gray-200 rounded p-4">
                    <h3 className="text-lg text-[#315c99] font-medium mb-2">Tópicos Fixados</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Você poderá fixar tópicos importantes no topo do fórum.
                    </p>
                    
                    <button
                      disabled
                      className="bg-[#6d84b4] text-white px-4 py-2 rounded-md text-sm opacity-50 cursor-not-allowed"
                    >
                      Gerenciar Tópicos Fixados
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
        
        <OrkutFooter />
      </div>
    </ProtectedRoute>
  );
} 