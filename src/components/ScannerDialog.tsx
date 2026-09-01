import { useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function ScannerDialog({
  open,
  onOpenChange,
  onDetected,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onDetected: (code: string) => void;
}) {
  const containerId = "qr-scanner-region";
  const errRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!open) return;
    let scanner: { clear: () => void; stop: () => Promise<void> } | null = null;
    let cancelled = false;

    (async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        const instance = new Html5Qrcode(containerId, { verbose: false });
        scanner = instance as unknown as { clear: () => void; stop: () => Promise<void> };
        await instance.start(
          { facingMode: "environment" },
          { fps: 12, qrbox: { width: 240, height: 240 } },
          (decoded) => {
            if (cancelled) return;
            cancelled = true;
            onDetected(decoded.trim());
            onOpenChange(false);
          },
          () => {},
        );
      } catch (e) {
        if (errRef.current) {
          errRef.current.textContent =
            "Não foi possível acessar a câmera neste dispositivo. Use a leitura simulada ou a busca manual. (" +
            (e instanceof Error ? e.message : "erro") +
            ")";
        }
      }
    })();

    return () => {
      cancelled = true;
      void (async () => {
        try {
          await scanner?.stop();
          scanner?.clear();
        } catch {
          /* ignore */
        }
      })();
    };
  }, [open, onDetected, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Leitor de QR Code / Código de Barras</DialogTitle>
          <DialogDescription>Aponte a câmera para a etiqueta do patrimônio.</DialogDescription>
        </DialogHeader>
        <div id={containerId} className="overflow-hidden rounded-xl bg-surface-2" />
        <p ref={errRef} className="text-sm text-warning" />
      </DialogContent>
    </Dialog>
  );
}
