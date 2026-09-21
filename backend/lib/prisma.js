import "dotenv/config";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client.ts";

const adapter = new PrismaMariaDb({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: process.env.DB_PASSWORD,
    database: "chatify",

    connectionLimit: 5,

    connectTimeout: 5000,

    allowPublicKeyRetrieval: true
});

const prisma = new PrismaClient({
    adapter
});

export default prisma;