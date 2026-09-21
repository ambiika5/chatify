import Logo from "./Logo";
import { MenuIcon } from "./Icons";

export default function EmptyState({ onOpenSidebar }) {
    return (
        <div className="empty-state">
            <Logo size={72} />
            <h3 className="empty-title">Select a conversation</h3>
            <p className="empty-subtitle">
                Choose someone from the list or search for a new
                user to start chatting.
            </p>
            {onOpenSidebar && (
                <button
                    className="icon-btn empty-sidebar-toggle"
                    onClick={onOpenSidebar}
                    aria-label="Open conversation list"
                >
                    <MenuIcon />
                </button>
            )}
        </div>
    );
}