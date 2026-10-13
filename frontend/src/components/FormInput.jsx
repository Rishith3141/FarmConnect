// A reusable labelled field. It can render an input, a textarea or a select.
//
//   <FormInput label="Email" name="email" value={formData.email}
//              onChange={handleChange} error={errors.email} />
//
// "value" + "onChange" make it a CONTROLLED input: React state is the single
// source of truth for what is typed.
export default function FormInput({
  label,
  name,
  type = "text",
  as = "input",
  value,
  onChange,
  error,
  children,
  ...rest
}) {
  const id = `field-${name}`;

  let field;
  if (as === "textarea") {
    field = <textarea id={id} name={name} value={value} onChange={onChange} rows={4} {...rest} />;
  } else if (as === "select") {
    field = (
      <select id={id} name={name} value={value} onChange={onChange} {...rest}>
        {children}
      </select>
    );
  } else {
    field = <input id={id} name={name} type={type} value={value} onChange={onChange} {...rest} />;
  }

  return (
    <div className={error ? "field has-error" : "field"}>
      <label htmlFor={id}>{label}</label>
      {field}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
