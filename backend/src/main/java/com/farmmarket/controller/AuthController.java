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
