"use client";
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../services/dbConnection";
import { Box, Typography, Grid, Input, Slider, Select, MenuItem, Divider, TextField, Stack } from "@mui/material";

const PAGE_SLUG = "ramon";
const LOGO_SRC = "/images/logoSanRamon.svg"; // asegúrate de que existe
const CAPILLAS = [
  "CAPILLA: LA PIEDAD",
  "CAPILLA: RESURRECCION",
  "CAPILLA: SAGRADO CORAZON",
  "CAPILLA: GUADALUPANA",
  "CAPILLA: FATIMA",
  "CAPILLA: JUAN PABLO II",
  "CAPILLA: SAN MIGUEL",
];

/* ─────────────── Hooks utilitarios ─────────────── */
function useDeviceId() {
  const [id, setId] = React.useState<string | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("device_id");
    if (stored) setId(stored);
    else {
      const newId = crypto.randomUUID();
      localStorage.setItem("device_id", newId);
      setId(newId);
    }
  }, []);
  return id;
}
function useScreenInfo() {
  const [screenInfo, setScreenInfo] = useState({ w: 0, h: 0, dpr: 1 });
  useEffect(() => {
    const update = () => setScreenInfo({
      w: window.innerWidth, h: window.innerHeight, dpr: window.devicePixelRatio || 1,
    });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return screenInfo;
}
function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      setSize({ width: Math.round(r.width), height: Math.round(r.height) });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => { ro.disconnect(); window.removeEventListener("resize", update); };
  }, []);
  return [ref, size] as const;
}
function useImageNaturalSize(src?: string | null) {
  const [nat, setNat] = useState<{ width: number; height: number } | null>(null);
  useEffect(() => {
    if (!src) { setNat(null); return; }
    const img = new Image();
    img.onload = () => setNat({ width: img.naturalWidth, height: img.naturalHeight });
    img.src = src;
  }, [src]);
  return nat;
}
function computeContainRect(
  container: { width: number; height: number },
  image: { width: number; height: number } | null
) {
  const { width: cw, height: ch } = container;
  if (!image || cw === 0 || ch === 0) return null;
  const { width: iw, height: ih } = image;
  const cr = cw / ch, ir = iw / ih;
  let w: number, h: number;
  if (cr < ir) { w = cw; h = Math.round(cw / ir); }
  else { h = ch; w = Math.round(ch * ir); }
  const x = Math.round((cw - w) / 2), y = Math.round((ch - h) / 2);
  return { x, y, w, h };
}

/* ─────────────── Tipos ─────────────── */
type TextAlign = "left" | "center" | "right";
type Weight = 400 | 500 | 600 | 700 | 800;
type TextKey = "titulo" | "nombre" | "fecha" | "capilla";
type Key = TextKey | "imagen" | "logo";
interface TextStyle {
  fontSize: number;
  color: string;
  fontWeight: Weight;
  textAlign: TextAlign;
  padding: { t: number; r: number; b: number; l: number };
  margin: { t: number; r: number; b: number; l: number };
}
interface TextBoxPos { xPct: number; yPct: number; widthPct: number; }
interface AreaSize { w: number; h: number; }
interface ImageStyle {
  xPct: number; yPct: number; widthPct: number; opacity: number;
  rotation: number; borderRadius: number; flipX: boolean; flipY: boolean;
}
type SavedState = {
  text:   Record<TextKey,string>;
  styles: Record<TextKey,TextStyle>;
  boxes:  Record<TextKey,TextBoxPos>;
  overlaySrc: string | null;
  imgStyle: ImageStyle;
  logoStyle: ImageStyle;           // nuevo: estilo del logo
};

/* ─────────────── Helpers de texto ─────────────── */
function formatFechaEs(fechaISO: string, horaHM: string) {
  const [y, m, d] = fechaISO.split("-").map(Number);
  const [hh, mm] = (horaHM || "00:00").split(":").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0);
  const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  const dia = dt.getDate();
  const mes = meses[dt.getMonth()];
  const time = `${String(dt.getHours()).padStart(2,"0")}:${String(dt.getMinutes()).padStart(2,"0")}`;
  return `${dia} de ${mes} a las ${time}`;
}
function construirFraseCapilla({
  fechaISO, horaHM, lugar, capilla,
}: { fechaISO: string; horaHM: string; lugar: string; capilla: string; }) {
  return `AGRADECEMOS LA PRESENCIA DE AMIGOS Y FAMILIARES DURANTE EL ÚLTIMO ADIÓS EL DÍA:
${formatFechaEs(fechaISO, horaHM)}
${lugar}
${capilla}`;
}

