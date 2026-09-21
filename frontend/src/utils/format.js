export function formatTime(iso) {
    if (!iso) return "";

    const date = new Date(iso);

    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
}

export function formatLastSeen(iso) {
    if (!iso) return "Offline";

    const diff = Date.now() - new Date(iso).getTime();

    if (diff < 60_000) return "Last seen just now";

    const minutes = Math.floor(diff / 60_000);

    if (minutes < 60) return `Last seen ${minutes}m ago`;

    const hours = Math.floor(minutes / 60);

    if (hours < 24) return `Last seen ${hours}h ago`;

    const days = Math.floor(hours / 24);

    return `Last seen ${days}d ago`;
}

export function initials(name) {
    if (!name) return "?";

    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

    return (parts[0][0] + parts[1][0]).toUpperCase();
}