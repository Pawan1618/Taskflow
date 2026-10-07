package com.example.taskflow.controller;

import com.example.taskflow.model.User;
import com.example.taskflow.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for User management endpoints.
 * Base path: /api/users
 * GET /api/users requires authentication (used for task assignment dropdowns).
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    // GET /api/users — fetch all users (requires authentication)
    @SuppressWarnings("unchecked")
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return (ResponseEntity<List<User>>) (ResponseEntity<?>) ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED).body("Authentication required");
        }
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // GET /api/users/{id} — fetch user by ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // POST /api/users — create a new user
    @PostMapping
    public ResponseEntity<User> createUser(@Valid @RequestBody User user) {
        User created = userService.createUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // PUT /api/users/{id} — update an existing user
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id,
                                           @Valid @RequestBody User user) {
        return ResponseEntity.ok(userService.updateUser(id, user));
    }

    // DELETE /api/users/{id} — delete a user
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
