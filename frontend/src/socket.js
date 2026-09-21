import { io } from "socket.io-client";

const SOCKET_URL =
    import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

class SocketManager {
    constructor() {
        this.socket = null;
        this.token = null;
    }

    connect(token) {
        if (
            this.socket &&
            this.socket.connected &&
            this.token === token
        ) {
            return this.socket;
        }

        this.disconnect();

        this.token = token;
        this.socket = io(SOCKET_URL, {
            auth: { token }
        });

        return this.socket;
    }

    getSocket() {
        return this.socket;
    }

    isConnected() {
        return Boolean(this.socket && this.socket.connected);
    }

    disconnect() {
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
        }
        this.token = null;
    }
}

export const socketManager = new SocketManager();