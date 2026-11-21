export interface MosaicTile {
  aspect: number;
  columns: number;
}

export interface MosaicPlacement {
  index: number;
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface MosaicLayout {
  placements: MosaicPlacement[];
  height: number;
}

interface Column {
  bottom: number;
  last?: MosaicPlacement;
}

function shortest(columns: Column[]) {
  return columns.reduce(
    (best, column, index) =>
      column.bottom < columns[best].bottom ? index : best,
    0,
  );
}

function flattestPair(columns: Column[]) {
  let best = 0;
  for (let index = 1; index < columns.length - 1; index++) {
    const top = Math.max(columns[index].bottom, columns[index + 1].bottom);
    const bestTop = Math.max(columns[best].bottom, columns[best + 1].bottom);
    if (top < bestTop) best = index;
  }
  return best;
}

export function packMasonry(
  tiles: MosaicTile[],
  width: number,
  columnCount: number,
  gap: number,
  levelTolerance: number,
): MosaicLayout {
  const columnWidth = (width - gap * (columnCount - 1)) / columnCount;
  const columns: Column[] = Array.from({ length: columnCount }, () => ({
    bottom: 0,
  }));
  const placements: MosaicPlacement[] = [];
  const tolerance = columnWidth * levelTolerance;

  const place = (
    index: number,
    start: number,
    span: number,
    aspect: number,
  ) => {
    const covered = columns.slice(start, start + span);
    const top = Math.max(...covered.map((column) => column.bottom));
    const tileWidth = columnWidth * span + gap * (span - 1);
    const placement = {
      index,
      left: start * (columnWidth + gap),
      top,
      width: tileWidth,
      height: tileWidth / aspect,
    };
    for (const column of covered) {
      if (
        column.last &&
        column.last.width === columnWidth &&
        column.bottom < top
      ) {
        column.last.height += top - column.bottom;
      }
      column.bottom = top + placement.height + gap;
      column.last = placement;
    }
    placements.push(placement);
  };

  tiles.forEach(({ aspect, columns: wanted }, index) => {
    if (wanted > 1 && columnCount > 1) {
      const start = flattestPair(columns);
      const step = Math.abs(columns[start].bottom - columns[start + 1].bottom);
      if (step <= tolerance) {
        place(index, start, 2, aspect);
        return;
      }
    }
    place(index, shortest(columns), 1, aspect);
  });

  const height = Math.max(0, ...columns.map((column) => column.bottom - gap));
  return { placements, height };
}
