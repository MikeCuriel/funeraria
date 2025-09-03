// components/selectors/Image.tsx
"use client";
import * as React from "react";
import { UserComponent, useNode } from "@craftjs/core";
import { ImageSettings } from "./ImageSettins";

export type ImageProps = {
  src?: string;
  alt?: string;
  width?: string;
  height?: string;
  objectFit?: React.CSSProperties["objectFit"];
  radius?: number;
  shadow?: number;
  margin?: [string,string,string,string];
};

const defaultProps: Required<Omit<ImageProps, "src"|"alt">> & { src: string; alt: string } = {
  src: "/placeholder.png",
  alt: "image",
  width: "300px",
  height: "auto",
  objectFit: "contain",
  radius: 0,
  shadow: 0,
  margin: ["0","0","0","0"],
};

export const Image: UserComponent<Partial<ImageProps>> = (props) => {
  const p = { ...defaultProps, ...props };
  const { connectors: { connect, drag } } = useNode();

  const ref = React.useCallback((el: HTMLDivElement | null) => {
    if (el) connect(drag(el));
  }, [connect, drag]);

  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        justifyContent: "center",
        margin: `${p.margin[0]}px ${p.margin[1]}px ${p.margin[2]}px ${p.margin[3]}px`,
      }}
    >
      <img
        src={p.src}
        alt={p.alt}
        style={{
          width: p.width,
          height: p.height,
          objectFit: p.objectFit,
          borderRadius: p.radius,
          boxShadow: p.shadow ? `0 6px 40px rgba(0,0,0,0.2)` : "none",
          display: "block",
        }}
      />
    </div>
  );
};

Image.craft = {
  displayName: "Imagen",
  props: defaultProps,
  related: {
    toolbar: ImageSettings,   // 👈 aparece el panel de edición
  },
};
