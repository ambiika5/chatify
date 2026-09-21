import { formatLastSeen } from "../utils/format";
import Avatar from "./Avatar";

export default function ConversationItem({
    partner,
    user,
    last,
    active,
    unreadCount,
    onClick
}) {
    let preview = "No messages yet";

    if (last) {
        const prefix =
            last.senderId === user?.id ? "You: " : "";

        preview = `${prefix}${last.content}`;
    }

    const hasUnread = (unreadCount || 0) > 0;

    return (
        <button
            className={`conv-item ${active ? "active" : ""}${
                hasUnread && !active ? " has-unread" : ""
            }`}
            onClick={onClick}
        >
            <Avatar name={partner.username} online={partner.isOnline} />
            <div className="conv-body">
                <div className="conv-line">
                    <span className="conv-name">
                        {partner.username}
                    </span>
                    <span className="conv-side">
                        <span
                            className={`conv-status ${
                                partner.isOnline ? "online" : ""
                            }`}
                        >
                            {partner.isOnline
                                ? "Online"
                                : formatLastSeen(partner.lastSeen)}
                        </span>
                        {hasUnread && (
                            <span className="conv-badge">
                                {unreadCount > 99
                                    ? "99+"
                                    : unreadCount}
                            </span>
                        )}
                    </span>
                </div>
                <div className="conv-line preview">
                    <span className="conv-last">{preview}</span>
                </div>
            </div>
        </button>
    );
}