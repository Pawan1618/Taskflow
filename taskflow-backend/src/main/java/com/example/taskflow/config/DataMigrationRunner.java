package com.example.taskflow.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Runs one-time data migration on startup:
 * 1. Ensures the role column exists (safe no-op if already present).
 * 2. Sets ROLE_ADMIN for user id=1 (primary admin account).
 * 3. Defaults all other users to ROLE_USER.
 * 4. Fixes legacy projects where created_by IS NULL → assign to admin (id=1).
 * 5. Fixes tasks where created_by IS NULL → inherit from their project's owner.
 */
@Component
public class DataMigrationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataMigrationRunner.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @EventListener(ApplicationReadyEvent.class)
    public void runMigrations() {
        log.info("=== Running RBAC data migrations ===");

        try {
            // 0. Ensure columns exist in database tables if missing from previous schema
            try {
                jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'ROLE_USER'");
            } catch (Exception e) {
                log.debug("User role column check: {}", e.getMessage());
            }

            try {
                jdbcTemplate.execute("ALTER TABLE projects ADD COLUMN IF NOT EXISTS created_by BIGINT");
            } catch (Exception e) {
                log.debug("Project created_by column check: {}", e.getMessage());
            }

            try {
                jdbcTemplate.execute("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_by BIGINT");
            } catch (Exception e) {
                log.debug("Task created_by column check: {}", e.getMessage());
            }

            // 1. Set ROLE_ADMIN for user id=1
            int adminUpdated = jdbcTemplate.update(
                "UPDATE users SET role = 'ROLE_ADMIN' WHERE id = 1 AND (role IS NULL OR role != 'ROLE_ADMIN')"
            );
            if (adminUpdated > 0) log.info("Set ROLE_ADMIN for user id=1");

            // 2. Set ROLE_USER for all other users that have no role yet
            int userUpdated = jdbcTemplate.update(
                "UPDATE users SET role = 'ROLE_USER' WHERE id != 1 AND (role IS NULL OR role = '')"
            );
            if (userUpdated > 0) log.info("Set ROLE_USER for {} user(s)", userUpdated);

            // 3. Fix projects with NULL created_by → assign to admin
            int projectsFixed = jdbcTemplate.update(
                "UPDATE projects SET created_by = 1 WHERE created_by IS NULL"
            );
            if (projectsFixed > 0) log.info("Fixed {} project(s) with NULL created_by → assigned to admin", projectsFixed);

            // 4. Fix tasks with NULL created_by → inherit from project owner
            int tasksFixed = jdbcTemplate.update(
                "UPDATE tasks t SET created_by = p.created_by " +
                "FROM projects p " +
                "WHERE t.project_id = p.id AND t.created_by IS NULL"
            );
            if (tasksFixed > 0) log.info("Fixed {} task(s) with NULL created_by → inherited from project owner", tasksFixed);

            log.info("=== RBAC data migrations complete ===");

        } catch (Exception e) {
            log.warn("Data migration warning (non-fatal): {}", e.getMessage());
        }
    }
}
