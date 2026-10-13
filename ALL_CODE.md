# FarmConnect Phase 1: all source files
Each heading is the file path inside the project folder.

## backend/.gitignore

```
target/
local.properties
.idea/
.vscode/
```

## backend/local.properties.example

```properties
# Copy this file to "local.properties" (same folder) and fill in your real values.
# local.properties is in .gitignore, so your secrets are never committed.
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
# Any long random text, at least 32 characters:
app.jwt.secret=replace-this-with-a-long-random-secret-text-123456
```

## backend/pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.5.6</version>
        <relativePath/>
    </parent>

    <groupId>com.farmmarket</groupId>
    <artifactId>farm-market</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>farm-market</name>
    <description>Farmer-to-Customer Product Delivery and Distribution System</description>

    <properties>
        <java.version>17</java.version>
        <jjwt.version>0.12.6</jjwt.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- JWT (login tokens) -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>${jjwt.version}</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

## backend/src/main/java/com/farmmarket/FarmMarketApplication.java

```java
package com.farmmarket;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FarmMarketApplication {
    public static void main(String[] args) {
        SpringApplication.run(FarmMarketApplication.class, args);
    }
}
```

## backend/src/main/java/com/farmmarket/controller/AuthController.java

```java
package com.farmmarket.controller;

import com.farmmarket.dto.*;
import com.farmmarket.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register/customer")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse registerCustomer(@Valid @RequestBody RegisterCustomerRequest request) {
        return authService.registerCustomer(request);
    }

    @PostMapping("/register/farmer")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse registerFarmer(@Valid @RequestBody RegisterFarmerRequest request) {
        return authService.registerFarmer(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    // "Log out" with JWT = the browser deletes its token. There is no server call.

    @GetMapping("/me")
    public UserResponse me(Authentication authentication) {
        return authService.getProfile(authentication.getName());
    }
}
```

## backend/src/main/java/com/farmmarket/controller/FarmerProductController.java

```java
package com.farmmarket.controller;

import com.farmmarket.dto.AvailabilityRequest;
import com.farmmarket.dto.ProductRequest;
import com.farmmarket.dto.ProductResponse;
import com.farmmarket.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Farmer-only endpoints (SecurityConfig blocks customers from /api/farmer/**).
// authentication.getName() is the logged-in farmer's email.
@RestController
@RequestMapping("/api/farmer/products")
public class FarmerProductController {

    private final ProductService productService;

    public FarmerProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public List<ProductResponse> myProducts(Authentication authentication) {
        return productService.listMine(authentication.getName());
    }

    @GetMapping("/{id}")
    public ProductResponse getMine(@PathVariable Long id, Authentication authentication) {
        return productService.getMine(authentication.getName(), id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse create(@Valid @RequestBody ProductRequest request, Authentication authentication) {
        return productService.create(authentication.getName(), request);
    }

    @PutMapping("/{id}")
    public ProductResponse update(@PathVariable Long id,
                                  @Valid @RequestBody ProductRequest request,
                                  Authentication authentication) {
        return productService.update(authentication.getName(), id, request);
    }

    @PatchMapping("/{id}/availability")
    public ProductResponse setAvailability(@PathVariable Long id,
                                           @Valid @RequestBody AvailabilityRequest request,
                                           Authentication authentication) {
        return productService.setAvailability(authentication.getName(), id, request.available());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication authentication) {
        productService.delete(authentication.getName(), id);
    }
}
```

## backend/src/main/java/com/farmmarket/controller/ProductController.java

```java
package com.farmmarket.controller;

import com.farmmarket.dto.ProductResponse;
import com.farmmarket.service.ProductService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Public endpoints: anyone can browse products.
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // GET /api/products?search=tom&category=Vegetables
    @GetMapping
    public List<ProductResponse> list(@RequestParam(required = false) String search,
                                      @RequestParam(required = false) String category) {
        return productService.searchAvailable(search, category);
    }

    @GetMapping("/{id}")
    public ProductResponse getOne(@PathVariable Long id) {
        return productService.getById(id);
    }
}
```

## backend/src/main/java/com/farmmarket/dto/AuthResponse.java

```java
package com.farmmarket.dto;

public record AuthResponse(String token, UserResponse user) {}
```

## backend/src/main/java/com/farmmarket/dto/AvailabilityRequest.java

```java
package com.farmmarket.dto;

import jakarta.validation.constraints.NotNull;

public record AvailabilityRequest(
        @NotNull(message = "Say whether the product is available.") Boolean available
) {}
```

## backend/src/main/java/com/farmmarket/dto/LoginRequest.java

```java
package com.farmmarket.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Enter your email address.") String email,
        @NotBlank(message = "Enter your password.") String password
) {}
```

## backend/src/main/java/com/farmmarket/dto/ProductRequest.java

```java
package com.farmmarket.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record ProductRequest(
        @NotBlank(message = "Enter the product name.")
        @Size(max = 100, message = "Name must be at most 100 characters.")
        String name,

        @NotBlank(message = "Choose a category.")
        @Size(max = 50, message = "Category is too long.")
        String category,

        @Size(max = 1000, message = "Description must be at most 1000 characters.")
        String description,

        @NotNull(message = "Enter the price per unit.")
        @DecimalMin(value = "0.01", message = "Price must be greater than 0.")
        @DecimalMax(value = "99999999.99", message = "Price is too large.")
        BigDecimal pricePerUnit,

        @NotBlank(message = "Choose a unit.")
        @Size(max = 20, message = "Unit is too long.")
        String unit,

        @NotNull(message = "Enter the available quantity.")
        @DecimalMin(value = "0.00", message = "Quantity cannot be negative.")
        @DecimalMax(value = "99999999.99", message = "Quantity is too large.")
        BigDecimal availableQuantity,

        @Size(max = 500, message = "Image link is too long.")
        String imageUrl
) {}
```

## backend/src/main/java/com/farmmarket/dto/ProductResponse.java

```java
package com.farmmarket.dto;

import com.farmmarket.entity.Product;

import java.math.BigDecimal;

public record ProductResponse(
        Long id,
        String name,
        String category,
        String description,
        BigDecimal pricePerUnit,
        String unit,
        BigDecimal availableQuantity,
        String imageUrl,
        boolean available,
        Long farmerId,
        String farmerName,
        String farmLocation
) {
    // Call this inside a @Transactional service method (it reads the farmer).
    public static ProductResponse from(Product p) {
        return new ProductResponse(
                p.getId(),
                p.getName(),
                p.getCategory(),
                p.getDescription(),
                p.getPricePerUnit(),
                p.getUnit(),
                p.getAvailableQuantity(),
                p.getImageUrl(),
                p.isAvailable(),
                p.getFarmer().getId(),
                p.getFarmer().getName(),
                p.getFarmer().getFarmLocation()
        );
    }
}
```

## backend/src/main/java/com/farmmarket/dto/RegisterCustomerRequest.java

```java
package com.farmmarket.dto;

import jakarta.validation.constraints.*;

public record RegisterCustomerRequest(
        @NotBlank(message = "Enter your full name.")
        @Size(min = 2, max = 100, message = "Name must be 2 to 100 characters.")
        String name,

        @NotBlank(message = "Enter your phone number.")
        @Pattern(regexp = "\\d{10}", message = "Phone must be exactly 10 digits.")
        String phone,

        @NotBlank(message = "Enter your email address.")
        @Email(message = "Enter a valid email address.")
        String email,

        @NotBlank(message = "Enter your delivery address.")
        @Size(max = 255, message = "Address is too long.")
        String address,

        @NotBlank(message = "Enter your PIN code.")
        @Pattern(regexp = "\\d{6}", message = "PIN code must be exactly 6 digits.")
        String pinCode,

        @NotBlank(message = "Choose a password.")
        @Size(min = 8, max = 72, message = "Password must be 8 to 72 characters.")
        String password
) {}
```

## backend/src/main/java/com/farmmarket/dto/RegisterFarmerRequest.java

```java
package com.farmmarket.dto;

import jakarta.validation.constraints.*;

public record RegisterFarmerRequest(
        @NotBlank(message = "Enter your full name.")
        @Size(min = 2, max = 100, message = "Name must be 2 to 100 characters.")
        String name,

        @NotBlank(message = "Enter your phone number.")
        @Pattern(regexp = "\\d{10}", message = "Phone must be exactly 10 digits.")
        String phone,

        @NotBlank(message = "Enter your email address.")
        @Email(message = "Enter a valid email address.")
        String email,

        @NotBlank(message = "Enter your farm location.")
        @Size(max = 255, message = "Farm location is too long.")
        String farmLocation,

        @NotBlank(message = "Choose a password.")
        @Size(min = 8, max = 72, message = "Password must be 8 to 72 characters.")
        String password
) {}
```

