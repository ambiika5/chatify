import { useState } from "react";
import { SendIcon } from "./Icons";

export default function MessageInput({ onSend, onTypingChange, error }) {
    const [value, setValue] = useState("");

    const handleChange = (event) => {
        const next = event.target.value;
        setValue(next);
        onTypingChange(next.trim().length > 0);
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const text = value.trim();

        if (!text) return;

        onSend(text);
        setValue("");
        onTypingChange(false);
    };

    return (
        <div className="composer-wrap">
            {error && <div className="composer-error">{error}</div>}
            <form className="composer" onSubmit={handleSubmit}>
                <input
                    className="composer-input"
                    value={value}
                    onChange={handleChange}
                    placeholder="Type a message…"
                    autoComplete="off"
                />
                <button
                    type="submit"
                    className="send-btn"
                    aria-label="Send message"
                >
                    <SendIcon />
                </button>
            </form>
        </div>
    );
}