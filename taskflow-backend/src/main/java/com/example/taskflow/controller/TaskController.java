package com.example.taskflow.controller;

import com.example.taskflow.model.Task;
import com.example.taskflow.service.TaskService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Task management endpoints.
 * Base path: /api/tasks
 * All endpoints require a valid JWT cookie (set by JwtAuthFilter).
 * userId and userRole are extracted from request attributes and forwarded
 * to the service for RBAC enforcement.
 */
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    /** Extract authenticated userId — null if not logged in */
    private Long getUserId(HttpServletRequest request) {
        return (Long) request.getAttribute("userId");
    }

    /** Extract userRole — defaults to ROLE_USER if missing */
    private String getUserRole(HttpServletRequest request) {
        String role = (String) request.getAttribute("userRole");
        return (role != null) ? role : "ROLE_USER";
    }

    /** Shared 401 guard — returns true if unauthenticated */
    private boolean isUnauthenticated(HttpServletRequest request) {
        return getUserId(request) == null;
    }

    // GET /api/tasks — fetch all tasks scoped to the current user's role
    @SuppressWarnings("unchecked")
    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks(HttpServletRequest request) {
        if (isUnauthenticated(request))
            return (ResponseEntity<List<Task>>) (ResponseEntity<?>) ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED).body("Authentication required");
        Long userId = getUserId(request);
        String role = getUserRole(request);
        return ResponseEntity.ok(taskService.getAllTasks(userId, role));
    }

    // GET /api/tasks/{id} — fetch task by ID (checks ownership)
    @SuppressWarnings("unchecked")
    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id, HttpServletRequest request) {
        if (isUnauthenticated(request))
            return (ResponseEntity<Task>) (ResponseEntity<?>) ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED).body("Authentication required");
        try {
            Long userId = getUserId(request);
            String role = getUserRole(request);
            return ResponseEntity.ok(taskService.getTaskById(id, userId, role));
        } catch (SecurityException e) {
            return (ResponseEntity<Task>) (ResponseEntity<?>) ResponseEntity
                    .status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    // GET /api/tasks/project/{projectId} — get all tasks for a project (checks ownership)
    @SuppressWarnings("unchecked")
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Task>> getTasksByProject(@PathVariable Long projectId,
                                                        HttpServletRequest request) {
        if (isUnauthenticated(request))
            return (ResponseEntity<List<Task>>) (ResponseEntity<?>) ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED).body("Authentication required");
        try {
            Long userId = getUserId(request);
            String role = getUserRole(request);
            return ResponseEntity.ok(taskService.getTasksByProject(projectId, userId, role));
        } catch (SecurityException e) {
            return (ResponseEntity<List<Task>>) (ResponseEntity<?>) ResponseEntity
                    .status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    // GET /api/tasks/user/{userId} — get all tasks assigned to a user
    @SuppressWarnings("unchecked")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Task>> getTasksByUser(@PathVariable Long userId,
                                                     HttpServletRequest request) {
        if (isUnauthenticated(request))
            return (ResponseEntity<List<Task>>) (ResponseEntity<?>) ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED).body("Authentication required");
        return ResponseEntity.ok(taskService.getTasksByUser(userId));
    }

    // POST /api/tasks?projectId=1&assignedToId=2 — create a task (checks project ownership)
    @SuppressWarnings("unchecked")
    @PostMapping
    public ResponseEntity<Task> createTask(
            @Valid @RequestBody Task task,
            @RequestParam Long projectId,
            @RequestParam(required = false) Long assignedToId,
            HttpServletRequest request) {
        if (isUnauthenticated(request))
            return (ResponseEntity<Task>) (ResponseEntity<?>) ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED).body("Authentication required");
        try {
            Long userId = getUserId(request);
            String role = getUserRole(request);
            Task created = taskService.createTask(task, projectId, assignedToId, userId, role);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (SecurityException e) {
            return (ResponseEntity<Task>) (ResponseEntity<?>) ResponseEntity
                    .status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    // PUT /api/tasks/{id} — update a task (checks ownership)
    @SuppressWarnings("unchecked")
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id,
                                           @Valid @RequestBody Task task,
                                           HttpServletRequest request) {
        if (isUnauthenticated(request))
            return (ResponseEntity<Task>) (ResponseEntity<?>) ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED).body("Authentication required");
        try {
            Long userId = getUserId(request);
            String role = getUserRole(request);
            return ResponseEntity.ok(taskService.updateTask(id, task, userId, role));
        } catch (SecurityException e) {
            return (ResponseEntity<Task>) (ResponseEntity<?>) ResponseEntity
                    .status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    // DELETE /api/tasks/{id} — delete a task (checks ownership)
    @SuppressWarnings("unchecked")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id, HttpServletRequest request) {
        if (isUnauthenticated(request))
            return (ResponseEntity<Void>) (ResponseEntity<?>) ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED).body("Authentication required");
        try {
            Long userId = getUserId(request);
            String role = getUserRole(request);
            taskService.deleteTask(id, userId, role);
            return ResponseEntity.noContent().build();
        } catch (SecurityException e) {
            return (ResponseEntity<Void>) (ResponseEntity<?>) ResponseEntity
                    .status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }
}
