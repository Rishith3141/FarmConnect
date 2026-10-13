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
