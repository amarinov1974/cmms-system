import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Store Manager Dashboard
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ticketsAPI } from '../../api/tickets';
import { useSession } from '../../contexts/SessionContext';
import { Layout, Button, Card, Badge } from '../../components/shared';
import { CreateTicketModal } from './CreateTicketModal';
import { TicketDetailModal } from './TicketDetailModal';
function getStatusBadgeVariant(status) {
    if (status === 'Draft')
        return 'default';
    if (status.includes('Submitted'))
        return 'warning';
    if (status.includes('Approved'))
        return 'success';
    if (status.includes('Rejected') || status.includes('Withdrawn'))
        return 'danger';
    return 'default';
}
export function StoreManagerDashboard() {
    const { session } = useSession();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const { data: tickets, isLoading } = useQuery({
        queryKey: ['tickets', 'my-tickets', session?.storeId],
        queryFn: () => ticketsAPI.list(session?.storeId != null ? { storeId: session.storeId } : undefined),
        enabled: session?.storeId != null,
    });
    return (_jsxs(Layout, { children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "My Tickets" }), _jsx("p", { className: "text-gray-600", children: session?.storeName ?? 'Store Manager Dashboard' })] }), _jsx(Button, { type: "button", onClick: () => setShowCreateModal(true), children: "+ Create New Ticket" })] }), isLoading ? (_jsx(Card, { children: _jsx("p", { className: "text-gray-600", children: "Loading tickets..." }) })) : tickets != null && tickets.length > 0 ? (_jsx("div", { className: "space-y-4", children: tickets.map((ticket) => (_jsx(Card, { className: "hover:shadow-md transition cursor-pointer", onClick: () => setSelectedTicketId(ticket.id), children: _jsx("div", { className: "flex justify-between items-start", children: _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900", children: ["Ticket #", ticket.id] }), ticket.urgent && (_jsx(Badge, { variant: "urgent", children: "URGENT" })), _jsx(Badge, { variant: getStatusBadgeVariant(ticket.currentStatus), children: ticket.currentStatus })] }), _jsx("p", { className: "text-gray-700 mb-2", children: ticket.description }), _jsxs("div", { className: "flex gap-4 text-sm text-gray-600", children: [_jsxs("span", { children: ["Category: ", ticket.category] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["Created:", ' ', new Date(ticket.createdAt).toLocaleDateString()] }), ticket.currentOwnerUserName != null && (_jsxs(_Fragment, { children: [_jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["Owner: ", ticket.currentOwnerUserName] })] }))] })] }) }) }, ticket.id))) })) : (_jsx(Card, { children: _jsxs("div", { className: "text-center py-8", children: [_jsx("p", { className: "text-gray-600 mb-4", children: "No tickets yet" }), _jsx(Button, { type: "button", onClick: () => setShowCreateModal(true), children: "Create Your First Ticket" })] }) }))] }), showCreateModal && (_jsx(CreateTicketModal, { onClose: () => setShowCreateModal(false) })), selectedTicketId != null && (_jsx(TicketDetailModal, { ticketId: selectedTicketId, onClose: () => setSelectedTicketId(null) }))] }));
}
