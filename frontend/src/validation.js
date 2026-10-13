// Rules shared by both registration forms.
// The backend checks the same rules again (never trust the browser alone).

export function validateAccount(data) {
  const errors = {};

  if (data.name.trim().length < 2) {
    errors.name = "Enter your full name.";
  }
  if (!/^\d{10}$/.test(data.phone)) {
    errors.phone = "Phone must be exactly 10 digits.";
  }
  if (!/^\S+@\S+\.\S+$/.test(data.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (data.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}
