"use client"; 

import React from "react"; 
import { Editor, Frame, Element} from "@craftjs/core"; 
import { Layers } from "@craftjs/layers"; 
import { Text, Container, Image as CraftImage } from "../components/selectors"; 
import { Toolbar } from "../components/editor/Toolbar"; // 👈 ruta al Toolbar de arriba
import { styled } from 'styled-components';
// import { usePersistentStateManual } from "../hooks/useAppConfig";
import { MemorialMessage } from "../components/selectors/Combobox/MemorialCombobox";
import { supabase } from '../../services/dbConnection'
import { toCanvas } from "html-to-image";
import { useRouter } from 'next/navigation'
import {Box, TextField} from '@mui/material';

const LayersTheme = styled.div<{
  $base?: string;
  $selected?: string;
}>`
  /* Texto base para todo el panel de Layers */
  &,
  & * {
    color: ${({ $base }) => $base ?? '#ff0000'}; /* slate-100 */
  }

  /* Íconos heredan el color del texto */
  & svg {
    fill: currentColor;
  }

  /* Estado seleccionado (ajusta el selector según tu versión) */
  & .craftjs-layer-item-selected,
  & .craftjs-layer-item.is-selected,
  & [data-selected='true'] {
    color: ${({ $selected }) => $selected ?? '#f00'};
    font-weight: 600;
  }
`;


// type Prefs = {
//   title: string;
//   nombre: string;
// };

// const DEFAULTS: Prefs = { title: "CON PROFUNDA TRISTEZA ANUNCIAMOS EL FALLECIMIENTO DE", nombre: "FULANITO PEREZ MALDONADO" };

