import { useLanguage } from "../../context/LanguageContext";
/**
 * ScreenshotImageSection Component
 *
 * Screenshot image upload control in its own sidebar section.
 */

import type { RefObject } from "react";
import type { DeviceInstance } from "../../types";
import { SidebarSection } from "./SidebarSection";
import { STYLES } from "./constants";

interface ScreenshotImageSectionProps {
  device: DeviceInstance;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ScreenshotImageSection = ({
  device,
  fileInputRef,
  onFileUpload,
}: ScreenshotImageSectionProps) => {
  const { t } = useLanguage();
  return (
  <SidebarSection title={t("Device Screen Image")}>
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      onChange={onFileUpload}
      className="hidden"
    />
    <button
      onClick={() => fileInputRef.current?.click()}
      className={STYLES.uploadButton}
    >
      {device.screenshotSrc ? t("Replace Image") : t("Upload Image")}
    </button>
    {device.screenshotSrc && (
      <p className="mt-2 text-xs leading-5 text-zinc-500">
        {t("Keeps the current size, position, rotation, and layer.")}</p>
    )}
  </SidebarSection>
);
};
