export function mergeWithRemainder(input: {
  currentOrder: string[];
  reorderedVisibleKeys: string[];
}): string[] {
  const reorderedSet = new Set(input.reorderedVisibleKeys);
  const remainder = input.currentOrder.filter((key) => !reorderedSet.has(key));
  return [...input.reorderedVisibleKeys, ...remainder];
}

/**
 * For a list whose visible rows are not its first ones — a project keeps the selected workspace on
 * screen from past its limit. The reordered rows go back into the slots the visible rows held, so
 * the rows you could not see keep their place.
 */
export function mergeIntoVisibleSlots(input: {
  currentOrder: string[];
  reorderedVisibleKeys: string[];
}): string[] {
  const reorderedSet = new Set(input.reorderedVisibleKeys);
  const unplaced = input.reorderedVisibleKeys.filter((key) => !input.currentOrder.includes(key));
  const placed = input.reorderedVisibleKeys.filter((key) => input.currentOrder.includes(key));
  let next = 0;
  const merged = input.currentOrder.map((key) => {
    if (!reorderedSet.has(key)) return key;
    const slotKey = placed[next];
    next += 1;
    return slotKey;
  });
  return [...unplaced, ...merged];
}

export function hasVisibleOrderChanged(input: {
  currentOrder: string[];
  reorderedVisibleKeys: string[];
}): boolean {
  const visibleSet = new Set(input.reorderedVisibleKeys);
  const currentVisible = input.currentOrder.filter((key) => visibleSet.has(key));
  if (currentVisible.length !== input.reorderedVisibleKeys.length) {
    return true;
  }
  return input.reorderedVisibleKeys.some((key, index) => currentVisible[index] !== key);
}