function useContainedSize(aspect: number) {
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const [size, setSize] = React.useState({ width: 0, height: 0 });

  React.useLayoutEffect(() => {
    if (!hostRef.current) return;
    const el = hostRef.current;

    const compute = (W: number, H: number) => {
      const containerAspect = W / H;
      let width: number, height: number;
      if (containerAspect > aspect) { height = H; width = height * aspect; }
      else { width = W; height = width / aspect; }
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

  const margins = React.useMemo(() => {
    const top  = Math.round(size.height / (size.width / 120)); // usa tu fórmula
    const left = Math.round(size.width  / (size.width / 30));
    return { top, left };
  }, [size.width, size.height]);

  return { hostRef, size, margins };
}

//TOOD REVISAR COMO GUARDAR LA CONFIGURACION
// function CanvasFromConfig() {
//   const [cfg, setCfg] = React.useState<any>(null);

//   React.useEffect(() => {
//     fetch("/content/config.json", { cache: "no-store" })
//       .then(r => r.json())
//       .then(setCfg)
//       .catch(() => setCfg(null));
//   }, []);

//   if (!cfg) return null;

//   return{cfg};
// }

 
export default function EditorWithLayers() {
  const TARGET_W = 1080;
  const TARGET_H = 1920;
  const aspect = 1080 / 1920; // ancho/alto de tu imagen
  const { hostRef, size } = useContainedSize(aspect);
  const images = ["./images/img.png", "./images/img1.png"]; // en /public
  const [idx, setIdx] = React.useState(0);
  // const stageRef = React.useRef<HTMLDivElement | null>(null);
  const previewRef = React.useRef<HTMLDivElement | null>(null);
  // const { draft: prefs, setDraft: setPrefs, commit: savePrefs, revert: revertPrefs } =
  //   usePersistentStateManual<Prefs>("prefs:v1", DEFAULTS)
  const [name, setName] = React.useState("FULANITO PEREZ MALDONADO");
  const [celular, setCelular] = React.useState("");
  const router = useRouter()

  // (Opcional) recordar última imagen
  React.useEffect(() => {
    const saved = Number(localStorage.getItem("bg_idx"));
    if (Number.isFinite(saved)) setIdx(saved);
  }, []);
  React.useEffect(() => {
    localStorage.setItem("bg_idx", String(idx));
  }, [idx]);

  // (Opcional) pre-carga de la siguiente imagen
  React.useEffect(() => {
    const next = new Image();
    next.src = images[(idx + 1) % images.length];
  }, [idx]);

  const next = () => setIdx((i) => (i + 1) % images.length);
  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);

const handleGuardar = async () => {
  try {
    // Fuerza que el ContentEditable dispare onBlur y envíe el último onCommit
    (document.activeElement as HTMLElement | null)?.blur();
    // da un tick para que React procese el setState del onCommit
    await new Promise((r) => setTimeout(r, 0));

    if(celular != "")
    {
    // savePrefs?.();

    const el = previewRef.current;
    if (!el) {
      alert("No encontré el área a capturar.");
      return;
    }

    // Asegura que las fuentes estén listas (opcional pero recomendable)
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (fonts?.ready) {
      try {
        await fonts.ready;
      } catch {}
    }

    // Escala para que el resultado sea EXACTAMENTE 1080x1920
    const pixelRatio = TARGET_W / el.clientWidth;

    const canvas = await toCanvas(el, {
      cacheBust: true,
      backgroundColor: "transparent",
      pixelRatio,                 // escala salida
      canvasWidth: TARGET_W,      // tamaño exacto del canvas resultante
      canvasHeight: TARGET_H,
    });



    // Subir a Supabase (mismo helper). Sanea el nombre si quieres evitar ':'
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
        // Opcional: si quieres guardar más datos, añade campos que existan en tu tabla:
        // fecha: someDateISO, hora: someTime, capilla: currentVenue
      };
      console.log(payload.nombre);

      if (url) {
        try { await navigator.clipboard.writeText(url); } catch {}
        alert(`Imagen guardada.\n${url}`);
        const { error } = await supabase.from("memorial").insert(payload);
        if (error) {
          console.error("Error al guardar memorial:", error.message);
          alert("Ocurrió un error al guardar la información del memorial.");
          return;
        }
        router.push('/')
      }
      return true;
    })();

    if (!ok) return;
    }
    else
    {
      alert("Es necesario agregar el celular.");
    }
  } catch (e) {
    console.error(e);
    alert("No se pudo generar/subir la imagen.");
  }
};

  return (
    <Editor resolver={{ Text, Container, CraftImage, MemorialMessage }}>
      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", height: "100vh" }}>
        <aside className="bg-gray-200" style={{ borderLeft: "1px solid #eee", padding: 8, overflow: "auto" }}> 
          <h4 className="text-black font-bold">Herramientas</h4> 
          <Toolbar /> {/* 👈 aquí aparece el panel del seleccionado */} 
          <hr className="mx-12"/> 
          <h4 className="text-black font-bold">Capas</h4> 
          <LayersTheme $base="#000" $selected="#ff0000">
            <Layers expandRootOnLoad />
          </LayersTheme>
          <h4 className="text-black font-bold mt-5"> Diseños</h4>
          <div>
            <button onClick={next} className="px-3 py-1 rounded bg-white/80 text-black">SIGUIENTE</button>
            <button onClick={prev} className="px-3 py-1 rounded bg-white/80 text-black">ANTERIOR</button>
          </div>
          <div>
            <Box sx={{ width: 500, maxWidth: '80%' }}>
              <TextField fullWidth label="Celular" id="Celular" onChange={(e) => setCelular(e.target.value)} />
            </Box>
            <button onClick={handleGuardar} className="px-3 py-1 rounded bg-white/80 text-black">GUARDAR</button>
          </div>
        </aside>

        {/* HOST: el área donde se pinta la imagen de fondo */}
        <div ref={hostRef} className="w-full h-full flex items-center justify-center bg-black">
          <div
            ref={previewRef}
            style={{
              width: size.width,
              height: size.height,
              backgroundImage: `url(${images[idx]})`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "100% 100%", // (o "contain" si prefieres bandas iguales a la vista)
              position: "relative",
            }}
          >
            <div style={{ position: "absolute", inset: 0 }}>  
              <Frame>
                <Element is={Container} canvas alignItems="center" background={{ r: 0, g: 0, b: 0, a: 0 }}>
                  <Text text="CON PROFUNDA TRISTEZA ANUNCIAMOS EL FALLECIMIENTO DE" textAlign="center" fontSize={"20"} fontWeight={"Medium"} />
                  <Text text={name} textAlign="center" fontSize={"50"} fontWeight={"Bold"} onTextChange={setName}/>
                  <CraftImage src="../images/luto.png" alt="Foto del difunto" width="280px" height="280px" objectFit="contain" radius={50} shadow={2}/>
                  <Text text="18/03/2025 + 18/03/2025" textAlign="center"/>
                  <MemorialMessage
                    venue="CAPILLA GUADALUPE"
                    venueOptions={["CAPILLA: LA PIEDAD", "CAPILLA: RESURRECCION", "CAPILLA: SAGRADO CORAZON", "CAPILLA: GUADALUPANA", "CAPILLA: FATIMA", "CAPILLA: JUAN PABLO II", "CAPILLA: SAN MIGUEL"]}
                    textAlign="center"
                    fontSize={18}
                    fontWeight={500}
                  />
                  <CraftImage src="./images/logoGuadalupe.svg" alt="Foto funeraria" width="200px" height="200px"/>
                </Element>
              </Frame>
            </div>
          </div>
        </div>
      </div>
    </Editor>
  );
}