/* ─────────────── UI básicos ─────────────── */
function LabeledSlider({
  label, min, max, value, onChange, step = 1, unit = ""
}: { label: string; min: number; max: number; value: number; onChange: (v:number)=>void; step?: number; unit?: string }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-600 w-28">{label}</label>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e)=>onChange(Number(e.target.value))} className="flex-1" />
      <span className="w-14 text-right text-sm">
        {unit ? (unit.includes("%") ? `${value}%` :
                 unit.includes("°") ? `${value}°` :
                 unit.includes("px") ? `${value}px` : unit)
             : value}
      </span>
    </div>
  );
}


function TextControls({
  text, style, box, onTextChange, onStyleChange, onPRChange, onBoxChange
}: {
  k: TextKey;
  text: string;
  style: TextStyle;
  box: TextBoxPos;
  onTextChange: (v: string) => void;
  onStyleChange: <K extends keyof TextStyle>(key: K, val: TextStyle[K]) => void;
  onPRChange: (kind: "padding"|"margin", edge: "t"|"r"|"b"|"l", val: number) => void;
  onBoxChange: (patch: Partial<TextBoxPos>) => void;
}) {

  return (
      <div className="grid grid-cols-2 gap-3 items-center">
        <label className="text-lg text-black col-span-2">Editar</label>
        <div className="col-span-2">
          <textarea
            value={text}
            onChange={(e)=>onTextChange(e.target.value)}
            className="w-full h-24 rounded border border-gray-500 p-2 text-sm text-black"
          />
      </div>

    <Box sx={{ width: 280 }}>
      <Typography variant="h5" color="Black" gutterBottom>
        Fuente
      </Typography>
      <Grid container spacing={1}>
        <Grid size={6}>
          <Select
            labelId="labelPeso"
            id="labelPeso"
            value={style.fontWeight}
            label="N"
            onChange={(e)=>onStyleChange("fontWeight", Number(e.target.value) as Weight)}
          >
            <MenuItem value={400}>Normal</MenuItem>
            <MenuItem value={600}>Semi-Bold</MenuItem>
            <MenuItem value={800}>Bold</MenuItem>
          </Select>
        </Grid>
        <Grid size={6}>
          <Input value={style.fontSize} size="small"
            onChange={(e)=>onStyleChange("fontSize", Number(e.target.value))}
            inputProps={{
              step: 1,
              min: 0,
              max: 100,
              type: 'number',
              'aria-labelledby': 'input-slider',
            }}
          />
        </Grid>
        <Grid size={6}>
          <Select
            labelId="labelAlineacion"
            id="labelAlineacion"
            value={style.textAlign}
            label="Alineación de texto"
            onChange={(e)=>onStyleChange("textAlign", e.target.value as TextAlign)}
          >
            <MenuItem value="left">Izquierda</MenuItem>
            <MenuItem value="center">Centrado</MenuItem>
            <MenuItem value="right">Derecha</MenuItem>
          </Select>
        </Grid>
        <Grid size={6}>
          <input type="color" value={style.color} 
            onChange={(e)=>onStyleChange("color", e.target.value)}
            className="h-8 w-12 p-0 border border-gray-300 rounded"
          />
        </Grid>
        <Typography variant="subtitle1" color="Black">
          Padding
        </Typography>
        <Grid container spacing={1}>
          {(['t', 'r', 'b', 'l'] as const).map((edge) => (
            <Grid key={edge} size={3} >
              <TextField
                // label={EDGE_LABEL[edge]}
                size="small"
                type="number"
                value={style.padding[edge] ?? 0}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onPRChange('padding', edge, e.target.value === '' ? 0 : Number(e.target.value))
                }
                
              />
            </Grid>
          ))}
        </Grid>
        <Typography variant="subtitle1" color="Black">
          Margin
        </Typography>
        <Grid container spacing={1}>
          {(['t', 'r', 'b', 'l'] as const).map((edge) => (
            <Grid key={edge} size={3} >
              <TextField
                // label={EDGE_LABEL[edge]}
                size="small"
                type="number"
                value={style.padding[edge] ?? 0}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onPRChange('margin', edge, e.target.value === '' ? 0 : Number(e.target.value))
                }
                
              />
            </Grid>
          ))}
        </Grid>
      </Grid>
      <Divider />      
      <Typography id="labelPosX" variant="h6" color="Black" gutterBottom>
        Posición de caja seleccionado
      </Typography>
      <Grid container spacing={2}>
        <Grid size={4}>
          <Stack spacing={1}>
            <Typography id="labelX" variant="subtitle1" color="Black">
              Posición X
            </Typography>
            <Slider
              aria-label="PosX"
              value={box.xPct}
              onChange={(_, newValue) =>
                onBoxChange({ xPct: newValue as number })
              }
            />
          </Stack>
        </Grid >
        <Grid size={4}>
          <Stack spacing={1}>
            <Typography id="labelY" variant="subtitle1" color="Black" gutterBottom>
              Posición Y
            </Typography>
            <Slider
              aria-label="PosY"
              value={box.yPct}
              onChange={(_, newValue) =>
                onBoxChange({ yPct: newValue as number })
              }
            />
          </Stack>
        </Grid>
        <Grid size={4}>
          <Stack spacing={1}>
            <Typography id="labelW" variant="subtitle1" color="Black" gutterBottom>
              Tamaño
            </Typography>
            <Slider
              aria-label="PosY"
              value={box.widthPct}
              onChange={(_, newValue) =>
                onBoxChange({ widthPct: newValue as number })
              }
            />
          </Stack>
        </Grid>
      </Grid>
    </Box>
    </div>

  );
}

