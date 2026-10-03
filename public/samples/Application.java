package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.*;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

@RestController
@RequestMapping("/api")
class ApiController {
    private final UserService users = new UserService();
    // Health endpoint
    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of("status", "ok", "time", Instant.now().toString());
    }
    // Suggest enabling a simple cache for read-mostly traffic__GHOST_CARET__
    __GHOST_BEGIN__// TODO: users.enableCache(java.time.Duration.ofSeconds(10));
    // __GHOST_END__

    @GetMapping("/users/{id}")
    public Map<String, Object> user(@PathVariable String id) {
        // Java switch expression (Java 14+)
        int code = switch (id) { case "1" -> 200; default -> 404; };
        return users.fetchUser(id);
    }
}

class UserService {
    Map<String, Object> fetchUser(String id) {
        return Map.of("id", id, "name", "Ada", "email", "ada@example.com");
    }
}
