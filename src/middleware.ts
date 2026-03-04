import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import {
  isPublicRoute,
  getRoutePermission,
  hasAccess,
} from '@/features/auth/config/auth-config';
import type { UserRole } from '@/features/auth/domain/types';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas públicas não precisam de auth
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Home page é acessível para todos (proteção dos módulos é client-side via ProtectedSection)
  if (pathname === '/') {
    return NextResponse.next();
  }

  // Criar Supabase client para middleware (edge runtime)
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response = NextResponse.next({
              request: { headers: request.headers },
            });
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Verificar sessão
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Se não autenticado, redirecionar para login
  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verificar permissão de rota
  const routePermission = getRoutePermission(pathname);

  if (routePermission) {
    // Buscar perfil do usuário para verificar role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, is_approved')
      .eq('user_id', user.id)
      .single();

    // Se perfil não encontrado ou não aprovado → acesso restrito
    if (!profile || !profile.is_approved) {
      return NextResponse.redirect(new URL('/acesso-restrito', request.url));
    }

    // Se role não tem permissão → acesso restrito
    if (!hasAccess(profile.role as UserRole, routePermission.allowedRoles)) {
      return NextResponse.redirect(new URL('/acesso-restrito', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Matcher único para filtrar assets estáticos e rotas internas.
     * Antes existia uma lista IGNORED_ROUTES duplicada — removida.
     * Adicione aqui qualquer padrão que deve ser ignorado pelo middleware.
     */
    '/((?!_next/static|_next/image|api|favicon.ico|images|fonts|manifest.json|robots.txt|sitemap.xml).*)',
  ],
};
