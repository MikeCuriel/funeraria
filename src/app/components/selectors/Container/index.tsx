"use client";
import React, { type CSSProperties } from "react";
import { UserComponent } from "@craftjs/core";   // 👈 importa este tipo
import { ContainerSettings } from "./ContainerSettings";
import { Resizer } from "../Resizer";

export type ContainerProps = {
  background: Record<"r" | "g" | "b" | "a", number>;
  color: Record<"r" | "g" | "b" | "a", number>;
  flexDirection: CSSProperties["flexDirection"];
  alignItems: CSSProperties["alignItems"];
  justifyContent: CSSProperties["justifyContent"];
  fillSpace: string;
  width: string;
  height: string;
  padding: string[];
  margin: string[];
  marginTop: number;
  marginLeft: number;
  marginBottom: number;
  marginRight: number;
  shadow: number;
  children: React.ReactNode;
  radius: number;
};

const defaultProps: Required<ContainerProps> = {
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "flex-start",
  fillSpace: "no",
  padding: ["0", "0", "0", "0"],
  margin: ["0", "0", "0", "0"],
  background: { r: 255, g: 255, b: 255, a: 1 },
  color: { r: 0, g: 0, b: 0, a: 1 },
  shadow: 0,
  radius: 0,
  width: "100%",
  height: "auto",
  marginTop: 0,
  marginLeft: 0,
  marginBottom: 0,
  marginRight: 0,
  children: null,
};

const toRgba = (c: ContainerProps["background"]) =>
  `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`;

// 👇 Usa UserComponent en lugar de React.FC
export const Container: UserComponent<Partial<ContainerProps>> = (props) => {
  const merged = { ...defaultProps, ...props };

  const {
    flexDirection,
    alignItems,
    justifyContent,
    fillSpace,
    background,
    color,
    padding,
    margin,
    shadow,
    radius,
    children,
  } = merged;

  return (
    <Resizer
      propKey={{ width: "width", height: "height" }}
      style={{
        justifyContent,
        flexDirection,
        alignItems,
        background: toRgba(background),
        color: toRgba(color),
        padding: `${padding[0]}px ${padding[1]}px ${padding[2]}px ${padding[3]}px`,
        margin: `${margin[0]}px ${margin[1]}px ${margin[2]}px ${margin[3]}px`,
        boxShadow: shadow === 0 ? "none" : `0px 3px 100px ${shadow}px rgba(0,0,0,0.13)`,
        borderRadius: `${radius}px`,
        flex: fillSpace === "yes" ? 1 : "unset",
      }}
    >
      {children}
    </Resizer>
  );
};

// ✅ Ahora TS reconoce la propiedad estática craft
Container.craft = {
  displayName: "Container",
  props: defaultProps,
  rules: { canDrag: () => true },
  related: { toolbar: ContainerSettings },
};
