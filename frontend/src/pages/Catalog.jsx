import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiRequest } from "../api/api";
import { CATEGORIES } from "../constants";
import ProductList from "../components/ProductList";

export default function Catalog() {
  const [searchParams] = useSearchParams();

  const [searchInput, setSearchInput] = useState(""); // what is typed in the box
  const [search, setSearch] = useState("");           // what was actually searched
  const [category, setCategory] = useState(searchParams.get("category") || "");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Runs on page load AND again whenever "search" or "category" changes.
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      setError("");
      try {
        const query = new URLSearchParams();
        if (search) query.set("search", search);
        if (category) query.set("category", category);
        const data = await apiRequest(`/api/products?${query.toString()}`);
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [search, category]);

  function handleSearch(event) {
    event.preventDefault();
    setSearch(searchInput.trim());
  }

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setCategory("");
  }

  const hasFilters = search !== "" || category !== "";

  return (
    <div className="container page">
      <h1>Shop produce</h1>

      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="search"
          placeholder="Search by product name or category"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          aria-label="Search products"
        />
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      <div className="chips">
        <button className={category === "" ? "chip active" : "chip"} onClick={() => setCategory("")}>
          All
        </button>
        {CATEGORIES.map((item) => (
          <button
            key={item}
            className={category === item ? "chip active" : "chip"}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {loading && <p className="muted">Loading products...</p>}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && (
        <>
          <p className="muted">
            {products.length} {products.length === 1 ? "product" : "products"} in stock
            {hasFilters && (
              <>
                {" "}
                <button className="link-button" onClick={clearFilters}>Clear filters</button>
              </>
            )}
          </p>
          <ProductList products={products} />
        </>
      )}
    </div>
  );
}
