import { useLanguage } from "../../context/LanguageContext";
/**
 * Toolbar Component
 *
 * Top toolbar for the canvas preview area with screenshot management controls.
 */

import { useRef } from "react";
import { ImagePlus, Plus, Redo2, Undo2 } from "lucide-react";

interface ToolbarProps {
  /** Callback to add a new screenshot */
  onAddScreenshot: () => void;
  /** Total number of screenshots */
  screenshotCount: number;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onImportFinishedScreenshots: (files: File[]) => Promise<number>;
}

/**
 * Toolbar - Canvas top toolbar with controls
 *
 * Displays the "Add Screenshot" button and screenshot count.
 *
 * @param props - Component props
 * @param props.onAddScreenshot - Handler for adding new screenshot
 * @param props.screenshotCount - Current number of screenshots
 *
 * @example
 * <Toolbar onAddScreenshot={addScreenshot} screenshotCount={3} />
 */
export const Toolbar = ({
  onAddScreenshot,
  screenshotCount,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onImportFinishedScreenshots,
}: ToolbarProps) => {
  const { t, language, setLanguage } = useLanguage();
  const importInputRef = useRef<HTMLInputElement>(null);

  return (
  <div className="h-14 border-b border-white/10 bg-[#141414] flex items-center px-4 gap-4">
    <div className="flex items-center gap-2">
      <button
        onClick={onAddScreenshot}
        className="flex items-center gap-1.5 bg-white hover:bg-neutral-200 text-black text-sm font-medium px-3 py-1.5 rounded-md transition-colors"
      >
        <Plus className="w-4 h-4" />
        {t("Add Screenshot")}</button>
      <input
        ref={importInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        className="hidden"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = "";
          if (files.length > 0) void onImportFinishedScreenshots(files).catch((error: unknown) => {
            window.alert(t(error instanceof Error ? error.message : "Could not import these images."));
          });
        }}
      />
      <button
        type="button"
        onClick={() => importInputRef.current?.click()}
        className="flex items-center gap-1.5 rounded-md border border-white/15 px-3 py-1.5 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/10 hover:text-white"
        title={t("Add exported PNGs as full, flattened screenshots")}
      >
        <ImagePlus className="h-4 w-4" />
        {t("Import Finished PNGs")}</button>
    </div>
    <div className="h-5 w-px bg-white/10" />
    <div className="flex items-center gap-1" aria-label={t("Edit history")}>
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        className="rounded-md p-2 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
        aria-label={t("Undo")}
        title={t("Undo (⌘/Ctrl Z)")}
      >
        <Undo2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onRedo}
        disabled={!canRedo}
        className="rounded-md p-2 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
        aria-label={t("Redo")}
        title={t("Redo (⌘/Ctrl Shift Z)")}
      >
        <Redo2 className="h-4 w-4" />
      </button>
    </div>
    <div className="flex-1" />
    <div role="group" aria-label={t("Interface language")} className="flex shrink-0 gap-0.5 rounded-lg border border-white/15 bg-zinc-900 p-0.5">
      {(["en", "zh"] as const).map((option) => (
        <button key={option} type="button" lang={option === "zh" ? "zh-CN" : "en"}
          aria-pressed={language === option} onClick={() => setLanguage(option)}
          className={`rounded-md px-2.5 py-1 text-xs transition-colors ${language === option ? "bg-white text-black" : "text-zinc-400 hover:text-white"}`}>
          {option === "zh" ? "中文" : "EN"}
        </button>
      ))}
    </div>
    <span className="shrink-0 whitespace-nowrap text-xs text-gray-400">
      {t(screenshotCount === 1 ? "{0} screenshot" : "{0} screenshots", [screenshotCount])}
    </span>
  </div>
  );
};
