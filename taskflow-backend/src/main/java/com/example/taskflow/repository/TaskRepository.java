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

    // Find all tasks assigned to a specific user
    List<Task> findByAssignedToId(Long userId);

    // Find tasks by status
    List<Task> findByStatus(Task.TaskStatus status);

    // Find tasks by project and status (e.g. all IN_PROGRESS tasks in a project)
    List<Task> findByProjectIdAndStatus(Long projectId, Task.TaskStatus status);
}
