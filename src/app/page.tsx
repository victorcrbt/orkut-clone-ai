'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authenticateUser } from '@self/mocks/users';
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
              className="bg-blue-600 text-white px-4 py-0 h-7"
            >
              Login
            </button>
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
