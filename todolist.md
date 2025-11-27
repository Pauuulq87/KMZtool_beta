# 專案任務清單 (todolist.md)

## 後端開發第一階段：基礎建設與認證

- [x] **後端初始化** <!-- id: 0 -->
    - [x] 在 `backend/` 初始化 Node.js/Express 專案結構 <!-- id: 1 -->
    - [x] 設定後端 TypeScript, ESLint, Prettier <!-- id: 2 -->
    - [ ] 建立 API 文件 (Swagger/OpenAPI) <!-- id: 3 -->

- [x] **資料庫設定** <!-- id: 4 -->
    - [x] 選擇並安裝資料庫 (推薦 PostgreSQL) <!-- id: 5 -->
    - [x] 設計 `Users`, `Missions`, `Waypoints` 資料庫結構 (Schema) <!-- id: 6 -->
    - [x] 設定 ORM (Prisma/TypeORM) 並執行初始遷移 (Migration) <!-- id: 7 -->

- [x] **認證系統** <!-- id: 8 -->
    - [x] 實作 `POST /api/auth/register` (註冊) <!-- id: 9 -->
    - [x] 實作 `POST /api/auth/login` (登入) <!-- id: 10 -->
    - [x] 實作 JWT Middleware 保護路由 <!-- id: 11 -->
    - [x] 實作 `GET /api/auth/me` (取得當前使用者) <!-- id: 12 -->

## 後端開發第二階段：核心功能

- [x] **任務管理 API** <!-- id: 12 -->
    - [x] 實作 `POST /api/missions` (建立/存檔) <!-- id: 13 -->
    - [x] 實作 `GET /api/missions` (列表) <!-- id: 14 -->
    - [x] 實作 `GET /api/missions/:id` (詳情) <!-- id: 15 -->
    - [x] 實作 `PUT /api/missions/:id` (更新) <!-- id: 16 -->
    - [x] 實作 `DELETE /api/missions/:id` (刪除) <!-- id: 17 -->



## 前端整合

- [x] **串接前端與後端** <!-- id: 21 -->
    - [x] 將任務存取邏輯從本地狀態改為 API 呼叫 <!-- id: 22 -->
    - [x] 實作 登入/註冊 UI <!-- id: 23 -->

## 新任務：工具與測試

- [已完成] **建立 Context Reset 機制** <!-- id: 24 -->
    - [已完成] 補上 `scripts/reset-context.sh` 與 `npm run ctx:reset` <!-- id: 25 -->
- [已完成] **前端測試框架初始設定** <!-- id: 26 -->
    - [已完成] 選定並安裝測試工具（建議 Vitest + Testing Library） <!-- id: 27 -->
    - [已完成] 建立至少一個範例測試（元件或工具） <!-- id: 28 -->
- [待處理] **前端測試覆蓋** <!-- id: 29 -->
    - [待處理] utils：`flightPathUtils` 覆蓋 KMZ/KML 產生與 spacing 邏輯（邊界、錯誤流程） <!-- id: 30 -->
    - [待處理] components：核心 UI（如 `PropertiesPanel`、`MapEditor` 交互邏輯）快照與互動測試 <!-- id: 31 -->
    - [待處理] services：`authService` / `missionService` API 呼叫 mock 測試與錯誤處理 <!-- id: 32 -->
- [待處理] **後端測試規劃** <!-- id: 33 -->
    - [待處理] Auth API：註冊/登入/權杖驗證流程的整合測試（含錯誤碼） <!-- id: 34 -->
    - [待處理] Missions API：CRUD 與權限驗證的整合測試，含邊界輸入 <!-- id: 35 -->
    - [待處理] Prisma：Schema 變更後的 migration 驗證與資料庫初始化測試（可用測試 DB） <!-- id: 36 -->
