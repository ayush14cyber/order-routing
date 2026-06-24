# Warehouse Routing Engine

A full-stack web application designed for intelligent order routing, warehouse visualization, and inventory management.

## 🌟 Features

- **Dashboard**: High-level overview of active orders and inventory status.
- **Warehouse Map**: Interactive map visualization of warehouses and routing using Leaflet.
- **Inventory Management**: Manage product stocks across different warehouses.
- **Intelligent Order Routing**: An automated engine that assigns orders to the optimal warehouse based on customer location (distance) and product availability.
- **Authentication**: Simple role-based login system for different types of users.

## 🛠️ Tech Stack

**Client-Side:**
- React 19
- TypeScript
- Vite
- React Router DOM for routing
- Leaflet & React-Leaflet for map visualizations
- Lucide React for modern icons
- Tailwind/CSS for styling

**Server-Side:**
- Node.js & Express.js
- MongoDB & Mongoose for the database
- Dotenv for environment variables
- CORS

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
npm run dev
```

This will:
- Start the Express server on `http://localhost:5000` (or your configured port).
- Start the Vite development server for the React client.

Alternatively, you can run them separately:
- **Server**: `npm run start:server` (from root) or `npm run dev` (inside the `server` folder).
- **Client**: `npm run start:client` (from root) or `npm run dev` (inside the `client` folder).

## 📁 Project Structure

```
.
├── client/                 # Frontend React Application
│   ├── src/
│   │   ├── components/     # UI Components (Dashboard, Map, Inventory, etc.)
│   │   ├── App.tsx         # Main Application Entry
│   │   └── api.ts          # API Configuration
│   └── package.json
├── server/                 # Backend Express Application
│   ├── models/             # Mongoose Schemas (User, Warehouse, Order, Product, etc.)
│   ├── routes/             # API Endpoints (api.js)
│   ├── engine/             # Logic for intelligent order routing
│   ├── index.js            # Server Entry Point
│   └── package.json
├── package.json            # Root configuration and concurrent scripts
└── README.md
```

## 🔌 API Endpoints

The backend exposes several RESTful endpoints under `/api`:

- **Auth**: `POST /api/login`
- **Warehouses**: `GET /api/warehouses`, `POST /api/warehouses`
- **Products**: `GET /api/products`, `POST /api/products`
- **Inventory**: `GET /api/inventory`, `POST /api/inventory`
- **Orders**: `GET /api/orders`, `POST /api/orders`, `PATCH /api/orders/:id`
