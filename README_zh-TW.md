<div align="center">

# KMZtool Beta

<img src="https://api.iconify.design/mdi/quadcopter.svg" width="64" height="64" alt="Drone"/>

AI 輔助的航線任務規劃器 — 為 DJI 無人機生成 KML/KMZ 檔案。

[English](./README.md) | **繁體中文** | [简体中文](./README_zh-CN.md)

</div>

---

## 專案簡介

瀏覽器端的航線／航點任務編輯器，協助無人機任務規劃自動化。輸出 KML/KMZ 檔案供 DJI AIR 3（RC-N3）等無人機使用。

**⚠️ Beta 版本**：KMZ 匯入 DJI Fly 後，曲線航點存在限制。

<img src="./assets/demo.jpeg" width="400" alt="Demo"/>

## 功能特色

- **圖形化任務編輯** — 多邊形、矩形繪製，衛星底圖顯示
- **KML/KMZ 匯出** — 內建模板與打包流程，可直接下載
- **Google Maps 整合** — 衛星視圖，支援雙語介面
- **React + Vite** — TypeScript、熱更新，航點演算法集中於工具模組
- **可選後端** — Node.js + Express + Prisma 提供 CRUD 與驗證

## 展示

https://www.youtube.com/watch?v=3sOjrJNmBuQ

## 安裝

### 前端

```bash
git clone <repo-url> KMZtool_beta
cd KMZtool_beta
npm install
npm run dev
```

### 後端（可選）

```bash
cd backend
npm install
```

## 技術棧

- React + TypeScript + Vite
- Google Maps JS API
- Node.js + Express + Prisma（後端）

## 核心模組

| 模組 | 功能 |
| --- | --- |
| `MapEditor` / `MapContainer` | 地圖渲染、繪圖工具、航點顯示 |
| `PropertiesPanel` | 任務參數設定、即時計算 |
| `flightPathUtils` | 航點生成、距離估算、KML/KMZ 匯出 |

---

## 授權

MIT

## 致謝

Made with ❤️ by **Pauuulq87**
