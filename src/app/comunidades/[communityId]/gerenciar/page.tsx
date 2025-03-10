'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@self/firebase/AuthContext';
import { 
  getCommunity, 
  getCommunityMembers, 
  updateCommunity, 
  deleteCommunity,
  removeMemberFromCommunity,
  Community, 
  CommunityMember 
} from '@self/firebase/communityService';
import OrkutHeader from '@self/components/OrkutHeader';
import OrkutFooter from '@self/components/OrkutFooter';
import ProtectedRoute from '@self/components/ProtectedRoute';

// Categorias disponíveis para comunidades
const CATEGORIAS = [
  'Atividades',
  'Alunos e Escolas',
  'Artes e Entretenimento',
  'Negócios',
  'Computadores e Internet',
  'Jogos',
  'Saúde e Bem-estar',
  'Hobbies e Trabalhos Manuais',
  'Pessoas',
  'Lugares',
  'Religião e Crenças',
  'Ciências',
  'Esportes',
  'Viagens',
  'Outros'
];

export default function GerenciarComunidadePage() {
  const { communityId } = useParams();
  const { currentUser } = useAuth();
  const router = useRouter();

  // States para os dados da comunidade
  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [isModerator, setIsModerator] = useState<boolean>(false);
  
  // States para o modo de edição
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    isPublic: true
  });

  // States para carregamento e feedback
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  
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
        
        // Verificar se o usuário atual é o dono
        const userIsOwner = communityData.createdBy === currentUser.uid;
        setIsOwner(userIsOwner);
        
        // Verificar se o usuário atual é moderador
        const userIsModerator = communityData.moderators.includes(currentUser.uid);
        setIsModerator(userIsModerator);
        
        // Se não for dono nem moderador, redirecionar
        if (!userIsOwner && !userIsModerator) {
          router.push(`/comunidades/${communityId}`);
          return;
        }
        
        // Inicializar form data com os dados da comunidade
        setFormData({
          name: communityData.name,
          description: communityData.description,
          category: communityData.category,
          isPublic: communityData.isPublic
        });
        
        // Obter todos os membros da comunidade
        const membersData = await getCommunityMembers(communityId as string);
        setMembers(membersData);
      } catch (error) {
        console.error("Erro ao carregar dados da comunidade:", error);
        setError("Erro ao carregar dados da comunidade. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    }
    
    loadCommunityData();
  }, [communityId, currentUser, router]);
  
  // Função para atualizar os dados do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Função para lidar com a mudança de privacidade
  const handlePrivacyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      isPublic: e.target.value === 'public'
    }));
  };
  
  // Função para salvar as alterações da comunidade
  const handleSaveChanges = async () => {
    if (!community || !communityId) return;
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const updateData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        isPublic: formData.isPublic
      };
      
      const success = await updateCommunity(communityId as string, updateData);
      
      if (success) {
        // Atualizar o state da comunidade
        setCommunity({
          ...community,
          ...updateData
        });
        
        setSuccess("Comunidade atualizada com sucesso!");
        setIsEditing(false);
      } else {
        setError("Não foi possível atualizar a comunidade. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao atualizar comunidade:", error);
      setError("Erro ao atualizar comunidade. Tente novamente mais tarde.");
    } finally {
      setSaving(false);
    }
  };
  
  // Função para excluir a comunidade
  const handleDeleteCommunity = async () => {
    if (!community || !communityId || !isOwner) return;
    
    setDeleting(true);
    setError(null);
    
    try {
      const success = await deleteCommunity(communityId as string);
      
      if (success) {
        setSuccess("Comunidade excluída com sucesso!");
        
        // Redirecionar após um breve delay
        setTimeout(() => {
          router.push('/comunidades');
        }, 1500);
      } else {
        setError("Não foi possível excluir a comunidade. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao excluir comunidade:", error);
      setError("Erro ao excluir comunidade. Tente novamente mais tarde.");
    } finally {
      setDeleting(false);
    }
  };
  
  // Função para promover um membro a moderador
  const handlePromoteToModerator = async (memberId: string) => {
    if (!community || !communityId || !isOwner) return;
    
    setError(null);
    setSuccess(null);
    
    try {
      // Verificar se o usuário já é moderador
      if (community.moderators.includes(memberId)) {
        setError("Este usuário já é moderador.");
        return;
      }
      
      // Atualizar a comunidade para adicionar o novo moderador
      const updatedModerators = [...community.moderators, memberId];
      const success = await updateCommunity(communityId as string, {
        moderators: updatedModerators
      });
      
      if (success) {
        // Atualizar o state da comunidade
        setCommunity({
          ...community,
          moderators: updatedModerators
        });
        
        // Atualizar o state dos membros
        setMembers(members.map(member => 
          member.uid === memberId 
            ? { ...member, role: 'moderador' } 
            : member
        ));
        
        setSuccess("Membro promovido a moderador com sucesso!");
      } else {
        setError("Não foi possível promover o membro. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao promover membro:", error);
      setError("Erro ao promover membro. Tente novamente mais tarde.");
    }
  };
  
  // Função para remover um membro da comunidade
  const handleRemoveMember = async (memberId: string) => {
    if (!community || !communityId || !currentUser) return;
    
    setError(null);
    setSuccess(null);
    
    const confirmed = window.confirm("Tem certeza que deseja remover este membro da comunidade?");
    if (!confirmed) return;
    
    try {
      const success = await removeMemberFromCommunity(
        communityId as string,
        memberId,
        currentUser.uid
      );
      
      if (success) {
        // Atualizar a lista de membros removendo o membro
        setMembers(members.filter(member => member.uid !== memberId));
        
        // Atualizar o state da comunidade
        if (community) {
          setCommunity({
            ...community,
            members: community.members.filter(id => id !== memberId)
          });
        }
        
        setSuccess("Membro removido da comunidade com sucesso!");
      } else {
        setError("Não foi possível remover o membro. Verifique as permissões.");
      }
    } catch (error) {
      console.error("Erro ao remover membro:", error);
      setError("Erro ao remover membro. Tente novamente mais tarde.");
    }
  };
  
  // Renderizar o formulário de edição
  const renderEditForm = () => {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="name">
            Nome da Comunidade *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#6d84b4] bg-white text-gray-800"
            maxLength={100}
            required
          />
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="description">
            Descrição *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#6d84b4] bg-white text-gray-800"
            rows={4}
            maxLength={500}
            required
          ></textarea>
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="category">
            Categoria *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#6d84b4] bg-white text-gray-800"
            required
          >
            <option value="">Selecione uma categoria</option>
            {CATEGORIAS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <p className="block text-gray-700 text-sm font-medium mb-1">Privacidade</p>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="privacy"
                value="public"
                checked={formData.isPublic}
                onChange={handlePrivacyChange}
                className="mr-2"
              />
              <span className="text-sm">Pública - Qualquer pessoa pode ver e participar</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="privacy"
                value="private"
                checked={!formData.isPublic}
                onChange={handlePrivacyChange}
                className="mr-2"
              />
              <span className="text-sm">Moderada - As solicitações para participar precisam ser aprovadas</span>
            </label>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 text-sm text-gray-600 mr-2 border border-gray-300 rounded hover:bg-gray-50"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSaveChanges}
            className="px-4 py-2 text-sm text-white bg-[#6d84b4] rounded hover:bg-[#5d74a4] disabled:opacity-50"
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    );
  };
  
  // Renderizar a visualização de informações da comunidade
  const renderCommunityInfo = () => {
    if (!community) return null;
    
    return (
      <div>
        <div className="flex items-start mb-6">
          <div className="w-20 h-20 mr-4 overflow-hidden flex-shrink-0">
            <Image
              src={community.photoURL || `https://via.placeholder.com/80x80/6e83b7/FFFFFF?text=${community.name.substring(0, 1)}`}
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
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-[#f0f7ff] text-[#315c99] px-3 py-1 rounded-sm text-sm border border-[#d0e1f9] hover:bg-[#e1eeff]"
              >
                Editar informações
              </button>
              
              <Link 
                href={`/comunidades/${communityId}`}
                className="bg-[#f0f7ff] text-[#315c99] px-3 py-1 rounded-sm text-sm border border-[#d0e1f9] hover:bg-[#e1eeff]"
              >
                Ver comunidade
              </Link>
              
              <Link 
                href={`/comunidades/${communityId}/gerenciar/forum`}
                className="bg-[#f0f7ff] text-[#315c99] px-3 py-1 rounded-sm text-sm border border-[#d0e1f9] hover:bg-[#e1eeff]"
              >
                Gerenciar fórum
              </Link>
              
              {isOwner && (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="bg-red-50 text-red-600 px-3 py-1 rounded-sm text-sm border border-red-200 hover:bg-red-100"
                >
                  Excluir comunidade
                </button>
              )}
            </div>
          </div>
        </div>
        
        {confirmDelete && (
          <div className="bg-red-50 border border-red-200 p-4 rounded mb-6">
            <h3 className="text-red-600 font-bold mb-2">Tem certeza que deseja excluir esta comunidade?</h3>
            <p className="text-sm text-gray-700 mb-4">Esta ação não pode ser desfeita e todos os dados da comunidade serão perdidos.</p>
            
            <div className="flex justify-end">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1 text-sm text-gray-600 mr-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteCommunity}
                className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
                disabled={deleting}
              >
                {deleting ? 'Excluindo...' : 'Sim, excluir comunidade'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Renderizar lista de membros
  const renderMembers = () => {
    return (
      <div className="mt-8">
        <h2 className="text-lg text-[#315c99] font-semibold mb-4">Membros da Comunidade ({members.length})</h2>
        
        <div className="bg-white border border-gray-200 rounded overflow-hidden">
          {members.map((member) => (
            <div key={member.uid} className="flex items-center justify-between p-3 border-b border-gray-200 last:border-0">
              <div className="flex items-center">
                <div className="w-10 h-10 mr-3 overflow-hidden flex-shrink-0">
                  <Image
                    src={member.photoURL || "https://via.placeholder.com/40x40/e6e6e6/666666?text=User"}
                    alt={member.displayName}
                    width={40}
                    height={40}
                    className="border border-gray-300"
                  />
                </div>
                
                <div>
                  <Link href={`/perfil/${member.uid}`} className="text-[#315c99] text-sm font-medium hover:underline">
                    {member.displayName}
                  </Link>
                  <p className="text-xs text-gray-500">
                    {member.role === 'dono' && '(dono)'}
                    {member.role === 'moderador' && '(moderador)'}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                {isOwner && member.role !== 'dono' && member.role !== 'moderador' && (
                  <button
                    onClick={() => handlePromoteToModerator(member.uid)}
                    className="text-xs text-[#315c99] bg-[#f0f7ff] px-2 py-1 rounded-sm border border-[#d0e1f9] hover:bg-[#e1eeff]"
                  >
                    Promover
                  </button>
                )}
                
                {(isOwner || isModerator) && member.role !== 'dono' && member.uid !== currentUser?.uid && (
                  <button
                    onClick={() => handleRemoveMember(member.uid)}
                    className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-sm border border-red-200 hover:bg-red-100"
                  >
                    Remover
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-[#e8eefa]">
        <OrkutHeader />
        
        <main className="flex-1 container mx-auto p-4">
          <div className="bg-white rounded-md shadow-sm p-4">
            <div className="mb-4">
              <Link href="/comunidades/gerenciar" className="text-[#315c99] hover:underline text-sm flex items-center">
                ← Voltar para minhas comunidades
              </Link>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Carregando informações da comunidade...</p>
              </div>
            ) : (
              <>
                {error && (
                  <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">
                    {success}
                  </div>
                )}
                
                {isEditing ? renderEditForm() : renderCommunityInfo()}
                
                {renderMembers()}
              </>
            )}
          </div>
        </main>
        
        <OrkutFooter />
      </div>
    </ProtectedRoute>
  );
} 