/* --- TextBox (editable + drag) --- */
function TextBox({
  k, text, style, box, selected, area, onSelect, onTextChange, onPosChange
}: {
  k: TextKey;
  text: string;
  style: TextStyle;
  box: TextBoxPos;
  selected: boolean;
  area: AreaSize;
  onSelect: (k: TextKey) => void;
  onTextChange: (k: TextKey, v: string) => void;
  onPosChange: (k: TextKey, patch: Partial<TextBoxPos>) => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; startLeftPx: number; startTopPx: number; elW: number; elH: number; } | null>(null);
  const pxFromPct = (pct: number, total: number) => (pct / 100) * total;
  const pctFromPx = (px: number, total: number) => total === 0 ? 0 : (px / total) * 100;

  const beginDrag = (clientX: number, clientY: number) => {
    if (!boxRef.current) return;
    const rect = boxRef.current.getBoundingClientRect();
    dragRef.current = {
      startX: clientX, startY: clientY,
      startLeftPx: pxFromPct(box.xPct, area.w), startTopPx: pxFromPct(box.yPct, area.h),
      elW: rect.width, elH: rect.height,
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };
  const onDown = (e: React.MouseEvent) => { onSelect(k); beginDrag(e.clientX, e.clientY); };
  const onMove = (ev: MouseEvent) => {
    if (!dragRef.current) return;
    let newLeftPx = dragRef.current.startLeftPx + (ev.clientX - dragRef.current.startX);
    let newTopPx  = dragRef.current.startTopPx  + (ev.clientY - dragRef.current.startY);
    newLeftPx = Math.max(0, Math.min(area.w - dragRef.current.elW, newLeftPx));
    newTopPx  = Math.max(0, Math.min(area.h - dragRef.current.elH, newTopPx));
    onPosChange(k, {
      xPct: Math.max(0, Math.min(100, pctFromPx(newLeftPx, area.w))),
      yPct: Math.max(0, Math.min(100, pctFromPx(newTopPx,  area.h))),
    });
  };
  const onUp = () => {
    dragRef.current = null;
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
  };

  return (
    <div
      ref={boxRef}
      className={`absolute ${selected ? "ring-2 ring-blue-500/60 rounded" : ""}`}
      style={{ left: `${box.xPct}%`, top: `${box.yPct}%`, width: `${box.widthPct}%` }}
      onClick={() => onSelect(k)}
    >
      {selected && (
        <div
          className="absolute -top-3 left-0 h-3 w-24 rounded bg-blue-500/80 cursor-move"
          onMouseDown={onDown}
          title="Arrastra para mover"
        />
      )}
      <div
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onTextChange(k, (e.target as HTMLElement).innerText)}
        className="outline-none select-text"
        style={{
          fontSize: style.fontSize, color: style.color, fontWeight: style.fontWeight,
          textAlign: style.textAlign,
          paddingTop: style.padding.t, paddingRight: style.padding.r, paddingBottom: style.padding.b, paddingLeft: style.padding.l,
          marginTop: style.margin.t, marginRight: style.margin.r, marginBottom: style.margin.b, marginLeft: style.margin.l,
          lineHeight: 1.15, wordBreak: "break-word", userSelect: "text", whiteSpace: "pre-line",
        }}
      >
        {text}
      </div>
    </div>
  );
}

