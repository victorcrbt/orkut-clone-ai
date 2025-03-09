'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authenticateUser } from '@self/mocks/users';
import OrkutHeader from '@self/components/OrkutHeader';
import OrkutFooter from '@self/components/OrkutFooter';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saveInfo, setSaveInfo] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    const user = authenticateUser(email, password);
    if (user) {
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      router.push('/dashboard');
    } else {
      setError('E-mail ou senha incorretos.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <OrkutHeader />

      <div className="p-6 flex flex-col">
        {/* Logo e slogan */}
        <div className="mb-6">
          <h1 className="text-pink-500 text-4xl font-bold mb-2">orkut</h1>
          <p className="text-white text-sm mb-1">
            Conecta-se aos seus amigos e familiares usando recados e mensagens instantâneas
          </p>
          <p className="text-white text-sm mb-1">
            Conheça novas pessoas através de amigos de seus amigos e comunidades
          </p>
          <p className="text-white text-sm">
            Compartilhe seus vídeos, fotos e paixões em um só lugar
          </p>
        </div>

        {/* Formulário de login */}
        <div className="mb-6">
          <h2 className="text-white text-xl mb-4">Acesse o orkut.br com a sua conta</h2>
          
          {error && (
            <div className="mb-4 p-2 bg-red-900 border border-red-700 text-white">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="block text-white mb-1">E-mail:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full md:w-64 p-1 border border-gray-400 text-black"
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="password" className="block text-white mb-1">Senha:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full md:w-64 p-1 border border-gray-400 text-black"
              />
            </div>
            
            <div className="mb-3 flex items-center">
              <input
                type="checkbox"
                id="saveInfo"
                checked={saveInfo}
                onChange={(e) => setSaveInfo(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="saveInfo" className="text-sm text-white">
                Salvar as minhas informações neste computador
              </label>
            </div>
            
            <p className="text-xs text-gray-400 mb-3">Não use em computadores públicos. [?]</p>
            
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1"
            >
              Login
            </button>
          </form>
          
          <div className="mt-3">
            <Link href="#" className="text-sm text-blue-400 hover:underline">
              Não consegue acessar a sua conta?
            </Link>
          </div>
        </div>
        
        <div className="pt-3">
          <p className="mb-1 text-white">Ainda não é membro?</p>
          <Link href="#" className="font-bold text-blue-400 hover:underline">
            ENTRAR JÁ
          </Link>
        </div>
      </div>
      
      <OrkutFooter />
    </div>
  );
}
