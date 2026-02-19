import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * AMM Dashboard
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ticketsAPI } from '../../api/tickets';
import { useSession } from '../../contexts/SessionContext';
import { Layout, Button, Card, Badge } from '../../components/shared';
import { AMMTicketDetailModal } from './AMMTicketDetailModal';
function getStatusBadgeVariant(status) {
    if (status === 'Draft')
        return 'default';
    if (status.includes('Submitted'))
        return 'warning';
    if (status.includes('Approved'))
        return 'success';
    if (status.includes('Rejected'))
        return 'danger';
    return 'default';
}
export function AMMDashboard() {
    const { session } = useSession();
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [urgentFilter, setUrgentFilter] = useState(undefined);
    const { data: tickets, isLoading } = useQuery({
        queryKey: ['tickets', 'amm-tickets', session?.userId],
        queryFn: () => ticketsAPI.list({
            currentOwnerUserId: session.userId,
        }),
        enabled: session?.userId != null,
    });
    const filteredTickets = tickets?.filter((ticket) => {
        if (urgentFilter !== undefined && ticket.urgent !== urgentFilter) {
            return false;
        }
        if (statusFilter === 'submitted' &&
            ticket.currentStatus !== 'Ticket Submitted') {
            return false;
        }
        if (statusFilter === 'clarification' &&
            !ticket.currentStatus.includes('Awaiting')) {
            return false;
        }
        if (statusFilter === 'cost-needed' &&
            ticket.currentStatus !== 'Cost Estimation Needed') {
            return false;
        }
        if (statusFilter === 'approved' &&
            ticket.currentStatus !== 'Ticket Cost Estimation Approved') {
            return false;
        }
        return true;
    });
    return (_jsxs(Layout, { children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "AMM Dashboard" }), _jsx("p", { className: "text-gray-600", children: session?.regionName ?? 'Area Maintenance Manager' })] }), _jsx(Card, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Status Filter" }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Button, { type: "button", size: "sm", variant: statusFilter === 'all' ? 'primary' : 'secondary', onClick: () => setStatusFilter('all'), children: "All Tickets" }), _jsx(Button, { type: "button", size: "sm", variant: statusFilter === 'submitted' ? 'primary' : 'secondary', onClick: () => setStatusFilter('submitted'), children: "Submitted" }), _jsx(Button, { type: "button", size: "sm", variant: statusFilter === 'clarification' ? 'primary' : 'secondary', onClick: () => setStatusFilter('clarification'), children: "Awaiting Response" }), _jsx(Button, { type: "button", size: "sm", variant: statusFilter === 'cost-needed' ? 'primary' : 'secondary', onClick: () => setStatusFilter('cost-needed'), children: "Cost Estimation Needed" }), _jsx(Button, { type: "button", size: "sm", variant: statusFilter === 'approved' ? 'primary' : 'secondary', onClick: () => setStatusFilter('approved'), children: "Approved" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Urgency Filter" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { type: "button", size: "sm", variant: urgentFilter === undefined ? 'primary' : 'secondary', onClick: () => setUrgentFilter(undefined), children: "All" }), _jsx(Button, { type: "button", size: "sm", variant: urgentFilter === true ? 'primary' : 'secondary', onClick: () => setUrgentFilter(true), children: "Urgent Only" }), _jsx(Button, { type: "button", size: "sm", variant: urgentFilter === false ? 'primary' : 'secondary', onClick: () => setUrgentFilter(false), children: "Non-Urgent" })] })] })] }) }), isLoading ? (_jsx(Card, { children: _jsx("p", { className: "text-gray-600", children: "Loading tickets..." }) })) : filteredTickets != null && filteredTickets.length > 0 ? (_jsxs("div", { className: "space-y-4", children: [_jsxs("p", { className: "text-sm text-gray-600", children: ["Showing ", filteredTickets.length, " ticket(s)"] }), filteredTickets.map((ticket) => (_jsx(Card, { className: "hover:shadow-md transition cursor-pointer", onClick: () => setSelectedTicketId(ticket.id), children: _jsx("div", { className: "flex justify-between items-start", children: _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900", children: ["Ticket #", ticket.id] }), ticket.urgent && (_jsx(Badge, { variant: "urgent", children: "URGENT" })), _jsx(Badge, { variant: getStatusBadgeVariant(ticket.currentStatus), children: ticket.currentStatus })] }), _jsx("p", { className: "text-gray-700 mb-2", children: ticket.description }), _jsxs("div", { className: "flex gap-4 text-sm text-gray-600 flex-wrap", children: [_jsxs("span", { children: ["Store: ", ticket.storeName] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["Category: ", ticket.category] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["Created by: ", ticket.createdByUserName] }), _jsx("span", { children: "\u2022" }), _jsx("span", { children: new Date(ticket.createdAt).toLocaleDateString() })] })] }) }) }, ticket.id)))] })) : (_jsx(Card, { children: _jsx("div", { className: "text-center py-8", children: _jsx("p", { className: "text-gray-600", children: "No tickets match your filters" }) }) }))] }), selectedTicketId != null && (_jsx(AMMTicketDetailModal, { ticketId: selectedTicketId, onClose: () => setSelectedTicketId(null) }))] }));
}
