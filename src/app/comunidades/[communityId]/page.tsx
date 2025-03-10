'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@self/firebase/AuthContext';
import { getCommunity, getCommunityMembers, joinCommunity, leaveCommunity, Community, CommunityMember } from '@self/firebase/communityService';
import OrkutHeader from '@self/components/OrkutHeader';
import OrkutFooter from '@self/components/OrkutFooter';
import ProtectedRoute from '@self/components/ProtectedRoute';

export default function CommunidadeDetalhesPage() {
  const { communityId } = useParams();
  const { currentUser } = useAuth();
  const router = useRouter();
  
  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [isMember, setIsMember] = useState<boolean>(false);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [isModerator, setIsModerator] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [joinLoading, setJoinLoading] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'forum' | 'membros'>('forum');
  
  // Carregar dados da comunidade
  useEffect(() => {
    async function loadCommunityData() {
      if (!communityId || !currentUser) return;
      
      setLoading(true);
      
      try {
        // Obter dados da comunidade
        const communityData = await getCommunity(communityId as string);
        if (!communityData) {
          router.push('/comunidades');
          return;
        }
        
        setCommunity(communityData);
        
        // Verificar se o usuário atual é membro
        const userIsMember = communityData.members.includes(currentUser.uid);
        setIsMember(userIsMember);
        
        // Verificar se o usuário atual é o dono
        const userIsOwner = communityData.createdBy === currentUser.uid;
        setIsOwner(userIsOwner);
        
        // Verificar se o usuário atual é moderador
        const userIsModerator = communityData.moderators.includes(currentUser.uid);
        setIsModerator(userIsModerator);
        
        // Obter todos os membros da comunidade
        const membersData = await getCommunityMembers(communityId as string);
        setMembers(membersData);
      } catch (error) {
        console.error("Erro ao carregar dados da comunidade:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadCommunityData();
  }, [communityId, currentUser, router]);
  
  // Função para participar da comunidade
  const handleJoinCommunity = async () => {
    if (!communityId || !currentUser || !community) return;
    
    setJoinLoading(true);
    setActionError(null);
    
    try {
      const success = await joinCommunity(communityId as string, currentUser.uid);
      
      if (success) {
        setIsMember(true);
        
        // Atualizar os membros com o usuário atual
        const updatedCommunity = { ...community };
        if (!updatedCommunity.members.includes(currentUser.uid)) {
          updatedCommunity.members.push(currentUser.uid);
        }
        setCommunity(updatedCommunity);
      } else {
        setActionError("Não foi possível participar da comunidade. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao participar da comunidade:", error);
      setActionError("Ocorreu um erro. Tente novamente mais tarde.");
    } finally {
      setJoinLoading(false);
    }
  };
  
  // Função para sair da comunidade
  const handleLeaveCommunity = async () => {
    if (!communityId || !currentUser || !community) return;
    
    if (isOwner && members.filter(m => m.role === 'moderador').length === 0) {
      setActionError("Você é o único moderador. Promova outro membro a moderador antes de sair.");
      return;
    }
    
    setJoinLoading(true);
    setActionError(null);
    
    try {
      const success = await leaveCommunity(communityId as string, currentUser.uid);
      
      if (success) {
        setIsMember(false);
        setIsModerator(false);
        
        // Atualizar os membros removendo o usuário atual
        const updatedCommunity = { ...community };
        updatedCommunity.members = updatedCommunity.members.filter(id => id !== currentUser.uid);
        updatedCommunity.moderators = updatedCommunity.moderators.filter(id => id !== currentUser.uid);
        setCommunity(updatedCommunity);
      } else {
        setActionError("Não foi possível sair da comunidade. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao sair da comunidade:", error);
      setActionError("Ocorreu um erro. Tente novamente mais tarde.");
    } finally {
      setJoinLoading(false);
    }
  };
  
  // Renderizar o conteúdo de acordo com o estado de carregamento
  const renderContent = () => {
    if (loading) {
      return (
        <div className="py-8 text-center">
          <p className="text-gray-600">Carregando dados da comunidade...</p>
        </div>
      );
    }
    
    if (!community) {
      return (
        <div className="py-8 text-center">
          <p className="text-gray-600">Comunidade não encontrada.</p>
          <Link href="/comunidades" className="text-[#315c99] hover:underline mt-2 inline-block">
            Voltar para Comunidades
          </Link>
        </div>
      );
    }
    
    return (
      <div>
        {/* Cabeçalho da comunidade */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-start">
            <div className="w-20 h-20 mr-4 overflow-hidden flex-shrink-0">
              <Image
                src={community.photoURL || "https://via.placeholder.com/80x80/6e83b7/FFFFFF?text=C"}
                alt={community.name}
                width={80}
                height={80}
                className="border border-gray-300"
              />
            </div>
            
            <div className="flex-1">
              <h1 className="text-xl text-[#315c99] font-bold">{community.name}</h1>
              <p className="text-sm text-gray-500 mb-2">
                Categoria: {community.category} | {community.members.length} {community.members.length === 1 ? 'membro' : 'membros'}
              </p>
              
              <p className="text-sm text-gray-600 mb-3">{community.description}</p>
              
              {/* Ações */}
              <div className="flex flex-wrap gap-2">
                {!isMember ? (
                  <button
                    onClick={handleJoinCommunity}
                    disabled={joinLoading}
                    className="bg-[#6d84b4] text-white px-3 py-1 rounded-sm text-sm hover:bg-[#5d74a4] disabled:opacity-50"
                  >
                    {joinLoading ? 'Processando...' : 'Participar da comunidade'}
                  </button>
                ) : (
                  <>
                    {!isOwner && (
                      <button
                        onClick={handleLeaveCommunity}
                        disabled={joinLoading}
                        className="bg-gray-200 text-gray-700 px-3 py-1 rounded-sm text-sm hover:bg-gray-300 disabled:opacity-50"
                      >
                        {joinLoading ? 'Processando...' : 'Deixar comunidade'}
                      </button>
                    )}
                    
                    {(isOwner || isModerator) && (
                      <Link 
                        href={`/comunidades/${communityId}/gerenciar`}
                        className="bg-[#f0f7ff] text-[#315c99] px-3 py-1 rounded-sm text-sm border border-[#d0e1f9] hover:bg-[#e1eeff]"
                      >
                        Gerenciar comunidade
                      </Link>
                    )}
                  </>
                )}
              </div>
              
              {actionError && (
                <div className="mt-2 text-red-600 text-sm">
                  {actionError}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Abas de navegação */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'forum'
                  ? 'text-[#315c99] border-b-2 border-[#315c99]'
                  : 'text-gray-500 hover:text-[#315c99]'
              }`}
              onClick={() => setActiveTab('forum')}
            >
              Fórum
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'membros'
                  ? 'text-[#315c99] border-b-2 border-[#315c99]'
                  : 'text-gray-500 hover:text-[#315c99]'
              }`}
              onClick={() => setActiveTab('membros')}
            >
              Membros ({community.members.length})
            </button>
          </div>
        </div>
        
        {/* Conteúdo das abas */}
        <div className="p-4">
          {activeTab === 'forum' && (
            <div className="py-8 text-center bg-gray-50 rounded-md">
              <p className="text-gray-600 mb-2">O fórum desta comunidade está em desenvolvimento.</p>
              <p className="text-gray-500 text-sm">Em breve você poderá interagir com outros membros aqui!</p>
            </div>
          )}
          
          {activeTab === 'membros' && (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {members.map((member) => (
                  <div key={member.uid} className="flex flex-col items-center text-center">
                    <Link href={`/perfil/${member.uid}`}>
                      <div className="w-16 h-16 mb-2 overflow-hidden">
                        <Image
                          src={member.photoURL || "https://via.placeholder.com/64x64/e6e6e6/666666?text=User"}
                          alt={member.displayName}
                          width={64}
                          height={64}
                          className="border border-gray-300"
                        />
                      </div>
                      <p className="text-[#315c99] text-sm hover:underline line-clamp-1">
                        {member.displayName}
                      </p>
                    </Link>
                    <p className="text-xs text-gray-500">
                      {member.role === 'dono' && '(dono)'}
                      {member.role === 'moderador' && '(moderador)'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-[#e8eefa]">
        <OrkutHeader />
        
        <main className="flex-1 container mx-auto p-4">
          <div className="bg-white rounded-md shadow-sm">
            {renderContent()}
          </div>
        </main>
        
        <OrkutFooter />
      </div>
    </ProtectedRoute>
  );
} 