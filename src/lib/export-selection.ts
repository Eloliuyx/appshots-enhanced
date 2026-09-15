import type { Screenshot } from "../types";

/** Keep original indices and the full deck for neighboring device crops. */
export const getExportIndices = (screenshots: Screenshot[], screenshotId?: string) => {
  if (screenshotId === undefined) return screenshots.map((_, index) => index);
  const index = screenshots.findIndex((screenshot) => screenshot.id === screenshotId);
  if (index < 0) throw new Error("The selected screenshot no longer exists.");
  return [index];
};
