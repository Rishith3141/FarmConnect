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
