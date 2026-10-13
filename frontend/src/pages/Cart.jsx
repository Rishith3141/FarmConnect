import { Link } from "react-router-dom";
import { formatMoney } from "../constants";
import { useCart } from "../context/CartContext";
import CartItem from "../components/CartItem";

export default function Cart() {
  const { items, cartTotal, updateQuantity, removeItem, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="container page">
        <h1>Your cart</h1>
        <div className="empty-state">
          <h3>Your cart is empty</h3>
          <p>Find fresh produce from local farmers and add it here.</p>
          <Link to="/catalog" className="btn btn-primary">Shop produce</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container page">
      <h1>Your cart</h1>

      <div className="cart-layout">
        <div className="cart-list">
          {items.map((item) => (
            <CartItem
              key={item.productId}
              item={item}
              onChangeQuantity={updateQuantity}
              onRemove={removeItem}
            />
          ))}
          <button className="link-button danger" onClick={clearCart}>Clear cart</button>
        </div>

        <aside className="summary">
          <h2>Summary</h2>
          <div className="summary-row">
            <span>Items</span>
            <span>{items.length}</span>
          </div>
          <div className="summary-row total">
            <span>Estimated total</span>
            <span>{formatMoney(cartTotal)}</span>
          </div>
          <p className="muted">
            Prices and stock are checked again by the server when you place an order.
          </p>
          <button className="btn btn-primary btn-block" disabled>
            Checkout (coming in Phase 2)
          </button>
        </aside>
      </div>
    </div>
  );
}
