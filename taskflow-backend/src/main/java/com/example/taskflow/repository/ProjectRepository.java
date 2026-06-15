package com.example.taskflow.repository;

import com.example.taskflow.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Project entity.
 */
@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    // Find all projects belonging to a specific owner
    List<Project> findByCreatedById(Long userId);

    // Find projects by owner and status
    List<Project> findByCreatedByIdAndStatus(Long userId, Project.ProjectStatus status);

    // Find all projects by their status (admin use)
    List<Project> findByStatus(Project.ProjectStatus status);

    // Find a project by ID that belongs to a specific owner
    Optional<Project> findByIdAndCreatedById(Long id, Long userId);

    // Search projects by name (case-insensitive)
    List<Project> findByNameContainingIgnoreCase(String name);
}
