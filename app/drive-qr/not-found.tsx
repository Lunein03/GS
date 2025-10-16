import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function DriveQrNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 py-16">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Página não encontrada</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">Ops, esse endereço não existe.</h1>
        <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
          Verifique o link acessado ou retorne para o painel do scanner de QR codes para continuar o processamento.
        </p>
      </div>
      <Button asChild variant="outline" className="gap-2">
        <Link href="/drive-qr">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar para o scanner
        </Link>
      </Button>
    </div>
  );
}
