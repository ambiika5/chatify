import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import { socketManager } from "../socket";
import { getConversationPartner } from "../utils/conversation";
import ChatSidebar from "../components/ChatSidebar";
import ChatHeader from "../components/ChatHeader";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
import EmptyState from "../components/EmptyState";

const MESSAGE_PAGE_SIZE = 30;

export default function ChatPage() {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();

    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] =
        useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessageIds, setNewMessageIds] = useState(() => new Set());
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [typingUserId, setTypingUserId] = useState(null);
    const [sendError, setSendError] = useState(null);

    const [searchActive, setSearchActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const userRef = useRef(user);
    userRef.current = user;

    const activeRef = useRef(null);
    activeRef.current = activeConversation;

    const seenIdsRef = useRef(new Set());
    const unreadCountedIdsRef = useRef(new Set());
    const searchTimerRef = useRef(null);
    const typingTimerRef = useRef(null);

    const highlightMessage = (id) => {
        setNewMessageIds((previous) => {
            const next = new Set(previous);
            next.add(id);
            return next;
        });

        setTimeout(() => {
            setNewMessageIds((previous) => {
                if (!previous.has(id)) return previous;
                const next = new Set(previous);
                next.delete(id);
                return next;
            });
        }, 2600);
    };

    useEffect(() => {
        if (!token) return;

        api.myConversations(token)
            .then((data) => {
                setConversations(
                    (data.conversations || []).map(
                        (conversation) => ({
                            ...conversation,
                            unreadCount:
                                conversation.unreadCount || 0
                        })
                    )
                );
            })
            .catch((error) => {
                console.error(
                    "Failed to load conversations:",
                    error
                );
            });
    }, [token]);

    useEffect(() => {
        if (!token) return;

        const socket = socketManager.connect(token);

        const updateSidebar = (message, increment = false) => {
            setConversations((previous) => {
                const index = previous.findIndex(
                    (conversation) =>
                        conversation.id ===
                        message.conversationId
                );

                if (index === -1) return previous;

                const next = [...previous];
                const current = next[index];
                const unreadCount = increment
                    ? (current.unreadCount || 0) + 1
                    : current.unreadCount || 0;

                next.splice(index, 1);
                next.unshift({
                    ...current,
                    messages: [message],
                    unreadCount
                });

                return next;
            });
        };

        const upsertMessage = (message) => {
            seenIdsRef.current.add(message.id);

            setMessages((previous) => {
                const exists = previous.some(
                    (existing) => existing.id === message.id
                );

                if (exists) {
                    return previous.map((existing) =>
                        existing.id === message.id
                            ? { ...existing, ...message }
                            : existing
                    );
                }

                return [...previous, message].sort(
                    (a, b) => a.id - b.id
                );
            });
        };

        const onNewMessage = (message) => {
            const active = activeRef.current;
            const me = userRef.current;
            const isActive =
                active &&
                message.conversationId === active.id;
            const isOwn = me && message.senderId === me.id;

            let increment = Boolean(!isActive && !isOwn);

            if (increment) {
                if (unreadCountedIdsRef.current.has(message.id)) {
                    increment = false;
                } else {
                    unreadCountedIdsRef.current.add(message.id);
                }
            }

            updateSidebar(message, increment);

            if (isActive) {
                upsertMessage(message);
                highlightMessage(message.id);
                socket.emit("markMessagesRead", {
                    conversationId: active.id
                });
            }
        };

        const onMessageSent = (message) => {
            upsertMessage(message);
            highlightMessage(message.id);
            updateSidebar(message);
            setSendError(null);
        };

        const onMessageStatusUpdated = (message) => {
            setMessages((previous) =>
                previous.map((existing) =>
                    existing.id === message.id
                        ? { ...existing, status: message.status }
                        : existing
                )
            );
        };

        const onMessagesRead = ({ conversationId, messageIds }) => {
            const active = activeRef.current;

            if (
                active &&
                active.id === conversationId &&
                Array.isArray(messageIds)
            ) {
                const idSet = new Set(messageIds);

                setMessages((previous) =>
                    previous.map((existing) =>
                        idSet.has(existing.id)
                            ? { ...existing, status: "READ" }
                            : existing
                    )
                );
            }
        };

        const onUserTyping = (data) => {
            const active = activeRef.current;

            if (!active || !data.userId) return;

            const me = userRef.current;

            if (!me) return;

            const partner = getConversationPartner(active, me.id);

            if (partner && data.userId === partner.id) {
                setTypingUserId(data.userId);
            }
        };

        const onUserStoppedTyping = (data) => {
            setTypingUserId((previous) =>
                previous === data.userId ? null : previous
            );
        };

        const onMessageError = (payload) => {
            setSendError(
                (payload && payload.message) ||
                    "Failed to send message"
            );
        };

        const onConnectError = async (error) => {
            console.error("Socket connection error:", error);

            if (
                error &&
                error.message &&
                /token|auth/i.test(error.message)
            ) {
                await logout();
                navigate("/login", { replace: true });
            }
        };

        socket.on("newMessage", onNewMessage);
        socket.on("messageSent", onMessageSent);
        socket.on("messageStatusUpdated", onMessageStatusUpdated);
        socket.on("messagesRead", onMessagesRead);
        socket.on("userTyping", onUserTyping);
        socket.on("userStoppedTyping", onUserStoppedTyping);
        socket.on("messageError", onMessageError);
        socket.on("connect_error", onConnectError);

        return () => {
            socket.off("newMessage", onNewMessage);
            socket.off("messageSent", onMessageSent);
            socket.off(
                "messageStatusUpdated",
                onMessageStatusUpdated
            );
            socket.off("messagesRead", onMessagesRead);
            socket.off("userTyping", onUserTyping);
            socket.off("userStoppedTyping", onUserStoppedTyping);
            socket.off("messageError", onMessageError);
            socket.off("connect_error", onConnectError);
        };
    }, [token, logout, navigate]);

    useEffect(() => {
        return () => {
            if (searchTimerRef.current) {
                clearTimeout(searchTimerRef.current);
            }
            if (typingTimerRef.current) {
                clearTimeout(typingTimerRef.current);
            }
        };
    }, []);

    const loadMessages = async (conversationId, nextPage, reset) => {
        if (!token) return;

        setLoadingHistory(true);

        try {
            const data = await api.getMessages(
                token,
                conversationId,
                nextPage,
                MESSAGE_PAGE_SIZE
            );

            const pageMessages = data.messages || [];
            const pagination = data.pagination || {};

            setMessages((previous) => {
                const seen = seenIdsRef.current;
                const existing =
                    reset || previous.length === 0
                        ? []
                        : previous.filter(
                              (message) =>
                                  !pageMessages.some(
                                      (pageMessage) =>
                                          pageMessage.id ===
                                          message.id
                                  )
                          );

                pageMessages.forEach((message) =>
                    seen.add(message.id)
                );

                return [...existing, ...pageMessages].sort(
                    (a, b) => a.id - b.id
                );
            });

            setPage(nextPage);
            setHasMore(Boolean(pagination.hasMore));
        } catch (error) {
            console.error("Failed to load messages:", error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const selectConversation = async (conversation) => {
        if (!conversation) return;

        setActiveConversation(conversation);
        seenIdsRef.current = new Set();
        setNewMessageIds(new Set());
        setMessages([]);

        setConversations((previous) =>
            previous.map((existing) =>
                existing.id === conversation.id
                    ? { ...existing, unreadCount: 0 }
                    : existing
            )
        );
        setPage(1);
        setHasMore(false);
        setTypingUserId(null);
        setSendError(null);
        setSearchActive(false);
        setSearchQuery("");
        setSidebarOpen(false);

        const socket = socketManager.getSocket();

        if (socket) {
            socket.emit("joinConversation", conversation.id);
            socket.emit("markMessagesRead", {
                conversationId: conversation.id
            });
        }

        await loadMessages(conversation.id, 1, true);
    };

    const handleSelectUser = async (targetUser) => {
        if (!token) return;

        try {
            const data = await api.createConversation(
                token,
                targetUser.id
            );

            const conversation = data.conversation;

            setConversations((previous) => {
                const exists = previous.some(
                    (existing) => existing.id === conversation.id
                );

                if (exists) {
                    return previous.map((existing) =>
                        existing.id === conversation.id
                            ? conversation
                            : existing
                    );
                }

                return [conversation, ...previous];
            });

            await selectConversation(conversation);
        } catch (error) {
            console.error(
                "Failed to open conversation:",
                error
            );
        }
    };

    const handleSearchChange = (query) => {
        setSearchQuery(query);

        if (searchTimerRef.current) {
            clearTimeout(searchTimerRef.current);
        }

        const trimmed = query.trim();

        if (!trimmed) {
            setSearchActive(false);
            setSearchResults([]);
            setSearching(false);
            return;
        }

        setSearchActive(true);
        setSearching(true);

        searchTimerRef.current = setTimeout(async () => {
            if (!token) return;

            try {
                const data = await api.searchUsers(
                    token,
                    trimmed
                );
                setSearchResults(data.users || []);
            } catch (error) {
                console.error("Search failed:", error);
                setSearchResults([]);
            } finally {
                setSearching(false);
            }
        }, 300);
    };

    const handleSend = (content) => {
        const socket = socketManager.getSocket();
        const active = activeRef.current;

        if (!socket || !active) return;

        setSendError(null);

        socket.emit("sendMessage", {
            conversationId: active.id,
            content
        });
    };

    const handleTypingChange = (isTyping) => {
        const socket = socketManager.getSocket();
        const active = activeRef.current;

        if (!socket || !active) return;

        if (isTyping) {
            socket.emit("typingStart", {
                conversationId: active.id
            });

            if (typingTimerRef.current) {
                clearTimeout(typingTimerRef.current);
            }

            typingTimerRef.current = setTimeout(() => {
                socket.emit("typingStop", {
                    conversationId: active.id
                });
            }, 2500);
        } else {
            if (typingTimerRef.current) {
                clearTimeout(typingTimerRef.current);
            }

            socket.emit("typingStop", {
                conversationId: active.id
            });
        }
    };

    const handleLoadOlder = () => {
        const active = activeRef.current;

        if (active && hasMore && !loadingHistory) {
            loadMessages(active.id, page + 1, false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate("/login", { replace: true });
    };

    const partner = activeConversation
        ? getConversationPartner(activeConversation, user?.id)
        : null;

    return (
        <div className="chat-page">
            <ChatSidebar
                user={user}
                onLogout={handleLogout}
                conversations={conversations}
                activeId={activeConversation?.id}
                onSelectConversation={selectConversation}
                searchActive={searchActive}
                searchQuery={searchQuery}
                searchResults={searchResults}
                searching={searching}
                onSearchChange={handleSearchChange}
                onSelectUser={handleSelectUser}
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <main className="chat-main">
                {activeConversation && partner ? (
                    <>
                        <ChatHeader
                            partner={partner}
                            onOpenSidebar={() =>
                                setSidebarOpen(true)
                            }
                        />
                        <MessageList
                            resetKey={activeConversation.id}
                            messages={messages}
                            newMessageIds={newMessageIds}
                            typingUserId={typingUserId}
                            partner={partner}
                            hasMore={hasMore}
                            loadingHistory={loadingHistory}
                            onLoadOlder={handleLoadOlder}
                            myUserId={user?.id}
                        />
                        <MessageInput
                            onSend={handleSend}
                            onTypingChange={handleTypingChange}
                            error={sendError}
                        />
                    </>
                ) : (
                    <EmptyState
                        onOpenSidebar={() => setSidebarOpen(true)}
                    />
                )}
            </main>
        </div>
    );
}