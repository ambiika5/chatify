import { formatLastSeen } from "../utils/format";
import Avatar from "./Avatar";

export default function ConversationItem({
    partner,
    user,
    last,
    active,
    onClick
}) {
    let preview = "No messages yet";

    if (last) {
        const prefix =
            last.senderId === user?.id ? "You: " : "";

        preview = `${prefix}${last.content}`;
    }

    return (
        <button
            className={`conv-item ${active ? "active" : ""}`}
            onClick={onClick}
        >
            <Avatar name={partner.username} online={partner.isOnline} />
            <div className="conv-body">
                <div className="conv-line">
                    <span className="conv-name">
                        {partner.username}
                    </span>
                    <span
                        className={`conv-status ${
                            partner.isOnline ? "online" : ""
                        }`}
                    >
                        {partner.isOnline
                            ? "Online"
                            : formatLastSeen(partner.lastSeen)}
                    </span>
                </div>
                <div className="conv-line preview">
                    <span className="conv-last">{preview}</span>
                </div>
            </div>
        </button>
    );
}