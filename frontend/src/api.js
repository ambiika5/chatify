const API_URL = "";

async function request(path, options = {}) {
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers
    });

    let body = null;

    try {
        body = await response.json();
    } catch {
        body = null;
    }

    if (!response.ok) {
        const error = new Error(
            (body && body.message) ||
                `Request failed (${response.status})`
        );
        error.status = response.status;
        throw error;
    }

    return body;
}

function authHeaders(token) {
    return {
        Authorization: `Bearer ${token}`
    };
}

export const api = {
    register(data) {
        return request("/api/auth/register", {
            method: "POST",
            body: JSON.stringify(data)
        });
    },

    login(data) {
        return request("/api/auth/login", {
            method: "POST",
            body: JSON.stringify(data)
        });
    },

    logout(token) {
        return request("/api/auth/logout", {
            method: "POST",
            headers: authHeaders(token)
        });
    },

    getMe(token) {
        return request("/api/users/me", {
            headers: authHeaders(token)
        });
    },

    searchUsers(token, search) {
        return request(
            `/api/users/search?search=${encodeURIComponent(search)}`,
            { headers: authHeaders(token) }
        );
    },

    getUser(token, id) {
        return request(`/api/users/${id}`, {
            headers: authHeaders(token)
        });
    },

    myConversations(token) {
        return request("/api/conversations", {
            headers: authHeaders(token)
        });
    },

    getConversation(token, id) {
        return request(`/api/conversations/${id}`, {
            headers: authHeaders(token)
        });
    },

    createConversation(token, userId) {
        return request("/api/conversations", {
            method: "POST",
            headers: authHeaders(token),
            body: JSON.stringify({ userId })
        });
    },

    getMessages(token, conversationId, page = 1, limit = 30) {
        return request(
            `/api/messages/${conversationId}?page=${page}&limit=${limit}`,
            { headers: authHeaders(token) }
        );
    }
};