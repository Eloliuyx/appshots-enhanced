import { afterEach, describe, expect, it, vi } from "vitest";
import { loadCustomFont, MAX_FONT_BYTES, normalizeCustomFonts, validateFontFile } from "./custom-fonts";

const font = { family: `AppShotsFont-${"a".repeat(64)}`, name: "My Font.ttf", dataUrl: "data:font/ttf;base64,AAEAAA==" };
afterEach(() => vi.unstubAllGlobals());

describe("custom font files", () => {
  it.each([
    ["test.TTF", [0, 1, 0, 0], "font/ttf"],
    ["test.otf", [79, 84, 84, 79], "font/otf"],
    ["test.woff", [119, 79, 70, 70], "font/woff"],
    ["test.woff2", [119, 79, 70, 50], "font/woff2"],
  ])("accepts supported signatures: %s", (name, bytes, mime) => {
    expect(validateFontFile(name, new Uint8Array(bytes))).toBe(mime);
  });
  it("rejects renamed images, unsupported files, empty files and oversized fonts", () => {
    expect(() => validateFontFile("image.ttf", new Uint8Array([137, 80, 78, 71]))).toThrow(/not a valid/);
    expect(() => validateFontFile("font.exe", new Uint8Array([0, 1, 0, 0]))).toThrow(/Choose/);
    expect(() => validateFontFile("font.ttf", new Uint8Array())).toThrow(/not a valid/);
    expect(() => validateFontFile("font.ttf", new Uint8Array(MAX_FONT_BYTES + 1))).toThrow(/20 MB/);
  });
  it("keeps portable font data through JSON backup and removes duplicates", () => {
    const backup = JSON.parse(JSON.stringify([font, font]));
    expect(normalizeCustomFonts(backup)).toEqual([font]);
    expect(normalizeCustomFonts(undefined)).toEqual([]);
  });
  it("rejects unsafe font families and remote URLs in backups", () => {
    expect(normalizeCustomFonts([
      { ...font, family: 'Bad\"font' },
      { ...font, dataUrl: "https://example.com/font.ttf" },
      null,
    ])).toEqual([]);
  });
  it("loads a font once before adding it to the document", async () => {
    const load = vi.fn().mockResolvedValue(undefined);
    const add = vi.fn();
    vi.stubGlobal("FontFace", class { load = load; });
    vi.stubGlobal("document", { fonts: { add } });
    await Promise.all([loadCustomFont(font), loadCustomFont(font)]);
    expect(load).toHaveBeenCalledTimes(1);
    expect(add).toHaveBeenCalledTimes(1);
  });
});
