/**
 * CanvasPreview Component
 *
 * Main canvas area displaying all screenshots with interactive editing capabilities.
 * Supports drag-and-drop positioning, element selection, and screenshot management.
 *
 * Features:
 * - Horizontal scrolling screenshot gallery
 * - Drag-to-position text and overlay elements
 * - Add/remove screenshots
 * - Responsive preview scaling
 */

import { useEditor } from "../../context/EditorContext";
import { getRenderableDevicesForScreenshot } from "../../lib/device-overflow";
import { Toolbar } from "./Toolbar";
import { ScreenshotCard } from "./ScreenshotCard";
import { useResizeObserver } from "./useResizeObserver";
import { useEffect, useRef, useState } from "react";

/**
 * CanvasPreview - Main screenshot editing canvas
 *
 * Displays all screenshots in a horizontal scrollable gallery.
 * The active screenshot can be edited by dragging elements.
 *
 * @example
 * <CanvasPreview />
 */
export const CanvasPreview = () => {
  const {
    screenshots,
    activeScreenshotId,
    setActiveScreenshotId,
    setSelectedElement,
    removeScreenshot,
    handleElementMouseDown,
    handleElementMouseUp,
    getBackgroundStyle,
    addScreenshot,
    previewRef,
    canvasContainerRef,
    selectedElement,
    headlineFontSize,
    subheadlineFontSize,
    setPreviewDimensions,
    exportSize,
    reorderScreenshots,
    moveScreenshot,
    canUndo,
    canRedo,
    undo,
    redo,
  } = useEditor();
  const [draggedScreenshotId, setDraggedScreenshotId] = useState<string | null>(
    null,
  );
  const [dragTargetId, setDragTargetId] = useState<string | null>(null);
  const dragTargetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!draggedScreenshotId) return;

    const screenshotAtPoint = (x: number, y: number) =>
      document
        .elementFromPoint(x, y)
        ?.closest<HTMLElement>("[data-screenshot-drop-id]")
        ?.dataset.screenshotDropId ?? null;

    const handlePointerMove = (event: PointerEvent) => {
      const targetId = screenshotAtPoint(event.clientX, event.clientY);
      if (!targetId || targetId === dragTargetIdRef.current) return;
      dragTargetIdRef.current = targetId;
      setDragTargetId(targetId);
    };

    const finishReorder = (event: PointerEvent) => {
      const targetId =
        screenshotAtPoint(event.clientX, event.clientY) ?? dragTargetIdRef.current;
      if (targetId && targetId !== draggedScreenshotId) {
        reorderScreenshots(draggedScreenshotId, targetId);
      }
      dragTargetIdRef.current = null;
      setDraggedScreenshotId(null);
      setDragTargetId(null);
    };

    const cancelReorder = () => {
      dragTargetIdRef.current = null;
      setDraggedScreenshotId(null);
      setDragTargetId(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", finishReorder, { once: true });
    window.addEventListener("pointercancel", cancelReorder, { once: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", finishReorder);
      window.removeEventListener("pointercancel", cancelReorder);
    };
  }, [draggedScreenshotId, reorderScreenshots]);

  // Track preview dimensions for export scaling
  useResizeObserver({
    elementRef: previewRef,
    onResize: setPreviewDimensions,
    deps: [activeScreenshotId],
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Toolbar
        onAddScreenshot={addScreenshot}
        screenshotCount={screenshots.length}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
      />

      {/* Preview area with horizontal scroll */}
      <div
        ref={canvasContainerRef}
        className="flex-1 overflow-x-auto overflow-y-hidden bg-[#0a0a0a] p-6"
      >
        <div className="flex gap-1 h-full min-w-max">
          {screenshots.map((screenshot, index) => {
            const renderableDevices = getRenderableDevicesForScreenshot(
              screenshots,
              index,
            );

            return (
              <div
                key={screenshot.id}
                data-screenshot-drop-id={screenshot.id}
                className={`relative h-full rounded-xl transition-all ${
                  dragTargetId === screenshot.id &&
                  draggedScreenshotId !== screenshot.id
                    ? "ring-2 ring-white ring-offset-4 ring-offset-[#0a0a0a]"
                    : ""
                } ${
                  draggedScreenshotId === screenshot.id ? "opacity-45" : ""
                }`}
              >
                <ScreenshotCard
                  screenshot={screenshot}
                  renderableDevices={renderableDevices}
                  isActive={activeScreenshotId === screenshot.id}
                  canRemove={screenshots.length > 1}
                  selectedElement={selectedElement}
                  exportSize={exportSize}
                  headlineFontSize={headlineFontSize}
                  subheadlineFontSize={subheadlineFontSize}
                  previewRef={previewRef}
                  getBackgroundStyle={getBackgroundStyle}
                  onSelect={() => {
                    if (activeScreenshotId !== screenshot.id) {
                      setActiveScreenshotId(screenshot.id);
                      setSelectedElement(null);
                    }
                  }}
                  onRemove={() => removeScreenshot(screenshot.id)}
                  onDeselect={() => setSelectedElement(null)}
                  onElementMouseDown={handleElementMouseDown}
                  onElementMouseUp={handleElementMouseUp}
                  position={index + 1}
                  canMoveLeft={index > 0}
                  canMoveRight={index < screenshots.length - 1}
                  onMoveLeft={() => moveScreenshot(screenshot.id, -1)}
                  onMoveRight={() => moveScreenshot(screenshot.id, 1)}
                  onOrderPointerDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    dragTargetIdRef.current = screenshot.id;
                    setDragTargetId(screenshot.id);
                    setDraggedScreenshotId(screenshot.id);
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
