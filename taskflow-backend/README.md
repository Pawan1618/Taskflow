# TaskFlow: A Containerized Task Management RESTful Service

## Overview
TaskFlow is a backend RESTful API built with **Spring Boot** and **Maven**, designed to manage projects, tasks, and users. It is containerized with **Docker** and includes a **GitHub Actions** CI/CD pipeline for automated building and testing.

---

## Tech Stack
| Layer        | Technology                    |
|--------------|-------------------------------|
| Language     | Java 17                       |
| Framework    | Spring Boot 3.x               |
| Build Tool   | Apache Maven                  |
| Database     | H2 (dev) / PostgreSQL (prod)  |
| Container    | Docker (multi-stage build)    |
| CI/CD        | GitHub Actions                |

---

## Project Structure
```
taskflow-backend/
├── src/main/java/com/example/taskflow/
│   ├── TaskflowApplication.java   # Entry point
│   ├── config/
│   │   └── CorsConfig.java        # CORS configuration
│   ├── controller/
│   │   ├── UserController.java    # /api/users
│   │   ├── ProjectController.java # /api/projects
│   │   └── TaskController.java    # /api/tasks
│   ├── model/
│   │   ├── User.java
│   │   ├── Project.java
│   │   └── Task.java
│   ├── repository/
│   │   ├── UserRepository.java
│   │   ├── ProjectRepository.java
│   │   └── TaskRepository.java
│   └── service/
│       ├── UserService.java
│       ├── ProjectService.java
│       └── TaskService.java
├── src/main/resources/
│   └── application.properties
├── src/test/java/...
│   └── TaskflowApplicationTests.java
├── Dockerfile
└── pom.xml
```

---

## API Endpoints

### Users — `/api/users`
| Method | Endpoint        | Description        |
|--------|-----------------|--------------------|
| GET    | `/api/users`    | Get all users      |
| GET    | `/api/users/{id}`| Get user by ID    |
| POST   | `/api/users`    | Create a new user  |
| PUT    | `/api/users/{id}`| Update a user     |
| DELETE | `/api/users/{id}`| Delete a user     |

### Projects — `/api/projects`
| Method | Endpoint              | Description               |
|--------|-----------------------|---------------------------|
| GET    | `/api/projects`       | Get all projects (filter: `?status=ACTIVE`) |
| GET    | `/api/projects/{id}`  | Get project by ID         |
| POST   | `/api/projects`       | Create a new project      |
| PUT    | `/api/projects/{id}`  | Update a project          |
| DELETE | `/api/projects/{id}`  | Delete a project          |

### Tasks — `/api/tasks`
| Method | Endpoint                       | Description                  |
|--------|--------------------------------|------------------------------|
| GET    | `/api/tasks`                   | Get all tasks                |
| GET    | `/api/tasks/{id}`              | Get task by ID               |
| GET    | `/api/tasks/project/{pid}`     | Get tasks for a project      |
| GET    | `/api/tasks/user/{uid}`        | Get tasks assigned to a user |
| POST   | `/api/tasks?projectId=1`       | Create a task                |
| PUT    | `/api/tasks/{id}`              | Update a task                |
| DELETE | `/api/tasks/{id}`              | Delete a task                |

---

## Running Locally

### Prerequisites
- Java 17+
- Maven 3.8+

```bash
cd taskflow-backend
mvn spring-boot:run
```
Access the API at `http://localhost:8080`  
H2 Console at `http://localhost:8080/h2-console`

### Running with Docker
```bash
cd taskflow-backend
docker build -t taskflow-backend .
docker run -p 8080:8080 taskflow-backend
```

---

## CI/CD Pipeline
Every push to `main` triggers the GitHub Actions workflow (`.github/workflows/ci-cd.yml`) which:
1. ✅ Builds the backend with Maven and runs all tests
2. ✅ Builds the backend Docker image
3. ✅ Builds the React frontend

---

## License
MIT