/* --- Imagen (drag) reutilizable --- */
function DraggableImage({
  src, style, area, selected, onSelect, onStyleChange
}: {
  src: string;
  style: ImageStyle;
  area: AreaSize;
  selected: boolean;
  onSelect: () => void;
  onStyleChange: (patch: Partial<ImageStyle>) => void;
}) {
  const onMouseDown = (e: React.MouseEvent<HTMLImageElement>) => {
    onSelect();
    const rect = e.currentTarget.getBoundingClientRect();
    const start = { x: e.clientX, y: e.clientY };
    const startLeft = (style.xPct/100)*area.w;
    const startTop  = (style.yPct/100)*area.h;
    const onMove = (ev: MouseEvent) => {
      let newLeft = startLeft + (ev.clientX - start.x);
      let newTop  = startTop  + (ev.clientY - start.y);
      newLeft = Math.max(0, Math.min(area.w - rect.width, newLeft));
      newTop  = Math.max(0, Math.min(area.h - rect.height, newTop));
      onStyleChange({
        xPct: Math.max(0, Math.min(100, (newLeft/area.w)*100)),
        yPct: Math.max(0, Math.min(100, (newTop /area.h)*100)),
      });
    };
    const onUp = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <img
      src={src}
      alt="img"
      onMouseDown={onMouseDown}
      className={`select-none cursor-move ${selected ? "ring-2 ring-blue-500/60 rounded" : ""}`}
      style={{
        position: "absolute",
        left: `${style.xPct}%`, top: `${style.yPct}%`, width: `${style.widthPct}%`, height: "auto",
        opacity: style.opacity, borderRadius: style.borderRadius,
        transform: `rotate(${style.rotation}deg) scaleX(${style.flipX?-1:1}) scaleY(${style.flipY?-1:1})`,
        transformOrigin: "top left", zIndex: selected ? 20 : 10,
      }}
      draggable={false}
    />
  );
}

/* --- Panel: controles de imagen genéricos --- */
function ImageControls({
  title, src, style, onSrcChange, onStyleChange, allowUpload = true
}: {
  title: string;
  src: string | null;
  style: ImageStyle;
  onSrcChange?: (dataUrl: string | null) => void;
  onStyleChange: (patch: Partial<ImageStyle>) => void;
  allowUpload?: boolean;
}) {
  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onSrcChange) return;
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => onSrcChange(r.result as string);
    r.readAsDataURL(f);
  };
  return (
    <div className="space-y-3">
      <div className="font-semibold">{title}</div>

      {allowUpload && onSrcChange && (
        <div>
          <label className="text-sm text-gray-600 block mb-1">Archivo</label>
          <input type="file" accept="image/*" onChange={onPick} />
          <div className="text-xs mt-1">{src ? "Imagen cargada" : "Sube PNG/JPG"}</div>
        </div>
      )}

      <LabeledSlider label="Tamaño"   min={5}   max={100} value={style.widthPct}  onChange={(v)=>onStyleChange({ widthPct: v })} unit="%" />
      <LabeledSlider label="Opacidad" min={0}   max={1}   value={style.opacity}   onChange={(v)=>onStyleChange({ opacity: v })} step={0.01} unit={`${Math.round(style.opacity*100)}%`} />
      <LabeledSlider label="Rotación" min={-180} max={180} value={style.rotation} onChange={(v)=>onStyleChange({ rotation: v })} unit="°" />
      <LabeledSlider label="Borde"    min={0}   max={180} value={style.borderRadius} onChange={(v)=>onStyleChange({ borderRadius: v })} unit="px" />
      <LabeledSlider label="Pos. X"   min={0}   max={100} value={style.xPct}     onChange={(v)=>onStyleChange({ xPct: v })} unit="%" />
      <LabeledSlider label="Pos. Y"   min={0}   max={100} value={style.yPct}     onChange={(v)=>onStyleChange({ yPct: v })} unit="%" />

      {/* flips opcionales; para logo normalmente no se usan, pero se deja por consistencia */}
      <div className="flex items-center gap-3">
        <button className={`px-2 py-1 text-sm rounded border ${style.flipX?"bg-gray-800 text-white":"border-gray-300"}`}
          onClick={()=>onStyleChange({ flipX: !style.flipX })}>Flip X</button>
        <button className={`px-2 py-1 text-sm rounded border ${style.flipY?"bg-gray-800 text-white":"border-gray-300"}`}
          onClick={()=>onStyleChange({ flipY: !style.flipY })}>Flip Y</button>
        {allowUpload && onSrcChange && src && (
          <button className="ml-auto px-2 py-1 text-sm rounded border border-red-300 text-red-600"
            onClick={()=>onSrcChange(null)}>Quitar imagen</button>
        )}
      </div>
    </div>
  );
}

