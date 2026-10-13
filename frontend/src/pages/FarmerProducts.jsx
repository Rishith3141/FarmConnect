import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/api";
import { formatPrice } from "../constants";

export default function FarmerProducts() {
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

  async function toggleAvailability(product) {
    setError("");
    try {
      const updated = await apiRequest(
        `/api/farmer/products/${product.id}/availability`,
        "PATCH",
        { available: !product.available }
      );
      // Replace just this product in the list
      setProducts(products.map((p) => (p.id === updated.id ? updated : p)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteProduct(product) {
    if (!window.confirm(`Delete ${product.name}? This cannot be undone.`)) return;
    setError("");
    try {
      await apiRequest(`/api/farmer/products/${product.id}`, "DELETE");
      setProducts(products.filter((p) => p.id !== product.id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container page">
      <div className="section-head">
        <h1>My products</h1>
        <Link to="/farmer/products/new" className="btn btn-primary">Add a product</Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading && <p className="muted">Loading your products...</p>}

      {!loading && products.length === 0 && !error && (
        <div className="empty-state">
          <h3>You have not listed any products yet</h3>
          <p>Add your first product so customers can find it.</p>
          <Link to="/farmer/products/new" className="btn btn-primary">Add a product</Link>
        </div>
      )}

      {products.length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const stock = Number(product.availableQuantity);
                const onSale = product.available && stock > 0;
                return (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{formatPrice(product.pricePerUnit)}/{product.unit}</td>
                    <td>{stock} {product.unit}</td>
                    <td>
                      <span className={onSale ? "pill pill-ok" : "pill pill-off"}>
                        {!product.available ? "Unavailable" : stock === 0 ? "Out of stock" : "On sale"}
                      </span>
                    </td>
                    <td className="row-actions">
                      <Link to={`/farmer/products/${product.id}/edit`}>Edit</Link>
                      <button className="link-button" onClick={() => toggleAvailability(product)}>
                        {product.available ? "Mark unavailable" : "Mark available"}
                      </button>
                      <button className="link-button danger" onClick={() => deleteProduct(product)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
