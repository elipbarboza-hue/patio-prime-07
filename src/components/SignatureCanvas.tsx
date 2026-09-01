import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";

export interface SignatureHandle {
  clear: () => void;
  toDataURL: () => string | null;
  isEmpty: () => boolean;
}

export const SignatureCanvas = forwardRef<SignatureHandle>(function SignatureCanvas(_props, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const dirty = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(2, 2);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#f5b21a";
  }, []);

  useImperativeHandle(ref, () => ({
    clear: () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      dirty.current = false;
    },
    toDataURL: () => canvasRef.current?.toDataURL("image/png") ?? null,
    isEmpty: () => !dirty.current,
  }));

  const pos = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  return (
    <canvas
      ref={canvasRef}
      className="h-44 w-full touch-none rounded-xl border-2 border-dashed border-border bg-surface-2"
      onPointerDown={(e) => {
        drawing.current = true;
        dirty.current = true;
        const ctx = canvasRef.current!.getContext("2d")!;
        const p = pos(e);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!drawing.current) return;
        const ctx = canvasRef.current!.getContext("2d")!;
        const p = pos(e);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }}
      onPointerUp={() => {
        drawing.current = false;
      }}
      onPointerLeave={() => {
        drawing.current = false;
      }}
    />
  );
});
