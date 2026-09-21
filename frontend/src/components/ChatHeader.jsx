import { formatLastSeen } from "../utils/format";
import Avatar from "./Avatar";
import { MenuIcon } from "./Icons";

export default function ChatHeader({
    partner,
    onOpenSidebar
}) {
    return (
        <header className="chat-header">
            <button
                className="icon-btn sidebar-toggle"
                onClick={onOpenSidebar}
                aria-label="Open conversation list"
            >
                <MenuIcon />
            </button>
            <Avatar
                name={partner?.username}
                online={Boolean(partner?.isOnline)}
                size={46}
            />
            <div className="chat-header-info">
                <h2 className="chat-header-name">
                    {partner?.username || "Conversation"}
                </h2>
                <span
                    className={`chat-header-status ${
                        partner?.isOnline ? "online" : ""
                    }`}
                >
                    {partner?.isOnline
                        ? "Online"
                        : formatLastSeen(partner?.lastSeen)}
                </span>
            </div>
        </header>
    );
}