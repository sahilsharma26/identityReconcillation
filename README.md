# 🧠 Identity Reconciliation Service

A Node.js-based microservice for intelligently linking and unifying customer contact information (emails and phone numbers). It ensures accurate contact relationships by maintaining a primary–secondary structure and dynamically merging identities based on shared contact details.

---

## 📚 Table of Contents

- [Project Description](#project-description)
- [Contact Table Schema](#contact-table-schema)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Environment Variables](#2-environment-variables)
  - [3. Docker Setup (Recommended)](#3-docker-setup-recommended)
  - [4. Local Setup (Alternative)](#4-local-setup-alternative)
- [Demo & Local Testing](#demo--local-testing)
- [API Endpoints](#api-endpoints)
  - [POST /identify](#post-identify)
- [Project Structure](#project-structure)
- [License](#license)

---

## 📖 Project Description

This service implements Identity Reconciliation logic to unify and link customer contact information (phone numbers and emails). It maintains **primary** and **secondary** contact relationships, ensuring a consolidated view of identities and preserving data integrity.

---

## 🗂️ Contact Table Schema

```prisma
{
  id             Int
  phoneNumber    String?
  email          String?
  linkedId       Int?                // ID of the primary contact (if this is secondary)
  linkPrecedence "primary"|"secondary" // "primary" if it's the root contact
  createdAt      DateTime
  updatedAt      DateTime
  deletedAt      DateTime?
}
```

---

## 🚀 Features

- 🔗 **Automatic Contact Linking**: Connects entries by shared emails or phone numbers.
- 👑 **Primary/Secondary Designation**: Assigns oldest record as primary.
- ♻️ **Dynamic Merging**: Unifies identities when previously separate primaries are linked.
- 🧩 **Consolidated Identity View**: Unified JSON response for contact sets.
- ➕ **New Contact Creation**: Creates new primary contacts for fresh entries.
- 🛡️ **Rate Limiting**: Prevents abuse of the API.
- ✅ **Health Check Endpoint**: Quickly verify service uptime.
- 🐳 **Containerized Setup**: Built using Docker + Docker Compose.

---

## 🛠️ Tech Stack

- **Backend**: Node.js (v18+)
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL (v15)
- **Validation**: Joi
- **Rate Limiting**: `express-rate-limit`
- **Containerization**: Docker, Docker Compose

---

## ⚙️ Prerequisites

Make sure you have the following tools installed:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) *(recommended)*

---

## 🧰 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/identity-reconciliation-service.git
cd identity-reconciliation-service
```

---

### 2. Environment Variables

- Copy `.env.example` to `.env`
- Fill in values accordingly
- **Do not commit** `.env` to Git

---

### 3. Docker Setup (Recommended)

```bash
# Stop and clean any old containers/volumes
docker compose down -v

# Build images
docker compose build

# Start containers
docker compose up -d

# Run migrations
docker compose exec app npx prisma migrate dev --name init

# Generate Prisma client
docker compose exec app npx prisma generate
```

---

### 4. Local Setup (Alternative)

> Only use this if Docker is not available.

```bash
# Install dependencies
npm install

# Ensure PostgreSQL is running and `identity_db` exists

# Run migration & generate client
npx prisma migrate dev --name init
npx prisma generate

# Build and start
npm run build
npm start
```

---

## 🧪 Demo & Local Testing

### 1. Health Check

```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-07-01T12:00:00.000Z",
  "environment": "development"
}
```

---

## 📬 API Endpoints

### POST `/identify`

Reconciles identity based on input contact info.

#### ✅ Request
```json
{
  "email": "lorraine@hillvalley.edu",
  "phoneNumber": "123456"
}
```

At least one of `email` or `phoneNumber` is required.

#### ✅ Success Response (200 OK)
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["lorraine@hillvalley.edu", "mcfly@hillvalley.edu"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": [23]
  }
}
```

#### ❌ Error Responses

- `400 Bad Request`: No contact info provided
- `500 Internal Server Error`: Unexpected server error

---

## 🗃️ Project Structure

```
.
├── src/
│   ├── controllers/         # API request handlers
│   ├── services/            # Business logic
│   ├── models/              # Prisma client & types
│   ├── routes/              # Route definitions
│   ├── utils/               # Validation and helpers
│   ├── server.ts            # Entry point
│   └── types.ts             # Custom TypeScript types
├── prisma/
│   ├── migrations/          # Prisma migrations
│   └── schema.prisma        # Data model
├── .env.example             # Sample env file
├── Dockerfile               # Docker image instructions
├── docker-compose.yml       # App + DB service
├── package.json             # App metadata and deps
├── tsconfig.json            # TypeScript config
└── README.md                # You are here
```

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).
