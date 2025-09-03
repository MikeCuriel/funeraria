import { Element, useEditor } from '@craftjs/core';
import { Tooltip } from '@mui/material';
import React from 'react';
import { styled } from 'styled-components';
import Image from "next/image";

import { Button } from '../../selectors/Button';
import { Container } from '../../selectors/Container';
import { Text } from '../../selectors/Text';

const ICON_RECT = "/rectangle.svg";
const ICON_TEXT = "/text.svg";
const ICON_BUTTON = "/button.svg";

const ToolboxDiv = styled.div<{ $enabled: boolean }>`
  transition: 0.4s cubic-bezier(0.19, 1, 0.22, 1);
  ${(props) => (!props.$enabled ? `width: 0;` : '')}
  ${(props) => (!props.$enabled ? `opacity: 0;` : '')}
`;

const Item = styled.a<{ $move?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  img {
    width: 28px;
    height: 28px;
    /* fill no aplica a <img> */
    object-fit: contain;
  }

  ${(props) => props.$move && `cursor: move;`}
`;

export const Toolbox = () => {
  const { enabled, connectors: { create } } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  return (
    <ToolboxDiv $enabled={!!enabled} className="toolbox transition w-12 h-full flex flex-col bg-white">
      <div className="flex flex-1 flex-col items-center pt-3 gap-3">
        <div
          ref={(ref: HTMLDivElement | null) => {
            if (!ref) return;
            create(
              ref,
              <Element
                canvas
                is={Container}
                background={{ r: 78, g: 78, b: 78, a: 1 }}
                color={{ r: 0, g: 0, b: 0, a: 1 }}
                height="300px"
                width="300px"
              />
            );
          }}
        >
          <Tooltip title="Container" placement="right">
            <Item $move>
              <Image src={ICON_RECT} alt="Container" height={20} width={20} />
            </Item>
          </Tooltip>
        </div>

        <div
          ref={(ref: HTMLDivElement | null) => {
            if (!ref) return;
            create(ref, <Text fontSize={"12"} textAlign="left" text="Hi there" />);
          }}
        >
          <Tooltip title="Text" placement="right">
            <Item $move>
              <Image src={ICON_TEXT} alt="Text" height={20} width={20}  />
            </Item>
          </Tooltip>
        </div>

        <div
          ref={(ref: HTMLDivElement | null) => {
            if (!ref) return;
            create(ref, <Button />);
          }}
        >
          <Tooltip title="Button" placement="right">
            <Item $move>
              <Image src={ICON_BUTTON} alt="Button" height={20} width={20}  />
            </Item>
          </Tooltip>
        </div>
      </div>
    </ToolboxDiv>
  );
};
