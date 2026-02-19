import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
/**
 * Director Dashboard
 * Used by D (Sales Director), C2 (Maintenance Director), and BOD (Board of Directors)
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ticketsAPI } from '../../api/tickets';
import { useSession } from '../../contexts/SessionContext';
import { Layout, Card, Badge, Button } from '../../components/shared';
import { DirectorTicketDetailModal } from './DirectorTicketDetailModal';
import { TicketStatus } from '../../types/statuses';
function getRoleLabel(role) {
    if (role === 'D')
        return 'Sales Director';
    if (role === 'C2')
        return 'Maintenance Director';
    if (role === 'BOD')
        return 'Board of Directors';
    return role;
}
function getStatusBadgeVariant(status) {
    if (status.includes('Approved'))
        return 'success';
    if (status.includes('Rejected') || status.includes('Withdrawn'))
        return 'danger';
    return 'warning';
}
export function DirectorDashboard() {
    const { session } = useSession();
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [ticketReadOnlyFilter, setTicketReadOnlyFilter] = useState('active');
    const { data: tickets, isLoading } = useQuery({
        queryKey: ['tickets', 'director-tickets', session?.userId],
        queryFn: () => ticketsAPI.list({
            currentOwnerUserId: session.userId,
        }),
        enabled: session?.userId != null,
    });
    const { data: participatedTickets = [], isLoading: loadingParticipated } = useQuery({
        queryKey: ['tickets', 'director-participated', session?.userId],
        queryFn: () => ticketsAPI.list({
            participatedByUserId: session.userId,
        }),
        enabled: session?.userId != null,
    });
    const terminalStatuses = [
        TicketStatus.REJECTED,
        TicketStatus.WITHDRAWN,
        TicketStatus.ARCHIVED,
    ];
    const sortByUpdatedAt = (items) => [...items].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    const myActiveTickets = sortByUpdatedAt(participatedTickets.filter((t) => !terminalStatuses.includes(t.currentStatus)));
    const myClosedTickets = sortByUpdatedAt(participatedTickets.filter((t) => terminalStatuses.includes(t.currentStatus)));
    const readOnlyTicketsFiltered = ticketReadOnlyFilter === 'active' ? myActiveTickets : myClosedTickets;
    return (_jsxs(Layout, { children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-bold text-gray-900", children: [getRoleLabel(session?.role ?? ''), " Dashboard"] }), _jsx("p", { className: "text-gray-600", children: "Cost Estimation Approvals" })] }), _jsx(Card, { className: "bg-blue-50 border-blue-200", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "text-blue-600 text-2xl", children: "\uD83D\uDCB0" }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium text-blue-900 mb-1", children: "Your Role in Approval Chain" }), _jsx("p", { className: "text-sm text-blue-700 mb-2", children: "You review cost estimations for maintenance tickets based on approval thresholds:" }), _jsxs("ul", { className: "text-sm text-blue-700 space-y-1 list-disc list-inside", children: [_jsxs("li", { children: [_jsx("strong", { children: "\u2264 \u20AC1,000:" }), " AM only (you won't see these)"] }), _jsxs("li", { children: [_jsx("strong", { children: "\u20AC1,001 - \u20AC3,000:" }), " AM \u2192 D \u2192 C2"] }), _jsxs("li", { children: [_jsx("strong", { children: "> \u20AC3,000:" }), " AM \u2192 D \u2192 C2 \u2192 BOD"] })] })] })] }) }), isLoading ? (_jsx(Card, { children: _jsx("p", { className: "text-gray-600", children: "Loading tickets..." }) })) : tickets != null && tickets.length > 0 ? (_jsxs("div", { className: "space-y-4", children: [_jsxs("p", { className: "text-sm text-gray-600", children: [tickets.length, " ticket(s) awaiting your approval"] }), tickets.map((ticket) => (_jsx(Card, { className: "hover:shadow-md transition cursor-pointer", onClick: () => setSelectedTicketId(ticket.id), children: _jsx("div", { className: "flex justify-between items-start", children: _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900", children: ["Ticket #", ticket.id] }), _jsx(Badge, { variant: "warning", children: "Awaiting Approval" })] }), _jsx("p", { className: "text-gray-700 mb-2", children: ticket.originalDescription ?? ticket.description }), _jsxs("div", { className: "flex gap-4 text-sm text-gray-600 flex-wrap", children: [_jsxs("span", { children: ["Store: ", ticket.storeName] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["Category: ", ticket.category] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["Created by: ", ticket.createdByUserName] })] })] }) }) }, ticket.id)))] })) : (_jsx(Card, { children: _jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "text-4xl mb-4", children: "\u2705" }), _jsx("p", { className: "text-gray-600 text-lg font-medium mb-2", children: "All Caught Up!" }), _jsx("p", { className: "text-sm text-gray-500", children: "No cost estimations awaiting your approval at the moment." })] }) })), _jsxs(Card, { children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-2", children: "My tickets" }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Tickets you participated in (e.g. in the approval chain) but are not currently owning. Read-only." }), _jsxs("div", { className: "flex gap-2 mb-4", children: [_jsxs(Button, { type: "button", variant: ticketReadOnlyFilter === 'active' ? 'primary' : 'secondary', size: "sm", onClick: () => setTicketReadOnlyFilter('active'), children: ["Active tickets (", myActiveTickets.length, ")"] }), _jsxs(Button, { type: "button", variant: ticketReadOnlyFilter === 'closed' ? 'primary' : 'secondary', size: "sm", onClick: () => setTicketReadOnlyFilter('closed'), children: ["Closed tickets (", myClosedTickets.length, ")"] })] }), loadingParticipated ? (_jsx("p", { className: "text-gray-500", children: "Loading..." })) : readOnlyTicketsFiltered.length === 0 ? (_jsx("p", { className: "text-gray-500", children: "No tickets in this group." })) : (_jsx("div", { className: "space-y-2", children: readOnlyTicketsFiltered.map((t) => (_jsx(TicketRow, { ticket: t, onClick: () => setSelectedTicketId(t.id) }, t.id))) }))] })] }), selectedTicketId != null && (_jsx(DirectorTicketDetailModal, { ticketId: selectedTicketId, onClose: () => setSelectedTicketId(null) }))] }));
}
function TicketRow({ ticket, onClick }) {
    return (_jsxs("button", { type: "button", className: "w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition flex flex-wrap items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1", onClick: (e) => {
            e.preventDefault();
            e.stopPropagation();
            onClick();
        }, children: [_jsxs("span", { className: "font-semibold text-gray-900", children: ["Ticket #", ticket.id] }), ticket.urgent && _jsx(Badge, { variant: "urgent", children: "URGENT" }), _jsx(Badge, { variant: getStatusBadgeVariant(ticket.currentStatus), children: ticket.currentStatus }), _jsx("span", { className: "text-sm text-gray-600", children: ticket.storeName }), _jsx("span", { className: "text-sm text-gray-500", children: new Date(ticket.createdAt).toLocaleDateString() })] }));
}
