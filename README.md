# AppShots Editor · 汉化增强版

[中文说明](#中文说明) · [English guide](#english-guide) · [下载增强版 / Download](https://github.com/Eloliuyx/appshots_forked/archive/refs/heads/feature/multi-text-and-flexible-devices.zip)

一个在本地浏览器中使用的 App Store / Google Play 宣传截图工作台，支持中英文界面、灵活图层、自定义字体、单张导出，以及更顺手的选择、排序和撤销操作。

A local, browser-based workbench for App Store and Google Play marketing screenshots, with an English/Chinese interface, flexible layers, custom fonts, individual exports, and improved selection, ordering, and undo.

> 本仓库是 [oyeolamilekan/appshots](https://github.com/oyeolamilekan/appshots) 的独立增强 fork，原项目由 **Oye Olalekan Johnson** 创建。我们在原项目基础上增加汉化和编辑器改进，不是原作者的官方版本。原有 MIT 许可证及版权声明完整保留。
>
> This is an independently enhanced fork of [oyeolamilekan/appshots](https://github.com/oyeolamilekan/appshots), originally created by **Oye Olalekan Johnson**. It adds localization and editor improvements; it is not an official upstream release. The original MIT license and copyright notice are preserved.

## 视频演示 / Video demo

**中文版增强版视频：待添加。** 将演示启动工作台、编辑图层、切换语言、备份和导出的流程。

**Chinese-language demo of this enhanced fork: coming soon.** It will show launching the workbench, editing layers, switching languages, backing up, and exporting.

<!-- Replace this placeholder with a real video link or GitHub-hosted video when available. Do not present the upstream live demo as this enhanced fork. -->

原项目的在线演示不包含本 fork 的全部增强功能，因此不再把它作为本版本的 Live Demo。无需部署网站即可使用下方的本地工作台。

The upstream live demo does not contain all of this fork's enhancements, so it is no longer presented as this version's live demo. No website deployment is needed to use the local workbench below.

## 中文说明

### 本 fork 新增了什么

- **中英文界面切换**：顶部截图数量左边的「EN / 中文」切换菜单、按钮、说明、提示及字体窗口。记住语言选择，但不会翻译已有截图文案、项目名称、图片或字体名称。
- **中文默认文案**：中文模式下添加截图，默认显示「新截图」「在这里添加描述」；新增文字图层显示「新主标题」「新副标题」。英文模式使用英文默认文案。
- **撤销与重做**：使用顶部按钮，或 ⌘/Ctrl+Z、⌘/Ctrl+Shift+Z 恢复编辑操作。
- **截图重新排序**：通过截图左上角的拖动手柄或左右按钮调整顺序。
- **在选中截图右边添加**：点击「添加截图」，新截图紧接在当前选中截图右边，并自动成为选中项。
- **一张截图，多组标题**：添加多个独立主标题和副标题，分别编辑内容、格式、宽度和位置。
- **零个、一个或多个设备**：制作纯文字或图片版式，也可放置多个独立设备画面，各自保留图片、样式、位置、旋转和阴影。
- **原位替换设备图片**：在「设备屏幕图片」中点击「替换图片」，保留设备大小、位置、旋转角度和阴影，不必重新排版。
- **单张导出**：选中截图后，点击「导出当前截图（第 N 张）」，只下载该张 PNG；仍支持「导出全部」。
- **上传自己的字体**：「外观 → 字体 → 上传字体」支持 TTF、OTF、WOFF、WOFF2，每个文件最大 20 MB。字体保存在浏览器本地，并包含在工作台备份中。不同文件分别列出；请使用已获授权的字体。
- **项目之间可编辑复制**：将当前项目复制到另一个项目，保留文字、设备、图片和布局图层，而不是合成一张图片。替换目标项目之前会要求确认。
- **可编辑工作台备份**：项目菜单「备份」下载 JSON，包含项目、图片和自定义字体；「导入备份」添加项目，不删除现有项目。
- **成品图片导入**：「导入成品图片」将下载好的 PNG 等图片作为完整图片图层导入，不能还原原始文字和设备图层。
- **更可靠的对象选择**：顶部编号按钮直接切换截图；右侧「图层」直接选择被遮挡的文字、设备或图片，无需先移开遮挡物。
- **移动选中对象**：选择图层后，在当前截图任意位置拖动，仅移动该对象；也可输入 X/Y 百分比精确定位。关闭此模式后恢复画布直接选择。
- **选择与弹窗修复**：减少图片留白区域拦截点击，修复字体窗口被画布图片盖住的问题。PNG 内部透明区域仍可能有矩形点击范围，重叠复杂时请使用「图层」。
- **安静的编辑体验**：移除 GitHub Star 弹窗和宣传横幅；移除 TanStack 调试入口、检查器和 Shift+A 弹窗快捷键，不影响页面路由。

### 保留的原项目能力

iPhone、iPad、Samsung 手机和平板设备框；设备配色；平面与 3D 模式；纯色和渐变背景；富文本加粗、斜体、下划线、颜色、对齐及文字高亮；Google Fonts；叠加图片、旋转和阴影；实时画布；位置预设；多项目管理；多种导出尺寸。

本 fork 还支持设备跨相邻截图延伸，导出保留对应的裁切构图。工作台为深色界面，截图本身的背景和素材可以自由设计。

### 开始使用：macOS 双击启动

**不需要账号、API key、Supabase、Vercel 或网站部署。** 这是本地工作台，不是需要注册的在线服务。

1. 安装 [Node.js](https://nodejs.org/en/download/)：推荐 Node.js 24 LTS，也支持 Node.js 22.12+。Node.js 安装包含 npm；原 README 的 Node.js 18 要求不适用于当前 Vite 7。[Vite 7 版本要求](https://v7.vite.dev/guide/migration)。
2. [下载增强版 ZIP](https://github.com/Eloliuyx/appshots_forked/archive/refs/heads/feature/multi-text-and-flexible-devices.zip)，解压到长期保存的文件夹，例如「文稿 / AppShots Editor」。不要只下载一个 .command 文件，也不要把项目一直放在临时目录。
3. 在项目文件夹中，双击 **[Start AppShots.command](Start%20AppShots.command)**。
4. 第一次启动会自动安装依赖，需要联网。之后启动本地服务，并在默认浏览器打开 **<http://127.0.0.1:5173/>**。如果该地址已经有服务运行，启动文件会直接打开它。
5. 使用时保持终端进程运行；结束时在终端按 Ctrl+C 停止服务。下次双击同一个文件即可再次打开。

如果提示启动文件没有执行权限，在终端进入解压后的项目文件夹，再运行：

~~~bash
chmod +x "Start AppShots.command"
~~~

如 macOS 提示文件来自互联网，请只在确认下载自本仓库后，按系统提示允许打开；不要关闭系统安全保护。若仍不能双击启动，使用下方终端启动方法。

**想有一个桌面的「AppShots工作台」入口？** 在 Finder 中选中项目内的 Start AppShots.command，选择「制作替身」，把替身移到桌面，并重命名为「AppShots工作台」。原始启动文件留在项目文件夹里；它依赖同目录的项目代码，不是独立应用。移动项目后，请重新制作替身。

### 终端启动：macOS / Windows / Linux

需要 Node.js 和 Git。当前增强版在 **feature/multi-text-and-flexible-devices** 分支，以下命令明确下载该分支，避免拿到旧的 master 版本：

~~~bash
git clone --branch feature/multi-text-and-flexible-devices https://github.com/Eloliuyx/appshots_forked.git
cd appshots_forked
npm install --no-package-lock --legacy-peer-deps
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
~~~

然后打开 **<http://127.0.0.1:5173/>**。Windows 和 Linux 用户使用此方法，不使用 macOS 的 .command 文件。

--legacy-peer-deps 用于兼容当前依赖中的旧版 React peer 声明；这是现有双击启动文件使用的安装方式。以后启动只需进入同一个项目文件夹，再运行最后一条命令。

如果下载的是 ZIP，不需要 Git：在终端进入解压后的项目文件夹，执行以上安装和启动两条 npm 命令即可。

### 工作台怎么用

1. 在顶部选择「中文」或「EN」，再用左上角项目菜单新建或切换项目。
2. 选中截图，点击「添加截图」在它右边增加一张；用编号按钮切换，用截图左上角按钮或手柄排序。
3. 在右侧添加主标题、副标题、设备和叠加图片；在左侧选择当前设备型号、配色和导出尺寸。
4. 每个设备分别上传屏幕图片。需要换图时使用「替换图片」，不重新建立设备图层。
5. 用「图层」选择目标对象，再拖动或输入 X/Y 调整位置；文字工具栏可加粗、改色、对齐和高亮，字体窗口可上传字体。
6. 选择导出尺寸，使用「导出当前截图」或「导出全部」。多张截图批量导出为 ZIP，单张为 PNG。请确认尺寸符合目标上传栏位的要求，参见 [Apple 官方截图规格](https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications)。
7. 使用项目菜单「备份」保存可编辑 JSON，重要编辑完成后尤其建议备份。

**项目复制**：先打开源项目，在项目菜单里找到目标项目，点击目标行的复制图标并确认替换。目标项目中的图层之后可独立修改。请先备份目标项目。

### 设计保存在哪里？重要！

- 项目、截图图片和自定义字体自动保存在**当前浏览器的 localStorage / IndexedDB** 中，不是项目文件夹里的图片目录，也不是 GitHub 仓库中的文件。
- 提交代码、更新 README、重新下载项目或把代码拷到另一台电脑，**不会同时备份可编辑设计**。
- 更换浏览器、配置文件、主机名或端口，可能看到新的空工作台。localhost:5173、127.0.0.1:5173 和其他端口的存储彼此独立。请始终使用同一地址：**<http://127.0.0.1:5173/>**。
- 更换浏览器或电脑、清除浏览器数据、更新项目之前，先下载「备份」JSON；在新环境中用「导入备份」恢复。
- PNG 是最终成品，不能代替可编辑 JSON 备份。只有 PNG 时，可以导入为整张图片，无法恢复原有图层。
- 本地运行不等于完全离线：安装依赖和加载 Google Fonts 需要网络；源码仍保留上游 Google Fonts 和 Vercel Analytics 集成。图片和字体通过本地文件读取保存在浏览器中，不会因为 Git 提交而上传到仓库。

### 常见问题

**只剩 My Project，原来的设计不见了？** 先检查是否使用了原来的浏览器、配置文件和完整地址。不要立刻清除浏览器数据或重置工作台。如果有 JSON，使用「导入备份」恢复。

**端口 5173 被占用？** 启动文件会打开该端口已有的页面。若它不是 AppShots，请先停止占用端口的其他服务，再启动工作台。固定端口是为了避免误开另一套浏览器存储。

**点击总选中别的对象？** 使用右侧「图层」，再用「移动选中对象」或 X/Y 坐标。

**字体或图片可以直接商用吗？** 编辑器的 MIT 许可不替代字体、图片、商标和设备素材各自的授权；请自行确认使用权。

## English guide

### Enhancements in this fork

- **English/Chinese interface** — EN / 中文 beside the screenshot count translates menus, buttons, instructions, messages, and the font dialog. The choice is remembered. Existing artwork, project names, images, and font names are not translated.
- **Localized starter text** — new screenshots use “新截图 / 在这里添加描述” in Chinese mode and “New Screenshot / Add your description here” in English mode. Newly added headline/subheadline layers also use the current language.
- **Undo and redo** — toolbar controls, Cmd/Ctrl+Z, and Cmd/Ctrl+Shift+Z.
- **Screenshot reordering** — drag the handle or use left/right controls.
- **Insert after selection** — Add Screenshot inserts immediately to the right of the active screenshot and selects the new one.
- **Multiple text layers** — independent headlines and subheadlines with separate content, formatting, widths, and positions.
- **Zero-to-many devices** — device-free compositions or multiple independent devices, each with its own image, appearance, position, rotation, and shadow.
- **Replace device images in place** — Replace Image preserves device size, position, rotation, and shadow without rebuilding the layout.
- **Individual PNG export** — Export Current (#N) downloads only the selected appshot. Export All remains available.
- **Your own fonts** — Appearance → Font Style → Upload Font supports TTF, OTF, WOFF, and WOFF2, up to 20 MB each. Fonts are saved in the browser and embedded in backups. Each uploaded file is listed separately; use properly licensed fonts.
- **Editable project copies** — retain text, device, image, and layout layers when copying the current project into another. Destination replacement requires confirmation.
- **Portable workspace backups** — Backup downloads editable JSON including projects, images, and fonts. Import Backup adds projects without deleting existing ones.
- **Finished image import** — Import Finished PNGs adds exported images as flattened artwork; it cannot reconstruct original text/device layers.
- **Reliable selection** — numbered screenshot navigation and Layers let you select covered objects without moving covering artwork.
- **Move Selected mode** — select a layer, then drag anywhere on the active screenshot to move only that object, or use X/Y percentage coordinates. Turn it off to select directly on the canvas.
- **Hit-area and modal fixes** — image letterboxing intercepts fewer clicks; artwork no longer covers the font picker. Transparent pixels inside PNGs may still have a rectangular hit area; use Layers for complex overlaps.
- **An uninterrupted workbench** — no GitHub Star popup or promotional banner, and no TanStack debug launcher, inspector, or Shift+A popup shortcut. Routing still works normally.

### Original capabilities retained

iPhone, iPad, and Samsung phone/tablet frames; device colors; flat/3D rendering; solid/gradient backgrounds; rich text with bold, italic, underline, colors, alignment, and highlights; Google Fonts; overlay images, rotation, and shadows; live previews; position presets; multiple projects; and export size presets.

This fork also supports devices extending into adjacent screenshots, preserving cropped compositions during export. The editor has a dark interface; artwork backgrounds and assets are your choice.

### macOS: double-click to launch

**No account, API key, Supabase, Vercel, or website deployment is required.** This is a local workbench, not a hosted service you need to sign up for.

1. Install [Node.js](https://nodejs.org/en/download/). Node.js 24 LTS is recommended; Node.js 22.12+ is also supported. npm is included. The old README's Node.js 18 requirement is not sufficient for Vite 7. See [Vite 7 requirements](https://v7.vite.dev/guide/migration).
2. [Download the enhanced fork as a ZIP](https://github.com/Eloliuyx/appshots_forked/archive/refs/heads/feature/multi-text-and-flexible-devices.zip) and extract it into a permanent folder such as Documents/AppShots Editor. Download the whole project, not just the .command file; avoid temporary folders.
3. Double-click **[Start AppShots.command](Start%20AppShots.command)** inside the project.
4. The first launch installs dependencies and needs internet access. The launcher starts the local server and opens **<http://127.0.0.1:5173/>** in your default browser. If a server is already running there, it opens the existing page.
5. Keep the Terminal process running while editing. Press Ctrl+C in Terminal when finished. Double-click the same file next time.

If the file is not executable, open Terminal in the extracted project folder and run:

~~~bash
chmod +x "Start AppShots.command"
~~~

If macOS warns the file came from the internet, allow it through the system prompts only after verifying it came from this repository. Do not disable system security protections. If double-clicking still fails, use the terminal instructions below.

**Want a desktop shortcut?** In Finder, select the project's Start AppShots.command, choose **Make Alias**, move the alias to your desktop, and rename it “AppShots Workbench.” Keep the original launcher inside the project: it depends on the code beside it and is not a standalone app. Recreate the alias if you move the project.

### Terminal: macOS / Windows / Linux

Install Node.js and Git first. The enhanced version currently lives on **feature/multi-text-and-flexible-devices**. These commands select that branch instead of the older master version:

~~~bash
git clone --branch feature/multi-text-and-flexible-devices https://github.com/Eloliuyx/appshots_forked.git
cd appshots_forked
npm install --no-package-lock --legacy-peer-deps
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
~~~

Open **<http://127.0.0.1:5173/>**. Windows/Linux users should use this method rather than the macOS .command launcher.

--legacy-peer-deps accommodates older React peer declarations in current dependencies; the double-click launcher uses the same installation method. For later launches, enter the same project folder and run only the final command.

If you downloaded the ZIP, Git is not required: open Terminal in the extracted folder and run the npm installation and start commands above.

### Editing workflow

1. Choose EN or 中文 at the top; create or switch projects using the project menu.
2. Select a screenshot, then Add Screenshot to insert on its right. Use numbered navigation to switch, and handles/arrows to reorder.
3. Add headlines, subheadlines, devices, and overlays on the right. Choose the active device's model, color, and export resolution on the left.
4. Upload each device's screen image. Use Replace Image instead of rebuilding the layer when swapping images.
5. Select objects in Layers, then drag or enter X/Y coordinates. Format text with bold, colors, alignment, and highlights; upload fonts in the font dialog.
6. Choose an export size; use Export Current or Export All. Multiple screenshots export as ZIP; a single screenshot exports as PNG. Check the destination upload slot requirements; see [Apple's screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications).
7. Download a workspace JSON Backup from the project menu, especially after important edits.

**Copying projects:** open the source project, find the destination in the project menu, click its row's copy icon, and confirm replacement. Copied layers can then be edited independently. Back up the destination first.

### Where designs are saved — important

- Projects, images, and custom fonts auto-save in **the current browser's localStorage / IndexedDB**, not the checkout's image folders or GitHub files.
- Committing code, updating the README, downloading again, or copying code to another computer **does not back up editable designs**.
- Changing browser, profile, hostname, or port can open a separate empty workspace. localhost:5173, 127.0.0.1:5173, and other ports have separate storage. Keep using **<http://127.0.0.1:5173/>**.
- Before changing browsers/computers, clearing browser data, or updating the project, download a JSON Backup. Use Import Backup to restore it in the new environment.
- PNGs are finished artwork, not editable backups. They can be imported as whole images; original layers cannot be recovered.
- Local hosting does not mean fully offline: dependency installation and Google Fonts require network access, and upstream Google Fonts/Vercel Analytics integrations remain in the source. Images/fonts are read locally and saved in the browser; committing code does not upload them to GitHub.

### Troubleshooting

**Only My Project appears and designs seem missing:** check the original browser, profile, and exact address first. Do not immediately clear browser data or reset the editor. Restore saved JSON using Import Backup if available.

**Port 5173 is occupied:** the launcher opens whatever server is there. If it is not AppShots, stop that service before starting the workbench. A fixed port helps avoid opening separate browser storage by accident.

**Clicks select the wrong object:** use Layers, then Move Selected or X/Y coordinates.

**Can I use third-party fonts/images commercially?** The editor's MIT license does not replace separate rights for fonts, images, trademarks, or device assets. Verify permission for your intended use.

## 开发与更新 / Development and updates

更新之前先在工作台下载 JSON 备份，再在已有 checkout 中执行以下命令。保持同一个浏览器地址。

Before updating, download a JSON backup in the editor, then run these commands in the existing checkout. Keep using the same browser address.

~~~bash
git pull --ff-only
npm install --no-package-lock --legacy-peer-deps
npm test
npm run build
~~~

如本地有自己的代码修改，请先妥善保存，不要强制重置覆盖自己的工作。构建输出到 dist/；npm run preview 用于检查构建结果，换端口会使用另一套浏览器存储。

Preserve local code changes before updating; do not force-reset your work. Build output goes to dist/. npm run preview serves the build for testing; changing ports also uses separate browser storage.

技术栈 / Stack: React 19 · TypeScript · Vite 7 · Tailwind CSS 4 · TanStack Router · Lucide · Vitest. TanStack Router remains; its debug UI is disabled.

## 反馈与贡献 / Feedback and contributions

本 fork 目前尚未开启 Issues；欢迎通过 [本 fork 的 Pull Requests](https://github.com/Eloliuyx/appshots_forked/pulls) 提交改进和修复，目标请选择增强分支。原项目的贡献与历史请参阅 [上游仓库](https://github.com/oyeolamilekan/appshots)。

Issues are not currently enabled on this fork. Improvements and fixes are welcome through [this fork's Pull Requests](https://github.com/Eloliuyx/appshots_forked/pulls); target the enhanced branch. See the [upstream repository](https://github.com/oyeolamilekan/appshots) for the original project's history.

## 许可证与致谢 / License and credits

[MIT License](LICENSE)。保留原作者 **Oye Olalekan Johnson** 的版权声明。感谢原作者及依赖维护者；汉化与增强工作在本 fork 中独立维护。

[MIT License](LICENSE). The original copyright notice for **Oye Olalekan Johnson** is retained. Thanks to the upstream author and dependency maintainers; localization/enhancements are independently maintained in this fork.

绿色渐变「文件夹＋放大镜」logo 来自原项目，不是本 fork 新设计的图标；源文件为 [public/favicon.png](public/favicon.png)，同目录的 logo192.png、logo512.png 是相同图片。

The green gradient folder-and-magnifier logo comes from upstream, not a new design for this fork. Its source is [public/favicon.png](public/favicon.png); logo192.png and logo512.png contain the same artwork.
