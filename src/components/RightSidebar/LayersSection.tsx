import { useLanguage } from "../../context/LanguageContext";
import { useEditor } from "../../context/EditorContext";
import type { SelectedElement } from "../../types";
import { getDeviceSpecById } from "../../lib/device-instances";
import { SidebarSection } from "./SidebarSection";
import { useEffect, useState } from "react";

const CoordinateInput = ({ axis, value, onCommit }: { axis: "x" | "y"; value: number; onCommit: (value: string) => void }) => {
  const { t } = useLanguage();
  const [draft, setDraft] = useState(String(Number(value.toFixed(2))));
  useEffect(() => setDraft(String(Number(value.toFixed(2)))), [value]);
  const commit = () => {
    if (draft.trim() && Number.isFinite(Number(draft))) onCommit(draft);
    else setDraft(String(Number(value.toFixed(2))));
  };
  return <label className="text-xs text-zinc-400">
    {t("{0} position (%)", [axis.toUpperCase()])}
    <input type="number" step="1" aria-label={t("Selected layer {0} position", [axis.toUpperCase()])}
      value={draft} onChange={(event) => setDraft(event.target.value)} onBlur={commit}
      onKeyDown={(event) => { if (event.key === "Enter") { commit(); event.currentTarget.blur(); } }}
      className="mt-1 w-full rounded border border-white/10 bg-zinc-900 px-2 py-1.5 text-zinc-200" />
  </label>;
};

/** Explicit selection and positioning work even for fully occluded layers. */
export const LayersSection = () => {
  const { t } = useLanguage();
  const {
    activeScreenshot: screenshot, selectedElement, setSelectedElement,
    selectDevice, moveSelectedMode, setMoveSelectedMode,
    updateTextLayer, updateActiveScreenshot,
  } = useEditor();
  const images = screenshot.overlayImages.map((image, index) => ({
    key: image.id, type: "image" as const, name: t("Image {0}", [index + 1]),
    behind: image.layer === "behind",
    detail: image.layer === "behind" ? t("Behind devices") : t("Foreground"), src: image.src,
  }));
  const layers = [
    ...images.filter((image) => !image.behind).reverse(),
    ...screenshot.devices.map((device, index) => ({
      key: device.id, type: "device" as const, name: t("Device {0}", [index + 1]),
      detail: getDeviceSpecById(device.deviceId).label, src: device.screenshotSrc,
    })).reverse(),
    ...screenshot.textLayers.map((layer, index) => ({
      key: layer.id, type: layer.type,
      name: `${layer.type === "headline" ? t("Headline") : t("Subheadline")} ${index + 1}`,
      detail: new DOMParser().parseFromString(layer.content, "text/html").body.textContent ?? "",
      src: null,
    })).reverse(),
    ...images.filter((image) => image.behind).reverse(),
  ];
  const selection = selectedElement?.screenshotId === screenshot.id ? selectedElement : null;
  const selectedObject = selection?.type === "image"
    ? screenshot.overlayImages.find((image) => image.id === selection.id)
    : selection?.type === "device"
      ? screenshot.devices.find((device) => device.id === selection.id)
      : screenshot.textLayers.find((layer) => layer.id === selection?.id);

  const selectLayer = (type: SelectedElement["type"], id: string) => {
    if (type === "device") selectDevice(id);
    else setSelectedElement({ type, id, screenshotId: screenshot.id });
    setMoveSelectedMode(true);
  };
  const setCoordinate = (axis: "x" | "y", value: string) => {
    if (!selection?.id || !value.trim()) return;
    const coordinate = Number(value);
    if (!Number.isFinite(coordinate)) return;
    const update = { [axis]: coordinate };
    if (selection.type === "headline" || selection.type === "subheadline") {
      updateTextLayer(selection.id, update);
    } else if (selection.type === "image") {
      updateActiveScreenshot({ overlayImages: screenshot.overlayImages.map((image) =>
        image.id === selection.id ? { ...image, ...update } : image) });
    } else {
      updateActiveScreenshot({ devices: screenshot.devices.map((device) =>
        device.id === selection.id ? { ...device, ...update } : device) });
    }
  };

  return (
    <SidebarSection title={t("Layers")}>
      <p className="mb-3 text-xs text-zinc-400">{t("Choose any object here, even when covered by another object.")}</p>
      <div className="max-h-52 space-y-1 overflow-y-auto" role="group" aria-label={t("Screenshot layers")}>
        {layers.map((layer) => (
          <button key={`${layer.type}-${layer.key}`} type="button"
            aria-label={t("Select layer: {0}", [layer.name])}
            aria-pressed={selection?.type === layer.type && selection.id === layer.key}
            onClick={() => selectLayer(layer.type, layer.key)}
            className={`flex w-full items-center gap-2 rounded-md border p-2 text-left ${selection?.type === layer.type && selection.id === layer.key ? "border-violet-400 bg-violet-500/15" : "border-white/10 hover:bg-white/5"}`}>
            {layer.src && <img src={layer.src} alt="" className="h-7 w-7 shrink-0 rounded object-contain" />}
            <span className="min-w-0"><span className="block text-xs text-zinc-200">{layer.name}</span>
              <span className="block truncate text-[10px] text-zinc-400" title={layer.detail}>{layer.detail || t("Empty text")}</span></span>
          </button>
        ))}
        {layers.length === 0 && <p className="text-xs text-zinc-500">{t("No layers yet.")}</p>}
      </div>
      <button type="button" aria-pressed={moveSelectedMode} disabled={!selectedObject}
        onClick={() => setMoveSelectedMode(!moveSelectedMode)}
        className={`mt-3 w-full rounded-md border px-3 py-2 text-xs disabled:opacity-30 ${moveSelectedMode ? "border-violet-400 text-violet-200" : "border-white/15 text-zinc-300"}`}>
        {t("Move Selected:")}{" "}{moveSelectedMode ? t("On") : t("Off")}
      </button>
      <p className="mt-2 text-[10px] text-zinc-400">{t("When on, drag anywhere on this screenshot to move only the selected object. Turn off to pick objects on the canvas.")}</p>
      {selectedObject && <div className="mt-3 grid grid-cols-2 gap-2">
        {(["x", "y"] as const).map((axis) => <CoordinateInput key={`${selection?.id}-${axis}`} axis={axis} value={selectedObject[axis]} onCommit={(value) => setCoordinate(axis, value)} />)}
      </div>}
    </SidebarSection>
  );
};
