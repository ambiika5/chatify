import Logo from "./Logo";

export default function AuthLayout({ children }) {
    return (
        <div className="auth-page">
            <span className="auth-glow auth-glow-1" />
            <span className="auth-glow auth-glow-2" />
            <span className="auth-glow auth-glow-3" />
            <div className="auth-container">
                <div className="auth-brand">
                    <Logo size={64} />
                    <h1 className="auth-title">
                        Join the
                        <span className="auth-title-accent">
                            Conversation
                        </span>
                    </h1>
                    <p className="auth-subtitle">
                        Connect with the people who matter most. Chat in
                        real time — stay close, stay in the moment.
                    </p>
                </div>
                <div className="auth-card">{children}</div>
            </div>
        </div>
    );
}