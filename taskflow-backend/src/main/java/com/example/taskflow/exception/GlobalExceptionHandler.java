package com.example.taskflow.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Centralized exception handler — converts exceptions into clean JSON error responses.
 * All API errors will now return a structured body instead of raw stack traces.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ---- 404 Not Found ----
    // Triggered when a resource is not found in the database (RuntimeException from services)
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        String msg = ex.getMessage() != null ? ex.getMessage() : "An unexpected error occurred";

        // Distinguish between "not found" and "conflict/bad request" messages
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        if (msg.contains("not found")) {
            status = HttpStatus.NOT_FOUND;
        } else if (msg.contains("already in use") || msg.contains("already exists")) {
            status = HttpStatus.CONFLICT;
        }

        return buildResponse(status, msg);
    }

    // ---- 400 Bad Request ----
    // Triggered by @Valid annotation failures on request bodies
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(MethodArgumentNotValidException ex) {
        String errors = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .collect(Collectors.joining(", "));

        return buildResponse(HttpStatus.BAD_REQUEST, "Validation failed: " + errors);
    }

    // ---- 500 Fallback ----
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error: " + ex.getMessage());
    }

    // Helper to build a consistent error response body
    private ResponseEntity<Map<String, Object>> buildResponse(HttpStatus status, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        return ResponseEntity.status(status).body(body);
    }
}
