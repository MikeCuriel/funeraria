import React from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../services/dbConnection";
import { toCanvas } from "html-to-image";
import defaults from "../utils/default.json";

export function useSanRamonEditor() {
  const TARGET_W = 1080;
  const TARGET_H = 1920;
  const aspect = 1080 / 1920;
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const previewRef = React.useRef<HTMLDivElement | null>(null);
  const images = ["./images/img.png", "./images/img1.png"];
  const [idx, setIdx] = React.useState(0);
  const [celular, setCelular] = React.useState("");
  const router = useRouter();
  const [name, setName] = React.useState("FULANITO PEREZ MALDONADO");

  const [size, setSize] = React.useState({ width: 0, height: 0 });
  React.useLayoutEffect(() => {
    if (!hostRef.current) return;
    const el = hostRef.current;
    const compute = (W: number, H: number) => {
      const containerAspect = W / H;
      let width: number, height: number;
      if (containerAspect > aspect) {
        height = H;
        width = height * aspect;
      } else {
        width = W;
        height = width / aspect;
      }
      setSize({ width, height });
    };
    const rect = el.getBoundingClientRect();
    compute(rect.width, rect.height);
    const ro = new ResizeObserver(([entry]) => {
      const { width: W, height: H } = entry.contentRect;
      compute(W, H);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [aspect]);

  React.useEffect(() => {
    const saved = Number(localStorage.getItem("bg_idx"));
    if (Number.isFinite(saved)) setIdx(saved);
  }, []);
  React.useEffect(() => {
    localStorage.setItem("bg_idx", String(idx));
  }, [idx]);
  React.useEffect(() => {
    const next = new Image();
    next.src = images[(idx + 1) % images.length];
  }, [idx]);

  const next = () => setIdx((i) => (i + 1) % images.length);
  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);

  type ObjectFit = NonNullable<React.CSSProperties["objectFit"]>;
  const toObjectFit = (v: string): ObjectFit => {
    const allowed: ObjectFit[] = ["contain", "cover", "fill", "none", "scale-down"];
    return allowed.includes(v as ObjectFit) ? (v as ObjectFit) : "contain";
  };

  const handleGuardar = async () => {
    try {
      (document.activeElement as HTMLElement | null)?.blur();
      await new Promise((r) => setTimeout(r, 0));
      if (celular !== "") {
        const el = previewRef.current;
        if (!el) {
          alert("No encontré el área a capturar.");
          return;
        }
        const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
        if (fonts?.ready) {
          try {
            await fonts.ready;
          } catch {}
        }
        const pixelRatio = TARGET_W / el.clientWidth;
        const canvas = await toCanvas(el, {
          cacheBust: true,
          backgroundColor: "transparent",
          pixelRatio,
          canvasWidth: TARGET_W,
          canvasHeight: TARGET_H,
        });
        const ok = await (async () => {
          const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/png"));
          if (!blob) return false;
          const filename = `despedida_${new Date().toISOString().replace(/[:.]/g, "-")}.png`;
          const { error } = await supabase.storage
            .from("imagenesfuneraria")
            .upload(`despedidas/${filename}`, blob, {
              contentType: "image/png",
              upsert: true,
            });
          if (error) {
            console.error("Error al subir imagen:", error.message);
            alert("Error al subir imagen a Supabase");
            return false;
          }
          const { data } = supabase.storage
            .from("imagenesfuneraria")
            .getPublicUrl(`despedidas/${filename}`);
          const url = data?.publicUrl;
          const payload = {
            nombre: `${name}`.trim(),
            celular,
            imagen_url: url,
            bGuadalupe: false,
          };
          if (url) {
            try {
              await navigator.clipboard.writeText(url);
            } catch {}
            alert(`Imagen guardada.\n${url}`);
            const { error } = await supabase.from("memorial").insert(payload);
            if (error) {
              console.error("Error al guardar memorial:", error.message);
              alert("Ocurrió un error al guardar la información del memorial.");
              return;
            }
            router.push("/");
          }
          return true;
        })();
        if (!ok) return;
      } else {
        alert("Es necesario agregar el celular.");
      }
    } catch (e) {
      console.error(e);
      alert("No se pudo generar/subir la imagen.");
    }
  };

  const todayMX = new Intl.DateTimeFormat("es-MX", {
    timeZone: "America/Mexico_City",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());

  const resolveFecha = (v: string) => {
    if (v?.startsWith("{hoy")) {
      return todayMX;
    }
    return v;
  };

  return {
    hostRef,
    previewRef,
    size,
    images,
    idx,
    next,
    prev,
    celular,
    setCelular,
    handleGuardar,
    name,
    setName,
    toObjectFit,
    resolveFecha,
    defaults,
  };
}