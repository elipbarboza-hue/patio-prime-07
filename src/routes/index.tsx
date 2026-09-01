import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Camera,
  Search,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  FileText,
  MessageCircle,
  ImagePlus,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { ScannerDialog } from "@/components/ScannerDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  brl,
  buscarEquipamento,
  contratoAtivoDoEquipamento,
  diasAtraso,
  diasEntre,
  fmtDate,
  registrarDevolucao,
  useDB,
  type Equipamento,
} from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pátio · Scan & Devolve — Pátio Forte Locações" },
      {
        name: "description",
        content:
          "Devolução de equipamentos no pátio em segundos: leia o QR Code do patrimônio, encontre o contrato ativo e dê baixa com avaria ou em perfeito estado.",
      },
      { property: "og:title", content: "Pátio · Scan & Devolve" },
      {
        property: "og:description",
        content: "Busca inversa de patrimônio para contrato e baixa de devolução em 1 clique.",
      },
    ],
  }),
  component: PatioPage,
});

interface Recibo {
  equip: Equipamento;
  contratoNumero: string;
  cliente: string;
  whatsapp: string;
  comAvaria: boolean;
  taxa: number;
  data: string;
}

function PatioPage() {
  const db = useDB();
  const [termo, setTermo] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [encontrado, setEncontrado] = useState<Equipamento | null>(null);
  const [naoEncontrado, setNaoEncontrado] = useState(false);
  const [avariaOpen, setAvariaOpen] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [taxa, setTaxa] = useState("");
  const [foto, setFoto] = useState<string | null>(null);
  const [recibo, setRecibo] = useState<Recibo | null>(null);

  const equip = encontrado ? db.equipamentos.find((e) => e.id === encontrado.id) ?? null : null;
  const vinculo = equip ? contratoAtivoDoEquipamento(equip.id) : undefined;
  const atraso = vinculo ? diasAtraso(vinculo.contrato.data_fim_prevista) : 0;

  function buscar(valor: string) {
    const e = buscarEquipamento(valor);
    setEncontrado(e ?? null);
    setNaoEncontrado(!e);
    setTermo(valor);
    if (e) toast.success(`${e.patrimonio_code} localizado`);
  }

  function finalizar(comAvaria: boolean) {
    if (!equip || !vinculo) return;
    const valorTaxa = comAvaria ? Number(taxa.replace(",", ".")) || 0 : 0;
    registrarDevolucao({
      equipamento_id: equip.id,
      contrato_id: vinculo.contrato.id,
      com_avaria: comAvaria,
      descricao_avaria: descricao,
      taxa_reparo: valorTaxa,
      fotos_urls: foto ? [foto] : [],
    });
    setRecibo({
      equip,
      contratoNumero: vinculo.contrato.numero_contrato,
      cliente: vinculo.cliente.nome_razao_social,
      whatsapp: vinculo.cliente.whatsapp,
      comAvaria,
      taxa: valorTaxa,
      data: new Date().toISOString(),
    });
    setAvariaOpen(false);
    setDescricao("");
    setTaxa("");
    setFoto(null);
  }

  return (
    <AppShell title="Pátio · Scan & Devolve">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-elevate">
          <Label htmlFor="busca" className="text-xs uppercase tracking-widest text-muted-foreground">
            Patrimônio, nº de série ou apelido
          </Label>
          <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <div className="relative min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="busca"
                value={termo}
                onChange={(e) => setTermo(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && buscar(termo)}
                placeholder="Ex.: PAT-0102"
                className="h-14 pl-10 text-lg uppercase"
              />
            </div>
            <Button
              onClick={() => setScannerOpen(true)}
              className="h-14 w-14 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
              aria-label="Abrir câmera"
            >
              <Camera className="size-6" />
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="secondary" className="h-12 gap-2" onClick={() => buscar("PAT-0102")}>
              <Zap className="size-4 text-primary" /> Simular Leitura PAT-0102
            </Button>
            <Button variant="outline" className="h-12" onClick={() => buscar(termo)}>
              Buscar
            </Button>
          </div>
        </div>

        {naoEncontrado && (
          <p className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm">
            Nenhum equipamento encontrado para “{termo}”.
          </p>
        )}

        {equip && (
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-elevate">
            <div className="hazard-stripes h-2" />
            <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 p-4">
              <div className="grid size-20 shrink-0 place-items-center rounded-xl bg-surface-2 font-display text-2xl font-bold text-primary">
                {equip.categoria.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-widest text-primary">
                  {equip.patrimonio_code} · {equip.serial_number}
                </p>
                <h2 className="truncate font-display text-2xl font-bold">{equip.nome}</h2>
                <p className="text-sm text-muted-foreground">
                  {equip.categoria} · Diária {brl(equip.valor_diaria)} · Reposição{" "}
                  {brl(equip.valor_reposicao)}
                </p>
                <span className="mt-2 inline-block rounded-full bg-surface-2 px-3 py-1 text-xs font-bold uppercase">
                  {equip.status}
                </span>
              </div>
            </div>

            {vinculo ? (
              <div className="space-y-3 border-t border-border p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Info icon={User} label="Cliente" value={vinculo.cliente.nome_razao_social} />
                  <Info icon={FileText} label="Contrato" value={vinculo.contrato.numero_contrato} />
                  <Info icon={Clock} label="Início" value={fmtDate(vinculo.contrato.data_inicio)} />
                  <Info
                    icon={Clock}
                    label="Previsão de devolução"
                    value={fmtDate(vinculo.contrato.data_fim_prevista)}
                  />
                </div>
                {atraso > 0 && (
                  <p className="flex items-center gap-2 rounded-xl border border-destructive bg-destructive/15 p-3 text-sm font-semibold">
                    <AlertTriangle className="size-5 shrink-0 text-destructive" />
                    {atraso} diária(s) em atraso ·{" "}
                    {brl(atraso * vinculo.item.valor_unitario)} adicionais
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Período corrido:{" "}
                  {diasEntre(vinculo.contrato.data_inicio, new Date().toISOString())} dia(s) ·
                  regime {vinculo.item.periodo_tipo.toLowerCase()}
                </p>

                <div className="grid gap-3 pt-1 sm:grid-cols-2">
                  <Button
                    onClick={() => finalizar(false)}
                    className="h-16 gap-2 bg-success text-success-foreground text-base font-bold hover:bg-success/90"
                  >
                    <CheckCircle2 className="size-6" /> Devolver em Perfeito Estado
                  </Button>
                  <Button
                    onClick={() => setAvariaOpen(true)}
                    className="h-16 gap-2 bg-destructive text-destructive-foreground text-base font-bold hover:bg-destructive/90"
                  >
                    <AlertTriangle className="size-6" /> Registrar Avaria / Danos
                  </Button>
                </div>
              </div>
            ) : (
              <p className="border-t border-border p-4 text-sm text-muted-foreground">
                Este equipamento não possui contrato ativo vinculado. Status atual: {equip.status}.
              </p>
            )}
          </div>
        )}
      </div>

      <ScannerDialog open={scannerOpen} onOpenChange={setScannerOpen} onDetected={buscar} />

      <Dialog open={avariaOpen} onOpenChange={setAvariaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar avaria</DialogTitle>
            <DialogDescription>
              Documente o dano com foto, descrição e valor estimado de reparo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setFoto(`foto-avaria-${Date.now()}.jpg`)}
              className="flex h-28 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground hover:border-primary hover:text-primary"
            >
              <ImagePlus className="size-6" />
              {foto ? `Foto anexada: ${foto}` : "Tirar / anexar foto do dano"}
            </button>
            <div>
              <Label htmlFor="desc">Descrição do dano</Label>
              <Textarea
                id="desc"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex.: carcaça trincada e cabo de força rompido"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="taxa">Valor estimado de reparo (R$)</Label>
              <Input
                id="taxa"
                inputMode="decimal"
                value={taxa}
                onChange={(e) => setTaxa(e.target.value)}
                placeholder="450,00"
                className="mt-1 h-12"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => finalizar(true)}
              className="h-14 w-full bg-primary text-primary-foreground font-bold hover:bg-primary/90"
            >
              Confirmar baixa com avaria
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!recibo} onOpenChange={() => setRecibo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comprovante de devolução</DialogTitle>
            <DialogDescription>Registro gerado em {recibo && fmtDate(recibo.data)}</DialogDescription>
          </DialogHeader>
          {recibo && (
            <div className="space-y-2 rounded-xl border border-border bg-surface-2 p-4 text-sm">
              <p className="font-display text-xl font-bold">{recibo.equip.nome}</p>
              <p>Patrimônio: {recibo.equip.patrimonio_code}</p>
              <p>Contrato: {recibo.contratoNumero}</p>
              <p>Cliente: {recibo.cliente}</p>
              <p className={recibo.comAvaria ? "text-destructive" : "text-success"}>
                {recibo.comAvaria
                  ? `Com avaria · taxa de reparo ${brl(recibo.taxa)} · equipamento em MANUTENÇÃO`
                  : "Sem avarias · equipamento DISPONÍVEL"}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              className="h-14 w-full gap-2 bg-success text-success-foreground font-bold hover:bg-success/90"
              onClick={() => {
                if (!recibo) return;
                const msg = encodeURIComponent(
                  `Comprovante de devolução\n${recibo.equip.nome} (${recibo.equip.patrimonio_code})\nContrato ${recibo.contratoNumero}\n${recibo.comAvaria ? `Avaria registrada - taxa ${brl(recibo.taxa)}` : "Devolvido em perfeito estado"}`,
                );
                window.open(
                  `https://wa.me/${recibo.whatsapp.replace(/\D/g, "")}?text=${msg}`,
                  "_blank",
                  "noopener",
                );
              }}
            >
              <MessageCircle className="size-5" /> Enviar recibo via WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-xl bg-surface-2 p-3">
      <Icon className="size-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}
