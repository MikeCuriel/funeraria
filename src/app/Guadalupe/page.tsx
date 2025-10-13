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
import { useMemorialDefaults } from '../hooks/useMemorialDefault';
import Cookies from 'js-cookie'; // si ya manejas isGuadalupe por cookie, etc.
import { getOrCreateInstallId } from '../utils/device';

const LayersTheme = styled.div<{ $base?: string; $selected?: string }>`
  &, & * { color: ${props => props.$base ?? '#ff0000'}; }
  & svg { fill: currentColor; }
  & .craftjs-layer-item-selected,
  & .craftjs-layer-item.is-selected,
  & [data-selected='true'] {
    color: ${props => props.$selected ?? '#f00'};
    font-weight: 600;
  }
`;

type ObjectFit = NonNullable<React.CSSProperties['objectFit']>

// type Prefs = {
//   title: string;
//   nombre: string;
// };

// const DEFAULTS: Prefs = { title: "CON PROFUNDA TRISTEZA ANUNCIAMOS EL FALLECIMIENTO DE", nombre: "FULANITO PEREZ MALDONADO" };

function useContainedSize(aspect: number) {
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const [size, setSize] = React.useState({ width: 1, height: 1 });

  React.useEffect(() => {
    let raf: number | null = null;

    const compute = () => {
      const el = hostRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;

      if (W === 0 || H === 0) {
        // si aún no tiene tamaño, vuelve a intentar en el próximo frame
        raf = requestAnimationFrame(compute);
        return;
      }

      const containerAspect = W / H;
      let width: number, height: number;
      if (containerAspect > aspect) { height = H; width = height * aspect; }
      else { width = W; height = width / aspect; }

      setSize({ width, height });
    };

    compute();

    const el = hostRef.current;
    const ro = new ResizeObserver(() => compute());
    if (el) ro.observe(el);

    const onWinResize = () => compute();
    window.addEventListener('resize', onWinResize);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', onWinResize);
    };
  }, [aspect]);

  return { hostRef, size };

}


