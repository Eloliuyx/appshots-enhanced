/**
 * Move a screenshot relative to another screenshot while keeping every item.
 */
export const reorderById = <T extends { id: string }>(
  items: T[],
  sourceId: string,
  targetId: string,
): T[] => {
  const sourceIndex = items.findIndex((item) => item.id === sourceId);
  const targetIndex = items.findIndex((item) => item.id === targetId);

  if (
    sourceIndex === -1 ||
    targetIndex === -1 ||
    sourceIndex === targetIndex
  ) {
    return items;
  }

  const nextItems = [...items];
  const [sourceItem] = nextItems.splice(sourceIndex, 1);
  nextItems.splice(targetIndex, 0, sourceItem);
  return nextItems;
};

/**
 * Move a screenshot one or more positions without leaving the collection bounds.
 */
export const moveByOffset = <T extends { id: string }>(
  items: T[],
  itemId: string,
  offset: number,
): T[] => {
  const sourceIndex = items.findIndex((item) => item.id === itemId);
  if (sourceIndex === -1 || offset === 0) return items;

  const targetIndex = Math.max(
    0,
    Math.min(items.length - 1, sourceIndex + offset),
  );
  if (sourceIndex === targetIndex) return items;

  const nextItems = [...items];
  const [sourceItem] = nextItems.splice(sourceIndex, 1);
  nextItems.splice(targetIndex, 0, sourceItem);
  return nextItems;
};
