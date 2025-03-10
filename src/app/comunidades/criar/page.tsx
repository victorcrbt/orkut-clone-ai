'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@self/firebase/AuthContext';
import { createCommunity } from '@self/firebase/communityService';
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

export default function CriarComunidadePage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    isPublic: true
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePrivacyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      isPublic: e.target.value === 'public'
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    // Validar formulário
    if (!formData.name.trim()) {
      setError("O nome da comunidade é obrigatório");
      return;
    }
    
    if (!formData.description.trim()) {
      setError("A descrição da comunidade é obrigatória");
      return;
    }
    
    if (!formData.category) {
      setError("Selecione uma categoria para a comunidade");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const communityData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        isPublic: formData.isPublic,
        createdBy: currentUser.uid,
        photoURL: undefined // Usar undefined em vez de null para corresponder à tipagem
      };
      
      const communityId = await createCommunity(communityData);
      
      if (communityId) {
        // Redirecionar para a página da comunidade
        router.push(`/comunidades/${communityId}`);
      } else {
        setError("Erro ao criar comunidade. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao criar comunidade:", error);
      setError("Erro ao criar comunidade. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-[#e8eefa]">
        <OrkutHeader />
        
        <main className="flex-1 container mx-auto p-4">
          <div className="bg-white rounded-md shadow-sm p-4 max-w-2xl mx-auto">
            <h1 className="text-xl text-[#315c99] font-bold mb-4">Criar Nova Comunidade</h1>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
                  {error}
                </div>
              )}
              
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
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#6d84b4]"
                  maxLength={100}
                  required
                />
                <p className="text-gray-500 text-xs mt-1">Máximo de 100 caracteres</p>
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
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#6d84b4]"
                  rows={4}
                  maxLength={500}
                  required
                ></textarea>
                <p className="text-gray-500 text-xs mt-1">Máximo de 500 caracteres</p>
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
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#6d84b4]"
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
                  onClick={() => router.back()}
                  className="px-4 py-2 text-sm text-gray-600 mr-2 border border-gray-300 rounded hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-white bg-[#6d84b4] rounded hover:bg-[#5d74a4] disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Criando...' : 'Criar Comunidade'}
                </button>
              </div>
            </form>
          </div>
        </main>
        
        <OrkutFooter />
      </div>
    </ProtectedRoute>
  );
} 