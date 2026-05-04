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

/**
 * Service layer for Task business logic.
 */
@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    // Retrieve all tasks
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    // Retrieve a task by ID
    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
    }

    // Get all tasks for a specific project
    public List<Task> getTasksByProject(Long projectId) {
        return taskRepository.findByProjectId(projectId);
    }

    // Get all tasks assigned to a specific user
    public List<Task> getTasksByUser(Long userId) {
        return taskRepository.findByAssignedToId(userId);
    }

    // Create a new task — validates project and user existence
    public Task createTask(Task task, Long projectId, Long assignedToId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));
        task.setProject(project);

        if (assignedToId != null) {
            User user = userRepository.findById(assignedToId)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + assignedToId));
            task.setAssignedTo(user);
        }

        return taskRepository.save(task);
    }

    // Update task details (title, description, status, priority, due date)
    public Task updateTask(Long id, Task updatedTask) {
        Task existing = getTaskById(id);
        existing.setTitle(updatedTask.getTitle());
        existing.setDescription(updatedTask.getDescription());
        existing.setStatus(updatedTask.getStatus());
        existing.setPriority(updatedTask.getPriority());
        existing.setDueDate(updatedTask.getDueDate());
        return taskRepository.save(existing);
    }

    // Delete a task by ID
    public void deleteTask(Long id) {
        getTaskById(id); // throws if not found
        taskRepository.deleteById(id);
    }
}
