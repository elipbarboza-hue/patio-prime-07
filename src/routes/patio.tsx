import { createFileRoute } from "@tanstack/react-router";
import { PatioView } from "@/features/PatioView";

export const Route = createFileRoute("/patio")({
  head: () => ({
    meta: [
      { title: "Pátio / Scan — Expedição e Devolução" },
      {
        name: "description",
        content:
          "Operação de pátio: bipe o QR Code, consulte o contrato vinculado, registre vistorias e confirme devoluções direto do celular.",
      },
      { property: "og:title", content: "Pátio / Scan" },
      {
        property: "og:description",
        content: "Expedição, devolução e vistoria de equipamentos no pátio.",
      },
    ],
  }),
  component: PatioView,
});
