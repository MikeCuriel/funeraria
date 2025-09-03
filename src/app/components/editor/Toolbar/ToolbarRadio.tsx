import * as React from 'react';
import Radio, { RadioProps } from '@mui/material/Radio';
import FormControlLabel, { FormControlLabelProps } from '@mui/material/FormControlLabel';

function StyledRadio(props: RadioProps) {
  return (
    <Radio
      disableRipple
      color="default"
      size="small"
      sx={{
        '&.Mui-checked': { color: 'rgb(19, 115, 230)' },
      }}
      {...props}
    />
  );
}

type ToolbarRadioProps = Omit<FormControlLabelProps, 'control'> & {
  radioProps?: RadioProps;
};

export const ToolbarRadio: React.FC<ToolbarRadioProps> = ({
  value,
  label,
  radioProps,
  ...rest
}) => (
  <FormControlLabel
    value={value}
    control={<StyledRadio {...radioProps} />}
    label={label}
    {...rest}
  />
);
