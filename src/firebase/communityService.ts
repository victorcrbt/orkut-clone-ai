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
  limit as firestoreLimit,
  startAt,
  endAt,
  Timestamp,
  addDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from './config';
import { UserProfile } from './userService';

// Interface para uma comunidade
export interface Community {
  id?: string;
  name: string;
  description: string;
  category: string;
  photoURL?: string;
  createdAt: Timestamp | string;
  createdBy: string; // UID do usuário que criou
  members: string[]; // Lista de UIDs dos membros
  moderators: string[]; // Lista de UIDs dos moderadores
  isPublic: boolean;
  nameLower?: string; // Campo para busca case-insensitive
}

// Interface para membro de comunidade com informações do perfil
export interface CommunityMember extends UserProfile {
  joinedAt?: Timestamp | string;
  role?: 'membro' | 'moderador' | 'dono';
}

/**
 * Cria uma nova comunidade
 */
export async function createCommunity(communityData: Omit<Community, 'id' | 'createdAt' | 'members' | 'moderators'>): Promise<string | null> {
  try {
    // Remover campos undefined antes de salvar no Firestore
    const cleanData = { ...communityData };
    
    // Se photoURL for undefined, removê-lo do objeto
    if (cleanData.photoURL === undefined) {
      delete cleanData.photoURL;
    }
    
    const newCommunity: Omit<Community, 'id'> = {
      ...cleanData,
      nameLower: cleanData.name.toLowerCase(),
      createdAt: Timestamp.now(),
      members: [cleanData.createdBy], // Criador já é membro
      moderators: [cleanData.createdBy], // Criador já é moderador
    };
    
    const communityRef = collection(db, "communities");
    const docRef = await addDoc(communityRef, newCommunity);
    
    // Atualizar o usuário que criou para incluir esta comunidade
    try {
      const userRef = doc(db, "users", cleanData.createdBy);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Verificar se o usuário já possui o campo communities
        if (userData.communities) {
          // Se já tiver o campo, apenas adicionar a nova comunidade
          await updateDoc(userRef, {
            communities: arrayUnion(docRef.id)
          });
        } else {
          // Se não tiver o campo, criar com a nova comunidade
          await updateDoc(userRef, {
            communities: [docRef.id]
          });
        }
      }
    } catch (userError) {
      console.error("Erro ao atualizar perfil do usuário, mas a comunidade foi criada:", userError);
      // Não falharemos a criação da comunidade se a atualização do usuário falhar
    }
    
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar comunidade:", error);
    return null;
  }
}

/**
 * Obtém uma comunidade pelo ID
 */
export async function getCommunity(communityId: string): Promise<Community | null> {
  try {
    const communityRef = doc(db, "communities", communityId);
    const communitySnap = await getDoc(communityRef);
    
    if (communitySnap.exists()) {
      return { id: communitySnap.id, ...communitySnap.data() } as Community;
    }
    
    return null;
  } catch (error) {
    console.error("Erro ao obter comunidade:", error);
    return null;
  }
}

/**
 * Obtém todas as comunidades
 */
export async function getAllCommunities(limitCount: number = 50): Promise<Community[]> {
  try {
    const communitiesRef = collection(db, "communities");
    const q = query(communitiesRef, orderBy("createdAt", "desc"), firestoreLimit(limitCount));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Community[];
  } catch (error) {
    console.error("Erro ao obter comunidades:", error);
    return [];
  }
}

/**
 * Busca comunidades por nome
 */
export async function searchCommunities(searchTerm: string): Promise<Community[]> {
  try {
    const communitiesRef = collection(db, "communities");
    const searchTermLower = searchTerm.toLowerCase();
    const endStr = searchTermLower.replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));
    
    const q = query(
      communitiesRef,
      where("nameLower", ">=", searchTermLower),
      where("nameLower", "<", endStr),
      firestoreLimit(20)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Community[];
  } catch (error) {
    console.error("Erro ao buscar comunidades:", error);
    return [];
  }
}

/**
 * Obtém as comunidades de um usuário
 */
