import Link from 'next/link';

export default function OrkutFooter() {
  return (
    <footer className="w-full text-xs text-gray-600 p-4 mt-4 text-center border-t border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto">
        <p className="mb-2">
          <Link href="#" className="text-gray-600 hover:underline mx-1">Sobre o Orkut</Link> - 
          <Link href="#" className="text-gray-600 hover:underline mx-1">Centro de segurança</Link> - 
          <Link href="#" className="text-gray-600 hover:underline mx-1">Privacidade</Link> - 
          <Link href="#" className="text-gray-600 hover:underline mx-1">Termos</Link> - 
          <Link href="#" className="text-gray-600 hover:underline mx-1">Contato</Link>
        </p>
        <p className="text-gray-500">
          © 2023 Google - Orkut.br - Todos os direitos reservados
        </p>
      </div>
    </footer>
  );
} 