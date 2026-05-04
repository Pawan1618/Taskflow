package com.example.taskflow.repository;

import com.example.taskflow.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for User entity — Spring Data JPA auto-generates CRUD operations.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Find a user by their email address
    Optional<User> findByEmail(String email);

    // Check if an email is already registered
    boolean existsByEmail(String email);
}
