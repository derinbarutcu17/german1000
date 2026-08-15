export type RandomSource = () => number;

const RANDOM_RANGE = 0x1_0000_0000;

export function cryptoRandom(): number {
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    const values = new Uint32Array(1);
    globalThis.crypto.getRandomValues(values);
    return values[0] / RANDOM_RANGE;
  }

  return Math.random();
}

export function shuffle<T>(items: readonly T[], random: RandomSource = cryptoRandom): T[] {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const value = Math.max(0, Math.min(0.9999999999, random()));
    const swapIndex = Math.floor(value * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}
