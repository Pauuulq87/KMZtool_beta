# 專案任務清單 (todolist.md)

## 後端開發第一階段：基礎建設與認證

- [ ] **後端初始化** <!-- id: 0 -->
    - [ ] 在 `backend/` 初始化 Node.js/Express 專案結構 <!-- id: 1 -->
    - [ ] 設定後端 TypeScript, ESLint, Prettier <!-- id: 2 -->
    - [ ] 建立 API 文件 (Swagger/OpenAPI) <!-- id: 3 -->

- [ ] **資料庫設定** <!-- id: 4 -->
    - [ ] 選擇並安裝資料庫 (推薦 PostgreSQL) <!-- id: 5 -->
    - [ ] 設計 `Users`, `Missions`, `Waypoints` 資料庫結構 (Schema) <!-- id: 6 -->
    - [ ] 設定 ORM (Prisma/TypeORM) 並執行初始遷移 (Migration) <!-- id: 7 -->

- [ ] **認證系統** <!-- id: 8 -->
    - [ ] 實作 `POST /api/auth/register` (註冊) <!-- id: 9 -->
    - [ ] 實作 `POST /api/auth/login` (登入/JWT) <!-- id: 10 -->
    - [ ] 實作 `GET /api/auth/me` (認證中間件) <!-- id: 11 -->

## 後端開發第二階段：核心功能

- [ ] **任務管理 API** <!-- id: 12 -->
    - [ ] 實作 `POST /api/missions` (建立/存檔) <!-- id: 13 -->
    - [ ] 實作 `GET /api/missions` (列表) <!-- id: 14 -->
    - [ ] 實作 `GET /api/missions/:id` (詳情) <!-- id: 15 -->
    - [ ] 實作 `PUT /api/missions/:id` (更新) <!-- id: 16 -->
    - [ ] 實作 `DELETE /api/missions/:id` (刪除) <!-- id: 17 -->



## 前端整合

- [ ] **串接前端與後端** <!-- id: 21 -->
    - [ ] 將任務存取邏輯從本地狀態改為 API 呼叫 <!-- id: 22 -->
    - [ ] 實作 登入/註冊 UI <!-- id: 23 -->

