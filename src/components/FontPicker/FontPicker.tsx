import { useLanguage } from "../../context/LanguageContext";
/**
 * FontPicker Component
 *
 * Modal dialog for selecting Google Fonts with search functionality.
 *
 * Features:
 * - Searchable font list
 * - Font preview with sample text
 * - Category badges
 * - Keyboard accessible
 * - Animated transitions
 */

import { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { CustomFont } from "../../types";
import { googleFonts } from "../../lib/google-fonts";
import { FontPickerHeader } from "./FontPickerHeader";
import { SearchInput } from "./SearchInput";
import { FontGrid } from "./FontGrid";
import { FontPickerFooter } from "./FontPickerFooter";
import { filterFonts } from "./utils";
import { STYLES } from "./constants";

interface FontPickerProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Handler to close the modal */
  onClose: () => void;
  /** Currently selected font family */
  selectedFontFamily: string;
  /** Handler called when a font is selected */
  onSelect: (fontFamily: string) => void;
  customFonts: CustomFont[];
  onUpload: (file: File) => Promise<string>;
}

/**
 * FontPicker - Google Fonts selection modal
 *
 * A full-screen modal for browsing and selecting from available Google Fonts.
 * Includes search, font previews, and category information.
 *
 * @param props - Component props
 * @param props.isOpen - Controls modal visibility
 * @param props.onClose - Handler to close modal
 * @param props.selectedFontFamily - Currently selected font
 * @param props.onSelect - Handler for font selection
 *
 * @example
 * <FontPicker
 *   isOpen={isFontPickerOpen}
 *   onClose={() => setIsFontPickerOpen(false)}
 *   selectedFontFamily={currentFont}
 *   onSelect={(font) => updateFont(font)}
 * />
 */
export const FontPicker = ({
  isOpen,
  onClose,
  selectedFontFamily,
  onSelect,
  customFonts,
  onUpload,
}: FontPickerProps) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const uploadRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const matchingCustomFonts = customFonts.filter((font) =>
    font.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [isOpen, onClose]);

  const handleUpload = async (file: File) => {
    setUploadError("");
    setIsUploading(true);
    try {
      const family = await onUpload(file);
      onSelect(family);
      onClose();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : t("Could not load this font."));
    } finally {
      setIsUploading(false);
    }
  };

  // Filter fonts based on search query
  const filteredFonts = useMemo(
    () => filterFonts(googleFonts, searchQuery),
    [searchQuery],
  );

  // Handle font selection
  const handleSelect = (fontFamily: string) => {
    onSelect(fontFamily);
    onClose();
  };

  // Clear search query
  const handleClearSearch = () => setSearchQuery("");

  // Don't render if not open
  if (!isOpen) return null;

  return createPortal(
    <div className={STYLES.backdrop} onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={t("Select a Font")} className={STYLES.modal} onClick={(e) => e.stopPropagation()}>
        <FontPickerHeader onClose={onClose} />

        <SearchInput value={searchQuery} onChange={setSearchQuery} />

        <section className="border-b border-white/10 px-4 pb-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-medium text-zinc-200">{t("Your fonts")}</h3>
            <button type="button" disabled={isUploading}
              onClick={() => uploadRef.current?.click()}
              className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-black disabled:opacity-40">
              {isUploading ? t("Loading font…") : t("Upload Font")}
            </button>
            <input ref={uploadRef} type="file" accept=".ttf,.otf,.woff,.woff2"
              aria-label={t("Upload font file")} className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void handleUpload(file);
              }} />
          </div>
          <p className="mt-2 text-xs text-zinc-400">{t("TTF, OTF, WOFF, WOFF2 · max 20 MB · saved locally and included in workspace backups. Use fonts you have permission to use.")}</p>
          {uploadError && <p role="alert" className="mt-2 text-sm text-red-400">{t(uploadError)}</p>}
          {matchingCustomFonts.length > 0 && (
            <div className="mt-3 grid max-h-40 grid-cols-2 gap-2 overflow-y-auto">
              {matchingCustomFonts.map((font) => (
                <button key={font.family} type="button" onClick={() => handleSelect(font.family)}
                  className={`rounded-md border p-3 text-left ${selectedFontFamily === font.family ? "border-white bg-zinc-800" : "border-white/10"}`}>
                  <span className="block truncate text-xs text-zinc-300" title={font.name}>{font.name}</span>
                  <span className="mt-1 block truncate text-lg" style={{ fontFamily: `'${font.family}', sans-serif` }}>Just Now · 刚才</span>
                </button>
              ))}
            </div>
          )}
        </section>

        <FontGrid
          fonts={filteredFonts}
          selectedFontFamily={selectedFontFamily}
          searchQuery={searchQuery}
          onSelect={handleSelect}
          onClearSearch={handleClearSearch}
        />

        <FontPickerFooter onCancel={onClose} />
      </div>
    </div>,
    document.body,
  );
};
