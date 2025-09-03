import React from "react";
import { ToolbarSection, ToolbarItem } from "../../editor";
import { ToolbarRadio } from "../../editor/Toolbar/ToolbarRadio";

type RGBA = { r: number; g: number; b: number; a?: number };
type ButtonStyle = "full" | "outline";

type ButtonNodeProps = {
  background?: RGBA;
  color?: RGBA;
  margin?: number[]; // [top, right, bottom, left]
  buttonStyle?: ButtonStyle;
};

const toRgba = (c?: RGBA) =>
  c ? `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a ?? 1})` : undefined;

const normalizeMargin = (m?: number[]): [number, number, number, number] => {
  const base = Array.isArray(m) ? m : [];
  return [
    Number.isFinite(base[0]) ? (base[0] as number) : 0,
    Number.isFinite(base[1]) ? (base[1] as number) : 0,
    Number.isFinite(base[2]) ? (base[2] as number) : 0,
    Number.isFinite(base[3]) ? (base[3] as number) : 0,
  ];
};

export const ButtonSettings: React.FC = () => {
  return (
    <>
      <ToolbarSection<ButtonNodeProps, "background" | "color">
        title="Colors"
        propKeys={["background", "color"] as const}
        summary={({ background, color }) => (
          <div className="flex flex-row-reverse">
            <div
              className="shadow-md flex-end w-6 h-6 text-center flex items-center rounded-full bg-black"
              style={{ background: toRgba(background) }}
            >
              <p className="text-white w-full text-center" style={{ color: toRgba(color) }}>
                T
              </p>
            </div>
          </div>
        )}
      >
        <ToolbarItem full propKey="background" type="bg" label="Background" />
        <ToolbarItem full propKey="color" type="color" label="Text" />
      </ToolbarSection>

      <ToolbarSection<ButtonNodeProps, "margin">
        title="Margin"
        propKeys={["margin"] as const}
        summary={({ margin }) => {
          const [t, r, b, l] = normalizeMargin(margin);
          return `${t}px ${r}px ${b}px ${l}px`;
        }}
      >
        <ToolbarItem propKey="margin" index={0} type="slider" label="Top" />
        <ToolbarItem propKey="margin" index={1} type="slider" label="Right" />
        <ToolbarItem propKey="margin" index={2} type="slider" label="Bottom" />
        <ToolbarItem propKey="margin" index={3} type="slider" label="Left" />
      </ToolbarSection>

      <ToolbarSection<ButtonNodeProps, "buttonStyle">
        title="Decoration"
        propKeys={["buttonStyle"] as const}
      >
        <ToolbarItem propKey="buttonStyle" type="radio" label="Style">
          <ToolbarRadio value="full" label="Full" />
          <ToolbarRadio value="outline" label="Outline" />
        </ToolbarItem>
      </ToolbarSection>
    </>
  );
};
