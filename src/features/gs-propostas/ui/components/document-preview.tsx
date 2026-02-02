
import { cn } from "@/shared/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Image from "next/image";

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
      <div className="bg-white aspect-[210/297] w-full shadow-sm p-8 text-[10px] flex flex-col gap-6 relative overflow-hidden text-zinc-900 shrink-0">
        
        {/* Header */}
        <div className="flex justify-between items-start z-10">
          <div className="relative w-16 h-16">
             <Image 
                src="/images/gs-logo.svg" 
                alt="GS Logo" 
                fill 
                className="object-contain"
             />
          </div>
          <div className="text-right">
            <h2 className="text-xl font-normal text-zinc-800">Proposta Comercial</h2>
            <p className="text-zinc-500 text-sm">Nova Proposta</p>
          </div>
        </div>

        {/* Info Block */}
        <div className="space-y-1 z-10 mt-2">
            <p><span className="font-semibold text-zinc-700">Código:</span> {data?.code || "251203-1"}</p>
            <p><span className="font-semibold text-zinc-700">Status da Proposta:</span> {data?.status || "Aberto"}</p>
            <p><span className="font-semibold text-zinc-700">Data da Proposta:</span> {data?.date ? format(data.date, "dd/MM/yyyy") : format(new Date(), "dd/MM/yyyy")}</p>
            <p><span className="font-semibold text-zinc-700">Validade:</span> {data?.validity ? format(data.validity, "dd/MM/yyyy") : format(new Date(), "dd/MM/yyyy")}</p>
        </div>

        {/* Separator */}
        <div className="border-t border-zinc-300 w-full z-10" />

        {/* Companies */}
        <div className="grid grid-cols-2 gap-8 z-10">
            <div className="space-y-1">
                <h3 className="font-bold text-base text-zinc-800 mb-2">Empresa</h3>
                <p className="font-bold text-zinc-800">GS PRODUÇÕES E ACESSIBILIDADE</p>
                <p className="text-zinc-600">CNPJ: 35.282.691/0001-48</p>
                <p className="text-zinc-600">Endereço: Rua Cinco de Julho, 388, APT 103,</p>
                <p className="text-zinc-600">Copacabana, Rio de Janeiro - RJ - 22051-030</p>
                <p className="text-zinc-600">E-mail: comercial@gsproducao.com</p>
                <p className="text-zinc-600">Telefone: +55 21 96819-9637</p>
            </div>
            <div>
                <h3 className="font-bold text-base text-zinc-800 mb-2">Cliente</h3>
                <p className="font-bold text-zinc-800">{data?.clientName || "Contratante"}</p>
            </div>
        </div>

        {/* Watermark - Large GS Logo */}
         <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none">
            <div className="relative w-[300px] h-[300px]">
                <Image 
                    src="/images/gs-logo.svg" 
                    alt="Watermark" 
                    fill 
                    className="object-contain"
                />
            </div>
        </div>


        {/* Separator */}
        <div className="border-t border-zinc-300 w-full z-10" />

        {/* Items Placeholder */}
        <div className="z-10">
            <h3 className="font-bold text-base text-zinc-800 mb-4">Itens</h3>
            {/* Visual placeholder for items table/list */}
            <div className="w-full h-32 border border-zinc-100 rounded bg-zinc-50/50 flex items-center justify-center text-zinc-400 italic">
                Lista de itens da proposta...
            </div>
        </div>

        {/* Observations */}
        <div className="z-10">
             <h3 className="font-bold text-base text-zinc-800 mb-2">Observações</h3>
             <p className="text-zinc-600 leading-relaxed text-[10px] text-justify">
                Os objetivos na contratação dos intérpretes de Libras - português foram logrados, visando uma estrutura operacional para dar apoio a esse nicho da população, atendendo a legislação ao dispor profissionais proficientes na Libras, para os surdos exercerem em seus direitos em um grande evento aberto a todos os públicos, sob a perspectiva da promoção da diversidade.
             </p>
        </div>

         {/* Signature */}
         <div className="mt-auto pt-8 z-10">
            <h3 className="font-bold text-base text-zinc-800 mb-8">Assinatura</h3>
            <p className="mb-12 text-zinc-600">Rio de Janeiro, {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}.</p>
            
            <div className="flex flex-col items-center justify-center w-2/3 mx-auto">
                 <div className="border-t border-zinc-400 w-full pt-2 text-center text-zinc-800">
                    Gabriel Sampaio Verissimo
                </div>
            </div>
         </div>
      </div>

      {/* Page 2 (Preview skeleton) */}
       <div className="bg-white aspect-[210/297] w-full shadow-sm p-8 text-[10px] flex flex-col gap-4 relative opacity-50 shrink-0">
            <div className="w-12 h-12 bg-zinc-100 rounded mb-8" />
            <div className="h-4 bg-zinc-100 w-1/3 mb-4" />
            <div className="h-4 bg-zinc-100 w-1/2" />
            
            <div className="border-t border-zinc-200 w-full pt-2 text-center mt-auto mb-20">
                <div className="h-4 bg-zinc-100 w-1/3 mx-auto" />
            </div>
       </div>
    </div>
  );
}

