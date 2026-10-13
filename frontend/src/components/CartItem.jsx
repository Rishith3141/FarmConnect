import { formatMoney, formatPrice } from "../constants";

// One row in the cart. The parent (Cart page) passes functions as props.
export default function CartItem({ item, onChangeQuantity, onRemove }) {
  const canDecrease = item.quantity - 1 > 0;
  const canIncrease = item.quantity + 1 <= item.maxQuantity;

  return (
    <div className="cart-item">
      <div className="cart-item-info">
        <h3>{item.name}</h3>
        <p className="muted">
          {item.farmerName} · {formatPrice(item.pricePerUnit)}/{item.unit}
        </p>
      </div>

      <div className="qty-stepper">
        <button
          onClick={() => onChangeQuantity(item.productId, item.quantity - 1)}
          disabled={!canDecrease}
          aria-label={`Decrease ${item.name} quantity`}
        >
          −
        </button>
        <span>
          {item.quantity} {item.unit}
        </span>
        <button
          onClick={() => onChangeQuantity(item.productId, item.quantity + 1)}
          disabled={!canIncrease}
          aria-label={`Increase ${item.name} quantity`}
        >
          +
        </button>
      </div>

      <div className="cart-item-total">{formatMoney(item.pricePerUnit * item.quantity)}</div>

      <button className="link-button danger" onClick={() => onRemove(item.productId)}>
        Remove
      </button>
    </div>
  );
}
