"use client";

import { Folder, Upload, FileText, Download, Trash2, MoreVertical, Eye } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/shared/ui/dropdown-menu";

// Mock data para visualização
const MOCK_FILES = [
  { id: 1, name: "Briefing_Inicial.pdf", size: "2.4 MB", date: "03/02/2026", type: "pdf" },
  { id: 2, name: "Logo_Cliente_Vetores.zip", size: "15.8 MB", date: "03/02/2026", type: "zip" },
];

export function DocumentosTab() {
  return (
    <div className="flex flex-col h-full gap-4">
      <div className="bg-card rounded-lg border border-border shadow-sm flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
          <h3 className="font-medium flex items-center gap-2">
            <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
            Arquivos & Documentos
          </h3>
          <Button size="sm" variant="outline" className="gap-2">
            <Upload className="w-4 h-4" /> Upload
          </Button>
        </div>

        {/* Lista de Arquivos */}
        <div className="flex-1 p-0 overflow-y-auto">
          {MOCK_FILES.length > 0 ? (
            <div className="divide-y divide-border">
              {MOCK_FILES.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-blue-500/10 flex items-center justify-center text-blue-600">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{file.size} • {file.date}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Visualizar">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Baixar">
                      <Download className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2 p-8">
               <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-2">
                 <Folder className="w-8 h-8 opacity-50" />
               </div>
               <p className="font-medium">Nenhum arquivo anexado</p>
               <p className="text-xs">Arraste arquivos aqui ou clique em Upload</p>
             </div>
          )}
        </div>
      </div>
      
       <div className="text-xs text-muted-foreground text-center bg-muted/30 py-2 rounded border border-dashed border-border">
          Área de upload (Integração Backend Pendente) - @see SPEC-009-tabs-apoio.md
      </div>
    </div>
  );
}
