/** @vitest-environment jsdom */
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EditorProvider, useEditor } from "./EditorContext";

vi.mock("../lib/custom-fonts", async (importOriginal) => ({
  ...await importOriginal<typeof import("../lib/custom-fonts")>(),
  loadCustomFont: vi.fn().mockResolvedValue(undefined),
}));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); localStorage.clear(); });

describe("portable editable workspace backup", () => {
  it("imports old projects without replacing existing designs and backs up custom fonts", async () => {
    let editor!: ReturnType<typeof useEditor>;
    const Harness = () => { editor = useEditor(); return null; };
    render(<EditorProvider><Harness /></EditorProvider>);
    await act(async () => {});
    const originalId = editor.activeProjectId;
    const original = editor.activeProject;
    const font = { family: `AppShotsFont-${"c".repeat(64)}`, name: "Brand.ttf", dataUrl: "data:font/ttf;base64,AAEAAA==" };
    const importedProject = {
      ...original,
      id: "from-backup",
      name: "Editable Chinese",
      screenshots: original.screenshots.map((screen) => ({ ...screen, fontFamily: font.family })),
    };
    const file = { text: async () => JSON.stringify({ projects: [importedProject], customFonts: [font] }) } as File;
    await act(async () => { expect(await editor.importWorkspaceBackup(file)).toBe(1); });
    expect(editor.projects).toHaveLength(2);
    expect(editor.projects.find((project) => project.id === originalId)?.screenshots).toEqual(original.screenshots);
    expect(editor.customFonts).toEqual([font]);
    expect(editor.activeScreenshot.fontFamily).toBe(font.family);
    expect(editor.activeScreenshot.textLayers).toEqual(original.screenshots[0].textLayers);

    let backupBlob!: Blob;
    vi.stubGlobal("URL", { createObjectURL: (blob: Blob) => { backupBlob = blob; return "blob:test"; }, revokeObjectURL: vi.fn() });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    act(() => editor.exportWorkspaceBackup());
    const backupText = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.readAsText(backupBlob);
    });
    const backup = JSON.parse(backupText);
    expect(backup.customFonts).toEqual([font]);
    expect(backup.projects).toHaveLength(2);

    // A legacy backup with no font library must not clear existing fonts.
    await act(async () => { await editor.importWorkspaceBackup({ text: async () => JSON.stringify({ projects: [original] }) } as File); });
    await waitFor(() => expect(editor.projects).toHaveLength(3));
    expect(editor.customFonts).toEqual([font]);
  });
});
