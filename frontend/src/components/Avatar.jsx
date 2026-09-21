import { initials } from "../utils/format";

export default function Avatar({ name, online = false, size }) {
    const style = size ? { width: size, height: size, fontSize: size / 2.6 } : undefined;

    return (
        <div className={`avatar ${online ? "online" : ""}`} style={style}>
            {initials(name)}
        </div>
    );
}