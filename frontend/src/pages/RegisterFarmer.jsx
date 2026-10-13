import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/api";
import { validateAccount } from "../validation";
import FormInput from "../components/FormInput";

export default function RegisterFarmer() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    farmLocation: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  }

  function validate() {
    const newErrors = validateAccount(formData);
    if (formData.farmLocation.trim() === "") newErrors.farmLocation = "Enter your farm location.";
    return newErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    setServerError("");
    try {
      const { confirmPassword, ...body } = formData;
      await apiRequest("/api/auth/register/farmer", "POST", body);
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setServerError(err.message);
      setErrors(err.errors || {});
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container narrow">
      <div className="form-card">
        <h1>Register as a farmer</h1>
        <p className="muted">List your produce, set your own prices, and sell directly.</p>

        {serverError && <div className="alert alert-error">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <FormInput label="Full name" name="name" value={formData.name}
            onChange={handleChange} error={errors.name} autoComplete="name" />
          <FormInput label="Phone number" name="phone" type="tel" value={formData.phone}
            onChange={handleChange} error={errors.phone} maxLength={10} autoComplete="tel" />
          <FormInput label="Email" name="email" type="email" value={formData.email}
            onChange={handleChange} error={errors.email} autoComplete="email" />
          <FormInput label="Farm location (village, district)" name="farmLocation"
            value={formData.farmLocation} onChange={handleChange} error={errors.farmLocation} />
          <FormInput label="Password" name="password" type="password" value={formData.password}
            onChange={handleChange} error={errors.password} autoComplete="new-password" />
          <FormInput label="Confirm password" name="confirmPassword" type="password"
            value={formData.confirmPassword} onChange={handleChange}
            error={errors.confirmPassword} autoComplete="new-password" />

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Creating account..." : "Create farmer account"}
          </button>
        </form>

        <p className="form-footer">
          Already registered? <Link to="/login">Log in</Link>. Want to buy instead?{" "}
          <Link to="/register/customer">Create a customer account</Link>.
        </p>
      </div>
    </div>
  );
}
