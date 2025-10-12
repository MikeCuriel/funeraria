"use client";
import * as React from "react";
import { useNode } from "@craftjs/core";
import { Grid, Slider, RadioGroup } from "@mui/material";
import { ToolbarDropdown } from "./ToolbarDropdown";
import { ToolbarTextInput } from "./ToolbarTextInput";

type ToolbarItemType = "text" | "color" | "bg" | "number" | "slider" | "radio" | "select";
type RGBA = { r: number; g: number; b: number; a?: number };
type Input = string | number | RGBA;
type NodeDraft = Record<string, unknown>;


export type ToolbarItemProps = {
  full?: boolean;
  /** Clave de la prop del nodo que vas a editar (requerida) */
  propKey: string;
  /** Si la prop es un array, índice a editar */
  index?: number;
  type: ToolbarItemType;
  label?: string;
  prefix?: React.ReactNode;
  children?: React.ReactNode;
  onChange?: (value: any) => any;
};

export const ToolbarItem: React.FC<ToolbarItemProps> = ({
  full = false,
  propKey,
  type,
  onChange,
  index = 0,
  ...props
}) => {
  const {
    actions: { setProp },
    propValue,
  } = useNode((node) => ({
    propValue: (node.data.props as Record<string, unknown>)[propKey],
  }));

  const value = Array.isArray(propValue) ? propValue[index] : propValue;

  const setValue = (next: Input, delay = 0) => {
    setProp((draft: NodeDraft) => {
      const v = onChange?.(next as never) ?? next;
      if (Array.isArray(propValue)) {
        const curr = draft[propKey];
        const arr = Array.isArray(curr) ? [...curr] : [];
        arr[index] = v;
        draft[propKey] = arr;
      } else {
        draft[propKey] = v;
      }
    }, delay);
  };

  return (
    <Grid size={{ xs: full ? 12 : 6 }}>
      <div className="mb-2">
        {type === "slider" ? (
          <>
            {props.label && <h4 className="text-sm text-light-gray-2">{props.label}</h4>}
            <Slider
              value={Number.isFinite(Number(value)) ? Number(value) : 0}
              onChange={(_, v) => setValue(v as number, 500)}
              sx={{
                color: "#3880ff",
                height: 2,
                p: "5px 0",
                width: "100%",
                "& .MuiSlider-track": { height: 2 },
                "& .MuiSlider-thumb": { height: 12, width: 12 },
              }}
            />
          </>
        ) : type === "radio" ? (
          <>
            {props.label && <h4 className="text-sm text-light-gray-2">{props.label}</h4>}
            <RadioGroup
              value={value ?? ""}
              onChange={(e) => setValue(e.target.value)}
            >
              {props.children}
            </RadioGroup>
          </>
        ) : type === "select" ? (
          <ToolbarDropdown
            value={value ?? ""}
            onChange={(v: string) => setValue(v)}
            {...props}
          />
        ) : (
          <ToolbarTextInput
            {...props}
            type={type}
            value={value}
            onChange={(v) => {
              if (typeof v === "string" || typeof v === "number") {
                setValue(v, 300);          // text / number
              } else {
                // v es RGBA (para color/bg)
                setValue(v as never as unknown as typeof v, 300);
                // si tu setValue ya está tipado para RGBA cuando type === "color"|"bg",
                // simplemente: setValue(v, 300);
              }
            }}
          />
        )}
      </div>
    </Grid>
  );
};
