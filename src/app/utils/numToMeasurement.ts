export const isPercentage = (val: string) =>
  typeof val === 'string' && val.indexOf('%') > -1;

export const percentToPx = (
  value: string | number,
  comparativeValue: number
): string | number => {
  if (typeof value === "string") {
    if (value.includes("px") || value === "auto" || !comparativeValue) {
      return value;
    }
    const percent = parseInt(value, 10); // ✅ ahora TS sabe que es string
    return ((percent / 100) * comparativeValue).toString() + "px";
  }
  return value;
};

export const pxToPercent = (value: string | number, comparativeValue: number) : number => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  const val = (Math.abs(numValue) / comparativeValue) * 100;
  return numValue < 0 ? -1 * val : Math.round(val);
};
export const getElementDimensions = (element: HTMLElement) => {
  const computedStyle = getComputedStyle(element);

  let height = element.clientHeight,
    width = element.clientWidth; // width with padding

  height -=
    parseFloat(computedStyle.paddingTop) +
    parseFloat(computedStyle.paddingBottom);
  width -=
    parseFloat(computedStyle.paddingLeft) +
    parseFloat(computedStyle.paddingRight);

  return {
    width,
    height,
  };
};
