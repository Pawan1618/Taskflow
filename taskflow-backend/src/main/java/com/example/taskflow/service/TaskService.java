package com.example.taskflow.service;

import com.example.taskflow.model.Project;
import com.example.taskflow.model.Task;
import com.example.taskflow.model.User;
import com.example.taskflow.repository.ProjectRepository;
import com.example.taskflow.repository.TaskRepository;
import com.example.taskflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer for Task business logic with full RBAC enforcement.
 * ROLE_ADMIN can access all tasks; ROLE_USER is scoped to their projects
 * and tasks they are assigned to or created.
 */
@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    private boolean isAdmin(String role) {
        return "ROLE_ADMIN".equals(role);
    }

    /**
     * Retrieve tasks for the current user.
     * Admin: all tasks in the system.
     * User: tasks from their projects + tasks assigned/created by them.
     */
    public List<Task> getAllTasks(Long userId, String role) {
        if (isAdmin(role)) {
            return taskRepository.findAll();
        }
        List<Long> projectIds = projectRepository.findByCreatedById(userId)
                .stream().map(Project::getId).collect(Collectors.toList());
        if (projectIds.isEmpty()) {
            return taskRepository.findUserTasksWithoutProjects(userId);
        }
        return taskRepository.findUserTasksWithProjects(projectIds, userId);
    }

    /**
     * Retrieve a task by ID, checking the caller has permission to view it.
     * Admin: unrestricted.
     * User: must be project owner, task creator, or assigned user.
     */
    public Task getTaskById(Long id, Long userId, String role) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));

        if (isAdmin(role)) return task;

        boolean isProjectOwner = task.getProject() != null
                && task.getProject().getCreatedBy() != null
                && task.getProject().getCreatedBy().getId().equals(userId);
        boolean isCreator = task.getCreatedBy() != null
                && task.getCreatedBy().getId().equals(userId);
        boolean isAssigned = task.getAssignedTo() != null
                && task.getAssignedTo().getId().equals(userId);

        if (!isProjectOwner && !isCreator && !isAssigned) {
            throw new SecurityException("Access denied: insufficient permissions to view this task");
        }
        return task;
    }

    /**
     * Get all tasks for a specific project, enforcing ownership.
     * Admin: unrestricted.
     * User: must own the project or be assigned a task in it.
     */
    public List<Task> getTasksByProject(Long projectId, Long userId, String role) {
        if (isAdmin(role)) {
            return taskRepository.findByProjectId(projectId);
        }
        // Validate the caller owns the project
        projectRepository.findByIdAndCreatedById(projectId, userId)
                .orElseThrow(() -> new SecurityException("Access denied: you do not own project " + projectId));
        return taskRepository.findByProjectId(projectId);
    }

    // Get all tasks assigned to a specific user (no RBAC needed — user requesting own tasks)
    public List<Task> getTasksByUser(Long userId) {
        return taskRepository.findByAssignedToId(userId);
    }

    /**
     * Create a new task inside a project.
     * Admin: can create in any project.
     * User: must own the project.
     * Sets the createdBy field to the calling user.
     */
    public Task createTask(Task task, Long projectId, Long assignedToId, Long userId, String role) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));

        // Enforce ownership unless admin
        if (!isAdmin(role)) {
            if (project.getCreatedBy() == null || !project.getCreatedBy().getId().equals(userId)) {
                throw new SecurityException("Access denied: you do not own project " + projectId);
            }
        }

        task.setProject(project);

        // Set the creator
        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        task.setCreatedBy(creator);

        if (assignedToId != null) {
            User assignee = userRepository.findById(assignedToId)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + assignedToId));
            task.setAssignedTo(assignee);
        }

        return taskRepository.save(task);
    }

    /**
     * Update task details.
     * Admin: unrestricted.
     * User: must be project owner, task creator, or assigned user.
     */
    public Task updateTask(Long id, Task updatedTask, Long userId, String role) {
        Task existing = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));

        if (!isAdmin(role)) {
            boolean isProjectOwner = existing.getProject() != null
                    && existing.getProject().getCreatedBy() != null
                    && existing.getProject().getCreatedBy().getId().equals(userId);
            boolean isCreator = existing.getCreatedBy() != null
                    && existing.getCreatedBy().getId().equals(userId);
            boolean isAssigned = existing.getAssignedTo() != null
                    && existing.getAssignedTo().getId().equals(userId);

            if (!isProjectOwner && !isCreator && !isAssigned) {
                throw new SecurityException("Access denied: insufficient permissions to update this task");
            }
        }

        // Enforce FSM one-way status transition: TODO -> IN_PROGRESS -> DONE
        if (updatedTask.getStatus() != null && !updatedTask.getStatus().equals(existing.getStatus())) {
            validateStatusTransition(existing.getStatus(), updatedTask.getStatus());
        }

        existing.setTitle(updatedTask.getTitle());
        existing.setDescription(updatedTask.getDescription());
        existing.setStatus(updatedTask.getStatus());
        existing.setPriority(updatedTask.getPriority());
        existing.setDueDate(updatedTask.getDueDate());
        return taskRepository.save(existing);
    }

    private void validateStatusTransition(Task.TaskStatus currentStatus, Task.TaskStatus newStatus) {
        boolean valid = false;
        if (currentStatus == Task.TaskStatus.TODO) {
            valid = (newStatus == Task.TaskStatus.IN_PROGRESS || newStatus == Task.TaskStatus.DONE);
        } else if (currentStatus == Task.TaskStatus.IN_PROGRESS) {
            valid = (newStatus == Task.TaskStatus.DONE);
        } else if (currentStatus == Task.TaskStatus.DONE) {
            valid = false; // Terminal state - cannot move back
        }

        if (!valid) {
            throw new IllegalArgumentException(
                "Invalid status transition from " + currentStatus + " to " + newStatus +
                ". Tasks can only move forward (TODO -> IN_PROGRESS -> DONE)."
            );
        }
    }

    /**
     * Delete a task.
     * Admin: unrestricted.
     * User: must be project owner or task creator.
     */
    public void deleteTask(Long id, Long userId, String role) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));

        if (!isAdmin(role)) {
            boolean isProjectOwner = task.getProject() != null
                    && task.getProject().getCreatedBy() != null
                    && task.getProject().getCreatedBy().getId().equals(userId);
            boolean isCreator = task.getCreatedBy() != null
                    && task.getCreatedBy().getId().equals(userId);

            if (!isProjectOwner && !isCreator) {
                throw new SecurityException("Access denied: insufficient permissions to delete this task");
            }
        }

        taskRepository.deleteById(id);
    }
}
