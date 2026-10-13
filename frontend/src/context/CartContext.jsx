import { createContext, useContext, useState } from "react";

const CartContext = createContext(null);

// Round to 2 decimals so 0.1 + 0.2 does not become 0.30000000000000004
function round2(number) {
  return Math.round(number * 100) / 100;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      return [];
    }
  });

  function saveItems(newItems) {
    setItems(newItems);
    localStorage.setItem("cart", JSON.stringify(newItems));
  }

  // Returns { ok: true/false, message } so the page can show the result.
  function addToCart(product, quantity) {
    if (!(quantity > 0)) {
      return { ok: false, message: "Enter a quantity greater than 0." };
    }

    const existing = items.find((item) => item.productId === product.id);
    const alreadyInCart = existing ? existing.quantity : 0;
    const newTotal = round2(alreadyInCart + quantity);
    const available = Number(product.availableQuantity);

    if (newTotal > available) {
      return {
        ok: false,
        message: `Only ${available} ${product.unit} available. You already have ${alreadyInCart} in your cart.`,
      };
    }

    if (existing) {
      saveItems(
        items.map((item) =>
          item.productId === product.id ? { ...item, quantity: newTotal, maxQuantity: available } : item
        )
      );
    } else {
      saveItems([
        ...items,
        {
          productId: product.id,
          name: product.name,
          unit: product.unit,
          pricePerUnit: Number(product.pricePerUnit),
          quantity: round2(quantity),
          maxQuantity: available,
          farmerName: product.farmerName,
          imageUrl: product.imageUrl,
        },
      ]);
    }
    return { ok: true, message: `${product.name} added to your cart.` };
  }

  function updateQuantity(productId, newQuantity) {
    saveItems(
      items.map((item) => {
        if (item.productId !== productId) return item;
        const safe = Math.min(Math.max(round2(newQuantity), 0.01), item.maxQuantity);
        return { ...item, quantity: safe };
      })
    );
  }

  function removeItem(productId) {
    saveItems(items.filter((item) => item.productId !== productId));
  }

  function clearCart() {
    saveItems([]);
  }

  const itemCount = items.length;
  const cartTotal = items.reduce((sum, item) => sum + item.pricePerUnit * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, itemCount, cartTotal, addToCart, updateQuantity, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
