import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  orderBy,
  limit,
  startAt,
  endAt,
  writeBatch
} from 'firebase/firestore';
import { db } from './config';

// Interface para o perfil de usuário
export interface UserProfile {
  uid: string;
  email?: string;
  displayName: string;
  photoURL?: string;
  birthDate?: string;
  gender?: string;
  relationship?: string;
  bio?: string;
  country?: string;
  friends?: string[];
  friendRequests?: string[];
  pendingRequests?: string[];
  communities?: string[]; // IDs das comunidades que o usuário participa
}

/**
 * Atualiza o campo de busca no documento do usuário
 * @param uid ID do usuário
 * @param displayName Nome de exibição atual
 */
export async function updateUserSearchField(uid: string, displayName: string): Promise<void> {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      displayNameLower: displayName.toLowerCase(),
      // Podemos adicionar outros campos para facilitar a busca se necessário
    });
  } catch (error) {
    console.error("Erro ao atualizar campo de busca:", error);
  }
}

/**
 * Busca usuários pelo nome de exibição
 * @param searchTerm Termo de busca
 * @param maxResults Número máximo de resultados (padrão: 10)
 */
export async function searchUsers(searchTerm: string, maxResults: number = 10): Promise<UserProfile[]> {
  try {
    if (!searchTerm.trim()) return [];

    const searchTermLower = searchTerm.toLowerCase();
    const usersRef = collection(db, "users");
    
    // Tentativa de usar a abordagem 2 (mais eficiente) se o campo displayNameLower existir
    try {
      // Abordagem 2: Usando campo displayNameLower para busca parcial mais eficiente
      const q2 = query(
        usersRef,
        orderBy("displayNameLower"),
        startAt(searchTermLower),
        endAt(searchTermLower + '\uf8ff'),
        limit(maxResults)
      );
      
      const querySnapshot2 = await getDocs(q2);
      if (!querySnapshot2.empty) {
        const users: UserProfile[] = [];
        querySnapshot2.forEach((doc) => {
          const userData = doc.data() as UserProfile;
          users.push(userData);
        });
        
        // Se encontramos resultados, retornamos
        if (users.length > 0) {
          return users;
        }
      }
    } catch (indexError) {
      // Se der erro na abordagem 2 (provavelmente pela falta de índice),
      // continuamos com a abordagem 1
      console.warn("Usando método de busca alternativo:", indexError);
    }
    
    // Abordagem 1: Busca usando um range amplo e filtro client-side
    // Isso permite buscas parciais em qualquer parte do nome
    const q = query(
      usersRef,
      limit(100) // Limite mais alto para depois filtrar
    );

    const querySnapshot = await getDocs(q);
    const users: UserProfile[] = [];
    
    // Filtra os resultados no lado do cliente para permitir busca parcial
    querySnapshot.forEach((doc) => {
      const userData = doc.data() as UserProfile;
      
      // Verifica se o displayName contém o termo de busca (case insensitive)
      if (userData.displayName && 
          userData.displayName.toLowerCase().includes(searchTermLower)) {
        users.push(userData);
      }
    });
    
    // Ordenação e limite dos resultados
    return users
      .sort((a, b) => a.displayName.localeCompare(b.displayName))
      .slice(0, maxResults);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return [];
  }
}

/**
 * Obtém o perfil de um usuário pelo ID
 * @param uid ID do usuário
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    
    return null;
  } catch (error) {
    console.error("Erro ao obter perfil do usuário:", error);
    return null;
  }
}

/**
 * Envia uma solicitação de amizade
 * @param currentUserUid ID do usuário atual
 * @param targetUserUid ID do usuário para quem será enviada a solicitação
 */
export async function sendFriendRequest(currentUserUid: string, targetUserUid: string): Promise<boolean> {
  try {
    if (currentUserUid === targetUserUid) {
      throw new Error("Não é possível adicionar a si mesmo como amigo");
    }
    
    // Atualizar a lista de solicitações pendentes do usuário atual
    const currentUserRef = doc(db, "users", currentUserUid);
    await updateDoc(currentUserRef, {
      pendingRequests: arrayUnion(targetUserUid)
    });
    
    // Atualizar a lista de solicitações de amizade do usuário alvo
    const targetUserRef = doc(db, "users", targetUserUid);
    await updateDoc(targetUserRef, {
      friendRequests: arrayUnion(currentUserUid)
    });
    
    return true;
  } catch (error) {
    console.error("Erro ao enviar solicitação de amizade:", error);
    return false;
  }
}

/**
 * Aceita uma solicitação de amizade
 * @param currentUserUid ID do usuário atual
 * @param friendUid ID do amigo
 */
