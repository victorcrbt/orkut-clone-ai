'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@self/firebase/AuthContext';
import UserProfileForm from '@self/components/UserProfileForm';
import OrkutHeader from '@self/components/OrkutHeader';
import OrkutFooter from '@self/components/OrkutFooter';
import ProtectedRoute from '@self/components/ProtectedRoute';

export default function CompleteProfile() {
  const router = useRouter();
  const { currentUser, loading } = useAuth();
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const checkProfileStatus = async () => {
      if (!currentUser) {
        return;
      }

      try {
        const db = getFirestore();
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setIsProfileComplete(userData.profileCompleted === true);
        } else {
          setIsProfileComplete(false);
        }
      } catch (error) {
        console.error("Erro ao verificar perfil:", error);
        setIsProfileComplete(false);
      } finally {
        setCheckingStatus(false);
      }
    };

    if (!loading) {
      checkProfileStatus();
    }
  }, [currentUser, loading]);

  useEffect(() => {
    // Redirecionar para o dashboard se o perfil estiver completo
    if (isProfileComplete === true) {
      router.push('/dashboard');
    }
    // Redirecionar para a página de login se não estiver autenticado
    if (!loading && !currentUser) {
      router.push('/auth/login');
    }
  }, [isProfileComplete, currentUser, loading, router]);

  const handleProfileComplete = () => {
    router.push('/dashboard');
  };

  if (loading || checkingStatus || isProfileComplete === null) {
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
        
        <main className="flex-1 py-10">
          <div className="max-w-4xl mx-auto px-4">
            <UserProfileForm onComplete={handleProfileComplete} />
          </div>
        </main>
        
        <OrkutFooter />
      </div>
    </ProtectedRoute>
  );
} 