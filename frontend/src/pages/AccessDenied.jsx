import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AccessDenied() {
  const { user } = useAuth();
  const home = user?.role === "FARMER" ? "/farmer" : "/catalog";

  return (
    <div className="container narrow">
      <div className="empty-state">
        <h1>You cannot open this page</h1>
        <p>This page is for a different type of account.</p>
        <Link to={home} className="btn btn-primary">Go back</Link>
      </div>
    </div>
  );
}
