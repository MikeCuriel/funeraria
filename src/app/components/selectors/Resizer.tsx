"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import { useNode, useEditor } from "@craftjs/core";
import cx from "classnames";
import { Resizable } from "re-resizable";
import { styled } from "styled-components";
import { debounce } from "debounce";

import {
  isPercentage,
  pxToPercent,
  percentToPx,
  getElementDimensions,
} from "../../utils/numToMeasurement";

const Indicators = styled.div<{ $bound?: "row" | "column" }>`
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none;
  span { position: absolute; width: 10px; height: 10px; background: #fff; border-radius: 100%;
    display: block; box-shadow: 0 0 12px -1px rgba(0,0,0,.25); z-index: 99999; pointer-events: none; border: 2px solid #36a9e0; }
  span:nth-child(1){ ${({$bound}) => $bound ? ($bound==="row" ? "left:50%; top:-5px; transform:translateX(-50%);" : "top:50%; left:-5px; transform:translateY(-50%);") : "left:-5px; top:-5px;"} }
  span:nth-child(2){ right:-5px; top:-5px; display: ${({$bound}) => $bound ? "none" : "block"}; }
  span:nth-child(3){ ${({$bound}) => $bound ? ($bound==="row" ? "left:50%; bottom:-5px; transform:translateX(-50%);" : "bottom:50%; left:-5px; transform:translateY(-50%);") : "left:-5px; bottom:-5px;"} }
  span:nth-child(4){ bottom:-5px; right:-5px; display: ${({$bound}) => $bound ? "none" : "block"}; }
`;

type Dim = { width: string | number; height: string | number };
type PropKey = { width: string; height: string };
type InternalResizableRef = { resizable?: HTMLElement };
type ResizerProps = {
  propKey: PropKey;
  children?: React.ReactNode;
} & Omit<
  React.ComponentProps<typeof Resizable>,
  "size" | "onResize" | "onResizeStart" | "onResizeStop" | "enable" | "ref"
>;

