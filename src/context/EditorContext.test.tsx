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
