import { formatTime } from "../utils/format";
import MessageTicks from "./MessageTicks";

export default function MessageBubble({ message, own, highlight }) {
    return (
        <div className={`msg-row ${own ? "own" : "other"}`}>
            <div
                className={`msg-bubble ${own ? "own" : "other"}${
                    highlight ? " highlight" : ""
                }`}
            >
                <p className="msg-text">{message.content}</p>
                <div className={`msg-meta ${own ? "own" : "other"}`}>
                    <span className="msg-time">
                        {formatTime(message.createdAt)}
                    </span>
                    {own && (
                        <MessageTicks status={message.status} />
                    )}
                </div>
            </div>
        </div>
    );
}