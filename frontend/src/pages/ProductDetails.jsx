import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../api/api";
import { formatMoney, formatPrice } from "../constants";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function ProductDetails() {
  const { id } = useParams(); // the :id from the URL /products/:id
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [cartResult, setCartResult] = useState(null);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setError("");
      try {
        setProduct(await apiRequest(`/api/products/${id}`));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  if (loading) return <div className="container page"><p className="muted">Loading product...</p></div>;

  if (error) {
    return (
      <div className="container page">
        <div className="alert alert-error">{error}</div>
        <Link to="/catalog">Back to all produce</Link>
      </div>
    );
  }

  const stock = Number(product.availableQuantity);
  const inStock = product.available && stock > 0;
  const qty = Number(quantity);

  // "Check availability": recalculated on every render as the customer types.
  let availability = { ok: false, text: "" };
  if (!inStock) {
    availability = { ok: false, text: "This product is currently unavailable." };
  } else if (quantity === "" || Number.isNaN(qty) || qty <= 0) {
    availability = { ok: false, text: "Enter a quantity greater than 0." };
  } else if (qty > stock) {
    availability = { ok: false, text: `Only ${stock} ${product.unit} available. Reduce the quantity.` };
  } else {
    availability = { ok: true, text: `${qty} ${product.unit} is available.` };
  }

  function handleAddToCart() {
    if (!user) {
      navigate("/login", { state: { from: `/products/${id}` } });
      return;
    }
    setCartResult(addToCart(product, qty));
  }

  return (
    <div className="container page">
      <Link to="/catalog" className="back-link">Back to all produce</Link>

      <div className="details-grid">
        <div className="details-image">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name}
              onError={(event) => { event.target.style.display = "none"; }} />
          ) : (
            <span className="product-initial large">{product.name.charAt(0)}</span>
          )}
        </div>

        <div className="details-info">
          <p className="muted">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="details-price">{formatPrice(product.pricePerUnit)}/{product.unit}</p>
          {product.description && <p>{product.description}</p>}

          <dl className="facts">
            <div><dt>In stock</dt><dd>{stock} {product.unit}</dd></div>
            <div><dt>Sold by</dt><dd>{product.farmerName}</dd></div>
            {product.farmLocation && <div><dt>Farm location</dt><dd>{product.farmLocation}</dd></div>}
          </dl>

          {user?.role === "FARMER" ? (
            <div className="alert alert-info">Farmer accounts cannot place orders.</div>
          ) : (
            <div className="buy-box">
              <label htmlFor="quantity">Quantity ({product.unit})</label>
              <input
                id="quantity"
                type="number"
                min="0"
                step="0.5"
                value={quantity}
                onChange={(event) => { setQuantity(event.target.value); setCartResult(null); }}
                disabled={!inStock}
              />
              <p className={availability.ok ? "availability ok" : "availability bad"}>
                {availability.text}
              </p>
              {availability.ok && (
                <p className="muted">Subtotal: {formatMoney(product.pricePerUnit * qty)}</p>
              )}

              <button className="btn btn-primary" onClick={handleAddToCart} disabled={!availability.ok}>
                {user ? "Add to cart" : "Log in to add to cart"}
              </button>

              {cartResult && (
                <div className={cartResult.ok ? "alert alert-success" : "alert alert-error"}>
                  {cartResult.message}{" "}
                  {cartResult.ok && <Link to="/cart">View cart</Link>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
