package com.example.taskflow.controller;

import com.example.taskflow.model.Project;
import com.example.taskflow.service.ProjectService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Project management endpoints.
 * Base path: /api/projects
 * All endpoints require a valid JWT cookie (set by JwtAuthFilter).
 */
@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    /** Helper to extract authenticated userId — returns null if not logged in */
    private Long getUserId(HttpServletRequest request) {
        return (Long) request.getAttribute("userId");
    }

    /** Return 401 response when userId is missing */
    private ResponseEntity<?> unauthorized() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required");
    }

    // GET /api/projects — fetch all projects owned by the current user
    @SuppressWarnings("unchecked")
    @GetMapping
    public ResponseEntity<List<Project>> getAllProjects(
            @RequestParam(required = false) Project.ProjectStatus status,
            HttpServletRequest request) {
        Long userId = getUserId(request);
        if (userId == null) return (ResponseEntity<List<Project>>) (ResponseEntity<?>) unauthorized();
        if (status != null) {
            return ResponseEntity.ok(projectService.getProjectsByStatus(status, userId));
        }
        return ResponseEntity.ok(projectService.getAllProjects(userId));
    }

    // GET /api/projects/{id} — fetch project by ID (must be owned by caller)
    @SuppressWarnings("unchecked")
    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id, HttpServletRequest request) {
        Long userId = getUserId(request);
        if (userId == null) return (ResponseEntity<Project>) (ResponseEntity<?>) unauthorized();
        return ResponseEntity.ok(projectService.getProjectById(id, userId));
    }

    // POST /api/projects — create a new project (owner set automatically)
    @SuppressWarnings("unchecked")
    @PostMapping
    public ResponseEntity<Project> createProject(@Valid @RequestBody Project project,
                                                 HttpServletRequest request) {
        Long userId = getUserId(request);
        if (userId == null) return (ResponseEntity<Project>) (ResponseEntity<?>) unauthorized();
        Project created = projectService.createProject(project, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // PUT /api/projects/{id} — update an existing project (must be owned by caller)
    @SuppressWarnings("unchecked")
    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable Long id,
                                                 @Valid @RequestBody Project project,
                                                 HttpServletRequest request) {
        Long userId = getUserId(request);
        if (userId == null) return (ResponseEntity<Project>) (ResponseEntity<?>) unauthorized();
        return ResponseEntity.ok(projectService.updateProject(id, project, userId));
    }

    // DELETE /api/projects/{id} — delete a project (must be owned by caller)
    @SuppressWarnings("unchecked")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id, HttpServletRequest request) {
        Long userId = getUserId(request);
        if (userId == null) return (ResponseEntity<Void>) (ResponseEntity<?>) unauthorized();
        projectService.deleteProject(id, userId);
        return ResponseEntity.noContent().build();
    }
}
