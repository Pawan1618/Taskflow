# =============================================
# Stage 1: Build — uses Maven to compile and package the application
# =============================================
FROM eclipse-temurin:17-jdk-alpine AS builder

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
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy the compiled JAR from the builder stage
COPY --from=builder /app/target/*.jar taskflow.jar

# Expose application port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "taskflow.jar"]
