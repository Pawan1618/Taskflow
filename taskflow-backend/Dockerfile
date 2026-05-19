# =============================================
# Stage 1: Build — uses Maven + JDK 21 to compile and package
# =============================================
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Copy dependency descriptors first for layer caching
COPY pom.xml .
COPY src ./src

# Build the JAR, skipping tests (tests are run in CI pipeline)
RUN apk add --no-cache maven && \
    mvn clean package -DskipTests

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
