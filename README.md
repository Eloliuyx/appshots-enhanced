# 📱 App Store Screenshot Generator

A free, open-source tool to create stunning, high-converting screenshots for the Apple App Store and Google Play Store in minutes. Design professional app previews with an intuitive drag-and-drop editor.

🔗 **Live Demo:** [appshots.appstate.xyz](https://appshots.appstate.xyz/)

![App Store Screenshot Generator](public/demo-image.png)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-38B2AC?logo=tailwindcss)

## ✨ Features

### 📱 Device Frames

- **6 realistic device mockups** — iPhone 15 Pro Max, iPhone 15 Pro, iPhone 14, iPad Pro 12.9", Samsung Galaxy S24 Ultra, Samsung Galaxy Tab S9
- **Multiple color options per device** — Black Titanium, Natural, Blue, White, and more
- **Zero-to-many device compositions** — create text-only screenshots, or add, select, reorder, and style any number of independent devices
- **Independent device instances** — each device keeps its own screen image, model, color, transform, 3D angles, and shadow
- **Cross-screen device overflow** — drag devices past the left or right edge to continue them into adjacent screenshots
- **Flat & 3D rendering modes** — toggle between a classic 2D frame and a perspective 3D view with visible device edges
- **3D rotation controls** — adjust Rotate Y and Rotate X angles for the perfect perspective
- **Accurate camera elements** — Dynamic Island, notch, and punch-hole camera matching each device

### 🎨 Backgrounds & Appearance

- **Solid color backgrounds** with a full color picker
- **Gradient presets** — Sunset, Ocean, Mint, Berry, Royal, Rose
- **Global text color picker**

### 📝 Rich Text & Fonts

- **Multiple text layers** — add any number of independent headlines and subheadlines to each screenshot
- **Rich text editor** for every headline and subheadline — bold, italic, underline, text color, alignment (left/center/right), and text background highlights
- **Rounded highlight styling** — highlighted text uses padded, rounded backgrounds that match in the editor, preview, and export
- **Google Fonts integration** — search and preview hundreds of fonts
- **Your own font files** — upload TTF, OTF, WOFF or WOFF2 files (up to 20 MB each) from Appearance → Font Style → Upload Font. The file is loaded before selection and export, stored locally, and embedded in workspace JSON backups. Uploads never go to GitHub or a font service. Each file is listed separately; upload regular/bold variants as separate choices. Only use fonts licensed for your intended use.
- **Independent sizing** — separate font size sliders for headline and subheadline
- **Width control** — set how wide each text block spans
- **Drag-to-reposition** — click and drag headlines or subheadlines anywhere on the canvas

### 🖼️ Overlay Images

- **Unlimited overlay images** — upload badges, logos, arrows, or decorations
- **Drag-to-reposition** and **resize** with width percentage control
- **Rotation control** per image
- **Layer management** — place behind or in front of the device, reorder with bring forward/backward/to-front/to-back
- **Per-image shadow** — enable/disable with color, blur, and offset controls

### 📸 Screenshot Image

- **Upload your app screenshots** — each device frame can display its own screen image
- **Replace screen images in place** — uploading a replacement preserves the device's size, position, rotation and shadow

### 📐 Layout & Positioning

- **8 position presets** — Centered, Bleed Bottom, Bleed Top, Float Center, Float Bottom, Tilt Left, Tilt Right, Perspective
- **Device size** slider (scale %)
- **Device vertical position** slider (offset %)
- **Device rotation** (flat mode) or **3D rotation** (3D mode)
- **Device shadow** — toggle on/off with color, blur, and vertical offset controls

### 📋 Project Management

- **Multiple projects** — create, rename, switch between, and delete projects
- **Auto-save** — projects, settings and custom fonts persist in localStorage and IndexedDB across sessions; IndexedDB also handles workspaces too large for localStorage
- **English / Chinese interface** — use **EN / 中文** beside the screenshot count to translate editor controls, instructions, project menus and font dialogs. The choice is remembered on this browser origin. Screenshot artwork, project names, uploaded images and font names stay unchanged; no workspace migration is required.
- **Editable project copies** — copy an existing project's layers and settings into another project
- **Workspace JSON backup / restore** — export editable projects, embedded images and custom fonts from the project menu; importing adds projects without replacing existing ones
- **Finished PNG import** — recover downloaded artwork as flattened image layers (the original text/device layers cannot be recovered from PNGs)
- **Reset to defaults** — clear everything and start fresh

### 📦 Export

