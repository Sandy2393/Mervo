// @ts-nocheck
// Simple contrast checks for key token pairs

const hexToRgb = (hex) => {
  const h = hex.replace("#", "");
  const bigint = parseInt(h, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
};

const luminance = (hex) => {
  const { r, g, b } = hexToRgb(hex);
  const f = (v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const L = 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  return L;
};

const contrast = (a, b) => {
  const La = luminance(a) + 0.05;
  const Lb = luminance(b) + 0.05;
  return La > Lb ? La / Lb : Lb / La;
};

describe("color contrast tokens", () => {
  const pairs = [
    ["#0f172a", "#e5e7eb"], // dark bg vs light text
    ["#f8fafc", "#0f172a"], // light bg vs dark text
    ["#ff7a00", "#0f172a"], // primary vs dark text
  ];

  pairs.forEach(([bg, fg]) => {
    test(`contrast for ${bg} / ${fg} >= 4.5`, () => {
      expect(contrast(bg, fg)).toBeGreaterThanOrEqual(4.5);
    });
  });
});
