/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FontPicker } from "./FontPicker";

afterEach(cleanup);
const font = { family: `AppShotsFont-${"b".repeat(64)}`, name: "My Font.ttf", dataUrl: "data:font/ttf;base64,AAEAAA==" };

describe("custom font picker", () => {
  it("can select a saved custom font", () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(<FontPicker isOpen onClose={onClose} selectedFontFamily="Inter" onSelect={onSelect} customFonts={[font]} onUpload={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /My Font.ttf/ }));
    expect(onSelect).toHaveBeenCalledWith(font.family);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
  it("selects a successfully uploaded font", async () => {
    const onSelect = vi.fn();
    const onUpload = vi.fn().mockResolvedValue(font.family);
    render(<FontPicker isOpen onClose={vi.fn()} selectedFontFamily="Inter" onSelect={onSelect} customFonts={[]} onUpload={onUpload} />);
    const file = new File([new Uint8Array([0, 1, 0, 0])], "My Font.ttf");
    fireEvent.change(screen.getByLabelText("Upload font file"), { target: { files: [file] } });
    await waitFor(() => expect(onSelect).toHaveBeenCalledWith(font.family));
    expect(onUpload).toHaveBeenCalledWith(file);
  });
  it("keeps the previous font and shows an error when loading fails", async () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(<FontPicker isOpen onClose={onClose} selectedFontFamily="Inter" onSelect={onSelect} customFonts={[]} onUpload={vi.fn().mockRejectedValue(new Error("Invalid font file"))} />);
    fireEvent.change(screen.getByLabelText("Upload font file"), { target: { files: [new File(["bad"], "bad.ttf")] } });
    await waitFor(() => expect(screen.getByRole("alert").textContent).toBe("Invalid font file"));
    expect(onSelect).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