- **Single appshot export** — select a screenshot on the canvas, choose the export resolution, then click **Export Current (#N)** to download only that PNG. Its filename retains the screenshot's current position in the project. Neighboring device overflow stays intact, just like batch export.
- **Batch export** — export all screenshots at once (ZIP for multiple, PNG for single)
- **5 export size presets** — 6.9" iPhone upload slot (1290 × 2796), 6.7" iPhone, 6.5" iPhone, 5.5" iPhone, 12.9" iPad Pro
- **Full 3D support** — 3D perspective, edges, and shadows are preserved in exports
- **Cross-screen layouts preserved** — multi-device overflow compositions export exactly like the on-canvas preview
- **Pixel-perfect** — exported images match the on-screen preview
- **Uninterrupted exports** — no post-export star popup or promotional banner in this fork; original MIT attribution remains in LICENSE

### 🖥️ Editor Experience

- **Multi-screenshot gallery** — add, remove, and navigate screenshots in a horizontal carousel
- **Undo & redo** — recover editor changes with toolbar controls, `Cmd/Ctrl+Z`, and `Cmd/Ctrl+Shift+Z`
- **Screenshot reordering** — drag screenshots into a new order or move them left and right with accessible controls
- **Real-time preview** — all changes update instantly on the canvas
- **Drag-and-drop** — reposition any element by dragging directly on the canvas
- **Device manager** — add, select, remove, and reorder devices from the right sidebar
- **Element selection** — click to select text, devices, or overlay images with visual feedback
- **Explicit screenshot navigation** — numbered buttons above the canvas switch screenshots regardless of overlapping artwork
- **Unified Layers panel** — select any text, device, or image without moving covering objects out of the way
- **Move Selected mode** — after choosing a layer in Layers, drag anywhere in the active screenshot to move only that object. Turn the mode off to pick objects normally. X/Y percentage inputs offer exact placement without dragging.
- **Contained image hit areas** — object-contain letterbox margins don't intercept clicks; PNG-internal transparent pixels may still have a rectangular hit area, so use Layers for overlapping transparent artwork
- **Isolated canvas stacking** — font picker is portaled above artwork; screenshot management controls stay above all canvas objects
- **Helpful rich-text tooltips** — formatting controls include hover/focus tooltips
- **Dark mode UI** — sleek dark interface that's easy on the eyes

## 🚀 Quick Start

### Keep your work safe

Keep a long-lived checkout in a normal project folder (for example `Documents/AppShots Editor`) rather than relying on an app-internal working directory. Commit and push code to your own repository. Editable designs live in the browser, not in Git: regularly download a workspace JSON backup from the project menu, especially before changing browser, hostname or port, clearing browser data, or moving to another machine. Keep using the same URL (`http://127.0.0.1:5173/`) when restarting the workbench; `localhost` and other ports have separate browser storage.

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+

### Installation

```bash
# Clone the repository
git clone https://github.com/oyeolamilekan/appshots.git
cd app-screenshot-generator

# Install dependencies
bun install

# Start the development server
bun run dev
```

The app will be available at `http://localhost:5173`

### Personal workbench on macOS

Double-click `Start AppShots.command` to start the private local workbench and
open it at `http://127.0.0.1:5173`. Keep the Terminal window open while using
the editor; closing it stops the local site. Nothing is deployed to the web.

### Building for Production

```bash
bun run build
```

The built files will be in the `dist/` directory.

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Routing**: [TanStack Router](https://tanstack.com/router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Build Tool**: [Vite 7](https://vitejs.dev/)
- **Testing**: [Vitest](https://vitest.dev/)
- **Runtime**: [Bun](https://bun.sh/)

## 📁 Project Structure

```
src/
├── components/
│   ├── CanvasPreview/       # Main canvas, screenshot cards, device container, overlays
│   ├── DeviceFrame/         # Device mockups (flat 2D & 3D with edges)
│   ├── FontPicker/          # Google Fonts search & selection
│   ├── GitHubStarModal.tsx  # Post-export GitHub star modal
│   ├── LeftSidebar/         # Device picker, color picker, export controls
│   ├── ProjectSwitcher/     # Project management UI
│   ├── RichTextEditor/      # Rich text formatting toolbar & editor
│   ├── RightSidebar/        # Layout, appearance, content, device, overlay controls
│   ├── EditorLayout.tsx     # Main editor layout shell
│   └── ui/                  # shadcn/ui components
├── context/
│   └── EditorContext.tsx     # Global editor state & actions
├── lib/
│   ├── device-instances.ts  # Device instance helpers and legacy normalization
│   ├── device-overflow.ts   # Cross-screen device overflow calculations
│   ├── export-utils.ts      # Canvas-based screenshot export (flat & 3D)
│   ├── google-fonts.ts      # Google Fonts API loader
│   ├── rich-text-canvas.ts  # Rich text rendering for canvas export
│   └── useLocalStorage.ts   # Persistence hooks
├── routes/
│   ├── __root.tsx           # Root layout
│   └── index.tsx            # Home page
├── types/                   # TypeScript type definitions
├── constants.ts             # Device specs, gradients, export sizes
├── main.tsx                 # Application entry point
└── styles.css               # Global styles
```

## 🎯 Usage

1. **Choose your composition** — keep a screenshot device-free or add one or more device frames
2. **Select a device** — pick from iPhones, iPads, or Samsung devices in the left sidebar
3. **Choose a color** — select a device frame color
4. **Upload screenshots** — attach a different screen image to each device frame
5. **Add text layers** — add as many headlines and subheadlines as you need, then format and position each one independently
6. **Pick a font** — browse Google Fonts to find the perfect typeface
7. **Set a background** — choose a solid color or gradient preset
8. **Position the device** — use presets or manually adjust size, position, rotation, and shadow
9. **Switch to 3D** — toggle to 3D mode and adjust perspective angles
10. **Span screenshots** — drag devices past the left or right edge to continue them into adjacent screenshots
11. **Add overlays** — upload badges, logos, or decorations and layer them around the device
12. **Manage screenshots** — add more screenshots to create a complete set
13. **Export** — download all screenshots at App Store resolution, then optionally star the project from the post-export modal

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Keep commits atomic and well-described

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [TanStack](https://tanstack.com/) for the amazing router and devtools
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Lucide](https://lucide.dev/) for beautiful icons
- [Google Fonts](https://fonts.google.com/) for the font library

## 📬 Contact

- Create an [issue](https://github.com/oyeolamilekan/appshots/issues) for bug reports or feature requests
- Star ⭐ this repo if you find it useful!

---

Made with ❤️ for iOS and Android developers
