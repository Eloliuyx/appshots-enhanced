/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EditorLayout } from "../components/EditorLayout";
import { FontPicker } from "../components/FontPicker";
import { Toolbar } from "../components/CanvasPreview/Toolbar";
import { EditorProvider, useEditor } from "./EditorContext";
import { LANGUAGE_STORAGE_KEY, LanguageProvider, translateMessage } from "./LanguageContext";

const ArtworkProbe = () => {
  const { screenshots, activeProject, canUndo } = useEditor();
  return <>
    <output data-testid="artwork">{JSON.stringify(screenshots)}</output>
    <output data-testid="project-name">{activeProject.name}</output>
    <output data-testid="undo-state">{String(canUndo)}</output>
  </>;
};
const toolbarProps = {
  onAddScreenshot: vi.fn(), screenshotCount: 7, canUndo: false, canRedo: false,
  onUndo: vi.fn(), onRedo: vi.fn(), onImportFinishedScreenshots: vi.fn(),
};

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("editor interface language", () => {
  it("switches the whole editor without changing artwork, projects, or edit history", () => {
    render(<LanguageProvider><EditorProvider><EditorLayout /><ArtworkProbe /></EditorProvider></LanguageProvider>);
    const originalArtwork = screen.getByTestId("artwork").textContent;
    const originalProject = screen.getByTestId("project-name").textContent;
    const originalHistory = screen.getByTestId("undo-state").textContent;
    const editable = document.querySelector('[contenteditable="true"]');
    fireEvent.click(screen.getByRole("button", { name: "中文" }));
    expect(screen.getByRole("button", { name: "添加截图" })).toBeTruthy();
    expect(screen.getByText("1 张截图")).toBeTruthy();
    expect(screen.getByText("AppShots 编辑器")).toBeTruthy();
    expect(screen.getByRole("button", { name: "导出当前截图（第 1 张）" })).toBeTruthy();
    expect(screen.getByText("文字图层")).toBeTruthy();
    expect(screen.getByText("设备屏幕图片")).toBeTruthy();
    expect(screen.getByText("外观")).toBeTruthy();
    expect(screen.getByText("叠加图片")).toBeTruthy();
    expect(screen.getByRole("button", { name: "选择图层：主标题 1" })).toBeTruthy();
    expect(screen.getByTestId("artwork").textContent).toBe(originalArtwork);
    expect(screen.getByTestId("project-name").textContent).toBe(originalProject);
    expect(screen.getByTestId("undo-state").textContent).toBe(originalHistory);
    expect(document.querySelector('[contenteditable="true"]')).toBe(editable);

    fireEvent.click(screen.getByRole("button", { name: originalProject ?? "My Project" }));
    expect(screen.getByRole("button", { name: "新建项目" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "导入备份" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "EN" }));
    expect(screen.getByRole("button", { name: "Add Screenshot" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "New Project" })).toBeTruthy();
    expect(screen.getByTestId("artwork").textContent).toBe(originalArtwork);
  });

  it("remembers the language on reopening and supports counts in both languages", () => {
    const first = render(<LanguageProvider><Toolbar {...toolbarProps} /></LanguageProvider>);
    expect(screen.getByText("7 screenshots")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "中文" }));
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("zh");
    first.unmount();
    render(<LanguageProvider><Toolbar {...toolbarProps} /></LanguageProvider>);
    expect(screen.getByText("7 张截图")).toBeTruthy();
    expect(screen.getByRole("button", { name: "中文" }).getAttribute("aria-pressed")).toBe("true");
    expect(document.documentElement.lang).toBe("zh-CN");
    fireEvent.click(screen.getByRole("button", { name: "EN" }));
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("en");
    expect(document.documentElement.lang).toBe("en");
    expect(translateMessage("en", "{0} screenshot", [1])).toBe("1 screenshot");
  });

  it("creates localized screenshot and text-layer defaults without rewriting existing content", () => {
    render(<LanguageProvider><EditorProvider><EditorLayout /><ArtworkProbe /></EditorProvider></LanguageProvider>);
    const readArtwork = () => JSON.parse(screen.getByTestId("artwork").textContent ?? "[]") as {
      headline: string; subheadline: string; textLayers: { content: string }[];
    }[];
    const original = readArtwork()[0];
    fireEvent.click(screen.getByRole("button", { name: "中文" }));
    fireEvent.click(screen.getByRole("button", { name: "添加截图" }));
    expect(readArtwork()[0]).toEqual(original);
    expect(readArtwork()[1].headline).toBe("新截图");
    expect(readArtwork()[1].subheadline).toBe("在这里添加描述");
    expect(readArtwork()[1].textLayers.map(layer => layer.content)).toEqual(["新截图", "在这里添加描述"]);
    fireEvent.click(screen.getByRole("button", { name: "主标题" }));
    expect(readArtwork()[1].textLayers.at(-1)?.content).toBe("新主标题");
    fireEvent.click(screen.getByRole("button", { name: "副标题" }));
    expect(readArtwork()[1].textLayers.at(-1)?.content).toBe("新副标题");
    const chineseArtwork = screen.getByTestId("artwork").textContent;
    fireEvent.click(screen.getByRole("button", { name: "EN" }));
    expect(screen.getByTestId("artwork").textContent).toBe(chineseArtwork);
    fireEvent.click(screen.getByRole("button", { name: "Add Screenshot" }));
    expect(readArtwork()[2].headline).toBe("New Screenshot");
    expect(readArtwork()[2].subheadline).toBe("Add your description here");
    fireEvent.click(screen.getByRole("button", { name: "Headline" }));
    expect(readArtwork()[2].textLayers.at(-1)?.content).toBe("New Headline");
    fireEvent.click(screen.getByRole("button", { name: "Subheadline" }));
    expect(readArtwork()[2].textLayers.at(-1)?.content).toBe("New Subheadline");
  });

  it("translates font controls, empty states, and upload validation without changing font names", async () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, "zh");
    render(<LanguageProvider><FontPicker isOpen onClose={vi.fn()} selectedFontFamily="Inter"
      onSelect={vi.fn()} customFonts={[]} onUpload={vi.fn().mockRejectedValue(new Error("This file is not a valid supported font."))} /></LanguageProvider>);
    expect(screen.getByRole("dialog", { name: "选择字体" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Inter/ })).toBeTruthy();
    fireEvent.change(screen.getByPlaceholderText("搜索 Google Fonts 字体…"), { target: { value: "not-a-real-font" } });
    expect(screen.getByText("没有找到与“not-a-real-font”匹配的字体")).toBeTruthy();
    expect(screen.getByRole("button", { name: "清空搜索" })).toBeTruthy();
    fireEvent.change(screen.getByLabelText("上传字体文件"), { target: { files: [new File(["bad"], "bad.ttf")] } });
    await waitFor(() => expect(screen.getByRole("alert").textContent).toBe("此文件不是有效的受支持字体。"));
  });

  it("formats user-supplied values without translating or reinterpreting them", () => {
    expect(translateMessage("zh", "Copy {0} into {1}", ["My Project", "Just Now_CH"])).toBe("将“My Project”复制到“Just Now_CH”");
    expect(translateMessage("zh", "Select layer: {0}", ["{1}"])).toBe("选择图层：{1}");
    expect(translateMessage("zh", "My own headline")).toBe("My own headline");
    expect(translateMessage("zh", "constructor")).toBe("constructor");
  });
});
