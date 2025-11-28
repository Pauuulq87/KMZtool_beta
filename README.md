# KMZtool_beta README（跨平台前端）

本文件為「WaypointMap 類型任務編輯器」的前端開發說明，針對 Google Antigravity / 現代 Web 前端開發環境設計。目標是讓最終使用者能在 macOS 或 Windows 系統下，以瀏覽器完成任務規劃與檔案下載（KML / KMZ），不需安裝額外桌面程式。

---

## 1. 專案定位與目標

本專案旨在實作一個航線編輯器（Mission / Waypoint Map Editor），具備：

1. 地圖顯示（衛星、街道、地形）
2. 任務區域繪製（Polygon / Rectangle / Circle）
3. Waypoint 航線生成（支援重疊率、間距、角度等參數）
4. 任務屬性調整（高度、速度、相機角度等）
5. KML / KMZ 檔案匯出與下載
6. 完整支援 macOS / Windows 使用者透過 Chrome / Edge / Safari 操作

---

## 2. 系統需求與相容性

最終使用者環境：

1. 作業系統

   * macOS 12+
   * Windows 10+

2. 瀏覽器（建議 / 測試目標）

   * Chrome 最新版
   * Edge 最新版
   * Safari（macOS）

3. 相容性重點

   * 所有任務操作均在瀏覽器內完成
   * 檔案下載使用標準 HTML5 Blob + a[download] 機制
   * 不依賴 OS 特定 API，不需安裝原生 App
   * 使用者在 macOS / Windows 上的體驗一致（差異僅限瀏覽器本身行為）

---

## 3. 技術架構概觀

前端技術建議：

1. Framework

   * Next.js（推奨）或 SvelteKit
   * 支援 SSR / SPA 混合模式與良好開發體驗

2. Map Engine

   * Mapbox GL JS（推薦，控制度高，可客製 UI）
   * 或 Google Maps JavaScript API（若需沿用 Google 生態）

3. 幾何與演算法

   * Turf.js（polygon clipping、line sweep、旋轉、交集）

4. 檔案輸出

   * 自行組 KML（XML 字串）
   * JSZip 用於壓縮 KML 為 KMZ

5. 狀態管理

   * 可使用 React 狀態（useState / useReducer）或 Zustand / Redux 視專案規模而定

---

## 4. 地圖與繪圖層設計

地圖模組需提供：

1. 地圖初始化

   * 設定中心點、縮放層級、底圖樣式（街道 / 衛星 / 混合）
   * 封裝為 MapContainer 組件

2. Shape 繪圖工具

   * Polygon
   * Rectangle
   * Circle
   * Waypoint（單點標記）

3. 圖層管理（Layer Manager）

   * 任務區域（Mission Area Layer）
   * 航線與 path（Path Layer）
   * Waypoint 標記（Waypoint Layer）

4. 互動事件

   * onDrawComplete（使用者完成 polygon/rectangle/circle 繪製）
   * onShapeClick（選取 shape，顯示右側設定）
   * onVertexDrag（節點拖曳調整形狀）
   * onWaypointClick / drag（修改或調整 waypoint）

所有 shape / waypoint 狀態集中管理，UI 組件僅作為視圖層。

---

## 5. 航線生成引擎（Mission Generator）

Mission Generator 為核心邏輯模組，負責從任務區域 polygon 生成掃描線與 waypoint。

### 5.1 輸入參數

至少包含：

1. polygon（任務範圍，GeoJSON 或自定義格式）
2. spacing（航線間距）
3. overlap（重疊率）
4. angle（飛行方向角度）
5. altitude（飛行高度）
6. speed（飛行速度）
7. camera / gimbal 角度與動作設定

### 5.2 計算流程（建議）

1. 計算任務區域的 bounding box
2. 對 polygon 依 angle 進行旋轉（使用 turf.transformRotate）
3. 在旋轉後空間中生成一系列等距掃描線（line sweep）
4. 每條掃描線與 polygon 求交集，得到多段線段（turf.lineIntersect / clipping）
5. 將線段轉回原始座標系（反向旋轉）
6. 將線段轉為 waypoint 序列，順序交替（蛇形路徑）以減少轉向成本
7. 為每個 waypoint 附加高度、速度、相機參數

輸出為 waypoint 陣列，可直接用於渲染航線或匯出檔案。

---

## 6. Waypoint 資料模型

建議統一使用 JSON 結構，例如：

lat: number
lng: number
alt: number
speed: number
heading: number
action: string       // 例如：拍照、停留、轉向等
sequence: number     // waypoint 序號

航線為 waypoint[]，可再包裝成：

