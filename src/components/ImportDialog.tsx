import { useState } from "react";
import { UploadCloud, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface ColunaMap {
  campo: string;
  label: string;
  sugestao: string;
}

export function ImportDialog({
  open,
  onOpenChange,
  titulo,
  colunas,
  exemplo,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  titulo: string;
  colunas: ColunaMap[];
  exemplo: string[];
  onConfirm: (linhas: number) => void;
}) {
  const [arquivo, setArquivo] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>
            Arraste a planilha (CSV/Excel) e confira o mapeamento das colunas.
          </DialogDescription>
        </DialogHeader>

        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            setArquivo(e.dataTransfer.files[0]?.name ?? "base_importada.csv");
          }}
          className={cn(
            "flex h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground",
            dragging && "border-primary bg-primary/10 text-primary",
          )}
        >
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => setArquivo(e.target.files?.[0]?.name ?? null)}
          />
          <UploadCloud className="size-7" />
          {arquivo ? (
            <span className="flex items-center gap-2 font-semibold text-foreground">
              <FileSpreadsheet className="size-4 text-primary" /> {arquivo}
            </span>
          ) : (
            <span>Arraste aqui ou clique para selecionar</span>
          )}
        </label>

        <div className="space-y-2 rounded-xl border border-border p-3 text-sm">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Mapeamento de colunas
          </p>
          {colunas.map((c) => (
            <div key={c.campo} className="grid grid-cols-2 items-center gap-2">
              <span className="truncate font-semibold">{c.label}</span>
              <span className="truncate rounded-lg bg-surface-2 px-2 py-1 text-xs text-muted-foreground">
                coluna “{c.sugestao}”
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          Pré-visualização: {exemplo.join(" · ")}
        </p>

        <DialogFooter>
          <Button
            className="h-14 w-full bg-primary font-bold text-primary-foreground hover:bg-primary/90"
            onClick={() => {
              onConfirm(exemplo.length);
              setArquivo(null);
              onOpenChange(false);
            }}
          >
            Importar {exemplo.length} registro(s)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
