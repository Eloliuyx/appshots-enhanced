import { useLanguage } from "../../context/LanguageContext";
/**
 * FontPickerHeader Component
 *
 * Header section of the font picker modal with title and close button.
 */

import { X } from "lucide-react";
import { STYLES } from "./constants";

interface FontPickerHeaderProps {
  /** Handler for close button click */
  onClose: () => void;
}

/**
 * FontPickerHeader - Modal header with title and close button
 *
 * @param props - Component props
 * @param props.onClose - Handler to close the modal
 *
 * @example
 * <FontPickerHeader onClose={() => setIsOpen(false)} />
 */
export const FontPickerHeader = ({ onClose }: FontPickerHeaderProps) => {
  const { t } = useLanguage();
  return (
  <div className="flex items-center justify-between p-4 border-b border-white/10">
    <h2 className="text-lg font-semibold text-white">{t("Select a Font")}</h2>
    <button
      onClick={onClose}
      className={STYLES.iconButton}
      aria-label={t("Close font picker")}
    >
      <X size={20} />
    </button>
  </div>
);
};
