package com.example.taskflow.service;

import com.example.taskflow.model.Project;
import com.example.taskflow.model.Task;
import com.example.taskflow.model.User;
import com.example.taskflow.repository.ProjectRepository;
import com.example.taskflow.repository.TaskRepository;
import com.example.taskflow.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TaskService taskService;

    private User ownerUser;
    private User otherUser;
    private Project sampleProject;
    private Task sampleTask;

    @BeforeEach
    void setUp() {
        ownerUser = new User();
        ownerUser.setId(10L);
        ownerUser.setEmail("owner@example.com");
        ownerUser.setRole(User.Role.ROLE_USER);

        otherUser = new User();
        otherUser.setId(20L);
        otherUser.setEmail("other@example.com");
        otherUser.setRole(User.Role.ROLE_USER);

        sampleProject = new Project();
        sampleProject.setId(100L);
        sampleProject.setName("Sample Project");
        sampleProject.setCreatedBy(ownerUser);

        sampleTask = new Task();
        sampleTask.setId(1000L);
        sampleTask.setTitle("Sample Task");
        sampleTask.setProject(sampleProject);
        sampleTask.setCreatedBy(ownerUser);
        sampleTask.setStatus(Task.TaskStatus.TODO);
        sampleTask.setPriority(Task.TaskPriority.MEDIUM);
    }

    @Test
    @DisplayName("getAllTasks - ADMIN role returns all tasks in system")
    void testGetAllTasks_Admin_ReturnsAll() {
        when(taskRepository.findAll()).thenReturn(List.of(sampleTask));

        List<Task> tasks = taskService.getAllTasks(1L, "ROLE_ADMIN");

        assertThat(tasks).hasSize(1);
        verify(taskRepository, times(1)).findAll();
        verify(taskRepository, never()).findUserTasksWithProjects(anyList(), anyLong());
    }

    @Test
    @DisplayName("getAllTasks - USER role returns only user-accessible tasks")
    void testGetAllTasks_User_ReturnsScopedTasks() {
        when(projectRepository.findByCreatedById(10L)).thenReturn(List.of(sampleProject));
        when(taskRepository.findUserTasksWithProjects(List.of(100L), 10L)).thenReturn(List.of(sampleTask));

        List<Task> tasks = taskService.getAllTasks(10L, "ROLE_USER");

        assertThat(tasks).hasSize(1);
        verify(taskRepository, times(1)).findUserTasksWithProjects(List.of(100L), 10L);
    }

    @Test
    @DisplayName("getTaskById - Owner user successfully accesses own task")
    void testGetTaskById_OwnerAccess_Success() {
        when(taskRepository.findById(1000L)).thenReturn(Optional.of(sampleTask));

        Task task = taskService.getTaskById(1000L, 10L, "ROLE_USER");

        assertThat(task).isNotNull();
        assertThat(task.getId()).isEqualTo(1000L);
    }

    @Test
    @DisplayName("getTaskById - Non-owner user gets SecurityException (RBAC enforcement)")
    void testGetTaskById_UnauthorizedUser_ThrowsSecurityException() {
        when(taskRepository.findById(1000L)).thenReturn(Optional.of(sampleTask));

        assertThatThrownBy(() -> taskService.getTaskById(1000L, 20L, "ROLE_USER"))
                .isInstanceOf(SecurityException.class)
                .hasMessageContaining("insufficient permissions");
    }

    @Test
    @DisplayName("getTaskById - ADMIN accesses any task regardless of ownership")
    void testGetTaskById_AdminAccess_Success() {
        when(taskRepository.findById(1000L)).thenReturn(Optional.of(sampleTask));

        Task task = taskService.getTaskById(1000L, 999L, "ROLE_ADMIN");

        assertThat(task).isNotNull();
        assertThat(task.getId()).isEqualTo(1000L);
    }

    @Test
    @DisplayName("createTask - Creates task and attaches creator user")
    void testCreateTask_Success() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(ownerUser));
        when(projectRepository.findById(100L)).thenReturn(Optional.of(sampleProject));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Task newTask = new Task();
        newTask.setTitle("New Task");

        Task created = taskService.createTask(newTask, 100L, null, 10L, "ROLE_USER");

        assertThat(created).isNotNull();
        assertThat(created.getCreatedBy()).isEqualTo(ownerUser);
        assertThat(created.getProject()).isEqualTo(sampleProject);
        verify(taskRepository, times(1)).save(any(Task.class));
    }

    @Test
    @DisplayName("deleteTask - Owner user can delete task")
    void testDeleteTask_Owner_Success() {
        when(taskRepository.findById(1000L)).thenReturn(Optional.of(sampleTask));
        doNothing().when(taskRepository).deleteById(1000L);

        assertThatCode(() -> taskService.deleteTask(1000L, 10L, "ROLE_USER"))
                .doesNotThrowAnyException();

        verify(taskRepository, times(1)).deleteById(1000L);
    }

    @Test
    @DisplayName("deleteTask - Non-owner user gets SecurityException on delete")
    void testDeleteTask_Unauthorized_ThrowsSecurityException() {
        when(taskRepository.findById(1000L)).thenReturn(Optional.of(sampleTask));

        assertThatThrownBy(() -> taskService.deleteTask(1000L, 20L, "ROLE_USER"))
                .isInstanceOf(SecurityException.class)
                .hasMessageContaining("insufficient permissions");

        verify(taskRepository, never()).deleteById(anyLong());
    }

    @Test
    @DisplayName("updateTask - Forward transition TODO -> IN_PROGRESS succeeds")
    void testUpdateTask_ForwardTransition_Success() {
        sampleTask.setStatus(Task.TaskStatus.TODO);
        when(taskRepository.findById(1000L)).thenReturn(Optional.of(sampleTask));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Task update = new Task();
        update.setTitle("Updated Title");
        update.setStatus(Task.TaskStatus.IN_PROGRESS);

        Task result = taskService.updateTask(1000L, update, 10L, "ROLE_USER");

        assertThat(result.getStatus()).isEqualTo(Task.TaskStatus.IN_PROGRESS);
        verify(taskRepository, times(1)).save(any(Task.class));
    }

    @Test
    @DisplayName("updateTask - Backward transition DONE -> TODO throws IllegalArgumentException")
    void testUpdateTask_BackwardTransition_ThrowsException() {
        sampleTask.setStatus(Task.TaskStatus.DONE);
        when(taskRepository.findById(1000L)).thenReturn(Optional.of(sampleTask));

        Task update = new Task();
        update.setTitle("Invalid Move");
        update.setStatus(Task.TaskStatus.TODO);

        assertThatThrownBy(() -> taskService.updateTask(1000L, update, 10L, "ROLE_USER"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid status transition from DONE to TODO");

        verify(taskRepository, never()).save(any(Task.class));
    }
}
