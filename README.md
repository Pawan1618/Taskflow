# 🚀 TaskFlow — Enterprise-Grade Task & Project Management System

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/Pawan1618/Taskflow)
[![Java](https://img.shields.io/badge/Java-17%2B-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.5-green.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED.svg)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1.svg)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**TaskFlow** is a modern, full-stack, enterprise-grade task and project management platform built with **Spring Boot 3**, **React 18 (Vite)**, **PostgreSQL**, and **Docker**. Inspired by Jira and modern workspace productivity tools, TaskFlow features real-time state management, Role-Based Access Control (RBAC), HttpOnly JWT authentication, an interactive Gantt chart, and a drag-and-drop Kanban board.

---

## 🌟 Key Features

* **🛡️ Security & RBAC:**
  * **HttpOnly Cookie Authentication:** Secure JWT tokens stored in HttpOnly, SameSite cookies to prevent XSS attacks.
  * **Role-Based Access Control (RBAC):** Granular permissions for `ROLE_USER` and `ROLE_ADMIN` accounts.
  * **Owner Data Isolation:** Queries and mutations strictly scoped to project owners and assigned users.

* **📊 Interactive Visual Views:**
  * **Jira-Style Kanban Board:** Drag-and-drop task status progression with state transition validation (`TODO` ➔ `IN_PROGRESS` ➔ `DONE`).
  * **Interactive Gantt Chart:** Timeline visualization with priority color badges, date ranges, and completion progress metrics.
  * **Executive Dashboard:** Live statistics on overall completion rate, total projects, active tasks, and member velocity.

* **⚙️ Robust Backend & Database Engine:**
  * **Spring Boot 3 REST API:** Dynamic filtering, automated seed data migrations, and custom JPA repository queries.
  * **Multi-Database Support:** In-memory H2 database for instant local testing; PostgreSQL for production persistence.

* **🐳 Enterprise DevOps & Cloud Ready:**
  * **One-Command Orchestration:** Spin up the complete stack (Database + Backend + Frontend) using `docker compose up`.
  * **Single-Port Reverse Proxy:** Embedded Nginx reverse proxy routes all `/api` traffic internally to the Spring backend, simplifying single-port cloud deployment (e.g., Oracle Cloud, AWS EC2, GCP).
  * **Automated CI/CD:** GitHub Actions pipeline running Maven build verification, unit tests, and multi-stage container builds.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 18, Vite, Lucide Icons, Pure CSS Design System | High-performance SPA with Jira-inspired dark/light theme tokens |
| **Backend** | Java 17, Spring Boot 3.3.5, Spring Data JPA, Hibernate | RESTful microservice layer with validation and BCrypt hashing |
| **Security** | JJWT (io.jsonwebtoken), Spring Security Filter Chain | Stateless HttpOnly cookie authentication and request filtering |
| **Database** | PostgreSQL 15, H2 In-Memory DB | Relational data persistence with automatic schema migrations |
| **Reverse Proxy** | Nginx Alpine | Handles SPA client routing, asset caching, and `/api` reverse proxying |
| **Containerization** | Docker, Docker Compose | Multi-stage Docker builds optimized for minimal footprint |
| **CI/CD** | GitHub Actions | Automated build, test, and container packaging pipeline |

---

## 📁 System Architecture & Directory Tree

```
taskflow/
├── docker-compose.yml              # Complete multi-container orchestration
├── .github/workflows/
│   └── ci-cd.yml                   # GitHub Actions automated build & test pipeline
│
├── taskflow-backend/               # Spring Boot 3 RESTful API Service
│   ├── Dockerfile                  # Multi-stage Maven build container definition
│   ├── pom.xml                     # Maven dependencies (Spring Web, Data JPA, JWT, BCrypt)
│   └── src/
│       ├── main/java/com/example/taskflow/
│       │   ├── config/             # CorsConfig, JwtAuthFilter, DataMigrationRunner
│       │   ├── controller/         # AuthController, ProjectController, TaskController, UserController
│       │   ├── model/              # User, Project, Task entities & Enums (Role, Status, Priority)
│       │   ├── repository/         # UserRepository, ProjectRepository, TaskRepository
│       │   ├── service/            # UserService, ProjectService, TaskService (Business Logic)
│       │   └── util/               # JwtUtil (Token generation & validation)
│       └── test/                   # Unit test suite (ProjectServiceTest, TaskServiceTest, etc.)
│
└── taskflow-frontend/              # React 18 + Vite Web Client
    ├── Dockerfile                  # Node build + Nginx reverse proxy production container
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── components/             # KanbanBoard, GanttView, TaskModal, ProjectModal
        ├── components/layout/      # Navbar, Sidebar, PageContainer
        ├── pages/                  # Dashboard, Projects, Tasks, Auth (Login/Signup)
        ├── services/               # api.js (Axios wrapper with dynamic URL resolution)
        └── index.css               # Design system tokens & utility classes
```

---

## ⚡ Quick Start & Installation

### Option A: Running with Docker Compose (Recommended)

The easiest way to run TaskFlow is using Docker Compose. Make sure **Docker Desktop** is running, then execute:

```bash
# 1. Clone the repository
git clone https://github.com/Pawan1618/Taskflow.git
cd Taskflow

# 2. Start all services (PostgreSQL, Backend, Frontend)
docker compose up --build -d
```

Access the application:
* **Frontend Web App:** `http://localhost:5173` (or `http://localhost:80` via Docker)
* **Backend REST API:** `http://localhost:8081/api`
* **PostgreSQL Database:** `localhost:5432`

---

### Option B: Local Development (Without Docker)

#### Prerequisites:
* **JDK 17** or higher
* **Node.js 18+** and `npm`
* **Maven 3.8+**

#### 1. Start the Spring Boot Backend:
```bash
cd taskflow-backend
mvn spring-boot:run
```
* Backend runs at: `http://localhost:8081`
* H2 Console available at: `http://localhost:8081/h2-console` (JDBC URL: `jdbc:h2:mem:taskflowdb`)

#### 2. Start the React Frontend:
```bash
cd taskflow-frontend
npm install
npm run dev
```
* Frontend client runs at: `http://localhost:5173`

---

## 🔐 API Reference & Endpoints

### 🔑 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Public | Register a new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & set HttpOnly JWT cookie |
| `POST` | `/api/auth/logout` | Authenticated | Clear HttpOnly JWT authentication cookie |
| `GET` | `/api/auth/me` | Authenticated | Fetch current authenticated user profile & role |

### 📁 Projects (`/api/projects`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/projects` | User / Admin | List projects (scoped to caller's ownership unless Admin) |
| `GET` | `/api/projects/{id}` | Owner / Admin | Get project details by ID |
| `POST` | `/api/projects` | Authenticated | Create a new project (caller set as `createdBy`) |
| `PUT` | `/api/projects/{id}` | Owner / Admin | Update project details |
| `DELETE` | `/api/projects/{id}` | Owner / Admin | Delete project and associated tasks |

### 📋 Tasks (`/api/tasks`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/tasks` | User / Admin | Retrieve tasks belonging to user's projects |
| `GET` | `/api/tasks/project/{pid}` | Owner / Admin | Fetch all tasks for a specific project |
| `POST` | `/api/tasks?projectId={pid}` | Owner / Admin | Create a new task inside a project |
| `PUT` | `/api/tasks/{id}` | Assignee / Owner / Admin | Update task attributes and enforce FSM status transitions |
| `DELETE` | `/api/tasks/{id}` | Owner / Admin | Delete a task |

---

## ☁️ Cloud Deployment (Oracle Cloud / AWS / GCP)

TaskFlow is pre-configured for **single-port cloud VM deployments**. Nginx serves the React static bundle on Port `80` and proxies `/api/` traffic to the backend container internally.

### 1. Oracle Cloud VM Firewall Configuration (`iptables`)
```bash
# Allow HTTP traffic on Port 80
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT

# Save iptables rules permanently
sudo iptables-save | sudo tee /etc/sysconfig/iptables
```

### 2. Deploy Container Stack:
```bash
docker compose up -d --build
```

---

## 🧪 Running Unit & Integration Tests

Run the Maven backend test suite:
```bash
cd taskflow-backend
mvn test
```
Tests verify service layer business logic, RBAC permission checks, and repository lookup queries.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.

---

<p align="center">
  Made with ❤️ by <b>Pawan</b> • Built with Spring Boot 3 & React 18
</p>
