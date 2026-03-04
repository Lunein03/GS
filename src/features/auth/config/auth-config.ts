import type { UserRole, RoutePermission } from '../domain/types';

// Rotas públicas (não precisam de auth)
export const PUBLIC_ROUTES = ['/login', '/register', '/acesso-restrito'];

// Rotas protegidas — FONTE ÚNICA DE VERDADE para roles, layout e home
export const PROTECTED_ROUTES: RoutePermission[] = [
  { path: '/gs-propostas', allowedRoles: ['dono', 'admin'], fullScreen: true, showOnHome: true },
  { path: '/patrimonio', allowedRoles: ['dono', 'admin', 'rh'], fullScreen: true, showOnHome: true },
  { path: '/drive-qr', allowedRoles: ['dono', 'admin', 'rh', 'colaborador'], fullScreen: true, showOnHome: true },
  { path: '/formularios', allowedRoles: ['dono', 'admin', 'rh', 'colaborador'], fullScreen: false, showOnHome: false },
  { path: '/admin', allowedRoles: ['dono', 'admin'], fullScreen: true, showOnHome: false },
];

/**
 * Módulos da home page — DERIVADO de PROTECTED_ROUTES.
 * Nunca manter manualmente: ao adicionar showOnHome: true em PROTECTED_ROUTES,
 * o módulo aparece automaticamente aqui.
 */
export const HOME_MODULES: Record<string, UserRole[]> = Object.fromEntries(
  PROTECTED_ROUTES
    .filter((route) => route.showOnHome)
    .map((route) => [route.path.slice(1), route.allowedRoles])
);

// Helper para verificar permissão
export function hasAccess(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

// Helper para encontrar permissão de rota
export function getRoutePermission(pathname: string): RoutePermission | undefined {
  return PROTECTED_ROUTES.find((route) => pathname.startsWith(route.path));
}

// Helper para verificar se é rota pública
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Retorna os paths de rotas protegidas que usam layout full-screen
 * (escondendo navbar/footer). Usado por route-config.ts.
 */
export function getFullScreenPaths(): string[] {
  return PROTECTED_ROUTES.filter((route) => route.fullScreen).map((route) => route.path);
}
