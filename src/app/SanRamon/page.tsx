"use client";
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

/* ─────────────── Utils ─────────────── */
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
type Key = TextKey | "imagen";
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

/* ─────────────── Componentes reutilizables ─────────────── */
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

/* --- TextBox: caja editable + drag --- */
function TextBox({
  k, text, style, box, selected, area, onSelect, onTextChange, onPosChange,
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
  const draggingRef = useRef<{
    startX: number; startY: number;
    startLeftPx: number; startTopPx: number;
    elW: number; elH: number;
  } | null>(null);

  const pxFromPct = (pct: number, total: number) => (pct / 100) * total;
  const pctFromPx = (px: number, total: number) => total === 0 ? 0 : (px / total) * 100;

  const startDrag = (clientX: number, clientY: number) => {
    if (!boxRef.current) return;
    const rect = boxRef.current.getBoundingClientRect();
    draggingRef.current = {
      startX: clientX,
      startY: clientY,
      startLeftPx: pxFromPct(box.xPct, area.w),
      startTopPx:  pxFromPct(box.yPct, area.h),
      elW: rect.width,
      elH: rect.height,
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };
  const onMouseDownHandle = (e: React.MouseEvent) => { onSelect(k); startDrag(e.clientX, e.clientY); };
  const onMouseMove = (ev: MouseEvent) => {
    if (!draggingRef.current) return;
    let newLeftPx = draggingRef.current.startLeftPx + (ev.clientX - draggingRef.current.startX);
    let newTopPx  = draggingRef.current.startTopPx  + (ev.clientY - draggingRef.current.startY);
    newLeftPx = Math.max(0, Math.min(area.w - draggingRef.current.elW, newLeftPx));
    newTopPx  = Math.max(0, Math.min(area.h - draggingRef.current.elH, newTopPx));
    onPosChange(k, {
      xPct: Math.max(0, Math.min(100, pctFromPx(newLeftPx, area.w))),
      yPct: Math.max(0, Math.min(100, pctFromPx(newTopPx,  area.h))),
    });
  };
  const onMouseUp = () => {
    draggingRef.current = null;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };

  const onTouchStartHandle = (e: React.TouchEvent) => {
    onSelect(k);
    const t = e.touches[0];
    if (!boxRef.current) return;
    const rect = boxRef.current.getBoundingClientRect();
    draggingRef.current = {
      startX: t.clientX, startY: t.clientY,
      startLeftPx: pxFromPct(box.xPct, area.w),
      startTopPx:  pxFromPct(box.yPct, area.h),
      elW: rect.width, elH: rect.height,
    };
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
  };
  const onTouchMove = (ev: TouchEvent) => {
    ev.preventDefault();
    if (!draggingRef.current) return;
    const t = ev.touches[0];
    let newLeftPx = draggingRef.current.startLeftPx + (t.clientX - draggingRef.current.startX);
    let newTopPx  = draggingRef.current.startTopPx  + (t.clientY - draggingRef.current.startY);
    newLeftPx = Math.max(0, Math.min(area.w - draggingRef.current.elW, newLeftPx));
    newTopPx  = Math.max(0, Math.min(area.h - draggingRef.current.elH, newTopPx));
    onPosChange(k, {
      xPct: Math.max(0, Math.min(100, pctFromPx(newLeftPx, area.w))),
      yPct: Math.max(0, Math.min(100, pctFromPx(newTopPx,  area.h))),
    });
  };
  const onTouchEnd = () => {
    draggingRef.current = null;
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchend", onTouchEnd);
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
          onMouseDown={onMouseDownHandle}
          onTouchStart={onTouchStartHandle}
          title="Arrastra para mover"
        />
      )}
      <div
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onTextChange(k, (e.target as HTMLElement).innerText)}
        className="outline-none select-text"
        style={{
          fontSize: style.fontSize,
          color: style.color,
          fontWeight: style.fontWeight,
          textAlign: style.textAlign,
          paddingTop: style.padding.t,
          paddingRight: style.padding.r,
          paddingBottom: style.padding.b,
          paddingLeft: style.padding.l,
          marginTop: style.margin.t,
          marginRight: style.margin.r,
          marginBottom: style.margin.b,
          marginLeft: style.margin.l,
          lineHeight: 1.15,
          wordBreak: "break-word",
          userSelect: "text",
        }}
      >
        {text}
      </div>
    </div>
  );
}

