/** @vitest-environment jsdom */

import { describe, expect, it } from "vitest";
import {
  getRichTextAlignment,
  parseRichText,
  renderRichText,
} from "./rich-text-canvas";
import {
  RICH_TEXT_HIGHLIGHT_HEIGHT_EM,
  RICH_TEXT_HIGHLIGHT_RADIUS_EM,
  RICH_TEXT_HIGHLIGHT_SPREAD_EM,
  RICH_TEXT_HIGHLIGHT_TOP_OFFSET_EM,
} from "./rich-text-highlight";

describe("parseRichText", () => {
  it("preserves inline background colors", () => {
    const segments = parseRichText(
      '<span style="color: rgb(255, 0, 0); background-color: rgb(255, 255, 0);">Hello</span>',
      "#ffffff",
    );

    expect(segments).toEqual([
      {
        text: "Hello",
        bold: false,
        italic: false,
        underline: false,
        color: "rgb(255, 0, 0)",
        backgroundColor: "rgb(255, 255, 0)",
      },
    ]);
  });

  it("maps mark elements to a default highlight color", () => {
    const [segment] = parseRichText("<mark>Highlighted</mark>", "#ffffff");

    expect(segment.backgroundColor).toBe("yellow");
  });

  it("preserves the block line breaks produced by contentEditable", () => {
    const segments = parseRichText(
      '<div>桌面</div><div><span style="color: rgb(255, 214, 10)">快捷</span>工具</div>',
      "#ffffff",
    );

    expect(segments.map((segment) => segment.text).join("")).toBe(
      "桌面\n快捷工具",
    );
  });
});

describe("getRichTextAlignment", () => {
  it("uses the contentEditable block alignment instead of forcing center", () => {
    expect(
      getRichTextAlignment('<div style="text-align: left;">✧ Sync</div>'),
    ).toBe("left");
    expect(getRichTextAlignment('<p align="right">Export</p>')).toBe(
      "right",
    );
  });

  it("keeps centered export for unformatted text", () => {
    expect(getRichTextAlignment("Just Now")).toBe("center");
  });
});

describe("renderRichText", () => {
  it("draws one rounded highlight run before highlighted text", () => {
    const calls: Array<{
      type: "roundRect" | "fill" | "fillText";
      fillStyle?: string;
      args?: number[];
    }> = [];
    const ctx = {
      font: "",
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 1,
      textBaseline: "alphabetic",
      measureText: (text: string) => ({ width: text.length * 10 }) as TextMetrics,
      beginPath: () => {},
      roundRect: (...args: number[]) => {
        calls.push({ type: "roundRect", args });
      },
      fill: () => {
        calls.push({ type: "fill", fillStyle: String(ctx.fillStyle) });
      },
      fillText: () => {
        calls.push({ type: "fillText", fillStyle: String(ctx.fillStyle) });
      },
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
    } as unknown as CanvasRenderingContext2D;

    const fontSize = 24;
    const highlightSpread = fontSize * RICH_TEXT_HIGHLIGHT_SPREAD_EM;

    renderRichText(
      ctx,
      [
        {
          text: "Hello world",
          bold: false,
          italic: false,
          underline: false,
          color: "#111111",
          backgroundColor: "#ffff00",
        },
      ],
      {
        x: 100,
        y: 20,
        maxWidth: 200,
        fontSize,
        fontFamily: "Inter",
        defaultColor: "#ffffff",
        lineHeight: 1.1,
        textAlign: "center",
      },
    );

    expect(calls.filter((call) => call.type === "roundRect")).toEqual([
      {
        type: "roundRect",
        args: [
          45 - highlightSpread,
          20 + fontSize * RICH_TEXT_HIGHLIGHT_TOP_OFFSET_EM - highlightSpread,
          110 + highlightSpread * 2,
          fontSize * RICH_TEXT_HIGHLIGHT_HEIGHT_EM + highlightSpread * 2,
          fontSize * RICH_TEXT_HIGHLIGHT_RADIUS_EM,
        ],
      },
    ]);
    expect(calls.filter((call) => call.type === "fill")).toEqual([
      { type: "fill", fillStyle: "#ffff00" },
    ]);
    expect(calls.filter((call) => call.type === "fillText")).toHaveLength(3);
  });

  it("wraps Chinese text even when it contains no spaces", () => {
    const draws: Array<{ text: string; x: number; y: number }> = [];
    const ctx = {
      font: "",
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 1,
      textBaseline: "alphabetic",
      measureText: () => ({ width: 10 }) as TextMetrics,
      beginPath: () => {},
      roundRect: () => {},
      fill: () => {},
      fillText: (text: string, x: number, y: number) => {
        draws.push({ text, x, y });
      },
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
    } as unknown as CanvasRenderingContext2D;

    renderRichText(
      ctx,
      [
        {
          text: "桌面快捷工具",
          bold: false,
          italic: false,
          underline: false,
          color: "#ffffff",
          backgroundColor: null,
        },
      ],
      {
        x: 20,
        y: 0,
        maxWidth: 20,
        fontSize: 10,
        fontFamily: "Inter",
        defaultColor: "#ffffff",
        lineHeight: 1,
        textAlign: "center",
      },
    );

    expect(draws.map(({ text }) => text).join("")).toBe("桌面快捷工具");
    expect([...new Set(draws.map(({ y }) => y))]).toEqual([0, 10, 20]);
  });
});
