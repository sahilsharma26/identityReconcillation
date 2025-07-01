Identity Reconciliation Service
Table of Contents
Project Description

Features

Tech Stack

Prerequisites

Getting Started

1. Clone the Repository

2. Environment Variables

3. Docker Setup (Recommended)

4. Local Setup (Alternative)

Demo & Local Testing

API Endpoints

POST /identify

Project Structure

License

Project Description
This service implements the Identity Reconciliation logic to unify and link customer contact information (phone numbers and emails). It manages primary and secondary contact relationships, ensuring data integrity and providing a consolidated view of customer identities based on shared contact details.

Contact Table Schema
{
	id                   Int                   
  phoneNumber          String?
  email                String?
  linkedId             Int? // the ID of another Contact linked to this one
  linkPrecedence       "secondary"|"primary" // "primary" if it's the first Contact in the link
  createdAt            DateTime              
  updatedAt            DateTime              
  deletedAt            DateTime?
}

Features
Automatic Contact Linking: Links contacts based on common email addresses or phone numbers.

Primary/Secondary Designation: Assigns primary or secondary precedence, with the oldest contact as primary.

Dynamic Identity Merging: Merges previously separate primary contacts when a linking event occurs.

Consolidated Identity View: Returns a unified JSON response of linked contacts.

New Contact Creation: Creates new primary contacts for unlinked incoming requests.

Rate Limiting: Protects the API endpoint from excessive requests.

Health Check: Provides a simple endpoint for service status monitoring.

Containerized Development: Utilizes Docker and Docker Compose for a consistent, isolated development environment.

Tech Stack
Backend: Node.js (v18+)

Framework: Express.js

Language: TypeScript

ORM: Prisma (with Prisma Client)

Database: PostgreSQL (v15)

Containerization: Docker, Docker Compose

Validation: Joi

Rate Limiting: express-rate-limit

Prerequisites
Ensure you have the following installed:

Git

Node.js (v18 or higher) - Only for local setup.

npm (comes with Node.js)

Docker Desktop (Recommended)

Getting Started
Follow these steps to set up and run the service.

1. Clone the Repository
git clone https://github.com/YOUR_USERNAME/identity-reconciliation-service.git
cd identity-reconciliation-service

2. Environment Variables
Create a .env file in the project root based on .env.example. This .env file should NOT be committed to Git.

3. Docker Setup (Recommended)
This is the preferred way to run the service.

Install Docker Desktop
If not already installed, download and install Docker Desktop: Docker Desktop Download.

macOS (via Homebrew): brew install --cask docker

Launch Docker Desktop manually after installation.

Build and Run Services
From the project root in your terminal:

Clean up previous Docker data (if any):

docker compose down -v

Build Docker images:

docker compose build

Start services (app and database):

docker compose up -d

Database Initialization (Prisma Migrations)
Run Prisma migrations:

docker compose exec app npx prisma migrate dev --name init

Type y when prompted by Prisma.

Generate Prisma Client:

docker compose exec app npx prisma generate

Your application should now be fully running and connected to the database.

4. Local Setup (Alternative - Not Recommended)
To run without Docker:

Install Node.js (v18+), npm, and PostgreSQL (v15) locally.

Manually create identity_db database and identity_user:bitspeed credentials.

Install dependencies: npm install

Set up .env: Ensure DATABASE_URL points to your local PostgreSQL.

Run Prisma migrations: npx prisma migrate dev --name init

Generate Prisma client: npx prisma generate

Build application: npm run build

Start application: npm run start

Demo & Local Testing
This section guides you on testing the running service. The service will be accessible at http://localhost:3000 by default.

1. Health Check
Verify the service is running and responsive.

Request:

curl http://localhost:3000/health

Expected Response (200 OK):

{"status":"healthy","timestamp":"YYYY-MM-DDTHH:MM:SS.SSSZ","environment":"development"}

2. Identify Endpoint (POST /identify)
Use curl or a tool like Postman/Insomnia to send POST requests to http://localhost:3000/identify. Refer to the API Endpoints section below for detailed request/response formats.

API Endpoints
POST /identify
This endpoint processes contact information for identity reconciliation based on the problem statement guidelines.

URL: /identify

Method: POST

Request Body (JSON):

{
  "email"?: string,
  "phoneNumber"?: string
}

At least one of email or phoneNumber must be provided.

Example Request:

curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"email": "lorraine@hillvalley.edu", "phoneNumber": "123456"}' \
  http://localhost:3000/identify

Success Response Format (200 OK):

{
    "contact": {
        "primaryContactId": 1,
        "emails": ["lorraine@hillvalley.edu", "mcfly@hillvalley.edu"],
        "phoneNumbers": ["123456"],
        "secondaryContactIds": [23]
    }
}

Error Responses:

400 Bad Request: Invalid request format or missing required fields (e.g., neither email nor phoneNumber provided).

500 Internal Server Error: For unhandled server-side errors.

Project Structure
.
├── src/
│   ├── controllers/         # Handles API request logic
│   ├── services/            # Business logic
│   ├── models/              # Prisma-generated client, interfaces
│   ├── routes/              # API routes definition
│   ├── utils/               # Utility functions (e.g., error handling, validators)
│   ├── server.ts            # Main application entry point
│   └── types.ts             # Custom TypeScript types/interfaces
├── prisma/
│   ├── migrations/          # Database migration files
│   └── schema.prisma        # Database schema definition
├── .env.example             # Example environment variables
├── .env                     # Your local environment variables (NOT committed to Git)
├── .dockerignore            # Specifies files to ignore when building Docker images
├── .gitignore               # Specifies files to ignore for Git
├── Dockerfile               # Instructions to build the Docker image for the app
├── docker-compose.yml       # Defines multi-container Docker application
├── package.json             # Project metadata and dependencies
├── tsconfig.json            # TypeScript configuration
└── README.md                # Project README (this file)

License
This project is licensed under the MIT License.




