import { useEditor } from '@craftjs/core';
import { Layers } from '@craftjs/layers';
import React, { useState } from 'react';
import { styled } from 'styled-components';

import { SidebarItem } from './SidebarItem';
import { Toolbar } from '../../Toolbar';

export const SidebarDiv = styled.div<{ $enabled: boolean }>`
  width: 280px;
  opacity: ${(props) => (props.$enabled ? 1 : 0)};
  background: #fff;
  margin-right: ${(props) => (props.$enabled ? 0 : -280)}px;
`;

/* ⬇️ Tema para Layers: color base y seleccionado */
const LayersTheme = styled.div<{
  $base?: string;
  $selected?: string;
}>`
  /* Texto base para todo el panel de Layers */
  &,
  & * {
    color: ${({ $base }) => $base ?? '#1f2937'}; /* slate-800 */
  }

  /* Íconos heredan el color del texto */
  & svg {
    fill: currentColor;
  }

  /* Estado seleccionado (ajusta el selector según tu versión) */
  & .craftjs-layer-item-selected,
  & .craftjs-layer-item.is-selected,
  & [data-selected='true'] {
    color: ${({ $selected }) => $selected ?? '#2563eb'}; /* blue-600 */
    font-weight: 600;
  }
`;

export const Sidebar = () => {
  const [layersVisible, setLayerVisible] = useState(true);
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  return (
    <SidebarDiv $enabled={enabled} className="sidebar transition bg-white w-2">
      <div className="flex flex-col h-full">
        <SidebarItem
          icon="/customize.svg"
          title="Customize"
          height={!layersVisible ? 'full' : '55%'}
          visible={toolbarVisible}
          onChange={(val) => setToolbarVisible(val)}
          className="overflow-auto"
        >
          <Toolbar />
        </SidebarItem>
        <SidebarItem
          icon="/layers.svg"
          title="Layers"
          height={!toolbarVisible ? 'full' : '45%'}
          visible={layersVisible}
          onChange={(val) => setLayerVisible(val)}
        >
          <div>
            <LayersTheme $base="#000000" $selected="#0ea5e9">
              <Layers expandRootOnLoad={true} />
            </LayersTheme>
          </div>
        </SidebarItem>
      </div>
    </SidebarDiv>
  );
};
