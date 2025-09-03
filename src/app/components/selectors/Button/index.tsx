"use client";
import React from "react";
import { UserComponent, useNode } from "@craftjs/core";
import { styled } from "styled-components";
import cx from "classnames";

import { ButtonSettings } from "./ButtonSettings";
import { Text } from "../Text";

type RGBA = { r: number; g: number; b: number; a: number };
type FourSides = [number | string, number | string, number | string, number | string];

// 👉 Derivamos el tipo de props del componente Text
type TextProps = React.ComponentProps<typeof Text>;

type ButtonProps = {
  background?: RGBA;
  color?: RGBA;
  buttonStyle?: "full" | "outline" | "link";
  margin?: FourSides;
  text?: string;
  // 👇 En lugar de `any`, usa las props reales del Text
  textComponent?: Partial<TextProps>;
};

const toRgba = (c?: RGBA) =>
  c ? `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})` : "transparent";

const toBox = (m?: FourSides) =>
  m
    ? m
        .map((v) => {
          if (typeof v === "number") return `${v}px`;
          const n = Number.parseFloat(v);
          return Number.isFinite(n) ? `${n}px` : "0px";
        })
        .join(" ")
    : "0px 0px 0px 0px";

// Transient props ($) para styled-components
type StyledButtonProps = {
  $background?: RGBA;
  $buttonStyle?: "full" | "outline" | "link";
  $margin?: FourSides;
};

const StyledButton = styled.button<StyledButtonProps>`
  background: ${({ $buttonStyle, $background }) =>
    $buttonStyle === "full" ? toRgba($background) : "transparent"};
  border: 2px solid
    ${({ $buttonStyle, $background }) =>
      $buttonStyle === "outline" ? toRgba($background) : "transparent"};
  margin: ${({ $margin }) => toBox($margin)};
  cursor: pointer;
`;

const defaultProps: Required<Omit<ButtonProps, "textComponent">> & {
  textComponent?: Partial<TextProps>;
} = {
  background: { r: 255, g: 255, b: 255, a: 0.5 },
  color: { r: 92, g: 90, b: 90, a: 1 },
  buttonStyle: "full",
  text: "Button",
  margin: [5, 0, 5, 0],
  textComponent: undefined,
};

export const Button: UserComponent<ButtonProps> = (props) => {
  const merged = { ...defaultProps, ...props };

  const {
    connectors: { connect },
  } = useNode();

  const setRef = React.useCallback(
    (el: HTMLButtonElement | null) => {
      if (el) connect(el);
    },
    [connect]
  );

  return (
    <StyledButton
      ref={setRef}
      className={cx([
        "rounded w-full px-4 py-2",
        { "shadow-lg": merged.buttonStyle === "full" },
      ])}
      $buttonStyle={merged.buttonStyle}
      $background={merged.background}
      $margin={merged.margin}
    >
      <Text
        {...(merged.textComponent as Partial<TextProps>)} // ✅ sin any
        text={merged.text}
        color={merged.color}
        textAlign="center"
      />
    </StyledButton>
  );
};

// 👇 Tipamos el acceso a `craft.props` sin `any`
type WithCraft<T> = T & { craft?: { props?: Partial<TextProps> } };
const TextWithCraft = Text as unknown as WithCraft<typeof Text>;

Button.craft = {
  displayName: "Button",
  props: {
    ...defaultProps,
    textComponent: {
      ...(TextWithCraft.craft?.props ?? {}),
      textAlign: "center",
    } as Partial<TextProps>,
  },
  related: { toolbar: ButtonSettings },
};
