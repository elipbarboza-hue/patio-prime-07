import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import QRCode from "react-qr-code";
import { LayoutGrid, List, Plus, Printer, Upload } from "lucide-react";
import { toast } from "sonner";
import { AppShell, AdminOnly } from "@/components/layout/AppShell";
import { ImportDialog } from "@/components/ImportDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  addEquipamento,
  brl,
  CATEGORIAS,
  importEquipamentos,
  useDB,
  type EquipStatus,
} from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ativos")({
  head: () => ({
    meta: [
      { title: "Ativos & Frota — Pátio Forte Locações" },
      {
        name: "description",
        content:
          "Dashboard da frota: indicadores de equipamentos disponíveis, locados e em manutenção, cadastro manual, importação de planilha e etiquetas QR Code.",
      },
      { property: "og:title", content: "Ativos & Frota" },
      {
        property: "og:description",
        content: "Gestão completa da frota de equipamentos com etiquetas QR Code.",
      },
    ],
  }),
  component: AtivosPage,
});

const FILTROS: { label: string; value: EquipStatus | "TODOS" }[] = [
  { label: "Todos", value: "TODOS" },
  { label: "Disponíveis", value: "DISPONIVEL" },
  { label: "Locados / Em Obra", value: "LOCADO" },
  { label: "Em Manutenção", value: "MANUTENCAO" },
  { label: "Perdidos", value: "PERDIDO" },
];

const STATUS_CLASS: Record<EquipStatus, string> = {
  DISPONIVEL: "bg-success/20 text-success",
  LOCADO: "bg-primary/20 text-primary",
  MANUTENCAO: "bg-warning/20 text-warning",
  PERDIDO: "bg-destructive/20 text-destructive",
};