## backend/src/main/java/com/farmmarket/dto/UserResponse.java

```java
package com.farmmarket.dto;

import com.farmmarket.entity.User;

// Safe to send to the browser: it has NO password hash.
public record UserResponse(
        Long id,
        String name,
        String email,
        String phone,
        String role,
        String address,
        String pinCode,
        String farmLocation
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole().name(),
                user.getAddress(),
                user.getPinCode(),
                user.getFarmLocation()
        );
    }
}
```

## backend/src/main/java/com/farmmarket/entity/Product.java

```java
package com.farmmarket.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products", indexes = {
        @Index(name = "idx_products_name", columnList = "name"),
        @Index(name = "idx_products_category", columnList = "category")
})
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Many products belong to one farmer (foreign key farmer_id -> users.id)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "farmer_id", nullable = false)
    private User farmer;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(length = 1000)
    private String description;

    // Money and quantities use BigDecimal, never double
    @Column(name = "price_per_unit", nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerUnit;

    @Column(nullable = false, length = 20)
    private String unit;

    @Column(name = "available_quantity", nullable = false, precision = 10, scale = 2)
    private BigDecimal availableQuantity;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(nullable = false)
    private boolean available = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public User getFarmer() { return farmer; }
    public void setFarmer(User farmer) { this.farmer = farmer; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getPricePerUnit() { return pricePerUnit; }
    public void setPricePerUnit(BigDecimal pricePerUnit) { this.pricePerUnit = pricePerUnit; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public BigDecimal getAvailableQuantity() { return availableQuantity; }
    public void setAvailableQuantity(BigDecimal availableQuantity) { this.availableQuantity = availableQuantity; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
```

## backend/src/main/java/com/farmmarket/entity/Role.java

```java
package com.farmmarket.entity;

public enum Role {
    CUSTOMER,
    FARMER
}
```

## backend/src/main/java/com/farmmarket/entity/User.java

```java
package com.farmmarket.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 15)
    private String phone;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    // Customers fill these two
    @Column(length = 255)
    private String address;

    @Column(name = "pin_code", length = 6)
    private String pinCode;

    // Farmers fill this one
    @Column(name = "farm_location", length = 255)
    private String farmLocation;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getPinCode() { return pinCode; }
    public void setPinCode(String pinCode) { this.pinCode = pinCode; }
    public String getFarmLocation() { return farmLocation; }
    public void setFarmLocation(String farmLocation) { this.farmLocation = farmLocation; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
```

## backend/src/main/java/com/farmmarket/exception/ApiException.java

```java
package com.farmmarket.exception;

import org.springframework.http.HttpStatus;

// Throw this from a service when something is wrong, e.g.
// throw new ApiException(HttpStatus.NOT_FOUND, "Product not found.");
public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
```

## backend/src/main/java/com/farmmarket/exception/GlobalExceptionHandler.java

```java
package com.farmmarket.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

// Turns Java exceptions into clean JSON error responses for React.
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<Map<String, Object>> handleApiException(ApiException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("message", ex.getMessage());
        return ResponseEntity.status(ex.getStatus()).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(e -> errors.putIfAbsent(e.getField(), e.getDefaultMessage()));

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("message", "Please correct the highlighted fields.");
        body.put("errors", errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleBadJson(HttpMessageNotReadableException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("message", "The request could not be read. Check the values you sent.");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }
}
```

## backend/src/main/java/com/farmmarket/repository/ProductRepository.java

```java
package com.farmmarket.repository;

import com.farmmarket.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // Public catalog: only products that are marked available and have stock.
    // "search" matches the name or category; "category" is an exact filter.
    // Both are plain text ("" means "no filter").
    @Query("""
            SELECT p FROM Product p JOIN FETCH p.farmer
            WHERE p.available = true AND p.availableQuantity > 0
              AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(p.category) LIKE LOWER(CONCAT('%', :search, '%')))
              AND (:category = '' OR LOWER(p.category) = LOWER(:category))
            ORDER BY p.createdAt DESC
            """)
    List<Product> searchAvailable(@Param("search") String search,
                                  @Param("category") String category);

    // Spring builds this query from the method name.
    List<Product> findByFarmerIdOrderByCreatedAtDesc(Long farmerId);
}
```

## backend/src/main/java/com/farmmarket/repository/UserRepository.java

```java
package com.farmmarket.repository;

import com.farmmarket.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
```

## backend/src/main/java/com/farmmarket/security/JwtFilter.java

```java
package com.farmmarket.security;

import com.farmmarket.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

// Runs on every request. If the request has "Authorization: Bearer <token>"
// and the token is valid, it tells Spring Security who the user is.
@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public JwtFilter(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            if (jwtUtil.isValid(token)) {
                String email = jwtUtil.extractEmail(token);
                // The role is read from the database, not from the token.
                userRepository.findByEmail(email).ifPresent(user -> {
                    var authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().name());
                    var authentication = new UsernamePasswordAuthenticationToken(
                            user.getEmail(), null, List.of(authority));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                });
            }
        }

        chain.doFilter(request, response);
    }
}
```

## backend/src/main/java/com/farmmarket/security/JwtUtil.java

```java
package com.farmmarket.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

// Creates and checks JWT login tokens.
@Component
public class JwtUtil {

    private final SecretKey key;
    private final long expirationMs;

    public JwtUtil(@Value("${app.jwt.secret}") String secret,
                   @Value("${app.jwt.expiration-ms}") long expirationMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String generateToken(String email) {
        Date now = new Date();
        return Jwts.builder()
                .subject(email)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expirationMs))
                .signWith(key)
                .compact();
    }

    public String extractEmail(String token) {
        return parse(token).getSubject();
    }

    public boolean isValid(String token) {
        try {
            parse(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims parse(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }
}
```

## backend/src/main/java/com/farmmarket/security/SecurityConfig.java

```java
package com.farmmarket.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Value("${app.cors.allowed-origins}")
    private String[] allowedOrigins;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    // Hashes passwords with BCrypt. We never store the real password.
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())              // not needed: we use tokens, not cookies
            .cors(Customizer.withDefaults())           // uses corsConfigurationSource() below
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/error").permitAll()
                // anyone can register, log in, and browse products
                .requestMatchers("/api/auth/register/**", "/api/auth/login").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/products", "/api/products/*").permitAll()
                // farmer-only area
                .requestMatchers("/api/farmer/**").hasRole("FARMER")
                // everything else needs a logged-in user
                .anyRequest().authenticated()
            )
            .exceptionHandling(e -> e.authenticationEntryPoint((request, response, ex) -> {
                response.setStatus(401);
                response.setContentType("application/json");
                response.getWriter().write("{\"message\":\"Please log in to continue.\"}");
            }))
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // Allows the React app (a different port) to call this API.
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList(allowedOrigins));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
```

## backend/src/main/java/com/farmmarket/service/AuthService.java

```java
package com.farmmarket.service;

import com.farmmarket.dto.*;
import com.farmmarket.entity.Role;
import com.farmmarket.entity.User;
import com.farmmarket.exception.ApiException;
import com.farmmarket.repository.UserRepository;
import com.farmmarket.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public UserResponse registerCustomer(RegisterCustomerRequest request) {
        User user = new User();
        user.setName(request.name().trim());
        user.setPhone(request.phone());
        user.setEmail(normalizeEmail(request.email()));
        user.setAddress(request.address().trim());
        user.setPinCode(request.pinCode());
        user.setRole(Role.CUSTOMER);
        return saveNewUser(user, request.password());
    }

    @Transactional
    public UserResponse registerFarmer(RegisterFarmerRequest request) {
        User user = new User();
        user.setName(request.name().trim());
        user.setPhone(request.phone());
        user.setEmail(normalizeEmail(request.email()));
        user.setFarmLocation(request.farmLocation().trim());
        user.setRole(Role.FARMER);
        return saveNewUser(user, request.password());
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        // Same message for "no such email" and "wrong password" on purpose.
        User user = userRepository.findByEmail(normalizeEmail(request.email()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password."));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        }

        return new AuthResponse(jwtUtil.generateToken(user.getEmail()), UserResponse.from(user));
    }

    @Transactional(readOnly = true)
    public UserResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Please log in again."));
        return UserResponse.from(user);
    }

    private UserResponse saveNewUser(User user, String rawPassword) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new ApiException(HttpStatus.CONFLICT, "An account with this email already exists.");
        }
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        return UserResponse.from(userRepository.save(user));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
}
```

