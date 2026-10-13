import ProductCard from "./ProductCard";

// Shows a grid of ProductCard components, or an empty-state message.
export default function ProductList({
  products,
  emptyTitle = "No products found",
  emptyText = "Try a different search or category.",
}) {
  if (products.length === 0) {
    return (
      <div className="empty-state">
        <h3>{emptyTitle}</h3>
        <p>{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
