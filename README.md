# Ecomm-Inter: High-Performance E-commerce Service

A modern, full-stack e-commerce application built with a focus on **Asynchronous Backend Architecture**, modular design, and seamless User Experience. Developed as a technical demonstration for a robust, scalable trading platform.

---

## 🚀 Overview

**Ecomm-Inter** is a platform designed for high-concurrency commerce. It features a dual-actor system (Buyers and Sellers) with real-time stock management, secure JWT-based authentication, and a modular backend structure that follows clean architecture principles.

### Key Features

- **Seller Flow**: Multi-product inventory management with instant status updates.
- **Buyer Flow**: Seamless order placement with transactional integrity (atomic stock deductions).
- **Security**: Stateless JWT Authentication with refresh token rotation and HTTP-only cookie storage.
- **Reliability**: Asynchronous database operations using SQLAlchemy 2.0 and PostgreSQL (NeonDB).

---

## 🛠️ Technology Stack

| Layer            | Technology                                                                |
| :--------------- | :------------------------------------------------------------------------ |
| **Backend**      | Python 3.10+, FastAPI, SQLAlchemy (Async), PostgreSQL (Neon), Pydantic v2 |
| **Frontend**     | Next.js 14, TypeScript, React Query (TanStack), Tailwind CSS              |
| **Integrations** | JSON Web Tokens (JWT), Dotenv, Axios                                      |

---

## 🏗️ Backend Architecture

The backend is architected to be extensible and maintainable, utilizing a **Modular Controller-Service-Repository** pattern.

### 1. Database Schema

- **Users**: Extended with Role-Based Access Control (RBAC) (Seller vs Buyer).
- **Products**: Detailed inventory tracking with ownership linked to sellers.
- **Orders**: Transactional records that maintain consistency between quantity and price.

### 2. Implementation Highlights

- **Async I/O**: Every I/O operation (DB queries, password hashing) is non-blocking, ensuring the server can handle high throughput.
- **Transactional Integrity**: Order operations utilize SQLAlchemy sessions to ensure that if a stock update fails, the entire transaction is rolled back.
- **Modular Routing**: Clean separation of concerns with dedicated routers for Auth, Product, and Order modules.

---

## 📈 Future Roadmap & Enhancements

To make this production-ready for an enterprise scale, the following improvements are planned:

### 1. High-Performance Caching (Redis)

- **Problem**: Repeated database hits for popular product listings.
- **Solution**: Implement a Write-Through cache using Redis for the `get_all_products` endpoint to reduce latency from ~100ms to <10ms.

### 2. Distributed Task Queuing (Celery + RabbitMQ/Redis)

- **Problem**: Blocking operations like sending order confirmation emails or processing heavy images.
- **Solution**: Decouple these tasks into a background worker system using Celery, ensuring the main API thread remains responsive.

### 3. Elastic Search Integration

- **Problem**: SQL `LIKE` queries are inefficient for large scale product searching.
- **Solution**: Index product metadata into Elasticsearch/Meilisearch for blazingly fast full-text search and filtering.

### 4. WebSocket for Live Inventory

- **Problem**: Users seeing "In Stock" when a product just sold out.
- **Solution**: Implement FastAPI WebSockets to push real-time stock updates to all active clients when an order is finalized.

---

## 🛠️ Development Setup

### Backend

1. Create a virtual environment: `python -m venv .venv`
2. Install dependencies: `pip install -r requirements.txt`
3. Configure `.env` with `NEONDB_DATABASE_URL` and `JWT_ACCESS_SECRET`.
4. Run migrations: `alembic upgrade head`
5. Start server: `python main.py`

### Frontend

1. Install packages: `npm install`
2. Start dev server: `npm run dev`

---

## 📄 API Documentation

Once the backend is running, you can access the interactive Swagger documentation at:
`https://ecomm-inter.onrender.com/docs`

---