## backend/src/main/java/com/farmmarket/service/ProductService.java

```java
package com.farmmarket.service;

import com.farmmarket.dto.ProductRequest;
import com.farmmarket.dto.ProductResponse;
import com.farmmarket.entity.Product;
import com.farmmarket.entity.User;
import com.farmmarket.exception.ApiException;
import com.farmmarket.repository.ProductRepository;
import com.farmmarket.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.RoundingMode;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ProductService(ProductRepository productRepository, UserRepository userRepository) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    // ----- Public (customers and visitors) -----

    @Transactional(readOnly = true)
    public List<ProductResponse> searchAvailable(String search, String category) {
        String searchText = search == null ? "" : search.trim();
        String categoryText = category == null ? "" : category.trim();
        return productRepository.searchAvailable(searchText, categoryText)
                .stream().map(ProductResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        return ProductResponse.from(findProduct(id));
    }

    // ----- Farmer only -----

    @Transactional(readOnly = true)
    public List<ProductResponse> listMine(String farmerEmail) {
        User farmer = findUser(farmerEmail);
        return productRepository.findByFarmerIdOrderByCreatedAtDesc(farmer.getId())
                .stream().map(ProductResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse getMine(String farmerEmail, Long id) {
        return ProductResponse.from(findOwnedProduct(farmerEmail, id));
    }

    @Transactional
    public ProductResponse create(String farmerEmail, ProductRequest request) {
        Product product = new Product();
        product.setFarmer(findUser(farmerEmail));
        product.setAvailable(true);
        applyRequest(product, request);
        return ProductResponse.from(productRepository.save(product));
    }

    @Transactional
    public ProductResponse update(String farmerEmail, Long id, ProductRequest request) {
        Product product = findOwnedProduct(farmerEmail, id);
        applyRequest(product, request);
        return ProductResponse.from(product); // saved automatically when the transaction ends
    }

    @Transactional
    public ProductResponse setAvailability(String farmerEmail, Long id, boolean available) {
        Product product = findOwnedProduct(farmerEmail, id);
        product.setAvailable(available);
        return ProductResponse.from(product);
    }

    @Transactional
    public void delete(String farmerEmail, Long id) {
        Product product = findOwnedProduct(farmerEmail, id);
        productRepository.delete(product);
    }

    // ----- Helpers -----

    private void applyRequest(Product product, ProductRequest request) {
        product.setName(request.name().trim());
        product.setCategory(request.category().trim());
        product.setDescription(request.description() == null ? null : request.description().trim());
        product.setPricePerUnit(request.pricePerUnit().setScale(2, RoundingMode.HALF_UP));
        product.setUnit(request.unit().trim());
        product.setAvailableQuantity(request.availableQuantity().setScale(2, RoundingMode.HALF_UP));
        String imageUrl = request.imageUrl() == null ? "" : request.imageUrl().trim();
        product.setImageUrl(imageUrl.isEmpty() ? null : imageUrl);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Please log in again."));
    }

    private Product findProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found."));
    }

    // A farmer may only touch products that belong to them.
    private Product findOwnedProduct(String farmerEmail, Long id) {
        Product product = findProduct(id);
        if (!product.getFarmer().getEmail().equals(farmerEmail)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only manage your own products.");
        }
        return product;
    }
}
```

## backend/src/main/resources/application.properties

```properties
spring.application.name=farm-market
server.port=8080

# ---- Database (username and password come from local.properties) ----
spring.datasource.url=jdbc:mysql://localhost:3306/farmer_market?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC

# During development, let JPA create/update tables from the entity classes.
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.open-in-view=false

# ---- App settings ----
app.cors.allowed-origins=http://localhost:5173,http://127.0.0.1:5173
app.jwt.expiration-ms=86400000

# Secrets file (optional so the error message is clear if it is missing)
spring.config.import=optional:file:./local.properties
```

## frontend/index.html

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FarmConnect</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Bitter:wght@500;700&family=Source+Sans+3:wght@400;600&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

## frontend/src/App.jsx

```jsx
import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import RegisterCustomer from "./pages/RegisterCustomer";
import RegisterFarmer from "./pages/RegisterFarmer";
import Catalog from "./pages/Catalog";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import FarmerDashboard from "./pages/FarmerDashboard";
import FarmerProducts from "./pages/FarmerProducts";
import ProductForm from "./pages/ProductForm";
import AccessDenied from "./pages/AccessDenied";

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register/customer" element={<RegisterCustomer />} />
          <Route path="/register/farmer" element={<RegisterFarmer />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/access-denied" element={<AccessDenied />} />

          {/* Customer only */}
          <Route path="/cart" element={<ProtectedRoute role="CUSTOMER"><Cart /></ProtectedRoute>} />

          {/* Farmer only */}
          <Route path="/farmer" element={<ProtectedRoute role="FARMER"><FarmerDashboard /></ProtectedRoute>} />
          <Route path="/farmer/products" element={<ProtectedRoute role="FARMER"><FarmerProducts /></ProtectedRoute>} />
          <Route path="/farmer/products/new" element={<ProtectedRoute role="FARMER"><ProductForm /></ProtectedRoute>} />
          <Route path="/farmer/products/:id/edit" element={<ProtectedRoute role="FARMER"><ProductForm /></ProtectedRoute>} />

          {/* Anything else goes home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="footer">
        <div className="container">
          FarmConnect connects farmers directly with customers. Prices shown on the home page board are samples.
        </div>
      </footer>
    </>
  );
}
```

## frontend/src/api/api.js

```javascript
// One helper that every page uses to talk to the Spring Boot backend.

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// apiRequest("/api/products")                          -> GET
// apiRequest("/api/auth/login", "POST", { ... })       -> POST with a JSON body
export async function apiRequest(path, method = "GET", body = null) {
  const token = localStorage.getItem("token");

  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(API_URL + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Cannot reach the server. Check that the backend is running on port 8080.");
  }

  if (response.status === 204) return null; // success with no content (delete)

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    // Token expired or invalid: clear it and send the user to the login page.
    if (response.status === 401 && token && path !== "/api/auth/login") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    const error = new Error(data?.message || "Something went wrong. Please try again.");
    error.errors = data?.errors || {}; // field-by-field messages from the backend
    error.status = response.status;
    throw error;
  }

  return data;
}
```

## frontend/src/components/CartItem.jsx

```jsx
import { formatMoney, formatPrice } from "../constants";

// One row in the cart. The parent (Cart page) passes functions as props.
export default function CartItem({ item, onChangeQuantity, onRemove }) {
  const canDecrease = item.quantity - 1 > 0;
  const canIncrease = item.quantity + 1 <= item.maxQuantity;

  return (
    <div className="cart-item">
      <div className="cart-item-info">
        <h3>{item.name}</h3>
        <p className="muted">
          {item.farmerName} · {formatPrice(item.pricePerUnit)}/{item.unit}
        </p>
      </div>

      <div className="qty-stepper">
        <button
          onClick={() => onChangeQuantity(item.productId, item.quantity - 1)}
          disabled={!canDecrease}
          aria-label={`Decrease ${item.name} quantity`}
        >
          −
        </button>
        <span>
          {item.quantity} {item.unit}
        </span>
        <button
          onClick={() => onChangeQuantity(item.productId, item.quantity + 1)}
          disabled={!canIncrease}
          aria-label={`Increase ${item.name} quantity`}
        >
          +
        </button>
      </div>

      <div className="cart-item-total">{formatMoney(item.pricePerUnit * item.quantity)}</div>

      <button className="link-button danger" onClick={() => onRemove(item.productId)}>
        Remove
      </button>
    </div>
  );
}
```

## frontend/src/components/FormInput.jsx

```jsx
// A reusable labelled field. It can render an input, a textarea or a select.
//
//   <FormInput label="Email" name="email" value={formData.email}
//              onChange={handleChange} error={errors.email} />
//
// "value" + "onChange" make it a CONTROLLED input: React state is the single
// source of truth for what is typed.
export default function FormInput({
  label,
  name,
  type = "text",
  as = "input",
  value,
  onChange,
  error,
  children,
  ...rest
}) {
  const id = `field-${name}`;

  let field;
  if (as === "textarea") {
    field = <textarea id={id} name={name} value={value} onChange={onChange} rows={4} {...rest} />;
  } else if (as === "select") {
    field = (
      <select id={id} name={name} value={value} onChange={onChange} {...rest}>
        {children}
      </select>
    );
  } else {
    field = <input id={id} name={name} type={type} value={value} onChange={onChange} {...rest} />;
  }

  return (
    <div className={error ? "field has-error" : "field"}>
      <label htmlFor={id}>{label}</label>
      {field}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
```

