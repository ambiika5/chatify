import express from "express";

import prisma from "../lib/prisma.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// ============================
// CREATE / GET PRIVATE CHAT
// ============================

router.post("/", authMiddleware, async (req, res) => {
    try {
        const currentUserId = req.user.userId;
        const targetUserId = Number(req.body.userId);

        if (!targetUserId) {
            return res.status(400).json({
                message: "User ID is required"
            });
        }

        if (currentUserId === targetUserId) {
            return res.status(400).json({
                message: "You cannot create a conversation with yourself"
            });
        }

        const targetUser = await prisma.user.findUnique({
            where: {
                id: targetUserId
            }
        });

        if (!targetUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Find existing private conversation
        const conversations = await prisma.conversation.findMany({
            where: {
                type: "PRIVATE",

                members: {
                    some: {
                        userId: currentUserId
                    }
                }
            },

            include: {
                members: {
                    select: {
                        userId: true
                    }
                }
            }
        });

        const existingConversation = conversations.find(
            (conversation) => {
                const memberIds = conversation.members
                    .map((member) => member.userId)
                    .sort((a, b) => a - b);

                const expectedIds = [
                    currentUserId,
                    targetUserId
                ].sort((a, b) => a - b);

                return (
                    memberIds.length === 2 &&
                    memberIds[0] === expectedIds[0] &&
                    memberIds[1] === expectedIds[1]
                );
            }
        );

        if (existingConversation) {
            const conversation = await prisma.conversation.findUnique({
                where: {
                    id: existingConversation.id
                },
                include: {
                    members: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    username: true,
                                    email: true,
                                    isOnline: true,
                                    lastSeen: true
                                }
                            }
                        }
                    }
                }
            });

            return res.json({
                conversation
            });
        }

        const conversation = await prisma.conversation.create({
            data: {
                type: "PRIVATE",

                members: {
                    create: [
                        {
                            userId: currentUserId
                        },
                        {
                            userId: targetUserId
                        }
                    ]
                }
            },

            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                email: true,
                                isOnline: true,
                                lastSeen: true
                            }
                        }
                    }
                }
            }
        });

        res.status(201).json({
            message: "Conversation created",
            conversation
        });

    } catch (error) {
        console.error("Create conversation error:", error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
});

// ============================
// GET MY CONVERSATIONS
// ============================

router.get("/", authMiddleware, async (req, res) => {
    try {
        const conversations = await prisma.conversation.findMany({
            where: {
                members: {
                    some: {
                        userId: req.user.userId
                    }
                }
            },

            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                email: true,
                                isOnline: true,
                                lastSeen: true
                            }
                        }
                    }
                },

                messages: {
                    orderBy: {
                        createdAt: "desc"
                    },
                    take: 1,

                    include: {
                        sender: {
                            select: {
                                id: true,
                                username: true
                            }
                        }
                    }
                }
            },

            orderBy: {
                updatedAt: "desc"
            }
        });

        // --------------------------------
        // Unread count for the current user
        // --------------------------------

        const conversationIds = conversations.map(
            (conversation) => conversation.id
        );

        const unreadRows =
            conversationIds.length > 0
                ? await prisma.message.groupBy({
                      by: ["conversationId"],

                      where: {
                          conversationId: {
                              in: conversationIds
                          },

                          senderId: {
                              not: req.user.userId
                          },

                          status: {
                              not: "READ"
                          }
                      },

                      _count: {
                          _all: true
                      }
                  })
                : [];

        const unreadMap = new Map(
            unreadRows.map((row) => [
                row.conversationId,
                row._count._all
            ])
        );

        const result = conversations.map((conversation) => ({
            ...conversation,
            unreadCount:
                unreadMap.get(conversation.id) || 0
        }));

        res.json({
            conversations: result
        });

    } catch (error) {
        console.error("Get conversations error:", error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
});

// ============================
// GET SINGLE CONVERSATION
// ============================

router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const conversationId = Number(req.params.id);

        if (!Number.isInteger(conversationId)) {
            return res.status(400).json({
                message: "Invalid conversation ID"
            });
        }

        const membership =
            await prisma.conversationMember.findUnique({
                where: {
                    userId_conversationId: {
                        userId: req.user.userId,
                        conversationId
                    }
                }
            });

        if (!membership) {
            return res.status(403).json({
                message: "You are not a member of this conversation"
            });
        }

        const conversation =
            await prisma.conversation.findUnique({
                where: {
                    id: conversationId
                },

                include: {
                    members: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    username: true,
                                    email: true,
                                    isOnline: true,
                                    lastSeen: true
                                }
                            }
                        }
                    }
                }
            });

        if (!conversation) {
            return res.status(404).json({
                message: "Conversation not found"
            });
        }

        res.json({
            conversation
        });

    } catch (error) {
        console.error("Get conversation error:", error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
});

export default router;