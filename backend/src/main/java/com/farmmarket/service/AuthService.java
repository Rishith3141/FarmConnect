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
