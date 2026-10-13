import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/api";
import { CATEGORIES } from "../constants";
import ProductList from "../components/ProductList";

// Sample prices only (not live market prices).
const SAMPLE_BOARD = [
  ["Tomatoes", "₹30/kg"],
  ["Rice", "₹55/kg"],
  ["Maize", "₹25/kg"],
  ["Onions", "₹35/kg"],
  ["Green chillies", "₹40/kg"],
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // useEffect with [] runs once, when the page first appears.
  useEffect(() => {
    async function loadFeatured() {
      try {
        const data = await apiRequest("/api/products");
        setFeatured(data.slice(0, 4));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-text">
            <h1>Buy straight from the farmer who grew it.</h1>
            <p>
              FarmConnect lists what local farmers have in stock, at the price the farmer sets.
              Order what you need and skip the middlemen.
            </p>
            <div className="hero-actions">
              <Link to="/catalog" className="btn btn-primary">Shop produce</Link>
              <Link to="/register/farmer" className="btn btn-secondary">Sell as a farmer</Link>
            </div>
          </div>

          <div className="price-board" aria-label="Sample price list">
            <h2>Today at the farm stall</h2>
            <ul>
              {SAMPLE_BOARD.map(([name, price]) => (
                <li key={name}>
                  <span>{name}</span>
                  <span className="board-dots" />
                  <span>{price}</span>
                </li>
              ))}
            </ul>
            <p className="board-note">Sample prices for illustration</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Shop by category</h2>
          <div className="category-row">
            {CATEGORIES.map((category) => (
              <Link key={category} to={`/catalog?category=${category}`} className="category-link">
                {category}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-tint">
        <div className="container">
          <div className="section-head">
            <h2>Fresh from our farmers</h2>
            <Link to="/catalog">See everything in stock</Link>
          </div>

          {loading && <p className="muted">Loading products...</p>}
          {error && <div className="alert alert-error">{error}</div>}
          {!loading && !error && (
            <ProductList
              products={featured}
              emptyTitle="No produce listed yet"
              emptyText="Farmers are still adding their products. Check back soon."
            />
          )}
        </div>
      </section>

      <section className="section">
        <div className="container steps">
          <div>
            <h3>Browse</h3>
            <p>See what each farmer has in stock, with the price per unit and the farm it comes from.</p>
          </div>
          <div>
            <h3>Order</h3>
            <p>Pick a quantity, add it to your cart, and we check it against the farmer's stock.</p>
          </div>
          <div>
            <h3>Receive</h3>
            <p>Choose home delivery or collect from a local distribution center.</p>
          </div>
        </div>
      </section>
    </>
  );
}
