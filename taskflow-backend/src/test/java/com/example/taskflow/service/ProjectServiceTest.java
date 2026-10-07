package com.example.taskflow.service;

import com.example.taskflow.model.Project;
import com.example.taskflow.model.User;
import com.example.taskflow.repository.ProjectRepository;
import com.example.taskflow.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ProjectService projectService;

    private User ownerUser;
    private User anotherUser;
    private Project sampleProject;

    @BeforeEach
    void setUp() {
        ownerUser = new User();
        ownerUser.setId(1L);
        ownerUser.setEmail("owner@example.com");

        anotherUser = new User();
        anotherUser.setId(2L);
        anotherUser.setEmail("another@example.com");

        sampleProject = new Project();
        sampleProject.setId(10L);
        sampleProject.setName("Test Project");
        sampleProject.setCreatedBy(ownerUser);
    }

    @Test
    @DisplayName("getAllProjects - ADMIN gets all projects")
    void testGetAllProjects_Admin_ReturnsAll() {
        when(projectRepository.findAll()).thenReturn(List.of(sampleProject));

        List<Project> projects = projectService.getAllProjects(1L, "ROLE_ADMIN");

        assertThat(projects).hasSize(1);
        verify(projectRepository, times(1)).findAll();
        verify(projectRepository, never()).findByCreatedById(anyLong());
    }

    @Test
    @DisplayName("getAllProjects - USER gets only own projects")
    void testGetAllProjects_User_ReturnsOwnProjects() {
        when(projectRepository.findByCreatedById(1L)).thenReturn(List.of(sampleProject));

        List<Project> projects = projectService.getAllProjects(1L, "ROLE_USER");

        assertThat(projects).hasSize(1);
        verify(projectRepository, times(1)).findByCreatedById(1L);
    }

    @Test
    @DisplayName("getProjectById - Owner gets project successfully")
    void testGetProjectById_Owner_Success() {
        when(projectRepository.findByIdAndCreatedById(10L, 1L)).thenReturn(Optional.of(sampleProject));

        Project project = projectService.getProjectById(10L, 1L, "ROLE_USER");

        assertThat(project).isNotNull();
        assertThat(project.getId()).isEqualTo(10L);
    }

    @Test
    @DisplayName("getProjectById - Admin gets project successfully")
    void testGetProjectById_Admin_Success() {
        when(projectRepository.findById(10L)).thenReturn(Optional.of(sampleProject));

        Project project = projectService.getProjectById(10L, 99L, "ROLE_ADMIN");

        assertThat(project).isNotNull();
        assertThat(project.getId()).isEqualTo(10L);
    }

    @Test
    @DisplayName("getProjectById - Non-owner user gets RuntimeException when project not found/owned")
    void testGetProjectById_UnauthorizedUser_ThrowsException() {
        when(projectRepository.findByIdAndCreatedById(10L, 2L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> projectService.getProjectById(10L, 2L, "ROLE_USER"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Project not found with id: 10");
    }

    @Test
    @DisplayName("createProject - Assigns project owner to authenticated user")
    void testCreateProject_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(ownerUser));
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Project newProject = new Project();
        newProject.setName("New Project");

        Project created = projectService.createProject(newProject, 1L);

        assertThat(created).isNotNull();
        assertThat(created.getCreatedBy()).isEqualTo(ownerUser);
        verify(projectRepository, times(1)).save(any(Project.class));
    }

    @Test
    @DisplayName("deleteProject - Owner deletes project")
    void testDeleteProject_Owner_Success() {
        when(projectRepository.findByIdAndCreatedById(10L, 1L)).thenReturn(Optional.of(sampleProject));
        doNothing().when(projectRepository).deleteById(10L);

        assertThatCode(() -> projectService.deleteProject(10L, 1L, "ROLE_USER"))
                .doesNotThrowAnyException();

        verify(projectRepository, times(1)).deleteById(10L);
    }

    @Test
    @DisplayName("deleteProject - Non-owner user gets exception on delete")
    void testDeleteProject_UnauthorizedUser_ThrowsException() {
        when(projectRepository.findByIdAndCreatedById(10L, 2L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> projectService.deleteProject(10L, 2L, "ROLE_USER"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Project not found with id: 10");

        verify(projectRepository, never()).deleteById(anyLong());
    }
}
