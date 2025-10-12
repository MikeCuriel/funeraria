"use client";

import React from "react";
import { Editor, Frame, Element } from "@craftjs/core";
import { Text, Container, Image as CraftImage } from "../components/selectors";
import { MemorialMessage } from "../components/selectors/Combobox/MemorialCombobox";
import { useSanRamonEditor } from "./useSanRamonEditor";
import { SanRamonSidebar } from "./SanRamonSidebar";

export default function EditorWithLayers() {
  const {
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
  } = useSanRamonEditor();

  return (
    <Editor resolver={{ Text, Container, CraftImage, MemorialMessage }}>
      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", height: "100vh" }}>
        <SanRamonSidebar
          next={next}
          prev={prev}
          setCelular={setCelular}
          handleGuardar={handleGuardar}
        />
        <div ref={hostRef} className="w-full h-full flex items-center justify-center bg-black">
          <div
            ref={previewRef}
            style={{
              width: size.width,
              height: size.height,
              backgroundImage: `url(${images[idx]})`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "100% 100%",
              position: "relative",
            }}
          >
            <div style={{ position: "absolute", inset: 0 }}>
              <Frame>
                <Element
                  is={Container}
                  canvas
                  alignItems="center"
                  background={{ r: 0, g: 0, b: 0, a: 0 }}
                  margin={[
                    defaults.contenedor.margenContenedorArriba,
                    defaults.contenedor.margenContenedorDerecha,
                    defaults.contenedor.margenContenedorAbajo,
                    defaults.contenedor.margenContenedorIzquierda,
                  ]}
                  padding={[
                    defaults.contenedor.paddingContenedorArriba,
                    defaults.contenedor.paddingContenedorDerecha,
                    defaults.contenedor.paddingContenedorAbajo,
                    defaults.contenedor.paddingContenedorIzquierda,
                  ]}
                >
                  <Text
                    text={defaults.titulo.text}
                    textAlign={defaults.titulo.fontAlignTitulo as "center" | "left" | "right" | "justify"}
                    fontWeight={defaults.titulo.fontDecorationTitulo}
                    fontSize={defaults.titulo.fontTitulo}
                    margin={[
                      defaults.titulo.margenTituloArriba,
                      defaults.titulo.margenTituloDerecha,
                      defaults.titulo.margenTituloAbajo,
                      defaults.titulo.margenTituloIzquierda,
                    ]}
                  />
                  <Text
                    text={name}
                    onTextChange={setName}
                    textAlign={defaults.nombre.fontAlignNombre as "center" | "left" | "right" | "justify"}
                    fontSize={defaults.nombre.fontTextNombre}
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
                      defaults.imagen.MargenImagenIzquierda,
                    ]}
                  />
                  <Text
                    text={resolveFecha(defaults.fecha.textFecha) + " + " + resolveFecha(defaults.fecha.textFecha)}
                    textAlign={defaults.fecha.fontAlignFecha as "center" | "left" | "right" | "justify"}
                    fontSize={defaults.fecha.fontTextFecha}
                    fontWeight={defaults.fecha.fontDecorationFecha}
                    margin={[
                      defaults.fecha.margenFechaArriba,
                      defaults.fecha.margenFechaDerecha,
                      defaults.fecha.margenFechaAbajo,
                      defaults.fecha.margenFechaIzquierda,
                    ]}
                  />
                  <MemorialMessage
                    venue="CAPILLA: LA PIEDAD"
                    venueOptions={["CAPILLA: LA PIEDAD", "CAPILLA: ANUNCIACION", "CAPILLA: MAGNA"]}
                    textAlign="center"
                    fontSize={18}
                    fontWeight={500}
                  />
                  <CraftImage src="./images/logoSanRamon.svg" alt="Foto funeraria" width="200px" height="200px" />
                </Element>
              </Frame>
            </div>
          </div>
        </div>
      </div>
    </Editor>
  );
}

//TODO ME FALTA REVISAR LA FECHA DE FALLECIDO, TENGO UNA SOLA FECHA.