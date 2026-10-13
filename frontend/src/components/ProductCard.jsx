import { Link } from "react-router-dom";
import { formatPrice } from "../constants";

export default function ProductCard({ product }) {
  const quantity = Number(product.availableQuantity);
  const lowStock = quantity <= 10;

  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <div className="product-image">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            onError={(event) => {
              event.target.style.display = "none";
            }}
          />
        ) : (
          <span className="product-initial">{product.name.charAt(0)}</span>
        )}
      </div>
      <div className="product-body">
        <h3>{product.name}</h3>
        <p className="product-farmer">
          {product.farmerName}
          {product.farmLocation ? `, ${product.farmLocation}` : ""}
        </p>
        <div className="product-meta">
          <span className="price">
            {formatPrice(product.pricePerUnit)}/{product.unit}
          </span>
          <span className={lowStock ? "stock low" : "stock"}>
            {quantity} {product.unit} left
          </span>
        </div>
      </div>
    </Link>
  );
}
