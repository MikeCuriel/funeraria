"use client";
import * as React from "react";
import { useEditor } from "@craftjs/core";
import { ROOT_NODE } from "@craftjs/utils";

export * from "./ToolbarItem";
export * from "./ToolbarSection";
export * from "./ToolbarTextInput";
export * from "./ToolbarDropdown";

export const Toolbar: React.FC = () => {
  const { selectedId, name, ToolbarComp, multi } = useEditor((state, query) => {
    const ids = query.getEvent("selected").all() as string[];
    const isMulti = ids.length > 1;
    const id = !isMulti && ids.length === 1 ? ids[0] : null;

    let displayName: string | null = null;
    let toolbar: React.ElementType | null = null;

    if (id) {
      const n = query.node(id).get(); // <- usa el query, no el state
      displayName =
        ((n.data.custom as { displayName?: string } | undefined)?.displayName) ||
        n.data.displayName ||
        null;
      toolbar = (n.related as { toolbar?: React.ElementType } | undefined)?.toolbar ?? null;
    }

    return {
      multi: isMulti,
      selectedId: id,
      ToolbarComp: toolbar,
      name: displayName || (id === ROOT_NODE ? "Root" : null),
    };
  });

  if (multi) {
    return <div className="p-3 text-sm text-gray-600">Selecciona solo 1 elemento para personalizar.</div>;
  }
  if (!selectedId) {
    return <div className="p-3 text-sm text-gray-600">Selecciona un elemento del lienzo.</div>;
  }
  if (!ToolbarComp) {
    return <div className="p-3 text-sm text-gray-600">“{name ?? "Elemento"}” no tiene panel de edición.</div>;
  }

  return (
    <div className="p-3">
      <h3 className="mb-2 font-medium text-gray-800">{name}</h3>
      {React.createElement(ToolbarComp)}
    </div>
  );
};