/* ─────────────── Editor ─────────────── */
export default function EditorSanRamon() {
  const bgSrc = "/images/img1.png";
  const [principalRef, principalSize] = useElementSize<HTMLDivElement>();
  const natBg = useImageNaturalSize(bgSrc);
  const drawn = useMemo(() => computeContainRect(principalSize, natBg), [principalSize, natBg]);

  const deviceId = useDeviceId();
  const screenInfo = useScreenInfo();

  // Defaults capilla
  const hoyISO = new Date().toISOString().slice(0,10);
  const ahoraHM = new Date().toTimeString().slice(0,5);
  const [capillaSeleccionada, setCapillaSeleccionada] = useState(CAPILLAS[0]);
  const [fechaInput, setFechaInput] = useState(hoyISO);
  const [horaInput, setHoraInput] = useState(ahoraHM);
  const [lugar, setLugar] = useState("San Ramón casa funeraria");
  const [autoCapilla, setAutoCapilla] = useState(true);

  // ========== EXPORTAR & SUBIR ==========

// Asegúrate que overlay de luto tenga un valor por defecto:
const [overlaySrc, setOverlaySrc] = useState<string | null>("/images/luto.png");

// Logo fijo (si ya lo tienes en otro estado, reutiliza ese):
const logoSrc = "/images/logoSanRamon.svg";
// Si tienes estilo para el logo (tipo ImageStyle), úsalo aquí. Si no, fija uno básico:
const [logoStyle, setLogoStyle] = useState<ImageStyle>({
  xPct: 3, yPct: 85, widthPct: 18, opacity: 1, rotation: 0, borderRadius: 0, flipX: false, flipY: false
});

// UI para folio + progreso
const [folio, setFolio] = useState("");
const [uploading, setUploading] = useState(false);
const [uploadMsg, setUploadMsg] = useState<string | null>(null);

// Carga una imagen y devuelve el elemento HTMLImageElement
const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // útil si sirves desde CDN con CORS
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

// Ajuste de líneas (wrap) para canvas
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    const wpx = ctx.measureText(test).width;
    if (wpx <= maxWidth) line = test;
    else {
      if (line) lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawTextBoxToCanvas(
  ctx: CanvasRenderingContext2D,
  content: string,
  style: TextStyle,
  box: TextBoxPos,
  W: number,
  H: number
) {
  const xBase = (box.xPct / 100) * W;
  const yBase = (box.yPct / 100) * H;
  const boxWidth = (box.widthPct / 100) * W;

  const pad = style.padding, marg = style.margin;
  const contentWidth = Math.max(0, boxWidth - pad.l - pad.r);

  ctx.font = `${style.fontWeight} ${style.fontSize}px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif`;
  ctx.fillStyle = style.color;
  ctx.textBaseline = "top";

  const lineHeight = Math.round(style.fontSize * 1.15);
  const paragraphs = content.replace(/\r\n/g, "\n").split("\n");

  let y = yBase + marg.t + pad.t;

  for (const p of paragraphs) {
    const lines = wrapText(ctx, p, contentWidth);
    for (const line of lines) {
      let x: number;
      if (style.textAlign === "left") {
        ctx.textAlign = "left";
        x = xBase + pad.l;
      } else if (style.textAlign === "center") {
        ctx.textAlign = "center";
        x = xBase + pad.l + contentWidth / 2;
      } else {
        ctx.textAlign = "right";
        x = xBase + pad.l + contentWidth;
      }
      ctx.fillText(line, x, y);
      y += lineHeight;
    }
    // pequeño espacio entre párrafos si lo deseas:
    // y += 0;
  }
}

function drawOverlayImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  st: ImageStyle,
  W: number,
  H: number
) {
  const x = (st.xPct / 100) * W;
  const y = (st.yPct / 100) * H;
  const w = (st.widthPct / 100) * W;
  const h = w * (img.naturalHeight / img.naturalWidth);

  ctx.save();
  ctx.globalAlpha = st.opacity;
  ctx.translate(x, y);
  if (st.rotation) ctx.rotate((st.rotation * Math.PI) / 180);
  if (st.flipX || st.flipY) ctx.scale(st.flipX ? -1 : 1, st.flipY ? -1 : 1);

  const dx = st.flipX ? -w : 0;
  const dy = st.flipY ? -h : 0;

  if (st.borderRadius > 0) {
    const r = Math.min(st.borderRadius, Math.min(w, h) / 2);
    const path = new Path2D();
    path.roundRect(dx, dy, w, h, r);
    ctx.clip(path);
  }

  ctx.drawImage(img, dx, dy, w, h);
  ctx.restore();
}

// Renderiza el diseño a un PNG Blob (alta nitidez con scale=2)
async function renderExportBlob(): Promise<Blob> {
  // Necesitamos tamaño final del "área útil"
  const W = drawn?.w || Math.max(1, principalSize.width);
  const H = drawn?.h || Math.max(1, principalSize.height);
  const scale = 2; // 2x para que quede nítido

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(W * scale));
  canvas.height = Math.max(1, Math.round(H * scale));
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);

  // Cargar imágenes
  const bg = await loadImage("/images/img1.png"); // o bgSrc si lo tienes como variable
  const overlayImg = overlaySrc ? await loadImage(overlaySrc) : null;
  const logoImg = await loadImage(logoSrc);

  // Pintar fondo (object-contain para llenar W x H)
  const cr = W / H;
  const ir = bg.naturalWidth / bg.naturalHeight;
  let bw = W, bh = H, bx = 0, by = 0;
  if (cr < ir) { // canvas más "alto"
    bw = W; bh = W / ir; bx = 0; by = (H - bh) / 2;
  } else {       // canvas más "ancho"
    bh = H; bw = H * ir; by = 0; bx = (W - bw) / 2;
  }
  ctx.drawImage(bg, bx, by, bw, bh);

  // Pintar textos
  (["titulo","nombre","fecha","capilla"] as TextKey[]).forEach(k => {
    drawTextBoxToCanvas(ctx, text[k], styles[k], boxes[k], W, H);
  });

  // Pintar overlay (luto/custom)
  if (overlayImg) drawOverlayImage(ctx, overlayImg, imgStyle, W, H);

  // Pintar logo
  drawOverlayImage(ctx, logoImg, logoStyle, W, H);

  // A Blob
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => b ? resolve(b) : reject(new Error("toBlob retornó null")), "image/png");
  });
  return blob;
}

