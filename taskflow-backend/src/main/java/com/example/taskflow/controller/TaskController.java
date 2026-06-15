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
 */
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    private Long getUserId(HttpServletRequest request) {
        return (Long) request.getAttribute("userId");
    }

    // GET /api/tasks — fetch all tasks belonging to the current user's projects
    @SuppressWarnings("unchecked")
    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks(HttpServletRequest request) {
        Long userId = getUserId(request);
        if (userId == null)
            return (ResponseEntity<List<Task>>) (ResponseEntity<?>) ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED).body("Authentication required");
        return ResponseEntity.ok(taskService.getAllTasks(userId));
    }

    // GET /api/tasks/{id} — fetch task by ID
    @SuppressWarnings("unchecked")
    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id, HttpServletRequest request) {
        if (getUserId(request) == null)
            return (ResponseEntity<Task>) (ResponseEntity<?>) ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED).body("Authentication required");
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    // GET /api/tasks/project/{projectId} — get all tasks for a project
    @SuppressWarnings("unchecked")
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Task>> getTasksByProject(@PathVariable Long projectId,
                                                        HttpServletRequest request) {
        if (getUserId(request) == null)
            return (ResponseEntity<List<Task>>) (ResponseEntity<?>) ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED).body("Authentication required");
        return ResponseEntity.ok(taskService.getTasksByProject(projectId));
    }

    // GET /api/tasks/user/{userId} — get all tasks assigned to a user
    @SuppressWarnings("unchecked")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Task>> getTasksByUser(@PathVariable Long userId,
                                                     HttpServletRequest request) {
        if (getUserId(request) == null)
            return (ResponseEntity<List<Task>>) (ResponseEntity<?>) ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED).body("Authentication required");
        return ResponseEntity.ok(taskService.getTasksByUser(userId));
    }

    // POST /api/tasks?projectId=1&assignedToId=2 — create a task under a project
    @SuppressWarnings("unchecked")
    @PostMapping
    public ResponseEntity<Task> createTask(
            @Valid @RequestBody Task task,
            @RequestParam Long projectId,
            @RequestParam(required = false) Long assignedToId,
            HttpServletRequest request) {
        if (getUserId(request) == null)
            return (ResponseEntity<Task>) (ResponseEntity<?>) ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED).body("Authentication required");
        Task created = taskService.createTask(task, projectId, assignedToId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // PUT /api/tasks/{id} — update a task
    @SuppressWarnings("unchecked")
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id,
                                           @Valid @RequestBody Task task,
                                           HttpServletRequest request) {
        if (getUserId(request) == null)
            return (ResponseEntity<Task>) (ResponseEntity<?>) ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED).body("Authentication required");
        return ResponseEntity.ok(taskService.updateTask(id, task));
    }

    // DELETE /api/tasks/{id} — delete a task
    @SuppressWarnings("unchecked")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id, HttpServletRequest request) {
        if (getUserId(request) == null)
            return (ResponseEntity<Void>) (ResponseEntity<?>) ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED).body("Authentication required");
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
