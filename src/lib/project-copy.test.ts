import { describe, expect, it } from "vitest";
import type { Project } from "../types";
import { copyProjectContent } from "./project-copy";

const project = (overrides: Partial<Project>): Project => ({
  id: "project",
  name: "Project",
  createdAt: 1,
  updatedAt: 2,
  screenshots: [],
  selectedDeviceId: "iphone-15-pro-max",
  selectedColorId: "black-titanium",
  exportSizeId: "iphone-6.7",
  activeScreenshotId: "screen-1",
  headlineFontSize: 72,
  subheadlineFontSize: 42,
  ...overrides,
});

describe("copyProjectContent", () => {
  it("copies content and settings without renaming the destination", () => {
    const source = project({
      id: "source",
      name: "My Project",
      screenshots: [{ id: "screen-1" } as Project["screenshots"][number]],
      headlineFontSize: 96,
    });
    const destination = project({
      id: "destination",
      name: "Just Now 中文版",
      createdAt: 50,
    });

    const result = copyProjectContent(source, destination, 100);

    expect(result).toMatchObject({
      id: "destination",
      name: "Just Now 中文版",
      createdAt: 50,
      updatedAt: 100,
      headlineFontSize: 96,
      screenshots: [{ id: "screen-1" }],
    });
    expect(result.screenshots).not.toBe(source.screenshots);
  });
});
