<div align="center">

# KMZtool Beta

<img src="https://api.iconify.design/mdi/quadcopter.svg" width="64" height="64" alt="Drone"/>

AI-assisted flight route mission planner — generate KML/KMZ for DJI drones.

**English** | [繁體中文](./README_zh-TW.md) | [简体中文](./README_zh-CN.md)

</div>

---

## Overview

Browser-based flight route/waypoint editor for drone mission planning. Outputs KML/KMZ files for DJI AIR 3 (RC-N3) and similar drones.

**⚠️ Beta**: Curved waypoint limitations exist when importing KMZ to DJI Fly.

<img src="./assets/demo.jpeg" width="400" alt="Demo"/>

## Features

- **Visual Mission Editor** — Polygon/rectangle drawing with satellite basemap
- **KML/KMZ Export** — Built-in templates and packaging, direct download
- **Google Maps Integration** — Satellite view with bilingual interface
- **React + Vite** — TypeScript, hot reload, waypoint algorithms in utility modules
- **Optional Backend** — Node.js + Express + Prisma for CRUD and validation

## Demo

https://www.youtube.com/watch?v=3sOjrJNmBuQ

## Installation

### Frontend

```bash
git clone <repo-url> KMZtool_beta
cd KMZtool_beta
npm install
npm run dev
```

### Backend (Optional)

```bash
cd backend
npm install
```

## Tech Stack

- React + TypeScript + Vite
- Google Maps JS API
- Node.js + Express + Prisma (backend)

## Core Modules

| Module | Purpose |
| --- | --- |
| `MapEditor` / `MapContainer` | Map rendering, drawing tools, waypoint display |
| `PropertiesPanel` | Mission parameters, real-time calculations |
| `flightPathUtils` | Waypoint generation, distance estimation, KML/KMZ export |

---

## License

MIT

## Acknowledgements

Made with ❤️ by **Pauuulq87**
