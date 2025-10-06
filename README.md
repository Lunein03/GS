# Intranet GS Produções

Portal interno desenvolvido com Next.js 15 para centralizar comunicação, formulários corporativos e políticas internas da GS Produções. A aplicação nasce como uma intranet moderna, acessível e pensada para evoluir com novos fluxos internos.

## ✨ Funcionalidades principais
- **Área pública** com apresentação institucional e hero principal.
- **Área interna** com formulários de Horas Extras e Prestação de Contas, além do hub de Políticas Corporativas.
- **Experiência consistente**: layout compartilhado, modo claro/escuro e navegação responsiva.
- **Componentização** via shadcn/ui, facilitando a criação de novos blocos reutilizáveis.
- **Acessibilidade** trabalhada com aria-attributes, navegação via teclado e contraste adequado.

## 🧱 Stack e arquitetura
- **Next.js 15** (App Router, Server Components sempre que possível).
- **React 18 + TypeScript 5** para tipagem e manutenção segura.
- **Tailwind CSS 3** com tokens customizados e animações utilitárias (`tailwindcss-animate`).
- **shadcn/ui + Radix UI** como base de componentes acessíveis.
- **lucide-react** para ícones, além de utilitários como `clsx`, `tailwind-merge` e `date-fns`.

## ✅ Pré-requisitos
- Node.js 18+.
- npm (instalado com o Node) ou pnpm/yarn configurados.

## 🚀 Como executar localmente
```bash
npm install
npm run dev
```
A aplicação responde em [http://localhost:3000](http://localhost:3000).

### Build e preview
```bash
npm run build
npm start
```
O comando `start` utiliza o artefato gerado em `.next/` para um preview de produção.

## 📁 Estrutura destacada
```
app/
  (core)/layout/root-layout.tsx  # Layout raiz compartilhado
  (intranet)/...                # Rotas internas (formularios, politicas)
  (public)/...                  # Rotas institucionais de livre acesso
components/
  formularios/                  # Formulários corporativos client-side
  politicas/                    # Documentação das políticas internas
  ui/                           # Primitivos shadcn/ui adaptados
docs/                           # Decisões arquiteturais e notas técnicas
lib/                            # Utilidades compartilhadas (ex.: `cn`)
```

## 🔗 Publicação no GitHub
1. Garanta acesso ao repositório `https://github.com/Gscomunicacao/IntraNet.git`.
2. Execute os passos (ajuste usuário/token conforme seu ambiente):
   ```bash
   git add .
   git commit -m "Chore(deps): initial intranet import"
   git push -u origin master
   ```
3. Configure deploy contínuo (Vercel ou outra plataforma) apontando para o novo repositório, se desejado.

> Observação: arquivos herdados do site público permanecem no repositório para referência. A remoção pode ser feita após a migração completa (consulte a análise enviada pelo time de desenvolvimento).

## 📌 Próximos passos sugeridos
- Conectar os formulários a um backend (Supabase, banco interno ou Server Actions).
- Mapear autenticação/SSO para restringir o acesso às rotas internas.
- Criar dashboards e widgets de indicadores internos utilizando os componentes existentes.

## 📄 Licença
Uso interno exclusivo da GS Produções.
