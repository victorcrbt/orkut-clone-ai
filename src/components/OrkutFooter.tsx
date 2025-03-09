import Link from 'next/link';

export default function OrkutFooter() {
  return (
    <div className="w-full text-xs text-gray-600 p-2 mt-1 text-center">
      <p>
        © 2023 Orkut.br - 
        <Link href="#" className="text-gray-600 hover:underline mx-1">Sobre o Orkut.br</Link> - 
        <Link href="#" className="text-gray-600 hover:underline mx-1">Centro de segurança</Link> - 
        <Link href="#" className="text-gray-600 hover:underline mx-1">Privacidade</Link> - 
        <Link href="#" className="text-gray-600 hover:underline mx-1">Termos</Link> - 
        <Link href="#" className="text-gray-600 hover:underline mx-1">Contato</Link> - 
        Desenvolvido por Equipe Orkut
      </p>
    </div>
  );
} 