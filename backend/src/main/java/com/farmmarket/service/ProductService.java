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
