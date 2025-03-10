export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  profilePicture?: string;
  birthDate?: string;
  gender?: string;
  relationship?: string;
  bio?: string;
  country?: string;
  profileCompleted?: boolean;
}

// Usuários mockados para simular autenticação
export const users: User[] = [
  {
    id: '1',
    email: 'madivcb@gmail.com',
    password: '123456',
    name: 'Usuário de Teste',
    profilePicture: '/profile-default.jpg'
  },
  {
    id: '2',
    email: 'maria@example.com',
    password: 'senha123',
    name: 'Maria Silva',
    profilePicture: '/profile-default.jpg'
  },
  {
    id: '3',
    email: 'joao@example.com',
    password: 'senha123',
    name: 'João Santos',
    profilePicture: '/profile-default.jpg'
  }
];

// Função para autenticação simulada
export function authenticateUser(email: string, password: string): User | null {
  const user = users.find(
    (user) => user.email === email && user.password === password
  );
  
  if (!user) return null;
  
  // Não retornar a senha para o cliente
  const { password: _password, ...userWithoutPassword } = user;
  return userWithoutPassword as User;
} 