package com.example.taskflow.controller;

import com.example.taskflow.model.Project;
import com.example.taskflow.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Project management endpoints.
 * Base path: /api/projects
 */
@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    // GET /api/projects — fetch all projects (optional ?status=ACTIVE filter)
    @GetMapping
    public ResponseEntity<List<Project>> getAllProjects(
            @RequestParam(required = false) Project.ProjectStatus status) {
        if (status != null) {
            return ResponseEntity.ok(projectService.getProjectsByStatus(status));
        }
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    // GET /api/projects/{id} — fetch project by ID
    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    // POST /api/projects — create a new project
    @PostMapping
    public ResponseEntity<Project> createProject(@Valid @RequestBody Project project) {
        Project created = projectService.createProject(project);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // PUT /api/projects/{id} — update an existing project
    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable Long id,
                                                 @Valid @RequestBody Project project) {
        return ResponseEntity.ok(projectService.updateProject(id, project));
    }

    // DELETE /api/projects/{id} — delete a project
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }
}
