/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { EditorProvider, useEditor } from "./EditorContext";

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
