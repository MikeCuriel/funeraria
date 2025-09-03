"use client";

import React from "react";
import { useNode, useEditor, type UserComponent } from "@craftjs/core";
import ContentEditable, { type ContentEditableEvent } from "react-contenteditable";
import { ToolbarSection, ToolbarItem } from "../../editor";
import { ToolbarRadio } from "../../editor/Toolbar/ToolbarRadio";

/* ===== Tipos ===== */
type RGBA = { r: number; g: number; b: number; a: number };

export type MemorialMessageProps = {
  // Tipografía / estilo del bloque completo
  fontSize: number;
  textAlign: "left" | "center" | "right" | "justify";
  fontWeight: number | string;
  color: RGBA;
  shadow: number;                                // 0..100
  margin: [number, number, number, number];

  // Contenido
  heading: string;    // línea 1 (editable)
  dateISO: string;    // controla línea 2 -> día/mes
  timeHHmm: string;   // controla línea 2 -> hora
  venue: string;      // controla línea 3
  venueOptions?: string[];
};

/* ===== Defaults ===== */
const defaultProps: Required<Omit<MemorialMessageProps, "venueOptions">> & {
  venueOptions: string[];
} = {
  fontSize: 18,
  textAlign: "center",
  fontWeight: 500,
  color: { r: 17, g: 24, b: 39, a: 0.95 },
  shadow: 0,
  margin: [0, 0, 0, 0],

  heading:
    "AGRADECEMOS LA PRESENCIA DE AMIGOS Y FAMILIARES DURANTE EL ÚLTIMO ADIÓS EL DÍA:",
  dateISO: "2025-08-18",
  timeHHmm: "15:34",
  venue: "CAPILLA: LA PIEDAD",
  venueOptions: [
    "CAPILLA: LA PIEDAD",
    "CAPILLA: RESURRECCION",
    "CAPILLA: SAGRADO CORAZON",
    "CAPILLA: GUADALUPANA",
    "CAPILLA: FATIMA",
    "CAPILLA: JUAN PABLO II",
    "CAPILLA: SAN MIGUEL",
  ],
};

/* ===== Utils ===== */
const toRgba = (c: RGBA) => `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`;
const MESES_ES = [
  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SEPTIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE",
] as const;

const getDayMonth = (dateISO: string) => {
  const d = new Date(`${dateISO}T00:00:00`);
  const ok = Number.isFinite(d.getTime());
  return {
    day: ok ? d.getDate() : 1,
    month: ok ? MESES_ES[d.getMonth()] : MESES_ES[0],
  };
};

const normalizeMargin = (
  m?: MemorialMessageProps["margin"]
): [number, number, number, number] => {
  const base = Array.isArray(m) ? m : [];
  return [
    Number.isFinite(base[0]) ? (base[0] as number) : 0,
    Number.isFinite(base[1]) ? (base[1] as number) : 0,
    Number.isFinite(base[2]) ? (base[2] as number) : 0,
    Number.isFinite(base[3]) ? (base[3] as number) : 0,
  ];
};

/* ===== Componente ===== */
export const MemorialMessage: UserComponent<Partial<MemorialMessageProps>> = (
  props
) => {
  const p: MemorialMessageProps = { ...defaultProps, ...props };

  const {
    connectors: { connect },
    actions: { setProp },
  } = useNode();
  const { enabled } = useEditor((s) => ({ enabled: s.options.enabled }));

  const { day, month } = getDayMonth(p.dateISO);
  const time = p.timeHHmm;

  const onChangeHeading = (e: ContentEditableEvent) => {
    const html = e.target.value;
    const plain = html.replace(/<\/?[^>]+>/g, "").trim();
    setProp((d: Partial<MemorialMessageProps>) => {
      d.heading = plain;
    }, 300);
  };

  return (
    <div
      ref={(el) => {
        if (el) connect(el);
      }}
      style={{
        width: "100%",
        margin: `${p.margin[0]}px ${p.margin[1]}px ${p.margin[2]}px ${p.margin[3]}px`,
        color: toRgba(p.color),
        fontSize: `${p.fontSize}px`,
        textShadow: `0px 0px 2px rgba(0,0,0,${(p.shadow || 0) / 100})`,
        fontWeight: p.fontWeight,
        textAlign: p.textAlign,
        lineHeight: 1.4,
      }}
    >
      {/* Línea 1: editable */}
      <ContentEditable
        html={p.heading}
        disabled={!enabled}
        onChange={onChangeHeading}
        tagName="div"
      />

      {/* Línea 2: fecha/hora */}
      <div>
        <strong>{day}</strong> DE <strong>{month}</strong> A LAS{" "}
        <strong>{time}</strong>
      </div>

      {/* Línea 3: recinto fijo + capilla */}
      <div>SAN RAMON CASA FUNERAL</div>
      <div>
        <strong>{p.venue}</strong>
      </div>
    </div>
  );
};

