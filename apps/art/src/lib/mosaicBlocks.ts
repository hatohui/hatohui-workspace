export interface MosaicColumn {
  indices: number[];
  width: number;
}

export interface MosaicBlock {
  columns: MosaicColumn[];
  height: number;
}

export interface MosaicLimits {
  minTileWidth: number;
  minTileHeight: number;
  minHeight: number;
  maxHeight: number;
}

interface Layout extends MosaicBlock {
  violation: number;
  shape: string;
}

const shortfall = (value: number, minimum: number) =>
  Math.max(0, minimum - value) / minimum;

function layoutBlock(
  pattern: number[],
  aspects: number[],
  start: number,
  width: number,
  gap: number,
  limits: MosaicLimits,
): Layout {
  let cursor = start;
  const stacks = pattern.map((size) => {
    const indices = Array.from({ length: size }, () => cursor++);
    const inverse = indices.reduce((sum, i) => sum + 1 / aspects[i], 0);
    return { indices, weight: 1 / inverse };
  });

  const weightSum = stacks.reduce((sum, stack) => sum + stack.weight, 0);
  const stackGaps = stacks.reduce(
    (sum, stack) => sum + (stack.indices.length - 1) * gap * stack.weight,
    0,
  );
  const height = (width - (stacks.length - 1) * gap + stackGaps) / weightSum;

  const columns = stacks.map((stack) => ({
    indices: stack.indices,
    width: (height - (stack.indices.length - 1) * gap) * stack.weight,
  }));
  const minWidth = Math.min(...columns.map((column) => column.width));
  const minTileHeight = Math.min(
    ...columns.flatMap((column) =>
      column.indices.map((i) => column.width / aspects[i]),
    ),
  );

  const violation =
    shortfall(minWidth, limits.minTileWidth) +
    shortfall(minTileHeight, limits.minTileHeight) +
    shortfall(height, limits.minHeight) +
    Math.max(0, height - limits.maxHeight) / limits.maxHeight;

  return { columns, height, violation, shape: pattern.join('-') };
}

export function packMosaicBlocks(
  aspects: number[],
  width: number,
  gap: number,
  patterns: number[][],
  limits: MosaicLimits,
): MosaicBlock[] {
  const blocks: MosaicBlock[] = [];
  let index = 0;
  let previousShape = '';

  while (index < aspects.length) {
    const remaining = aspects.length - index;
    const offset = blocks.length % patterns.length;
    const candidates = [...patterns.slice(offset), ...patterns.slice(0, offset)]
      .filter((pattern) => pattern.reduce((a, b) => a + b, 0) <= remaining)
      .map((pattern) =>
        layoutBlock(pattern, aspects, index, width, gap, limits),
      );

    const valid = candidates.filter((layout) => layout.violation === 0);
    const best =
      valid.find((layout) => layout.shape !== previousShape) ??
      valid[0] ??
      candidates.reduce((a, b) => (b.violation < a.violation ? b : a));

    previousShape = best.shape;
    blocks.push({ columns: best.columns, height: best.height });
    index += best.columns.reduce((sum, c) => sum + c.indices.length, 0);
  }

  return blocks;
}
