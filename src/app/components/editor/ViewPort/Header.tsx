"use client";
import { useEditor } from "@craftjs/core";
import { Tooltip } from "@mui/material";
import cx from "classnames";
import React from "react";
import { styled } from "styled-components";
import Image from "next/image";

const HeaderDiv = styled.div`
  width: 100%;
  height: 45px;
  z-index: 99999;
  position: relative;
  padding: 0px 10px;
  background: #d4d4d4;
  display: flex;
`;

const Btn = styled.a`
  display: flex;
  align-items: center;
  padding: 5px 15px;
  border-radius: 3px;
  color: #fff;
  font-size: 13px;
  img {
    margin-right: 6px;
    width: 12px;
    height: 12px;
    opacity: 0.9;
    /* (fill no aplica a <img>) */
  }
`;

const Item = styled.a<{ disabled?: boolean }>`
  margin-right: 10px;
  cursor: pointer;
  img {
    width: 20px;
    height: 20px;
  }
  ${(props) =>
    props.disabled &&
    `
    opacity: 0.5;
    cursor: not-allowed;
  `}
`;

export const Header = () => {
  const { enabled, canUndo, canRedo, actions } = useEditor((state, query) => ({
    enabled: state.options.enabled,
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo(),
  }));

  return (
    <HeaderDiv className="header text-white transition w-full">
      <div className="items-center flex w-full px-4 justify-end">
        {enabled && (
          <div className="flex-1 flex">
            <Tooltip title="Undo" placement="bottom">
              <Item disabled={!canUndo} onClick={() => actions.history.undo()}>
                <Image src="/undo.svg" alt="Undo" width={20} height={20} />
              </Item>
            </Tooltip>
            <Tooltip title="Redo" placement="bottom">
              <Item disabled={!canRedo} onClick={() => actions.history.redo()}>
                <Image src="/redo.svg" alt="Redo" width={20} height={20} />
              </Item>
            </Tooltip>
          </div>
        )}
        <div className="flex">
          <Btn
            className={cx([
              "transition cursor-pointer",
              { "bg-green-400": enabled, "bg-primary": !enabled },
            ])}
            onClick={() => {
              actions.setOptions((options) => (options.enabled = !enabled));
            }}
          >
            {enabled ? (
              <Image src="./check.svg" alt="Finish" width={20} height={20} />
            ) : (
              <Image src="./customize.svg" alt="Edit" width={20} height={20} />
            )}
            {enabled ? "Finish Editing" : "Edit"}
          </Btn>
        </div>
      </div>
    </HeaderDiv>
  );
};
