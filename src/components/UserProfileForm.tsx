'use client';

import { useState } from 'react';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { useAuth } from '@self/firebase/AuthContext';

interface UserProfileFormProps {
  onComplete: () => void;
}

const UserProfileForm = ({ onComplete }: UserProfileFormProps) => {
  const { currentUser } = useAuth();
  const [name, setName] = useState(currentUser?.displayName || '');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [relationship, setRelationship] = useState('');
  const [bio, setBio] = useState('');
  const [country, setCountry] = useState('Brasil');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    setIsSubmitting(true);
    
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
        profileCompleted: true,
        updatedAt: new Date().toISOString()
      };
      
      const db = getFirestore();
      await setDoc(doc(db, "users", currentUser.uid), userData, { merge: true });
      
      // Salvar as informações localmente se necessário
      sessionStorage.setItem('currentUser', JSON.stringify(userData));
      
      // Informar ao componente pai que terminou
      onComplete();
    } catch (error) {
      console.error("Erro ao salvar dados do perfil:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md w-full max-w-md mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold text-[#315c99] mb-3 sm:mb-4">Complete seu perfil</h2>
      <p className="mb-4 text-gray-600 text-xs sm:text-sm">
        Para melhorar sua experiência no Orkut, precisamos de algumas informações adicionais.
      </p>
      
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
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:border-[#6d84b4] bg-white text-black"
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
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:border-[#6d84b4] bg-white text-black"
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
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:border-[#6d84b4] bg-white text-black"
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
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:border-[#6d84b4] bg-white text-black"
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
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:border-[#6d84b4] bg-white text-black"
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
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:border-[#6d84b4] bg-white text-black"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#6d84b4] hover:bg-[#5d74a4] text-white font-bold text-xs sm:text-sm py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
        >
          {isSubmitting ? 'Salvando...' : 'Concluir Cadastro'}
        </button>
      </form>
    </div>
  );
};

export default UserProfileForm; 