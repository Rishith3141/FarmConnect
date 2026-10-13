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