/* ===== Settings (panel izquierdo) ===== */
export const MemorialMessageSettings: React.FC = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as Partial<MemorialMessageProps>,
  }));

  const venues: string[] =
    props.venueOptions ?? defaultProps.venueOptions;
  const { day, month } = getDayMonth(
    props.dateISO ?? defaultProps.dateISO
  );

  return (
    <>
      <ToolbarSection<MemorialMessageProps, "dateISO" | "timeHHmm" | "venue">
        title="Fecha, hora y capilla"
        propKeys={["dateISO", "timeHHmm", "venue"] as const}
        summary={({ dateISO, timeHHmm, venue }) =>
          `${dateISO ?? ""} ${timeHHmm ?? ""} • ${venue ?? ""}`
        }
      >
        {/* Fecha */}
        <div className="mt-1">
          <label className="block text-xs text-gray-600">Fecha</label>
          <input
            type="date"
            className="w-full border rounded px-2 py-1"
            value={props.dateISO ?? ""}
            onChange={(e) =>
              setProp((d: Partial<MemorialMessageProps>) => {
                d.dateISO = e.target.value;
              })
            }
          />
          <p className="mt-1 text-[11px] text-gray-500">
            Renderiza: <strong>{day}</strong> DE <strong>{month}</strong>
          </p>
        </div>

        {/* Hora */}
        <div className="mt-2">
          <label className="block text-xs text-gray-600">Hora</label>
          <input
            type="time"
            className="w-full border rounded px-2 py-1"
            value={props.timeHHmm ?? ""}
            onChange={(e) =>
              setProp((d: Partial<MemorialMessageProps>) => {
                d.timeHHmm = e.target.value;
              })
            }
          />
        </div>

        {/* Capilla */}
        <div className="mt-2">
          <label className="block text-xs text-gray-600">
            Capilla / Recinto
          </label>
          <select
            className="w-full border rounded px-2 py-1"
            value={props.venue ?? ""}
            onChange={(e) =>
              setProp((d: Partial<MemorialMessageProps>) => {
                d.venue = e.target.value;
              })
            }
          >
            {venues.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </ToolbarSection>

      <ToolbarSection<
        MemorialMessageProps,
        "fontSize" | "fontWeight" | "textAlign"
      >
        title="Tipografía"
        propKeys={["fontSize", "fontWeight", "textAlign"] as const}
        summary={({ fontSize, fontWeight, textAlign }) =>
          `${fontSize ?? ""}, ${fontWeight ?? ""}, ${textAlign ?? ""}`
        }
      >
        <ToolbarItem
          full
          propKey="fontSize"
          type="slider"
          label="Tamaño de letra"
        />
        <ToolbarItem propKey="textAlign" type="radio" label="Alineación">
          <ToolbarRadio value="left" label="Izquierda" />
          <ToolbarRadio value="center" label="Centrado" />
          <ToolbarRadio value="right" label="Derecha" />
          <ToolbarRadio value="justify" label="Justificado" />
        </ToolbarItem>
        <ToolbarItem propKey="fontWeight" type="radio" label="Peso">
          <ToolbarRadio value="400" label="Regular" />
          <ToolbarRadio value="500" label="Medio" />
          <ToolbarRadio value="700" label="Negrita" />
        </ToolbarItem>
      </ToolbarSection>

      <ToolbarSection<MemorialMessageProps, "margin">
        title="Margen"
        propKeys={["margin"] as const}
        summary={({ margin }) => {
          const [t, r, b, l] = normalizeMargin(margin);
          return `${t}px ${r}px ${b}px ${l}px`;
        }}
      >
        <ToolbarItem propKey="margin" index={0} type="slider" label="Arriba" />
        <ToolbarItem propKey="margin" index={1} type="slider" label="Derecha" />
        <ToolbarItem propKey="margin" index={2} type="slider" label="Abajo" />
        <ToolbarItem propKey="margin" index={3} type="slider" label="Izquierda" />
      </ToolbarSection>

      <ToolbarSection<MemorialMessageProps, "color" | "shadow">
        title="Estilo"
        propKeys={["color", "shadow"] as const}
        summary={({ color, shadow }) => (
          <div className="text-right">
            <span
              style={{
                color: color ? toRgba(color) : undefined,
                textShadow: `0 0 2px rgba(0,0,0, ${(shadow ?? 0) / 100})`,
              }}
            >
              Aa
            </span>
          </div>
        )}
      >
        <ToolbarItem full propKey="color" type="color" label="Color texto" />
        <ToolbarItem full propKey="shadow" type="slider" label="Sombra" />
      </ToolbarSection>
    </>
  );
};

/* ===== Config Craft ===== */
MemorialMessage.craft = {
  displayName: "Capilla",
  props: defaultProps,
  related: { toolbar: MemorialMessageSettings },
};
