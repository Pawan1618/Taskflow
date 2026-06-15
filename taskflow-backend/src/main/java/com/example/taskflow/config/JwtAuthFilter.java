package com.example.taskflow.config;

import com.example.taskflow.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Optional;

/**
 * Filter that runs once per request.
 * Reads the "jwt" HttpOnly cookie, validates it, and exposes the userId
 * as a request attribute named "userId" so controllers/services can use it.
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        if (request.getCookies() != null) {
            Optional<Cookie> jwtCookie = Arrays.stream(request.getCookies())
                    .filter(c -> "jwt".equals(c.getName()))
                    .findFirst();

            if (jwtCookie.isPresent() && jwtUtil.validateToken(jwtCookie.get().getValue())) {
                Long userId = jwtUtil.getUserIdFromToken(jwtCookie.get().getValue());
                // Expose userId to the rest of the request chain
                request.setAttribute("userId", userId);
            }
        }

        filterChain.doFilter(request, response);
    }

    /** Skip the filter for auth endpoints so login/signup still work unauthenticated */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/api/auth/");
    }
}
