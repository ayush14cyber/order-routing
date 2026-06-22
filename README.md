# 📦 Order Routing — Intelligent Inventory & Fulfillment Platform

Order Routing is a **full-stack web application** designed to optimize supply chain logistics. It allows users to manage inventory, create orders, and automatically assign fulfillment to the most efficient warehouse locations based on custom logic. It follows a decoupled client-server architecture, featuring a modern frontend built with React and TypeScript, and a robust Node.js/Express.js backend equipped with a dedicated routing engine.

> **Tech Stack:** Node.js · Express.js · MongoDB · Mongoose · React · TypeScript · Vite

---

## 📑 Table of Contents

* [Features](#-features)
* [Architecture Overview](#-architecture-overview)
* [Folder Structure](#-folder-structure)
* [Database Schemas](#-database-schemas)
* [API Routes](#-api-routes)
* [Core Logic: Routing Engine](#-core-logic-routing-engine)
* [Frontend Details](#-frontend-details)
* [Environment Variables](#-environment-variables)
* [Getting Started](#-getting-started)

---

## ✨ Features

| Feature | Description |
| --- | --- |
| **Dashboard View** | Comprehensive overview of system metrics, active warehouses, and recent order statuses via the Dashboard component.

 |
| **Inventory Management** | Track, update, and manage product stock levels across multiple locations with the dedicated Inventory Manager.

 |
| **Order Creation** | Streamlined interface to generate new customer orders and select products.

 |
| **Smart Routing Engine** | Algorithmic backend processing to automatically allocate orders to the most optimal warehouse.

 |
| **Warehouse Mapping** | Visual representation of warehouse geographical locations and logistics via the Warehouse Map component.

 |
| **User Authentication** | Secure login system tailored for administrators and staff.

 |

---

## 🏗 Architecture Overview

The project follows a **Client-Server** pattern, separating the user interface from the business logic and database.

```text
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT (React/Vite)                       │
│   Sends HTTP requests (GET, POST, PUT, DELETE) via api.ts        │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                     API ROUTES (routes/api.js)                   │
│   Maps URL endpoints to core backend logic                       │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                  ROUTING ENGINE (routingEngine.js)               │
│   Processes complex business logic for warehouse allocation      │
└──────────┬──────────────────────────────────┬────────────────────┘
           │                                  │
           ▼                                  ▼
┌────────────────────────┐      ┌──────────────────────────────────┐
│  MODELS (models/*.js)  │      │             DATABASE             │
│  Mongoose schemas      │      │     MongoDB Document Storage     │
└────────────────────────┘      └──────────────────────────────────┘

```

---

## 📁 Folder Structure

The repository is organized into distinct client and server directories:

```text
ORDER-ROUTING/
├── client/                    # Frontend React application[cite: 1]
│   ├── public/                # Static assets (favicons, SVGs)[cite: 1]
│   ├── src/                   # Source code[cite: 1]
│   │   ├── assets/            # Local images and icons[cite: 1]
│   │   ├── components/        # React UI components[cite: 1]
│   │   │   ├── Dashboard.tsx
│   │   │   ├── InventoryManager.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── OrderCreator.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── WarehouseMap.tsx
│   │   ├── api.ts             # API service layer for backend communication[cite: 1]
│   │   ├── App.tsx            # Root application component[cite: 1]
│   │   └── main.tsx           # React entry point[cite: 1]
│   ├── tsconfig.json          # TypeScript configuration[cite: 1]
│   └── vite.config.ts         # Vite build tool configuration[cite: 1]
│
├── server/                    # Backend Node.js/Express application[cite: 1]
│   ├── engine/
│   │   └── routingEngine.js   # Core algorithmic logic for assigning orders[cite: 1]
│   ├── models/                # Database schemas (Data Layer)[cite: 1]
│   │   ├── Inventory.js       # Tracks product quantities per warehouse[cite: 1]
│   │   ├── Order.js           # Customer orders[cite: 1]
│   │   ├── Product.js         # Product catalog[cite: 1]
│   │   ├── User.js            # User accounts[cite: 1]
│   │   └── Warehouse.js       # Fulfillment centers[cite: 1]
│   ├── routes/
│   │   └── api.js             # Express API routes definition[cite: 1]
│   ├── index.js               # Server entry point[cite: 1]
│   └── seed.js                # Database initialization script[cite: 1]
│
├── package.json               # Root workspace metadata[cite: 1]
└── .gitignore                 # Version control exclusions[cite: 1]

```

---

## 🗄 Database Schemas

The application relies on five primary interconnected schemas located in `server/models/`.

### Product (`models/Product.js`)

Stores global product catalog data.

* **Fields:** `name`, `sku`, `price`, `description`

### Warehouse (`models/Warehouse.js`)

Represents physical locations where inventory is stored.

* **Fields:** `name`, `location` (coordinates), `capacity`, `isActive`

### Inventory (`models/Inventory.js`)

A junction table mapping Products to Warehouses with current stock levels.

* **Fields:** `warehouseId` (Ref: Warehouse), `productId` (Ref: Product), `quantity`

### Order (`models/Order.js`)

Captures customer requests.

* **Fields:** `customerDetails`, `items` (Array of Product IDs and quantities), `status` (Pending, Routed, Shipped), `assignedWarehouse` (Ref: Warehouse)

### User (`models/User.js`)

Manages staff and administrative access.

* **Fields:** `email`, `passwordHash`, `role`

---

## 🛣 API Routes

All backend endpoints are centralized in `server/routes/api.js`, establishing a clean RESTful interface for the client. Expected routes include:

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/inventory` | Fetch global stock levels. |
| `POST` | `/api/orders` | Submit a new order. Triggers the routing engine. |
| `GET` | `/api/warehouses` | Retrieve list of active warehouses. |
| `POST` | `/api/users/login` | Authenticate an administrative user. |

---

## ⚙️ Core Logic: Routing Engine

The architectural standout of this project is the `routingEngine.js` module. Instead of cramming complex business logic directly into route controllers, the decision logic is isolated here.

**How it works:**

1. When an order is placed via `POST /api/orders`, the request is passed to the engine.
2. The engine queries the **Inventory** and **Warehouse** models to determine stock availability.
3. It algorithmically selects the optimal warehouse based on predefined parameters (e.g., closest proximity, highest stock availability, or lowest operational cost).
4. The engine updates the **Order** status and assigns the optimal warehouse.

---

## 🎨 Frontend Details

The client application is built with **React**, utilizing **TypeScript** for strict type safety and **Vite** for rapid bundling and hot module replacement.

### Key Components (`client/src/components/`)



* **`Sidebar.tsx`**: Provides persistent navigation across different administrative views.
* **`Dashboard.tsx`**: The main landing page post-login, aggregating data visualizations.
* **`OrderCreator.tsx`**: A form-based interface for staff to manually input new fulfillment requests.
* **`InventoryManager.tsx`**: A tabular view allowing users to update product quantities.
* **`WarehouseMap.tsx`**: Likely integrates a mapping library to provide geospatial context for warehouse locations.

### API Integration

The `api.ts` file acts as the central service layer, exporting strongly-typed functions that utilize `fetch` or `axios` to communicate with the `server/routes/api.js` endpoints.

---

## 🔑 Environment Variables

To run the application locally, you will need to configure environment variables. Create a `.env` file in the `server/` directory:

```env
PORT=5000                           # Express server port
MONGODB_URI=mongodb://127.0.0.1:27017/order_routing  # Database connection string
JWT_SECRET=your_jwt_secret_here     # Authentication secret

```

---

## 🚀 Getting Started

### Prerequisites

* **Node.js** (v18+ recommended)
* **MongoDB** (running locally or via Atlas)

### Installation

1. **Clone the repository and install root dependencies:**
```bash

```



npm install

```

2.  **Setup the Backend:**
    ```bash
cd server
npm install
node seed.js  # Populate the DB with initial data

```

3. **Setup the Frontend:**
```bash

```



cd ../client
npm install

```

4.  **Run the Application (Development Mode):**
    Open two terminal windows.
    *   *Terminal 1 (Backend):* `cd server && npm run dev`
    *   *Terminal 2 (Frontend):* `cd client && npm run dev`

5.  **Access the Application:**
    Navigate to `http://localhost:5173` (default Vite port) in your browser.

```
