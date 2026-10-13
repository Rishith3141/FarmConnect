// Values and helpers used by many pages.

export const CATEGORIES = ["Vegetables", "Fruits", "Grains", "Pulses", "Spices", "Dairy"];

export const UNITS = ["kg", "quintal", "dozen", "litre", "piece"];

// 30 -> "₹30", 32.5 -> "₹32.50"
export function formatPrice(price) {
  const number = Number(price);
  return "₹" + (Number.isInteger(number) ? number : number.toFixed(2));
}

// Always two decimals, used for totals: 90 -> "₹90.00"
export function formatMoney(amount) {
  return "₹" + Number(amount).toFixed(2);
}
