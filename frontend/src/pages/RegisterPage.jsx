import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (!username.trim() || !email.trim() || !password) {
            setError("Username, email and password are required");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setSubmitting(true);

        try {
            await register(username.trim(), email.trim(), password);
            navigate("/login", {
                replace: true,
                state: {
                    success: "Account created successfully. Please log in."
                }
            });
        } catch (err) {
            setError(err.message || "Registration failed");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthLayout>
            <h2 className="auth-card-title">Create Account</h2>
            <p className="auth-card-subtitle">
                Join the Conversation in a few seconds
            </p>

            {error && (
                <div className="auth-alert auth-alert-error">
                    {error}
                </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
                <label className="auth-label" htmlFor="register-username">
                    Username
                </label>
                <input
                    id="register-username"
                    type="text"
                    className="auth-input"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    autoComplete="username"
                />

                <label className="auth-label" htmlFor="register-email">
                    Email
                </label>
                <input
                    id="register-email"
                    type="email"
                    className="auth-input"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                />

                <label className="auth-label" htmlFor="register-password">
                    Password
                </label>
                <input
                    id="register-password"
                    type="password"
                    className="auth-input"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="new-password"
                />

                <button
                    type="submit"
                    className="auth-button"
                    disabled={submitting}
                >
                    {submitting ? "Creating account…" : "Register"}
                </button>
            </form>

            <p className="auth-switch">
                Already have an account?{" "}
                <Link to="/login" className="auth-link">
                    Login
                </Link>
            </p>
        </AuthLayout>
    );
}