import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type {
  DeviceSpec,
  DeviceColor,
  DeviceInstance,
  ExportSize,
  Screenshot,
  ImageOverlay,
  ShadowConfig,
  Project,
  SelectedElement,
  TextLayer,
  TextLayerType,
  CustomFont,
} from "../types";
import { devices, exportSizes, gradientPresets } from "../constants";
import { exportScreenshots } from "../lib/export-utils";
import {
  cloneDeviceInstance,
  createDeviceInstance,
  ensureDeviceInstances,
  getDeviceColorById,
  getDeviceSpecById,
  replaceDeviceScreenshot,
} from "../lib/device-instances";
import {
  loadPersistedState,
  useEditorPersistence,
  clearPersistedState,
  CURRENT_VERSION,
  type PersistedEditorState,
} from "../lib/useLocalStorage";
import { loadIndexedDbState } from "../lib/indexed-db-persistence";
import { moveByOffset, reorderById } from "../lib/screenshot-order";
import { copyProjectContent } from "../lib/project-copy";
import { createCustomFont, loadCustomFont, normalizeCustomFonts } from "../lib/custom-fonts";
import {
  createTextLayer,
  ensureTextLayers,
  withTextLayers,
} from "../lib/text-layers";

const HISTORY_LIMIT = 100;
const HISTORY_COALESCE_DELAY = 300;

type EditorHistorySnapshot = {
  screenshots: Screenshot[];
  activeScreenshotId: string;
  headlineFontSize: number;
  subheadlineFontSize: number;
};

type EditorHistory = {
  past: EditorHistorySnapshot[];
  current: EditorHistorySnapshot;
  future: EditorHistorySnapshot[];
  isCoalescing: boolean;
};

const isNativeUndoTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  if (target.closest("[contenteditable='true']")) return true;
  if (target instanceof HTMLTextAreaElement) return true;
  if (!(target instanceof HTMLInputElement)) return false;

  return ![
    "button",
    "checkbox",
    "color",
    "file",
    "radio",
    "range",
    "reset",
    "submit",
  ].includes(target.type);
};

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

interface EditorContextType {
  // Project state
  projects: Project[];
  activeProjectId: string;
  activeProject: Project;
  createProject: (name: string) => void;
  renameProject: (id: string, name: string) => void;
  deleteProject: (id: string) => void;
  switchProject: (id: string) => void;
  copyProjectInto: (sourceId: string, destinationId: string) => void;
  exportWorkspaceBackup: () => void;
  importWorkspaceBackup: (file: File) => Promise<number>;
  customFonts: CustomFont[];
  uploadCustomFont: (file: File) => Promise<string>;

  // State
  isFontPickerOpen: boolean;
  setIsFontPickerOpen: (open: boolean) => void;
  isStarModalOpen: boolean;
  setIsStarModalOpen: (open: boolean) => void;
  selectedDeviceId: string;
  setSelectedDeviceId: (id: string) => void;
  selectedColorId: string;
  setSelectedColorId: (id: string) => void;
  exportSizeId: string;
  setExportSizeId: (id: string) => void;
  screenshots: Screenshot[];
  setScreenshots: (screenshots: Screenshot[]) => void;
  reorderScreenshots: (sourceId: string, targetId: string) => void;
  moveScreenshot: (id: string, offset: number) => void;
  activeScreenshotId: string;
  setActiveScreenshotId: (id: string) => void;
  selectedElement: SelectedElement | null;
  setSelectedElement: (element: SelectedElement | null) => void;
  isDragging: boolean;
  headlineFontSize: number;
  setHeadlineFontSize: (size: number) => void;
  subheadlineFontSize: number;
  setSubheadlineFontSize: (size: number) => void;
  previewDimensions: { width: number; height: number };
  setPreviewDimensions: (dim: { width: number; height: number }) => void;

  // Refs
  previewRef: React.RefObject<HTMLDivElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  canvasContainerRef: React.RefObject<HTMLDivElement | null>;
  overlayImageInputRef: React.RefObject<HTMLInputElement | null>;

  // Derived
  selectedDevice: DeviceSpec;
  selectedColor: DeviceColor;
  activeScreenshot: Screenshot;
  activeDevice: DeviceInstance | null;
  exportSize: ExportSize;

