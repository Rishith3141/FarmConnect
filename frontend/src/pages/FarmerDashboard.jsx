import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        setProducts(await apiRequest("/api/farmer/products"));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const onSale = products.filter((p) => p.available && Number(p.availableQuantity) > 0).length;
  const outOfStock = products.filter((p) => Number(p.availableQuantity) === 0).length;
  const hidden = products.filter((p) => !p.available).length;

  return (
    <div className="container page">
      <h1>Welcome, {user.name}</h1>
      <p className="muted">Farm location: {user.farmLocation}</p>

      {error && <div className="alert alert-error">{error}</div>}
      {loading && <p className="muted">Loading your products...</p>}

      {!loading && !error && (
        <div className="stats">
          <div className="stat">
            <strong>{products.length}</strong>
            <span>products listed</span>
          </div>
          <div className="stat">
            <strong>{onSale}</strong>
            <span>on sale now</span>
          </div>
          <div className="stat">
            <strong>{outOfStock}</strong>
            <span>out of stock</span>
          </div>
          <div className="stat">
            <strong>{hidden}</strong>
            <span>marked unavailable</span>
          </div>
        </div>
      )}

      <div className="action-list">
        <Link to="/farmer/products/new" className="action-item">
          <h3>Add a product</h3>
          <p>List new produce with its price and quantity.</p>
        </Link>
        <Link to="/farmer/products" className="action-item">
          <h3>Manage products</h3>
          <p>Update prices and stock, or mark items unavailable.</p>
        </Link>
        <div className="action-item disabled">
          <h3>Incoming orders</h3>
          <p>Accept orders and update their status. Coming in Phase 2.</p>
        </div>
      </div>
    </div>
  );
}
