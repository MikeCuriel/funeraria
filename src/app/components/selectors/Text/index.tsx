import React from "react";
import { useNode, useEditor } from "@craftjs/core";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
import { TextSettings } from "./TextSettings";

type RGBA = { r: number; g: number; b: number; a: number };

export type TextProps = {
  fontSize: string;
  textAlign: string;
  fontWeight: number | string;
  color: RGBA;
  shadow: number;
  text: string;
  onCommit?: (text: string) => void;
  margin: [string|number, string|number, string|number, string|number];
};

const defaultProps: Required<Omit<TextProps, "onCommit">> = {
  fontSize: "15",
  textAlign: "left",
  fontWeight: 500,
  color: { r: 92, g: 90, b: 90, a: 1 },
  margin: [0, 0, 0, 0],
  shadow: 0,
  text: "",
};


export const Text = (p: Partial<TextProps>) => {
  const {
    connectors: { connect },
    actions: { setProp },
  } = useNode();
  const { enabled } = useEditor((s) => ({ enabled: s.options.enabled }));
  const [localHtml, setLocalHtml] = React.useState<string>(p.text ?? "");
  const focusedRef = React.useRef(false);
  const debounceRef = React.useRef<number | null>(null);

  // sincróniza desde props SOLO si no estás editando
  React.useEffect(() => {
    if (!focusedRef.current) setLocalHtml(p.text ?? "");
  }, [p.text]);

  const onChange = (e: ContentEditableEvent) => {
    const html = e.target.value;
    setLocalHtml(html);

    const plain = html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/&nbsp;/gi, ' ')
      .replace(/<\/?[^>]+>/g, '');

    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      p.onCommit?.(plain);  // setName(plain)
    }, 200); // 200–300ms suele ir bien
  };

  const onFocus = () => { focusedRef.current = true; };
  const onBlur = () => {
    focusedRef.current = false;
    const plain = localHtml
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/&nbsp;/gi, ' ')
      .replace(/<\/?[^>]+>/g, '')
      .trim();

    setProp((props: Partial<TextProps>) => {
      props.text = plain;   // <- actualiza el prop del nodo en Craft
    });

    p.onCommit?.(plain);     // <- notifica al padre
  };

  // helpers para estilos (evita Object.values en color)
  const { r, g, b, a } = p.color ?? { r: 92, g: 90, b: 90, a: 1 };

  const m = p.margin ?? [0,0,0,0];
  const m0 = Number(m[0]); const m1 = Number(m[1]); const m2 = Number(m[2]); const m3 = Number(m[3]);

  const fs = Number(p.fontSize ?? 15);

  return (
    <ContentEditable
      innerRef={connect}
      html={localHtml}
      disabled={!enabled}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      tagName="h2"
      style={{
        width: "100%",
        margin: `${m0}px ${m1}px ${m2}px ${m3}px`,
        color: `rgba(${r}, ${g}, ${b}, ${a})`,
        fontSize: `${fs}px`,
        textShadow: `0 0 2px rgba(0,0,0,${(p.shadow ?? 0)/100})`,
        fontWeight: p.fontWeight ?? "500",
        textAlign: (p.textAlign as string) ?? "left",
      }}
    />
  );
};

Text.craft = {
  displayName: "Text",
  props: defaultProps,
  related: { toolbar: TextSettings },
};
