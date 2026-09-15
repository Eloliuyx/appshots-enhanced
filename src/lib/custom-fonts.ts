import type { CustomFont } from "../types";

export const MAX_FONT_BYTES = 20 * 1024 * 1024;
const fontTypes: Record<string, string> = {
  ttf: "font/ttf", otf: "font/otf", woff: "font/woff", woff2: "font/woff2",
};

export const validateFontFile = (name: string, bytes: Uint8Array) => {
  const extension = name.split(".").pop()?.toLowerCase() ?? "";
  if (!fontTypes[extension]) throw new Error("Choose a TTF, OTF, WOFF, or WOFF2 font file.");
  if (bytes.length > MAX_FONT_BYTES) throw new Error("Font files must be 20 MB or smaller.");
  const signature = String.fromCharCode(...bytes.slice(0, 4));
  const expected: Record<string, string> = {
    ttf: "\u0000\u0001\u0000\u0000", otf: "OTTO", woff: "wOFF", woff2: "wOF2",
  };
  if (signature !== expected[extension] && !(extension === "ttf" && signature === "true")) {
    throw new Error("This file is not a valid supported font.");
  }
  return fontTypes[extension];
};

export const normalizeCustomFonts = (value: unknown): CustomFont[] => {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.filter((font): font is CustomFont => {
    if (!font || typeof font !== "object") return false;
    const candidate = font as Partial<CustomFont>;
    if (typeof candidate.family !== "string" ||
        !/^AppShotsFont-[a-f0-9]{64}$/.test(candidate.family) ||
        typeof candidate.name !== "string" || !candidate.name.trim() ||
        typeof candidate.dataUrl !== "string" ||
        candidate.dataUrl.length > Math.ceil(MAX_FONT_BYTES / 3) * 4 + 100 ||
        !/^data:font\/(ttf|otf|woff|woff2);base64,[A-Za-z0-9+/]+={0,2}$/.test(candidate.dataUrl) ||
        seen.has(candidate.family)) return false;
    seen.add(candidate.family);
    return true;
  });
};

const loadedFonts = new Map<string, Promise<FontFace>>();

export const loadCustomFont = (font: CustomFont): Promise<FontFace> => {
  const existing = loadedFonts.get(font.family);
  if (existing) return existing;
  const loading = (async () => {
    const face = new FontFace(font.family, `url("${font.dataUrl}")`);
    await face.load();
    document.fonts.add(face);
    return face;
  })();
  loadedFonts.set(font.family, loading);
  void loading.catch(() => loadedFonts.delete(font.family));
  return loading;
};

export const createCustomFont = async (file: File): Promise<CustomFont> => {
  if (file.size > MAX_FONT_BYTES) throw new Error("Font files must be 20 MB or smaller.");
  const buffer = await file.arrayBuffer();
  const mime = validateFontFile(file.name, new Uint8Array(buffer));
  const hash = await crypto.subtle.digest("SHA-256", buffer);
  const family = `AppShotsFont-${Array.from(new Uint8Array(hash), (byte) =>
    byte.toString(16).padStart(2, "0")).join("")}`;
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read the font file."));
    reader.readAsDataURL(new Blob([buffer], { type: mime }));
  });
  const font = { family, name: file.name, dataUrl };
  // Browser validation must succeed before saving or selecting the font.
  await loadCustomFont(font);
  return font;
};
