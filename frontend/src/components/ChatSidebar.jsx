import Logo from "./Logo";
import { CloseIcon, LogoutIcon, SearchIcon } from "./Icons";
import ConversationItem from "./ConversationItem";
import UserItem from "./UserItem";
import { getConversationPartner } from "../utils/conversation";
import Avatar from "./Avatar";

export default function ChatSidebar({
    user,
    onLogout,
    conversations,
    activeId,
    onSelectConversation,
    searchActive,
    searchQuery,
    searchResults,
    searching,
    onSearchChange,
    onSelectUser,
    open,
    onClose
}) {
    return (
        <>
            <aside className={`sidebar ${open ? "open" : ""}`}>
                <div className="sidebar-top">
                    <div className="sidebar-brand">
                        <Logo size={38} />
                        <span className="sidebar-brand-name">
                            Chatify
                        </span>
                    </div>
                    <button
                        className="icon-btn sidebar-close"
                        onClick={onClose}
                        aria-label="Close conversation list"
                    >
                        <CloseIcon />
                    </button>
                </div>

                <div className="sidebar-search">
                    <SearchIcon size={18} />
                    <input
                        type="text"
                        placeholder="Search users…"
                        value={searchQuery}
                        onChange={(event) =>
                            onSearchChange(event.target.value)
                        }
                    />
                </div>

                <div className="sidebar-list">
                    {searchActive ? (
                        <>
                            <p className="sidebar-section-title">
                                Search results
                            </p>
                            {searching && (
                                <p className="sidebar-hint">
                                    Searching…
                                </p>
                            )}
                            {!searching &&
                                searchResults.length === 0 && (
                                    <p className="sidebar-hint">
                                        No users found
                                    </p>
                                )}
                            {!searching &&
                                searchResults.map((result) => (
                                    <UserItem
                                        key={result.id}
                                        user={result}
                                        onClick={() =>
                                            onSelectUser(result)
                                        }
                                    />
                                ))}
                        </>
                    ) : (
                        <>
                            <p className="sidebar-section-title">
                                Chats
                            </p>
                            {conversations.length === 0 && (
                                <p className="sidebar-hint">
                                    No conversations yet. Search for
                                    someone to start chatting.
                                </p>
                            )}
                            {conversations.map((conversation) => {
                                const partner =
                                    getConversationPartner(
                                        conversation,
                                        user?.id
                                    );

                                if (!partner) return null;

                                const last =
                                    conversation.messages &&
                                    conversation.messages[0];

                                return (
                                    <ConversationItem
                                        key={conversation.id}
                                        partner={partner}
                                        user={user}
                                        last={last}
                                        unreadCount={
                                            conversation.unreadCount ||
                                            0
                                        }
                                        active={
                                            conversation.id ===
                                            activeId
                                        }
                                        onClick={() =>
                                            onSelectConversation(
                                                conversation
                                            )
                                        }
                                    />
                                );
                            })}
                        </>
                    )}
                </div>

                <div className="sidebar-current-user">
                    <Avatar
                        name={user?.username}
                        size={52}
                    />
                    <div className="current-info">
                        <span className="current-name">
                            {user?.username}
                        </span>
                        <span className="current-email">
                            {user?.email}
                        </span>
                    </div>
                    <button
                        className="logout-btn"
                        onClick={onLogout}
                        title="Logout"
                    >
                        <LogoutIcon />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
            {open && (
                <div
                    className="sidebar-backdrop"
                    onClick={onClose}
                />
            )}
        </>
    );
}