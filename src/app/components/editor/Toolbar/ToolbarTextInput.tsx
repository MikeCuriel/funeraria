import { TextField, InputAdornment, Popover } from '@mui/material';
import * as React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { ChromePicker } from 'react-color';
import type { Color, ColorResult, RGBColor } from 'react-color';

type RGBA = { r: number; g: number; b: number; a?: number };
type Kind = 'text' | 'number' | 'password' | 'email' | 'url' | 'color' | 'bg';

type ValueFor<K extends Kind> =
  K extends "text"   ? string :
  K extends "number" ? number :
  K extends "color"  ? RGBA   :
  K extends "bg"     ? RGBA   :
  never;

export type ToolbarTextInputProps = {
  type: Kind;
  label?: string;
  prefix?: React.ReactNode;
  value?: string | number | RGBA;
  onChange?: (value: ValueFor<Kind>) => void;
};

const toRgbaString = (v?: string | number | RGBA) => {
  if (v == null) return '';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'string') return v;
  const { r, g, b, a = 1 } = v;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const parseRgbaToRGBColor = (str: string): RGBColor | undefined => {
  const m = str.match(
    /rgba?\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(\d*\.?\d+))?\s*\)/i
  );
  if (!m) return undefined;
  const [, rs, gs, bs, as] = m;
  const r = Math.min(255, Number(rs));
  const g = Math.min(255, Number(gs));
  const b = Math.min(255, Number(bs));
  const a = as == null ? 1 : Math.max(0, Math.min(1, Number(as)));
  return { r, g, b, a };
};

export const ToolbarTextInput: React.FC<ToolbarTextInputProps> = ({
  onChange,
  value,
  prefix,
  label,
  type,
  ...props
}) => {
  const isColor = type === 'color' || type === 'bg';
  const [active, setActive] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const displayValue = useMemo(() => toRgbaString(value), [value]);
  const [internalValue, setInternalValue] = useState<string>(displayValue);
  // Solo sincroniza el valor interno, nunca dispara el callback aquí
  useEffect(() => {
    setInternalValue(displayValue);
    // Nunca llamar onChange aquí
  }, [displayValue]);

  const openPicker = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!isColor) return;
    setActive(true);
    setAnchorEl(e.currentTarget);
  }, [isColor]);

  const closePicker = useCallback(() => {
    setActive(false);
    setAnchorEl(null);
  }, []);

  // 🟢 Normalizamos a un Color válido para ChromePicker
  const pickerColor: Color = useMemo(() => {
    if (typeof value === 'string') {
      // si es "rgba(...)" lo convertimos a objeto; si es "#hex", lo dejamos
      return parseRgbaToRGBColor(value) ?? value;
    }
    if (value && typeof value === 'object') {
      const { r, g, b, a } = value as RGBA;
      return { r, g, b, a };
    }
    // si es number o undefined, pone un color por defecto
    return '#000000';
  }, [value]);

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <TextField
        label={label}
        onClick={openPicker}
        style={{ margin: 0, width: '100%' }}
        value={internalValue}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            if (isColor) {
              const parsed = parseRgbaToRGBColor(internalValue);
              if (parsed) onChange?.(parsed);
            } else {
              onChange?.((e.target as HTMLInputElement).value);
            }
          }
        }}
        onBlur={() => {
          if (!isColor) onChange?.(internalValue);
        }}
        onChange={(e) => setInternalValue(e.target.value)}
        margin="dense"
        variant="standard"
        sx={{
          padding: 0,
          width: '100%',
          background: 'transparent',
          borderRadius: '100px',
          border: 'none',
          margin: 0,
          marginTop: 1,
          position: 'relative',
          '.MuiInputBase-input': {
            background: '#e5e5e5',
            borderRadius: '100px',
            fontSize: '0.9rem',
            position: 'relative',
            paddingLeft: isColor ? '28px' : undefined,
          },
        }}
        InputProps={{
          disableUnderline: true,
          startAdornment: isColor ? (
            <InputAdornment position="start" sx={{ position: 'absolute', mt: '2px', mr: '8px' }}>
              <div
                className="w-2 h-2 inline-block rounded-full relative z-10"
                style={{
                  left: '15px',
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: displayValue || 'transparent',
                  boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
                }}
              />
            </InputAdornment>
          ) : prefix ? (
            <InputAdornment position="start">{prefix}</InputAdornment>
          ) : undefined,
        }}
        InputLabelProps={{ shrink: true }}
        {...props}
      />

      {isColor && (
        <Popover
          open={active}
          anchorEl={anchorEl}
          onClose={closePicker}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          PaperProps={{ sx: { mt: 1, boxShadow: 3 } }}
        >
          <ChromePicker
            color={pickerColor} // ✅ siempre Color válido
            onChange={(c: ColorResult) => onChange?.(c.rgb)} // devolvemos RGBA
          />
        </Popover>
      )}
    </div>
  );
};
