import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

export default function MessageList({
    messages,
    newMessageIds,
    typingUserId,
    partner,
    hasMore,
    loadingHistory,
    onLoadOlder,
    myUserId,
    resetKey
}) {
    const scrollerRef = useRef(null);

    useEffect(() => {
        const element = scrollerRef.current;

        if (element) {
            element.scrollTop = element.scrollHeight;
        }
    }, [resetKey]);

    useEffect(() => {
        const element = scrollerRef.current;

        if (!element) return;

        const nearBottom =
            element.scrollHeight -
                element.scrollTop -
                element.clientHeight <
            160;

        if (nearBottom) {
            element.scrollTop = element.scrollHeight;
        }
    }, [messages.length, typingUserId]);

    const handleScroll = () => {
        const element = scrollerRef.current;

        if (
            element &&
            element.scrollTop < 50 &&
            hasMore &&
            !loadingHistory
        ) {
            onLoadOlder();
        }
    };

    return (
        <div
            className="messages"
            ref={scrollerRef}
            onScroll={handleScroll}
        >
            {loadingHistory && (
                <div className="messages-loading">
                    Loading older messages…
                </div>
            )}

            {messages.map((message) => (
                <MessageBubble
                    key={message.id}
                    message={message}
                    own={message.senderId === myUserId}
                    highlight={newMessageIds.has(message.id)}
                />
            ))}

            {typingUserId !== null && (
                <TypingIndicator partner={partner} />
            )}

            {messages.length === 0 && !loadingHistory && (
                <div className="messages-empty">
                    No messages yet — say hello!
                </div>
            )}
        </div>
    );
}