// Sube a Supabase Storage
async function handleExportAndUpload() {
  setUploadMsg(null);
  if (!folio.trim()) {
    setUploadMsg("Ingresa un número/folio primero.");
    return;
  }
  if (!drawn) {
    setUploadMsg("La imagen de fondo aún no está lista.");
    return;
  }

  try {
    setUploading(true);
    const blob = await renderExportBlob();
    const safe = folio.trim().replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `${PAGE_SLUG}-${safe}.png`;

    const { error } = await supabase.storage
      .from("imagenesfuneraria")
      .upload(`despedidas/${filename}`, blob, {
        contentType: "image/png",
        upsert: true,
      });

    if (error) throw error;

    const { data } = supabase.storage.from("imagenesfuneraria").getPublicUrl(`despedidas/${filename}`);
    const url = data?.publicUrl;
    
    const payload = {
      nombre: `${name}`.trim(),
      safe,
      imagen_url: url,
      bGuadalupe: true
      // Opcional: si quieres guardar más datos, añade campos que existan en tu tabla:
      // fecha: someDateISO, hora: someTime, capilla: currentVenue
    };

    await supabase.from("memorial").insert(payload);

    setUploadMsg(`✅ Subido: despedidas/${filename}`);
  } catch (err ) {
    const msg = err instanceof Error ? err.message : String(err);
    setUploadMsg(`❌ Error: ${msg}`);
  } finally {
    setUploading(false);
  }
}


  // Textos/estilos/posiciones
  const [text, setText] = useState<Record<TextKey, string>>({
    titulo: "Con profunda tristeza nos despedimos de",
    nombre: "Editor San Ramón",
    fecha:  "12/10/2025 + 12/10/2025",
    capilla: construirFraseCapilla({ fechaISO: hoyISO, horaHM: ahoraHM, lugar, capilla: CAPILLAS[0] }),
  });
  const [styles, setStyles] = useState<Record<TextKey, TextStyle>>({
    titulo: { fontSize: 25, color: "#1f2937", fontWeight: 600, textAlign: "center",
      padding: { t: 0, r: 0, b: 8, l: 0 }, margin: { t: 0, r: 0, b: 8, l: 0 } },
    nombre: { fontSize: 48, color: "#1f2937", fontWeight: 700, textAlign: "center",
      padding: { t: 0, r: 0, b: 0, l: 0 }, margin: { t: 0, r: 0, b: 0, l: 0 } },
    fecha:  { fontSize: 20, color: "#1f2937", fontWeight: 700, textAlign: "center",
      padding: { t: 0, r: 0, b: 0, l: 0 }, margin: { t: 0, r: 0, b: 0, l: 0 } },
    capilla:{ fontSize: 25, color: "#1f2937", fontWeight: 700, textAlign: "center",
      padding: { t: 0, r: 0, b: 0, l: 0 }, margin: { t: 0, r: 0, b: 0, l: 0 } },
  });
  const [boxes, setBoxes] = useState<Record<TextKey, TextBoxPos>>({
    titulo: { xPct: 10, yPct: 18, widthPct: 80 },
    nombre: { xPct: 10, yPct: 34, widthPct: 80 },
    fecha:  { xPct: 10, yPct: 50, widthPct: 80 },
    capilla:{ xPct: 10, yPct: 64, widthPct: 80 },
  });

  // Overlays: luto (editable) y logo (siempre visible)
  const [imgStyle, setImgStyle] = useState<ImageStyle>({
    xPct: 40, yPct: 55, widthPct: 30, opacity: 1, rotation: 0, borderRadius: 0, flipX: false, flipY: false,
  });
  const [selectedKey, setSelectedKey] = useState<Key>("titulo");
  const isTextKey = (k: Key): k is TextKey => k !== "imagen" && k !== "logo";

  // Auto generar capilla
  useEffect(() => {
    if (!autoCapilla) return;
    setText(t => ({
      ...t,
      capilla: construirFraseCapilla({
        fechaISO: fechaInput, horaHM: horaInput, lugar, capilla: capillaSeleccionada,
      }),
    }));
  }, [capillaSeleccionada, fechaInput, horaInput, lugar, autoCapilla]);

  // Guardado/rehidratación
  const hydratingRef = React.useRef(true);
  const [, setSaveStatus] = useState<"idle"|"saving"|"saved"|"error">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Rehidratar
  useEffect(() => {
    if (!deviceId) return;
    (async () => {
      const { data, error } = await supabase
        .from("memorial_config")
        .select("config")
        .eq("funeraria", PAGE_SLUG)
        .eq("device_id", deviceId)
        .maybeSingle();

      if (error) {
        console.error("Error cargando:", error);
      } else if (data?.config) {
        const s = data.config as Partial<SavedState>;
        if (s.text)   setText(s.text);
        if (s.styles) setStyles(s.styles);
        if (s.boxes)  setBoxes(s.boxes);
        // Mantén el default de luto si no viene desde DB:
        if (typeof s.overlaySrc === "string" && s.overlaySrc.length > 0) setOverlaySrc(s.overlaySrc);
        if (s.imgStyle)  setImgStyle(s.imgStyle);
        if (s.logoStyle) setLogoStyle(s.logoStyle); // rehidratar logo
      }
      hydratingRef.current = false;
    })();
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [deviceId]);

  // Autosave (debounce)
  useEffect(() => {
    if (hydratingRef.current || !deviceId) return;
    setSaveStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const payload: SavedState = { text, styles, boxes, overlaySrc, imgStyle, logoStyle };
      const { error } = await supabase
        .from("memorial_config")
        .upsert(
          {
            funeraria: PAGE_SLUG,
            device_id: deviceId,
            resolution_w: screenInfo.w,
            resolution_h: screenInfo.h,
            dpr: screenInfo.dpr,
            config: payload,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "funeraria,device_id" }
        );
      if (error) { console.error("Error guardando:", error); setSaveStatus("error"); }
      else { setSaveStatus("saved"); setTimeout(() => setSaveStatus("idle"), 1000); }
    }, 600);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [text, styles, boxes, overlaySrc, imgStyle, logoStyle, screenInfo, deviceId]);

  // Helpers
  const setTextByKey = (k: TextKey, v: string) => setText((t) => ({ ...t, [k]: v }));
  const updateStyle = <K extends keyof TextStyle>(k: TextKey, key: K, val: TextStyle[K]) =>
    setStyles((s) => ({ ...s, [k]: { ...s[k], [key]: val } }));
  const updateBox = (k: TextKey, patch: Partial<TextBoxPos>) =>
    setBoxes((b) => ({ ...b, [k]: { ...b[k], ...patch } }));

  // 👇 NUEVO: para actualizar padding/margin por borde
  const updatePR = (
    k: TextKey,
    kind: "padding" | "margin",
    edge: "t" | "r" | "b" | "l",
    val: number
  ) =>
    setStyles((s) => ({
      ...s,
      [k]: { ...s[k], [kind]: { ...s[k][kind], [edge]: val } },
    }));

  return (
    <div className="w-full h-[100vh] flex">
      {/* Panel izquierdo */}
      <div className="w-[380px] h-full bg-white border-r border-gray-200 overflow-auto p-4 space-y-4">
        <h2 className="text-lg font-semibold text-black">Menú</h2>
        {/* Selector */}
        <div className="flex gap-2 flex-wrap">
          {(["titulo","nombre","fecha","capilla","imagen","logo"] as Key[]).map(k => (
            <button key={k} onClick={() => setSelectedKey(k)}
              className={`px-3 py-1 rounded border text-sm ${selectedKey===k ? "bg-blue-600 text-white border-blue-600":"border-black text-black"}`}>
              {k==="titulo"?"Título":k==="nombre"?"Nombre":k==="fecha"?"Fecha":k==="capilla"?"Capilla":k==="imagen"?"Luto":"Logo"}
            </button>
          ))}
        </div>
        {/* Composer Capilla */}
        {selectedKey === "capilla" && (
          <div className="mt-4 space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Generar texto de Capilla</div>
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={autoCapilla} onChange={(e)=>setAutoCapilla(e.target.checked)} /> Auto
              </label>
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">Capilla</label>
              <select className="border rounded p-2 w-full" value={capillaSeleccionada} onChange={(e)=>setCapillaSeleccionada(e.target.value)}>
                {CAPILLAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Fecha</label>
                <input type="date" className="border rounded p-2 w-full" value={fechaInput} onChange={(e)=>setFechaInput(e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Hora</label>
                <input type="time" className="border rounded p-2 w-full" value={horaInput} onChange={(e)=>setHoraInput(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">Lugar</label>
              <input type="text" className="border rounded p-2 w-full" value={lugar} onChange={(e)=>setLugar(e.target.value)} placeholder="San Ramón casa funeraria" />
            </div>
            <div className="text-xs text-gray-700 bg-gray-50 border rounded p-2">
              <div className="font-semibold mb-1">Vista previa</div>
              {construirFraseCapilla({ fechaISO: fechaInput, horaHM: horaInput, lugar, capilla: capillaSeleccionada })}
            </div>
          </div>
        )}

        {/* Controles dinámicos */}
        {isTextKey(selectedKey) ? (
          <TextControls
            k={selectedKey}
            text={text[selectedKey]}
            style={styles[selectedKey]}
            box={boxes[selectedKey]}
            onTextChange={(v)=>setTextByKey(selectedKey, v)}
            onStyleChange={(key,val)=>updateStyle(selectedKey, key, val)}
            onPRChange={(kind,edge,val)=>updatePR(selectedKey, kind, edge, val)}
            onBoxChange={(patch)=>updateBox(selectedKey, patch)}
          />
        ) : selectedKey === "imagen" ? (
          <ImageControls
            title="Luto"
            src={overlaySrc}
            style={imgStyle}
            onSrcChange={setOverlaySrc}
            onStyleChange={(patch)=>setImgStyle(s=>({ ...s, ...patch }))}
            allowUpload={true}
          />
        ) : (
          <ImageControls
            title="Logo (siempre visible)"
            src={"/images/logoSanRamon.svg"}
            style={logoStyle}
            onStyleChange={(patch)=>setLogoStyle(s=>({ ...s, ...patch }))}
            allowUpload={false}
          />
        )}

        {/* Exportar y subir */}
      <div className="mt-4 border-t pt-4 space-y-2">
        <div className="text-sm font-semibold">Exportar y subir a Supabase</div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={folio}
            onChange={(e)=>setFolio(e.target.value)}
            placeholder="Número / Folio"
            className="border rounded p-2 flex-1"
          />
          <button
            onClick={handleExportAndUpload}
            disabled={uploading}
            className={`px-3 py-2 rounded text-white ${uploading ? "bg-gray-400" : "bg-emerald-600 hover:bg-emerald-700"}`}
          >
            {uploading ? "Subiendo..." : "Exportar PNG y subir"}
          </button>
        </div>
        {uploadMsg && <div className="text-xs text-gray-700">{uploadMsg}</div>}
      </div>
      </div>

      {/* Lienzo */}
      <div className="h-full w-full bg-gray-200">
        <div id="idDivPrincipal" ref={principalRef} className="relative h-full w-full">
          {/* Fondo */}
          <img src={bgSrc} alt="Fondo" className="absolute inset-0 h-full w-full object-contain select-none pointer-events-none" draggable={false} />

          {/* Área útil */}
          {drawn && (
            <div className="absolute" style={{ left: drawn.x, top: drawn.y, width: drawn.w, height: drawn.h }}>
              {(Object.keys(text) as TextKey[]).map((k) => (
                <TextBox
                  key={k}
                  k={k}
                  text={text[k]}
                  style={styles[k]}
                  box={boxes[k]}
                  selected={selectedKey===k}
                  area={{ w: drawn.w, h: drawn.h }}
                  onSelect={(kk)=>setSelectedKey(kk)}
                  onTextChange={setTextByKey}
                  onPosChange={updateBox}
                />
              ))}

              {/* Luto (editable, puede cambiarse o quitarse) */}
              {overlaySrc && (
                <DraggableImage
                  src={overlaySrc}
                  style={imgStyle}
                  area={{ w: drawn.w, h: drawn.h }}
                  selected={selectedKey==="imagen"}
                  onSelect={()=>setSelectedKey("imagen")}
                  onStyleChange={(patch)=>setImgStyle(s=>({ ...s, ...patch }))}
                />
              )}

              {/* Logo independiente, siempre visible */}
              <DraggableImage
                src={LOGO_SRC}
                style={logoStyle}
                area={{ w: drawn.w, h: drawn.h }}
                selected={selectedKey==="logo"}
                onSelect={()=>setSelectedKey("logo")}
                onStyleChange={(patch)=>setLogoStyle(s=>({ ...s, ...patch }))}
              />
            </div>
          )}


        </div>
      </div>
    </div>
  );
}
