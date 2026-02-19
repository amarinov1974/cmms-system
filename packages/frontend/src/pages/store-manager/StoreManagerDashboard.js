import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Store Manager Dashboard
 * Sections: 1 Create Ticket, 2 Ticket Drafts, 3 Action Required, 4 QR Generation Required, 5 My Tickets
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ticketsAPI } from '../../api/tickets';
import { workOrdersAPI } from '../../api/work-orders';
import { useSession } from '../../contexts/SessionContext';
import { Layout, Button, Card, Badge } from '../../components/shared';
import { TicketDetailModal } from './TicketDetailModal';
import { TicketStatus } from '../../types/statuses';
function getStatusBadgeVariant(status) {
    if (status === 'Draft')
        return 'default';
    if (status.includes('Submitted') || status.includes('Awaiting'))
        return 'warning';
    if (status.includes('Approved'))
        return 'success';
    if (status.includes('Rejected') || status.includes('Withdrawn'))
        return 'danger';
    return 'default';
}
export function StoreManagerDashboard() {
    const { session } = useSession();
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const { data: myTickets, isLoading: loadingMyTickets } = useQuery({
        queryKey: ['tickets', 'store-manager', 'my-tickets', session?.storeId],
        queryFn: () => ticketsAPI.list(session?.storeId != null ? { storeId: session.storeId } : undefined),
        enabled: session?.storeId != null,
    });
    const { data: draftTickets = [] } = useQuery({
        queryKey: [
            'tickets',
            'store-manager',
            'drafts',
            session?.storeId,
            session?.userId,
        ],
        queryFn: () => ticketsAPI.list({
            storeId: session.storeId,
            currentOwnerUserId: session.userId,
            status: TicketStatus.DRAFT,
        }),
        enabled: session?.storeId != null &&
            session?.userId != null,
    });
    const { data: actionRequiredTickets } = useQuery({
        queryKey: [
            'tickets',
            'store-manager',
            'action-required',
            session?.storeId,
            session?.userId,
        ],
        queryFn: () => ticketsAPI.list({
            storeId: session.storeId,
            currentOwnerUserId: session.userId,
            status: TicketStatus.AWAITING_CREATOR_RESPONSE,
        }),
        enabled: session?.storeId != null &&
            session?.userId != null,
        refetchOnWindowFocus: true, // so tickets returned for clarification (any round) show up promptly
    });
    // Include WOs with vendor (S2) and WOs returned to SM for correct tech count
    const { data: qrWorkOrdersAccepted } = useQuery({
        queryKey: [
            'work-orders',
            'store-manager',
            'qr-accepted',
            session?.storeId,
        ],
        queryFn: () => workOrdersAPI.list({
            storeId: session.storeId,
            currentStatus: 'ACCEPTED_TECHNICIAN_ASSIGNED',
        }),
        enabled: session?.storeId != null,
    });
    const { data: qrWorkOrdersInProgress } = useQuery({
        queryKey: [
            'work-orders',
            'store-manager',
            'qr-in-progress',
            session?.storeId,
        ],
        queryFn: () => workOrdersAPI.list({
            storeId: session.storeId,
            currentStatus: 'SERVICE_IN_PROGRESS',
        }),
        enabled: session?.storeId != null,
    });
    const { data: qrWorkOrdersFollowUp = [] } = useQuery({
        queryKey: [
            'work-orders',
            'store-manager',
            'qr-follow-up',
            session?.storeId,
        ],
        queryFn: () => workOrdersAPI.list({
            storeId: session.storeId,
            currentStatus: 'FOLLOW_UP_REQUESTED',
        }),
        enabled: session?.storeId != null,
    });
    const qrWorkOrders = [
        ...(qrWorkOrdersAccepted ?? []),
        ...(qrWorkOrdersInProgress ?? []),
        ...qrWorkOrdersFollowUp,
    ];
    const actionRequiredCount = actionRequiredTickets?.length ?? 0;
    const qrTicketsMap = (() => {
        const map = new Map();
        if (!qrWorkOrders)
            return map;
        for (const wo of qrWorkOrders) {
            const list = map.get(wo.ticketId) ?? [];
            list.push(wo);
            map.set(wo.ticketId, list);
        }
        return map;
    })();
    const qrTicketIds = Array.from(qrTicketsMap.keys());
    const [myTicketsFilter, setMyTicketsFilter] = useState('active');
    const terminalStatuses = [
        'Ticket Withdrawn',
        'Ticket Rejected',
        'Ticket Archived',
    ];
    const isActionRequired = (t) => t.currentOwnerUserId === session?.userId &&
        t.currentStatus === TicketStatus.AWAITING_CREATOR_RESPONSE;
    const { data: participatedTickets = [], isLoading: loadingParticipated } = useQuery({
        queryKey: ['tickets', 'store-manager', 'participated', session?.storeId, session?.userId],
        queryFn: () => ticketsAPI.list({
            storeId: session.storeId,
            participatedByUserId: session.userId,
        }),
        enabled: session?.storeId != null && session?.userId != null,
    });
    const closedTickets = (myTickets ?? []).filter((t) => terminalStatuses.includes(t.currentStatus));
    const myTicketsFiltered = myTicketsFilter === 'active'
        ? participatedTickets.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        : closedTickets.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return (_jsxs(Layout, { children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Store Manager Dashboard" }), _jsx("p", { className: "text-gray-600", children: session?.storeName ?? 'Store' })] }), _jsx(Card, { className: "bg-slate-50 border-slate-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Create Ticket" }), _jsx("p", { className: "text-sm text-gray-600", children: "Submit a new maintenance request for your store." })] }), _jsx(Link, { to: "/store-manager/submit", children: _jsx(Button, { type: "button", children: "Submit New Ticket" }) })] }) }), _jsxs(Card, { className: "bg-gray-50 border-gray-200", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Ticket Drafts" }), _jsx("p", { className: "text-sm text-gray-600 mb-3", children: "Tickets you saved as draft \u2014 open to continue editing and submit when ready." }), draftTickets.length === 0 ? (_jsx("p", { className: "text-sm text-gray-500", children: "No drafts." })) : (_jsx("ul", { className: "space-y-2", children: draftTickets
                                    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                                    .map((ticket) => (_jsx("li", { children: _jsxs("button", { type: "button", onClick: () => setSelectedTicketId(ticket.id), className: "w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-1", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsxs("span", { className: "font-medium text-gray-900", children: ["Ticket #", ticket.id] }), _jsx(Badge, { variant: "default", children: "Draft" }), ticket.urgent && (_jsx(Badge, { variant: "urgent", children: "URGENT" })), _jsx("span", { className: "text-sm text-gray-500", children: new Date(ticket.updatedAt).toLocaleString() })] }), ticket.description?.trim() && (_jsx("p", { className: "text-sm text-gray-600 mt-1 line-clamp-2", children: ticket.description.trim() }))] }) }, ticket.id))) }))] }), actionRequiredCount > 0 ? (_jsx(Link, { to: "/store-manager/action-required", children: _jsx(Card, { className: "bg-amber-50 border-amber-200 cursor-pointer hover:shadow-md transition block", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Action Required" }), _jsx("p", { className: "text-sm text-gray-600", children: "Tickets returned for your clarification (newest first)." })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Badge, { variant: "warning", children: actionRequiredCount }), _jsx("span", { className: "text-sm text-gray-500", children: "Click to open list" })] })] }) }) })) : (_jsx(Card, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Action Required" }), _jsx("p", { className: "text-sm text-gray-600", children: "Tickets returned for your clarification (newest first)." })] }), _jsx(Badge, { variant: "warning", children: "0" })] }) })), _jsxs(Card, { className: "bg-emerald-50 border-emerald-200", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-2", children: "QR Generation Required" }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Work orders with technician assigned or follow-up visit needed \u2014 generate QR for check-in or check-out." }), qrTicketIds.length === 0 ? (_jsx("p", { className: "text-sm text-gray-500", children: "No tickets requiring QR right now." })) : (_jsx(Link, { to: "/store-manager/qr-required", children: _jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg border border-emerald-200 bg-white hover:bg-emerald-50/50 cursor-pointer transition", children: [_jsxs("span", { className: "font-medium text-gray-900", children: [qrTicketIds.length, " ticket", qrTicketIds.length !== 1 ? 's' : '', " requiring QR"] }), _jsx("span", { className: "text-sm text-emerald-700", children: "Click to open list \u2192" })] }) }))] }), _jsxs(Card, { children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4 mb-4", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "My Tickets" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { type: "button", variant: myTicketsFilter === 'active' ? 'primary' : 'secondary', onClick: () => setMyTicketsFilter('active'), children: "Active tickets" }), _jsx(Button, { type: "button", variant: myTicketsFilter === 'closed' ? 'primary' : 'secondary', onClick: () => setMyTicketsFilter('closed'), children: "Closed tickets" })] })] }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: myTicketsFilter === 'active'
                                    ? 'Tickets you participated in (not current owner).'
                                    : 'Tickets that finished their life (rejected, withdrawn, archived).' }), (myTicketsFilter === 'closed' && loadingMyTickets) || (myTicketsFilter === 'active' && loadingParticipated) ? (_jsx("p", { className: "text-gray-600", children: "Loading..." })) : myTicketsFiltered.length === 0 ? (_jsx("p", { className: "text-gray-500", children: "No tickets to show." })) : (_jsx("div", { className: "space-y-3", children: myTicketsFiltered.map((ticket) => (_jsxs("div", { className: "p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition", onClick: () => setSelectedTicketId(ticket.id), children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-1", children: [_jsxs("span", { className: "font-semibold text-gray-900", children: ["Ticket #", ticket.id] }), _jsx(Badge, { variant: getStatusBadgeVariant(ticket.currentStatus), children: ticket.currentStatus }), ticket.urgent && (_jsx(Badge, { variant: "urgent", children: "URGENT" })), _jsx("span", { className: "text-sm text-gray-600", children: ticket.category }), _jsxs("span", { className: "text-sm text-gray-500", children: ["Last updated", ' ', new Date(ticket.updatedAt).toLocaleDateString()] })] }), _jsx("p", { className: "text-sm text-gray-700 line-clamp-2", children: (() => {
                                                const text = ticket.originalDescription ?? ticket.description;
                                                return text.length > 100 ? `${text.slice(0, 100).trim()}...` : text;
                                            })() })] }, ticket.id))) }))] })] }), selectedTicketId != null && (_jsx(TicketDetailModal, { ticketId: selectedTicketId, onClose: () => setSelectedTicketId(null) }))] }));
}
