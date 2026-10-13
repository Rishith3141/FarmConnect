package com.farmmarket.repository;

import com.farmmarket.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // Public catalog: only products that are marked available and have stock.
    // "search" matches the name or category; "category" is an exact filter.
    // Both are plain text ("" means "no filter").
    @Query("""
            SELECT p FROM Product p JOIN FETCH p.farmer
            WHERE p.available = true AND p.availableQuantity > 0
              AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(p.category) LIKE LOWER(CONCAT('%', :search, '%')))
              AND (:category = '' OR LOWER(p.category) = LOWER(:category))
            ORDER BY p.createdAt DESC
            """)
    List<Product> searchAvailable(@Param("search") String search,
                                  @Param("category") String category);

    // Spring builds this query from the method name.
    List<Product> findByFarmerIdOrderByCreatedAtDesc(Long farmerId);
}
