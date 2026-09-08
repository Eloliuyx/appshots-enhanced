import { describe, expect, it } from "vitest";
import { moveByOffset, reorderById } from "./screenshot-order";

const screenshots = [
  { id: "one" },
  { id: "two" },
  { id: "three" },
  { id: "four" },
];

describe("screenshot ordering", () => {
  it("moves a dragged screenshot to the target position", () => {
    expect(reorderById(screenshots, "one", "three").map(({ id }) => id)).toEqual([
      "two",
      "three",
      "one",
      "four",
    ]);
  });

  it("moves a screenshot by keyboard-friendly offsets", () => {
    expect(moveByOffset(screenshots, "three", -1).map(({ id }) => id)).toEqual([
      "one",
      "three",
      "two",
      "four",
    ]);
  });

  it("does not move screenshots outside the collection", () => {
    expect(moveByOffset(screenshots, "one", -1)).toBe(screenshots);
    expect(moveByOffset(screenshots, "four", 1)).toBe(screenshots);
  });

  it("returns the original collection for unknown ids", () => {
    expect(reorderById(screenshots, "missing", "two")).toBe(screenshots);
  });
});
