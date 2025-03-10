'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '@self/firebase/AuthContext';
import OrkutHeader from '@self/components/OrkutHeader';
import OrkutFooter from '@self/components/OrkutFooter';
import ProtectedRoute from '@self/components/ProtectedRoute';
import { updateUserSearchField } from '@self/firebase/userService';

interface UserProfile {
  uid: string;
  email?: string;
  displayName: string;
  photoURL?: string;
  birthDate?: string;
  gender?: string;
  relationship?: string;
  bio?: string;
  country?: string;
}

export default function EditarPerfilPage() {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [relationship, setRelationship] = useState('');
  const [bio, setBio] = useState('');
  const [country, setCountry] = useState('Brasil');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { currentUser } = useAuth();
  const router = useRouter();

  // Função para formatar a data do formato ISO para o formato yyyy-MM-dd para inputs de data
  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return '';
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
          const userData = userSnap.data() as UserProfile;
          setName(userData.displayName || '');
          setBirthDate(formatDateForInput(userData.birthDate));
          setGender(userData.gender || '');
          setRelationship(userData.relationship || '');
          setBio(userData.bio || '');
          setCountry(userData.country || 'Brasil');
        } else {
          setError("Perfil não encontrado. Preencha os dados abaixo para completar seu perfil.");
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        setError("Erro ao carregar perfil. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };
    
    loadUserProfile();
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    setIsSubmitting(true);
    setError('');
    setSuccess(false);
    
    try {
      const userData = {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: name,
        photoURL: currentUser.photoURL,
        birthDate,
        gender,
        relationship,
        bio,
        country,
        displayNameLower: name.toLowerCase(),
        profileCompleted: true,
        updatedAt: new Date().toISOString()
      };
      
      const db = getFirestore();
      await updateDoc(doc(db, "users", currentUser.uid), userData);
      
      await updateUserSearchField(currentUser.uid, name);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setError('Não foi possível atualizar o perfil. Tente novamente.');
    } finally {
      setIsSubmitting(false);
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
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md max-w-lg mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-[#315c99] mb-3 sm:mb-4">Editar perfil</h2>
            
            {error && (
              <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 text-xs sm:text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-2 bg-green-100 border border-green-400 text-green-700 text-xs sm:text-sm">
                Perfil atualizado com sucesso! Redirecionando...
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-gray-700 text-xs sm:text-sm font-bold mb-1 sm:mb-2" htmlFor="name">
                  Nome Completo
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:border-[#6d84b4] bg-[#f1f9ff] text-black"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-xs sm:text-sm font-bold mb-1 sm:mb-2" htmlFor="birthDate">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  id="birthDate"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:border-[#6d84b4] bg-[#f1f9ff] text-black"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-xs sm:text-sm font-bold mb-1 sm:mb-2" htmlFor="gender">
                  Gênero
                </label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:border-[#6d84b4] bg-[#f1f9ff] text-black"
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                  <option value="outro">Outro</option>
                  <option value="prefiro-nao-dizer">Prefiro não dizer</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 text-xs sm:text-sm font-bold mb-1 sm:mb-2" htmlFor="relationship">
                  Estado Civil
                </label>
                <select
                  id="relationship"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:border-[#6d84b4] bg-[#f1f9ff] text-black"
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="solteiro(a)">Solteiro(a)</option>
                  <option value="casado(a)">Casado(a)</option>
                  <option value="namorando">Namorando</option>
                  <option value="relacionamento-aberto">Relacionamento aberto</option>
                  <option value="viuvo(a)">Viúvo(a)</option>
                  <option value="divorciado(a)">Divorciado(a)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 text-xs sm:text-sm font-bold mb-1 sm:mb-2" htmlFor="bio">
                  Quem sou eu
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:border-[#6d84b4] bg-[#f1f9ff] text-black"
                  rows={3}
                  maxLength={200}
                  placeholder="Conte um pouco sobre você..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-xs sm:text-sm font-bold mb-1 sm:mb-2" htmlFor="country">
                  País
                </label>
                <input
                  type="text"
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:border-[#6d84b4] bg-[#f1f9ff] text-black"
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#6d84b4] hover:bg-[#5d74a4] text-white font-bold text-xs sm:text-sm py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
                </button>
                
                <button
                  type="button"
                  onClick={() => router.push('/perfil')}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold text-xs sm:text-sm py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Cancelar
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