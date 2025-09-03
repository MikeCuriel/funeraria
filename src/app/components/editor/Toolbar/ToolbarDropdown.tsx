// ToolbarDropdown.tsx
"use client";
import * as React from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

type ToolbarDropdownProps = {
  title?: string;
  value: string;
  onChange: (value: string) => void;
  native?: boolean;            // true => <option>, false => <MenuItem>
  children?: React.ReactNode;
};

type OptionProps = {
  value: string | number;
  children: React.ReactNode;
};

// Contexto para saber si Select es nativo
const NativeCtx = React.createContext<boolean>(true);

const ToolbarDropdownBase: React.FC<ToolbarDropdownProps> = ({
  title,
  value,
  onChange,
  native = true,
  children,
}) => {
  const labelId = React.useId();

  return (
    <FormControl fullWidth>
      {title && <InputLabel id={labelId}>{title}</InputLabel>}
      <NativeCtx.Provider value={!!native}>
        <Select
          labelId={title ? labelId : undefined}
          native={native}
          value={value}
          onChange={(e) => onChange((e.target as HTMLInputElement).value)}
          label={title}
        >
          {children}
        </Select>
      </NativeCtx.Provider>
    </FormControl>
  );
};

// Subcomponente Option que se adapta a native/no-native
const Option: React.FC<OptionProps> = ({ value, children }) => {
  const isNative = React.useContext(NativeCtx);
  return isNative ? (
    <option value={value}>{children}</option>
  ) : (
    <MenuItem value={value}>{children}</MenuItem>
  );
};

// Tipo con propiedad estática
type ToolbarDropdownComponent = React.FC<ToolbarDropdownProps> & {
  Option: React.FC<OptionProps>;
};

// Export final con .Option disponible
export const ToolbarDropdown = Object.assign(ToolbarDropdownBase, {
  Option,
}) as ToolbarDropdownComponent;
