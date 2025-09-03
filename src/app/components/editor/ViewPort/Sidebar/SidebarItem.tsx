import classNames from "classnames";
import React from "react";
import { styled } from "styled-components";
import type { StaticImageData } from "next/image";
import Image from "next/image";

const ICON_ARROW = "/arrow.svg";

const SidebarItemDiv = styled.div<{ $visible?: boolean; $height?: string }>`
  /* ...tus estilos... */
`;
const Chevron = styled.a<{ $visible: boolean }>`
  transform: rotate(${(p) => (p.$visible ? 180 : 0)}deg);
  img { width: 10px; height: 10px; }
`;
const HeaderDiv = styled.div`
  /* ...tus estilos... */
`;

type IconLike =
  | React.ReactNode
  | string
  | StaticImageData
  | React.ComponentType<{ className?: string }>;

export type SidebarItemProps = {
  title: string;
  height?: string;
  icon: IconLike;
  visible?: boolean;
  onChange?: (bool: boolean) => void;
  children?: React.ReactNode;
  className?: string;
};

// Type guards para no usar `any`
const isStaticImageData = (x: unknown): x is StaticImageData =>
  typeof x === "object" && x !== null && "src" in x;

const isElementType = (x: unknown): x is React.ElementType =>
  typeof x === "function";

export const SidebarItem: React.FC<SidebarItemProps> = ({
  visible = false,
  icon,
  title,
  children,
  height,
  onChange,
  className,
}) => {
  const renderIcon = () => {
    // Si ya te pasan un nodo listo (<svg/>, <Icon/> instanciado, etc.)
    if (React.isValidElement(icon)) return icon;

    // Si es string (ruta desde /public)
    if (typeof icon === "string") {
      return (
        <Image
          src={icon}
          alt=""
          width={20}
          height={20}
          className="w-4 h-4 mr-2"
          aria-hidden
        />
      );
    }

    // Si es un import estático (Next) con .src
    if (isStaticImageData(icon)) {
      return (
        <Image
          src={icon}
          alt=""
          width={20}
          height={20}
          className="w-4 h-4 mr-2"
          aria-hidden
        />
      );
    }

    // Si es un componente (SVGR o icono de React)
    if (isElementType(icon)) {
      const Icon = icon;
      return <Icon className="w-4 h-4 mr-2" />;
    }

    return null;
  };

  return (
    <SidebarItemDiv
      $visible={visible}
      $height={height}
      className={classNames("flex flex-col", className)}
    >
      <HeaderDiv
        onClick={() => onChange?.(!visible)}
        className={`cursor-pointer bg-white border-b last:border-b-0 flex items-center px-2 ${
          visible ? "shadow-sm" : ""
        }`}
      >
        <div className="flex-1 flex items-center">
          {renderIcon()}
          <h2 className="text-xs uppercase">{title}</h2>
        </div>
        <Chevron $visible={!!visible}>
          <Image src={ICON_ARROW} alt="Expand" width={10} height={10} />
        </Chevron>
      </HeaderDiv>

      {visible ? <div className="w-full flex-1 overflow-auto">{children}</div> : null}
    </SidebarItemDiv>
  );
};
