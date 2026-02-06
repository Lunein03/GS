'use client'

/**
 * Layout específico para páginas de proposta (nova/editar)
 * Este layout não adiciona container/padding para permitir
 * que o PropostaUnificada ocupe a tela inteira
 */
export default function PropostaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}
