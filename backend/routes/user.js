import express from "express";

import prisma from "../lib/prisma.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// ============================
// GET CURRENT USER
// ============================

router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.user.userId
            },
            select: {
                id: true,
                username: true,
                email: true,
                isOnline: true,
                lastSeen: true,
                createdAt: true
            }
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            user
        });

    } catch (error) {
        console.error("Get current user error:", error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
});

// ============================
// SEARCH USERS
// ============================

router.get("/search", authMiddleware, async (req, res) => {
    try {
        const search = String(
            req.query.search || ""
        ).trim();

        if (!search) {
            return res.json({
                users: []
            });
        }

        const users = await prisma.user.findMany({
            where: {
                AND: [
                    {
                        id: {
                            not: req.user.userId
                        }
                    },
                    {
                        OR: [
                            {
                                username: {
                                    contains: search
                                }
                            },
                            {
                                email: {
                                    contains: search
                                }
                            }
                        ]
                    }
                ]
            },
            select: {
                id: true,
                username: true,
                email: true,
                isOnline: true,
                lastSeen: true
            },
            take: 20
        });

        res.json({
            users
        });

    } catch (error) {
        console.error("Search users error:", error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
});

// ============================
// GET USER PROFILE
// ============================

router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const userId = Number(req.params.id);

        if (!Number.isInteger(userId)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true,
                username: true,
                email: true,
                isOnline: true,
                lastSeen: true,
                createdAt: true
            }
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            user
        });

    } catch (error) {
        console.error("Get user profile error:", error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
});

export default router;