export async function getUserCommunities(userId: string): Promise<Community[]> {
  try {
    const communitiesRef = collection(db, "communities");
    const q = query(communitiesRef, where("members", "array-contains", userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Community[];
  } catch (error) {
    console.error("Erro ao obter comunidades do usuário:", error);
    return [];
  }
}

/**
 * Adiciona um usuário a uma comunidade
 */
export async function joinCommunity(communityId: string, userId: string): Promise<boolean> {
  try {
    // Verificar se o usuário já é membro
    const communityRef = doc(db, "communities", communityId);
    const communitySnap = await getDoc(communityRef);
    
    if (!communitySnap.exists()) {
      return false;
    }
    
    const communityData = communitySnap.data() as Community;
    if (communityData.members.includes(userId)) {
      return true; // Já é membro
    }
    
    // Adicionar usuário como membro da comunidade
    await updateDoc(communityRef, {
      members: arrayUnion(userId)
    });
    
    // Atualizar o usuário para incluir esta comunidade
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      communities: arrayUnion(communityId)
    });
    
    return true;
  } catch (error) {
    console.error("Erro ao entrar na comunidade:", error);
    return false;
  }
}

/**
 * Remove um usuário de uma comunidade
 */
export async function leaveCommunity(communityId: string, userId: string): Promise<boolean> {
  try {
    const communityRef = doc(db, "communities", communityId);
    const communitySnap = await getDoc(communityRef);
    
    if (!communitySnap.exists()) {
      return false;
    }
    
    const communityData = communitySnap.data() as Community;
    
    // Verificar se o usuário é o criador (não pode sair se for)
    if (communityData.createdBy === userId && communityData.moderators.length === 1) {
      return false; // Não pode sair se for o único moderador
    }
    
    // Remover usuário como membro da comunidade
    await updateDoc(communityRef, {
      members: arrayRemove(userId)
    });
    
    // Se for moderador, remover também
    if (communityData.moderators.includes(userId)) {
      await updateDoc(communityRef, {
        moderators: arrayRemove(userId)
      });
    }
    
    // Atualizar o usuário para remover esta comunidade
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      communities: arrayRemove(communityId)
    });
    
    return true;
  } catch (error) {
    console.error("Erro ao sair da comunidade:", error);
    return false;
  }
}

/**
 * Atualiza as informações de uma comunidade
 */
export async function updateCommunity(communityId: string, data: Partial<Community>): Promise<boolean> {
  try {
    const communityRef = doc(db, "communities", communityId);
    const updateData: any = { ...data };
    
    // Se o nome foi atualizado, atualizar também o campo de busca
    if (data.name) {
      updateData.nameLower = data.name.toLowerCase();
    }
    
    await updateDoc(communityRef, updateData);
    return true;
  } catch (error) {
    console.error("Erro ao atualizar comunidade:", error);
    return false;
  }
}

/**
 * Exclui uma comunidade
 */
export async function deleteCommunity(communityId: string): Promise<boolean> {
  try {
    const communityRef = doc(db, "communities", communityId);
    const communitySnap = await getDoc(communityRef);
    
    if (!communitySnap.exists()) {
      return false;
    }
    
    const communityData = communitySnap.data() as Community;
    
    // Atualizar todos os usuários que são membros para remover esta comunidade
    for (const memberId of communityData.members) {
      const userRef = doc(db, "users", memberId);
      await updateDoc(userRef, {
        communities: arrayRemove(communityId)
      });
    }
    
    // Excluir a comunidade
    await deleteDoc(communityRef);
    return true;
  } catch (error) {
    console.error("Erro ao excluir comunidade:", error);
    return false;
  }
}

/**
 * Obtém todos os membros de uma comunidade
 */
export async function getCommunityMembers(communityId: string): Promise<CommunityMember[]> {
  try {
    const communityRef = doc(db, "communities", communityId);
    const communitySnap = await getDoc(communityRef);
    
    if (!communitySnap.exists()) {
      return [];
    }
    
    const communityData = communitySnap.data() as Community;
    const members: CommunityMember[] = [];
    
    // Buscar informações de cada membro
    for (const memberId of communityData.members) {
      const userRef = doc(db, "users", memberId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data() as UserProfile;
        let role: 'membro' | 'moderador' | 'dono' = 'membro';
        
        if (memberId === communityData.createdBy) {
          role = 'dono';
        } else if (communityData.moderators.includes(memberId)) {
          role = 'moderador';
        }
        
        members.push({
          ...userData,
          role
        });
      }
    }
    
    return members;
  } catch (error) {
    console.error("Erro ao obter membros da comunidade:", error);
    return [];
  }
} 