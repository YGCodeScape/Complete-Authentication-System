# 🔐 Complete Authentication System (Node.js + JWT + OTP)

![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![Express](https://img.shields.io/badge/Express.js-Framework-black)
![MySQL](https://img.shields.io/badge/MySQL-Database-blue)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![Security](https://img.shields.io/badge/Security-High-brightgreen)
![Status](https://img.shields.io/badge/Status-Production--Ready-success)

---

## 📌 Overview

A **production-ready authentication system** built using Node.js, Express, and MySQL with advanced security features like:

* Email OTP Verification
* JWT Authentication (Access + Refresh Tokens)
* Session Management
* Refresh Token Rotation
* Secure Cookie Handling

This system is designed to be **reusable across multiple projects** like SaaS apps, startups, and final-year projects.

---

## 🚀 Features

* 🔐 Secure User Registration with Email OTP
* ✅ Email Verification before account activation
* 🔑 Login with Access & Refresh Tokens
* ♻️ Refresh Token Rotation
* 📱 Multi-device session handling
* 🚪 Logout (single device & all devices)
* 🍪 HTTP-only secure cookies
* 🔒 Password & token hashing (bcrypt)

---

## 🧱 Tech Stack

* **Backend:** Node.js, Express.js
* **Database:** MySQL (mysql2)
* **Authentication:** JWT (jsonwebtoken)
* **Security:** bcrypt
* **Email Service:** Nodemailer + Google OAuth2

---

## 📁 Project Structure

```
server.js
src/
 ├── app.js
 ├── config/
 │    ├── config.js
 │    └── mail.js
 ├── controllers/
 │    └── auth.controller.js
 ├── models/
 │    ├── user.model.js
 │    ├── session.model.js
 │    └── otp.model.js
 ├── routes/
 │    └── auth.routes.js
 └── utils/
      └── otp.js
```

---

## ⚙️ Installation

### 1. Clone Repository

```bash
git clone https://github.com/YGCodeScape/Complete-Authentication-System.git
cd Complete Authentication System
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env` file:

```env
PORT=3000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=yourdbname
DB_PORT=3306

JWT_SECRET=your_jwt_secret

GOOGLE_EMAIL=your_email@gmail.com
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token
```

### 4. Run Server

```bash
npm start
```

---

## 🔌 API Endpoints

### Auth Routes (`/api/auth`)

| Method | Endpoint       | Description              |
| ------ | -------------- | ------------------------ |
| POST   | /register      | Register user & send OTP |
| POST   | /verify-email  | Verify OTP               |
| POST   | /login         | Login user               |
| GET    | /get-me        | Get current user         |
| GET    | /refresh-token | Get new access token     |
| GET    | /logout        | Logout current session   |
| GET    | /logoutAll     | Logout from all devices  |

---

## 🔄 Authentication Flow

### 1. Register

* User submits details
* OTP sent to email
* User must verify before login

### 2. Login

* Creates session
* Returns access token
* Stores refresh token in cookie

### 3. Access Protected Routes

* Uses access token (15 min expiry)

### 4. Refresh Token

* Generates new access token
* Rotates refresh token

### 5. Logout

* Revokes session

---

## 🔐 Security Highlights

* Password hashing using bcrypt
* OTP stored as hashed value
* Refresh token stored as hash in DB
* HTTP-only cookies (prevents XSS)
* Token expiration strategy
* Session-based validation
* Refresh token rotation

---

## ♻️ Reusability

You can reuse this authentication system in:

* Final Year Projects
* Startup MVPs
* SaaS Platforms
* Client Projects

### How to reuse:

* Copy auth module
* Update DB config
* Extend user schema if needed

---

## 📌 Future Improvements

* Rate limiting (OTP & login protection)
* Resend OTP with cooldown
* Role-based authentication (RBAC)
* Middleware for route protection

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first.

---

## 📜 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Yash**

---

## ⭐ Support

If you found this useful, give it a ⭐ on GitHub!
