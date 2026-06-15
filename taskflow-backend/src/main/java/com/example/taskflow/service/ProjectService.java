package com.example.taskflow.service;

import com.example.taskflow.model.Project;
import com.example.taskflow.model.User;
import com.example.taskflow.repository.ProjectRepository;
import com.example.taskflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service layer for Project business logic.
 * All operations are scoped to the authenticated user (owner).
 */
@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    // Retrieve all projects owned by the given user
    public List<Project> getAllProjects(Long userId) {
        return projectRepository.findByCreatedById(userId);
    }

    // Retrieve a project by ID, only if it belongs to the given user
    public Project getProjectById(Long id, Long userId) {
        return projectRepository.findByIdAndCreatedById(id, userId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
    }

    // Filter projects by status, scoped to owner
    public List<Project> getProjectsByStatus(Project.ProjectStatus status, Long userId) {
        return projectRepository.findByCreatedByIdAndStatus(userId, status);
    }

    // Create a new project, automatically assigning the authenticated user as owner
    public Project createProject(Project project, Long userId) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        project.setCreatedBy(owner);
        return projectRepository.save(project);
    }

    // Update an existing project — only if owned by the caller
    public Project updateProject(Long id, Project updatedProject, Long userId) {
        Project existing = getProjectById(id, userId);
        existing.setName(updatedProject.getName());
        existing.setDescription(updatedProject.getDescription());
        existing.setStatus(updatedProject.getStatus());
        return projectRepository.save(existing);
    }

    // Delete a project by ID — only if owned by the caller
    public void deleteProject(Long id, Long userId) {
        getProjectById(id, userId); // throws if not found / not owned
        projectRepository.deleteById(id);
    }
}