  // Actions
  updateActiveScreenshot: (updates: Partial<Screenshot>) => void;
  addTextLayer: (type: TextLayerType) => void;
  updateTextLayer: (id: string, updates: Partial<TextLayer>) => void;
  removeTextLayer: (id: string) => void;
  addScreenshot: () => void;
  importFinishedScreenshots: (files: File[]) => Promise<number>;
  removeScreenshot: (id: string) => void;
  handleElementMouseDown: (
    e: React.MouseEvent,
    type: "headline" | "subheadline" | "image" | "device",
    screenshotId: string,
    id?: string,
  ) => void;
  handleElementMouseMove: (e: MouseEvent) => void;
  handleElementMouseUp: () => void;
  addOverlayImage: (file: File) => void;
  removeOverlayImage: (imageId: string) => void;
  updateOverlayImageSize: (imageId: string, widthPercent: number) => void;
  updateOverlayImageLayer: (imageId: string, layer: "behind" | "front") => void;
  updateOverlayImageRotation: (imageId: string, rotation: number) => void;
  updateOverlayImageShadow: (
    imageId: string,
    shadow: Partial<ShadowConfig>,
  ) => void;
  addDevice: () => void;
  selectDevice: (deviceId: string) => void;
  removeDevice: (deviceId: string) => void;
  bringDeviceForward: (deviceId: string) => void;
  sendDeviceBackward: (deviceId: string) => void;
  bringImageForward: (imageId: string) => void;
  sendImageBackward: (imageId: string) => void;
  bringImageToFront: (imageId: string) => void;
  sendImageToBack: (imageId: string) => void;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleExport: (screenshotId?: string) => Promise<void>;
  isExporting: boolean;
  getBackgroundStyle: (screenshot: Screenshot) => string;
  resetEditor: () => void;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

type LegacyScreenshotFields = {
  screenshotSrc?: string | null;
  deviceScale?: number;
  deviceOffsetY?: number;
  deviceRotation?: number;
  deviceShadow?: ShadowConfig;
  deviceStyle?: "flat" | "3d";
  device3dRotateY?: number;
  device3dRotateX?: number;
};

// Default screenshot for new editors
const createDefaultScreenshot = (
  defaultDeviceId: string = devices[0].id,
  defaultColorId: string = devices[0].colors[0].id,
): Screenshot => {
  const defaultDevice = createDeviceInstance({
    deviceId: defaultDeviceId,
    colorId: defaultColorId,
  });
  const headline = createTextLayer("headline", {
    content: "Showcase Your App",
    x: 50,
    y: 10,
    width: 80,
  });
  const subheadline = createTextLayer("subheadline", {
    content:
      "Create stunning App Store screenshots in minutes. Customizable templates, devices, and backgrounds.",
    x: 50,
    y: 18,
    width: 80,
  });

  return {
    id: generateId(),
    textLayers: [headline, subheadline],
    headline: headline.content,
    subheadline: subheadline.content,
    backgroundColor: "#8b5cf6",
    backgroundMode: "solid",
    gradientPresetId: null,
    textColor: "#ffffff",
    headlineX: 50,
    headlineY: 10,
    headlineWidth: 80,
    subheadlineX: 50,
    subheadlineY: 18,
    subheadlineWidth: 80,
    fontFamily: "Inter",
    overlayImages: [],
    devices: [defaultDevice],
    activeDeviceId: defaultDevice.id,
  };
};

const normalizeScreenshot = (
  screenshot: Partial<Screenshot> & LegacyScreenshotFields,
  fallbackDeviceId: string,
  fallbackColorId: string,
): Screenshot => {
  const {
    screenshotSrc: _legacyScreenshotSrc,
    deviceScale: _legacyDeviceScale,
    deviceOffsetY: _legacyDeviceOffsetY,
    deviceRotation: _legacyDeviceRotation,
    deviceShadow: _legacyDeviceShadow,
    deviceStyle: _legacyDeviceStyle,
    device3dRotateY: _legacyDevice3dRotateY,
    device3dRotateX: _legacyDevice3dRotateX,
    ...rest
  } = screenshot;
  const baseScreenshot = createDefaultScreenshot(fallbackDeviceId, fallbackColorId);
  const { devices: deviceInstances, activeDeviceId } = ensureDeviceInstances(
    screenshot,
    fallbackDeviceId,
    fallbackColorId,
  );

  const normalizedScreenshot: Screenshot = {
    ...baseScreenshot,
    ...rest,
    overlayImages: screenshot.overlayImages ?? [],
    devices: deviceInstances,
    activeDeviceId,
  };
  return withTextLayers(
    normalizedScreenshot,
    ensureTextLayers({
      ...normalizedScreenshot,
      textLayers: screenshot.textLayers,
    }),
  );
};

const normalizeProject = (project: Project): Project => {
  const fallbackDeviceId = project.selectedDeviceId ?? devices[0].id;
  const fallbackColorId =
    project.selectedColorId ?? getDeviceSpecById(fallbackDeviceId).colors[0].id;
  const normalizedScreenshots = project.screenshots.map((screenshot) =>
    normalizeScreenshot(screenshot, fallbackDeviceId, fallbackColorId),
  );

  return {
    ...project,
    selectedDeviceId: fallbackDeviceId,
    selectedColorId: fallbackColorId,
    screenshots: normalizedScreenshots,
    activeScreenshotId:
      normalizedScreenshots.find((s) => s.id === project.activeScreenshotId)?.id ??
      normalizedScreenshots[0].id,
  };
};

// Create a default project
const createDefaultProject = (name: string = "My Project"): Project => {
  const defaultDeviceId = devices[0].id;
  const defaultColorId = devices[0].colors[0].id;
  const defaultScreenshot = createDefaultScreenshot(defaultDeviceId, defaultColorId);
  return {
    id: generateId(),
    name,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    screenshots: [defaultScreenshot],
    selectedDeviceId: defaultDeviceId,
    selectedColorId: defaultColorId,
    exportSizeId: exportSizes[0].id,
    activeScreenshotId: defaultScreenshot.id,
    headlineFontSize: 72,
    subheadlineFontSize: 42,
  };
};

// Load persisted state once on module load
const persistedState = loadPersistedState();

// Initialize projects from persisted state or create default
const getInitialProjects = (): Project[] => {
  if (persistedState?.projects && persistedState.projects.length > 0) {
    return persistedState.projects.map(normalizeProject);
  }
  return [createDefaultProject()];
};

const getInitialActiveProjectId = (projects: Project[]): string => {
  if (persistedState?.activeProjectId) {
    // Verify the project exists
    const exists = projects.some((p) => p.id === persistedState.activeProjectId);
    if (exists) return persistedState.activeProjectId;
  }
  return projects[0]?.id || generateId();
};

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error(`Could not read ${file.name}`));
    reader.onerror = () => reject(reader.error ?? new Error(`Could not read ${file.name}`));
    reader.readAsDataURL(file);
  });

const getUniqueProjectName = (name: string, existingNames: Set<string>) => {
  if (!existingNames.has(name)) return name;
  let index = 1;
  let candidate = `${name} (Imported)`;
  while (existingNames.has(candidate)) {
    index += 1;
    candidate = `${name} (Imported ${index})`;
  }
  return candidate;
};

