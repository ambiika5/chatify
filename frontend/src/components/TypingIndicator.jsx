export default function TypingIndicator({ partner }) {
    const name = partner?.username || "Someone";

    return (
        <div className="msg-row other">
            <div className="typing-indicator">
                <span className="typing-dots">
                    <i />
                    <i />
                    <i />
                </span>
                <span className="typing-text">{name} is typing…</span>
            </div>
        </div>
    );
}