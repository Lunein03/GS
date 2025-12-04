import { cn } from "@/shared/lib/utils";
import { format } from "date-fns";

interface DocumentPreviewProps {
  className?: string;
  data?: {
    code?: string;
    status?: string;
    date?: Date;
    validity?: Date;
    clientName?: string;
    contactName?: string;
  };
}

export function DocumentPreview({ className, data }: DocumentPreviewProps) {
  return (
    <div className={cn("flex flex-col gap-4 bg-muted/30 p-4 rounded-lg h-full overflow-y-auto", className)}>
      {/* Page 1 */}
      <div className="bg-white aspect-[210/297] w-full shadow-sm p-8 text-[10px] flex flex-col gap-4 relative overflow-hidden text-zinc-900">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center text-blue-600 font-bold text-xl">
            GS
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold text-zinc-800">Proposta Comercial</h2>
            <p className="text-zinc-500">Nova Proposta</p>
          </div>
        </div>

        {/* Info Block */}
        <div className="grid grid-cols-2 gap-4 mt-4 border-t border-b py-4 border-zinc-100">
            <div>
                <p><span className="font-bold">Código:</span> {data?.code || "251203-1"}</p>
                <p><span className="font-bold">Status:</span> {data?.status || "Aberto"}</p>
                <p><span className="font-bold">Data:</span> {data?.date ? format(data.date, "dd/MM/yyyy") : format(new Date(), "dd/MM/yyyy")}</p>
                <p><span className="font-bold">Validade:</span> {data?.validity ? format(data.validity, "dd/MM/yyyy") : "02/01/2026"}</p>
            </div>
        </div>

        {/* Companies */}
        <div className="grid grid-cols-2 gap-8 mt-2">
            <div>
                <h3 className="font-bold text-zinc-800 mb-1">Empresa</h3>
                <p className="font-bold">GS PRODUÇÕES E ACESSIBILIDADE</p>
                <p className="text-zinc-500">CNPJ: 35.282.691/0001-48</p>
                <p className="text-zinc-500">Endereço: Rua Cinco de Julho, 388, APT 103</p>
                <p className="text-zinc-500">Copacabana, Rio de Janeiro - RJ</p>
                <p className="text-zinc-500">Email: comercial@gsproducao.com</p>
            </div>
            <div>
                <h3 className="font-bold text-zinc-800 mb-1">Cliente</h3>
                <p className="font-bold">{data?.clientName || "Contratante"}</p>
            </div>
        </div>

        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
             <div className="text-[200px] font-bold rotate-[-45deg]">GS</div>
        </div>

        {/* Items Placeholder */}
        <div className="mt-8">
            <h3 className="font-bold text-zinc-800 mb-2">Itens</h3>
            <div className="h-20 bg-zinc-50 rounded w-full"></div>
        </div>

        {/* Observations */}
        <div className="mt-4">
             <h3 className="font-bold text-zinc-800 mb-2">Observações</h3>
             <p className="text-zinc-500 leading-relaxed text-[9px]">
                Os objetivos na contratação dos intérpretes de Libras - português foram logrados, visando uma estrutura operacional para dar apoio a esse nicho da população, atendendo a legislação ao dispor profissionais proficientes na Libras.
             </p>
        </div>

         {/* Signature */}
         <div className="mt-auto pt-8">
            <h3 className="font-bold text-zinc-800 mb-8">Assinatura</h3>
            <p className="mb-8">Rio de Janeiro, {format(new Date(), "dd 'de' MMMM 'de' yyyy")}.</p>
            <div className="border-t border-zinc-300 w-2/3 pt-2 text-center">
                Gabriel Sampaio Verissimo
            </div>
         </div>
      </div>

      {/* Page 2 (Preview) */}
       <div className="bg-white aspect-[210/297] w-full shadow-sm p-8 text-[10px] flex flex-col gap-4 relative opacity-50">
            <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center text-blue-600 font-bold text-xl mb-8">
                GS
            </div>
            <div className="border-t border-zinc-300 w-full pt-2 text-center mt-auto mb-20">
                {data?.clientName || "Contratante"}
            </div>
       </div>
    </div>
  );
}
