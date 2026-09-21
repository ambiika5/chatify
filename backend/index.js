import express from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import prisma from "./lib/prisma.js";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import conversationRoutes from "./routes/conversation.js";
import messageRoutes from "./routes/message.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());

// ========================================
// REST API ROUTES
// ========================================

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

// ========================================
// HOME
// ========================================

app.get("/", (req, res) => {
    res.json({
        message: "Chatify Backend Running",
        status: "OK"
    });
});

// ========================================
// TEST DATABASE
// ========================================

app.get("/test-db", async (req, res) => {
    try {
        const userCount = await prisma.user.count();

        res.json({
            message: "Database connected successfully",
            users: userCount
        });

    } catch (error) {
        console.error("Database connection error:", error);

        res.status(500).json({
            message: "Database connection failed"
        });
    }
});

// ========================================
// HTTP SERVER
// ========================================

const server = createServer(app);

// ========================================
// SOCKET.IO
// ========================================

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

// ========================================
// ONLINE USER TRACKING
// ========================================

const onlineUsers = new Map();

// ========================================
// SOCKET JWT AUTHENTICATION
// ========================================

io.use((socket, next) => {
    try {
        const token = socket.handshake.auth?.token;

        if (!token) {
            return next(
                new Error("Authentication token required")
            );
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        socket.user = decoded;

        next();

    } catch (error) {
        next(
            new Error("Invalid or expired token")
        );
    }
});

// ========================================
// SOCKET CONNECTION
// ========================================

io.on("connection", async (socket) => {
    const userId = Number(socket.user.userId);

    console.log(
        "User connected:",
        socket.id,
        "User:",
        userId
    );

    try {
        // --------------------------------
        // Track connections
        // --------------------------------

        const currentConnections =
            onlineUsers.get(userId) || 0;

        onlineUsers.set(
            userId,
            currentConnections + 1
        );

        // --------------------------------
        // Mark user online
        // --------------------------------

        await prisma.user.update({
            where: {
                id: userId
            },

            data: {
                isOnline: true
            }
        });

    } catch (error) {
        console.error(
            "Online status error:",
            error
        );
    }

    // ====================================
    // JOIN CONVERSATION
    // ====================================

    socket.on(
        "joinConversation",
        async (conversationId) => {
            try {
                const id = Number(conversationId);

                if (!Number.isInteger(id)) {
                    return;
                }

                const membership =
                    await prisma.conversationMember.findUnique({
                        where: {
                            userId_conversationId: {
                                userId,
                                conversationId: id
                            }
                        }
                    });

                if (!membership) {
                    console.log(
                        `Unauthorized conversation join: User ${userId}, Conversation ${id}`
                    );

                    return;
                }

                const room = `conversation_${id}`;

                socket.join(room);

                console.log(
                    `User ${userId} joined conversation ${id}`
                );

                // --------------------------------
                // Deliver previously SENT messages
                // --------------------------------

                const undeliveredMessages =
                    await prisma.message.findMany({
                        where: {
                            conversationId: id,

                            senderId: {
                                not: userId
                            },

                            status: "SENT"
                        }
                    });

                for (const message of undeliveredMessages) {

                    const deliveredMessage =
                        await prisma.message.update({
                            where: {
                                id: message.id
                            },

                            data: {
                                status: "DELIVERED"
                            },

                            include: {
                                sender: {
                                    select: {
                                        id: true,
                                        username: true
                                    }
                                }
                            }
                        });

                    io.to(room).emit(
                        "messageStatusUpdated",
                        deliveredMessage
                    );
                }

            } catch (error) {
                console.error(
                    "Join conversation error:",
                    error
                );
            }
        }
    );

    // ====================================
    // SEND MESSAGE
    // ====================================

    socket.on(
        "sendMessage",
        async (data) => {
            try {
                const conversationId =
                    Number(data?.conversationId);

                const content =
                    String(data?.content || "").trim();

                if (!Number.isInteger(conversationId)) {
                    socket.emit(
                        "messageError",
                        {
                            message:
                                "Invalid conversation ID"
                        }
                    );

                    return;
                }

                if (!content) {
                    socket.emit(
                        "messageError",
                        {
                            message:
                                "Message content is required"
                        }
                    );

                    return;
                }

                // --------------------------------
                // Check conversation membership
                // --------------------------------

                const membership =
                    await prisma.conversationMember.findUnique({
                        where: {
                            userId_conversationId: {
                                userId,
                                conversationId
                            }
                        }
                    });

                if (!membership) {
                    socket.emit(
                        "messageError",
                        {
                            message:
                                "You are not a member of this conversation"
                        }
                    );

                    return;
                }

                // --------------------------------
                // Create message
                // --------------------------------

                const message =
                    await prisma.message.create({
                        data: {
                            conversationId,
                            senderId: userId,
                            content,
                            status: "SENT"
                        },

                        include: {
                            sender: {
                                select: {
                                    id: true,
                                    username: true
                                }
                            }
                        }
                    });

                // --------------------------------
                // Update conversation timestamp
                // --------------------------------

                await prisma.conversation.update({
                    where: {
                        id: conversationId
                    },

                    data: {
                        updatedAt: new Date()
                    }
                });

                const room =
                    `conversation_${conversationId}`;

                // --------------------------------
                // Send message to room
                // --------------------------------

                io.to(room).emit(
                    "newMessage",
                    message
                );

                // --------------------------------
                // Tell sender message was saved
                // --------------------------------

                socket.emit(
                    "messageSent",
                    message
                );

                // --------------------------------
                // Check whether another socket is
                // currently inside this conversation
                // --------------------------------

                const roomSockets =
                    io.sockets.adapter.rooms.get(room);

                let recipientConnected = false;

                if (roomSockets) {
                    for (const socketId of roomSockets) {
                        if (socketId !== socket.id) {
                            recipientConnected = true;
                            break;
                        }
                    }
                }

                // --------------------------------
                // DELIVERED
                // --------------------------------

                if (recipientConnected) {

                    const deliveredMessage =
                        await prisma.message.update({
                            where: {
                                id: message.id
                            },

                            data: {
                                status: "DELIVERED"
                            },

                            include: {
                                sender: {
                                    select: {
                                        id: true,
                                        username: true
                                    }
                                }
                            }
                        });

                    io.to(room).emit(
                        "messageStatusUpdated",
                        deliveredMessage
                    );
                }

                console.log(
                    "Message sent:",
                    message.id
                );

            } catch (error) {
                console.error(
                    "Socket message error:",
                    error
                );

                socket.emit(
                    "messageError",
                    {
                        message:
                            "Failed to send message"
                    }
                );
            }
        }
    );

    // ====================================
    // TYPING START
    // ====================================

    socket.on(
        "typingStart",
        async (data) => {
            try {
                const conversationId =
                    Number(data?.conversationId);

                if (!Number.isInteger(conversationId)) {
                    return;
                }

                const membership =
                    await prisma.conversationMember.findUnique({
                        where: {
                            userId_conversationId: {
                                userId,
                                conversationId
                            }
                        }
                    });

                if (!membership) {
                    return;
                }

                const room =
                    `conversation_${conversationId}`;

                socket.to(room).emit(
                    "userTyping",
                    {
                        userId,
                        username:
                            socket.user.username || null
                    }
                );

            } catch (error) {
                console.error(
                    "Typing start error:",
                    error
                );
            }
        }
    );

    // ====================================
    // TYPING STOP
    // ====================================

    socket.on(
        "typingStop",
        async (data) => {
            try {
                const conversationId =
                    Number(data?.conversationId);

                if (!Number.isInteger(conversationId)) {
                    return;
                }

                const membership =
                    await prisma.conversationMember.findUnique({
                        where: {
                            userId_conversationId: {
                                userId,
                                conversationId
                            }
                        }
                    });

                if (!membership) {
                    return;
                }

                const room =
                    `conversation_${conversationId}`;

                socket.to(room).emit(
                    "userStoppedTyping",
                    {
                        userId
                    }
                );

            } catch (error) {
                console.error(
                    "Typing stop error:",
                    error
                );
            }
        }
    );

    // ====================================
    // MARK MESSAGES AS READ
    // ====================================

    socket.on(
        "markMessagesRead",
        async (data) => {
            try {
                const conversationId =
                    Number(data?.conversationId);

                if (!Number.isInteger(conversationId)) {
                    return;
                }

                // --------------------------------
                // Check membership
                // --------------------------------

                const membership =
                    await prisma.conversationMember.findUnique({
                        where: {
                            userId_conversationId: {
                                userId,
                                conversationId
                            }
                        }
                    });

                if (!membership) {
                    return;
                }

                // --------------------------------
                // Find unread messages received
                // from other users
                // --------------------------------

                const unreadMessages =
                    await prisma.message.findMany({
                        where: {
                            conversationId,

                            senderId: {
                                not: userId
                            },

                            status: {
                                not: "READ"
                            }
                        },

                        select: {
                            id: true
                        }
                    });

                if (unreadMessages.length === 0) {
                    return;
                }

                const messageIds =
                    unreadMessages.map(
                        (message) => message.id
                    );

                // --------------------------------
                // Update each message
                // --------------------------------

                await prisma.message.updateMany({
                    where: {
                        id: {
                            in: messageIds
                        }
                    },

                    data: {
                        status: "READ"
                    }
                });

                // --------------------------------
                // Notify conversation
                // --------------------------------

                const room =
                    `conversation_${conversationId}`;

                io.to(room).emit(
                    "messagesRead",
                    {
                        conversationId,
                        messageIds,
                        readBy: userId
                    }
                );

            } catch (error) {
                console.error(
                    "Mark messages read error:",
                    error
                );
            }
        }
    );

    // ====================================
    // DISCONNECT
    // ====================================

    socket.on(
        "disconnect",
        async () => {
            console.log(
                "User disconnected:",
                socket.id
            );

            try {
                const currentConnections =
                    onlineUsers.get(userId) || 0;

                if (currentConnections <= 1) {

                    onlineUsers.delete(userId);

                    await prisma.user.update({
                        where: {
                            id: userId
                        },

                        data: {
                            isOnline: false,
                            lastSeen: new Date()
                        }
                    });

                    console.log(
                        `User ${userId} is now offline`
                    );

                } else {

                    onlineUsers.set(
                        userId,
                        currentConnections - 1
                    );

                    console.log(
                        `User ${userId} still has ${currentConnections - 1} active connection(s)`
                    );
                }

            } catch (error) {
                console.error(
                    "Disconnect status error:",
                    error
                );
            }
        }
    );
});

// ========================================
// START SERVER
// ========================================

server.listen(PORT, () => {
    console.log(
        `Server running on port ${PORT}`
    );
});