import Link from 'next/link'

export default function PatrimonioNotFound() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-card/40 px-6 py-16 text-center shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <span className="text-2xl font-bold text-primary" aria-hidden="true">
          404
        </span>
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Página não encontrada</h1>
        <p className="text-sm text-muted-foreground">
          O recurso solicitado não foi localizado. Verifique o endereço ou volte ao painel principal do patrimônio.
        </p>
      </div>
      <Link
        href="/patrimonio"
        className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
      >
        Ir para o dashboard
      </Link>
    </section>
  )
}
