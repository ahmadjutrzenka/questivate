import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";
import { GoogleLogin } from "@react-oauth/google";
import { login, googleLogin } from "../features/auth/authSlice";
import { toast } from "react-toastify";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(login(form.email, form.password));
    if (localStorage.getItem("access_token")) navigate("/");
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Login to</h1>
        <div className="auth-logo-text">Questivate</div>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="input"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary auth-btn"
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>
        <div className="auth-divider">OR</div>
        <div className="auth-google">
          <GoogleLogin
            onSuccess={(res) => dispatch(googleLogin(res.credential))}
            onError={() => {}}
            useOneTap={false}
            theme="filled_black"
            shape="rectangular"
            width="320"
          />
        </div>
        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register" className="auth-link">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
