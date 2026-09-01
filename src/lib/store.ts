import { useSyncExternalStore } from "react";

export type EquipStatus = "DISPONIVEL" | "LOCADO" | "MANUTENCAO" | "PERDIDO";
export type ContratoStatus = "RASCUNHO" | "ATIVO" | "EM_DEVOLUCAO" | "CONCLUIDO";
export type PeriodoTipo = "DIARIO" | "SEMANAL" | "QUINZENAL" | "MENSAL";
export type PagamentoStatus = "PENDENTE" | "PAGO";

export interface Locadora {
  id: string;
  nome_fantasia: string;
  cnpj: string;
  logo_url: string | null;
  telefone: string;
  endereco: string;
}

export interface Equipamento {
  id: string;
  patrimonio_code: string;
  qr_code: string;
  serial_number: string;
  nome: string;
  categoria: string;
  valor_diaria: number;
  valor_reposicao: number;
  status: EquipStatus;
}

export interface Cliente {
  id: string;
  nome_razao_social: string;
  documento: string;
  whatsapp: string;
  email: string;
  endereco_obra: string;
}

export interface Contrato {
  id: string;
  numero_contrato: string;
  cliente_id: string;
  data_inicio: string;
  data_fim_prevista: string;
  data_fim_real: string | null;
  status: ContratoStatus;
  assinado: boolean;
  assinatura_digital_url: string | null;
}

export interface ItemContrato {
  id: string;
  contrato_id: string;
  equipamento_id: string;
  valor_unitario: number;
  periodo_tipo: PeriodoTipo;
  devolvido: boolean;
}

export interface Vistoria {
  id: string;
  equipamento_id: string;
  contrato_id: string;
  fotos_urls: string[];
  com_avaria: boolean;
  descricao_avaria: string;
  taxa_reparo: number;
  data_vistoria: string;
}

export interface Faturamento {
  id: string;
  contrato_id: string;
  valor_total_locacao: number;
  valor_avarias: number;
  valor_final: number;
  status_pagamento: PagamentoStatus;
  codigo_pix_simulado: string;
}

export interface DB {
  locadora: Locadora;
  equipamentos: Equipamento[];
  clientes: Cliente[];
  contratos: Contrato[];
  itens: ItemContrato[];
  vistorias: Vistoria[];
  faturamentos: Faturamento[];
}

const uid = () => Math.random().toString(36).slice(2, 10);
const day = 86400000;
const iso = (offsetDays: number) => new Date(Date.now() + offsetDays * day).toISOString();

export const CATEGORIAS = [
  "Compactação",
  "Concretagem",
  "Corte e Demolição",
  "Elevação",
  "Andaimes",
  "Energia",
];

function seed(): DB {
  const clientes: Cliente[] = [
    {
      id: "cli1",
      nome_razao_social: "Construtora Alvorada LTDA",
      documento: "12.345.678/0001-90",
      whatsapp: "5511988887777",
      email: "obras@alvorada.com.br",
      endereco_obra: "Rua das Palmeiras, 400 - Vila Nova",
    },
    {
      id: "cli2",
      nome_razao_social: "José Ribeiro Empreiteira",
      documento: "123.456.789-00",
      whatsapp: "5511977776666",
      email: "jose@empreiteira.com",
      endereco_obra: "Av. Central, 1200 - Centro",
    },
  ];

  const equipamentos: Equipamento[] = [
    ["PAT-0102", "Betoneira 400L", "Concretagem", 85, 4200, "LOCADO", "SN-BT400-77"],
    ["PAT-0103", "Placa Vibratória 90kg", "Compactação", 120, 6800, "LOCADO", "SN-PV90-12"],
    ["PAT-0104", "Martelete Rompedor 30kg", "Corte e Demolição", 95, 5200, "LOCADO", "SN-MR30-08"],
    ["PAT-0105", "Andaime Tubular (módulo)", "Andaimes", 18, 900, "DISPONIVEL", "SN-AND-450"],
    ["PAT-0106", "Gerador 5kVA", "Energia", 150, 9800, "DISPONIVEL", "SN-GR5-31"],
    ["PAT-0107", "Compactador Sapo 70kg", "Compactação", 130, 7400, "MANUTENCAO", "SN-CS70-19"],
    ["PAT-0108", "Guincho de Coluna 200kg", "Elevação", 110, 6100, "DISPONIVEL", "SN-GC200-05"],
    ["PAT-0109", "Serra Mármore 1400W", "Corte e Demolição", 45, 1300, "DISPONIVEL", "SN-SM14-63"],
  ].map(([patrimonio_code, nome, categoria, valor_diaria, valor_reposicao, status, serial]) => ({
    id: uid(),
    patrimonio_code: patrimonio_code as string,
    qr_code: patrimonio_code as string,
    serial_number: serial as string,
    nome: nome as string,
    categoria: categoria as string,
    valor_diaria: valor_diaria as number,
    valor_reposicao: valor_reposicao as number,
    status: status as EquipStatus,
  }));

  const byPat = (p: string) => equipamentos.find((e) => e.patrimonio_code === p)!;

  const contratos: Contrato[] = [
    {
      id: "ctr1",
      numero_contrato: "LOC-2026-0031",
      cliente_id: "cli1",
      data_inicio: iso(-12),
      data_fim_prevista: iso(-2),
      data_fim_real: null,
      status: "ATIVO",
      assinado: true,
      assinatura_digital_url: null,
    },
    {
      id: "ctr2",
      numero_contrato: "LOC-2026-0032",
      cliente_id: "cli2",
      data_inicio: iso(-4),
      data_fim_prevista: iso(6),
      data_fim_real: null,
      status: "ATIVO",
      assinado: true,
      assinatura_digital_url: null,
    },
  ];

  const itens: ItemContrato[] = [
    {
      id: uid(),
      contrato_id: "ctr1",
      equipamento_id: byPat("PAT-0102").id,
      valor_unitario: 85,
      periodo_tipo: "DIARIO",
      devolvido: false,
    },
    {
      id: uid(),
      contrato_id: "ctr1",
      equipamento_id: byPat("PAT-0103").id,
      valor_unitario: 120,
      periodo_tipo: "DIARIO",
      devolvido: false,
    },
    {
      id: uid(),
      contrato_id: "ctr2",
      equipamento_id: byPat("PAT-0104").id,
      valor_unitario: 95,
      periodo_tipo: "SEMANAL",
      devolvido: false,
    },
  ];

  return {
    locadora: {
      id: "loc1",
      nome_fantasia: "Pátio Forte Locações",
      cnpj: "45.222.111/0001-08",
      logo_url: null,
      telefone: "(11) 4002-8922",
      endereco: "Rod. dos Bandeirantes, km 32 - Galpão 4",
    },
    equipamentos,
    clientes,
    contratos,
    itens,
    vistorias: [],
    faturamentos: [],
  };
}