function AtivosPage() {
  const db = useDB();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<EquipStatus | "TODOS">("TODOS");
  const [modo, setModo] = useState<"tabela" | "cards">("tabela");
  const [novoOpen, setNovoOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [etiquetasOpen, setEtiquetasOpen] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    categoria: CATEGORIAS[0],
    patrimonio_code: "",
    serial_number: "",
    valor_diaria: "",
    valor_reposicao: "",
  });

  const lista = useMemo(() => {
    const t = busca.toLowerCase();
    return db.equipamentos.filter(
      (e) =>
        (filtro === "TODOS" || e.status === filtro) &&
        (!t ||
          e.nome.toLowerCase().includes(t) ||
          e.patrimonio_code.toLowerCase().includes(t) ||
          e.categoria.toLowerCase().includes(t) ||
          e.serial_number.toLowerCase().includes(t)),
    );
  }, [db.equipamentos, busca, filtro]);

  const metricas = {
    total: db.equipamentos.length,
    locados: db.equipamentos.filter((e) => e.status === "LOCADO").length,
    manutencao: db.equipamentos.filter((e) => e.status === "MANUTENCAO").length,
    previsto: db.itens
      .filter((i) => !i.devolvido)
      .reduce((s, i) => s + i.valor_unitario * 30, 0),
  };

  return (
    <AppShell title="Ativos & Frota">
      <AdminOnly>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Metrica label="Total de equipamentos" valor={String(metricas.total)} />
            <Metrica label="Em obra (locados)" valor={String(metricas.locados)} destaque />
            <Metrica label="Em manutenção" valor={String(metricas.manutencao)} />
            <Metrica label="Faturamento previsto/mês" valor={brl(metricas.previsto)} />
          </div>

          <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
              <Input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome, patrimônio, categoria ou nº de série"
                className="h-12"
              />
              <Button
                className="h-12 gap-2 bg-primary font-bold text-primary-foreground hover:bg-primary/90"
                onClick={() => setNovoOpen(true)}
              >
                <Plus className="size-4" /> Novo Equipamento
              </Button>
              <Button variant="secondary" className="h-12 gap-2" onClick={() => setImportOpen(true)}>
                <Upload className="size-4" /> Importar Planilha
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {FILTROS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFiltro(f.value)}
                  className={cn(
                    "rounded-full px-4 py-2 text-xs font-bold uppercase",
                    filtro === f.value ? "bg-primary text-primary-foreground" : "bg-surface-2",
                  )}
                >
                  {f.label}
                </button>
              ))}
              <div className="ml-auto flex gap-1">
                <Button
                  variant={modo === "tabela" ? "default" : "outline"}
                  className="h-10 w-10"
                  onClick={() => setModo("tabela")}
                  aria-label="Visão em lista"
                >
                  <List className="size-4" />
                </Button>
                <Button
                  variant={modo === "cards" ? "default" : "outline"}
                  className="h-10 w-10"
                  onClick={() => setModo("cards")}
                  aria-label="Visão em cards"
                >
                  <LayoutGrid className="size-4" />
                </Button>
                <Button variant="outline" className="h-10 gap-2" onClick={() => setEtiquetasOpen(true)}>
                  <Printer className="size-4" /> Etiquetas QR
                </Button>
              </div>
            </div>

            {modo === "tabela" ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="py-2">Equipamento</th>
                      <th>Patrimônio</th>
                      <th>Categoria</th>
                      <th>Status</th>
                      <th className="text-right">Diária</th>
                      <th className="text-right">Reposição</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lista.map((e) => (
                      <tr key={e.id} className="border-t border-border">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-surface-2 text-xs font-bold text-primary">
                              {e.categoria.slice(0, 2).toUpperCase()}
                            </span>
                            <span className="font-semibold">{e.nome}</span>
                          </div>
                        </td>
                        <td>{e.patrimonio_code}</td>
                        <td>{e.categoria}</td>
                        <td>
                          <span
                            className={cn(
                              "rounded-full px-2 py-1 text-[11px] font-bold",
                              STATUS_CLASS[e.status],
                            )}
                          >
                            {e.status}
                          </span>
                        </td>
                        <td className="text-right">{brl(e.valor_diaria)}</td>
                        <td className="text-right">{brl(e.valor_reposicao)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {lista.map((e) => (
                  <div key={e.id} className="rounded-xl border border-border p-4">
                    <div className="grid size-12 place-items-center rounded-lg bg-surface-2 font-display font-bold text-primary">
                      {e.categoria.slice(0, 2).toUpperCase()}
                    </div>
                    <p className="mt-2 font-semibold">{e.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {e.patrimonio_code} · {e.serial_number}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span
                        className={cn(
                          "rounded-full px-2 py-1 text-[11px] font-bold",
                          STATUS_CLASS[e.status],
                        )}
                      >
                        {e.status}
                      </span>
                      <span className="text-sm font-semibold">{brl(e.valor_diaria)}/dia</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {lista.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nenhum ativo encontrado com esses filtros.
              </p>
            )}
          </div>
        </div>

        <Dialog open={novoOpen} onOpenChange={setNovoOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo equipamento</DialogTitle>
              <DialogDescription>Cadastro manual individual de ativo.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 sm:grid-cols-2">
              <Campo label="Nome" value={form.nome} onChange={(v) => setForm({ ...form, nome: v })} />
              <div>
                <Label className="text-xs uppercase text-muted-foreground">Categoria</Label>
                <select
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  className="mt-1 h-12 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {CATEGORIAS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <Campo
                label="Patrimônio / QR Code"
                value={form.patrimonio_code}
                onChange={(v) => setForm({ ...form, patrimonio_code: v })}
              />
              <Campo
                label="Nº de série"
                value={form.serial_number}
                onChange={(v) => setForm({ ...form, serial_number: v })}
              />
              <Campo
                label="Valor da diária"
                value={form.valor_diaria}
                onChange={(v) => setForm({ ...form, valor_diaria: v })}
              />
              <Campo
                label="Valor de reposição"
                value={form.valor_reposicao}
                onChange={(v) => setForm({ ...form, valor_reposicao: v })}
              />
            </div>
            <DialogFooter>
              <Button
                className="h-14 w-full bg-primary font-bold text-primary-foreground hover:bg-primary/90"
                onClick={() => {
                  if (!form.nome.trim() || !form.patrimonio_code.trim()) {
                    toast.error("Informe nome e patrimônio");
                    return;
                  }
                  addEquipamento({
                    nome: form.nome.trim(),
                    categoria: form.categoria,
                    patrimonio_code: form.patrimonio_code.trim().toUpperCase(),
                    serial_number: form.serial_number.trim() || "SN-N/D",
                    valor_diaria: Number(form.valor_diaria.replace(",", ".")) || 0,
                    valor_reposicao: Number(form.valor_reposicao.replace(",", ".")) || 0,
                  });
                  setForm({
                    nome: "",
                    categoria: CATEGORIAS[0],
                    patrimonio_code: "",
                    serial_number: "",
                    valor_diaria: "",
                    valor_reposicao: "",
                  });
                  setNovoOpen(false);
                  toast.success("Equipamento cadastrado");
                }}
              >
                Salvar equipamento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ImportDialog
          open={importOpen}
          onOpenChange={setImportOpen}
          titulo="Importar planilha de patrimônios"
          colunas={[
            { campo: "nome", label: "Nome do equipamento", sugestao: "DESCRICAO" },
            { campo: "patrimonio_code", label: "Patrimônio", sugestao: "PATRIMONIO" },
            { campo: "categoria", label: "Categoria", sugestao: "GRUPO" },
            { campo: "valor_diaria", label: "Valor diária", sugestao: "VLR_DIA" },
            { campo: "valor_reposicao", label: "Valor reposição", sugestao: "VLR_REPOS" },
          ]}
          exemplo={["PAT-0201 Vibrador de Imersão", "PAT-0202 Bomba Submersa", "PAT-0203 Escora Metálica"]}
          onConfirm={() => {
            importEquipamentos([
              {
                nome: "Vibrador de Imersão 1,5m",
                categoria: "Concretagem",
                patrimonio_code: "PAT-0201",
                serial_number: "SN-VI15-90",
                valor_diaria: 60,
                valor_reposicao: 2400,
              },
              {
                nome: "Bomba Submersa 1CV",
                categoria: "Energia",
                patrimonio_code: "PAT-0202",
                serial_number: "SN-BS1-44",
                valor_diaria: 70,
                valor_reposicao: 2900,
              },
              {
                nome: "Escora Metálica 3m",
                categoria: "Andaimes",
                patrimonio_code: "PAT-0203",
                serial_number: "SN-EM3-11",
                valor_diaria: 8,
                valor_reposicao: 320,
              },
            ]);
            toast.success("3 ativos importados da planilha");
          }}
        />

        <Dialog open={etiquetasOpen} onOpenChange={setEtiquetasOpen}>
          <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Folha de etiquetas QR Code</DialogTitle>
              <DialogDescription>
                Grade pronta para impressão em etiquetas adesivas.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {lista.map((e) => (
                <div
                  key={e.id}
                  className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-3 text-center"
                >
                  <div className="rounded bg-white p-2">
                    <QRCode value={e.qr_code} size={92} />
                  </div>
                  <p className="text-xs font-bold">{e.patrimonio_code}</p>
                  <p className="text-[11px] text-muted-foreground">{e.nome}</p>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button
                className="h-12 w-full gap-2"
                variant="secondary"
                onClick={() => window.print()}
              >
                <Printer className="size-4" /> Imprimir folha
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminOnly>
    </AppShell>
  );
}

function Metrica({ label, valor, destaque }: { label: string; valor: string; destaque?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-4",
        destaque && "border-primary/60 bg-primary/10",
      )}
    >
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold">{valor}</p>
    </div>
  );
}

function Campo({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label className="text-xs uppercase text-muted-foreground">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 h-12" />
    </div>
  );
}
