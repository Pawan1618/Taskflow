package com.example.taskflow.repository;

import com.example.taskflow.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Task entity.
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    // Find all tasks belonging to a specific project
    List<Task> findByProjectId(Long projectId);

    // Find all tasks belonging to any of the given projects (owner-scoped)
    List<Task> findByProjectIdIn(List<Long> projectIds);

    // Find all tasks assigned to a specific user
    List<Task> findByAssignedToId(Long userId);

    // Find tasks by status
    List<Task> findByStatus(Task.TaskStatus status);

    // Find tasks by project and status (e.g. all IN_PROGRESS tasks in a project)
    List<Task> findByProjectIdAndStatus(Long projectId, Task.TaskStatus status);

    // Find all tasks belonging to projectIds, assigned to the user, or created by the user
    @org.springframework.data.jpa.repository.Query("SELECT t FROM Task t WHERE t.project.id IN :projectIds OR (t.assignedTo IS NOT NULL AND t.assignedTo.id = :userId) OR (t.createdBy IS NOT NULL AND t.createdBy.id = :userId)")
    List<Task> findUserTasksWithProjects(@org.springframework.data.repository.query.Param("projectIds") List<Long> projectIds, @org.springframework.data.repository.query.Param("userId") Long userId);

    // Find all tasks assigned to the user or created by the user when user has no projects
    @org.springframework.data.jpa.repository.Query("SELECT t FROM Task t WHERE (t.assignedTo IS NOT NULL AND t.assignedTo.id = :userId) OR (t.createdBy IS NOT NULL AND t.createdBy.id = :userId)")
    List<Task> findUserTasksWithoutProjects(@org.springframework.data.repository.query.Param("userId") Long userId);
}
