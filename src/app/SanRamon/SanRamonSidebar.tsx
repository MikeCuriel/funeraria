import { Toolbar } from "../components/editor/Toolbar";
import { Layers } from "@craftjs/layers";
import { styled } from "styled-components";
import { Box, TextField } from "@mui/material";

const LayersTheme = styled.div<{ $base?: string; $selected?: string }>`
  &, & * { color: ${({ $base }) => $base ?? "#ff0000"}; }
  & svg { fill: currentColor; }
  & .craftjs-layer-item-selected,
  & .craftjs-layer-item.is-selected,
  & [data-selected="true"] {
    color: ${({ $selected }) => $selected ?? "#f00"};
    font-weight: 600;
  }
`;

interface Props {
  next: () => void;
  prev: () => void;
  setCelular: (v: string) => void;
  handleGuardar: () => void;
}

export function SanRamonSidebar({ next, prev, setCelular, handleGuardar }: Props) {
  return (
    <aside className="bg-gray-200" style={{ borderLeft: "1px solid #eee", padding: 8, overflow: "auto" }}>
      <h4 className="text-black font-bold">Herramientas</h4>
      <Toolbar />
      <hr className="mx-12" />
      <h4 className="text-black font-bold">Capas</h4>
      <LayersTheme $base="#000" $selected="#ff0000">
        <Layers expandRootOnLoad />
      </LayersTheme>
      <h4 className="text-black font-bold mt-5">Diseños</h4>
      <div className="flex gap-2 mb-4">
        <button type="button" onClick={next} className="px-3 py-1 rounded bg-white/80 text-black">SIGUIENTE</button>
        <button type="button" onClick={prev} className="px-3 py-1 rounded bg-white/80 text-black">ANTERIOR</button>
      </div>
      <div>
        <Box sx={{ width: 500, maxWidth: "80%" }}>
          <TextField
            fullWidth
            label="Celular"
            id="Celular"
            type="tel"
            onChange={(e) => setCelular(e.target.value)}
            inputProps={{ pattern: "[0-9]*" }}
          />
        </Box>
        <button type="button" onClick={handleGuardar} className="px-3 py-1 rounded bg-white/80 text-black mt-2">GUARDAR</button>
      </div>
    </aside>
  );
}