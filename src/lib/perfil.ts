import { useSyncExternalStore } from "react";
import type { Perfil } from "./store";

const KEY = "patio-forte-perfil";
let perfil: Perfil = "ADMIN";
const listeners = new Set<() => void>();

export function setPerfil(p: Perfil) {
  perfil = p;
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, p);
  listeners.forEach((l) => l());
}

export function hydratePerfil() {
  if (typeof window === "undefined") return;
  const raw = window.localStorage.getItem(KEY) as Perfil | null;
  if (raw && raw !== perfil) setPerfil(raw);
}

export function usePerfil(): Perfil {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => perfil,
    () => "ADMIN" as Perfil,
  );
}
