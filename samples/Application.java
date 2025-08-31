package com.example.codephoropter;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Service;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Code Phoropter - A Spring Boot application for font preference testing
 * 
 * This application demonstrates modern Java features and Spring Boot patterns
 * including reactive programming, JPA repositories, REST controllers, and
 * comprehensive error handling.
 * 
 * @author Code Phoropter Team
 * @version 1.0.0
 * @since 2024
 */
@SpringBootApplication
@EnableJpaRepositories
@EnableScheduling
public class CodePhoropterApplication {
    
    private static final Logger logger = LoggerFactory.getLogger(CodePhoropterApplication.class);
    
    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(CodePhoropterApplication.class);
        app.setBannerMode(Banner.Mode.CONSOLE);
        app.setAdditionalProfiles("development");
        
        try {
            ConfigurableApplicationContext context = app.run(args);
            logger.info("Code Phoropter application started successfully");
            
            // Initialize font detection service
            FontDetectionService fontService = context.getBean(FontDetectionService.class);
            fontService.initializeSystemFonts();
            
        } catch (Exception e) {
            logger.error("Failed to start application: {}", e.getMessage(), e);
            System.exit(1);
        }
    }
    
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
    
    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        mapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
        mapper.registerModule(new JavaTimeModule());
        return mapper;
    }
}

/**
 * REST Controller for font preference testing endpoints
 */
@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*", maxAge = 3600)
@Validated
public class FontPreferenceController {
    
    @Autowired
    private FontPreferenceService fontPreferenceService;
    
    @Autowired
    private TournamentEngine tournamentEngine;
    
