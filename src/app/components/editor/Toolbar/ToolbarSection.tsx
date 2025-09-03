"use client";
import * as React from "react";
import { useNode } from "@craftjs/core";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid
} from "@mui/material";

function pick<T extends object, K extends keyof T>(
  obj: Partial<T> | undefined,
  keys: readonly K[]
): Partial<Pick<T, K>> {
  const out = {} as Partial<Pick<T, K>>;
  if (!obj) return out;
  for (const k of keys) {
    out[k] = obj[k];
  }
  return out;
}

type SummaryFn<T, K extends keyof T> = (picked: Partial<Pick<T, K>>) => React.ReactNode;

export interface ToolbarSectionProps<
  T extends Record<string, unknown>,
  K extends keyof T = keyof T
> {
  title: string;
  /** Lista de props del nodo que quieres leer y mostrar/resumir */
  propKeys?: readonly K[];
  /** Renderiza un resumen con las props seleccionadas */
  summary?: SummaryFn<T, K>;
  children?: React.ReactNode;
}

export function ToolbarSection<
  T extends Record<string, unknown>,
  K extends keyof T = keyof T
>({ title, propKeys, summary, children }: ToolbarSectionProps<T, K>) {
  // Extrae del nodo solo las props indicadas en propKeys
  const { picked } = useNode((node) => {
    if (!propKeys?.length) {
      return { picked: {} as Partial<Pick<T, K>> };
    }
    const nodeProps = (node.data.props ?? {}) as Partial<T>;
    return { picked: pick<T, K>(nodeProps, propKeys) };
  });


  return (
    <Accordion
      sx={{
        background: "transparent",
        boxShadow: "none",
        "&:before": { backgroundColor: "rgba(0,0,0,0.05)" },
        "&.Mui-expanded": {
          m: 0,
          minHeight: 40,
          "&:before": { opacity: 1 },
        },
      }}
    >
      <AccordionSummary sx={{ minHeight: 36, p: 0, outline: "none!important" }}>
        <div style={{ paddingLeft: 24, paddingRight: 24, width: "100%" }}>
          <Grid container alignItems="center" spacing={3}>
            <Grid size={4}>
              <h5 className="text-sm font-medium text-dark-gray">{title}</h5>
            </Grid>

            {summary && propKeys && propKeys.length > 0 && (
              <Grid size={8}>
                <h5 className="text-sm text-right text-dark-blue">
                  {summary(picked as Partial<T>)}
                </h5>
              </Grid>
            )}
          </Grid>
        </div>
      </AccordionSummary>

      <AccordionDetails sx={{ p: "0 24px 20px" }}>
        <Grid container spacing={1}>
          {children}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}
