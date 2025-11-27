# Repository Guidelines

## 專案結構與模組
- 前端放在根目錄：入口 `index.tsx`、`App.tsx`，共用元件於 `components/`，服務呼叫於 `services/`，工具函式於 `utils/`，型別於 `types.ts`，建置輸出於 `dist/`（勿手動修改）。  
- 後端於 `backend/`（Node.js + Express + Prisma），原始碼 `backend/src/`，Prisma schema 與遷移在 `backend/prisma/`，編譯輸出 `backend/dist/`。  
- `user/` 為私人區域，僅經授權可讀；不得納入版控，請保持 `.gitignore` 排除。新增任務前檢查 `todolist.md` 並執行 context reset（`scripts/reset-context.sh` / `npm run ctx:reset`，若尚未建立請先補齊）。

## 開發、建置與測試指令
- 前端：`npm run dev` 啟動 Vite 開發伺服器；`npm run build` 產出靜態檔；`npm run preview` 驗證生產包。  
- 後端：`cd backend && npm run dev`（nodemon 監聽 TS），`npm run build`（tsc 編譯），`npm start` 執行編譯後伺服器，`npm run lint` / `npm run format` 使用 ESLint + Prettier。  
- 資料庫：`cd backend && npx prisma migrate dev` 變更 schema 後同步 DB，`npx prisma generate` 更新 Client。開發時前後端各自啟動並設定 `.env`（API base、DB 連線）。

## 程式風格與命名
- TypeScript 全面使用；前端採函式型元件與 Hooks，元件檔名使用 PascalCase，Hook 以 `use*` 開頭，服務/工具以職責命名（如 `missionService.ts`）。  
- 縮排 2 空格，盡量避免 any；重要函式與關鍵物件需撰寫中文註解，避免魔術數字。後端遵循 ESLint + Prettier 預設規則；前端請保持同一風格。環境設定放 `.env` / `.env.local`，勿硬編碼 API key。

## 測試指引
- 目前尚無自動化測試；新增核心邏輯時優先撰寫單元測試（建議 `*.test.ts` 或 `*.spec.ts`）並涵蓋主要分支條件。  
- 若需整合測試，優先驗證 API 驗證流程與任務 CRUD；測試資料請以工廠/fixture 管理並避免污染正式資料庫。

## Commit 與 PR
- Commit 採 Conventional Commits，訊息使用繁體中文，類型：feat / fix / docs / refactor / perf / test / chore / build / ci / revert，例如 `feat: 新增任務列表 API 分頁`。  
- 小步提交後執行 `git add -A && git commit -m "<message>"`；禁止自動推送。  
- PR 需附變更摘要、測試結果、關聯議題連結；涉及 UI 變更請附截圖或錄影，後端改動需列出 API 影響與相容性注意事項。

## 文件與安全
- 撰寫程式前先更新或補齊 README / api.md / 規格文件；新增或調整 API 時需同步錯誤碼（格式 `<HTTP>-<子碼>`，如 `400-1001`）。  
- 禁止將 `user/` 內容、密鑰或個資提交到版控；若需引用私人資料，先取得授權並複製到 `user/external/` 後標註清理時程。  
- 維持模組單一職責，避免重複實作；擴充前先搜尋既有功能再決定是否重構或抽象化。
