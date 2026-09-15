import { useLanguage } from "../../context/LanguageContext";
import { ArrowUp, ArrowDown, Smartphone, X } from "lucide-react";
import type { Screenshot } from "../../types";
import { getDeviceSpecById } from "../../lib/device-instances";
import { SidebarSection } from "./SidebarSection";
import { STYLES } from "./constants";

interface DeviceInstancesSectionProps {
  screenshot: Screenshot;
  onAddDevice: () => void;
  onSelectDevice: (deviceId: string) => void;
  onRemoveDevice: (deviceId: string) => void;
  onBringForward: (deviceId: string) => void;
  onSendBackward: (deviceId: string) => void;
}

export const DeviceInstancesSection = ({
  screenshot,
  onAddDevice,
  onSelectDevice,
  onRemoveDevice,
  onBringForward,
  onSendBackward,
}: DeviceInstancesSectionProps) => {
  const { t } = useLanguage();
  return (
  <SidebarSection title={t("Devices")}>
    <div className="space-y-2">
      <button onClick={onAddDevice} className={STYLES.uploadButton}>
        {t("+ Add Device")}</button>
      <p className="text-[11px] leading-4 text-gray-500">
        {t("Add any number of device images, or keep this screenshot device-free.")}</p>

      <div className="space-y-2 mt-3">
        {screenshot.devices.length === 0 && (
          <div className="rounded-lg border border-dashed border-white/15 px-3 py-4 text-center text-xs leading-5 text-gray-500">
            {t("No devices on this screenshot.")}</div>
        )}
        {screenshot.devices.map((device, index) => {
          const spec = getDeviceSpecById(device.deviceId);
          const isSelected = screenshot.activeDeviceId === device.id;

          return (
            <div
              key={device.id}
              onClick={() => onSelectDevice(device.id)}
              className={`${STYLES.overlayItem} ${
                isSelected ? STYLES.overlayItemActive : STYLES.overlayItemInactive
              }`}
            >
              <div className="w-10 h-10 rounded bg-[#1a1a1a] border border-white/10 flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-gray-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-300 truncate">{spec.label}</p>
                <p className="text-[10px] text-gray-500">
                  {device.screenshotSrc ? t("Image attached") : t("No image")} · {t("Layer {0} of {1}", [index + 1, screenshot.devices.length])}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSendBackward(device.id);
                  }}
                  disabled={index === 0}
                  className={STYLES.iconButton}
                  title={t("Send backward")}
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onBringForward(device.id);
                  }}
                  disabled={index === screenshot.devices.length - 1}
                  className={STYLES.iconButton}
                  title={t("Bring forward")}
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveDevice(device.id);
                  }}
                  className={STYLES.iconButtonDelete}
                  title={t("Remove device")}
                  aria-label={t("Remove {0}", [spec.label])}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </SidebarSection>
);
};
