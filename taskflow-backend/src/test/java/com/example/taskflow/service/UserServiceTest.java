package com.example.taskflow.service;

import com.example.taskflow.model.User;
import com.example.taskflow.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mindrot.jbcrypt.BCrypt;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(1L);
        sampleUser.setName("Test User");
        sampleUser.setEmail("test@example.com");
        sampleUser.setPassword("password123");
        sampleUser.setRole(User.Role.ROLE_USER);
    }

    @Test
    @DisplayName("createUser - Success hashes password and assigns default role")
    void testCreateUser_Success() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User created = userService.createUser(sampleUser);

        assertThat(created).isNotNull();
        assertThat(created.getEmail()).isEqualTo("test@example.com");
        assertThat(created.getPassword()).isNotEqualTo("password123"); // BCrypt hashed
        assertThat(BCrypt.checkpw("password123", created.getPassword())).isTrue();
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("createUser - Throws RuntimeException when email already exists")
    void testCreateUser_DuplicateEmail_ThrowsException() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.createUser(sampleUser))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Email already in use");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("authenticate - Success returns user when password matches")
    void testAuthenticate_Success() {
        String hashedPassword = BCrypt.hashpw("password123", BCrypt.gensalt());
        sampleUser.setPassword(hashedPassword);

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(sampleUser));

        User authenticated = userService.authenticate("test@example.com", "password123");

        assertThat(authenticated).isNotNull();
        assertThat(authenticated.getEmail()).isEqualTo("test@example.com");
    }

    @Test
    @DisplayName("authenticate - Throws RuntimeException when password fails")
    void testAuthenticate_WrongPassword_ThrowsException() {
        String hashedPassword = BCrypt.hashpw("password123", BCrypt.gensalt());
        sampleUser.setPassword(hashedPassword);

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(sampleUser));

        assertThatThrownBy(() -> userService.authenticate("test@example.com", "wrongpassword"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Invalid email or password");
    }

    @Test
    @DisplayName("getUserById - Success returns user")
    void testGetUserById_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));

        User user = userService.getUserById(1L);

        assertThat(user).isNotNull();
        assertThat(user.getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("getUserById - Throws RuntimeException when user not found")
    void testGetUserById_NotFound_ThrowsException() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getUserById(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("User not found with id: 99");
    }
}