    /**
     * Get available font families grouped by category
     */
    @GetMapping("/fonts/families")
    public ResponseEntity<Map<String, List<FontFamily>>> getFontFamilies() {
        try {
            Map<String, List<FontFamily>> families = fontPreferenceService.getAvailableFontFamilies();
            return ResponseEntity.ok(families);
        } catch (Exception e) {
            logger.error("Error retrieving font families", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Start a new font comparison tournament
     */
    @PostMapping("/tournaments")
    public ResponseEntity<TournamentResponse> startTournament(@RequestBody @Valid TournamentRequest request) {
        try {
            Tournament tournament = tournamentEngine.createTournament(request);
            TournamentResponse response = TournamentResponse.builder()
                .tournamentId(tournament.getId())
                .totalComparisons(tournament.getTotalComparisons())
                .currentPhase(tournament.getCurrentPhase())
                .nextComparison(tournament.getNextComparison())
                .build();
                
            return ResponseEntity.ok(response);
        } catch (ValidationException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    /**
     * Submit a comparison result and get the next comparison
     */
    @PostMapping("/tournaments/{tournamentId}/comparisons")
    public ResponseEntity<ComparisonResult> submitComparison(
            @PathVariable @NotNull UUID tournamentId,
            @RequestBody @Valid ComparisonSubmission submission) {
        
        try {
            Optional<Tournament> tournament = tournamentEngine.getTournament(tournamentId);
            if (tournament.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            ComparisonResult result = tournamentEngine.processComparison(
                tournament.get(), submission);
                
            return ResponseEntity.ok(result);
            
        } catch (TournamentException e) {
            logger.warn("Tournament error: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get tournament results and optimal settings
     */
    @GetMapping("/tournaments/{tournamentId}/results")
    public ResponseEntity<OptimalSettings> getTournamentResults(@PathVariable UUID tournamentId) {
        return tournamentEngine.getTournament(tournamentId)
            .filter(Tournament::isCompleted)
            .map(tournament -> ResponseEntity.ok(tournament.getOptimalSettings()))
            .orElse(ResponseEntity.notFound().build());
    }
}

/**
 * Service layer for font preference logic
 */
@Service
@Transactional
public class FontPreferenceService {
    
    @Autowired
    private FontFamilyRepository fontFamilyRepository;
    
    @Autowired
    private SystemFontDetector systemFontDetector;
    
    private final Map<String, List<FontFamily>> cachedFamilies = new ConcurrentHashMap<>();
    
    public Map<String, List<FontFamily>> getAvailableFontFamilies() {
        return cachedFamilies.computeIfAbsent("families", key -> {
            List<FontFamily> systemFonts = systemFontDetector.detectInstalledFonts();
            List<FontFamily> embeddedFonts = fontFamilyRepository.findByType(FontType.EMBEDDED);
            List<FontFamily> googleFonts = fontFamilyRepository.findByType(FontType.GOOGLE_FONTS);
            
            return Map.of(
                "System Fonts", systemFonts,
                "Ligature-Enabled", filterByLigatureSupport(embeddedFonts, true),
                "Clean & Modern", filterByCategory(embeddedFonts, "modern"),
                "Classic Terminal", filterByCategory(embeddedFonts, "terminal"),
                "Distinctive", filterByCategory(embeddedFonts, "distinctive"),
                "Wide & Readable", filterByCategory(embeddedFonts, "readable")
            );
        });
    }
    
    private List<FontFamily> filterByLigatureSupport(List<FontFamily> fonts, boolean hasLigatures) {
        return fonts.stream()
            .filter(font -> font.hasLigatureSupport() == hasLigatures)
            .collect(Collectors.toList());
    }
    
    private List<FontFamily> filterByCategory(List<FontFamily> fonts, String category) {
        return fonts.stream()
            .filter(font -> font.getCategory().equalsIgnoreCase(category))
            .sorted(Comparator.comparing(FontFamily::getName))
            .collect(Collectors.toList());
    }
    
    @Scheduled(fixedDelay = 300000) // 5 minutes
    public void refreshFontCache() {
        cachedFamilies.clear();
        logger.info("Font family cache refreshed");
    }
}

/**
 * JPA Entity representing a font family
 */
@Entity
@Table(name = "font_families")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FontFamily {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Size(max = 100)
    @Column(nullable = false)
    private String name;
    
    @NotBlank
    @Size(max = 50)
    @Column(nullable = false)
    private String category;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FontType type;
    
    @Column(name = "has_ligatures")
    private boolean hasLigatureSupport;
    
    @Column(name = "download_url")
    private String downloadUrl;
    
    @ElementCollection
    @CollectionTable(name = "font_weights", 
        joinColumns = @JoinColumn(name = "font_family_id"))
    @Column(name = "weight")
    private Set<Integer> availableWeights = new HashSet<>();
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum FontType {
        SYSTEM, EMBEDDED, GOOGLE_FONTS, PREMIUM
    }
}

/**
 * Repository interface for FontFamily entities
 */
@Repository
public interface FontFamilyRepository extends JpaRepository<FontFamily, Long> {
    
    List<FontFamily> findByType(FontFamily.FontType type);
    
    List<FontFamily> findByCategoryIgnoreCase(String category);
    
    @Query("SELECT f FROM FontFamily f WHERE f.hasLigatureSupport = :hasLigatures")
    List<FontFamily> findByLigatureSupport(@Param("hasLigatures") boolean hasLigatures);
    
    @Query("SELECT DISTINCT f.category FROM FontFamily f ORDER BY f.category")
    List<String> findDistinctCategories();
    
    Optional<FontFamily> findByNameIgnoreCase(String name);
    
    @Modifying
    @Query("UPDATE FontFamily f SET f.hasLigatureSupport = :ligatures WHERE f.name = :name")
    int updateLigatureSupport(@Param("name") String name, @Param("ligatures") boolean ligatures);
}

/**
 * Tournament engine for managing font comparison tournaments
 */
@Service
public class TournamentEngine {
    
    private final Map<UUID, Tournament> activeTournaments = new ConcurrentHashMap<>();
    
    public Tournament createTournament(TournamentRequest request) {
        Tournament tournament = Tournament.builder()
            .id(UUID.randomUUID())
            .selectedCategories(request.getSelectedCategories())
            .algorithm(TournamentAlgorithm.ROUND_ROBIN)
            .currentPhase(TournamentPhase.FONT_FAMILY)
            .createdAt(LocalDateTime.now())
            .build();
            
        tournament.initializeComparisons();
        activeTournaments.put(tournament.getId(), tournament);
        
        return tournament;
    }
    
    public Optional<Tournament> getTournament(UUID tournamentId) {
        return Optional.ofNullable(activeTournaments.get(tournamentId));
    }
    
    public ComparisonResult processComparison(Tournament tournament, ComparisonSubmission submission) {
        tournament.recordComparison(submission);
        
        if (tournament.isPhaseComplete()) {
            tournament.advanceToNextPhase();
        }
        
        return ComparisonResult.builder()
            .nextComparison(tournament.getNextComparison())
            .progress(tournament.calculateProgress())
            .isComplete(tournament.isCompleted())
            .build();
    }
    
    @Scheduled(fixedDelay = 3600000) // 1 hour cleanup
    public void cleanupInactiveTournaments() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(24);
        
        activeTournaments.entrySet().removeIf(entry -> 
            entry.getValue().getLastActivity().isBefore(cutoff)
        );
        
        logger.info("Cleaned up {} inactive tournaments", activeTournaments.size());
    }
}

/**
 * Data Transfer Objects and Request/Response models
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TournamentRequest {
    
    @NotNull
    @Size(min = 1, max = 6)
    private Set<String> selectedCategories;
    
    @NotNull
    private String preferredLanguage = "javascript";
    
    private Map<String, Object> preferences = new HashMap<>();
}

@Data
@Builder
public class TournamentResponse {
    private UUID tournamentId;
    private int totalComparisons;
    private TournamentPhase currentPhase;
    private FontComparison nextComparison;
}

@Data
@Builder
public class ComparisonSubmission {
    @NotNull
    private ComparisonChoice choice;
    
    private long responseTimeMs;
    private String notes;
    
    public enum ComparisonChoice {
        PREFER_A, PREFER_B, NO_PREFERENCE
    }
}

/**
 * Exception handling and custom exceptions
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class TournamentException extends RuntimeException {
    public TournamentException(String message) {
        super(message);
    }
    
    public TournamentException(String message, Throwable cause) {
        super(message, cause);
    }
}

@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidation(ValidationException e) {
        return ResponseEntity.badRequest()
            .body(ErrorResponse.builder()
                .error("VALIDATION_ERROR")
                .message(e.getMessage())
                .timestamp(LocalDateTime.now())
                .build());
    }
    
    @ExceptionHandler(TournamentException.class)
    public ResponseEntity<ErrorResponse> handleTournament(TournamentException e) {
        return ResponseEntity.badRequest()
            .body(ErrorResponse.builder()
                .error("TOURNAMENT_ERROR")
                .message(e.getMessage())
                .timestamp(LocalDateTime.now())
                .build());
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception e) {
        logger.error("Unexpected error", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ErrorResponse.builder()
                .error("INTERNAL_ERROR")
                .message("An unexpected error occurred")
                .timestamp(LocalDateTime.now())
                .build());
    }
}

@Data
@Builder
public class ErrorResponse {
    private String error;
    private String message;
    private LocalDateTime timestamp;
}