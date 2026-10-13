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
