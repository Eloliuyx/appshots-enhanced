import type { Screenshot, TextLayer, TextLayerType } from "../types";

type LegacyTextFields = Pick<
  Screenshot,
  | "headline"
  | "subheadline"
  | "headlineX"
  | "headlineY"
  | "headlineWidth"
  | "subheadlineX"
  | "subheadlineY"
  | "subheadlineWidth"
> & {
  textLayers?: unknown;
};

const createId = () => Math.random().toString(36).substring(2, 9);

const isTextLayer = (value: unknown): value is Partial<TextLayer> =>
  typeof value === "object" && value !== null;

export const createTextLayer = (
  type: TextLayerType,
  overrides: Partial<TextLayer> = {},
): TextLayer => ({
  id: overrides.id ?? createId(),
  type,
  content:
    overrides.content ?? (type === "headline" ? "New Headline" : "New Subheadline"),
  x: overrides.x ?? 50,
  y: overrides.y ?? (type === "headline" ? 10 : 18),
  width: overrides.width ?? 80,
});

/**
 * Preserve explicit text layer arrays, while migrating pre-layer screenshots
 * into one headline layer and one subheadline layer without changing content
 * or placement.
 */
export const ensureTextLayers = (screenshot: LegacyTextFields): TextLayer[] => {
  if (Array.isArray(screenshot.textLayers)) {
    return screenshot.textLayers
      .filter(isTextLayer)
      .filter(
        (layer) => layer.type === "headline" || layer.type === "subheadline",
      )
      .map((layer) =>
        createTextLayer(layer.type as TextLayerType, {
          id: typeof layer.id === "string" ? layer.id : undefined,
          content: typeof layer.content === "string" ? layer.content : "",
          x: typeof layer.x === "number" ? layer.x : undefined,
          y: typeof layer.y === "number" ? layer.y : undefined,
          width: typeof layer.width === "number" ? layer.width : undefined,
        }),
      );
  }

  return [
    createTextLayer("headline", {
      content: screenshot.headline,
      x: screenshot.headlineX,
      y: screenshot.headlineY,
      width: screenshot.headlineWidth,
    }),
    createTextLayer("subheadline", {
      content: screenshot.subheadline,
      x: screenshot.subheadlineX,
      y: screenshot.subheadlineY,
      width: screenshot.subheadlineWidth,
    }),
  ];
};

/**
 * Keep the old single-text fields in sync so saved projects remain readable by
 * older builds. The full layer array remains the source of truth.
 */
export const legacyTextFieldsFromLayers = (
  screenshot: LegacyTextFields,
  textLayers: TextLayer[],
): Pick<
  Screenshot,
  | "headline"
  | "subheadline"
  | "headlineX"
  | "headlineY"
  | "headlineWidth"
  | "subheadlineX"
  | "subheadlineY"
  | "subheadlineWidth"
> => {
  const headline = textLayers.find((layer) => layer.type === "headline");
  const subheadline = textLayers.find((layer) => layer.type === "subheadline");

  return {
    headline: headline?.content ?? "",
    headlineX: headline?.x ?? screenshot.headlineX,
    headlineY: headline?.y ?? screenshot.headlineY,
    headlineWidth: headline?.width ?? screenshot.headlineWidth,
    subheadline: subheadline?.content ?? "",
    subheadlineX: subheadline?.x ?? screenshot.subheadlineX,
    subheadlineY: subheadline?.y ?? screenshot.subheadlineY,
    subheadlineWidth: subheadline?.width ?? screenshot.subheadlineWidth,
  };
};

export const withTextLayers = (
  screenshot: Screenshot,
  textLayers: TextLayer[],
): Screenshot => ({
  ...screenshot,
  ...legacyTextFieldsFromLayers(screenshot, textLayers),
  textLayers,
});
