# =============================================
# Stage 1: Build — full JDK to compile the JAR
# =============================================
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Copy Maven wrapper and pom first (layer cache for dependencies)
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .

# Make mvnw executable and download dependencies
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy source and build, skipping tests (tests run in CI separately)
COPY src ./src
RUN ./mvnw package -DskipTests -B

# =============================================
# Stage 2: Run — lightweight JRE-only image
# =============================================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy the compiled JAR from the builder stage
COPY --from=builder /app/target/taskflow-1.0.0.jar taskflow.jar

# Expose application port
EXPOSE 8081

# Run the Spring Boot application
ENTRYPOINT ["java", "-jar", "taskflow.jar"]