export default function EditorWithLayers() {
  // Obtener el device_id único
  const device_id = getOrCreateInstallId();

  // Lee tu cookie/estado real de isGuadalupe como ya lo haces en otras páginas
  const raw = Cookies.get('isGuadalupe');
  const isGuadalupe = raw === 'true' ? true : raw === 'false' ? false : null;

  const { defaults, loading, save } = useMemorialDefaults(isGuadalupe);
  const TARGET_W = 1080;
  const TARGET_H = 1920;
  const aspect = 1080 / 1920; // ancho/alto de tu imagen
  const { hostRef, size } = useContainedSize(aspect);
  const images = ["./images/img.png", "./images/img1.png"]; // en /public
  const [idx, setIdx] = React.useState(0);
  const previewRef = React.useRef<HTMLDivElement | null>(null);
  const [celular, setCelular] = React.useState("");
  const router = useRouter()
  const [name, setName] = React.useState("FULANITO PEREZ MALDONADO");

  const [fontTextTitulo, setFontTextTitulo] = React.useState<number | undefined>(undefined);
  const [fontTextNombre, setFontTextNombre] = React.useState<number | undefined>(undefined);

  // Inicializa el estado local con el valor de defaults al cargar
  React.useEffect(() => {
    if (defaults && typeof defaults.nombre.fontTextNombre === 'number') {
      setFontTextNombre(defaults.nombre.fontTextNombre);
    }
    if(defaults && typeof defaults.titulo.fontTextTitulo === 'number'){
       setFontTextTitulo(defaults.titulo.fontTextTitulo);
    }
  }, [defaults]);

  // Persiste el cambio solo en un efecto, usando device_id
  React.useEffect(() => {
    if (!defaults) return;

    const next = {
      ...defaults,
      nombre: {
        ...defaults.nombre,
        ...(fontTextNombre !== undefined ? { fontTextNombre } : {}),
      },
      titulo: {
        ...defaults.titulo,
        ...(fontTextTitulo !== undefined ? { fontTextTitulo } : {}),
      },
      ...(device_id !== undefined ? { device_id } : {}),
    };
    console.log('Saving config', { next });
    save(next);

  }, [defaults, fontTextNombre, fontTextTitulo, device_id]);

  // Callback para el hijo
  const onChangeFontTextNombre = React.useCallback((value: number) => {
    setFontTextNombre(value);
  }, []);

  const onChangeFontTextTitulo = React.useCallback((value: number) => {
    setFontTextTitulo(value);
  }, []);

  const toObjectFit = (v: string): ObjectFit => {
  const allowed: ObjectFit[] = ['contain', 'cover', 'fill', 'none', 'scale-down']
  return allowed.includes(v as ObjectFit) ? (v as ObjectFit) : 'contain'
}

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
        bGuadalupe: true
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

const todayMX = new Intl.DateTimeFormat('es-MX', {
  timeZone: 'America/Mexico_City',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
}).format(new Date())

const resolveFecha = (v: string) => {
  if (v?.startsWith('{hoy')) {
    // único formato dd/MM/yyyy (rápido)
    return todayMX
  }
  return v
}


  // 🔑 Re-monta el Frame cuando cambie la config
  const frameKey = React.useMemo(
    () => `frame-${defaults ? JSON.stringify(defaults).length : 0}`,
    [defaults]
  );

  // Flag de listo
  const isReady = !loading && isGuadalupe !== null && !!defaults;

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
            {isReady ? (
            <div style={{ position: "absolute", inset: 0 }}>  
              <Frame key={frameKey}>
                <Element is={Container} canvas alignItems="center" background={{ r: 0, g: 0, b: 0, a: 0 }} 
                margin={[
                  defaults.contenedor.margenContenedorArriba, 
                  defaults.contenedor.margenContenedorDerecha, 
                  defaults.contenedor.margenContenedorAbajo, 
                  defaults.contenedor.margenContenedorIzquierda
                ]} 
                padding={[
                  defaults.contenedor.paddingContenedorArriba,
                  defaults.contenedor.paddingContenedorDerecha,
                  defaults.contenedor.paddingContenedorAbajo,
                  defaults.contenedor.paddingContenedorIzquierda
                ]}>
                  <Text text={defaults.titulo.text} textAlign={defaults.titulo.fontAlignTitulo as "center" | "left" | "right" | "justify"}
                  fontWeight={defaults.titulo.fontDecorationTitulo}
                  onFontSizeChange={onChangeFontTextTitulo}
                  fontSize={fontTextTitulo ?? defaults.titulo.fontTextTitulo} 
                  margin={[
                    defaults.titulo.margenTituloArriba, 
                    defaults.titulo.margenTituloDerecha, 
                    defaults.titulo.margenTituloAbajo,
                    defaults.titulo.margenTituloIzquierda
                  ]}  />
                  <Text 
                  text={name}
                  onTextChange={setName}
                  onFontSizeChange={onChangeFontTextNombre}
                  textAlign={defaults.nombre.fontAlignNombre as "center" | "left" | "right" | "justify"}
                  fontSize={fontTextNombre ?? defaults.nombre.fontTextNombre}
                  fontWeight={defaults.nombre.fontDecorationNombre}
                />
                  <CraftImage 
                  src={defaults.imagen.defaultImagen} 
                  alt={defaults.imagen.textoDefault} 
                  width={defaults.imagen.ImagenAncho} 
                  height={defaults.imagen.ImagenAltura} 
                  objectFit={toObjectFit(defaults.imagen.ajuste)} 
                  radius={defaults.imagen.imagenBorder} 
                  margin={[
                    defaults.imagen.MargenImagenArriba,
                    defaults.imagen.MargenImagenDerecha,
                    defaults.imagen.MargenImagenAbajo,
                    defaults.imagen.MargenImagenIzquierda
                  ]}/>

                  <Text text={resolveFecha(defaults.fecha.textFecha) + ' + ' + resolveFecha(defaults.fecha.textFecha)}
                   textAlign={defaults.fecha.fontAlignFecha as "center" | "left" | "right" | "justify"}
                   fontSize={defaults.fecha.fontTextFecha}
                   fontWeight={defaults.fecha.fontDecorationFecha}
                   margin={[
                    defaults.fecha.margenFechaArriba,
                    defaults.fecha.margenFechaDerecha,
                    defaults.fecha.margenFechaAbajo,
                    defaults.fecha.margenFechaIzquierda
                   ]}
                   />
                  <MemorialMessage
                    venue="CAPILLA: LA PIEDAD"
                    venueOptions={["CAPILLA: LA PIEDAD", "CAPILLA: RESURRECCION", "CAPILLA: SAGRADO CORAZON", "CAPILLA: GUADALUPANA", "CAPILLA: FATIMA", "CAPILLA: JUAN PABLO II", "CAPILLA: SAN MIGUEL"]}
                    textAlign="center"
                    fontSize={18}
                    fontWeight={500}
                  />
                  <CraftImage src="./images/logoGuadalupe.svg" alt="Foto funeraria" width="200px" height="200px"/>
                </Element>
              </Frame>
            </div>
            ) : (
          // placeholder de carga SIN hooks
          <div className="w-full h-full flex items-center justify-center text-white">
            Cargando configuración…
          </div>
        )}
          </div>
        </div>
      </div>
    </Editor>
  );
}