export const EditorProvider = ({ children }: { children: ReactNode }) => {
  // Project state
  const [projects, setProjects] = useState<Project[]>(getInitialProjects);
  const [activeProjectId, setActiveProjectId] = useState(() =>
    getInitialActiveProjectId(projects),
  );

  // Get active project
  const activeProject =
    projects.find((p) => p.id === activeProjectId) || projects[0];

  // Initialize state from persisted values or defaults
  const [isFontPickerOpen, setIsFontPickerOpen] = useState(false);
  const [isStarModalOpen, setIsStarModalOpen] = useState(false);
  const [selectedDeviceId, setSelectedDeviceIdState] = useState(
    activeProject.selectedDeviceId,
  );
  const [selectedColorId, setSelectedColorIdState] = useState(
    activeProject.selectedColorId,
  );
  const [exportSizeId, setExportSizeIdState] = useState(
    activeProject.exportSizeId,
  );
  const [screenshots, setScreenshotsState] = useState<Screenshot[]>(
    activeProject.screenshots,
  );
  const [activeScreenshotId, setActiveScreenshotIdState] = useState(
    activeProject.activeScreenshotId,
  );
  const [headlineFontSize, setHeadlineFontSizeState] = useState(
    activeProject.headlineFontSize,
  );
  const [subheadlineFontSize, setSubheadlineFontSizeState] = useState(
    activeProject.subheadlineFontSize,
  );
  const [isPersistenceReady, setIsPersistenceReady] = useState(false);
  const [customFonts, setCustomFonts] = useState<CustomFont[]>(() =>
    normalizeCustomFonts(persistedState?.customFonts),
  );
  const [isExporting, setIsExporting] = useState(false);
  const exportInProgress = useRef(false);

  useEffect(() => {
    for (const font of customFonts) {
      void loadCustomFont(font).catch((error) => {
        console.error(`Could not load custom font ${font.name}:`, error);
      });
    }
  }, [customFonts]);

  const uploadCustomFont = async (file: File) => {
    const font = await createCustomFont(file);
    setCustomFonts((current) => current.some((item) => item.family === font.family)
      ? current : [...current, font]);
    return font.family;
  };

  const createHistorySnapshot = useCallback(
    (): EditorHistorySnapshot => ({
      screenshots,
      activeScreenshotId,
      headlineFontSize,
      subheadlineFontSize,
    }),
    [
      activeScreenshotId,
      headlineFontSize,
      screenshots,
      subheadlineFontSize,
    ],
  );

  const historyRef = useRef<EditorHistory>({
    past: [],
    current: {
      screenshots,
      activeScreenshotId,
      headlineFontSize,
      subheadlineFontSize,
    },
    future: [],
    isCoalescing: false,
  });
  const historyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isApplyingHistoryRef = useRef(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(
    null,
  );

  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragStartElementPos = useRef({ x: 0, y: 0 });
  const dragContainerSize = useRef({ width: 0, height: 0 });
  const rafId = useRef<number | null>(null);
  const pendingUpdate = useRef<{ x: number; y: number } | null>(null);

  const overlayImageInputRef = useRef<HTMLInputElement>(null);

  const [previewDimensions, setPreviewDimensions] = useState({
    width: 0,
    height: 0,
  });

  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const syncHistoryAvailability = useCallback(() => {
    setCanUndo(historyRef.current.past.length > 0);
    setCanRedo(historyRef.current.future.length > 0);
  }, []);

  const closeHistoryGroup = useCallback(() => {
    if (historyTimerRef.current) {
      clearTimeout(historyTimerRef.current);
      historyTimerRef.current = null;
    }
    historyRef.current.isCoalescing = false;
  }, []);

  const resetHistory = useCallback(
    (snapshot: EditorHistorySnapshot) => {
      closeHistoryGroup();
      historyRef.current = {
        past: [],
        current: snapshot,
        future: [],
        isCoalescing: false,
      };
      setCanUndo(false);
      setCanRedo(false);
    },
    [closeHistoryGroup],
  );

  useEffect(() => {
    let cancelled = false;

    void loadIndexedDbState()
      .then((indexedState) => {
        if (cancelled) return;
        const localLastSaved = persistedState?.lastSaved ?? 0;
        if (
          indexedState?.projects?.length &&
          indexedState.lastSaved > localLastSaved
        ) {
          const recoveredProjects = indexedState.projects.map(normalizeProject);
          const recoveredActive =
            recoveredProjects.find(
              (project) => project.id === indexedState.activeProjectId,
            ) ?? recoveredProjects[0];

          setProjects(recoveredProjects);
          setCustomFonts(normalizeCustomFonts(indexedState.customFonts));
          setActiveProjectId(recoveredActive.id);
          setSelectedDeviceIdState(recoveredActive.selectedDeviceId);
          setSelectedColorIdState(recoveredActive.selectedColorId);
          setExportSizeIdState(recoveredActive.exportSizeId);
          setScreenshotsState(recoveredActive.screenshots);
          setActiveScreenshotIdState(recoveredActive.activeScreenshotId);
          setHeadlineFontSizeState(recoveredActive.headlineFontSize);
          setSubheadlineFontSizeState(recoveredActive.subheadlineFontSize);
          setSelectedElement(null);
          isApplyingHistoryRef.current = true;
          resetHistory({
            screenshots: recoveredActive.screenshots,
            activeScreenshotId: recoveredActive.activeScreenshotId,
            headlineFontSize: recoveredActive.headlineFontSize,
            subheadlineFontSize: recoveredActive.subheadlineFontSize,
          });
        }
        setIsPersistenceReady(true);
      })
      .catch((error) => {
        console.error("Failed to recover editor state from IndexedDB:", error);
        if (!cancelled) setIsPersistenceReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [resetHistory]);

  const restoreHistorySnapshot = useCallback(
    (snapshot: EditorHistorySnapshot) => {
      isApplyingHistoryRef.current = true;
      setScreenshotsState(snapshot.screenshots);
      setActiveScreenshotIdState(snapshot.activeScreenshotId);
      setHeadlineFontSizeState(snapshot.headlineFontSize);
      setSubheadlineFontSizeState(snapshot.subheadlineFontSize);
      setSelectedElement(null);

      const active =
        snapshot.screenshots.find(
          (screenshot) => screenshot.id === snapshot.activeScreenshotId,
        ) ?? snapshot.screenshots[0];
      const activeDevice =
        active?.devices.find((device) => device.id === active.activeDeviceId) ??
        active?.devices[0];
      if (activeDevice) {
        setSelectedDeviceIdState(activeDevice.deviceId);
        setSelectedColorIdState(activeDevice.colorId);
      }
    },
    [],
  );

  const undo = useCallback(() => {
    closeHistoryGroup();
    const history = historyRef.current;
    const previous = history.past.at(-1);
    if (!previous) return;

    history.past = history.past.slice(0, -1);
    history.future = [history.current, ...history.future];
    history.current = previous;
    restoreHistorySnapshot(previous);
    syncHistoryAvailability();
  }, [closeHistoryGroup, restoreHistorySnapshot, syncHistoryAvailability]);

  const redo = useCallback(() => {
    closeHistoryGroup();
    const history = historyRef.current;
    const next = history.future[0];
    if (!next) return;

    history.future = history.future.slice(1);
    history.past = [...history.past, history.current].slice(-HISTORY_LIMIT);
    history.current = next;
    restoreHistorySnapshot(next);
    syncHistoryAvailability();
  }, [closeHistoryGroup, restoreHistorySnapshot, syncHistoryAvailability]);

  useEffect(() => {
    const nextSnapshot = createHistorySnapshot();
    const history = historyRef.current;

    if (isApplyingHistoryRef.current) {
      isApplyingHistoryRef.current = false;
      history.current = nextSnapshot;
      return;
    }

    const designChanged =
      history.current.screenshots !== nextSnapshot.screenshots ||
      history.current.headlineFontSize !== nextSnapshot.headlineFontSize ||
      history.current.subheadlineFontSize !== nextSnapshot.subheadlineFontSize;

    if (!designChanged) {
      history.current = nextSnapshot;
      return;
    }

    if (!history.isCoalescing) {
      history.past = [...history.past, history.current].slice(-HISTORY_LIMIT);
    }
    history.current = nextSnapshot;
    history.future = [];
    history.isCoalescing = true;

    if (historyTimerRef.current) clearTimeout(historyTimerRef.current);
    historyTimerRef.current = setTimeout(() => {
      historyRef.current.isCoalescing = false;
      historyTimerRef.current = null;
    }, HISTORY_COALESCE_DELAY);

    syncHistoryAvailability();
  }, [createHistorySnapshot, syncHistoryAvailability]);

  useEffect(
    () => () => {
      if (historyTimerRef.current) clearTimeout(historyTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isNativeUndoTarget(event.target)) return;
      if (!event.metaKey && !event.ctrlKey) return;

      const key = event.key.toLowerCase();
      if (key === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      } else if (key === "y" && event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [redo, undo]);

  // Sync project state when local state changes
  const updateProjectState = useCallback(() => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProjectId
          ? {
              ...p,
              screenshots,
              selectedDeviceId,
              selectedColorId,
              exportSizeId,
              activeScreenshotId,
              headlineFontSize,
              subheadlineFontSize,
              updatedAt: Date.now(),
            }
          : p,
      ),
    );
  }, [
    activeProjectId,
    screenshots,
    selectedDeviceId,
    selectedColorId,
    exportSizeId,
    activeScreenshotId,
    headlineFontSize,
    subheadlineFontSize,
  ]);

  // Update project whenever state changes
  useEffect(() => {
    updateProjectState();
  }, [updateProjectState]);

  // Auto-save projects to localStorage
  useEditorPersistence({
    projects,
    activeProjectId,
    customFonts,
    enabled: isPersistenceReady,
  });

  // Wrapper functions that update both local state and project
  const setSelectedDeviceId = (id: string) => {
    setSelectedDeviceIdState(id);
    const nextColorId = getDeviceColorById(id, selectedColorId).id;
    setSelectedColorIdState(nextColorId);
    setScreenshotsState((prev) =>
      prev.map((screenshot) =>
        screenshot.id === activeScreenshotId
          ? {
              ...screenshot,
              devices: screenshot.devices.map((device) =>
                device.id === screenshot.activeDeviceId
                  ? { ...device, deviceId: id, colorId: nextColorId }
                  : device,
              ),
            }
          : screenshot,
      ),
    );
  };
  const setSelectedColorId = (id: string) => {
    setSelectedColorIdState(id);
    setScreenshotsState((prev) =>
      prev.map((screenshot) =>
        screenshot.id === activeScreenshotId
          ? {
              ...screenshot,
              devices: screenshot.devices.map((device) =>
                device.id === screenshot.activeDeviceId
                  ? { ...device, colorId: id }
                  : device,
              ),
            }
          : screenshot,
      ),
    );
  };
  const setExportSizeId = (id: string) => {
    setExportSizeIdState(id);
  };
  const setScreenshots = (newScreenshots: Screenshot[]) => {
    setScreenshotsState(newScreenshots);
  };
  const reorderScreenshots = (sourceId: string, targetId: string) => {
    setScreenshotsState((current) => reorderById(current, sourceId, targetId));
  };
  const moveScreenshot = (id: string, offset: number) => {
    setScreenshotsState((current) => moveByOffset(current, id, offset));
  };
  const setActiveScreenshotId = (id: string) => {
    setActiveScreenshotIdState(id);
  };
  const setHeadlineFontSize = (size: number) => {
    setHeadlineFontSizeState(size);
  };
  const setSubheadlineFontSize = (size: number) => {
    setSubheadlineFontSizeState(size);
  };

  // Project management functions
  const createProject = (name: string) => {
    const newProject = createDefaultProject(name);
    setProjects((prev) => [...prev, newProject]);
    switchProject(newProject.id);
  };

  const renameProject = (id: string, name: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, name, updatedAt: Date.now() } : p,
      ),
    );
  };

  const deleteProject = (id: string) => {
    // Don't delete the last project
    if (projects.length <= 1) return;

    setProjects((prev) => prev.filter((p) => p.id !== id));

    // If deleting active project, switch to another
    if (id === activeProjectId) {
      const remaining = projects.filter((p) => p.id !== id);
      if (remaining.length > 0) {
        switchProject(remaining[0].id);
      }
    }
  };

  const switchProject = (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (!project) return;

    setActiveProjectId(id);
    setSelectedDeviceIdState(project.selectedDeviceId);
    setSelectedColorIdState(project.selectedColorId);
    setExportSizeIdState(project.exportSizeId);
    setScreenshotsState(project.screenshots);
    setActiveScreenshotIdState(project.activeScreenshotId);
    setHeadlineFontSizeState(project.headlineFontSize);
    setSubheadlineFontSizeState(project.subheadlineFontSize);
    setSelectedElement(null);
    isApplyingHistoryRef.current = true;
    resetHistory({
      screenshots: project.screenshots,
      activeScreenshotId: project.activeScreenshotId,
      headlineFontSize: project.headlineFontSize,
      subheadlineFontSize: project.subheadlineFontSize,
    });
  };

  const copyProjectInto = (sourceId: string, destinationId: string) => {
    if (sourceId === destinationId) return;

    const storedSource = projects.find((project) => project.id === sourceId);
    const destination = projects.find(
      (project) => project.id === destinationId,
    );
    if (!storedSource || !destination) return;

    const source =
      sourceId === activeProjectId
        ? {
            ...storedSource,
            screenshots,
            selectedDeviceId,
            selectedColorId,
            exportSizeId,
            activeScreenshotId,
            headlineFontSize,
            subheadlineFontSize,
          }
        : storedSource;
    const copiedProject = copyProjectContent(source, destination);

    setProjects((current) =>
      current.map((project) =>
        project.id === destinationId ? copiedProject : project,
      ),
    );
    setActiveProjectId(destinationId);
    setSelectedDeviceIdState(copiedProject.selectedDeviceId);
    setSelectedColorIdState(copiedProject.selectedColorId);
    setExportSizeIdState(copiedProject.exportSizeId);
    setScreenshotsState(copiedProject.screenshots);
    setActiveScreenshotIdState(copiedProject.activeScreenshotId);
    setHeadlineFontSizeState(copiedProject.headlineFontSize);
    setSubheadlineFontSizeState(copiedProject.subheadlineFontSize);
    setSelectedElement(null);
    isApplyingHistoryRef.current = true;
    resetHistory({
      screenshots: copiedProject.screenshots,
      activeScreenshotId: copiedProject.activeScreenshotId,
      headlineFontSize: copiedProject.headlineFontSize,
      subheadlineFontSize: copiedProject.subheadlineFontSize,
    });
  };

  const getCurrentProjects = () =>
    projects.map((project) =>
      project.id === activeProjectId
        ? {
            ...project,
            screenshots,
            selectedDeviceId,
            selectedColorId,
            exportSizeId,
            activeScreenshotId,
            headlineFontSize,
            subheadlineFontSize,
            updatedAt: Date.now(),
          }
        : project,
    );

  const exportWorkspaceBackup = () => {
    const backup: PersistedEditorState & { format: string } = {
      format: "appshots-workspace-backup",
      version: CURRENT_VERSION,
      projects: getCurrentProjects(),
      activeProjectId,
      lastSaved: Date.now(),
      customFonts,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `appshots-workspace-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const importWorkspaceBackup = async (file: File): Promise<number> => {
    const raw = JSON.parse(await file.text()) as Partial<PersistedEditorState> & {
      format?: string;
    };
    if (!Array.isArray(raw.projects)) {
      throw new Error("This file is not an AppShots workspace backup.");
    }

    const candidates = raw.projects.filter(
      (project): project is Project =>
        Boolean(
          project &&
            typeof project.id === "string" &&
            typeof project.name === "string" &&
            Array.isArray(project.screenshots) &&
            project.screenshots.length > 0,
        ),
    );
    if (candidates.length === 0) {
      throw new Error("The backup does not contain any usable projects.");
    }

    const existingNames = new Set(projects.map((project) => project.name));
    const importedProjects = candidates.map((project) => {
      const name = getUniqueProjectName(project.name, existingNames);
      existingNames.add(name);
      return normalizeProject({
        ...project,
        id: generateId(),
        name,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    });
    const first = importedProjects[0];

    const importedFonts = normalizeCustomFonts(raw.customFonts);
    await Promise.all(importedFonts.map(loadCustomFont));
    setCustomFonts((current) => {
      const families = new Set(current.map((font) => font.family));
      return [...current, ...importedFonts.filter((font) => !families.has(font.family))];
    });

    setProjects((current) => [...current, ...importedProjects]);
    setActiveProjectId(first.id);
    setSelectedDeviceIdState(first.selectedDeviceId);
    setSelectedColorIdState(first.selectedColorId);
    setExportSizeIdState(first.exportSizeId);
    setScreenshotsState(first.screenshots);
    setActiveScreenshotIdState(first.activeScreenshotId);
    setHeadlineFontSizeState(first.headlineFontSize);
    setSubheadlineFontSizeState(first.subheadlineFontSize);
    setSelectedElement(null);
    isApplyingHistoryRef.current = true;
    resetHistory({
      screenshots: first.screenshots,
      activeScreenshotId: first.activeScreenshotId,
      headlineFontSize: first.headlineFontSize,
      subheadlineFontSize: first.subheadlineFontSize,
    });
    return importedProjects.length;
  };

  const selectedDevice =
    getDeviceSpecById(selectedDeviceId);
  const selectedColor =
    getDeviceColorById(selectedDevice.id, selectedColorId);
  const activeScreenshot =
    screenshots.find((s) => s.id === activeScreenshotId) || screenshots[0];
  const activeDevice =
    activeScreenshot.devices.find(
      (device) => device.id === activeScreenshot.activeDeviceId,
    ) ?? activeScreenshot.devices[0] ?? null;
  const exportSize =
    exportSizes.find((s) => s.id === exportSizeId) || exportSizes[0];

  const updateScreenshotById = useCallback(
    (screenshotId: string, updates: Partial<Screenshot>) => {
      setScreenshotsState((prev) =>
        prev.map((s) => (s.id === screenshotId ? { ...s, ...updates } : s)),
      );
    },
    [],
  );

  const updateActiveScreenshot = useCallback(
    (updates: Partial<Screenshot>) => {
      updateScreenshotById(activeScreenshotId, updates);
    },
    [activeScreenshotId, updateScreenshotById],
  );

  const updateTextLayerByScreenshotId = useCallback(
    (
      screenshotId: string,
      textLayerId: string,
      updates: Partial<TextLayer>,
    ) => {
      setScreenshotsState((current) =>
        current.map((screenshot) => {
          if (screenshot.id !== screenshotId) return screenshot;
          const textLayers = screenshot.textLayers.map((layer) =>
            layer.id === textLayerId ? { ...layer, ...updates } : layer,
          );
          return withTextLayers(screenshot, textLayers);
        }),
      );
    },
    [],
  );

  const addTextLayer = (type: TextLayerType) => {
    let nextY = type === "headline" ? 10 : 18;
    while (
      nextY < 82 &&
      activeScreenshot.textLayers.some(
        (layer) => Math.abs(layer.y - nextY) < 9,
      )
    ) {
      nextY += 10;
    }
    const layer = createTextLayer(type, {
      y: Math.min(nextY, 82),
    });
    setScreenshotsState((current) =>
      current.map((screenshot) =>
        screenshot.id === activeScreenshotId
          ? withTextLayers(screenshot, [...screenshot.textLayers, layer])
          : screenshot,
      ),
    );
    setSelectedElement({
      type,
      id: layer.id,
      screenshotId: activeScreenshotId,
    });
  };

  const updateTextLayer = (id: string, updates: Partial<TextLayer>) => {
    updateTextLayerByScreenshotId(activeScreenshotId, id, updates);
  };

  const removeTextLayer = (id: string) => {
    setScreenshotsState((current) =>
      current.map((screenshot) =>
        screenshot.id === activeScreenshotId
          ? withTextLayers(
              screenshot,
              screenshot.textLayers.filter((layer) => layer.id !== id),
            )
          : screenshot,
      ),
    );
    if (
      selectedElement?.screenshotId === activeScreenshotId &&
      selectedElement.id === id
    ) {
      setSelectedElement(null);
    }
  };

  useEffect(() => {
    if (!activeDevice) return;
    if (selectedDeviceId !== activeDevice.deviceId) {
      setSelectedDeviceIdState(activeDevice.deviceId);
    }
    if (selectedColorId !== activeDevice.colorId) {
      setSelectedColorIdState(activeDevice.colorId);
    }
    if (activeScreenshot.activeDeviceId !== activeDevice.id) {
      updateActiveScreenshot({ activeDeviceId: activeDevice.id });
    }
  }, [
    activeDevice,
    activeScreenshot.activeDeviceId,
    selectedColorId,
    selectedDeviceId,
    updateActiveScreenshot,
  ]);

  const addScreenshot = () => {
    const headline = createTextLayer("headline", { content: "New Screenshot" });
    const subheadline = createTextLayer("subheadline", {
      content: "Add your description here",
    });
    const clonedDevices = activeScreenshot.devices.map((device) =>
      cloneDeviceInstance(device, { id: generateId() }),
    );
    const newScreenshot: Screenshot = {
      id: generateId(),
      textLayers: [headline, subheadline],
      headline: headline.content,
      subheadline: subheadline.content,
      backgroundColor: activeScreenshot.backgroundColor,
      backgroundMode: activeScreenshot.backgroundMode,
      gradientPresetId: activeScreenshot.gradientPresetId,
      textColor: activeScreenshot.textColor,
      headlineX: 50,
      headlineY: 10,
      headlineWidth: 80,
      subheadlineX: 50,
      subheadlineY: 18,
      subheadlineWidth: 80,
      fontFamily: activeScreenshot.fontFamily,
      overlayImages: [],
      devices: clonedDevices,
      activeDeviceId: clonedDevices[0]?.id ?? null,
    };
    setScreenshots([...screenshots, newScreenshot]);
    setActiveScreenshotId(newScreenshot.id);
  };

  const importFinishedScreenshots = async (files: File[]): Promise<number> => {
    const sortedFiles = [...files]
      .filter((file) => file.type.startsWith("image/"))
      .sort((left, right) =>
        left.name.localeCompare(right.name, undefined, { numeric: true }),
      );
    if (sortedFiles.length === 0) return 0;

    const sources = await Promise.all(sortedFiles.map(readFileAsDataUrl));
    const imported = sources.map((src): Screenshot => ({
      id: generateId(),
      textLayers: [],
      headline: "",
      subheadline: "",
      backgroundColor: "#000000",
      backgroundMode: "solid",
      gradientPresetId: null,
      textColor: "#ffffff",
      headlineX: 50,
      headlineY: 10,
      headlineWidth: 80,
      subheadlineX: 50,
      subheadlineY: 18,
      subheadlineWidth: 80,
      fontFamily: activeScreenshot.fontFamily,
      overlayImages: [
        {
          id: generateId(),
          src,
          x: 50,
          y: 50,
          width: 100,
          height: 100,
          layer: "front",
          rotation: 0,
          shadow: {
            enabled: false,
            color: "#000000",
            blur: 0,
            offsetX: 0,
            offsetY: 0,
          },
        },
      ],
      devices: [],
      activeDeviceId: null,
    }));

    setScreenshotsState((current) => [...current, ...imported]);
    setActiveScreenshotIdState(imported.at(-1)?.id ?? activeScreenshotId);
    setSelectedElement(null);
    return imported.length;
  };

  const handleElementMouseDown = (
    e: React.MouseEvent,
    type: "headline" | "subheadline" | "image" | "device",
    screenshotId: string,
    id?: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const screenshotElement = (e.currentTarget as HTMLElement).closest(
      "[data-screenshot-card='true']",
    );
    if (screenshotElement instanceof HTMLElement) {
      const rect = screenshotElement.getBoundingClientRect();
      dragContainerSize.current = { width: rect.width, height: rect.height };
    } else if (previewRef.current) {
      const rect = previewRef.current.getBoundingClientRect();
      dragContainerSize.current = { width: rect.width, height: rect.height };
    }

    const targetScreenshot =
      screenshots.find((screenshot) => screenshot.id === screenshotId) ??
      activeScreenshot;

    setIsDragging(true);
    setSelectedElement({ type, id, screenshotId });
    if (activeScreenshotId !== screenshotId) {
      setActiveScreenshotIdState(screenshotId);
    }
    dragStartPos.current = { x: e.clientX, y: e.clientY };

    if (type === "device" && id) {
      updateScreenshotById(screenshotId, { activeDeviceId: id });
      const device = targetScreenshot.devices.find((item) => item.id === id);
      if (device) {
        dragStartElementPos.current = { x: device.x, y: device.y };
      }
    } else if ((type === "headline" || type === "subheadline") && id) {
      const textLayer = targetScreenshot.textLayers.find(
        (layer) => layer.id === id,
      );
      if (textLayer) {
        dragStartElementPos.current = { x: textLayer.x, y: textLayer.y };
      }
    } else if (type === "image" && id) {
      const image = targetScreenshot.overlayImages.find((img) => img.id === id);
      if (image) {
        dragStartElementPos.current = { x: image.x, y: image.y };
      }
    }
  };

  const applyDragUpdate = useCallback(() => {
    if (!pendingUpdate.current || !selectedElement) return;

    const { x: newX, y: newY } = pendingUpdate.current;

    if (
      (selectedElement.type === "headline" ||
        selectedElement.type === "subheadline") &&
      selectedElement.id
    ) {
      updateTextLayerByScreenshotId(
        selectedElement.screenshotId,
        selectedElement.id,
        { x: newX, y: newY },
      );
    } else if (selectedElement.type === "image" && selectedElement.id) {
      const targetScreenshot = screenshots.find(
        (screenshot) => screenshot.id === selectedElement.screenshotId,
      );
      if (!targetScreenshot) return;

      const updatedImages = targetScreenshot.overlayImages.map((img) =>
        img.id === selectedElement.id ? { ...img, x: newX, y: newY } : img,
      );
      updateScreenshotById(selectedElement.screenshotId, {
        overlayImages: updatedImages,
      });
    } else if (selectedElement.type === "device" && selectedElement.id) {
      const targetScreenshot = screenshots.find(
        (screenshot) => screenshot.id === selectedElement.screenshotId,
      );
      if (!targetScreenshot) return;

      const updatedDevices = targetScreenshot.devices.map((device) =>
        device.id === selectedElement.id ? { ...device, x: newX, y: newY } : device,
      );
      updateScreenshotById(selectedElement.screenshotId, {
        devices: updatedDevices,
      });
    }

    pendingUpdate.current = null;
    rafId.current = null;
  }, [
    screenshots,
    selectedElement,
    updateScreenshotById,
    updateTextLayerByScreenshotId,
  ]);

  const handleElementMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !selectedElement) return;

      const { width, height } = dragContainerSize.current;
      if (width === 0 || height === 0) return;

      const deltaX = ((e.clientX - dragStartPos.current.x) / width) * 100;
      const deltaY = ((e.clientY - dragStartPos.current.y) / height) * 100;

      const newX = dragStartElementPos.current.x + deltaX;
      const newY = dragStartElementPos.current.y + deltaY;

      pendingUpdate.current = { x: newX, y: newY };

      if (rafId.current === null) {
        rafId.current = requestAnimationFrame(applyDragUpdate);
      }
    },
    [isDragging, selectedElement, applyDragUpdate],
  );

  const handleElementMouseUp = useCallback(() => {
    setIsDragging(false);
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    if (pendingUpdate.current) {
      applyDragUpdate();
    }
  }, [applyDragUpdate]);

  // Set up global mouse listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleElementMouseMove);
      window.addEventListener("mouseup", handleElementMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleElementMouseMove);
      window.removeEventListener("mouseup", handleElementMouseUp);
    };
  }, [isDragging, handleElementMouseMove, handleElementMouseUp]);

  const addOverlayImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        const img = new Image();
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          const newImage: ImageOverlay = {
            id: generateId(),
            src: result,
            x: 50,
            y: 50,
            width: 30,
            height: 30 / aspectRatio,
            layer: "front",
            rotation: 0,
            shadow: {
              enabled: false,
              color: "#000000",
              blur: 20,
              offsetX: 0,
              offsetY: 10,
            },
          };
          updateActiveScreenshot({
            overlayImages: [...activeScreenshot.overlayImages, newImage],
          });
          setSelectedElement({
            type: "image",
            id: newImage.id,
            screenshotId: activeScreenshot.id,
          });
        };
        img.src = result;
      }
    };
    reader.readAsDataURL(file);
  };

  const removeOverlayImage = (imageId: string) => {
    const updatedImages = activeScreenshot.overlayImages.filter(
      (img) => img.id !== imageId,
    );
    updateActiveScreenshot({ overlayImages: updatedImages });
    if (
      selectedElement?.type === "image" &&
      selectedElement.screenshotId === activeScreenshot.id &&
      selectedElement.id === imageId
    ) {
      setSelectedElement(null);
    }
  };

  const updateOverlayImageSize = (imageId: string, widthPercent: number) => {
    const image = activeScreenshot.overlayImages.find(
      (img) => img.id === imageId,
    );
    if (!image) return;

    // Use current dimensions to maintain aspect ratio without reloading image
    const aspectRatio = image.width / image.height;

    const updatedImages = activeScreenshot.overlayImages.map((item) =>
      item.id === imageId
        ? {
            ...item,
            width: widthPercent,
            height: widthPercent / aspectRatio,
          }
        : item,
    );
    updateActiveScreenshot({ overlayImages: updatedImages });
  };

  const updateOverlayImageLayer = (
    imageId: string,
    layer: "behind" | "front",
  ) => {
    const updatedImages = activeScreenshot.overlayImages.map((item) =>
      item.id === imageId ? { ...item, layer } : item,
    );
    updateActiveScreenshot({ overlayImages: updatedImages });
  };

  const updateOverlayImageRotation = (imageId: string, rotation: number) => {
    const updatedImages = activeScreenshot.overlayImages.map((item) =>
      item.id === imageId ? { ...item, rotation } : item,
    );
    updateActiveScreenshot({ overlayImages: updatedImages });
  };

  const updateOverlayImageShadow = (
    imageId: string,
    shadow: Partial<ShadowConfig>,
  ) => {
    const updatedImages = activeScreenshot.overlayImages.map((item) =>
      item.id === imageId
        ? { ...item, shadow: { ...item.shadow, ...shadow } }
        : item,
    );
    updateActiveScreenshot({ overlayImages: updatedImages });
  };

  const bringImageForward = (imageId: string) => {
    const images = [...activeScreenshot.overlayImages];
    const index = images.findIndex((img) => img.id === imageId);
    if (index !== -1 && index < images.length - 1) {
      const temp = images[index];
      images[index] = images[index + 1];
      images[index + 1] = temp;
      updateActiveScreenshot({ overlayImages: images });
    }
  };

  const sendImageBackward = (imageId: string) => {
    const images = [...activeScreenshot.overlayImages];
    const index = images.findIndex((img) => img.id === imageId);
    if (index > 0) {
      const temp = images[index];
      images[index] = images[index - 1];
      images[index - 1] = temp;
      updateActiveScreenshot({ overlayImages: images });
    }
  };

  const bringImageToFront = (imageId: string) => {
    const images = [...activeScreenshot.overlayImages];
    const index = images.findIndex((img) => img.id === imageId);
    if (index !== -1 && index < images.length - 1) {
      const [image] = images.splice(index, 1);
      images.push(image);
      updateActiveScreenshot({ overlayImages: images });
    }
  };

  const sendImageToBack = (imageId: string) => {
    const images = [...activeScreenshot.overlayImages];
    const index = images.findIndex((img) => img.id === imageId);
    if (index > 0) {
      const [image] = images.splice(index, 1);
      images.unshift(image);
      updateActiveScreenshot({ overlayImages: images });
    }
  };

  const addDevice = () => {
    const nextDevice = activeDevice
      ? cloneDeviceInstance(activeDevice, {
          id: generateId(),
          x: Math.min(activeDevice.x + 12, 88),
          y: Math.min(activeDevice.y + 4, 70),
        })
      : createDeviceInstance({
          deviceId: selectedDeviceId,
          colorId: selectedColorId,
        });

    updateActiveScreenshot({
      devices: [...activeScreenshot.devices, nextDevice],
      activeDeviceId: nextDevice.id,
    });
    setSelectedElement({
      type: "device",
      id: nextDevice.id,
      screenshotId: activeScreenshot.id,
    });
    setSelectedDeviceIdState(nextDevice.deviceId);
    setSelectedColorIdState(nextDevice.colorId);
  };

  const selectDevice = (deviceId: string) => {
    updateActiveScreenshot({ activeDeviceId: deviceId });
    setSelectedElement({
      type: "device",
      id: deviceId,
      screenshotId: activeScreenshot.id,
    });
  };

  const removeDevice = (deviceId: string) => {
    const nextDevices = activeScreenshot.devices.filter(
      (device) => device.id !== deviceId,
    );
    const nextActiveDeviceId =
      activeScreenshot.activeDeviceId === deviceId
        ? (nextDevices.at(-1)?.id ?? null)
        : activeScreenshot.activeDeviceId;

    updateActiveScreenshot({
      devices: nextDevices,
      activeDeviceId: nextActiveDeviceId,
    });

    if (
      selectedElement?.type === "device" &&
      selectedElement.screenshotId === activeScreenshot.id &&
      selectedElement.id === deviceId
    ) {
      setSelectedElement(
        nextActiveDeviceId
          ? {
              type: "device",
              id: nextActiveDeviceId,
              screenshotId: activeScreenshot.id,
            }
          : null,
      );
    }
  };

  const bringDeviceForward = (deviceId: string) => {
    const nextDevices = [...activeScreenshot.devices];
    const index = nextDevices.findIndex((device) => device.id === deviceId);
    if (index !== -1 && index < nextDevices.length - 1) {
      const temp = nextDevices[index];
      nextDevices[index] = nextDevices[index + 1];
      nextDevices[index + 1] = temp;
      updateActiveScreenshot({ devices: nextDevices });
    }
  };

  const sendDeviceBackward = (deviceId: string) => {
    const nextDevices = [...activeScreenshot.devices];
    const index = nextDevices.findIndex((device) => device.id === deviceId);
    if (index > 0) {
      const temp = nextDevices[index];
      nextDevices[index] = nextDevices[index - 1];
      nextDevices[index - 1] = temp;
      updateActiveScreenshot({ devices: nextDevices });
    }
  };

  const removeScreenshot = (id: string) => {
    if (screenshots.length <= 1) return;
    const newScreenshots = screenshots.filter((s) => s.id !== id);
    setScreenshots(newScreenshots);
    if (activeScreenshotId === id) {
      setActiveScreenshotId(newScreenshots[0].id);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !activeDevice) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        updateActiveScreenshot({
          devices: replaceDeviceScreenshot(
            activeScreenshot.devices,
            activeDevice.id,
            result,
          ),
        });
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const getBackgroundStyle = (screenshot: Screenshot) => {
    if (screenshot.backgroundMode === "gradient") {
      const preset =
        gradientPresets.find((p) => p.id === screenshot.gradientPresetId) ??
        gradientPresets[0];
      return `linear-gradient(180deg, ${preset.from}, ${preset.to})`;
    }
    return screenshot.backgroundColor;
  };

  const handleExport = async (screenshotId?: string) => {
    if (exportInProgress.current || !isPersistenceReady) return;
    exportInProgress.current = true;
    setIsExporting(true);
    try {
      if (previewDimensions.width <= 0 || previewDimensions.height <= 0) {
        throw new Error("Wait for the canvas to finish loading before exporting.");
      }
      const exportingScreens = screenshotId === undefined ? screenshots
        : screenshots.filter((screen) => screen.id === screenshotId);
      const families = new Set(exportingScreens.map((screen) => screen.fontFamily));
      await Promise.all(customFonts.filter((font) => families.has(font.family)).map(loadCustomFont));
      await exportScreenshots({
        screenshots,
        screenshotId,
        exportSize,
        previewDimensions,
        headlineFontSize,
        subheadlineFontSize,
      });
      setIsStarModalOpen(true);
    } catch (error) {
      window.alert(`Export failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      exportInProgress.current = false;
      setIsExporting(false);
    }
  };

  /**
   * Resets the editor to default state and clears localStorage
   */
  const resetEditor = () => {
    clearPersistedState();
    const defaultProject = createDefaultProject();
    setProjects([defaultProject]);
    setActiveProjectId(defaultProject.id);
    setSelectedDeviceIdState(defaultProject.selectedDeviceId);
    setSelectedColorIdState(defaultProject.selectedColorId);
    setExportSizeIdState(defaultProject.exportSizeId);
    setScreenshotsState(defaultProject.screenshots);
    setActiveScreenshotIdState(defaultProject.activeScreenshotId);
    setHeadlineFontSizeState(defaultProject.headlineFontSize);
    setSubheadlineFontSizeState(defaultProject.subheadlineFontSize);
    setSelectedElement(null);
    setIsStarModalOpen(false);
    isApplyingHistoryRef.current = true;
    resetHistory({
      screenshots: defaultProject.screenshots,
      activeScreenshotId: defaultProject.activeScreenshotId,
      headlineFontSize: defaultProject.headlineFontSize,
      subheadlineFontSize: defaultProject.subheadlineFontSize,
    });
  };

  return (
    <EditorContext.Provider
      value={{
        // Project state
        projects,
        activeProjectId,
        activeProject,
        createProject,
        renameProject,
        deleteProject,
        switchProject,
        copyProjectInto,
        exportWorkspaceBackup,
        importWorkspaceBackup,
        customFonts,
        uploadCustomFont,
        isExporting,

        isFontPickerOpen,
        setIsFontPickerOpen,
        isStarModalOpen,
        setIsStarModalOpen,
        selectedDeviceId,
        setSelectedDeviceId,
        selectedColorId,
        setSelectedColorId,
        exportSizeId,
        setExportSizeId,
        screenshots,
        setScreenshots,
        reorderScreenshots,
        moveScreenshot,
        activeScreenshotId,
        setActiveScreenshotId,
        selectedElement,
        setSelectedElement,
        isDragging,
        headlineFontSize,
        setHeadlineFontSize,
        subheadlineFontSize,
        setSubheadlineFontSize,
        previewDimensions,
        setPreviewDimensions,
        previewRef,
        fileInputRef,
        canvasContainerRef,
        overlayImageInputRef,
        selectedDevice,
        selectedColor,
        activeScreenshot,
        activeDevice,
        exportSize,
        updateActiveScreenshot,
        addTextLayer,
        updateTextLayer,
        removeTextLayer,
        addScreenshot,
        importFinishedScreenshots,
        removeScreenshot,
        handleElementMouseDown,
        handleElementMouseMove,
        handleElementMouseUp,
        addOverlayImage,
        removeOverlayImage,
        updateOverlayImageSize,
        updateOverlayImageLayer,
        updateOverlayImageRotation,
        updateOverlayImageShadow,
        addDevice,
        selectDevice,
        removeDevice,
        bringDeviceForward,
        sendDeviceBackward,
        bringImageForward,
        sendImageBackward,
        bringImageToFront,
        sendImageToBack,
        handleFileUpload,
        handleExport,
        getBackgroundStyle,
        resetEditor,
        canUndo,
        canRedo,
        undo,
        redo,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error("useEditor must be used within an EditorProvider");
  }
  return context;
};
