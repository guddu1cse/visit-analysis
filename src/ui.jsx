// Input.jsx
export function Input({ type = "text", ...props }) {
    return (
        <input
            type={type}
            {...props}
            className={`text-center border h-[40px] px-5 py-4 m-6 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${props.className || ''}`}
        />
    );
}

// Button.jsx
export function Button({ children, ...props }) {
    return (
        <button
            {...props}
            className={`bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-all ${props.className || ''}`}
        >
            {children}
        </button>
    );
}

// Card.jsx
export function Card({ children, className = "", ...props }) {
    return (
        <div className={`bg-white rounded-xl shadow-md ${className}`} {...props}>
            {children}
        </div>
    );
}

export function CardContent({ children, className = "", ...props }) {
    return (
        <div className={`p-4 ${className}`} {...props}>
            {children}
        </div>
    );
}

// Progress.jsx
export function Progress({ value, className = "" }) {
    return (
        <div className={`w-full h-2 bg-gray-200 rounded-full overflow-hidden ${className}`}>
            <div
                className="bg-indigo-600 h-full transition-all"
                style={{ width: `${value}%` }}
            ></div>
        </div>
    );
}
