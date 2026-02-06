"use client";

import { useEffect, useState } from "react";
import { 
  CheckCircle2, 
  Clock, 
  FileEdit, 
  Mail, 
  User, 
  AlertCircle, 
  FileText, 
  ArrowRight,
  Eye,
  StickyNote,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/shared/lib/utils";

interface HistoryEvent {
  id: string;
  event_type: string;
  title: string;
  description?: string;
  user_id?: string;
  created_at: string;
  meta_data?: any;
}

interface HistoricoTabProps {
  proposalId?: string;
}

export function HistoricoTab({ proposalId }: HistoricoTabProps) {
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!proposalId) return;

    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        // Assumes backend is running on localhost:8000 if env var not set
        // Adjust this URL based on your actual setup
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/proposals/${proposalId}`);
        
        if (!response.ok) {
          if (response.status === 404) throw new Error('Proposta não encontrada');
          throw new Error('Falha de conexão com o servidor');
        }
        
        const data = await response.json();
        
        // Backend returns history sorted by date desc in the Proposal object
        if (data.history && Array.isArray(data.history)) {
            setEvents(data.history);
        } else {
            setEvents([]);
        }
      } catch (err) {
        console.error("Erro ao buscar histórico:", err);
        setError("Não foi possível conectar ao servidor de histórico.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [proposalId]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'create': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'update': return <FileEdit className="w-4 h-4 text-blue-500" />;
      case 'status_change': return <ArrowRight className="w-4 h-4 text-amber-500" />;
      case 'email_sent': return <Mail className="w-4 h-4 text-purple-500" />;
      case 'pdf_generated': return <FileText className="w-4 h-4 text-red-500" />;
      case 'viewed': return <Eye className="w-4 h-4 text-cyan-500" />;
      case 'note_added': return <StickyNote className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (!proposalId) {
     return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 bg-muted/10 rounded-lg border border-dashed border-border">
           <Clock className="w-12 h-12 mb-3 opacity-20" />
           <p className="font-medium">Histórico Indisponível</p>
           <p className="text-sm opacity-70">Salve a proposta pela primeira vez para iniciar o registro de histórico.</p>
        </div>
     );
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="bg-card rounded-lg border border-border shadow-sm flex flex-col flex-1 overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
          <h3 className="font-medium flex items-center gap-2">
            <span className="w-1 h-4 bg-primary rounded-full"></span>
            Histórico da Proposta
          </h3>
          <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded border border-border">
            ID: {proposalId.split('-')[0]}...
          </span>
        </div>
        
        <div className="flex-1 p-6 overflow-y-auto">
          {loading ? (
             <div className="flex flex-col items-center justify-center h-40 gap-3">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-muted-foreground">Carregando eventos...</p>
             </div>
          ) : error ? (
             <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
                <AlertTriangle className="w-10 h-10 mb-2 text-amber-500/50" />
                <p className="font-medium text-foreground">Erro de Conexão</p>
                <p className="text-sm mb-4 text-center max-w-xs">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="text-xs text-primary hover:underline"
                >
                  Tentar novamente
                </button>
             </div>
          ) : events.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                <p>Nenhum evento registrado ainda.</p>
             </div>
          ) : (
            <div className="relative pl-6 border-l border-border space-y-8 ml-2">
                {events.map((event) => (
                <div key={event.id} className="relative group">
                    {/* Ícone na timeline */}
                    <div className={cn(
                        "absolute -left-[33px] bg-background border border-border rounded-full p-1.5 shadow-sm transition-transform group-hover:scale-110",
                        "ring-4 ring-background" // Espaçamento visual para cobrir a linha
                    )}>
                    {getIcon(event.event_type)}
                    </div>
                    
                    <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-foreground">{event.title}</h4>
                        <span className="text-xs text-muted-foreground font-mono" title={event.created_at}>
                            {format(new Date(event.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                    
                    {/* Metadata display (optional) */}
                    {event.meta_data && (
                        <div className="mt-2 text-xs bg-muted/50 p-2 rounded border border-border font-mono text-muted-foreground overflow-x-auto">
                            {JSON.stringify(event.meta_data, null, 2)}
                        </div>
                    )}

                    <div className="flex items-center gap-1.5 mt-1">
                        <User className="w-3 h-3 text-muted-foreground/70" />
                        <span className="text-xs text-muted-foreground/70">{event.user_id || 'Sistema'}</span>
                    </div>
                    </div>
                </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
