package com.example.taskflow.service;

import com.example.taskflow.model.Project;
import com.example.taskflow.model.User;
import com.example.taskflow.repository.ProjectRepository;
import com.example.taskflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service layer for Project business logic with RBAC enforcement.
 * ROLE_ADMIN can access all projects; ROLE_USER is scoped to their own projects.
 */
@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    private boolean isAdmin(String role) {
        return "ROLE_ADMIN".equals(role);
    }

    /**
     * Retrieve all projects.
     * Admin: returns all projects in the system.
     * User: returns only projects owned by the caller.
     */
    public List<Project> getAllProjects(Long userId, String role) {
        if (isAdmin(role)) {
            return projectRepository.findAll();
        }
        return projectRepository.findByCreatedById(userId);
    }

    /**
     * Retrieve a project by ID.
     * Admin: unrestricted — can access any project.
     * User: must own the project.
     */
    public Project getProjectById(Long id, Long userId, String role) {
        if (isAdmin(role)) {
            return projectRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
        }
        return projectRepository.findByIdAndCreatedById(id, userId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
    }

    /**
     * Filter projects by status.
     * Admin: all projects with that status.
     * User: only their projects with that status.
     */
    public List<Project> getProjectsByStatus(Project.ProjectStatus status, Long userId, String role) {
        if (isAdmin(role)) {
            return projectRepository.findByStatus(status);
        }
        return projectRepository.findByCreatedByIdAndStatus(userId, status);
    }

    /**
     * Create a new project, automatically assigning the authenticated user as owner.
     */
    public Project createProject(Project project, Long userId) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        project.setCreatedBy(owner);
        return projectRepository.save(project);
    }

    /**
     * Update an existing project.
     * Admin: can update any project.
     * User: can only update their own project.
     */
    public Project updateProject(Long id, Project updatedProject, Long userId, String role) {
        Project existing = getProjectById(id, userId, role);
        existing.setName(updatedProject.getName());
        existing.setDescription(updatedProject.getDescription());
        existing.setStatus(updatedProject.getStatus());
        return projectRepository.save(existing);
    }

    /**
     * Delete a project.
     * Admin: can delete any project.
     * User: can only delete their own project.
     */
    public void deleteProject(Long id, Long userId, String role) {
        getProjectById(id, userId, role); // throws if not found / unauthorized
        projectRepository.deleteById(id);
    }
}
