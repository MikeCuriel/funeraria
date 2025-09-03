"use client";
import * as React from "react";
import { useEditor } from "@craftjs/core";
import cx from "classnames";
import { ROOT_NODE } from '@craftjs/utils';

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Toolbox } from "./Toolbox";

export const Viewport: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const {
    enabled,
    connectors,
    actions: { setOptions },
  } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    window.requestAnimationFrame(() => {
      // Notify doc site
      window.parent.postMessage({ LANDING_PAGE_LOADED: true }, "*");

      setTimeout(() => {
        setOptions((options) => {
          options.enabled = true;
        });
      }, 200);
    });
  }, [setOptions]);

  // ✅ Ref callback con guard de null
  const attachCanvas = React.useCallback(
    (el: HTMLDivElement | null) => {
      if (!el) return; // <- evita pasar null a los connectors
      connectors.select(connectors.hover(el, ROOT_NODE), ROOT_NODE);
    },
    [connectors]
  );

  return (
    <div className="viewport">
      <div className={cx(["flex h-full overflow-hidden flex-row w-full fixed"])}>
        <Toolbox />
        <div className="page-container flex flex-1 h-full flex-col">
          <Header />
          <div
            className={cx([
              "craftjs-renderer flex-1 h-full w-full transition pb-8 overflow-auto",
              { "bg-renderer-gray": enabled },
            ])}
            ref={attachCanvas} // 👈 usa el callback tipado
          >
            <div className="relative flex-col flex items-center pt-8">{children}</div>
          </div>
        </div>
        <Sidebar />
      </div>
    </div>
  );
};
