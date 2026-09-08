import { describe, expect, it } from "vitest";
import { ensureTextLayers, legacyTextFieldsFromLayers } from "./text-layers";

const legacyScreenshot = {
  headline: "Keep this headline",
  subheadline: "Keep this subheadline",
  headlineX: 42,
  headlineY: 9,
  headlineWidth: 72,
  subheadlineX: 48,
  subheadlineY: 21,
  subheadlineWidth: 66,
};

describe("text layer migration", () => {
  it("migrates legacy text without changing its content or placement", () => {
    const layers = ensureTextLayers(legacyScreenshot);

    expect(layers).toHaveLength(2);
    expect(layers[0]).toMatchObject({
      type: "headline",
      content: "Keep this headline",
      x: 42,
      y: 9,
      width: 72,
    });
    expect(layers[1]).toMatchObject({
      type: "subheadline",
      content: "Keep this subheadline",
      x: 48,
      y: 21,
      width: 66,
    });
  });

  it("preserves explicit multiple and empty layer arrays", () => {
    const multiple = ensureTextLayers({
      ...legacyScreenshot,
      textLayers: [
        { id: "a", type: "headline", content: "One", x: 20, y: 10, width: 50 },
        { id: "b", type: "headline", content: "Two", x: 80, y: 20, width: 40 },
      ],
    });

    expect(multiple.map(({ content }) => content)).toEqual(["One", "Two"]);
    expect(ensureTextLayers({ ...legacyScreenshot, textLayers: [] })).toEqual([]);
  });

  it("mirrors the first layer of each type into legacy fields", () => {
    const fields = legacyTextFieldsFromLayers(legacyScreenshot, [
      { id: "h1", type: "headline", content: "First", x: 30, y: 8, width: 60 },
      { id: "h2", type: "headline", content: "Second", x: 70, y: 15, width: 50 },
      { id: "s1", type: "subheadline", content: "Detail", x: 50, y: 25, width: 70 },
    ]);

    expect(fields).toMatchObject({
      headline: "First",
      headlineX: 30,
      subheadline: "Detail",
      subheadlineY: 25,
    });
  });
});
