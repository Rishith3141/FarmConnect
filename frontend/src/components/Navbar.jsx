import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount, clearCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleLogout() {
    logout();
    clearCart();
    closeMenu();
    navigate("/");
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={closeMenu}>
          FarmConnect
        </Link>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
        >
          Menu
        </button>

        <nav className={menuOpen ? "nav-links open" : "nav-links"}>
          <NavLink to="/catalog" onClick={closeMenu}>Shop produce</NavLink>

          {!user && (
            <>
              <NavLink to="/login" onClick={closeMenu}>Log in</NavLink>
              <NavLink to="/register/customer" onClick={closeMenu}>Sign up</NavLink>
              <NavLink to="/register/farmer" className="nav-cta" onClick={closeMenu}>
                Sell as a farmer
              </NavLink>
            </>
          )}

          {user?.role === "CUSTOMER" && (
            <NavLink to="/cart" onClick={closeMenu}>
              Cart
              {itemCount > 0 && <span className="badge">{itemCount}</span>}
            </NavLink>
          )}

          {user?.role === "FARMER" && (
            <>
              <NavLink to="/farmer" end onClick={closeMenu}>Dashboard</NavLink>
              <NavLink to="/farmer/products" onClick={closeMenu}>My products</NavLink>
            </>
          )}

          {user && (
            <>
              <span className="nav-user">Hi, {user.name.split(" ")[0]}</span>
              <button className="link-button" onClick={handleLogout}>Log out</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
