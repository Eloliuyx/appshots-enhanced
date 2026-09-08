/**
 * Toolbar Component
 *
 * Top toolbar for the canvas preview area with screenshot management controls.
 */

import { Plus, Redo2, Undo2 } from "lucide-react";

interface ToolbarProps {
  /** Callback to add a new screenshot */
  onAddScreenshot: () => void;
  /** Total number of screenshots */
  screenshotCount: number;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
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
}: ToolbarProps) => (
  <div className="h-14 border-b border-white/10 bg-[#141414] flex items-center px-4 gap-4">
    <div className="flex items-center gap-2">
      <button
        onClick={onAddScreenshot}
        className="flex items-center gap-1.5 bg-white hover:bg-neutral-200 text-black text-sm font-medium px-3 py-1.5 rounded-md transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Screenshot
      </button>
    </div>
    <div className="h-5 w-px bg-white/10" />
    <div className="flex items-center gap-1" aria-label="Edit history">
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        className="rounded-md p-2 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
        aria-label="Undo"
        title="Undo (⌘/Ctrl Z)"
      >
        <Undo2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onRedo}
        disabled={!canRedo}
        className="rounded-md p-2 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
        aria-label="Redo"
        title="Redo (⌘/Ctrl Shift Z)"
      >
        <Redo2 className="h-4 w-4" />
      </button>
    </div>
    <div className="flex-1" />
    <span className="text-xs text-gray-400">
      {screenshotCount} screenshot{screenshotCount !== 1 ? "s" : ""}
    </span>
  </div>
);
