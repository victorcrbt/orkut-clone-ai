'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Inicio() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar para o dashboard
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-xl">Redirecionando...</p>
    </div>
  );
} 