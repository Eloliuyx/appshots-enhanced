/**
 * OverlayImage Component
 *
 * Renders a draggable overlay image with selection state and shadow effects.
 */

import type { ImageOverlay } from "../../types";
import { useLayoutEffect, useRef, useState } from "react";
import { SelectionHandles } from "./SelectionHandles";
import { getOverlayImageStyles, getDropShadowFilter, getContainedImagePercent, getImageSelectionStyles } from "./utils";

interface OverlayImageProps {
  /** Overlay image data */
  image: ImageOverlay;
  /** Z-index for stacking order */
  zIndex: number;
  /** Whether this image is selected */
  isSelected: boolean;
  /** Whether mouse interactions are enabled */
  isInteractive: boolean;
  /** Handler for mouse down event */
  onMouseDown: (e: React.MouseEvent) => void;
}

/**
 * OverlayImage - Draggable image overlay component
 *
 * Renders an overlay image that can be positioned anywhere on the canvas.
 * Supports selection state, rotation, and drop shadow effects.
 *
 * @param props - Component props
 * @param props.image - The overlay image data
 * @param props.zIndex - Z-index for proper layering
 * @param props.isSelected - Whether the image is currently selected
 * @param props.isInteractive - Whether to respond to mouse events
 * @param props.onMouseDown - Handler for initiating drag
 *
 * @example
 * <OverlayImage
 *   image={overlayImg}
 *   zIndex={110}
 *   isSelected={true}
 *   isInteractive={true}
 *   onMouseDown={handleMouseDown}
 * />
 */
export const OverlayImage = ({
  image,
  zIndex,
  isSelected,
  isInteractive,
  onMouseDown,
}: OverlayImageProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const [natural, setNatural] = useState({ width: 0, height: 0 });
  const readNaturalSize = () => {
    if (imageRef.current) setNatural({ width: imageRef.current.naturalWidth, height: imageRef.current.naturalHeight });
  };
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    setBox({ width: container.clientWidth, height: container.clientHeight });
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setBox({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);
  useLayoutEffect(() => { readNaturalSize(); }, [image.src]);
  const fit = getContainedImagePercent(box.width, box.height, natural.width, natural.height);
  return (
  <div
    ref={containerRef}
    className="absolute select-none"
    style={{ ...getOverlayImageStyles(image, zIndex, false), pointerEvents: "none" }}
  >
    <div data-draggable-element="image" className="absolute cursor-move"
      style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)",
        width: `${fit.width}%`, height: `${fit.height}%`,
        pointerEvents: isInteractive ? "auto" : "none", ...getImageSelectionStyles(isSelected) }}
      onMouseDown={isInteractive ? onMouseDown : undefined}
      onClick={(event) => { if (isInteractive) event.stopPropagation(); }}>
    <img
      ref={imageRef}
      onLoad={readNaturalSize}
      src={image.src}
      alt="Overlay"
      className="w-full h-full object-contain pointer-events-none"
      style={{ filter: getDropShadowFilter(image.shadow) }}
    />
    {isSelected && <SelectionHandles />}
    </div>
  </div>
  );
};
