import { jsx as _jsx } from "react/jsx-runtime";
export function Badge({ children, variant = 'default' }) {
    const variants = {
        default: 'bg-gray-100 text-gray-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        danger: 'bg-red-100 text-red-800',
        urgent: 'bg-red-600 text-white',
    };
    return (_jsx("span", { className: `px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`, children: children }));
}