export async function acceptFriendRequest(currentUserUid: string, friendUid: string): Promise<boolean> {
  try {
    // Atualizar o documento do usuário atual
    const currentUserRef = doc(db, "users", currentUserUid);
    await updateDoc(currentUserRef, {
      friends: arrayUnion(friendUid),
      friendRequests: arrayRemove(friendUid)
    });
    
    // Atualizar o documento do amigo
    const friendRef = doc(db, "users", friendUid);
    await updateDoc(friendRef, {
      friends: arrayUnion(currentUserUid),
      pendingRequests: arrayRemove(currentUserUid)
    });
    
    return true;
  } catch (error) {
    console.error("Erro ao aceitar solicitação de amizade:", error);
    return false;
  }
}

/**
 * Rejeita uma solicitação de amizade
 * @param currentUserUid ID do usuário atual
 * @param requestUid ID do usuário que enviou a solicitação
 */
export async function rejectFriendRequest(currentUserUid: string, requestUid: string): Promise<boolean> {
  try {
    // Remover da lista de solicitações do usuário atual
    const currentUserRef = doc(db, "users", currentUserUid);
    await updateDoc(currentUserRef, {
      friendRequests: arrayRemove(requestUid)
    });
    
    // Remover da lista de pendentes do outro usuário
    const requestUserRef = doc(db, "users", requestUid);
    await updateDoc(requestUserRef, {
      pendingRequests: arrayRemove(currentUserUid)
    });
    
    return true;
  } catch (error) {
    console.error("Erro ao rejeitar solicitação de amizade:", error);
    return false;
  }
}

/**
 * Remove um amigo
 * @param currentUserUid ID do usuário atual
 * @param friendUid ID do amigo a ser removido
 */
export async function removeFriend(currentUserUid: string, friendUid: string): Promise<boolean> {
  try {
    // Remover o amigo da lista do usuário atual
    const currentUserRef = doc(db, "users", currentUserUid);
    await updateDoc(currentUserRef, {
      friends: arrayRemove(friendUid)
    });
    
    // Remover o usuário atual da lista do amigo
    const friendRef = doc(db, "users", friendUid);
    await updateDoc(friendRef, {
      friends: arrayRemove(currentUserUid)
    });
    
    return true;
  } catch (error) {
    console.error("Erro ao remover amigo:", error);
    return false;
  }
}

/**
 * Obtém a lista de amigos de um usuário
 * @param uid ID do usuário
 */
export async function getUserFriends(uid: string): Promise<UserProfile[]> {
  try {
    const userProfile = await getUserProfile(uid);
    
    if (!userProfile || !userProfile.friends || userProfile.friends.length === 0) {
      return [];
    }
    
    const friendProfiles: UserProfile[] = [];
    
    // Buscar o perfil de cada amigo
    for (const friendId of userProfile.friends) {
      const friendProfile = await getUserProfile(friendId);
      if (friendProfile) {
        friendProfiles.push(friendProfile);
      }
    }
    
    return friendProfiles;
  } catch (error) {
    console.error("Erro ao obter amigos do usuário:", error);
    return [];
  }
}

/**
 * Obtém solicitações de amizade pendentes para o usuário
 * @param uid ID do usuário
 */
export async function getPendingFriendRequests(uid: string): Promise<UserProfile[]> {
  try {
    const userProfile = await getUserProfile(uid);
    
    if (!userProfile || !userProfile.friendRequests || userProfile.friendRequests.length === 0) {
      return [];
    }
    
    const requestProfiles: UserProfile[] = [];
    
    for (const requestId of userProfile.friendRequests) {
      const requestProfile = await getUserProfile(requestId);
      if (requestProfile) {
        requestProfiles.push(requestProfile);
      }
    }
    
    return requestProfiles;
  } catch (error) {
    console.error("Erro ao obter solicitações de amizade pendentes:", error);
    return [];
  }
}

/**
 * Atualiza os campos de busca para todos os usuários existentes
 * Esta função deve ser executada uma vez para adicionar o campo displayNameLower
 * a todos os usuários existentes
 */
export async function updateAllUsersSearchFields(): Promise<void> {
  try {
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(usersRef);
    
    const batch = writeBatch(db);
    let count = 0;
    
    querySnapshot.forEach((userDoc) => {
      const userData = userDoc.data() as UserProfile;
      
      if (userData.displayName) {
        const userRef = doc(db, "users", userData.uid);
        batch.update(userRef, {
          displayNameLower: userData.displayName.toLowerCase()
        });
        count++;
      }
    });
    
    if (count > 0) {
      await batch.commit();
      console.log(`Campos de busca atualizados para ${count} usuários.`);
    }
  } catch (error) {
    console.error("Erro ao atualizar campos de busca:", error);
  }
} 