import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Layout Component
 * Header with user info and logout
 */
import { useSession } from '../../contexts/SessionContext';
export function Layout({ children }) {
    const { session, logout } = useSession();
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("header", { className: "bg-white shadow-sm border-b border-gray-200", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 py-4 flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold text-gray-900", children: "CMMS System" }), session != null && (_jsxs("p", { className: "text-sm text-gray-600", children: [session.userName, " \u2022 ", session.role, session.storeName != null ? ` • ${session.storeName}` : '', session.regionName != null ? ` • ${session.regionName}` : ''] }))] }), _jsx("button", { type: "button", onClick: logout, className: "px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition", children: "Logout" })] }) }), _jsx("main", { className: "max-w-7xl mx-auto px-4 py-8", children: children })] }));
}