missionId: string
name: string
waypoints: Waypoint[]
summary: { totalDistance, estimatedTime, batteryEstimate }

---

## 7. UI 設計與操作流程

- ./user/references/UI
- https://test.waypointmap.com/Home/Editor
先解析上面路徑中的圖片與網頁，作為UI優化的參考


UI 目標是比典型工程師風格面板更直覺，建議分區如下：

1. 左側工具欄（Tools Panel）

   * 選取工具（Select）
   * 繪圖工具（Polygon / Rectangle / Circle）
   * Waypoint 編輯模式

2. 右側設定面板（Properties Panel）

   * 任務屬性：高度、速度、重疊率、間距、方向角
   * 相機與 gimbal 設定
   * 任務摘要：預估時間、距離、電量

3. 中央 Map Canvas

   * 顯示地圖、任務區域、掃描線與航線
   * 支援框選、多選、拖曳調整

4. 底部狀態列（可選）

   * 即時顯示目前工具模式、提示文字
   * 錯誤／警告訊息（例如：任務範圍過大、spacing 過小）

UI 控制建議：

1. 單點點擊：選取 shape 或 waypoint
2. Shift + 拖曳：框選多個 waypoint（前端自行實作矩形選取邏輯）
3. 鍵盤快捷鍵（可選）：

   * Delete：刪除選取點或路徑
   * Cmd/Ctrl + Z：復原
   * Cmd/Ctrl + Y：重做

---

## 8. 檔案輸出：KML / KMZ

### 8.1 KML 生成

流程：

1. 將 waypoint 陣列轉為 KML Placemark + LineString
2. 使用字串模板產生完整 KML 文件
3. 透過 Blob + URL.createObjectURL 建立下載連結
4. 觸發 a 元素的 click 事件（a.download = "mission.kml"）

此流程在 macOS / Windows 的 Chrome / Edge / Safari 皆可正常運作。

### 8.2 KMZ 生成

KMZ 為 zip 包裝的 KML：

1. 建立 KML 字串
2. 使用 JSZip 建立 zip 檔案
3. 將 KML 寫入 doc.kml 或 mission.kml
4. 產生 zip Blob
5. 以「mission.kmz」名稱觸發下載

---

## 9. 專案模組拆分建議

專案目錄（示意）：

src/

* components/

  * MapContainer
  * ToolsPanel
  * PropertiesPanel
  * MissionSummary
* modules/

  * mapLayerManager
  * missionGenerator
  * kmlExporter
  * kmzExporter
* pages/

  * index（主編輯界面）

職責分工：

1. mapLayerManager：管理所有地圖 shape 與 waypoint 圖層
2. missionGenerator：執行掃描線與 waypoint 生成演算法
3. kmlExporter / kmzExporter：負責輸出格式與下載流程
4. UI 組件僅接收 props / callback，不直接執行幾何運算

---

## 10. 開發與部署建議

1. 開發模式

   * 使用 Antigravity + Next.js 設定開發環境
   * 在 macOS / Windows 上都測試下載功能（KML / KMZ）

2. 部署

   * 可部署至任意支援 HTTPS 的 Web 環境（Vercel / Netlify / 自建伺服器）
   * 前端純靜態檔案即可運作（若不需要登入與伺服器端儲存）

3. 未來擴充

   * 登入與任務雲端儲存（可接 Supabase / Firebase）
   * 機種 Preset（不同飛行平台的高度 / 速度限制）
   * 多任務管理與版本控制

---

## 11. 可提供的進一步資源

若需更細緻的工程實作，可追加：

1. Mission Generator 的具體演算法流程圖
2. 以 Turf.js 實作的參考程式碼
3. Next.js + Mapbox 的最小可執行專案骨架
4. 專門給 Cursor / VS Code 使用的一鍵貼上範例檔案

---

## 12. 開發作業補充

1. Context Reset：作業前後執行 `npm run ctx:reset`（呼叫 `scripts/reset-context.sh`）清理 `.cache`、`tmp/context` 並刷新 `logs`，避免舊索引干擾。  
2. 檔案邊界：`user/` 為私人區，請勿讀寫或納入版控，需引用時複製到 `user/external/` 並標註清理。  
3. 測試規劃：前端採 Vitest + @testing-library/react，測試檔命名 `*.test.ts(x)`；指令 `npm test`（單次）、`npm run test:watch`（開發）；提交前盡量覆蓋關鍵邏輯與錯誤流程。  
4. 提交規範：Commit 訊息採繁體中文 Conventional Commits，PR 需附測試結果與 API/UI 影響說明。
