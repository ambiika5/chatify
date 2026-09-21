import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const successMessage = location.state?.success || null;

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (!email.trim() || !password) {
            setError("Email and password are required");
            return;
        }

        setSubmitting(true);

        try {
            await login(email.trim(), password);
            navigate("/chat", { replace: true });
        } catch (err) {
            setError(err.message || "Login failed");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthLayout>
            <h2 className="auth-card-title">Welcome Back</h2>
            <p className="auth-card-subtitle">
                Sign in to continue your conversations
            </p>

            {successMessage && (
                <div className="auth-alert auth-alert-success">
                    {successMessage}
                </div>
            )}

            {error && (
                <div className="auth-alert auth-alert-error">
                    {error}
                </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
                <label className="auth-label" htmlFor="login-email">
                    Email
                </label>
                <input
                    id="login-email"
                    type="email"
                    className="auth-input"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                />

                <label className="auth-label" htmlFor="login-password">
                    Password
                </label>
                <input
                    id="login-password"
                    type="password"
                    className="auth-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                />

                <button
                    type="submit"
                    className="auth-button"
                    disabled={submitting}
                >
                    {submitting ? "Logging in…" : "Login"}
                </button>
            </form>

            <p className="auth-switch">
                Don&apos;t have an account?{" "}
                <Link to="/register" className="auth-link">
                    Register
                </Link>
            </p>
        </AuthLayout>
    );
}