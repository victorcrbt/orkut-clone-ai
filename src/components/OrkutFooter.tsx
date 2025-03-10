import Link from 'next/link';

export default function OrkutFooter() {
  return (
    <footer className="w-full text-[10px] text-gray-600 p-2 text-center mt-8">
      <div className="container mx-auto px-2">
        <div className="flex flex-wrap justify-center gap-1 sm:gap-0 mb-1">
          <Link href="#" className="text-[#315c99] hover:underline mx-0.5 sm:mx-1">Sobre o Orkut</Link>
          <span className="sm:inline">•</span>
          <Link href="#" className="text-[#315c99] hover:underline mx-0.5 sm:mx-1">Centro de segurança</Link>
          <span className="sm:inline">•</span>
          <Link href="#" className="text-[#315c99] hover:underline mx-0.5 sm:mx-1">Privacidade</Link>
          <span className="sm:inline">•</span>
          <Link href="#" className="text-[#315c99] hover:underline mx-0.5 sm:mx-1">Termos</Link>
          <span className="sm:inline">•</span>
          <Link href="#" className="text-[#315c99] hover:underline mx-0.5 sm:mx-1">Contato</Link>
        </div>
        <p className="text-gray-500">
          © 2023 Google - Orkut.br
        </p>
      </div>
    </footer>
  );
} 