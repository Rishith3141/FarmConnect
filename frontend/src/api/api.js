// One helper that every page uses to talk to the Spring Boot backend.

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// apiRequest("/api/products")                          -> GET
// apiRequest("/api/auth/login", "POST", { ... })       -> POST with a JSON body
export async function apiRequest(path, method = "GET", body = null) {
  const token = localStorage.getItem("token");

  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(API_URL + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Cannot reach the server. Check that the backend is running on port 8080.");
  }

  if (response.status === 204) return null; // success with no content (delete)

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    // Token expired or invalid: clear it and send the user to the login page.
    if (response.status === 401 && token && path !== "/api/auth/login") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    const error = new Error(data?.message || "Something went wrong. Please try again.");
    error.errors = data?.errors || {}; // field-by-field messages from the backend
    error.status = response.status;
    throw error;
  }

  return data;
}