## frontend/src/components/Navbar.jsx

```jsx
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount, clearCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleLogout() {
    logout();
    clearCart();
    closeMenu();
    navigate("/");
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={closeMenu}>
          FarmConnect
        </Link>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
        >
          Menu
        </button>

        <nav className={menuOpen ? "nav-links open" : "nav-links"}>
          <NavLink to="/catalog" onClick={closeMenu}>Shop produce</NavLink>

          {!user && (
            <>
              <NavLink to="/login" onClick={closeMenu}>Log in</NavLink>
              <NavLink to="/register/customer" onClick={closeMenu}>Sign up</NavLink>
              <NavLink to="/register/farmer" className="nav-cta" onClick={closeMenu}>
                Sell as a farmer
              </NavLink>
            </>
          )}

          {user?.role === "CUSTOMER" && (
            <NavLink to="/cart" onClick={closeMenu}>
              Cart
              {itemCount > 0 && <span className="badge">{itemCount}</span>}
            </NavLink>
          )}

          {user?.role === "FARMER" && (
            <>
              <NavLink to="/farmer" end onClick={closeMenu}>Dashboard</NavLink>
              <NavLink to="/farmer/products" onClick={closeMenu}>My products</NavLink>
            </>
          )}

          {user && (
            <>
              <span className="nav-user">Hi, {user.name.split(" ")[0]}</span>
              <button className="link-button" onClick={handleLogout}>Log out</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
```

## frontend/src/components/ProductCard.jsx

```jsx
import { Link } from "react-router-dom";
import { formatPrice } from "../constants";

export default function ProductCard({ product }) {
  const quantity = Number(product.availableQuantity);
  const lowStock = quantity <= 10;

  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <div className="product-image">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            onError={(event) => {
              event.target.style.display = "none";
            }}
          />
        ) : (
          <span className="product-initial">{product.name.charAt(0)}</span>
        )}
      </div>
      <div className="product-body">
        <h3>{product.name}</h3>
        <p className="product-farmer">
          {product.farmerName}
          {product.farmLocation ? `, ${product.farmLocation}` : ""}
        </p>
        <div className="product-meta">
          <span className="price">
            {formatPrice(product.pricePerUnit)}/{product.unit}
          </span>
          <span className={lowStock ? "stock low" : "stock"}>
            {quantity} {product.unit} left
          </span>
        </div>
      </div>
    </Link>
  );
}
```

## frontend/src/components/ProductList.jsx

