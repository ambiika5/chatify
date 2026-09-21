import { formatLastSeen } from "../utils/format";
import { DoubleCheck, SingleCheck } from "./Icons";

export default function MessageTicks({ status }) {
    if (!status || status === "SENT") {
        return (
            <span className="msg-ticks msg-ticks-sent">
                <SingleCheck />
            </span>
        );
    }

    if (status === "DELIVERED") {
        return (
            <span className="msg-ticks msg-ticks-delivered">
                <DoubleCheck />
            </span>
        );
    }

    return (
        <span className="msg-ticks msg-ticks-read">
            <DoubleCheck />
        </span>
    );
}