import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { loadGoogleFonts } from "../lib/google-fonts";
import { EditorProvider } from "../context/EditorContext";
import { EditorLayout } from "../components/EditorLayout";
import { LanguageProvider } from "../context/LanguageContext";

const RouteComponent = () => {
  useEffect(() => {
    loadGoogleFonts();
  }, []);

  return (
    <LanguageProvider>
      <EditorProvider>
        <EditorLayout />
      </EditorProvider>
    </LanguageProvider>
  );
};

export const Route = createFileRoute("/")({
  component: RouteComponent,
});
