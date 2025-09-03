"use client";
import * as React from "react";
import { useNode } from "@craftjs/core";
import { ToolbarSection } from "../../editor/Toolbar/ToolbarSection";
import { ToolbarItem } from "../../editor/Toolbar/ToolbarItem";
import { ToolbarDropdown } from "../../editor/Toolbar/ToolbarDropdown";

type ObjectFit = "contain" | "cover" | "fill" | "none" | "scale-down";

type ImageNodeProps = {
  src?: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
  objectFit?: ObjectFit;
  radius?: number;
  shadow?: number;
  margin?: number[]; // [top, right, bottom, left]
};

export const ImageSettings: React.FC = () => {
  const {
    actions: { setProp },
  } = useNode();

  const onPickLocal = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string; // data:image/png;base64,...
        setProp((draft: Partial<ImageNodeProps>) => {
          draft.src = dataUrl; // guardamos la imagen en la prop src
        });
      };
      reader.readAsDataURL(file);
      e.currentTarget.value = ""; // limpiar input
    },
    [setProp]
  );

  return (
    <>
      {/* Cargar archivo local */}
      <ToolbarSection<ImageNodeProps>
        title="Archivo local"
      >
        <div style={{ width: "100%" }}>
          <input type="file" accept="image/*" onChange={onPickLocal} />
          <small style={{ display: "block", marginTop: 6, opacity: 0.75 }}>
            Se guardará como Data URL en la propiedad <code>src</code>.
          </small>
        </div>
      </ToolbarSection>

      <ToolbarSection<ImageNodeProps, "width" | "height">
        title="Tamaño"
        propKeys={["width", "height"] as const}
        summary={({ width, height }) => `${width ?? "auto"} × ${height ?? "auto"}`}
      >
        <ToolbarItem propKey="width"  type="text" label="Width (px, %, etc.)" />
        <ToolbarItem propKey="height" type="text" label="Height (px, auto…)" />
      </ToolbarSection>

      <ToolbarSection<ImageNodeProps, "objectFit">
        title="Ajuste"
        propKeys={["objectFit"] as const}
        summary={({ objectFit }) => objectFit ?? "contain"}
      >
        <ToolbarItem propKey="objectFit" type="select" label="Object Fit">
          <ToolbarDropdown.Option value="contain">contain</ToolbarDropdown.Option>
          <ToolbarDropdown.Option value="cover">cover</ToolbarDropdown.Option>
          <ToolbarDropdown.Option value="fill">fill</ToolbarDropdown.Option>
          <ToolbarDropdown.Option value="none">none</ToolbarDropdown.Option>
          <ToolbarDropdown.Option value="scale-down">scale-down</ToolbarDropdown.Option>
        </ToolbarItem>
      </ToolbarSection>

      <ToolbarSection<ImageNodeProps, "radius" | "shadow" | "margin">
        title="Estilo"
        propKeys={["radius", "shadow", "margin"] as const}
        summary={() => null}
      >
        <ToolbarItem full propKey="radius" type="slider" label="Border radius" />
        <ToolbarItem full propKey="shadow" type="slider" label="Sombra" />
        <ToolbarItem propKey="margin" index={0} type="slider" label="Margin Top" />
        <ToolbarItem propKey="margin" index={1} type="slider" label="Margin Right" />
        <ToolbarItem propKey="margin" index={2} type="slider" label="Margin Bottom" />
        <ToolbarItem propKey="margin" index={3} type="slider" label="Margin Left" />
      </ToolbarSection>
    </>
  );
};
