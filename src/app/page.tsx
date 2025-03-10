'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import OrkutFooter from '@self/components/OrkutFooter';
import { useAuth } from '../firebase/AuthContext';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saveInfo, setSaveInfo] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login, loginWithGoogle, currentUser } = useAuth();

  // Redirecionar para o dashboard se já estiver logado
  useEffect(() => {
    if (currentUser) {
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Preencha todos os campos');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      router.push('/dashboard');
    } catch (error) {
      console.error('Erro de login:', error);
      setError('Email ou senha incorretos');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await loginWithGoogle();
      
      // Verificar se é o primeiro login ou se precisa completar o perfil
      const db = getFirestore();
      const userRef = doc(db, "users", result.user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists() && userSnap.data().profileCompleted === true) {
        router.push('/dashboard');
      } else {
        router.push('/complete-profile');
      }
    } catch (error) {
      console.error('Erro de login com Google:', error);
      setError('Erro ao fazer login com Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full mx-auto flex flex-col md:flex-row">
        {/* Coluna esquerda com logo e descrição */}
        <div className="p-8 flex-1 flex flex-col items-center justify-center text-center bg-white rounded-l shadow-md">
          <h1 className="text-pink-500 text-6xl font-bold mb-6">orkut</h1>
          <div className="text-pink-700 text-sm px-4">
            <p className="mb-1">Conecta-se aos seus amigos e familiares usando recados e mensagens instantâneas</p>
            <p className="mb-1">Conheça novas pessoas através de amigos de seus amigos e comunidades</p>
            <p>Compartilhe seus vídeos, fotos e paixões em um só lugar</p>
          </div>
        </div>

        {/* Coluna direita com formulário de login */}
        <div className="bg-gray-100 p-6 flex-1 rounded-r shadow-md">
          <h2 className="text-gray-700 mb-4">Acesse o <span className="font-bold">orkut.br</span> com a sua conta</h2>
          
          {error && (
            <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="block text-gray-700 mb-1">E-mail:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-64 p-1 border border-gray-300 bg-white text-black"
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="password" className="block text-gray-700 mb-1">Senha:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-64 p-1 border border-gray-300 bg-white text-black"
              />
            </div>
            
            <div className="mb-3 flex items-start">
              <div 
                className="w-4 h-4 mr-2 mt-0.5 bg-white border border-gray-500 cursor-pointer"
                onClick={() => setSaveInfo(!saveInfo)}
                style={{ display: 'inline-block' }}
              >
                {saveInfo && <div className="w-full h-full bg-gray-800"></div>}
              </div>
              <label 
                htmlFor="saveInfo" 
                className="text-sm text-gray-700 cursor-pointer" 
                onClick={() => setSaveInfo(!saveInfo)}
              >
                Salvar as minhas informações neste computador
              </label>
            </div>
            
            <p className="text-xs text-gray-500 mb-3">Não use em computadores públicos. [?]</p>
            
            <button
              type="submit"
              className="w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition-colors"
              disabled={loading}
            >
              {loading ? 'Carregando...' : 'Entrar'}
            </button>
            
            <div className="mt-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-white border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                  <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                  <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
                </svg>
                Entrar com Google
              </button>
            </div>
          </form>
          
          <div className="mt-3">
            <Link href="#" className="text-sm text-blue-600 hover:underline">
              Não consegue acessar a sua conta?
            </Link>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-300">
            <p className="text-gray-700 mb-1">Ainda não é membro?</p>
            <div className="text-right">
              <Link href="#" className="font-bold text-blue-600 uppercase hover:underline">
                ENTRAR JÁ
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <OrkutFooter />
    </div>
  );
}
