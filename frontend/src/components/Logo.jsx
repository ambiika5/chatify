export default function Logo({ size = 44 }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Chatify"
        >
            <defs>
                <linearGradient
                    id="chatifyGrad"
                    x1="4"
                    y1="4"
                    x2="44"
                    y2="44"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0%" stopColor="#ff4db8" />
                    <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
            </defs>
            <rect
                x="2"
                y="2"
                width="44"
                height="44"
                rx="13"
                fill="url(#chatifyGrad)"
            />
            <path
                d="M13 15.5C13 13.6 14.6 12 16.5 12H31.5C33.4 12 35 13.6 35 15.5V26.5C35 28.4 33.4 30 31.5 30H21.5L15 35.5V30H16.5C14.6 30 13 28.4 13 26.5V15.5Z"
                fill="white"
            />
            <circle cx="18" cy="21" r="1.6" fill="url(#chatifyGrad)" />
            <circle cx="24" cy="21" r="1.6" fill="url(#chatifyGrad)" />
            <circle cx="30" cy="21" r="1.6" fill="url(#chatifyGrad)" />
        </svg>
    );
}