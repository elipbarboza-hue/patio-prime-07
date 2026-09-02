import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Camera, Check, ChevronRight, MessageCircle, Plus, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { ScannerDialog } from "@/components/ScannerDialog";
import { SignatureCanvas, type SignatureHandle } from "@/components/SignatureCanvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addCliente,
  assinarContrato,
  brl,
  buscarEquipamento,
  criarContrato,
  fatorPeriodo,
  fmtDate,
  useDB,
  type PeriodoTipo,
} from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/contratos")({
  head: () => ({
    meta: [
      { title: "Emissão de Contrato Rápido — Pátio Forte Locações" },
      {
        name: "description",
        content:
          "Emita contratos de locação de equipamentos em 3 etapas: cliente, equipamentos e regime de cobrança, com assinatura digital sem papel.",
      },
      { property: "og:title", content: "Emissão de Contrato Rápido" },
      {
        property: "og:description",
        content: "Contrato de locação em 3 etapas com assinatura digital no celular.",
      },
    ],
  }),
  component: ContratosPage,
});

const PERIODOS: PeriodoTipo[] = ["DIARIO", "SEMANAL", "QUINZENAL", "MENSAL"];

function ContratosPage() {
  const db = useDB();
  const [etapa, setEtapa] = useState(1);
  const [clienteId, setClienteId] = useState<string>("");
  const [novo, setNovo] = useState({ nome: "", doc: "", whats: "", obra: "", email: "" });
  const [itens, setItens] = useState<{ equipamento_id: string; periodo_tipo: PeriodoTipo }[]>([]);
  const [busca, setBusca] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [dias, setDias] = useState(10);
  const [contratoId, setContratoId] = useState<string | null>(null);
  const sigRef = useRef<SignatureHandle>(null);

  const cliente = db.clientes.find((c) => c.id === clienteId);
  const disponiveis = db.equipamentos.filter((e) => e.status === "DISPONIVEL");
  const contrato = db.contratos.find((c) => c.id === contratoId);

  const linhas = itens.map((i) => {
    const equip = db.equipamentos.find((e) => e.id === i.equipamento_id)!;
    const periodos = Math.ceil(dias / fatorPeriodo(i.periodo_tipo));
    return { ...i, equip, total: equip.valor_diaria * periodos * fatorPeriodo(i.periodo_tipo) };
  });
  const total = linhas.reduce((s, l) => s + l.total, 0);

  function addItem(equipId: string) {
    if (itens.some((i) => i.equipamento_id === equipId)) return;
    setItens((v) => [...v, { equipamento_id: equipId, periodo_tipo: "DIARIO" }]);
  }

  function bipar(code: string) {
    const e = buscarEquipamento(code);
    if (!e) {
      toast.error("Equipamento não encontrado");
      return;
    }
    if (e.status !== "DISPONIVEL") {
      toast.error(`${e.patrimonio_code} está ${e.status}`);
      return;
    }
    addItem(e.id);
    toast.success(`${e.patrimonio_code} adicionado`);
  }

  function gerar() {
    const inicio = new Date().toISOString();
    const fim = new Date(Date.now() + dias * 86400000).toISOString();
    const c = criarContrato({
      cliente_id: clienteId,
      data_inicio: inicio,
      data_fim_prevista: fim,
      itens: linhas.map((l) => ({
        equipamento_id: l.equipamento_id,
        valor_unitario: l.equip.valor_diaria,
        periodo_tipo: l.periodo_tipo,
      })),
    });
    setContratoId(c.id);
    setEtapa(3);
  }

  return (
    <AppShell title="Emissão de Contrato">
      <div className="mx-auto max-w-3xl space-y-4">
        <ol className="grid grid-cols-3 gap-2">
          {["Cliente", "Equipamentos", "Contrato & Assinatura"].map((label, idx) => (
            <li
              key={label}
              className={cn(
                "rounded-xl border border-border p-3 text-center text-xs font-bold uppercase",
                etapa === idx + 1 ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground",
              )}
            >
              {idx + 1}. {label}
            </li>
          ))}
        </ol>

        {etapa === 1 && (
          <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
            <h2 className="font-display text-xl font-bold">Selecionar cliente</h2>
            <div className="space-y-2">
              {db.clientes.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setClienteId(c.id)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-xl border border-border p-4 text-left",
                    clienteId === c.id ? "border-primary bg-primary/10" : "hover:bg-surface-2",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{c.nome_razao_social}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {c.documento} · {c.endereco_obra}
                    </span>
                  </span>
                  {clienteId === c.id && <Check className="size-5 shrink-0 text-primary" />}
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-dashed border-border p-4">
              <p className="mb-3 flex items-center gap-2 font-semibold">
                <UserPlus className="size-4 text-primary" /> Cadastro rápido
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Nome / Razão Social" value={novo.nome} onChange={(v) => setNovo({ ...novo, nome: v })} />
                <Field label="CPF / CNPJ" value={novo.doc} onChange={(v) => setNovo({ ...novo, doc: v })} />
                <Field label="WhatsApp" value={novo.whats} onChange={(v) => setNovo({ ...novo, whats: v })} />
                <Field label="Endereço da obra" value={novo.obra} onChange={(v) => setNovo({ ...novo, obra: v })} />
              </div>
              <Button
                variant="secondary"
                className="mt-3 h-12 gap-2"
                onClick={() => {
                  if (!novo.nome.trim() || !novo.doc.trim()) {
                    toast.error("Informe nome e documento");
                    return;
                  }
                  const c = addCliente({
                    nome_razao_social: novo.nome.trim(),
                    documento: novo.doc.trim(),
                    whatsapp: novo.whats.trim(),
                    email: novo.email.trim(),
                    endereco_obra: novo.obra.trim(),
                  });
                  setClienteId(c.id);
                  setNovo({ nome: "", doc: "", whats: "", obra: "", email: "" });
                  toast.success("Cliente cadastrado");
                }}
              >
                <Plus className="size-4" /> Cadastrar cliente
              </Button>
            </div>

            <Button
              className="h-14 w-full gap-2 bg-primary font-bold text-primary-foreground hover:bg-primary/90"
              disabled={!clienteId}
              onClick={() => setEtapa(2)}
            >
              Avançar <ChevronRight className="size-5" />
            </Button>
          </div>
        )}

        {etapa === 2 && (
          <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
            <h2 className="font-display text-xl font-bold">Equipamentos</h2>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
              <Input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome ou patrimônio"
                className="h-12"
              />
              <Button className="h-12 w-12 bg-primary text-primary-foreground" onClick={() => setScannerOpen(true)}>
                <Camera className="size-5" />
              </Button>
            </div>
            <div className="max-h-60 space-y-2 overflow-y-auto">
              {disponiveis
                .filter(
                  (e) =>
                    !busca ||
                    e.nome.toLowerCase().includes(busca.toLowerCase()) ||
                    e.patrimonio_code.toLowerCase().includes(busca.toLowerCase()),
                )
                .map((e) => (
                  <button
                    key={e.id}
                    onClick={() => addItem(e.id)}
                    className="flex w-full items-center justify-between gap-2 rounded-xl border border-border p-3 text-left hover:bg-surface-2"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{e.nome}</span>
                      <span className="text-xs text-muted-foreground">
                        {e.patrimonio_code} · {brl(e.valor_diaria)}/dia
                      </span>
                    </span>
                    <Plus className="size-5 shrink-0 text-primary" />
                  </button>
                ))}
            </div>

            <div className="space-y-2">
              <Label>Duração prevista (dias)</Label>
              <Input
                type="number"
                min={1}
                value={dias}
                onChange={(e) => setDias(Math.max(1, Number(e.target.value)))}
                className="h-12 w-32"
              />
            </div>

            <div className="space-y-2">
              {linhas.map((l) => (
                <div key={l.equipamento_id} className="rounded-xl border border-border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="min-w-0 truncate font-semibold">{l.equip.nome}</p>
                    <button
                      onClick={() => setItens((v) => v.filter((i) => i.equipamento_id !== l.equipamento_id))}
                      aria-label="Remover"
                    >
                      <Trash2 className="size-5 text-destructive" />
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {PERIODOS.map((p) => (
                      <button
                        key={p}
                        onClick={() =>
                          setItens((v) =>
                            v.map((i) =>
                              i.equipamento_id === l.equipamento_id ? { ...i, periodo_tipo: p } : i,
                            ),
                          )
                        }
                        className={cn(
                          "rounded-lg px-3 py-2 text-xs font-bold uppercase",
                          l.periodo_tipo === p ? "bg-primary text-primary-foreground" : "bg-surface-2",
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">Subtotal: {brl(l.total)}</p>
                </div>
              ))}
            </div>

            <p className="font-display text-2xl font-bold text-primary">Total: {brl(total)}</p>
            <div className="flex gap-2">
              <Button variant="outline" className="h-14 flex-1" onClick={() => setEtapa(1)}>
                Voltar
              </Button>
              <Button
                className="h-14 flex-1 bg-primary font-bold text-primary-foreground hover:bg-primary/90"
                disabled={itens.length === 0}
                onClick={gerar}
              >
                Gerar contrato
              </Button>
            </div>
          </div>
        )}

        {etapa === 3 && contrato && cliente && (
          <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
            <div className="rounded-xl border border-border bg-surface-2 p-4 text-sm leading-relaxed">
              <p className="font-display text-xl font-bold uppercase">
                Contrato de locação {contrato.numero_contrato}
              </p>
              <p className="mt-2">
                <strong>Locadora:</strong> {db.locadora.nome_fantasia} — CNPJ {db.locadora.cnpj}
              </p>
              <p>
                <strong>Locatário:</strong> {cliente.nome_razao_social} — {cliente.documento}
              </p>
              <p>
                <strong>Obra:</strong> {cliente.endereco_obra}
              </p>
              <p>
                <strong>Vigência:</strong> {fmtDate(contrato.data_inicio)} a{" "}
                {fmtDate(contrato.data_fim_prevista)}
              </p>
              <table className="mt-3 w-full text-left text-xs">
                <thead className="text-muted-foreground">
                  <tr>
                    <th className="py-1">Equipamento</th>
                    <th>Regime</th>
                    <th>Reposição</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {linhas.map((l) => (
                    <tr key={l.equipamento_id} className="border-t border-border">
                      <td className="py-1">
                        {l.equip.nome} ({l.equip.patrimonio_code})
                      </td>
                      <td>{l.periodo_tipo}</td>
                      <td>{brl(l.equip.valor_reposicao)}</td>
                      <td className="text-right">{brl(l.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-3 text-xs text-muted-foreground">
                Cláusula 1 — O locatário responde integralmente por mau uso, avarias e limpeza dos
                equipamentos. Cláusula 2 — Em caso de perda, furto ou roubo será cobrado o valor de
                reposição indicado acima. Cláusula 3 — Diárias em atraso são faturadas
                automaticamente até a devolução efetiva no pátio.
              </p>
            </div>

            <div>
              <Label>Assinatura do cliente</Label>
              <div className="mt-2">
                <SignatureCanvas ref={sigRef} />
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button variant="outline" className="h-11" onClick={() => sigRef.current?.clear()}>
                  Limpar
                </Button>
                <Button
                  variant="secondary"
                  className="h-11 gap-2"
                  onClick={() => {
                    const msg = encodeURIComponent(
                      `Olá ${cliente.nome_razao_social}, segue o link para assinatura do contrato ${contrato.numero_contrato}: https://patioforte.app/assinar/${contrato.id}`,
                    );
                    window.open(
                      `https://wa.me/${cliente.whatsapp.replace(/\D/g, "")}?text=${msg}`,
                      "_blank",
                      "noopener",
                    );
                  }}
                >
                  <MessageCircle className="size-4" /> Enviar link via WhatsApp
                </Button>
              </div>
            </div>

            {contrato.assinado ? (
              <p className="rounded-xl border border-success bg-success/15 p-4 font-semibold">
                Contrato assinado e ATIVO. Equipamentos marcados como LOCADO.
              </p>
            ) : (
              <Button
                className="h-16 w-full bg-success text-base font-bold text-success-foreground hover:bg-success/90"
                onClick={() => {
                  if (sigRef.current?.isEmpty()) {
                    toast.error("Colete a assinatura do cliente");
                    return;
                  }
                  assinarContrato(contrato.id, sigRef.current?.toDataURL() ?? null);
                  toast.success("Contrato assinado e ativado");
                }}
              >
                Confirmar assinatura e ativar contrato
              </Button>
            )}
            <Button
              variant="outline"
              className="h-12 w-full"
              onClick={() => {
                setEtapa(1);
                setItens([]);
                setContratoId(null);
                setClienteId("");
              }}
            >
              Novo contrato
            </Button>
          </div>
        )}
      </div>

      <ScannerDialog open={scannerOpen} onOpenChange={setScannerOpen} onDetected={bipar} />
    </AppShell>
  );
}

function Field({
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
