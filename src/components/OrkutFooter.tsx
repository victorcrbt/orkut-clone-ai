import Link from 'next/link';

export default function OrkutFooter() {
  return (
    <footer className="w-full text-[10px] text-gray-600 p-2 mt-1 text-center border-t border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto">
        <p className="mb-1">
          <Link href="#" className="text-[#315c99] hover:underline mx-1">Sobre o Orkut</Link> • 
          <Link href="#" className="text-[#315c99] hover:underline mx-1">Centro de segurança</Link> • 
          <Link href="#" className="text-[#315c99] hover:underline mx-1">Privacidade</Link> • 
          <Link href="#" className="text-[#315c99] hover:underline mx-1">Termos</Link> • 
          <Link href="#" className="text-[#315c99] hover:underline mx-1">Contato</Link>
        </p>
        <p className="text-gray-500">
          © 2023 Google - Orkut.br
        </p>
      </div>
    </footer>
  );
} 