const KEY = "patio-forte-db-v1";
let db: DB = seed();
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  db = { ...db };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(db));
    } catch {
      /* ignore */
    }
  }
  listeners.forEach((l) => l());
}

export function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      db = JSON.parse(raw) as DB;
      listeners.forEach((l) => l());
    }
  } catch {
    /* ignore */
  }
}

export function resetDB() {
  db = seed();
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

const getSnapshot = () => db;

export function useDB(): DB {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export const getDB = () => db;

/* ---------- helpers ---------- */

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const fmtDate = (s: string) => new Date(s).toLocaleDateString("pt-BR");

export function diasEntre(a: string, b: string) {
  return Math.max(1, Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / day));
}

export function diasAtraso(prevista: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(prevista).getTime()) / day));
}

export function fatorPeriodo(p: PeriodoTipo) {
  return p === "DIARIO" ? 1 : p === "SEMANAL" ? 7 : p === "QUINZENAL" ? 15 : 30;
}

export function buscarEquipamento(termo: string) {
  const t = termo.trim().toLowerCase();
  if (!t) return undefined;
  return db.equipamentos.find(
    (e) =>
      e.patrimonio_code.toLowerCase() === t ||
      e.qr_code.toLowerCase() === t ||
      e.serial_number.toLowerCase() === t ||
      e.nome.toLowerCase().includes(t),
  );
}

export function contratoAtivoDoEquipamento(equipamentoId: string) {
  const item = db.itens.find(
    (i) =>
      i.equipamento_id === equipamentoId &&
      !i.devolvido &&
      db.contratos.find((c) => c.id === i.contrato_id)?.status !== "CONCLUIDO",
  );
  if (!item) return undefined;
  const contrato = db.contratos.find((c) => c.id === item.contrato_id)!;
  const cliente = db.clientes.find((c) => c.id === contrato.cliente_id)!;
  return { item, contrato, cliente };
}

/* ---------- actions ---------- */

export function addEquipamento(e: Omit<Equipamento, "id" | "qr_code" | "status"> & { status?: EquipStatus }) {
  db.equipamentos = [
    ...db.equipamentos,
    { ...e, id: uid(), qr_code: e.patrimonio_code, status: e.status ?? "DISPONIVEL" },
  ];
  emit();
}

export function importEquipamentos(rows: Omit<Equipamento, "id" | "qr_code" | "status">[]) {
  db.equipamentos = [
    ...db.equipamentos,
    ...rows.map((r) => ({ ...r, id: uid(), qr_code: r.patrimonio_code, status: "DISPONIVEL" as EquipStatus })),
  ];
  emit();
}

export function addCliente(c: Omit<Cliente, "id">) {
  const cliente: Cliente = { ...c, id: uid() };
  db.clientes = [...db.clientes, cliente];
  emit();
  return cliente;
}

