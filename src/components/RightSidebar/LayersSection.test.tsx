/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { EditorProvider, useEditor } from "../../context/EditorContext";
import { LayersSection } from "./LayersSection";

afterEach(() => { cleanup(); localStorage.clear(); });
describe("explicit layer selection", () => {
  it("selects and positions text without touching a covering image", async () => {
    let editor!: ReturnType<typeof useEditor>;
    const Harness = () => { editor = useEditor(); return <LayersSection />; };
    render(<EditorProvider><Harness /></EditorProvider>);
    await act(async () => {});
    const initial = editor.activeScreenshot;
    const image = { id: "cover", src: "data:image/png;base64,AA==", x: 50, y: 50, width: 100, height: 100, layer: "front" as const, rotation: 0,
      shadow: { enabled: false, color: "#000", blur: 0, offsetX: 0, offsetY: 0 } };
    act(() => editor.updateActiveScreenshot({ overlayImages: [image] }));
    fireEvent.click(screen.getByRole("button", { name: "Select layer: Headline 1" }));
    expect(editor.selectedElement?.id).toBe(initial.textLayers[0].id);
    expect(editor.moveSelectedMode).toBe(true);
    const position = screen.getByLabelText("Selected layer X position");
    fireEvent.change(position, { target: { value: "-12" } });
    fireEvent.blur(position);
    expect(editor.activeScreenshot.textLayers[0].x).toBe(-12);
    expect(editor.activeScreenshot.overlayImages).toEqual([image]);
    fireEvent.click(screen.getByRole("button", { name: "Move Selected: On" }));
    expect(editor.moveSelectedMode).toBe(false);
    act(() => editor.setSelectedElement(null));
    expect(screen.queryByLabelText("Selected layer X position")).toBeNull();
  });
});
