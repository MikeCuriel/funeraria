"use client";
import React from 'react';

import { capitalize, weightDescription } from '../../../utils/text';
import { ToolbarSection, ToolbarItem } from '../../editor';
import { ToolbarRadio } from '../../editor/Toolbar/ToolbarRadio';

export const TextSettings: React.FC = () => {
  type Box4 = [number, number, number, number];
  const normalizeBox = (m?: number[] | Box4): Box4 => {
    const a = Array.isArray(m) ? m : [];
    return [
      Number.isFinite(a[0] as number) ? (a[0] as number) : 0,
      Number.isFinite(a[1] as number) ? (a[1] as number) : 0,
      Number.isFinite(a[2] as number) ? (a[2] as number) : 0,
      Number.isFinite(a[3] as number) ? (a[3] as number) : 0,
    ];
  };

  // Handler para disparar el callback solo por interacción del usuario
  const handleFontSizeChange = (value: string | number | { r: number; g: number; b: number; a?: number }) => {
    if (typeof value === 'string' || typeof value === 'number') {
      const num = typeof value === 'string' ? parseFloat(value) : value;
      if (Number.isFinite(num)) {
        // Acceso seguro a window.craftjs.nodes.Text
        const win = typeof window !== 'undefined' ? window : undefined;
        const craftjs = (win && 'craftjs' in win) ? (win as Record<string, unknown>).craftjs : undefined;
    const nodes = craftjs && typeof craftjs === 'object' && 'nodes' in craftjs ? (craftjs as Record<string, unknown>).nodes : undefined;
        const node = nodes && typeof nodes === 'object' && 'Text' in nodes ? (nodes as Record<string, unknown>).Text : undefined;
        if (
          node &&
          typeof node === 'object' &&
          'props' in node &&
          node.props &&
          typeof (node.props as Record<string, unknown>).onFontSizeChange === 'function'
        ) {
          ((node.props as { onFontSizeChange: (n: number) => void }).onFontSizeChange)(num);
        }
        return num;
      }
      return value;
    }
    // Si es RGBA, simplemente retorna el valor sin modificar
    return value;
  };

  return (
    <>
      <ToolbarSection
        title="Tipografía"
        propKeys={['fontSize', 'fontWeight', 'textAlign']}
        summary={({ fontSize, fontWeight, textAlign }: { fontSize?: number|string; fontWeight?: number|string; textAlign?: string }) => {
          const fs = fontSize ?? '';
          const w  = Number(fontWeight ?? 400);
          const ta = textAlign ? capitalize(textAlign) : '';
          return `${fs}, ${weightDescription(w)}, ${ta}`;
        }}
      >
        <ToolbarItem
          full
          propKey="fontSize"
          type="slider"
          label="Tamaño de letra"
          onChange={handleFontSizeChange}
        />
        <ToolbarItem propKey="textAlign" type="radio" label="Alineacion">
          <ToolbarRadio value="left" label="Izquierda" />
          <ToolbarRadio value="center" label="Centrado" />
          <ToolbarRadio value="right" label="Derecha" />
        </ToolbarItem>
        <ToolbarItem propKey="fontWeight" type="radio" label="Fuente">
          <ToolbarRadio value="400" label="Regular" />
          <ToolbarRadio value="500" label="Medio" />
          <ToolbarRadio value="700" label="Negrita" />
        </ToolbarItem>
      </ToolbarSection>

      <ToolbarSection<{ margin?: number[] }, "margin">
        title="Margen"
        propKeys={["margin"] as const}
        summary={({ margin }) => {
          const [t, r, b, l] = normalizeBox(margin);
          return `${t}px ${r}px ${b}px ${l}px`;
        }}
      >
        <ToolbarItem propKey="margin" index={0} type="slider" label="Arriba" />
        <ToolbarItem propKey="margin" index={1} type="slider" label="Derecha" />
        <ToolbarItem propKey="margin" index={2} type="slider" label="Abajo" />
        <ToolbarItem propKey="margin" index={3} type="slider" label="Izquierda" />
      </ToolbarSection>

      <ToolbarSection
        title="Estilo"
        propKeys={['color', 'shadow']}
        summary={({ color, shadow }: { color?: {r:number; g:number; b:number; a?:number}; shadow?: number }) => (
          <div className="text-right">
            <p
              className="text-white"
              style={{
                color: color ? `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a ?? 1})` : undefined,
                textShadow: `0px 0px 2px rgba(0,0,0, ${(shadow ?? 0) / 100})`,
              }}
            >
              T
            </p>
          </div>
        )}
      >
        <ToolbarItem full propKey="color" type="color" label="Color texto" />
        <ToolbarItem full propKey="shadow" type="slider" label="Sombra" />
      </ToolbarSection>
    </>
  );
};
