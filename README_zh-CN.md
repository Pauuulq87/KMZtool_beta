<div align="center">

# KMZtool Beta

<img src="https://api.iconify.design/mdi/quadcopter.svg" width="64" height="64" alt="Drone"/>

AI 辅助的航线任务规划器 — 为 DJI 无人机生成 KML/KMZ 文件。

[English](./README.md) | [繁體中文](./README_zh-TW.md) | **简体中文**

</div>

---

## 项目简介

浏览器端的航线/航点任务编辑器，协助无人机任务规划自动化。输出 KML/KMZ 文件供 DJI AIR 3（RC-N3）等无人机使用。

**⚠️ Beta 版本**：KMZ 导入 DJI Fly 后，曲线航点存在限制。

<img src="./assets/demo.jpeg" width="400" alt="Demo"/>

## 功能特色

- **图形化任务编辑** — 多边形、矩形绘制，卫星底图显示
- **KML/KMZ 导出** — 内置模板与打包流程，可直接下载
- **Google Maps 集成** — 卫星视图，支持双语界面
- **React + Vite** — TypeScript、热更新，航点算法集中于工具模块
- **可选后端** — Node.js + Express + Prisma 提供 CRUD 与验证

## 展示

https://www.youtube.com/watch?v=3sOjrJNmBuQ

## 安装

### 前端

```bash
git clone <repo-url> KMZtool_beta
cd KMZtool_beta
npm install
npm run dev
```

### 后端（可选）

```bash
cd backend
npm install
```

## 技术栈

- React + TypeScript + Vite
- Google Maps JS API
- Node.js + Express + Prisma（后端）

## 核心模块

| 模块 | 功能 |
| --- | --- |
| `MapEditor` / `MapContainer` | 地图渲染、绘图工具、航点显示 |
| `PropertiesPanel` | 任务参数设置、实时计算 |
| `flightPathUtils` | 航点生成、距离估算、KML/KMZ 导出 |

---

## 许可证

MIT

## 致谢

Made with ❤️ by **Pauuulq87**
