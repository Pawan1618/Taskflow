package com.example.taskflow.service;

import com.example.taskflow.model.Project;
import com.example.taskflow.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service layer for Project business logic.
 */
@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    // Retrieve all projects
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    // Retrieve a project by ID
    public Project getProjectById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
    }

    // Filter projects by status
    public List<Project> getProjectsByStatus(Project.ProjectStatus status) {
        return projectRepository.findByStatus(status);
    }

    // Create a new project
    public Project createProject(Project project) {
        return projectRepository.save(project);
    }

    // Update an existing project
    public Project updateProject(Long id, Project updatedProject) {
        Project existing = getProjectById(id);
        existing.setName(updatedProject.getName());
        existing.setDescription(updatedProject.getDescription());
        existing.setStatus(updatedProject.getStatus());
        return projectRepository.save(existing);
    }

    // Delete a project by ID
    public void deleteProject(Long id) {
        getProjectById(id); // throws if not found
        projectRepository.deleteById(id);
    }
}
