import { CreateOpportunityForm } from "@/components/gs-propostas/create-opportunity-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NovaOportunidadePage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-4">
        <Link href="/gs-propostas/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nova Oportunidade</h1>
          <p className="text-muted-foreground">
            Cadastre uma nova oportunidade no pipeline comercial
          </p>
        </div>
      </header>

      <div className="max-w-2xl">
        <CreateOpportunityForm />
      </div>
    </div>
  );
}
