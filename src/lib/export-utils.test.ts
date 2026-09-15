/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Screenshot } from "../types";
import { exportScreenshots } from "./export-utils";
import { getRenderableDevicesForScreenshot } from "./device-overflow";

vi.mock("./device-overflow", () => ({ getRenderableDevicesForScreenshot: vi.fn(() => []) }));
afterEach(() => vi.restoreAllMocks());

describe("single screenshot PNG export", () => {
  it("downloads only the current PNG with correct size and full-deck neighbor context", async () => {
    Object.defineProperty(document, "fonts", { configurable: true, value: { ready: Promise.resolve() } });
    const fillRect = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ fillRect } as unknown as CanvasRenderingContext2D);
    let renderedSize: number[] = [];
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockImplementation(function (this: HTMLCanvasElement) {
      renderedSize = [this.width, this.height];
      return "data:image/png;base64,AA==";
    });
    const downloads: string[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      downloads.push(this.download);
    });
    const screenshots = ["first", "second", "third"].map((id) => ({
      id, backgroundMode: "solid", backgroundColor: "#ffffff", overlayImages: [], textLayers: [], devices: [],
    }) as unknown as Screenshot);
    await exportScreenshots({
      screenshots, screenshotId: "second", exportSize: { id: "iphone", label: "iPhone", width: 1320, height: 2868 },
      previewDimensions: { width: 440, height: 956 }, headlineFontSize: 72, subheadlineFontSize: 42,
    });
    expect(downloads).toEqual(["appstore-screenshot-2.png"]);
    expect(renderedSize).toEqual([1320, 2868]);
    expect(fillRect).toHaveBeenCalledTimes(1);
    expect(getRenderableDevicesForScreenshot).toHaveBeenCalledWith(screenshots, 1);
  });
});
