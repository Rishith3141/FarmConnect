package com.farmmarket.dto;

import jakarta.validation.constraints.NotNull;

public record AvailabilityRequest(
        @NotNull(message = "Say whether the product is available.") Boolean available
) {}
