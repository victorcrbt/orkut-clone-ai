'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { User } from '@self/mocks/users';
import OrkutHeader from '@self/components/OrkutHeader';
import OrkutFooter from '@self/components/OrkutFooter';
import ProtectedRoute from '@self/components/ProtectedRoute';
import { useAuth } from '@self/firebase/AuthContext';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getPendingFriendRequests, getUserFriends, UserProfile } from '@self/firebase/userService';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [userFriends, setUserFriends] = useState<UserProfile[]>([]);
  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkProfileAndLoadUser = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        // Verificar se o perfil está completo no Firestore
        const db = getFirestore();
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          
          // Se o perfil não estiver completo, redirecionar
          if (userData.profileCompleted !== true) {
            router.push('/complete-profile');
            return;
          }
          
          // Usar os dados do Firestore para o usuário - incluindo dados sociais
          setUser({
            id: userData.uid,
            email: userData.email,
            name: userData.displayName,
            profilePicture: userData.photoURL,
            password: '', // Campo obrigatório na interface, mas não usado
            birthDate: userData.birthDate,
            gender: userData.gender,
            relationship: userData.relationship,
            bio: userData.bio,
            country: userData.country,
            profileCompleted: userData.profileCompleted
          });
          
          // Carregar solicitações de amizade pendentes
          const friendRequests = await getPendingFriendRequests(currentUser.uid);
          setPendingRequestsCount(friendRequests.length);
          
          // Carregar lista de amigos
          const friends = await getUserFriends(currentUser.uid);
          setUserFriends(friends);
        } else {
          // Se não encontrar os dados no Firestore, verificar o sessionStorage
          const storedUser = sessionStorage.getItem('currentUser');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
            // Se não tiver dados em lugar nenhum, redirecionar para completar perfil
            router.push('/complete-profile');
            return;
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkProfileAndLoadUser();
  }, [currentUser, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Carregando...</p>
      </div>
    );
  }

  // Função para formatar a data de nascimento
  const formatBirthDate = (dateString?: string) => {
    if (!dateString) return '••/••/••••';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return '••/••/••••';
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-[#e8eefa]">
        {/* Usar o componente OrkutHeader */}
        <OrkutHeader />

        {/* Notificação de solicitações de amizade pendentes */}
        {pendingRequestsCount > 0 && (
          <div className="mb-4 bg-white border border-pink-200 rounded-md p-3 flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-pink-500 mr-2 text-xl">🔔</span>
              <p className="text-sm">
                Você tem {pendingRequestsCount} {pendingRequestsCount === 1 ? 'solicitação' : 'solicitações'} de amizade pendente{pendingRequestsCount !== 1 ? 's' : ''}.
              </p>
            </div>
            <Link href="/amigos?tab=solicitacoes" className="bg-[#6d84b4] text-white text-xs px-3 py-1 rounded hover:bg-[#5d74a4]">
              Ver agora
            </Link>
          </div>
        )}

        {/* Conteúdo principal - Mobile First */}
        <main className="flex-1 container mx-auto p-2 sm:p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Coluna principal (conteúdo) - Em desktop fica no meio */}
            <div className="lg:col-span-2 lg:order-2">
              <div className="bg-white rounded-md overflow-hidden shadow-sm mb-4">
                {/* Conteúdo existente - Mantenha o que já estava na página */}
                <div className="bg-[#f0f7ff] p-4 border-b border-[#c9d6eb]">
                  <h1 className="text-[#315c99] text-lg font-bold">Olá, {user?.name}</h1>
                  <p className="text-xs text-gray-600 italic">"{user?.bio || 'Onde você investe seu amor, você investe sua vida.'}"</p>
                </div>
                
                <div className="p-4">
                  {/* Atividades e feed ficam aqui */}
                  <p className="text-sm text-gray-600 mb-4">Bem-vindo ao seu Orkut! Aqui você pode se conectar com amigos, participar de comunidades e muito mais.</p>
                  
                  {/* Algum conteúdo informativo aqui */}
                  <div className="border border-[#c9d6eb] rounded-md p-3 bg-[#f8faff] mb-4">
                    <h2 className="text-[#315c99] font-bold text-sm mb-1">Dicas</h2>
                    <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
                      <li>Complete seu perfil para que seus amigos possam te encontrar</li>
                      <li>Busque e adicione amigos na plataforma</li>
                      <li>Participe das comunidades com assuntos do seu interesse</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Coluna 1 (profile summary) - Em desktop fica à esquerda */}
            <div className="lg:order-1 lg:col-span-1">
              <div className="bg-white rounded-md shadow-sm mb-4">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 mb-2 relative">
                      <Image
                        src={user?.profilePicture || "https://via.placeholder.com/96"}
                        alt={user?.name || "Perfil"}
                        width={96}
                        height={96}
                        className="border border-gray-300"
                      />
                    </div>
                    <h2 className="text-[#315c99] font-bold text-sm">{user?.name}</h2>
                    <p className="text-xs text-gray-500">{user?.relationship || 'solteiro(a)'}, {user?.country || 'Brasil'}</p>
                  </div>
                </div>
                <div className="p-3">
                  <Link href="/perfil" className="text-xs text-[#315c99] hover:underline block mb-1">
                    Meu perfil
                  </Link>
                  <Link href="/recados" className="text-xs text-[#315c99] hover:underline block mb-1">
                    Recados
                  </Link>
                  <Link href="/amigos" className="text-xs text-[#315c99] hover:underline block mb-1">
                    Amigos ({userFriends.length})
                  </Link>
                  <Link href="/buscar" className="text-xs text-[#315c99] hover:underline block">
                    Buscar amigos
                  </Link>
                </div>
              </div>
            </div>

            {/* Coluna 3 (amigos) - Em telas menores fica embaixo */}
            <div className="lg:order-3 lg:col-span-1">
              <div className="bg-white rounded-md p-4 shadow-sm mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-[#315c99] font-semibold text-sm">Amigos ({userFriends.length})</h3>
                  <Link href="/amigos" className="text-xs text-[#315c99] hover:underline">
                    ver todos
                  </Link>
                </div>
                
                {userFriends.length === 0 ? (
                  <div className="bg-gray-50 p-3 rounded text-center">
                    <p className="text-xs text-gray-500 mb-2">Você ainda não tem amigos.</p>
                    <Link href="/buscar" className="bg-[#6d84b4] text-white text-xs px-3 py-1 rounded hover:bg-[#5d74a4]">
                      Adicionar amigos
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {userFriends.slice(0, 9).map(friend => (
                        <Link key={friend.uid} href={`/perfil/${friend.uid}`} className="text-center">
                          <div className="mb-1">
                            <Image
                              src={friend.photoURL || "https://via.placeholder.com/50"}
                              alt={friend.displayName}
                              width={50}
                              height={50}
                              className="border border-gray-300 mx-auto"
                            />
                          </div>
                          <span className="text-xs text-[#315c99] hover:underline line-clamp-1">
                            {friend.displayName}
                          </span>
                        </Link>
                      ))}
                    </div>
                    
                    {/* Link para buscar mais amigos */}
                    <div className="text-center border-t border-gray-100 pt-2">
                      <Link href="/buscar" className="text-xs text-[#315c99] hover:underline">
                        buscar mais amigos
                      </Link>
                    </div>
                  </>
                )}
              </div>
              
              {/* Comunidades - Pode ser implementado posteriormente */}
              <div className="bg-white rounded-md p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-[#315c99] font-semibold text-sm">Comunidades (0)</h3>
                  <Link href="#" className="text-xs text-[#315c99] hover:underline">
                    ver todas
                  </Link>
                </div>
                
                <div className="bg-gray-50 p-3 rounded text-center">
                  <p className="text-xs text-gray-500">Você ainda não participa de nenhuma comunidade.</p>
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