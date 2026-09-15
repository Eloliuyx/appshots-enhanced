/** @vitest-environment jsdom */
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Screenshot } from "../../types";
import { ScreenshotCard } from "./ScreenshotCard";
import { getContainedImagePercent } from "./utils";

beforeEach(() => vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const screenshot = {
  id: "screen", overlayImages: [{ id: "image", src: "data:image/png;base64,AA==", layer: "front", x: 50, y: 50, width: 100, height: 100 }],
  devices: [], textLayers: [{ id: "text", type: "headline", content: "Covered headline", x: 50, y: 10, width: 80 }],
  fontFamily: "Inter", textColor: "#fff",
} as unknown as Screenshot;
const props = () => ({
  screenshot, renderableDevices: [], isActive: false, canRemove: true, selectedElement: null,
  exportSize: { id: "size", label: "Size", width: 1290, height: 2796 }, headlineFontSize: 72, subheadlineFontSize: 42,
  previewRef: { current: null }, getBackgroundStyle: () => "#000", onSelect: vi.fn(), onRemove: vi.fn(), onDeselect: vi.fn(),
  onElementMouseDown: vi.fn(), onElementMouseUp: vi.fn(), position: 2, canMoveLeft: true, canMoveRight: false,
  onMoveLeft: vi.fn(), onMoveRight: vi.fn(), onOrderPointerDown: vi.fn(),
});

describe("canvas selection", () => {
  it("selects an inactive screenshot even when clicking its text or image", () => {
    const handlers = props();
    const { container } = render(<ScreenshotCard {...handlers} />);
    fireEvent.click(container.querySelector("[data-draggable-element='image']")!);
    fireEvent.click(container.querySelector("[data-draggable-element='headline']")!);
    expect(handlers.onSelect).toHaveBeenCalledTimes(2);
    expect(handlers.onElementMouseDown).not.toHaveBeenCalled();
    expect((container.querySelector("[data-screenshot-card]") as HTMLElement).style.isolation).toBe("isolate");
  });
  it("first mouse-down activates an inactive screenshot without moving its objects", () => {
    const handlers = props();
    const { container } = render(<ScreenshotCard {...handlers} />);
    fireEvent.mouseDown(container.querySelector("[data-draggable-element='image']")!);
    expect(handlers.onSelect).toHaveBeenCalledOnce();
    expect(handlers.onElementMouseDown).not.toHaveBeenCalled();
  });
  it("routes drags over a covering image to the selected text in Move Selected mode", () => {
    const handlers = props();
    const { container } = render(<ScreenshotCard {...handlers} isActive moveSelectedMode
      selectedElement={{ screenshotId: "screen", type: "headline", id: "text" }}
      onElementMouseDown={(event, ...args) => { event.stopPropagation(); handlers.onElementMouseDown(event, ...args); }} />);
    fireEvent.mouseDown(container.querySelector("[data-draggable-element='image']")!, { button: 0, clientX: 10, clientY: 20 });
    expect(handlers.onElementMouseDown).toHaveBeenCalledTimes(1);
    expect(handlers.onElementMouseDown.mock.calls[0].slice(1)).toEqual(["headline", "screen", "text"]);
  });
  it("does not hijack screenshot controls in Move Selected mode", () => {
    const handlers = props();
    const { getByRole } = render(<ScreenshotCard {...handlers} isActive moveSelectedMode selectedElement={{ screenshotId: "screen", type: "headline", id: "text" }} />);
    fireEvent.mouseDown(getByRole("button", { name: "Move screenshot 2 left" }));
    fireEvent.click(getByRole("button", { name: "Move screenshot 2 left" }));
    expect(handlers.onElementMouseDown).not.toHaveBeenCalled();
    expect(handlers.onMoveLeft).toHaveBeenCalledOnce();
  });
});

describe("image letterbox hit area", () => {
  it("matches object-contain without changing artwork scale", () => {
    expect(getContainedImagePercent(100, 200, 100, 100)).toEqual({ width: 100, height: 50 });
    expect(getContainedImagePercent(200, 100, 100, 100)).toEqual({ width: 50, height: 100 });
    expect(getContainedImagePercent(100, 100, 100, 100)).toEqual({ width: 100, height: 100 });
  });
});
