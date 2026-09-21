import express from "express";

import prisma from "../lib/prisma.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// ============================
// SEND MESSAGE THROUGH REST
// ============================

router.post("/", authMiddleware, async (req, res) => {
    try {
        const conversationId = Number(
            req.body.conversationId
        );

        const content = String(
            req.body.content || ""
        ).trim();

        if (!Number.isInteger(conversationId)) {
            return res.status(400).json({
                message: "Invalid conversation ID"
            });
        }

        if (!content) {
            return res.status(400).json({
                message: "Message content is required"
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

        const message = await prisma.message.create({
            data: {
                conversationId,
                senderId: req.user.userId,
                content
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

        // Update conversation timestamp
        await prisma.conversation.update({
            where: {
                id: conversationId
            },
            data: {
                updatedAt: new Date()
            }
        });

        res.status(201).json({
            message
        });

    } catch (error) {
        console.error("Create message error:", error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
});

// ============================
// GET MESSAGE HISTORY
// ============================

router.get("/:conversationId", authMiddleware, async (req, res) => {
    try {
        const conversationId = Number(
            req.params.conversationId
        );

        const page = Math.max(
            Number(req.query.page) || 1,
            1
        );

        const limit = Math.min(
            Math.max(Number(req.query.limit) || 30, 1),
            100
        );

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

        const total = await prisma.message.count({
            where: {
                conversationId
            }
        });

        const messages = await prisma.message.findMany({
            where: {
                conversationId
            },

            include: {
                sender: {
                    select: {
                        id: true,
                        username: true
                    }
                }
            },

            orderBy: {
                createdAt: "desc"
            },

            skip: (page - 1) * limit,

            take: limit
        });

        // Return oldest → newest
        messages.reverse();

        res.json({
            messages,
            pagination: {
                page,
                limit,
                total,
                hasMore: page * limit < total
            }
        });

    } catch (error) {
        console.error("Get messages error:", error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
});

export default router;