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
