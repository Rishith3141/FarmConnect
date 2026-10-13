import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FormInput from "../components/FormInput";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Form state: one object for all inputs (same idea as your student form)
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  }

  function validate() {
    const newErrors = {};
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Enter a valid email address.";
    if (formData.password === "") newErrors.password = "Enter your password.";
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
      const user = await login(formData.email, formData.password);
      const from = location.state?.from;
      navigate(from || (user.role === "FARMER" ? "/farmer" : "/catalog"), { replace: true });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container narrow">
      <div className="form-card">
        <h1>Log in</h1>

        {location.state?.registered && (
          <div className="alert alert-success">Account created. Log in to continue.</div>
        )}
        {serverError && <div className="alert alert-error">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <FormInput
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            autoComplete="email"
          />
          <FormInput
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete="current-password"
          />
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="form-footer">
          New here? <Link to="/register/customer">Create a customer account</Link> or{" "}
          <Link to="/register/farmer">register as a farmer</Link>.
        </p>
      </div>
    </div>
  );
}
