import { Users } from "lucide-react";

export default function ClientesPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <Users className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie o cadastro de clientes
          </p>
        </div>
      </header>

      <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-card/30 p-12 text-center">
        <p className="text-muted-foreground">Em desenvolvimento...</p>
      </div>
    </div>
  );
}