export const Resizer: React.FC<ResizerProps> =({ propKey, children, ...props }) => {
  const {
    id,
    actions: { setProp },
    connectors: { connect },
    fillSpace,
    nodeWidth,
    nodeHeight,
    parent,
    active,
  } = useNode((node) => ({
    parent: node.data.parent,
    active: node.events.selected,
    nodeWidth: node.data.props[propKey.width],
    nodeHeight: node.data.props[propKey.height],
    fillSpace: node.data.props.fillSpace,
  }));

  const { isRootNode, parentDirection } = useEditor((state, query) => ({
    parentDirection: parent && state.nodes[parent]?.data?.props?.flexDirection,
    isRootNode: query.node(id).isRoot(),
  }));

  const resizable = useRef<Resizable | null>(null);
  const isResizing = useRef<boolean>(false);
  const editingDimensions = useRef<{ width: number; height: number } | null>(null);
  const nodeDimensions = useRef<Dim>({ width: nodeWidth, height: nodeHeight });
  nodeDimensions.current = { width: nodeWidth, height: nodeHeight };

  const hasResizable = (x: unknown): x is InternalResizableRef =>
    typeof x === "object" && x !== null && "resizable" in x;

  const getResizableDom = (): HTMLElement | undefined => {
    const inst = resizable.current as unknown;
    return hasResizable(inst) ? inst.resizable : undefined;
  };

  const [internalDimensions, setInternalDimensions] = useState<Dim>({
    width: nodeWidth,
    height: nodeHeight,
  });

  const updateInternalDimensionsInPx = useCallback(() => {
  const { width: nW, height: nH } = nodeDimensions.current; // string | number

  const parentEl = getResizableDom()?.parentElement;
  const parentDims = parentEl ? getElementDimensions(parentEl) : undefined;

  const width =
    typeof parentDims?.width === "number"
      ? percentToPx(nW, parentDims.width)   // ✅ solo si es number
      : nW;                                  // fallback: deja el original

  const height =
    typeof parentDims?.height === "number"
      ? percentToPx(nH, parentDims.height)  // ✅ solo si es number
      : nH;

  setInternalDimensions({ width, height });
}, []);

  const updateInternalDimensionsWithOriginal = useCallback(() => {
    const { width: nW, height: nH } = nodeDimensions.current;
    setInternalDimensions({ width: nW, height: nH });
  }, []);

  const getUpdatedDimensions = (dw: number, dh: number) => {
    if (!editingDimensions.current) return;
    return {
      width: editingDimensions.current.width + dw,
      height: editingDimensions.current.height + dh,
    };
  };

  useEffect(() => {
    if (!isResizing.current) updateInternalDimensionsWithOriginal();
  }, [nodeWidth, nodeHeight, updateInternalDimensionsWithOriginal]);

  useEffect(() => {
    const listener = debounce(() => updateInternalDimensionsWithOriginal(), 1) as unknown as EventListener;
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, [updateInternalDimensionsWithOriginal]);

  const canResize = !!active; // si quieres otra condición, cámbiala aquí

  return (
    <Resizable
      enable={
        ([
          "top","left","bottom","right","topLeft","topRight","bottomLeft","bottomRight",
        ] as const).reduce((acc, key) => {
          acc[key] = canResize;
          return acc;
        }, {} as Record<"top"|"left"|"bottom"|"right"|"topLeft"|"topRight"|"bottomLeft"|"bottomRight", boolean>)
      }
      className={cx([{ "m-auto": isRootNode, flex: true }])}
      ref={(ref) => {
        if (!ref) return;
        resizable.current = ref;
        const dom = getResizableDom();
        if (dom) connect(dom);
      }}
      size={internalDimensions}
      onResizeStart={(e) => {
        updateInternalDimensionsInPx();
        e.preventDefault();
        e.stopPropagation();
        const dom = getResizableDom();
        if (!dom) return;
        const rect = dom.getBoundingClientRect();
        editingDimensions.current = { width: rect.width, height: rect.height };
        isResizing.current = true;
      }}
      onResize={(_e, _dir, _ref, d) => {
        const dom = getResizableDom();
        if (!dom) return;

        const upd = getUpdatedDimensions(d.width, d.height);
        if (!upd) return;

        let width: number | string = upd.width;
        let height: number | string = upd.height;

        const unitW: "%" | "px" = isPercentage(String(nodeWidth)) ? "%" : "px";
        const unitH: "%" | "px" = isPercentage(String(nodeHeight)) ? "%" : "px";

        const parentW = getElementDimensions(dom.parentElement!).width;
        const parentH = getElementDimensions(dom.parentElement!).height;

        // Asegura números (upd viene en px)
        const nextWpx = typeof upd.width === "number" ? upd.width : Number(upd.width);
        const nextHpx = typeof upd.height === "number" ? upd.height : Number(upd.height);

        // Construye el valor final como string según la unidad original
        let widthStr  = unitW === "%" ? `${pxToPercent(nextWpx, parentW)}%` : `${nextWpx}px`;
        let heightStr = unitH === "%" ? `${pxToPercent(nextHpx, parentH)}%` : `${nextHpx}px`;

        // Si el padre está en auto, forzamos px
        if (unitW === "%" && dom.parentElement?.style.width === "auto") {
          widthStr = `${(editingDimensions.current!.width + d.width)}px`;
        }
        if (unitH === "%" && dom.parentElement?.style.height === "auto") {
          heightStr = `${(editingDimensions.current!.height + d.height)}px`;
        }

        if (typeof width === "string" && isPercentage(width) && dom.parentElement?.style.width === "auto") {
          width = `${editingDimensions.current!.width + d.width}px`;
        }
        if (typeof height === "string" && isPercentage(height) && dom.parentElement?.style.height === "auto") {
          height = `${editingDimensions.current!.height + d.height}px`;
        }

        setProp((draft: Record<string, unknown>) => {
          draft[propKey.width]  = widthStr;
          draft[propKey.height] = heightStr;
        }, 500);
      }}
      onResizeStop={() => {
        isResizing.current = false;
        updateInternalDimensionsWithOriginal();
      }}
      {...props}
    >
      {children}
      {active && (
        <Indicators
          $bound={fillSpace === "yes" ? (parentDirection as "row" | "column" | undefined) : undefined}
        >
          <span />
          <span />
          <span />
          <span />
        </Indicators>
      )}
    </Resizable>
  );
};
