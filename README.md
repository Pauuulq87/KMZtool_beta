# KMZtool_beta：AI 輔助的航線任務規劃器

## 專案簡介
KMZtool_beta 是瀏覽器端的航線／航點任務編輯器，協助無人機（我手上的是DJI AIR 3、使用RC-N3）任務規劃自動化並快速輸出 KML/KMZ。目標是讓操作者在 macOS 或 Windows 上，以圖形介面完成區域繪製、航點生成與檔案下載。典型使用者包含航拍任務規劃者、測繪巡檢團隊，以及需要批次生成航線的開發者。

注意！這是一個 beta 版本，KMZ檔案匯入DJI Fly後，航線還無法克服曲線航點的限制，請見下圖：
<img src="./assets/demo.jpeg" width="400" />



## 特色
- 圖形化任務編輯：支援多邊形、矩形並顯示衛星底圖。
- KML/KMZ 匯出：內建 KML 模板與 KMZ 打包流程，可直接下載。
- Google Maps 整合：使用 Google Maps JS API 呈現地圖，支援雙語介面。
- React + Vite：快速開發體驗，TypeScript 型別安全；航點演算法集中於工具模組。
- 可選後端：Node.js + Express + Prisma 提供任務 CRUD 與驗證，方便擴充。

https://www.youtube.com/watch?v=3sOjrJNmBuQ


---以下使用AI生成的專案指引---

## 安裝
- 系統需求：Node.js 18+、npm 9+；若啟用後端需可用資料庫（Prisma 支援任一）。
- 前端安裝
```bash
git clone <your-repo-url> KMZtool_beta
cd KMZtool_beta
npm install
```
- 後端（可選）
```bash
cd backend
npm install
```

## 快速開始
- 啟動前端開發伺服器
```bash
npm run dev
```


## 使用說明 / API 概觀
- 前端核心模組
  - MapEditor / MapContainer：地圖渲染、繪圖工具、航點顯示。
  - PropertiesPanel：任務參數設定與即時計算（間距、重疊率、方向角等）。
  - flightPathUtils：航點生成、距離估算、KML/KMZ 匯出。
- 後端（可選）
  - `POST /api/missions`：建立任務（settings、waypoints、POIs）。
  - `GET /api/missions`：取得任務列表。
  - `POST /api/auth/login`：登入取得 Token。
  - 使用時請設定 `.env` 與 Prisma 目標資料庫。

## 專案結構
```
KMZtool_beta/
├── index.tsx, App.tsx          # 前端入口與主程式
├── components/                 # UI 元件（MapEditor, Sidebar, Navbar, Panels, Modals）
├── services/                   # API / Auth / Mission 呼叫封裝
├── utils/flightPathUtils.ts    # 航點生成與 KML/KMZ 工具
├── tests/                      # 前端測試（Vitest）
├── backend/                    # 後端（Express + Prisma）
│   ├── src/                    # 伺服器與控制器
│   ├── prisma/                 # Prisma schema 與遷移
│   └── scripts/                # API 測試腳本
├── scripts/reset-context.sh    # Context 重置腳本
└── package.json                # 前端設定與指令
```

## 開發指南
- 前端指令
```bash
npm run dev         # 啟動 Vite 開發伺服器
npm run build       # 建置
npm run preview     # 驗證生產包
npm run test        # Vitest 測試
npm run ctx:reset   # 重置 context（清理暫存）
```
- 後端指令
```bash
cd backend
npm run dev         # nodemon 監聽 TS
npm run build       # tsc 編譯
npm start           # 執行編譯後伺服器
npm run lint        # ESLint
npm run format      # Prettier
npx prisma migrate dev   # 資料庫遷移
```
- 分支與流程：建議功能分支開發，小步提交（Conventional Commits，訊息使用繁體中文），完成後再合併至主分支。

## 貢獻指南
- 歡迎 Fork 後提交 PR，建議流程：
  1. Fork 並建立功能分支（例：`feat/mission-export`）。
  2. 遵循 Conventional Commits（繁體中文訊息）。
  3. 送出 PR 前請跑過測試與建置，附上變更摘要與測試結果。
- Issue/PR：功能提案或缺陷回報請先開 issue 討論。

## 授權 License
MIT License：可自由使用、修改與散佈，但需保留版權與授權聲明；建議開源時一併提供 LICENSE 檔案。
