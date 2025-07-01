
# Identity Reconciliation Service

<p align="center">
  <img alt="Docker" src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white"/>
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"/>
  <img alt="npm" src="https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white"/>
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white"/>
  <img alt="Express.js" src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white"/>
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white"/>
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
</p>

## 🚀 Hosted Version

You can directly test the deployed app on [Railway](https://identityreconcillation-production.up.railway.app):

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
        "email": "john.doe@example.com",
        "phoneNumber": "1234567890"
      }' \
  https://identityreconcillation-production.up.railway.app/identify

curl https://identityreconcillation-production.up.railway.app/health
```

---

## Table of Contents

- [Project Description](#project-description)
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
- [Project Structure](#project-structure)
- [License](#license)

## Project Description

This service implements the Identity Reconciliation logic to unify and link customer contact information (phone numbers and emails). It manages primary and secondary contact relationships, ensuring data integrity and providing a consolidated view of customer identities based on shared contact details.

The application intelligently handles various scenarios:

- **New Contact**: Creates a new primary contact if no matching email or phone number exists.
- **Linking Existing Contacts**: If an incoming contact shares an email or phone number with an existing primary contact, the new contact is linked as a secondary.
- **Merging Primary Contacts**: If an incoming contact links two previously distinct primary contacts, the older primary remains primary, and the newer primary (and its linked secondaries) are converted to secondary contacts.

### Contact Table Schema

```ts
{
  id: Int
  phoneNumber: String?
  email: String?
  linkedId: Int? // the ID of another Contact linked to this one
  linkPrecedence: "secondary" | "primary"
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt: DateTime?
}
```

## Features

- Automatic Contact Linking
- Primary/Secondary Designation
- Dynamic Identity Merging
- Consolidated Identity View
- New Contact Creation
- Rate Limiting
- Health Check
- Containerized Development

## Tech Stack

- **Backend**: Node.js (v18+)
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL (v15)
- **Containerization**: Docker, Docker Compose
- **Validation**: Joi
- **Rate Limiting**: express-rate-limit

## Prerequisites

- Git
- Node.js (v18+)
- npm
- Docker Desktop (recommended)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/identity-reconciliation-service.git
cd identity-reconciliation-service
```

### 2. Environment Variables

Create a `.env` file in the root using `.env.example` as a reference. Do not commit `.env` to Git.

### 3. Docker Setup (Recommended)

```bash
docker compose down -v
docker compose build
docker compose up -d

# Run migrations
docker compose exec app npx prisma migrate dev --name init
docker compose exec app npx prisma generate
```

### 4. Local Setup (Alternative - Not Recommended)

- Install Node.js, npm, and PostgreSQL locally
- Create `identity_db` and user `identity_user:bitspeed`
- Run:

```bash
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run build
npm run start
```

## Demo & Local Testing

- Hosted: [Railway](https://identityreconcillation-production.up.railway.app)
- Local: http://localhost:3000

### 1. Health Check

```bash
curl https://identityreconcillation-production.up.railway.app/health
# or locally: curl http://localhost:3000/health
```

### 2. Identify Endpoint

```json
POST /identify
{
  "email"?: string,
  "phoneNumber"?: string
}
```

**Example:**

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
        "email": "lorraine@hillvalley.edu",
        "phoneNumber": "123456"
      }' \
  https://identityreconcillation-production.up.railway.app/identify
```

**Response:**
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

## Project Structure

```
.
├── src/
│   ├── controllers/
│   ├── services/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.ts
│   └── types.ts
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── .env.example
├── .env
├── .dockerignore
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── README.md
```

## License

MIT License