```jsx
import ProductCard from "./ProductCard";

// Shows a grid of ProductCard components, or an empty-state message.
export default function ProductList({
  products,
  emptyTitle = "No products found",
  emptyText = "Try a different search or category.",
}) {
  if (products.length === 0) {
    return (
      <div className="empty-state">
        <h3>{emptyTitle}</h3>
        <p>{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

## frontend/src/components/ProtectedRoute.jsx

```jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wrap a page with <ProtectedRoute role="FARMER"> to guard it.
// Not logged in -> login page.  Wrong role -> access denied page.
// (The backend enforces the same rules; this just gives a friendlier screen.)
export default function ProtectedRoute({ role, children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (role && user.role !== role) {
    return <Navigate to="/access-denied" replace />;
  }
  return children;
}
```

## frontend/src/constants.js

```javascript
// Values and helpers used by many pages.

export const CATEGORIES = ["Vegetables", "Fruits", "Grains", "Pulses", "Spices", "Dairy"];

export const UNITS = ["kg", "quintal", "dozen", "litre", "piece"];

// 30 -> "₹30", 32.5 -> "₹32.50"
export function formatPrice(price) {
  const number = Number(price);
  return "₹" + (Number.isInteger(number) ? number : number.toFixed(2));
}

// Always two decimals, used for totals: 90 -> "₹90.00"
export function formatMoney(amount) {
  return "₹" + Number(amount).toFixed(2);
}
```

## frontend/src/context/AuthContext.jsx

```jsx
import { createContext, useContext, useState } from "react";
import { apiRequest } from "../api/api";

// A Context is a "shared box" any component can open, so we do not have to
// pass the logged-in user through props from page to page.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Start from what is saved in the browser, so a refresh keeps you logged in.
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  async function login(email, password) {
    const data = await apiRequest("/api/auth/login", "POST", { email, password });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

## frontend/src/context/CartContext.jsx

```jsx
import { createContext, useContext, useState } from "react";

const CartContext = createContext(null);

// Round to 2 decimals so 0.1 + 0.2 does not become 0.30000000000000004
function round2(number) {
  return Math.round(number * 100) / 100;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      return [];
    }
  });

  function saveItems(newItems) {
    setItems(newItems);
    localStorage.setItem("cart", JSON.stringify(newItems));
  }

  // Returns { ok: true/false, message } so the page can show the result.
  function addToCart(product, quantity) {
    if (!(quantity > 0)) {
      return { ok: false, message: "Enter a quantity greater than 0." };
    }

    const existing = items.find((item) => item.productId === product.id);
    const alreadyInCart = existing ? existing.quantity : 0;
    const newTotal = round2(alreadyInCart + quantity);
    const available = Number(product.availableQuantity);

    if (newTotal > available) {
      return {
        ok: false,
        message: `Only ${available} ${product.unit} available. You already have ${alreadyInCart} in your cart.`,
      };
    }

    if (existing) {
      saveItems(
        items.map((item) =>
          item.productId === product.id ? { ...item, quantity: newTotal, maxQuantity: available } : item
        )
      );
    } else {
      saveItems([
        ...items,
        {
          productId: product.id,
          name: product.name,
          unit: product.unit,
          pricePerUnit: Number(product.pricePerUnit),
          quantity: round2(quantity),
          maxQuantity: available,
          farmerName: product.farmerName,
          imageUrl: product.imageUrl,
        },
      ]);
    }
    return { ok: true, message: `${product.name} added to your cart.` };
  }

  function updateQuantity(productId, newQuantity) {
    saveItems(
      items.map((item) => {
        if (item.productId !== productId) return item;
        const safe = Math.min(Math.max(round2(newQuantity), 0.01), item.maxQuantity);
        return { ...item, quantity: safe };
      })
    );
  }

  function removeItem(productId) {
    saveItems(items.filter((item) => item.productId !== productId));
  }

  function clearCart() {
    saveItems([]);
  }

  const itemCount = items.length;
  const cartTotal = items.reduce((sum, item) => sum + item.pricePerUnit * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, itemCount, cartTotal, addToCart, updateQuantity, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
```

## frontend/src/index.css

```css
/* ---------- Design tokens ---------- */
:root {
  --leaf: #2f6b3a;
  --leaf-dark: #1d4a27;
  --field: #143a1f;
  --leaf-tint: #e6efe1;
  --chalk: #f4f7f2;
  --white: #ffffff;
  --ink: #23302a;
  --muted: #65736a;
  --line: #d9e2d5;
  --wood: #8a6b45;
  --warn: #9a5b00;
  --warn-tint: #fbefd9;
  --danger: #a63a2b;
  --danger-tint: #f9e5e1;
  --font-body: "Source Sans 3", system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-head: "Bitter", Georgia, "Times New Roman", serif;
}

*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  font-family: var(--font-body);
  font-size: 17px;
  line-height: 1.55;
  color: var(--ink);
  background: var(--white);
}

h1, h2, h3 { font-family: var(--font-head); line-height: 1.2; margin: 0 0 0.5em; }
h1 { font-size: 2rem; }
h2 { font-size: 1.5rem; }
h3 { font-size: 1.15rem; }
p { margin: 0 0 1em; }
a { color: var(--leaf); }
a:hover { color: var(--leaf-dark); }
img { max-width: 100%; display: block; }

:focus-visible { outline: 3px solid #7fb98a; outline-offset: 2px; }

.container { width: 100%; max-width: 1080px; margin: 0 auto; padding: 0 20px; }
.narrow { max-width: 560px; padding-top: 32px; padding-bottom: 48px; }
.page { padding-top: 32px; padding-bottom: 56px; }
.muted { color: var(--muted); }

/* ---------- Buttons ---------- */
.btn {
  display: inline-block;
  font: inherit;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 6px;
  border: 2px solid var(--leaf);
  background: var(--leaf);
  color: var(--white);
  text-decoration: none;
  cursor: pointer;
  text-align: center;
}
.btn:hover { background: var(--leaf-dark); border-color: var(--leaf-dark); color: var(--white); }
.btn-secondary { background: transparent; color: var(--leaf); }
.btn-secondary:hover { background: var(--leaf-tint); color: var(--leaf-dark); }
.btn-block { display: block; width: 100%; }
.btn:disabled { background: #b9c5b8; border-color: #b9c5b8; color: #fff; cursor: not-allowed; }

.link-button {
  font: inherit;
  background: none;
  border: none;
  padding: 0;
  color: var(--leaf);
  text-decoration: underline;
  cursor: pointer;
}
.link-button.danger { color: var(--danger); }

/* ---------- Navbar ---------- */
.navbar { background: var(--white); border-bottom: 1px solid var(--line); position: sticky; top: 0; z-index: 10; }
.navbar-inner { display: flex; align-items: center; justify-content: space-between; min-height: 64px; flex-wrap: wrap; }
.brand { font-family: var(--font-head); font-weight: 700; font-size: 1.4rem; color: var(--field); text-decoration: none; }
.nav-links { display: flex; align-items: center; gap: 20px; }
.nav-links a { text-decoration: none; color: var(--ink); font-weight: 600; }
.nav-links a:hover, .nav-links a.active { color: var(--leaf); }
.nav-links a.nav-cta { color: var(--white); background: var(--leaf); padding: 6px 14px; border-radius: 6px; }
.nav-links a.nav-cta:hover { background: var(--leaf-dark); color: var(--white); }
.nav-user { color: var(--muted); }
.badge {
  display: inline-block; margin-left: 6px; min-width: 22px; padding: 0 6px;
  border-radius: 11px; background: var(--leaf); color: #fff; font-size: 0.8rem; text-align: center;
}
.menu-toggle {
  display: none; font: inherit; font-weight: 600; background: none;
  border: 1px solid var(--line); border-radius: 6px; padding: 6px 12px; cursor: pointer;
}

/* ---------- Hero and price board ---------- */
.hero { background: var(--chalk); border-bottom: 1px solid var(--line); padding: 56px 0; }
.hero-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 48px; align-items: center; }
.hero-text h1 { font-size: 2.8rem; color: var(--field); }
.hero-text p { font-size: 1.15rem; max-width: 34em; }
.hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }

.price-board {
  background: var(--field);
  color: #eef4ea;
  border: 8px solid var(--wood);
  border-radius: 4px;
  padding: 24px 28px;
}
.price-board h2 { color: #fff; font-size: 1.25rem; margin-bottom: 14px; }
.price-board ul { list-style: none; margin: 0; padding: 0; }
.price-board li { display: flex; align-items: baseline; gap: 8px; padding: 6px 0; font-size: 1.1rem; }
.board-dots { flex: 1; border-bottom: 2px dotted rgba(255, 255, 255, 0.35); transform: translateY(-4px); }
.board-note { margin: 14px 0 0; font-size: 0.9rem; color: #b8cdb4; }

/* ---------- Sections ---------- */
.section { padding: 44px 0; }
.section-tint { background: var(--chalk); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.section-head { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 8px; }
.category-row { display: flex; flex-wrap: wrap; gap: 12px; }
.category-link {
  padding: 10px 20px; border: 1px solid var(--line); border-radius: 6px;
  text-decoration: none; color: var(--ink); font-weight: 600; background: var(--white);
}
.category-link:hover { border-color: var(--leaf); color: var(--leaf); }
.steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; }
.steps > div { padding: 0 24px; border-left: 3px solid var(--leaf-tint); }
.steps > div:first-child { padding-left: 0; border-left: none; }

/* ---------- Product cards ---------- */
.product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; margin-top: 16px; }
.product-card {
  display: block; background: var(--white); border: 1px solid var(--line);
  border-radius: 6px; overflow: hidden; text-decoration: none; color: var(--ink);
}
.product-card:hover { border-color: var(--leaf); }
.product-image {
  height: 140px; background: var(--leaf-tint); display: flex; align-items: center; justify-content: center; overflow: hidden;
}
.product-image img { width: 100%; height: 100%; object-fit: cover; }
.product-initial { font-family: var(--font-head); font-size: 3rem; color: var(--leaf); font-weight: 700; }
.product-initial.large { font-size: 6rem; }
.product-body { padding: 14px 16px 16px; }
.product-body h3 { margin-bottom: 2px; }
.product-farmer { color: var(--muted); font-size: 0.95rem; margin-bottom: 10px; }
.product-meta { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
.price { font-family: var(--font-head); font-weight: 700; color: var(--leaf-dark); font-size: 1.1rem; }
.stock { font-size: 0.9rem; color: var(--muted); }
.stock.low { color: var(--warn); font-weight: 600; }

/* ---------- Messages ---------- */
.empty-state { text-align: center; padding: 48px 20px; border: 1px dashed var(--line); border-radius: 6px; margin-top: 16px; }
.empty-state p { color: var(--muted); }
.alert { padding: 12px 16px; border-radius: 6px; margin: 12px 0; border: 1px solid transparent; }
.alert-error { background: var(--danger-tint); color: var(--danger); border-color: #efc4bc; }
.alert-success { background: var(--leaf-tint); color: var(--leaf-dark); border-color: #c4d8bd; }
.alert-info { background: var(--chalk); color: var(--ink); border-color: var(--line); }

/* ---------- Forms ---------- */
.form-card { border: 1px solid var(--line); border-radius: 6px; padding: 28px; background: var(--white); }
.field { margin-bottom: 16px; flex: 1; }
.field label, .buy-box label { display: block; font-weight: 600; margin-bottom: 4px; }
.field input, .field select, .field textarea,
.search-form input, .buy-box input {
  width: 100%; font: inherit; padding: 10px 12px; border: 1px solid #b9c5b8;
  border-radius: 6px; background: var(--white); color: var(--ink);
}
.field.has-error input, .field.has-error select, .field.has-error textarea { border-color: var(--danger); }
.field-error { color: var(--danger); font-size: 0.92rem; margin: 4px 0 0; }
.field-row { display: flex; gap: 16px; }
.form-footer { margin: 20px 0 0; color: var(--muted); font-size: 0.96rem; }
.form-actions { display: flex; gap: 12px; margin-top: 8px; }

/* ---------- Catalog ---------- */
.search-form { display: flex; gap: 10px; margin: 16px 0; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.chip {
  font: inherit; padding: 6px 16px; border: 1px solid var(--line); border-radius: 18px;
  background: var(--white); cursor: pointer; color: var(--ink);
}
.chip:hover { border-color: var(--leaf); }
.chip.active { background: var(--leaf); border-color: var(--leaf); color: #fff; }

/* ---------- Product details ---------- */
.back-link { display: inline-block; margin-bottom: 20px; }
.details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
.details-image {
  background: var(--leaf-tint); border-radius: 6px; min-height: 300px;
  display: flex; align-items: center; justify-content: center; overflow: hidden;
}
.details-image img { width: 100%; height: 100%; object-fit: cover; }
.details-price { font-family: var(--font-head); font-size: 1.6rem; font-weight: 700; color: var(--leaf-dark); }
.facts { margin: 16px 0; border-top: 1px solid var(--line); }
.facts div { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--line); }
.facts dt { color: var(--muted); }
.facts dd { margin: 0; font-weight: 600; }
.buy-box { background: var(--chalk); border: 1px solid var(--line); border-radius: 6px; padding: 18px; }
.buy-box input { max-width: 180px; }
.availability { margin: 8px 0; font-weight: 600; }
.availability.ok { color: var(--leaf); }
.availability.bad { color: var(--danger); }

/* ---------- Cart ---------- */
.cart-layout { display: grid; grid-template-columns: 1fr 320px; gap: 32px; align-items: start; }
.cart-item {
  display: grid; grid-template-columns: 1fr auto 100px auto; gap: 16px; align-items: center;
  padding: 16px 0; border-bottom: 1px solid var(--line);
}
.cart-item h3 { margin-bottom: 0; }
.cart-item-total { font-weight: 700; text-align: right; }
.qty-stepper { display: flex; align-items: center; gap: 10px; }
.qty-stepper button {
  width: 32px; height: 32px; font-size: 1.1rem; border: 1px solid #b9c5b8;
  background: var(--white); border-radius: 6px; cursor: pointer;
}
.qty-stepper button:disabled { opacity: 0.4; cursor: not-allowed; }
.cart-list > .link-button { margin-top: 16px; }
.summary { border: 1px solid var(--line); border-radius: 6px; padding: 20px; background: var(--chalk); }
.summary-row { display: flex; justify-content: space-between; padding: 6px 0; }
.summary-row.total { font-weight: 700; font-size: 1.15rem; border-top: 1px solid var(--line); margin-top: 8px; padding-top: 12px; }

/* ---------- Farmer pages ---------- */
.stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 24px 0; }
.stat { border-left: 4px solid var(--leaf); padding: 4px 0 4px 14px; }
.stat strong { display: block; font-family: var(--font-head); font-size: 2rem; color: var(--field); }
.stat span { color: var(--muted); }
.action-list { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.action-item { display: block; padding: 20px; border: 1px solid var(--line); border-radius: 6px; text-decoration: none; color: var(--ink); }
a.action-item:hover { border-color: var(--leaf); }
.action-item p { color: var(--muted); margin: 0; }
.action-item.disabled { background: var(--chalk); }
.table-wrap { overflow-x: auto; border: 1px solid var(--line); border-radius: 6px; margin-top: 16px; }
.data-table { width: 100%; border-collapse: collapse; min-width: 720px; }
.data-table th, .data-table td { text-align: left; padding: 12px 14px; border-bottom: 1px solid var(--line); }
.data-table th { background: var(--chalk); font-weight: 600; }
.data-table tr:last-child td { border-bottom: none; }
.row-actions { display: flex; gap: 14px; flex-wrap: wrap; }
.pill { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 0.88rem; font-weight: 600; }
.pill-ok { background: var(--leaf-tint); color: var(--leaf-dark); }
.pill-off { background: var(--warn-tint); color: var(--warn); }

/* ---------- Footer ---------- */
.footer { border-top: 1px solid var(--line); padding: 24px 0; color: var(--muted); font-size: 0.95rem; }

/* ---------- Mobile ---------- */
@media (max-width: 800px) {
  h1 { font-size: 1.7rem; }
  .hero { padding: 36px 0; }
  .hero-grid, .details-grid, .cart-layout { grid-template-columns: 1fr; gap: 28px; }
  .hero-text h1 { font-size: 2.1rem; }
  .steps { grid-template-columns: 1fr; gap: 20px; }
  .steps > div, .steps > div:first-child { padding: 0 0 0 16px; border-left: 3px solid var(--leaf-tint); }
  .stats { grid-template-columns: 1fr 1fr; }
  .action-list { grid-template-columns: 1fr; }
  .field-row { flex-direction: column; gap: 0; }
  .menu-toggle { display: block; }
  .nav-links { display: none; width: 100%; flex-direction: column; align-items: flex-start; gap: 12px; padding: 12px 0 16px; }
  .nav-links.open { display: flex; }
  .cart-item { grid-template-columns: 1fr auto; }
  .cart-item-total { text-align: left; }
}

@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; animation: none !important; }
}
```

## frontend/src/main.jsx

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import "./index.css";

// BrowserRouter  -> lets us have many pages (URLs)
// AuthProvider   -> shares "who is logged in" with every component
// CartProvider   -> shares the shopping cart with every component
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
```

## frontend/src/pages/AccessDenied.jsx

```jsx
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AccessDenied() {
  const { user } = useAuth();
  const home = user?.role === "FARMER" ? "/farmer" : "/catalog";

  return (
    <div className="container narrow">
      <div className="empty-state">
        <h1>You cannot open this page</h1>
        <p>This page is for a different type of account.</p>
        <Link to={home} className="btn btn-primary">Go back</Link>
      </div>
    </div>
  );
}
```

## frontend/src/pages/Cart.jsx

```jsx
import { Link } from "react-router-dom";
import { formatMoney } from "../constants";
import { useCart } from "../context/CartContext";
import CartItem from "../components/CartItem";

export default function Cart() {
  const { items, cartTotal, updateQuantity, removeItem, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="container page">
        <h1>Your cart</h1>
        <div className="empty-state">
          <h3>Your cart is empty</h3>
          <p>Find fresh produce from local farmers and add it here.</p>
          <Link to="/catalog" className="btn btn-primary">Shop produce</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container page">
      <h1>Your cart</h1>

      <div className="cart-layout">
        <div className="cart-list">
          {items.map((item) => (
            <CartItem
              key={item.productId}
              item={item}
              onChangeQuantity={updateQuantity}
              onRemove={removeItem}
            />
          ))}
          <button className="link-button danger" onClick={clearCart}>Clear cart</button>
        </div>

        <aside className="summary">
          <h2>Summary</h2>
          <div className="summary-row">
            <span>Items</span>
            <span>{items.length}</span>
          </div>
          <div className="summary-row total">
            <span>Estimated total</span>
            <span>{formatMoney(cartTotal)}</span>
          </div>
          <p className="muted">
            Prices and stock are checked again by the server when you place an order.
          </p>
          <button className="btn btn-primary btn-block" disabled>
            Checkout (coming in Phase 2)
          </button>
        </aside>
      </div>
    </div>
  );
}
```

## frontend/src/pages/Catalog.jsx

```jsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiRequest } from "../api/api";
import { CATEGORIES } from "../constants";
import ProductList from "../components/ProductList";

export default function Catalog() {
  const [searchParams] = useSearchParams();

  const [searchInput, setSearchInput] = useState(""); // what is typed in the box
  const [search, setSearch] = useState("");           // what was actually searched
  const [category, setCategory] = useState(searchParams.get("category") || "");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Runs on page load AND again whenever "search" or "category" changes.
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      setError("");
      try {
        const query = new URLSearchParams();
        if (search) query.set("search", search);
        if (category) query.set("category", category);
        const data = await apiRequest(`/api/products?${query.toString()}`);
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [search, category]);

  function handleSearch(event) {
    event.preventDefault();
    setSearch(searchInput.trim());
  }

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setCategory("");
  }

  const hasFilters = search !== "" || category !== "";

  return (
    <div className="container page">
      <h1>Shop produce</h1>

      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="search"
          placeholder="Search by product name or category"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          aria-label="Search products"
        />
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      <div className="chips">
        <button className={category === "" ? "chip active" : "chip"} onClick={() => setCategory("")}>
          All
        </button>
        {CATEGORIES.map((item) => (
          <button
            key={item}
            className={category === item ? "chip active" : "chip"}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {loading && <p className="muted">Loading products...</p>}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && (
        <>
          <p className="muted">
            {products.length} {products.length === 1 ? "product" : "products"} in stock
            {hasFilters && (
              <>
                {" "}
                <button className="link-button" onClick={clearFilters}>Clear filters</button>
              </>
            )}
          </p>
          <ProductList products={products} />
        </>
      )}
    </div>
  );
}
```

## frontend/src/pages/FarmerDashboard.jsx

```jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        setProducts(await apiRequest("/api/farmer/products"));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const onSale = products.filter((p) => p.available && Number(p.availableQuantity) > 0).length;
  const outOfStock = products.filter((p) => Number(p.availableQuantity) === 0).length;
  const hidden = products.filter((p) => !p.available).length;

  return (
    <div className="container page">
      <h1>Welcome, {user.name}</h1>
      <p className="muted">Farm location: {user.farmLocation}</p>

      {error && <div className="alert alert-error">{error}</div>}
      {loading && <p className="muted">Loading your products...</p>}

      {!loading && !error && (
        <div className="stats">
          <div className="stat">
            <strong>{products.length}</strong>
            <span>products listed</span>
          </div>
          <div className="stat">
            <strong>{onSale}</strong>
            <span>on sale now</span>
          </div>
          <div className="stat">
            <strong>{outOfStock}</strong>
            <span>out of stock</span>
          </div>
          <div className="stat">
            <strong>{hidden}</strong>
            <span>marked unavailable</span>
          </div>
        </div>
      )}

      <div className="action-list">
        <Link to="/farmer/products/new" className="action-item">
          <h3>Add a product</h3>
          <p>List new produce with its price and quantity.</p>
        </Link>
        <Link to="/farmer/products" className="action-item">
          <h3>Manage products</h3>
          <p>Update prices and stock, or mark items unavailable.</p>
        </Link>
        <div className="action-item disabled">
          <h3>Incoming orders</h3>
          <p>Accept orders and update their status. Coming in Phase 2.</p>
        </div>
      </div>
    </div>
  );
}
```

## frontend/src/pages/FarmerProducts.jsx

```jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/api";
import { formatPrice } from "../constants";

export default function FarmerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        setProducts(await apiRequest("/api/farmer/products"));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  async function toggleAvailability(product) {
    setError("");
    try {
      const updated = await apiRequest(
        `/api/farmer/products/${product.id}/availability`,
        "PATCH",
        { available: !product.available }
      );
      // Replace just this product in the list
      setProducts(products.map((p) => (p.id === updated.id ? updated : p)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteProduct(product) {
    if (!window.confirm(`Delete ${product.name}? This cannot be undone.`)) return;
    setError("");
    try {
      await apiRequest(`/api/farmer/products/${product.id}`, "DELETE");
      setProducts(products.filter((p) => p.id !== product.id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container page">
      <div className="section-head">
        <h1>My products</h1>
        <Link to="/farmer/products/new" className="btn btn-primary">Add a product</Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading && <p className="muted">Loading your products...</p>}

      {!loading && products.length === 0 && !error && (
        <div className="empty-state">
          <h3>You have not listed any products yet</h3>
          <p>Add your first product so customers can find it.</p>
          <Link to="/farmer/products/new" className="btn btn-primary">Add a product</Link>
        </div>
      )}

      {products.length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const stock = Number(product.availableQuantity);
                const onSale = product.available && stock > 0;
                return (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{formatPrice(product.pricePerUnit)}/{product.unit}</td>
                    <td>{stock} {product.unit}</td>
                    <td>
                      <span className={onSale ? "pill pill-ok" : "pill pill-off"}>
                        {!product.available ? "Unavailable" : stock === 0 ? "Out of stock" : "On sale"}
                      </span>
                    </td>
                    <td className="row-actions">
                      <Link to={`/farmer/products/${product.id}/edit`}>Edit</Link>
                      <button className="link-button" onClick={() => toggleAvailability(product)}>
                        {product.available ? "Mark unavailable" : "Mark available"}
                      </button>
                      <button className="link-button danger" onClick={() => deleteProduct(product)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

## frontend/src/pages/Home.jsx

```jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/api";
import { CATEGORIES } from "../constants";
import ProductList from "../components/ProductList";

// Sample prices only (not live market prices).
const SAMPLE_BOARD = [
  ["Tomatoes", "₹30/kg"],
  ["Rice", "₹55/kg"],
  ["Maize", "₹25/kg"],
  ["Onions", "₹35/kg"],
  ["Green chillies", "₹40/kg"],
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // useEffect with [] runs once, when the page first appears.
  useEffect(() => {
    async function loadFeatured() {
      try {
        const data = await apiRequest("/api/products");
        setFeatured(data.slice(0, 4));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-text">
            <h1>Buy straight from the farmer who grew it.</h1>
            <p>
              FarmConnect lists what local farmers have in stock, at the price the farmer sets.
              Order what you need and skip the middlemen.
            </p>
            <div className="hero-actions">
              <Link to="/catalog" className="btn btn-primary">Shop produce</Link>
              <Link to="/register/farmer" className="btn btn-secondary">Sell as a farmer</Link>
            </div>
          </div>

          <div className="price-board" aria-label="Sample price list">
            <h2>Today at the farm stall</h2>
            <ul>
              {SAMPLE_BOARD.map(([name, price]) => (
                <li key={name}>
                  <span>{name}</span>
                  <span className="board-dots" />
                  <span>{price}</span>
                </li>
              ))}
            </ul>
            <p className="board-note">Sample prices for illustration</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Shop by category</h2>
          <div className="category-row">
            {CATEGORIES.map((category) => (
              <Link key={category} to={`/catalog?category=${category}`} className="category-link">
                {category}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-tint">
        <div className="container">
          <div className="section-head">
            <h2>Fresh from our farmers</h2>
            <Link to="/catalog">See everything in stock</Link>
          </div>

          {loading && <p className="muted">Loading products...</p>}
          {error && <div className="alert alert-error">{error}</div>}
          {!loading && !error && (
            <ProductList
              products={featured}
              emptyTitle="No produce listed yet"
              emptyText="Farmers are still adding their products. Check back soon."
            />
          )}
        </div>
      </section>

      <section className="section">
        <div className="container steps">
          <div>
            <h3>Browse</h3>
            <p>See what each farmer has in stock, with the price per unit and the farm it comes from.</p>
          </div>
          <div>
            <h3>Order</h3>
            <p>Pick a quantity, add it to your cart, and we check it against the farmer's stock.</p>
          </div>
          <div>
            <h3>Receive</h3>
            <p>Choose home delivery or collect from a local distribution center.</p>
          </div>
        </div>
      </section>
    </>
  );
}
```

## frontend/src/pages/Login.jsx

```jsx
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FormInput from "../components/FormInput";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Form state: one object for all inputs (same idea as your student form)
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  }

  function validate() {
    const newErrors = {};
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Enter a valid email address.";
    if (formData.password === "") newErrors.password = "Enter your password.";
    return newErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    setServerError("");
    try {
      const user = await login(formData.email, formData.password);
      const from = location.state?.from;
      navigate(from || (user.role === "FARMER" ? "/farmer" : "/catalog"), { replace: true });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container narrow">
      <div className="form-card">
        <h1>Log in</h1>

        {location.state?.registered && (
          <div className="alert alert-success">Account created. Log in to continue.</div>
        )}
        {serverError && <div className="alert alert-error">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <FormInput
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            autoComplete="email"
          />
          <FormInput
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete="current-password"
          />
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="form-footer">
          New here? <Link to="/register/customer">Create a customer account</Link> or{" "}
          <Link to="/register/farmer">register as a farmer</Link>.
        </p>
      </div>
    </div>
  );
}
```

## frontend/src/pages/ProductDetails.jsx

```jsx
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../api/api";
import { formatMoney, formatPrice } from "../constants";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function ProductDetails() {
  const { id } = useParams(); // the :id from the URL /products/:id
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [cartResult, setCartResult] = useState(null);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setError("");
      try {
        setProduct(await apiRequest(`/api/products/${id}`));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  if (loading) return <div className="container page"><p className="muted">Loading product...</p></div>;

  if (error) {
    return (
      <div className="container page">
        <div className="alert alert-error">{error}</div>
        <Link to="/catalog">Back to all produce</Link>
      </div>
    );
  }

  const stock = Number(product.availableQuantity);
  const inStock = product.available && stock > 0;
  const qty = Number(quantity);

  // "Check availability": recalculated on every render as the customer types.
  let availability = { ok: false, text: "" };
  if (!inStock) {
    availability = { ok: false, text: "This product is currently unavailable." };
  } else if (quantity === "" || Number.isNaN(qty) || qty <= 0) {
    availability = { ok: false, text: "Enter a quantity greater than 0." };
  } else if (qty > stock) {
    availability = { ok: false, text: `Only ${stock} ${product.unit} available. Reduce the quantity.` };
  } else {
    availability = { ok: true, text: `${qty} ${product.unit} is available.` };
  }

  function handleAddToCart() {
    if (!user) {
      navigate("/login", { state: { from: `/products/${id}` } });
      return;
    }
    setCartResult(addToCart(product, qty));
  }

  return (
    <div className="container page">
      <Link to="/catalog" className="back-link">Back to all produce</Link>

      <div className="details-grid">
        <div className="details-image">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name}
              onError={(event) => { event.target.style.display = "none"; }} />
          ) : (
            <span className="product-initial large">{product.name.charAt(0)}</span>
          )}
        </div>

        <div className="details-info">
          <p className="muted">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="details-price">{formatPrice(product.pricePerUnit)}/{product.unit}</p>
          {product.description && <p>{product.description}</p>}

          <dl className="facts">
            <div><dt>In stock</dt><dd>{stock} {product.unit}</dd></div>
            <div><dt>Sold by</dt><dd>{product.farmerName}</dd></div>
            {product.farmLocation && <div><dt>Farm location</dt><dd>{product.farmLocation}</dd></div>}
          </dl>

          {user?.role === "FARMER" ? (
            <div className="alert alert-info">Farmer accounts cannot place orders.</div>
          ) : (
            <div className="buy-box">
              <label htmlFor="quantity">Quantity ({product.unit})</label>
              <input
                id="quantity"
                type="number"
                min="0"
                step="0.5"
                value={quantity}
                onChange={(event) => { setQuantity(event.target.value); setCartResult(null); }}
                disabled={!inStock}
              />
              <p className={availability.ok ? "availability ok" : "availability bad"}>
                {availability.text}
              </p>
              {availability.ok && (
                <p className="muted">Subtotal: {formatMoney(product.pricePerUnit * qty)}</p>
              )}

              <button className="btn btn-primary" onClick={handleAddToCart} disabled={!availability.ok}>
                {user ? "Add to cart" : "Log in to add to cart"}
              </button>

              {cartResult && (
                <div className={cartResult.ok ? "alert alert-success" : "alert alert-error"}>
                  {cartResult.message}{" "}
                  {cartResult.ok && <Link to="/cart">View cart</Link>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

## frontend/src/pages/ProductForm.jsx

```jsx
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../api/api";
import { CATEGORIES, UNITS } from "../constants";
import FormInput from "../components/FormInput";

const emptyForm = {
  name: "",
  category: CATEGORIES[0],
  description: "",
  pricePerUnit: "",
  unit: UNITS[0],
  availableQuantity: "",
  imageUrl: "",
};

// One page used for both: /farmer/products/new  and  /farmer/products/:id/edit
export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(isEdit); // loading existing product
  const [saving, setSaving] = useState(false);

  // When editing, load the product and fill the form.
  useEffect(() => {
    if (!isEdit) return;
    async function loadProduct() {
      try {
        const p = await apiRequest(`/api/farmer/products/${id}`);
        setFormData({
          name: p.name,
          category: p.category,
          description: p.description || "",
          pricePerUnit: String(p.pricePerUnit),
          unit: p.unit,
          availableQuantity: String(p.availableQuantity),
          imageUrl: p.imageUrl || "",
        });
      } catch (err) {
        setServerError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id, isEdit]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  }

  function validate() {
    const newErrors = {};
    if (formData.name.trim() === "") newErrors.name = "Enter the product name.";
    if (formData.pricePerUnit === "" || Number(formData.pricePerUnit) <= 0) {
      newErrors.pricePerUnit = "Price must be greater than 0.";
    }
    if (formData.availableQuantity === "" || Number(formData.availableQuantity) < 0) {
      newErrors.availableQuantity = "Quantity cannot be negative.";
    }
    if (formData.imageUrl.trim() !== "" && !/^https?:\/\//i.test(formData.imageUrl.trim())) {
      newErrors.imageUrl = "Image link must start with http:// or https://";
    }
    return newErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSaving(true);
    setServerError("");
    try {
      const body = {
        ...formData,
        pricePerUnit: Number(formData.pricePerUnit),
        availableQuantity: Number(formData.availableQuantity),
      };
      if (isEdit) {
        await apiRequest(`/api/farmer/products/${id}`, "PUT", body);
      } else {
        await apiRequest("/api/farmer/products", "POST", body);
      }
      navigate("/farmer/products");
    } catch (err) {
      setServerError(err.message);
      setErrors(err.errors || {});
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="container page"><p className="muted">Loading product...</p></div>;

  return (
    <div className="container narrow">
      <div className="form-card">
        <h1>{isEdit ? "Edit product" : "Add a product"}</h1>

        {serverError && <div className="alert alert-error">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <FormInput label="Product name" name="name" value={formData.name}
            onChange={handleChange} error={errors.name} />

          <FormInput label="Category" name="category" as="select" value={formData.category}
            onChange={handleChange} error={errors.category}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </FormInput>

          <FormInput label="Description (optional)" name="description" as="textarea"
            value={formData.description} onChange={handleChange} error={errors.description} />

          <div className="field-row">
            <FormInput label="Price per unit (₹)" name="pricePerUnit" type="number" min="0"
              step="0.01" value={formData.pricePerUnit} onChange={handleChange}
              error={errors.pricePerUnit} />
            <FormInput label="Unit" name="unit" as="select" value={formData.unit}
              onChange={handleChange} error={errors.unit}>
              {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </FormInput>
          </div>

          <FormInput label="Available quantity" name="availableQuantity" type="number" min="0"
            step="0.01" value={formData.availableQuantity} onChange={handleChange}
            error={errors.availableQuantity} />

          <FormInput label="Image link (optional)" name="imageUrl" value={formData.imageUrl}
            onChange={handleChange} error={errors.imageUrl} placeholder="https://..." />

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save product"}
            </button>
            <Link to="/farmer/products" className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
```

## frontend/src/pages/RegisterCustomer.jsx

```jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/api";
import { validateAccount } from "../validation";
import FormInput from "../components/FormInput";

export default function RegisterCustomer() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    pinCode: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  }

  function validate() {
    const newErrors = validateAccount(formData);
    if (formData.address.trim() === "") newErrors.address = "Enter your delivery address.";
    if (!/^\d{6}$/.test(formData.pinCode)) newErrors.pinCode = "PIN code must be exactly 6 digits.";
    return newErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    setServerError("");
    try {
      // confirmPassword is only for the browser check, so we do not send it.
      const { confirmPassword, ...body } = formData;
      await apiRequest("/api/auth/register/customer", "POST", body);
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setServerError(err.message);
      setErrors(err.errors || {}); // messages from the backend, per field
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container narrow">
      <div className="form-card">
        <h1>Create a customer account</h1>
        <p className="muted">Order produce directly from farmers.</p>

        {serverError && <div className="alert alert-error">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <FormInput label="Full name" name="name" value={formData.name}
            onChange={handleChange} error={errors.name} autoComplete="name" />
          <FormInput label="Phone number" name="phone" type="tel" value={formData.phone}
            onChange={handleChange} error={errors.phone} maxLength={10} autoComplete="tel" />
          <FormInput label="Email" name="email" type="email" value={formData.email}
            onChange={handleChange} error={errors.email} autoComplete="email" />
          <FormInput label="Address" name="address" as="textarea" value={formData.address}
            onChange={handleChange} error={errors.address} />
          <FormInput label="PIN code" name="pinCode" value={formData.pinCode}
            onChange={handleChange} error={errors.pinCode} maxLength={6} inputMode="numeric" />
          <FormInput label="Password" name="password" type="password" value={formData.password}
            onChange={handleChange} error={errors.password} autoComplete="new-password" />
          <FormInput label="Confirm password" name="confirmPassword" type="password"
            value={formData.confirmPassword} onChange={handleChange}
            error={errors.confirmPassword} autoComplete="new-password" />

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="form-footer">
          Already registered? <Link to="/login">Log in</Link>. Growing the food?{" "}
          <Link to="/register/farmer">Register as a farmer</Link>.
        </p>
      </div>
    </div>
  );
}
```

## frontend/src/pages/RegisterFarmer.jsx

```jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/api";
import { validateAccount } from "../validation";
import FormInput from "../components/FormInput";

export default function RegisterFarmer() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    farmLocation: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  }

  function validate() {
    const newErrors = validateAccount(formData);
    if (formData.farmLocation.trim() === "") newErrors.farmLocation = "Enter your farm location.";
    return newErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    setServerError("");
    try {
      const { confirmPassword, ...body } = formData;
      await apiRequest("/api/auth/register/farmer", "POST", body);
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setServerError(err.message);
      setErrors(err.errors || {});
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container narrow">
      <div className="form-card">
        <h1>Register as a farmer</h1>
        <p className="muted">List your produce, set your own prices, and sell directly.</p>

        {serverError && <div className="alert alert-error">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <FormInput label="Full name" name="name" value={formData.name}
            onChange={handleChange} error={errors.name} autoComplete="name" />
          <FormInput label="Phone number" name="phone" type="tel" value={formData.phone}
            onChange={handleChange} error={errors.phone} maxLength={10} autoComplete="tel" />
          <FormInput label="Email" name="email" type="email" value={formData.email}
            onChange={handleChange} error={errors.email} autoComplete="email" />
          <FormInput label="Farm location (village, district)" name="farmLocation"
            value={formData.farmLocation} onChange={handleChange} error={errors.farmLocation} />
          <FormInput label="Password" name="password" type="password" value={formData.password}
            onChange={handleChange} error={errors.password} autoComplete="new-password" />
          <FormInput label="Confirm password" name="confirmPassword" type="password"
            value={formData.confirmPassword} onChange={handleChange}
            error={errors.confirmPassword} autoComplete="new-password" />

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Creating account..." : "Create farmer account"}
          </button>
        </form>

        <p className="form-footer">
          Already registered? <Link to="/login">Log in</Link>. Want to buy instead?{" "}
          <Link to="/register/customer">Create a customer account</Link>.
        </p>
      </div>
    </div>
  );
}
```

## frontend/src/validation.js

```javascript
// Rules shared by both registration forms.
// The backend checks the same rules again (never trust the browser alone).

export function validateAccount(data) {
  const errors = {};

  if (data.name.trim().length < 2) {
    errors.name = "Enter your full name.";
  }
  if (!/^\d{10}$/.test(data.phone)) {
    errors.phone = "Phone must be exactly 10 digits.";
  }
  if (!/^\S+@\S+\.\S+$/.test(data.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (data.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}
```
