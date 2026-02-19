import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * AMM Tickets Awaiting Cost Estimation — list (newest first) with preview.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ticketsAPI } from '../../api/tickets';
import { useSession } from '../../contexts/SessionContext';
import { Layout, Button, Badge } from '../../components/shared';
import { AMMTicketDetailModal } from './AMMTicketDetailModal';
import { TicketStatus } from '../../types/statuses';
const DESCRIPTION_PREVIEW_LENGTH = 120;
function descriptionPreview(description) {
    const trimmed = description.trim();
    if (trimmed.length <= DESCRIPTION_PREVIEW_LENGTH)
        return trimmed;
    return trimmed.slice(0, DESCRIPTION_PREVIEW_LENGTH).trim() + '…';
}
function getStatusBadgeVariant(status) {
    if (status.includes('Approved'))
        return 'success';
    if (status.includes('Rejected') || status.includes('Withdrawn'))
        return 'danger';
    return 'warning';
}
export function AMMCostEstimationTicketsPage() {
    const { session } = useSession();
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const { data: ownedTickets = [], isLoading } = useQuery({
        queryKey: ['tickets', 'amm-owned', session?.userId],
        queryFn: () => ticketsAPI.list({ currentOwnerUserId: session.userId }),
        enabled: session?.userId != null,
    });
    // Only non-urgent: urgent tickets in Cost Estimation Needed appear under Urgent Tickets
    const costEstimationTickets = ownedTickets
        .filter((t) => t.currentStatus === TicketStatus.COST_ESTIMATION_NEEDED && !t.urgent)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return (_jsxs(Layout, { screenTitle: "Tickets Awaiting Cost Estimation", children: [_jsxs("div", { className: "max-w-4xl mx-auto space-y-4", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Tickets Awaiting Cost Estimation" }), _jsx("p", { className: "text-sm text-gray-600 mt-0.5", children: "Non-urgent tickets in Cost Estimation Needed, owned by you \u2014 newest first" })] }), _jsx(Link, { to: "/amm", children: _jsx(Button, { type: "button", variant: "secondary", children: "Back to dashboard" }) })] }), isLoading ? (_jsx("p", { className: "text-gray-500", children: "Loading\u2026" })) : costEstimationTickets.length === 0 ? (_jsx("div", { className: "rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-gray-600", children: "No tickets awaiting cost estimation." })) : (_jsx("ul", { className: "space-y-2", children: costEstimationTickets.map((ticket) => (_jsx("li", { children: _jsx(TicketPreviewRow, { ticket: ticket, onOpen: () => setSelectedTicketId(ticket.id) }) }, ticket.id))) }))] }), selectedTicketId != null && (_jsx(AMMTicketDetailModal, { ticketId: selectedTicketId, onClose: () => setSelectedTicketId(null) }))] }));
}
function TicketPreviewRow({ ticket, onOpen }) {
    return (_jsxs("button", { type: "button", className: "w-full text-left p-4 rounded-lg border border-gray-200 hover:bg-blue-50/50 hover:border-blue-200 cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1", onClick: (e) => {
            e.preventDefault();
            e.stopPropagation();
            onOpen();
        }, children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-2", children: [_jsxs("span", { className: "font-semibold text-gray-900", children: ["Ticket #", ticket.id] }), ticket.urgent && _jsx(Badge, { variant: "urgent", children: "URGENT" }), _jsx(Badge, { variant: getStatusBadgeVariant(ticket.currentStatus), children: ticket.currentStatus }), _jsx("span", { className: "text-sm text-gray-600", children: ticket.storeName }), _jsx("span", { className: "text-sm text-gray-500", children: new Date(ticket.createdAt).toLocaleDateString() })] }), _jsx("p", { className: "text-sm text-gray-700 whitespace-pre-wrap line-clamp-2", children: descriptionPreview(ticket.originalDescription ?? ticket.description) })] }));
}
