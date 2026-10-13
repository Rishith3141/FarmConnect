import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../api/api";
import { CATEGORIES, UNITS } from "../constants";
import FormInput from "../components/FormInput";

const emptyForm = {
  name: "",
  category: CATEGORIES[0],
  description: "",
  pricePerUnit: "",
  unit: UNITS[0],
  availableQuantity: "",
  imageUrl: "",
};

// One page used for both: /farmer/products/new  and  /farmer/products/:id/edit
export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(isEdit); // loading existing product
  const [saving, setSaving] = useState(false);

  // When editing, load the product and fill the form.
  useEffect(() => {
    if (!isEdit) return;
    async function loadProduct() {
      try {
        const p = await apiRequest(`/api/farmer/products/${id}`);
        setFormData({
          name: p.name,
          category: p.category,
          description: p.description || "",
          pricePerUnit: String(p.pricePerUnit),
          unit: p.unit,
          availableQuantity: String(p.availableQuantity),
          imageUrl: p.imageUrl || "",
        });
      } catch (err) {
        setServerError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id, isEdit]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  }

  function validate() {
    const newErrors = {};
    if (formData.name.trim() === "") newErrors.name = "Enter the product name.";
    if (formData.pricePerUnit === "" || Number(formData.pricePerUnit) <= 0) {
      newErrors.pricePerUnit = "Price must be greater than 0.";
    }
    if (formData.availableQuantity === "" || Number(formData.availableQuantity) < 0) {
      newErrors.availableQuantity = "Quantity cannot be negative.";
    }
    if (formData.imageUrl.trim() !== "" && !/^https?:\/\//i.test(formData.imageUrl.trim())) {
      newErrors.imageUrl = "Image link must start with http:// or https://";
    }
    return newErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSaving(true);
    setServerError("");
    try {
      const body = {
        ...formData,
        pricePerUnit: Number(formData.pricePerUnit),
        availableQuantity: Number(formData.availableQuantity),
      };
      if (isEdit) {
        await apiRequest(`/api/farmer/products/${id}`, "PUT", body);
      } else {
        await apiRequest("/api/farmer/products", "POST", body);
      }
      navigate("/farmer/products");
    } catch (err) {
      setServerError(err.message);
      setErrors(err.errors || {});
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="container page"><p className="muted">Loading product...</p></div>;

  return (
    <div className="container narrow">
      <div className="form-card">
        <h1>{isEdit ? "Edit product" : "Add a product"}</h1>

        {serverError && <div className="alert alert-error">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <FormInput label="Product name" name="name" value={formData.name}
            onChange={handleChange} error={errors.name} />

          <FormInput label="Category" name="category" as="select" value={formData.category}
            onChange={handleChange} error={errors.category}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </FormInput>

          <FormInput label="Description (optional)" name="description" as="textarea"
            value={formData.description} onChange={handleChange} error={errors.description} />

          <div className="field-row">
            <FormInput label="Price per unit (₹)" name="pricePerUnit" type="number" min="0"
              step="0.01" value={formData.pricePerUnit} onChange={handleChange}
              error={errors.pricePerUnit} />
            <FormInput label="Unit" name="unit" as="select" value={formData.unit}
              onChange={handleChange} error={errors.unit}>
              {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </FormInput>
          </div>

          <FormInput label="Available quantity" name="availableQuantity" type="number" min="0"
            step="0.01" value={formData.availableQuantity} onChange={handleChange}
            error={errors.availableQuantity} />

          <FormInput label="Image link (optional)" name="imageUrl" value={formData.imageUrl}
            onChange={handleChange} error={errors.imageUrl} placeholder="https://..." />

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save product"}
            </button>
            <Link to="/farmer/products" className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
