# Waro Warehouse Management System (WMS)

An intelligent, full-stack Warehouse Management System featuring AI Decision Engines, real-time priority scoring, dynamic route optimization, stock conflict resolution, and operational visibility.

---

## 📁 Project Architecture

The codebase is organized into decoupled **`frontend`** and **`backend`** directories:

```
wero/
├── backend/                      # Node.js & Express REST API Server
│   ├── config/                   # Configuration & Defaults
│   ├── controllers/              # Modular Route Controllers
│   │   ├── activityLogsController.js
│   │   ├── allocationController.js
│   │   ├── analyticsController.js
│   │   ├── authController.js
│   │   ├── decisionEngineController.js
│   │   ├── dispatchController.js
│   │   ├── exceptionsController.js
│   │   ├── inventoryController.js
│   │   ├── notificationsController.js
│   │   ├── ordersController.js
│   │   ├── packingController.js
│   │   ├── pickingController.js
│   │   └── settingsController.js
│   ├── data/
│   │   ├── seedData.js           # Baseline warehouse dataset (35+ SKUs, 50+ Orders, etc.)
│   │   └── db.json               # Auto-generated persistent JSON database
│   ├── routes/
│   │   └── api.js                # Central API Router (/api/*)
│   ├── services/
│   │   ├── dataStore.js          # Persistence & atomic read/write service
│   │   └── decisionEngineService.js # Priority Scoring & Route Optimization algorithms
│   ├── package.json
│   ├── server.js                 # Express server & static asset host (Port 5000)
│   └── .env.example
│
├── frontend/                     # Client Web Application
│   ├── css/
│   │   ├── dashboard.css
│   │   ├── responsive.css
│   │   ├── style.css
│   │   └── tables.css
│   ├── js/
│   │   ├── api.js                # REST API client connecting frontend to backend
│   │   ├── app.js                # State management, realtime sync, toast, modals, UI
│   │   ├── data.js               # Client fallback data store
│   │   ├── decision-engine.js    # Client-side decision algorithms
│   │   ├── allocation.js         # Smart allocation workbench
│   │   ├── analytics.js          # Realtime analytics & throughput charts
│   │   ├── dashboard.js          # Operations command center
│   │   ├── dispatch.js           # Carrier dispatch & manifests
│   │   ├── exceptions.js         # Exception management workbench
│   │   ├── inventory.js          # Inventory management & stock adjustment
│   │   ├── orders.js             # Order pipeline & priority queue
│   │   ├── packing.js            # Packing station & QC checks
│   │   ├── picking.js            # Picking tasks & route optimization
│   │   └── settings.js           # System configuration & SLA benchmarks
│   ├── index.html                # Login & Role Switcher
│   ├── dashboard.html            # Main Command Center
│   ├── inventory.html            # Inventory & Stock Levels
│   ├── orders.html               # Orders & Fulfillment Pipeline
│   ├── allocation.html           # Smart Stock Allocation & Conflict Resolution
│   ├── picking.html              # Wave Picking & S-Shape Route Sequencing
│   ├── packing.html              # Packing Station & QC Inspection
│   ├── dispatch.html             # Staging & Carrier Dispatch
│   ├── exceptions.html           # Exceptions Workbench
│   ├── analytics.html            # SLA Analytics & Bottleneck Metrics
│   └── settings.html             # Warehouse Configuration
│
├── package.json                  # Root runner & dependency scripts
└── README.md                     # Full documentation
```

---

## 🚀 Quick Start

### 1. Install Backend Dependencies
Open your terminal in the root directory and run:
```bash
cd backend
npm install
```

### 2. Start the Full-Stack Server
From the root directory or `backend/`:
```bash
npm start
```
Or for development with automatic server restart on file changes:
```bash
npm run dev
```

### 3. Open in Browser
- **Web Application Dashboard**: [http://localhost:5000](http://localhost:5000)
- **REST API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **API Base Endpoint**: [http://localhost:5000/api](http://localhost:5000/api)

---

## 🔌 REST API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check and server status |
| `GET` | `/api/state` | Entire warehouse state snapshot |
| `POST` | `/api/reset` | Reset database to default seed values |
| `GET` | `/api/inventory` | List all inventory SKUs (supports search, category, status filters) |
| `GET` | `/api/inventory/:sku` | Get single inventory item |
| `POST` | `/api/inventory` | Create new SKU item |
| `PUT` | `/api/inventory/:sku` | Update SKU details |
| `POST` | `/api/inventory/:sku/adjust` | Increment or decrement stock quantity |
| `POST` | `/api/inventory/:sku/damage` | Flag damaged units & quarantine |
| `POST` | `/api/inventory/:sku/reorder` | Dispatch emergency Purchase Order (PO) |
| `GET` | `/api/orders` | List fulfillment orders (filterable by status, priority) |
| `GET` | `/api/orders/:id` | Get order details |
| `POST` | `/api/orders` | Create new order |
| `PUT` | `/api/orders/:id` | Update order stage or status |
| `GET` | `/api/picking` | List active picking tasks |
| `PUT` | `/api/picking/:taskId` | Update picking task |
| `POST` | `/api/picking/:taskId/optimize-route` | Run S-Shape Aisle Sequencing route optimization |
| `POST` | `/api/picking/:taskId/complete` | Complete picking and advance order to packing |
| `GET` | `/api/packing` | List orders in packing station & QC inspection |
| `POST` | `/api/packing/:orderId/complete` | Complete packing, assign parcel carton & tracking number |
| `POST` | `/api/packing/:orderId/damage` | Report damaged item at QC station and generate exception |
| `GET` | `/api/dispatch` | List orders ready for carrier handover & dispatched history |
| `POST` | `/api/dispatch/:orderId` | Dispatch order with carrier & tracking |
| `GET` | `/api/allocation/conflicts` | Detect inventory shortage conflicts between competing orders |
| `POST` | `/api/allocation/resolve` | 1-Click execute Smart Stock Allocation |
| `GET` | `/api/exceptions` | List exceptions (damages, conflicts, delays) |
| `POST` | `/api/exceptions` | Flag new exception |
| `PUT` | `/api/exceptions/:id/resolve` | Mark exception resolved with notes |
| `GET` | `/api/decision-engine/health-score` | Calculate Warehouse Health Index (0-100) |
| `GET` | `/api/decision-engine/recommendations` | Get operational recommendations |
| `POST` | `/api/decision-engine/simulate` | Run non-destructive What-If simulations |
| `GET` | `/api/analytics` | Aggregated SLA compliance, cycle times, throughput |
| `GET` | `/api/activity-logs` | Audited activity log timeline |
| `GET` | `/api/notifications` | Live notifications feed |
| `POST` | `/api/notifications/read` | Mark all notifications read |
| `GET` | `/api/settings` | Get warehouse configurations & SLA targets |
| `PUT` | `/api/settings` | Update warehouse configurations |
| `GET` | `/api/auth/roles` | List available user roles |
| `POST` | `/api/auth/login` | Login session |

---

## ⚡ Key Features

1. **Decoupled Architecture**: Independent `frontend/` and `backend/` folders.
2. **Persistent JSON Database**: Changes made via the UI persist in `backend/data/db.json` across server restarts.
3. **Real-time Backend Sync & Offline Resilience**: `frontend/js/api.js` provides live REST API calls with real-time UI indicator (`🟢 Backend Connected`).
4. **Intelligent Decision Engine**: 5-factor weighted priority score formula, S-shape picker routing, and smart inventory conflict resolution.
5. **Unified Hosting**: The Express server automatically serves the frontend static client while exposing the full REST API.
