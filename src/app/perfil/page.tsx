'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import OrkutHeader from '@self/components/OrkutHeader';
import OrkutFooter from '@self/components/OrkutFooter';
import ProtectedRoute from '@self/components/ProtectedRoute';
import { useAuth } from '@self/firebase/AuthContext';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

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

export default function PerfilPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const router = useRouter();

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
          setUserProfile(userSnap.data() as UserProfile);
        } else {
          console.error("Perfil do usuário não encontrado");
          router.push('/complete-profile');
          return;
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserProfile();
  }, [currentUser, router]);

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
          <div className="bg-white rounded-md overflow-hidden shadow-sm">
            {/* Header com foto e nome - Responsivo */}
            <div className="bg-[#f0f7ff] p-4 border-b border-[#c9d6eb]">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-[150px] h-[150px]">
                  <Image
                    src={userProfile?.photoURL || "https://via.placeholder.com/150"}
                    alt={userProfile?.displayName || "Perfil"}
                    width={150}
                    height={150}
                    className="border border-gray-300"
                  />
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-[#315c99] text-xl font-bold">{userProfile?.displayName}</h1>
                  <p className="text-gray-600 text-sm">
                    {userProfile?.gender === 'feminino' ? 'feminino' : 'masculino'}, 
                    {userProfile?.relationship || 'solteiro(a)'}
                  </p>
                  <p className="text-gray-600 text-sm">{userProfile?.country || 'Brasil'}</p>
                </div>
                <div className="sm:ml-auto">
                  <Link href="/perfil/editar">
                    <button className="bg-[#6d84b4] text-white text-xs px-4 py-1 rounded">
                      editar
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Conteúdo principal - Mobile First */}
            <div className="flex flex-col md:flex-row">
              {/* Menu lateral - Em mobile fica em cima */}
              <div className="w-full md:w-[180px] p-3 border-b md:border-b-0 md:border-r border-gray-200">
                <ul className="flex flex-wrap md:flex-col gap-1 md:gap-2">
                  <li className="flex items-center text-xs w-1/2 md:w-auto">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">✏️</span>
                    <Link href="/perfil/editar" className="text-[#315c99] hover:underline">editar perfil</Link>
                  </li>
                  <li className="flex items-center text-xs w-1/2 md:w-auto">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">👤</span>
                    <Link href="/perfil" className="text-[#315c99] hover:underline">perfil</Link>
                  </li>
                  <li className="flex items-center text-xs w-1/2 md:w-auto">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">✉️</span>
                    <Link href="#" className="text-[#315c99] hover:underline">recados</Link>
                  </li>
                  <li className="flex items-center text-xs w-1/2 md:w-auto">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">🖼️</span>
                    <Link href="#" className="text-[#315c99] hover:underline">álbum</Link>
                  </li>
                  <li className="flex items-center text-xs w-1/2 md:w-auto">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">🎥</span>
                    <Link href="#" className="text-[#315c99] hover:underline">vídeos</Link>
                  </li>
                  <li className="flex items-center text-xs w-1/2 md:w-auto">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">📰</span>
                    <Link href="#" className="text-[#315c99] hover:underline">feeds</Link>
                  </li>
                  <li className="flex items-center text-xs w-1/2 md:w-auto">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">📋</span>
                    <Link href="#" className="text-[#315c99] hover:underline">listas</Link>
                  </li>
                  <li className="flex items-center text-xs w-1/2 md:w-auto">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">💬</span>
                    <Link href="#" className="text-[#315c99] hover:underline">mensagens</Link>
                  </li>
                  <li className="flex items-center text-xs w-1/2 md:w-auto">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">⭐</span>
                    <Link href="#" className="text-[#315c99] hover:underline">depoimentos</Link>
                  </li>
                  <li className="flex items-center text-xs w-1/2 md:w-auto">
                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-[#315c99]">⚙️</span>
                    <Link href="#" className="text-[#315c99] hover:underline">configurações</Link>
                  </li>
                </ul>
              </div>
              
              {/* Conteúdo central */}
              <div className="flex-1 p-3">
                <div className="mb-3">
                  <h2 className="text-[#315c99] text-lg font-bold mb-1">{userProfile?.displayName}</h2>
                  <p className="text-xs text-gray-600 italic">
                    "Where you invest your love, you invest your life."
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 border-t border-b border-gray-200 py-2 mb-3">
                  <div className="text-xs">
                    <span className="text-gray-600">recados</span>
                    <span className="ml-1 text-[#315c99]">0</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-600">fotos</span>
                    <span className="ml-1 text-[#315c99]">0</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-600">vídeos</span>
                    <span className="ml-1 text-[#315c99]">0</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-600">fãs</span>
                    <span className="ml-1 text-[#315c99]">0</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-600">confiável</span>
                    <span className="ml-1 text-[#315c99]">-</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-600">legal</span>
                    <span className="ml-1 text-[#315c99]">-</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-600">sexy</span>
                    <span className="ml-1 text-[#315c99]">-</span>
                  </div>
                </div>
                
                {/* Box social - estilo orkut */}
                <div className="bg-[#f1f3f8] rounded overflow-hidden mb-3">
                  <div className="bg-[#6d84b4] px-2 py-1">
                    <h3 className="text-white text-xs font-bold">social</h3>
                  </div>
                  <div className="p-3">
                    <table className="w-full text-xs">
                      <tbody>
                        <tr>
                          <td className="py-1 text-right pr-3 text-gray-600 w-1/3 sm:w-1/4 align-top">aniversário:</td>
                          <td className="py-1">
                            {userProfile?.birthDate ? new Date(userProfile.birthDate).toLocaleDateString('pt-BR') : '••/••/••••'}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1 text-right pr-3 text-gray-600 align-top">relacionamento:</td>
                          <td className="py-1">{userProfile?.relationship || 'solteiro(a)'}</td>
                        </tr>
                        <tr>
                          <td className="py-1 text-right pr-3 text-gray-600 align-top">quem sou eu:</td>
                          <td className="py-1">{userProfile?.bio || 'Jornalista carioca que ama livros, músicas e filmes.'}</td>
                        </tr>
                        <tr>
                          <td className="py-1 text-right pr-3 text-gray-600 align-top">país:</td>
                          <td className="py-1">{userProfile?.country || 'Brasil'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              {/* Coluna da direita - Em mobile fica embaixo */}
              <div className="w-full md:w-[180px] p-3 border-t md:border-t-0 md:border-l border-gray-200">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-bold text-[#315c99]">
                      amigos <span className="text-[#315c99]">(0)</span>
                    </h3>
                    <Link href="#" className="text-[10px] text-[#315c99] hover:underline">ver todos</Link>
                  </div>
                  <p className="text-[11px] text-gray-600">você ainda não adicionou nenhum amigo</p>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-bold text-[#315c99]">
                      comunidades <span className="text-[#315c99]">(0)</span>
                    </h3>
                    <Link href="#" className="text-[10px] text-[#315c99] hover:underline">ver todos</Link>
                  </div>
                  <p className="text-[11px] text-gray-600">você ainda não adicionou nenhuma comunidade</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <OrkutFooter />
      </div>
    </ProtectedRoute>
  );
} 