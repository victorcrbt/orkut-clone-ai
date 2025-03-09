'use client';

import React from 'react';
import { AuthProvider } from '../firebase/AuthContext';

interface AuthProviderClientProps {
  children: React.ReactNode;
}

export default function AuthProviderClient({ children }: AuthProviderClientProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
} 