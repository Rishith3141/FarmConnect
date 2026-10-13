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
