import { Plus, Trash2 } from "lucide-react";
import type {
  Screenshot,
  SelectedElement,
  TextLayer,
  TextLayerType,
} from "../../types";
import { RichTextEditor } from "../RichTextEditor";
import { RangeSlider } from "./RangeSlider";
import { SidebarSection } from "./SidebarSection";
import { SLIDER_RANGES } from "./constants";

interface ContentSectionProps {
  screenshot: Screenshot;
  selectedElement: SelectedElement | null;
  onAddTextLayer: (type: TextLayerType) => void;
  onUpdateTextLayer: (id: string, updates: Partial<TextLayer>) => void;
  onRemoveTextLayer: (id: string) => void;
  onSelectTextLayer: (layer: TextLayer) => void;
  headlineFontSize: number;
  subheadlineFontSize: number;
  onHeadlineSizeChange: (size: number) => void;
  onSubheadlineSizeChange: (size: number) => void;
}

export const ContentSection = ({
  screenshot,
  selectedElement,
  onAddTextLayer,
  onUpdateTextLayer,
  onRemoveTextLayer,
  onSelectTextLayer,
  headlineFontSize,
  subheadlineFontSize,
  onHeadlineSizeChange,
  onSubheadlineSizeChange,
}: ContentSectionProps) => {
  const typeTotals = screenshot.textLayers.reduce(
    (totals, layer) => ({
      ...totals,
      [layer.type]: totals[layer.type] + 1,
    }),
    { headline: 0, subheadline: 0 },
  );
  const typeIndexes = { headline: 0, subheadline: 0 };

  return (
    <SidebarSection title="Text Layers">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onAddTextLayer("headline")}
            className="flex items-center justify-center gap-1.5 rounded-md bg-white px-2 py-2 text-xs font-medium text-black transition-colors hover:bg-neutral-200"
          >
            <Plus className="h-3.5 w-3.5" />
            Headline
          </button>
          <button
            type="button"
            onClick={() => onAddTextLayer("subheadline")}
            className="flex items-center justify-center gap-1.5 rounded-md bg-[#2a2a2a] px-2 py-2 text-xs font-medium text-gray-200 transition-colors hover:bg-[#333]"
          >
            <Plus className="h-3.5 w-3.5" />
            Subheadline
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-lg border border-white/10 bg-[#262626] p-2.5">
          <RangeSlider
            label="Headline Size"
            value={headlineFontSize}
            min={SLIDER_RANGES.headlineSize.min}
            max={SLIDER_RANGES.headlineSize.max}
            unit="px"
            onChange={onHeadlineSizeChange}
          />
          <RangeSlider
            label="Subheadline Size"
            value={subheadlineFontSize}
            min={SLIDER_RANGES.subheadlineSize.min}
            max={SLIDER_RANGES.subheadlineSize.max}
            unit="px"
            onChange={onSubheadlineSizeChange}
          />
        </div>

        {screenshot.textLayers.length === 0 && (
          <div className="rounded-lg border border-dashed border-white/15 px-3 py-4 text-center text-xs leading-5 text-gray-500">
            No text layers. Add a headline or subheadline when you need one.
          </div>
        )}

        {screenshot.textLayers.map((layer) => {
          typeIndexes[layer.type] += 1;
          const position = typeIndexes[layer.type];
          const isSelected =
            selectedElement?.screenshotId === screenshot.id &&
            selectedElement.type === layer.type &&
            selectedElement.id === layer.id;

          return (
            <div
              key={layer.id}
              onPointerDown={() => onSelectTextLayer(layer)}
              className={`rounded-lg border p-2.5 transition-colors ${
                isSelected
                  ? "border-white/60 bg-white/10"
                  : "border-white/10 bg-[#262626]"
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-300">
                  {layer.type === "headline" ? "Headline" : "Subheadline"}
                  {typeTotals[layer.type] > 1 ? ` ${position}` : ""}
                </span>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onRemoveTextLayer(layer.id);
                  }}
                  className="rounded p-1 text-gray-500 transition-colors hover:bg-white/10 hover:text-red-400"
                  aria-label={`Remove ${layer.type} ${position}`}
                  title="Remove text layer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <RichTextEditor
                value={layer.content}
                onChange={(content) =>
                  onUpdateTextLayer(layer.id, { content })
                }
                placeholder={`Enter ${layer.type}...`}
              />
              <div className="mt-2">
                <RangeSlider
                  label="Width"
                  value={layer.width}
                  min={SLIDER_RANGES.textWidth.min}
                  max={SLIDER_RANGES.textWidth.max}
                  step={SLIDER_RANGES.textWidth.step}
                  unit="%"
                  onChange={(width) => onUpdateTextLayer(layer.id, { width })}
                />
              </div>
            </div>
          );
        })}
      </div>
    </SidebarSection>
  );
};
