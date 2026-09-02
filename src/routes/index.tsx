import { createFileRoute } from "@tanstack/react-router";
import { PatioView } from "@/features/PatioView";

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
  component: PatioView,
});
