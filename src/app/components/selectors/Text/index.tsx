"use client";
import React from "react";
import { useNode, useEditor, type UserComponent } from "@craftjs/core";
import ContentEditable, { type ContentEditableEvent } from "react-contenteditable";

import { TextSettings } from "./TextSettings";

type RGBA = { r: number; g: number; b: number; a: number };

export type TextProps = {
  fontSize: number | string;                              // px
  textAlign: "left" | "center" | "right" | "justify";
  fontWeight: number | string;
  color: RGBA;
  shadow: number;                                // 0..100 (opacidad)
  text: string;
  margin: [number, number, number, number];
  onTextChange?: (value: string) => void;
  onFontSizeChange?: (value:number) => void;
};

const defaultProps: Required<Omit<TextProps, 'onTextChange' | 'onFontSizeChange'>> = {
  fontSize: 15,
  textAlign: 'left',
  fontWeight: 500,
  color: { r: 92, g: 90, b: 90, a: 1 },
  margin: [0, 0, 0, 0],
  shadow: 0,
  text: 'Text',
};

const toRgba = (c: RGBA) => `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`;

export const Text: UserComponent<Partial<TextProps>> = (props) => {
  const p = { ...defaultProps, ...props };

  const {
    connectors: { connect },
    actions: { setProp },
  } = useNode();

  const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }));

  const attachRef = (el: HTMLElement | null) => {
    if (el) connect(el);
  };

  const onChange = (e: ContentEditableEvent) => {
    let html = "";
    if (e.currentTarget && typeof e.currentTarget.innerText === "string") {
      html = e.currentTarget.innerText;
    } else if (e.target && "value" in e.target) {
      html = (e.target as HTMLInputElement).value ?? "";
    }
    setProp((draft: Partial<TextProps>) => { draft.text = html; }, 500);
    p.onTextChange?.(html);
  };

  // Elimina el efecto que dispara el callback en renders automáticos.
  // El callback debe dispararse solo por interacción del usuario (por ejemplo, desde el panel de configuración).

  return (
    <ContentEditable
      innerRef={attachRef}
      html={p.text}
      disabled={!enabled}
      onChange={onChange}
      tagName="h2"
      style={{
        width: "100%",
        margin: `${p.margin[0]}px ${p.margin[1]}px ${p.margin[2]}px ${p.margin[3]}px`,
        color: toRgba(p.color),
        fontSize: `${p.fontSize}px`,
        textShadow: `0px 0px 2px rgba(0,0,0,${(p.shadow || 0) / 100})`,
        fontWeight: p.fontWeight,
        textAlign: p.textAlign,
      }}
    />
  );
};

Text.craft = {
  displayName: "Text",
  props: defaultProps,
  related: { toolbar: TextSettings }
};
