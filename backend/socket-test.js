import { io } from "socket.io-client";

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYXZpc2hrYUB0ZXN0LmNvbSIsImlhdCI6MTc4OTg0MjcwNCwiZXhwIjoxNzkwNDQ3NTA0fQ.umD_Bsr7wtllLe2f55rp94YaCFKsa9xqNFbZtzxJLS4";


// ========================================
// SOCKET 1
// ========================================

const socket1 = io(
    "http://localhost:5000",
    {
        auth: {
            token
        }
    }
);

// ========================================
// SOCKET 2
// ========================================

const socket2 = io(
    "http://localhost:5000",
    {
        auth: {
            token
        }
    }
);

// ========================================
// SOCKET 1 CONNECT
// ========================================

socket1.on("connect", () => {

    console.log(
        "Socket 1 connected:",
        socket1.id
    );

    socket1.emit(
        "joinConversation",
        1
    );

    setTimeout(() => {

        console.log(
            "Socket 1 sending message..."
        );

        socket1.emit(
            "sendMessage",
            {
                conversationId: 1,
                content: "Testing Chatify backend"
            }
        );

    }, 1000);
});

// ========================================
// MESSAGE SENT
// ========================================

socket1.on(
    "messageSent",
    (message) => {

        console.log(
            "\n===== MESSAGE SENT ====="
        );

        console.log(
            "Message ID:",
            message.id
        );

        console.log(
            "Content:",
            message.content
        );

        console.log(
            "Status:",
            message.status
        );

        console.log(
            "========================\n"
        );
    }
);

// ========================================
// STATUS UPDATED
// ========================================

socket1.on(
    "messageStatusUpdated",
    (message) => {

        console.log(
            "\n===== STATUS UPDATED ====="
        );

        console.log(
            "Message ID:",
            message.id
        );

        console.log(
            "Status:",
            message.status
        );

        console.log(
            "=========================\n"
        );
    }
);

// ========================================
// NEW MESSAGE
// ========================================

socket1.on(
    "newMessage",
    (message) => {

        console.log(
            "\n===== NEW MESSAGE SOCKET 1 ====="
        );

        console.log(message);

        console.log(
            "================================\n"
        );
    }
);

// ========================================
// SOCKET 1 ERRORS
// ========================================

socket1.on(
    "messageError",
    (error) => {

        console.log(
            "Socket 1 message error:",
            error.message
        );
    }
);

socket1.on(
    "connect_error",
    (error) => {

        console.log(
            "Socket 1 connection error:",
            error.message
        );
    }
);

// ========================================
// SOCKET 2 CONNECT
// ========================================

socket2.on("connect", () => {

    console.log(
        "Socket 2 connected:",
        socket2.id
    );

    socket2.emit(
        "joinConversation",
        1
    );
});

// ========================================
// SOCKET 2 NEW MESSAGE
// ========================================

socket2.on(
    "newMessage",
    (message) => {

        console.log(
            "\n===== NEW MESSAGE SOCKET 2 ====="
        );

        console.log(
            "Message ID:",
            message.id
        );

        console.log(
            "Content:",
            message.content
        );

        console.log(
            "Status:",
            message.status
        );

        console.log(
            "================================\n"
        );

        // Mark received messages as read
        setTimeout(() => {

            socket2.emit(
                "markMessagesRead",
                {
                    conversationId: 1
                }
            );

        }, 1000);
    }
);

// ========================================
// SOCKET 2 STATUS
// ========================================

socket2.on(
    "messageStatusUpdated",
    (message) => {

        console.log(
            "\n===== SOCKET 2 STATUS ====="
        );

        console.log(
            "Message ID:",
            message.id
        );

        console.log(
            "Status:",
            message.status
        );

        console.log(
            "===========================\n"
        );
    }
);

// ========================================
// READ RECEIPT
// ========================================

socket2.on(
    "messagesRead",
    (data) => {

        console.log(
            "\n===== MESSAGES READ ====="
        );

        console.log(data);

        console.log(
            "=========================\n"
        );
    }
);

// ========================================
// SOCKET 2 ERRORS
// ========================================

socket2.on(
    "connect_error",
    (error) => {

        console.log(
            "Socket 2 connection error:",
            error.message
        );
    }
);