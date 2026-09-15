import type { Project } from "../types";

/**
 * Copy every editable setting from one project into another while preserving
 * the destination project's identity and name.
 */
export const copyProjectContent = (
  source: Project,
  destination: Project,
  updatedAt: number = Date.now(),
): Project => {
  const copiedSource = structuredClone(source);

  return {
    ...copiedSource,
    id: destination.id,
    name: destination.name,
    createdAt: destination.createdAt,
    updatedAt,
  };
};
