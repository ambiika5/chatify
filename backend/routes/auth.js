import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import prisma from "../lib/prisma.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// ============================
// REGISTER
// ============================

router.post("/register", async (req, res) => {
    try {
        const {
            username,
            email,
            password
        } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Username, email and password are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    {
                        username
                    },
                    {
                        email
                    }
                ]
            }
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Username or email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword
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

        res.status(201).json({
            message: "Registration successful",
            user
        });

    } catch (error) {
        console.error("Register error:", error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
});

// ============================
// LOGIN
// ============================

router.post("/login", async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                isOnline: true
            }
        });

        const token = jwt.sign(
            {
                userId: user.id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.json({
            message: "Login successful",

            token,

            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                isOnline: true,
                lastSeen: user.lastSeen
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
});

// ============================
// LOGOUT
// ============================

router.post("/logout", authMiddleware, async (req, res) => {
    try {
        await prisma.user.update({
            where: {
                id: req.user.userId
            },
            data: {
                isOnline: false,
                lastSeen: new Date()
            }
        });

        res.json({
            message: "Logout successful"
        });

    } catch (error) {
        console.error("Logout error:", error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
});

export default router;