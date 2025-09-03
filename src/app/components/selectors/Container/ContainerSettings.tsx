"use client";
import React from "react";

import { ToolbarSection, ToolbarItem } from "../../editor";
import { ToolbarRadio } from "../../editor/Toolbar/ToolbarRadio";

type RGBA = { r: number; g: number; b: number; a?: number };

type ContainerNodeProps = {
  width?: string | number;
  height?: string | number;

  background?: RGBA;
  color?: RGBA;

  margin?: number[];   // [top, right, bottom, left]
  padding?: number[];  // [top, right, bottom, left]

  radius?: number;
  shadow?: number;

  flexDirection?: "row" | "column";
  fillSpace?: "yes" | "no";
  alignItems?: "flex-start" | "center" | "flex-end";
  justifyContent?: "flex-start" | "center" | "flex-end";
};

const toRgba = (c?: RGBA) =>
  c ? `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a ?? 1})` : undefined;

const toBox = (arr?: number[]) => {
  const [t = 0, r = 0, b = 0, l = 0] = Array.isArray(arr) ? arr : [];
  return `${t}px ${r}px ${b}px ${l}px`;
};

export const ContainerSettings: React.FC = () => {
  return (
    <>
      <ToolbarSection<ContainerNodeProps, "width" | "height">
        title="Dimenciones"
        propKeys={["width", "height"] as const}
        summary={({ width, height }) => `${width ?? 0} x ${height ?? 0}`}
      >
        <ToolbarItem propKey="width" type="text" label="Ancho" />
        <ToolbarItem propKey="height" type="text" label="Altura" />
      </ToolbarSection>

      <ToolbarSection<ContainerNodeProps, "background" | "color">
        title="Color"
        propKeys={["background", "color"] as const}
        summary={({ background, color }) => (
          <div className="flex flex-row-reverse">
            <div
              className="shadow-md flex-end w-6 h-6 text-center flex items-center rounded-full bg-black"
              style={{ background: toRgba(background) }}
            >
              <p
                className="text-white w-full text-center"
                style={{ color: toRgba(color) }}
              >
                T
              </p>
            </div>
          </div>
        )}
      >
        <ToolbarItem full propKey="background" type="bg" label="Fondo" />
        <ToolbarItem full propKey="color" type="color" label="Color texto" />
      </ToolbarSection>

      <ToolbarSection<ContainerNodeProps, "margin">
        title="Margenes"
        propKeys={["margin"] as const}
        summary={({ margin }) => toBox(margin)}
      >
        <ToolbarItem propKey="margin" index={0} type="slider" label="Arriba" />
        <ToolbarItem propKey="margin" index={1} type="slider" label="Derecha" />
        <ToolbarItem propKey="margin" index={2} type="slider" label="Abajo" />
        <ToolbarItem propKey="margin" index={3} type="slider" label="Izquierda" />
      </ToolbarSection>

      <ToolbarSection<ContainerNodeProps, "padding">
        title="Padding"
        propKeys={["padding"] as const}
        summary={({ padding }) => toBox(padding)}
      >
        <ToolbarItem propKey="padding" index={0} type="slider" label="Arriba" />
        <ToolbarItem propKey="padding" index={1} type="slider" label="Derecha" />
        <ToolbarItem propKey="padding" index={2} type="slider" label="Abajo" />
        <ToolbarItem propKey="padding" index={3} type="slider" label="Izquierda" />
      </ToolbarSection>

      <ToolbarSection<ContainerNodeProps, "radius" | "shadow">
        title="Decoración"
        propKeys={["radius", "shadow"] as const}
      >
        <ToolbarItem full propKey="radius" type="slider" label="Radio" />
        <ToolbarItem full propKey="shadow" type="slider" label="Sombra" />
      </ToolbarSection>

      <ToolbarSection<
        ContainerNodeProps,
        "flexDirection" | "fillSpace" | "alignItems" | "justifyContent"
      >
        title="Alignment"
        propKeys={["flexDirection", "fillSpace", "alignItems", "justifyContent"] as const}
      >
        <ToolbarItem propKey="flexDirection" type="radio" label="Flex Direction">
          <ToolbarRadio value="row" label="Row" />
          <ToolbarRadio value="column" label="Column" />
        </ToolbarItem>

        <ToolbarItem propKey="fillSpace" type="radio" label="Fill space">
          <ToolbarRadio value="yes" label="Yes" />
          <ToolbarRadio value="no" label="No" />
        </ToolbarItem>

        <ToolbarItem propKey="alignItems" type="radio" label="Align Items">
          <ToolbarRadio value="flex-start" label="Flex start" />
          <ToolbarRadio value="center" label="Center" />
          <ToolbarRadio value="flex-end" label="Flex end" />
        </ToolbarItem>

        <ToolbarItem propKey="justifyContent" type="radio" label="Justify Content">
          <ToolbarRadio value="flex-start" label="Flex start" />
          <ToolbarRadio value="center" label="Center" />
          <ToolbarRadio value="flex-end" label="Flex end" />
        </ToolbarItem>
      </ToolbarSection>
    </>
  );
};