/* --- Panel: controles de una caja de texto --- */
function TextControls({
  k, text, style, box, onTextChange, onStyleChange, onPRChange, onBoxChange
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
    <>
      <div className="grid grid-cols-2 gap-3 items-center">
        <label className="text-sm text-gray-600 col-span-2">Contenido</label>
        <div className="col-span-2">
          <textarea
            value={text}
            onChange={(e)=>onTextChange(e.target.value)}
            className="w-full h-20 rounded border border-gray-300 p-2 text-sm"
          />
        </div>

        <label className="text-sm text-gray-600">Tamaño</label>
        <div className="flex items-center gap-2">
          <input type="range" min={12} max={160}
            value={style.fontSize}
            onChange={(e)=>onStyleChange("fontSize", Number(e.target.value))}
            className="w-40"/>
          <span className="w-12 text-right text-sm">{style.fontSize}px</span>
        </div>

        <label className="text-sm text-gray-600">Color</label>
        <input type="color" value={style.color}
          onChange={(e)=>onStyleChange("color", e.target.value)}
          className="h-8 w-12 p-0 border border-gray-300 rounded" />

        <label className="text-sm text-gray-600">Peso</label>
        <select value={style.fontWeight}
          onChange={(e)=>onStyleChange("fontWeight", Number(e.target.value) as Weight)}
          className="border rounded p-1">
          <option value={400}>400</option><option value={500}>500</option>
          <option value={600}>600</option><option value={700}>700</option><option value={800}>800</option>
        </select>

        <label className="text-sm text-gray-600">Alineación</label>
        <select value={style.textAlign}
          onChange={(e)=>onStyleChange("textAlign", e.target.value as TextAlign)}
          className="border rounded p-1">
          <option value="left">Izq</option><option value="center">Centro</option><option value="right">Der</option>
        </select>

        <label className="text-sm text-gray-600">Pos. X</label>
        <div className="flex items-center gap-2">
          <input type="range" min={0} max={100}
            value={box.xPct}
            onChange={(e)=>onBoxChange({ xPct: Number(e.target.value) })}
            className="w-40"/>
          <span className="w-12 text-right text-sm">{box.xPct}%</span>
        </div>

        <label className="text-sm text-gray-600">Pos. Y</label>
        <div className="flex items-center gap-2">
          <input type="range" min={0} max={100}
            value={box.yPct}
            onChange={(e)=>onBoxChange({ yPct: Number(e.target.value) })}
            className="w-40"/>
          <span className="w-12 text-right text-sm">{box.yPct}%</span>
        </div>

        <label className="text-sm text-gray-600">Ancho</label>
        <div className="flex items-center gap-2">
          <input type="range" min={10} max={100}
            value={box.widthPct}
            onChange={(e)=>onBoxChange({ widthPct: Number(e.target.value) })}
            className="w-40"/>
          <span className="w-12 text-right text-sm">{box.widthPct}%</span>
        </div>
      </div>

      <div className="mt-2">
        <div className="text-sm font-medium text-gray-700 mb-2">Padding (px)</div>
        <div className="grid grid-cols-4 gap-2">
          {(["t","r","b","l"] as const).map(edge=>(
            <div key={edge} className="flex flex-col">
              <label className="text-xs text-gray-500 uppercase">{edge}</label>
              <input type="number" value={style.padding[edge]}
                onChange={(e)=>onPRChange("padding", edge, Number(e.target.value))}
                className="border rounded p-1"/>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2">
        <div className="text-sm font-medium text-gray-700 mb-2">Margen (px)</div>
        <div className="grid grid-cols-4 gap-2">
          {(["t","r","b","l"] as const).map(edge=>(
            <div key={edge} className="flex flex-col">
              <label className="text-xs text-gray-500 uppercase">{edge}</label>
              <input type="number" value={style.margin[edge]}
                onChange={(e)=>onPRChange("margin", edge, Number(e.target.value))}
                className="border rounded p-1"/>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* --- Imagen superpuesta (drag) --- */
function ImageOverlay({
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

  const onTouchStart = (e: React.TouchEvent<HTMLImageElement>) => {
    onSelect();
    const t = e.touches[0];
    const img = e.currentTarget;
    const rect = img.getBoundingClientRect();
    const startLeft = (style.xPct/100)*area.w;
    const startTop  = (style.yPct/100)*area.h;
    const start = { x: t.clientX, y: t.clientY };
    const onMove = (ev: TouchEvent) => {
      ev.preventDefault();
      const tt = ev.touches[0];
      let newLeft = startLeft + (tt.clientX - start.x);
      let newTop  = startTop  + (tt.clientY - start.y);
      newLeft = Math.max(0, Math.min(area.w - rect.width, newLeft));
      newTop  = Math.max(0, Math.min(area.h - rect.height, newTop));
      onStyleChange({
        xPct: Math.max(0, Math.min(100, (newLeft/area.w)*100)),
        yPct: Math.max(0, Math.min(100, (newTop /area.h)*100)),
      });
    };
    const onEnd = () => { window.removeEventListener("touchmove", onMove); window.removeEventListener("touchend", onEnd); };
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
  };

  return (
    <img
      src={src}
      alt="Overlay"
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      className={`select-none cursor-move ${selected ? "ring-2 ring-blue-500/60 rounded" : ""}`}
      style={{
        position: "absolute",
        left: `${style.xPct}%`,
        top: `${style.yPct}%`,
        width: `${style.widthPct}%`,
        height: "auto",
        opacity: style.opacity,
        borderRadius: style.borderRadius,
        transform: `rotate(${style.rotation}deg) scaleX(${style.flipX?-1:1}) scaleY(${style.flipY?-1:1})`,
        transformOrigin: "top left",
        zIndex: selected ? 20 : 10,
      }}
      draggable={false}
    />
  );
}

/* --- Panel: controles de imagen --- */
function ImageControls({
  src, style, onSrcChange, onStyleChange
}: {
  src: string | null;
  style: ImageStyle;
  onSrcChange: (dataUrl: string | null) => void;
  onStyleChange: (patch: Partial<ImageStyle>) => void;
}) {
  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => onSrcChange(r.result as string);
    r.readAsDataURL(f);
  };
  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm text-gray-600 block mb-1">Archivo</label>
        <input type="file" accept="image/*" onChange={onPick} />
        {src ? (
          <div className="text-xs text-green-700 mt-1">Imagen cargada</div>
        ) : (
          <div className="text-xs text-gray-500 mt-1">Sube PNG/JPG</div>
        )}
      </div>

      <LabeledSlider label="Tamaño"   min={5}   max={100} value={style.widthPct}  onChange={(v)=>onStyleChange({ widthPct: v })} unit="%" />
      <LabeledSlider label="Opacidad" min={0}   max={1}   value={style.opacity}   onChange={(v)=>onStyleChange({ opacity: v })} step={0.01} unit={`${Math.round(style.opacity*100)}%`} />
      <LabeledSlider label="Rotación" min={-180} max={180} value={style.rotation} onChange={(v)=>onStyleChange({ rotation: v })} unit="°" />
      <LabeledSlider label="Borde"    min={0}   max={120} value={style.borderRadius} onChange={(v)=>onStyleChange({ borderRadius: v })} unit="px" />

      <LabeledSlider label="Pos. X"   min={0}   max={100} value={style.xPct}     onChange={(v)=>onStyleChange({ xPct: v })} unit="%" />
      <LabeledSlider label="Pos. Y"   min={0}   max={100} value={style.yPct}     onChange={(v)=>onStyleChange({ yPct: v })} unit="%" />

      <div className="flex items-center gap-3">
        <button className={`px-2 py-1 text-sm rounded border ${style.flipX?"bg-gray-800 text-white":"border-gray-300"}`}
          onClick={()=>onStyleChange({ flipX: !style.flipX })}>Flip X</button>
        <button className={`px-2 py-1 text-sm rounded border ${style.flipY?"bg-gray-800 text-white":"border-gray-300"}`}
          onClick={()=>onStyleChange({ flipY: !style.flipY })}>Flip Y</button>
        {src && (
          <button className="ml-auto px-2 py-1 text-sm rounded border border-red-300 text-red-600"
            onClick={()=>onSrcChange(null)}>Quitar imagen</button>
        )}
      </div>
    </div>
  );
}

/* ─────────────── Editor contenedor ─────────────── */
export default function EditorSanRamon() {
  const bgSrc = "/images/img1.png";
  const [principalRef, principalSize] = useElementSize<HTMLDivElement>();
  const natBg = useImageNaturalSize(bgSrc);
  const drawn = useMemo(() => computeContainRect(principalSize, natBg), [principalSize, natBg]);

  // Estado de textos
  const [text, setText] = useState<Record<TextKey, string>>({
    titulo: "Con profunda tristeza nos despedimos de",
    nombre: "Editor San Ramón",
    fecha:  "12/10/2025 + 12/10/2025",
    capilla: "AGRADECEMOS LA PRESENCIA DE AMIGOS Y FAMILIARES DURANTE EL ÚLTIMO ADIÓS EL DÍA:",
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

  // Imagen overlay
  const [overlaySrc, setOverlaySrc] = useState<string | null>(null);
  const [imgStyle, setImgStyle] = useState<ImageStyle>({
    xPct: 40, yPct: 55, widthPct: 30, opacity: 1, rotation: 0, borderRadius: 0, flipX: false, flipY: false,
  });

  // Selección actual
  const [selectedKey, setSelectedKey] = useState<Key>("titulo");
  const isTextKey = (k: Key): k is TextKey => k !== "imagen";

  // Helpers de actualización
  const setTextByKey = (k: TextKey, v: string) => setText((t) => ({ ...t, [k]: v }));
  const updateStyle = <K extends keyof TextStyle>(k: TextKey, key: K, val: TextStyle[K]) =>
    setStyles((s) => ({ ...s, [k]: { ...s[k], [key]: val } }));
  const updatePR = (k: TextKey, kind: "padding" | "margin", edge: "t" | "r" | "b" | "l", val: number) =>
    setStyles((s) => ({ ...s, [k]: { ...s[k], [kind]: { ...s[k][kind], [edge]: val } } }));
  const updateBox = (k: TextKey, patch: Partial<TextBoxPos>) =>
    setBoxes((b) => ({ ...b, [k]: { ...b[k], ...patch } }));

  return (
    <div className="w-full h-[100vh] flex">
      {/* Panel izquierdo */}
      <div className="w-[380px] h-full bg-white border-r border-gray-200 overflow-auto p-4 space-y-4">
        <h2 className="text-lg font-semibold text-black">Controles</h2>

        {/* Selector de capa */}
        <div className="flex gap-2 flex-wrap">
          {(["titulo","nombre","fecha","capilla","imagen"] as Key[]).map(k => (
            <button key={k} onClick={() => setSelectedKey(k)}
              className={`px-3 py-1 rounded border text-sm ${
                selectedKey===k ? "bg-blue-600 text-white border-blue-600":"border-black text-black"}`}>
              {k==="titulo"?"Título":k==="nombre"?"Nombre":k==="fecha"?"Fecha":k==="capilla"?"Capilla":"Imagen"}
            </button>
          ))}
        </div>

        {/* Panel dinámico */}
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
        ) : (
          <ImageControls
            src={overlaySrc}
            style={imgStyle}
            onSrcChange={setOverlaySrc}
            onStyleChange={(patch)=>setImgStyle(s=>({ ...s, ...patch }))}
          />
        )}
      </div>

      {/* Lienzo */}
      <div className="h-full w-full bg-gray-200">
        <div id="idDivPrincipal" ref={principalRef} className="relative h-full w-full">
          {/* Fondo */}
          <img
            src="/images/img1.png"
            alt="Fondo"
            className="absolute inset-0 h-full w-full object-contain select-none pointer-events-none"
            draggable={false}
          />

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

              {overlaySrc && (
                <ImageOverlay
                  src={overlaySrc}
                  style={imgStyle}
                  area={{ w: drawn.w, h: drawn.h }}
                  selected={selectedKey==="imagen"}
                  onSelect={()=>setSelectedKey("imagen")}
                  onStyleChange={(patch)=>setImgStyle(s=>({ ...s, ...patch }))}
                />
              )}
            </div>
          )}

          {/* Debug */}
          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs rounded px-2 py-1">
            cont: {principalSize.width}×{principalSize.height}px
            {drawn ? ` · img: ${drawn.w}×${drawn.h}px` : " · img: cargando..."}
          </div>
        </div>
      </div>
    </div>
  );
}
