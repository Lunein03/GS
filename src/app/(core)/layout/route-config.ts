/**
 * Configuração centralizada de rotas que controlam
 * a visibilidade de navbar, footer e padding do layout.
 *
 * DERIVADO AUTOMATICAMENTE de auth-config.ts.
 * Para adicionar uma nova rota que esconda navbar/footer:
 *  - Se for rota pública: adicione em PUBLIC_ROUTES
 *  - Se for rota protegida full-screen: adicione em PROTECTED_ROUTES com fullScreen: true
 *  - Se for rota avulsa (dev/teste): adicione em EXTRA_HIDDEN_ROUTES abaixo
 */
import { PUBLIC_ROUTES, getFullScreenPaths } from '@/features/auth/config/auth-config';

/** Rotas adicionais que não estão em auth-config (dev/teste) */
const EXTRA_HIDDEN_ROUTES = ['/bg-teste'];

/** Lista computada — nunca manter manualmente */
const HIDDEN_LAYOUT_ROUTES = [
  ...PUBLIC_ROUTES,
  ...getFullScreenPaths(),
  ...EXTRA_HIDDEN_ROUTES,
];

/** Verifica se o pathname atual corresponde a uma rota oculta */
export function isHiddenLayoutRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return HIDDEN_LAYOUT_ROUTES.some((route) => pathname.startsWith(route));
}
