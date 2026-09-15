import { ChevronLeft, ChevronRight, GripVertical } from "lucide-react";

interface OrderControlsProps {
  position: number;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onReorderPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => void;
}

export const OrderControls = ({
  position,
  canMoveLeft,
  canMoveRight,
  onMoveLeft,
  onMoveRight,
  onReorderPointerDown,
}: OrderControlsProps) => (
  <div
    data-editor-control="true"
    className="absolute left-2 top-2 z-[1000] flex items-center overflow-hidden rounded-lg border border-white/15 bg-black/60 text-white shadow-lg backdrop-blur-sm"
    onClick={(event) => event.stopPropagation()}
    onMouseDown={(event) => event.stopPropagation()}
  >
    <button
      type="button"
      onClick={onMoveLeft}
      disabled={!canMoveLeft}
      className="p-1.5 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-30"
      aria-label={`Move screenshot ${position} left`}
      title="Move left"
    >
      <ChevronLeft className="h-3.5 w-3.5" />
    </button>
    <button
      type="button"
      onPointerDown={onReorderPointerDown}
      className="touch-none cursor-grab border-x border-white/10 p-1.5 hover:bg-white/15 active:cursor-grabbing"
      aria-label={`Drag to reorder screenshot ${position}`}
      title="Drag to reorder"
    >
      <GripVertical className="h-3.5 w-3.5" />
    </button>
    <button
      type="button"
      onClick={onMoveRight}
      disabled={!canMoveRight}
      className="p-1.5 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-30"
      aria-label={`Move screenshot ${position} right`}
      title="Move right"
    >
      <ChevronRight className="h-3.5 w-3.5" />
    </button>
  </div>
);
