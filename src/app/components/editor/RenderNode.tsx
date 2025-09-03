"use client";
import { useNode, useEditor } from "@craftjs/core";
import { ROOT_NODE } from "@craftjs/utils";
import * as React from "react";
import ReactDOM from "react-dom";
import { styled } from "styled-components";
import Image from "next/image";

type RenderNodeProps = { render: React.ReactNode };

const ICON_MOVE = "/move.svg";
const ICON_ARROW_UP = "/arrow.svg";
const ICON_DELETE = "/delete.svg";

const IndicatorDiv = styled.div`
  position: fixed;
  height: 30px;
  margin-top: -29px;
  font-size: 12px;
  line-height: 12px;

  img {
    width: 15px;
    height: 15px;
    /* fill no aplica a <img> */
  }
`;

const Btn = styled.a`
  padding: 0 0px;
  opacity: 0.9;
  display: flex;
  align-items: center;
  > div {
    position: relative;
    top: -50%;
    left: -50%;
  }
`;

export const RenderNode: React.FC<RenderNodeProps> = ({ render }) => {
  const { id } = useNode();
  const { actions, query, isActive } = useEditor((_, q) => ({
    isActive: q.getEvent("selected").contains(id),
  }));

  const {
    isHover,
    dom,
    name,
    moveable,
    deletable,
    connectors: { drag },
    parent,
  } = useNode((node) => ({
    isHover: node.events.hovered,
    dom: node.dom as HTMLElement | null,
    name: node.data.custom.displayName || node.data.displayName,
    moveable: query.node(node.id).isDraggable(),
    deletable: query.node(node.id).isDeletable(),
    parent: node.data.parent,
  }));

  const indicatorRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!dom) return;
    if (isActive || isHover) dom.classList.add("component-selected");
    else dom.classList.remove("component-selected");
  }, [dom, isActive, isHover]);

  const getPos = React.useCallback((el: HTMLElement | null) => {
    if (!el) return { top: "0px", left: "0px" };
    const { top, left, bottom } = el.getBoundingClientRect();
    return { top: `${top > 0 ? top : bottom}px`, left: `${left}px` };
  }, []);

  const reposition = React.useCallback(() => {
    if (!indicatorRef.current) return;
    const { top, left } = getPos(dom);
    indicatorRef.current.style.top = top;
    indicatorRef.current.style.left = left;
  }, [dom, getPos]);

  React.useEffect(() => {
    const scroller = document.querySelector(".craftjs-renderer");
    if (!scroller) return;
    scroller.addEventListener("scroll", reposition, { passive: true });
    window.addEventListener("resize", reposition, { passive: true });
    reposition();
    return () => {
      scroller.removeEventListener("scroll", reposition);
      window.removeEventListener("resize", reposition);
    };
  }, [reposition]);

  const portalTarget = (typeof document !== "undefined"
    ? document.querySelector(".page-container")
    : null) as Element | null;

  const showIndicator = (isHover || isActive) && portalTarget && dom;

  return (
    <>
      {showIndicator
        ? ReactDOM.createPortal(
            <IndicatorDiv
              ref={indicatorRef}
              className="px-2 py-2 text-white bg-primary flex items-center"
              style={{
                left: getPos(dom).left,
                top: getPos(dom).top,
                zIndex: 9999,
              }}
            >
              <h2 className="flex-1 mr-4">{name}</h2>

              {moveable && (
                <Btn
                  className="mr-2 cursor-move"
                  ref={(el: HTMLAnchorElement | null) => {
                    if (el) drag(el);
                  }}
                >
                  <Image src={ICON_MOVE} alt="Move" width={20} height={20} />
                </Btn>
              )}

              {id !== ROOT_NODE && (
                <Btn
                  className="mr-2 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (parent) actions.selectNode(parent);
                  }}
                >
                  <Image src={ICON_ARROW_UP} alt="Parent" width={20} height={20} />
                </Btn>
              )}

              {deletable && (
                <Btn
                  className="cursor-pointer"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    actions.delete(id);
                  }}
                >
                  <Image src={ICON_DELETE} alt="Delete" width={20} height={20} />
                </Btn>
              )}
            </IndicatorDiv>,
            portalTarget
          )
        : null}

      {render}
    </>
  );
};
