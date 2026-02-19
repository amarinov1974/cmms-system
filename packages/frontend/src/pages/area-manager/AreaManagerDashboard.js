import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Area Manager Dashboard
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ticketsAPI } from '../../api/tickets';
import { useSession } from '../../contexts/SessionContext';
import { Layout, Card, Badge } from '../../components/shared';
import { AMTicketDetailModal } from './AMTicketDetailModal';
function getStatusBadgeVariant(status) {
    if (status.includes('Submitted'))
        return 'warning';
    if (status.includes('Approved'))
        return 'success';
    if (status.includes('Rejected'))
        return 'danger';
    return 'default';
}
export function AreaManagerDashboard() {
    const { session } = useSession();
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const { data: tickets, isLoading } = useQuery({
        queryKey: ['tickets', 'am-tickets', session?.userId],
        queryFn: () => ticketsAPI.list({
            currentOwnerUserId: session.userId,
            urgent: false,
        }),
        enabled: session?.userId != null,
    });
    return (_jsxs(Layout, { children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Area Manager Dashboard" }), _jsx("p", { className: "text-gray-600", children: session?.regionName ?? 'Regional Approval' })] }), _jsx(Card, { className: "bg-blue-50 border-blue-200", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "text-blue-600 text-2xl", children: "\u2139\uFE0F" }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium text-blue-900 mb-1", children: "Your Role" }), _jsx("p", { className: "text-sm text-blue-700", children: "You approve non-urgent tickets before they proceed to cost estimation. Review each ticket and either approve for processing or reject if not applicable." })] })] }) }), isLoading ? (_jsx(Card, { children: _jsx("p", { className: "text-gray-600", children: "Loading tickets..." }) })) : tickets != null && tickets.length > 0 ? (_jsxs("div", { className: "space-y-4", children: [_jsxs("p", { className: "text-sm text-gray-600", children: [tickets.length, " ticket(s) awaiting approval"] }), tickets.map((ticket) => (_jsx(Card, { className: "hover:shadow-md transition cursor-pointer", onClick: () => setSelectedTicketId(ticket.id), children: _jsx("div", { className: "flex justify-between items-start", children: _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900", children: ["Ticket #", ticket.id] }), _jsx(Badge, { variant: getStatusBadgeVariant(ticket.currentStatus), children: ticket.currentStatus })] }), _jsx("p", { className: "text-gray-700 mb-2", children: ticket.description }), _jsxs("div", { className: "flex gap-4 text-sm text-gray-600 flex-wrap", children: [_jsxs("span", { children: ["Store: ", ticket.storeName] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["Category: ", ticket.category] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["Created by: ", ticket.createdByUserName] }), _jsx("span", { children: "\u2022" }), _jsx("span", { children: new Date(ticket.createdAt).toLocaleDateString() })] })] }) }) }, ticket.id)))] })) : (_jsx(Card, { children: _jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "text-4xl mb-4", children: "\u2705" }), _jsx("p", { className: "text-gray-600 text-lg font-medium mb-2", children: "All Caught Up!" }), _jsx("p", { className: "text-sm text-gray-500", children: "No tickets awaiting your approval at the moment." })] }) }))] }), selectedTicketId != null && (_jsx(AMTicketDetailModal, { ticketId: selectedTicketId, onClose: () => setSelectedTicketId(null) }))] }));
}
