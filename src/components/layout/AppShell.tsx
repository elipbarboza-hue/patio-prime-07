import { Link } from "@tanstack/react-router";
import { ScanLine, FileSignature, LayoutDashboard, Receipt, Sun, HardHat } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { hydrate, useDB } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Pátio", desc: "Scan & Devolve", icon: ScanLine },
  { to: "/contratos", label: "Contratos", desc: "Emissão rápida", icon: FileSignature },
  { to: "/ativos", label: "Ativos", desc: "Dashboard & frota", icon: LayoutDashboard },
  { to: "/financeiro", label: "Financeiro", desc: "Medições", icon: Receipt },
] as const;

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const db = useDB();
  const [contraste, setContraste] = useState(false);

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("alto-contraste", contraste);
  }, [contraste]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-surface lg:flex">
        <div className="flex items-center gap-3 border-b border-border px-5 py-5">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <HardHat className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-bold uppercase">
              {db.locadora.nome_fantasia}
            </p>
            <p className="truncate text-xs text-muted-foreground">{db.locadora.cnpj}</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV.map(({ to, label, desc, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
              activeProps={{ className: "bg-primary/15 !text-primary" }}
            >
              <Icon className="size-5 shrink-0" />
              <span className="min-w-0">
                <span className="block font-semibold">{label}</span>
                <span className="block text-xs opacity-70">{desc}</span>
              </span>
            </Link>
          ))}
        </nav>
        <button
          onClick={() => setContraste((v) => !v)}
          className={cn(
            "m-3 flex items-center gap-2 rounded-xl border border-border px-3 py-3 text-sm font-semibold transition-colors",
            contraste ? "bg-primary text-primary-foreground" : "hover:bg-surface-2",
          )}
        >
          <Sun className="size-4" /> Modo Sol / Alto Contraste
        </button>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur lg:px-8">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">
              Gestão de Locação
            </p>
            <h1 className="truncate font-display text-2xl font-bold uppercase">{title}</h1>
          </div>
          <button
            onClick={() => setContraste((v) => !v)}
            aria-label="Alternar alto contraste"
            className={cn(
              "grid size-11 place-items-center rounded-xl border border-border lg:hidden",
              contraste && "bg-primary text-primary-foreground",
            )}
          >
            <Sun className="size-5" />
          </button>
        </header>

        <main className="px-4 pb-28 pt-4 lg:px-8 lg:pb-12">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            className="flex flex-col items-center gap-1 py-3 text-[11px] font-semibold text-muted-foreground"
            activeProps={{ className: "!text-primary" }}
          >
            <Icon className="size-6" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
