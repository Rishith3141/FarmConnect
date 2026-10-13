import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import RegisterCustomer from "./pages/RegisterCustomer";
import RegisterFarmer from "./pages/RegisterFarmer";
import Catalog from "./pages/Catalog";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import FarmerDashboard from "./pages/FarmerDashboard";
import FarmerProducts from "./pages/FarmerProducts";
import ProductForm from "./pages/ProductForm";
import AccessDenied from "./pages/AccessDenied";

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register/customer" element={<RegisterCustomer />} />
          <Route path="/register/farmer" element={<RegisterFarmer />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/access-denied" element={<AccessDenied />} />

          {/* Customer only */}
          <Route path="/cart" element={<ProtectedRoute role="CUSTOMER"><Cart /></ProtectedRoute>} />

          {/* Farmer only */}
          <Route path="/farmer" element={<ProtectedRoute role="FARMER"><FarmerDashboard /></ProtectedRoute>} />
          <Route path="/farmer/products" element={<ProtectedRoute role="FARMER"><FarmerProducts /></ProtectedRoute>} />
          <Route path="/farmer/products/new" element={<ProtectedRoute role="FARMER"><ProductForm /></ProtectedRoute>} />
          <Route path="/farmer/products/:id/edit" element={<ProtectedRoute role="FARMER"><ProductForm /></ProtectedRoute>} />

          {/* Anything else goes home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="footer">
        <div className="container">
          FarmConnect connects farmers directly with customers. Prices shown on the home page board are samples.
        </div>
      </footer>
    </>
  );
}
