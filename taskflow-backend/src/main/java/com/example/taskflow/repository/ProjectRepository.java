package com.example.taskflow.repository;

import com.example.taskflow.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Project entity.
 */
@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    // Find all projects by their status
    List<Project> findByStatus(Project.ProjectStatus status);

    // Search projects by name (case-insensitive)
    List<Project> findByNameContainingIgnoreCase(String name);
}
