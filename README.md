# 📚 BookHaven — Online Book Store

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![EJS](https://img.shields.io/badge/EJS_Templates-B4CA65?style=for-the-badge&logo=ejs&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

A modern, responsive, and secure full-stack Online Book Store built with **Node.js, Express, MySQL, EJS, and Tailwind CSS**.

---

## ⚡ Tech Stack & Software Used

| Layer | Technologies / Packages |
| :--- | :--- |
| **Backend & Runtime** | Node.js (v18+), Express.js (MVC Architecture) |
| **Database** | MySQL (Connection Pooling with `mysql2/promise`) |
| **Frontend & UI** | EJS Templating, Tailwind CSS, FontAwesome 6.5, Vanilla JS |
| **Security & Auth** | `bcryptjs` (Password Hashing), `express-session`, `helmet`, `express-rate-limit`, `express-validator` |
| **Tools & Environment** | VS Code, MySQL Workbench / phpMyAdmin, npm, Git |

---

## 🚀 Quick Setup & Installation Guide

Follow these simple steps to run the project locally on your machine:

### 1. Clone & Install
```bash
git clone https://github.com/VAJIDV11/online-book-store-1.git
cd online-book-store-1
npm install
```

### 2. Configure Environment (`.env`)
Create a `.env` file in the root folder (or copy from `.env.example`):
```env
PORT=3000
NODE_ENV=development

# MySQL Credentials
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=bookstore_db
DB_PORT=3306

SESSION_SECRET=bookstore_secure_secret_key_2026
```

### 3. Setup MySQL Database
Import `schema.sql` into MySQL (via MySQL CLI, MySQL Workbench, or phpMyAdmin):
```bash
mysql -u root -p < schema.sql
```

*(Optional) To sync demo accounts and covers:*
```bash
npm run seed
```

### 4. Start Application
```bash
# Production mode
npm start

# Development mode (with live reload)
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 🔑 Demo Accounts

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **🛡️ Admin** | `admin@bookstore.com` | `Admin@12345` | Admin Dashboard, Book Inventory CRUD & Order Management |
| **👤 Customer** | `user@bookstore.com` | `User@12345` | Catalogue Browsing, Cart, Checkout & Order History |

---

## 📸 Output & Application Screenshots

> *Add your screenshots inside the `screenshots/` directory to display them here.*

### 1. Home Page & Featured Collection
Hero banner, genre categories, and trending books showcase.
![Home Page](screenshots/home.png)

### 2. Catalogue with Dynamic Filters & Quick-View
Real-time filtering by category, price slider, rating, search, and modal overlay.
![Catalogue Page](screenshots/catalogue.png)

### 3. Book Details & Overview
Synopsis, ISBN, stock indicator, review metrics, and genre suggestions.
![Book Details](screenshots/book-detail.png)

### 4. Shopping Cart & Checkout
Live quantity updates, sales tax (5%), shipping calculation, and instant receipt generation.
![Cart & Checkout](screenshots/cart.png)

### 5. Admin Management Dashboard
Store sales analytics, low-stock warnings, and book inventory management.
![Admin Dashboard](screenshots/admin.png)

---

## 🌟 Key Features Summary

- 🔍 **Dynamic Catalogue:** Multi-filtering by category, price range, ratings, and keyword search with pagination.
- 🛒 **Persistent Cart:** Session-to-database cart synchronization and atomic checkout transactions.
- 🔐 **Security Hardened:** Bcrypt password hashing, session fixation mitigation, Helmet headers, and rate limiting.
- 📊 **Admin Dashboard:** Real-time revenue metrics, stock level alerts, and book inventory CRUD.
- 📱 **Fully Responsive:** Mobile-first design styled with Tailwind CSS.

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
