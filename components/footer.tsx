import Link from 'next/link';
import { Instagram, Mail, Phone } from 'lucide-react';
import Image from 'next/image';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white">
      <div className="container-custom mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="text-center md:text-left">
            <div className="flex items-center mb-4 justify-center md:justify-start">
              <Image 
                src="/images/gs-logo-2.svg" 
                width={50} 
                height={35} 
                alt="GS Produções Logo" 
                className="mr-2"
              />
            </div>
            <p>Espaço dedicado à equipe GS: informações, formulários e recursos internos.</p>
          </div>

           <div className="text-center md:text-left">
            <h4 className="text-xl font-neoverse-bold mb-4 text-white">Normas da empresa</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/politicas"
                  className="text-slate-300 hover:text-secondary transition-all duration-300 hover:translate-x-1 inline-block flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Regulamento Interno
                </Link>
              </li>
              <li>
                <Link
                  href="/politicas/uso-dos-recursos-financeiros"
                  className="text-slate-300 hover:text-secondary transition-all duration-300 hover:translate-x-1 inline-block flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c1.657 0 3-1.567 3-3.5S13.657 1 12 1 9 2.567 9 4.5 10.343 8 12 8zm0 2c-2.21 0-4 1.343-4 3v4.5A2.5 2.5 0 0010.5 20h3a2.5 2.5 0 002.5-2.5V13c0-1.657-1.79-3-4-3zm6 2a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V15a2 2 0 012-2zm-12 0a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V15a2 2 0 012-2z" />
                  </svg>
                  Uso dos Recursos Financeiros
                </Link>
              </li>
             
            </ul>
            <p className="text-slate-400 text-xs mt-4 leading-relaxed">
              Acesse documentos importantes, políticas internas e diretrizes da empresa
            </p>
          </div>

          <div className="text-center md:text-left">
            <h4 className="text-xl font-neoverse-bold mb-4 text-white">Formulários</h4>
            <p className="text-slate-400 text-sm mb-4 leading-relaxed">
              Registre atividades e mantenha processos rastreáveis
            </p>
            <Link
              href="/formularios"
              className="text-slate-300 hover:text-secondary transition-all duration-300 hover:translate-x-1 inline-block"
            >
              Ver todos os formulários →
            </Link>
          </div> 

          <div className="text-center md:text-left">
            <h4 className="text-lg font-bold mb-4 text-white">Reportar Bug</h4>
            <p className="text-slate-300 text-sm mb-4">
              Encontrou algum problema na intranet?
            </p>
            <a
              href="https://wa.me/5521968793611?text=Olá%2C%20encontrei%20um%20bug%20na%20intranet%3A%20"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <Phone className="h-5 w-5" />
              Reportar via WhatsApp
            </a>
            <ul className="space-y-4 mt-6">
              <li className="flex flex-col gap-1 mt-2 items-center md:items-start">
                <div className="flex items-center gap-3">
                  <a
                    href="https://instagram.com/_gsproducoess"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-secondary transition-all duration-300 hover:scale-110"
                    aria-label="Instagram"
                  >
                    <Instagram size={24} />
                  </a>
                  <a
                    href="https://linkedin.com/in/gs-produções-a92abb351"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-secondary transition-all duration-300 hover:scale-110"
                    aria-label="LinkedIn"
                    title="LinkedIn"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" className="w-6 h-6" fill="currentColor">
                      <path d="M727.6,0H72.4C32.4,0,0,32.4,0,72.4v655.3C0,767.6,32.4,800,72.4,800h655.3c40,0,72.4-32.4,72.4-72.4V72.4C800,32.4,767.6,0,727.6,0ZM247.6,690.8c0,11.6-9.4,21.1-21.1,21.1h-89.6c-11.6,0-21.1-9.4-21.1-21.1v-375.8c0-11.6,9.4-21.1,21.1-21.1h89.6c11.6,0,21.1,9.4,21.1,21.1v375.8ZM181.7,258.5c-47,0-85.2-38.1-85.2-85.2s38.1-85.2,85.2-85.2,85.2,38.1,85.2,85.2-38.1,85.2-85.2,85.2ZM716,692.5c0,10.7-8.7,19.4-19.4,19.4h-96.2c-10.7,0-19.4-8.7-19.4-19.4v-176.3c0-26.3,7.7-115.2-68.7-115.2s-71.3,60.9-73.7,88.2v203.3c0,10.7-8.7,19.4-19.4,19.4h-93c-10.7,0-19.4-8.7-19.4-19.4v-379.2c0-10.7,8.7-19.4,19.4-19.4h93c10.7,0,19.4,8.7,19.4,19.4v32.8c22-33,54.7-58.5,124.2-58.5,154,0,153.2,143.9,153.2,223v181.9h0Z" />
                    </svg>
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400 text-sm">
          <p>&copy; {currentYear} GS Produções. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}