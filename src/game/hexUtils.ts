export function pixelToHex(x: number, y: number, hexSize: number): { q: number, r: number } {
  const q = ((Math.sqrt(3) / 3 * x) - (1 / 3 * y)) / hexSize;
  const r = (2 / 3 * y) / hexSize;
  return hexRound({ q, r });
}

export function hexRound(hex: { q: number, r: number }) {
  let q = Math.round(hex.q);
  let r = Math.round(hex.r);
  let s = Math.round(-hex.q - hex.r);

  const q_diff = Math.abs(q - hex.q);
  const r_diff = Math.abs(r - hex.r);
  const s_diff = Math.abs(s - (-hex.q - hex.r));

  if (q_diff > r_diff && q_diff > s_diff)       q = -r - s;
  else if (r_diff > s_diff)                     r = -q - s;
  return { q, r };
}
