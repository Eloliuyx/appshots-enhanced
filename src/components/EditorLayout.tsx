import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";
import { CanvasPreview } from "./CanvasPreview";
import { FontPicker } from "./FontPicker";
import { useEditor } from "../context/EditorContext";

export const EditorLayout = () => {
  const {
    isFontPickerOpen,
    setIsFontPickerOpen,
    activeScreenshot,
    updateActiveScreenshot,
    customFonts,
    uploadCustomFont,
  } = useEditor();

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-white overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />
        <CanvasPreview />
        <RightSidebar />
        <FontPicker
          customFonts={customFonts}
          onUpload={uploadCustomFont}
          isOpen={isFontPickerOpen}
          onClose={() => setIsFontPickerOpen(false)}
          selectedFontFamily={activeScreenshot.fontFamily}
          onSelect={(fontFamily: string) =>
            updateActiveScreenshot({ fontFamily })
          }
        />
      </div>
    </div>
  );
};