export function criarContrato(input: {
  cliente_id: string;
  data_inicio: string;
  data_fim_prevista: string;
  itens: { equipamento_id: string; valor_unitario: number; periodo_tipo: PeriodoTipo }[];
}) {
  const numero = `LOC-2026-${String(1000 + db.contratos.length + 33).slice(1)}`;
  const contrato: Contrato = {
    id: uid(),
    numero_contrato: numero,
    cliente_id: input.cliente_id,
    data_inicio: input.data_inicio,
    data_fim_prevista: input.data_fim_prevista,
    data_fim_real: null,
    status: "RASCUNHO",
    assinado: false,
    assinatura_digital_url: null,
  };
  db.contratos = [...db.contratos, contrato];
  db.itens = [
    ...db.itens,
    ...input.itens.map((i) => ({ ...i, id: uid(), contrato_id: contrato.id, devolvido: false })),
  ];
  emit();
  return contrato;
}

export function assinarContrato(contratoId: string, assinaturaDataUrl: string | null) {
  db.contratos = db.contratos.map((c) =>
    c.id === contratoId
      ? { ...c, assinado: true, assinatura_digital_url: assinaturaDataUrl, status: "ATIVO" as ContratoStatus }
      : c,
  );
  const ids = db.itens.filter((i) => i.contrato_id === contratoId).map((i) => i.equipamento_id);
  db.equipamentos = db.equipamentos.map((e) =>
    ids.includes(e.id) ? { ...e, status: "LOCADO" as EquipStatus } : e,
  );
  emit();
}

export function registrarDevolucao(input: {
  equipamento_id: string;
  contrato_id: string;
  com_avaria: boolean;
  descricao_avaria?: string;
  taxa_reparo?: number;
  fotos_urls?: string[];
}) {
  const vistoria: Vistoria = {
    id: uid(),
    equipamento_id: input.equipamento_id,
    contrato_id: input.contrato_id,
    fotos_urls: input.fotos_urls ?? [],
    com_avaria: input.com_avaria,
    descricao_avaria: input.descricao_avaria ?? "",
    taxa_reparo: input.taxa_reparo ?? 0,
    data_vistoria: new Date().toISOString(),
  };
  db.vistorias = [...db.vistorias, vistoria];
  db.itens = db.itens.map((i) =>
    i.contrato_id === input.contrato_id && i.equipamento_id === input.equipamento_id
      ? { ...i, devolvido: true }
      : i,
  );
  db.equipamentos = db.equipamentos.map((e) =>
    e.id === input.equipamento_id
      ? { ...e, status: (input.com_avaria ? "MANUTENCAO" : "DISPONIVEL") as EquipStatus }
      : e,
  );
  const pendentes = db.itens.filter((i) => i.contrato_id === input.contrato_id && !i.devolvido);
  db.contratos = db.contratos.map((c) =>
    c.id === input.contrato_id
      ? pendentes.length === 0
        ? { ...c, status: "CONCLUIDO" as ContratoStatus, data_fim_real: new Date().toISOString() }
        : { ...c, status: "EM_DEVOLUCAO" as ContratoStatus }
      : c,
  );
  emit();
  return vistoria;
}

export function calcularResumoContrato(contratoId: string) {
  const contrato = db.contratos.find((c) => c.id === contratoId)!;
  const itens = db.itens.filter((i) => i.contrato_id === contratoId);
  const fim = contrato.data_fim_real ?? new Date().toISOString();
  const dias = diasEntre(contrato.data_inicio, fim);
  const linhas = itens.map((i) => {
    const equip = db.equipamentos.find((e) => e.id === i.equipamento_id)!;
    const periodos = Math.ceil(dias / fatorPeriodo(i.periodo_tipo));
    const total = i.valor_unitario * periodos * fatorPeriodo(i.periodo_tipo);
    return { item: i, equip, dias, total };
  });
  const valor_total_locacao = linhas.reduce((s, l) => s + l.total, 0);
  const valor_avarias = db.vistorias
    .filter((v) => v.contrato_id === contratoId)
    .reduce((s, v) => s + v.taxa_reparo, 0);
  return { contrato, linhas, dias, valor_total_locacao, valor_avarias, valor_final: valor_total_locacao + valor_avarias };
}

export function gerarFatura(contratoId: string) {
  const r = calcularResumoContrato(contratoId);
  const existente = db.faturamentos.find((f) => f.contrato_id === contratoId);
  if (existente) return existente;
  const fat: Faturamento = {
    id: uid(),
    contrato_id: contratoId,
    valor_total_locacao: r.valor_total_locacao,
    valor_avarias: r.valor_avarias,
    valor_final: r.valor_final,
    status_pagamento: "PENDENTE",
    codigo_pix_simulado: `00020126580014BR.GOV.BCB.PIX0136${uid()}${uid()}5204000053039865802BR5921PATIO FORTE LOCACOES6009SAO PAULO62070503***6304${Math.floor(
      1000 + Math.random() * 8999,
    )}`,
  };
  db.faturamentos = [...db.faturamentos, fat];
  emit();
  return fat;
}

export function marcarPago(faturaId: string) {
  db.faturamentos = db.faturamentos.map((f) =>
    f.id === faturaId ? { ...f, status_pagamento: "PAGO" as PagamentoStatus } : f,
  );
  emit();
}
