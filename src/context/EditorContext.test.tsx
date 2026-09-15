/** @vitest-environment jsdom */

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EditorProvider, useEditor } from "./EditorContext";
import type { Screenshot } from "../types";

const InsertionHarness = () => {
  const { screenshots, activeScreenshotId, setActiveScreenshotId, addScreenshot, undo, redo } = useEditor();
  return <>
    <output data-testid="screenshots">{JSON.stringify(screenshots)}</output>
    <output data-testid="active-id">{activeScreenshotId}</output>
    {screenshots.map((screenshot, index) => <button key={screenshot.id} onClick={() => setActiveScreenshotId(screenshot.id)}>Select {index + 1}</button>)}
    <button onClick={() => setActiveScreenshotId("missing")}>Select missing</button>
    <button onClick={addScreenshot}>Add</button>
    <button onClick={undo}>Undo</button>
    <button onClick={redo}>Redo</button>
  </>;
};

const readScreenshots = (): Screenshot[] => JSON.parse(screen.getByTestId("screenshots").textContent ?? "[]") as Screenshot[];

describe("new screenshot insertion", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => { cleanup(); vi.useRealTimers(); });

  const prepareThreeScreenshots = () => {
    render(<EditorProvider><InsertionHarness /></EditorProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    return readScreenshots();
  };

  it.each([0, 1, 2])("inserts after selected screenshot at index %i and preserves existing content", (selectedIndex) => {
    const original = prepareThreeScreenshots();
    fireEvent.click(screen.getByRole("button", { name: `Select ${selectedIndex + 1}` }));
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    const result = readScreenshots();
    const inserted = result[selectedIndex + 1];
    expect(result).toHaveLength(4);
    expect(result.slice(0, selectedIndex + 1)).toEqual(original.slice(0, selectedIndex + 1));
    expect(result.slice(selectedIndex + 2)).toEqual(original.slice(selectedIndex + 1));
    expect(original.some(screenshot => screenshot.id === inserted.id)).toBe(false);
    expect(screen.getByTestId("active-id").textContent).toBe(inserted.id);
  });

  it("places repeated additions after the newly selected screenshot", () => {
    const original = prepareThreeScreenshots();
    fireEvent.click(screen.getByRole("button", { name: "Select 1" }));
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    const firstNewId = screen.getByTestId("active-id").textContent;
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    const secondNewId = screen.getByTestId("active-id").textContent;
    expect(readScreenshots().map(screenshot => screenshot.id)).toEqual([original[0].id, firstNewId, secondNewId, original[1].id, original[2].id]);
  });

  it("restores the original order and selection on undo, and the insertion on redo", () => {
    vi.useFakeTimers();
    const original = prepareThreeScreenshots();
    act(() => vi.advanceTimersByTime(1000));
    fireEvent.click(screen.getByRole("button", { name: "Select 2" }));
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    const inserted = readScreenshots();
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(readScreenshots()).toEqual(original);
    expect(screen.getByTestId("active-id").textContent).toBe(original[1].id);
    fireEvent.click(screen.getByRole("button", { name: "Redo" }));
    expect(readScreenshots()).toEqual(inserted);
    expect(screen.getByTestId("active-id").textContent).toBe(inserted[2].id);
  });

  it("safely appends if the selected screenshot is no longer present", () => {
    const original = prepareThreeScreenshots();
    fireEvent.click(screen.getByRole("button", { name: "Select missing" }));
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    const result = readScreenshots();
    expect(result).toHaveLength(4);
    expect(result.slice(0, 3)).toEqual(original);
    expect(screen.getByTestId("active-id").textContent).toBe(result[3].id);
  });
});

const HistoryHarness = () => {
  const {
    screenshots,
    addScreenshot,
    canUndo,
    canRedo,
    undo,
    redo,
  } = useEditor();

  return (
    <div>
      <span data-testid="count">{screenshots.length}</span>
      <button type="button" onClick={addScreenshot}>
        Add
      </button>
      <button type="button" onClick={undo} disabled={!canUndo}>
        Undo
      </button>
      <button type="button" onClick={redo} disabled={!canRedo}>
        Redo
      </button>
    </div>
  );
};

const FlexibleContentHarness = () => {
  const {
    activeScreenshot,
    activeDevice,
    addTextLayer,
    removeTextLayer,
    addDevice,
    removeDevice,
  } = useEditor();

  return (
    <div>
      <span data-testid="text-layer-count">
        {activeScreenshot.textLayers.length}
      </span>
      <span data-testid="device-count">{activeScreenshot.devices.length}</span>
      <button type="button" onClick={() => addTextLayer("headline")}>
        Add headline
      </button>
      <button type="button" onClick={() => addTextLayer("subheadline")}>
        Add subheadline
      </button>
      <button
        type="button"
        onClick={() => {
          const lastLayer = activeScreenshot.textLayers.at(-1);
          if (lastLayer) removeTextLayer(lastLayer.id);
        }}
      >
        Remove text
      </button>
      <button type="button" onClick={addDevice}>
        Add device
      </button>
      <button
        type="button"
        onClick={() => activeDevice && removeDevice(activeDevice.id)}
      >
        Remove device
      </button>
    </div>
  );
};

describe("EditorContext history", () => {
  beforeEach(() => localStorage.clear());
  afterEach(cleanup);

  it("undoes and redoes an editor action", () => {
    render(
      <EditorProvider>
        <HistoryHarness />
      </EditorProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(screen.getByTestId("count").textContent).toBe("2");

    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(screen.getByTestId("count").textContent).toBe("1");

    fireEvent.click(screen.getByRole("button", { name: "Redo" }));
    expect(screen.getByTestId("count").textContent).toBe("2");
  });

  it("supports Ctrl+Z and Ctrl+Shift+Z", () => {
    render(
      <EditorProvider>
        <HistoryHarness />
      </EditorProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    fireEvent.keyDown(window, { key: "z", ctrlKey: true });
    expect(screen.getByTestId("count").textContent).toBe("1");

    fireEvent.keyDown(window, { key: "z", ctrlKey: true, shiftKey: true });
    expect(screen.getByTestId("count").textContent).toBe("2");
  });
});

describe("EditorContext flexible screenshot content", () => {
  beforeEach(() => localStorage.clear());
  afterEach(cleanup);

  it("adds multiple headline and subheadline layers", () => {
    render(
      <EditorProvider>
        <FlexibleContentHarness />
      </EditorProvider>,
    );

    expect(screen.getByTestId("text-layer-count").textContent).toBe("2");
    fireEvent.click(screen.getByRole("button", { name: "Add headline" }));
    fireEvent.click(screen.getByRole("button", { name: "Add subheadline" }));
    expect(screen.getByTestId("text-layer-count").textContent).toBe("4");
  });

  it("supports a device-free screenshot and adding a device back", () => {
    render(
      <EditorProvider>
        <FlexibleContentHarness />
      </EditorProvider>,
    );

    expect(screen.getByTestId("device-count").textContent).toBe("1");
    fireEvent.click(screen.getByRole("button", { name: "Remove device" }));
    expect(screen.getByTestId("device-count").textContent).toBe("0");
    fireEvent.click(screen.getByRole("button", { name: "Add device" }));
    expect(screen.getByTestId("device-count").textContent).toBe("1");
  });
});
