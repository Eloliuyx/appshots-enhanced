import { describe, expect, it } from "vitest";
import type { Screenshot } from "../types";
import { getExportIndices } from "./export-selection";

const screenshots = ["one", "two", "three"].map((id) => ({ id }) as Screenshot);
describe("export selection", () => {
  it("exports every screenshot by default", () => {
    expect(getExportIndices(screenshots)).toEqual([0, 1, 2]);
  });
  it("selects only the requested screenshot with its original index", () => {
    expect(getExportIndices(screenshots, "two")).toEqual([1]);
    expect(screenshots.map((screen) => screen.id)).toEqual(["one", "two", "three"]);
  });
  it("uses the new order after rearranging", () => {
    expect(getExportIndices([...screenshots].reverse(), "one")).toEqual([2]);
  });
  it("rejects stale screenshot selections", () => {
    expect(() => getExportIndices(screenshots, "deleted")).toThrow(/no longer exists/);
  });
});
