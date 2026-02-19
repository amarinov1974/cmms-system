import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Layout Component
 * Header: screen title (optional), user name, role, company, store/region, logout, back (optional)
 */
import { Link } from 'react-router-dom';
import { useSession } from '../../contexts/SessionContext';
export function Layout({ children, screenTitle, backLink, backLabel = 'Back', }) {
    const { session, logout } = useSession();
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("header", { className: "bg-white shadow-sm border-b border-gray-200", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 py-4 flex justify-between items-center flex-wrap gap-2", children: [_jsxs("div", { children: [screenTitle != null ? (_jsx("h1", { className: "text-xl font-bold text-gray-900", children: screenTitle })) : (_jsx("h1", { className: "text-xl font-bold text-gray-900", children: "CMMS System" })), session != null && (_jsxs("p", { className: "text-sm text-gray-600", children: [session.userName, " \u2022 ", session.role === 'S1' ? 'Service Admin' : session.role === 'S2' ? 'Technician' : session.role === 'S3' ? 'Finance / Backoffice' : session.role === 'AMM' ? 'Area Maintenance Manager' : session.role, session.companyName != null ? ` • ${session.companyName}` : '', session.servicedCompanyName != null ? ` • Serviced: ${session.servicedCompanyName}` : '', session.storeName != null ? ` • Store: ${session.storeName}` : '', session.regionName != null ? ` • Region: ${session.regionName}` : ''] }))] }), _jsxs("div", { className: "flex items-center gap-2", children: [backLink != null && (_jsx(Link, { to: backLink, className: "px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition", children: backLabel })), _jsx("button", { type: "button", onClick: logout, className: "px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition", children: "Logout" })] })] }) }), _jsx("main", { className: "max-w-7xl mx-auto px-4 py-8", children: children })] }));
}
