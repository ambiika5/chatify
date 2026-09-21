import { formatLastSeen } from "../utils/format";
import Avatar from "./Avatar";

export default function UserItem({ user, onClick }) {
    return (
        <button className="conv-item" onClick={onClick}>
            <Avatar name={user.username} online={user.isOnline} />
            <div className="conv-body">
                <div className="conv-line">
                    <span className="conv-name">
                        {user.username}
                    </span>
                    <span
                        className={`conv-status ${
                            user.isOnline ? "online" : ""
                        }`}
                    >
                        {user.isOnline
                            ? "Online"
                            : formatLastSeen(user.lastSeen)}
                    </span>
                </div>
                <div className="conv-line preview">
                    <span className="conv-last">{user.email}</span>
                </div>
            </div>
        </button>
    );
}