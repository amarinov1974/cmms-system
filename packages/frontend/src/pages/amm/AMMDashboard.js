import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * AMM Dashboard — Section 10
 * Action-group based: Create Ticket, Ticket action groups, WO action groups, Read-only.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ticketsAPI } from '../../api/tickets';
import { workOrdersAPI } from '../../api/work-orders';
import { useSession } from '../../contexts/SessionContext';
import { Layout, Button, Card, Badge } from '../../components/shared';
import { AMMTicketDetailModal } from './AMMTicketDetailModal';
import { AMMWorkOrderDetailModal } from './AMMWorkOrderDetailModal';
import { TicketStatus, WorkOrderStatus, TerminalWorkOrderStatuses } from '../../types/statuses';
function getStatusBadgeVariant(status) {
    if (status.includes('Approved'))
        return 'success';
    if (status.includes('Rejected') || status.includes('Withdrawn'))
        return 'danger';
    return 'warning';
}
export function AMMDashboard() {
    const { session } = useSession();
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [selectedWorkOrderId, setSelectedWorkOrderId] = useState(null);
    const [ticketReadOnlyFilter, setTicketReadOnlyFilter] = useState('active');
    const [woReadOnlyFilter, setWoReadOnlyFilter] = useState('active');
    const { data: ownedTickets = [], isLoading: loadingTickets } = useQuery({
        queryKey: ['tickets', 'amm-owned', session?.userId],
        queryFn: () => ticketsAPI.list({ currentOwnerUserId: session.userId }),
        enabled: session?.userId != null,
    });
    const { data: ownedWorkOrders = [], isLoading: loadingWOs } = useQuery({
        queryKey: ['work-orders', 'amm-owned', session?.userId],
        queryFn: () => workOrdersAPI.list({
            currentOwnerId: session.userId,
            currentOwnerType: 'INTERNAL',
        }),
        enabled: session?.userId != null,
    });
    // Urgent tickets: submitted, updated (after clarification), or back from SM in Cost Estimation Needed — all show in Urgent Tickets, not in Cost Estimation
    const openUrgentTickets = ownedTickets.filter((t) => t.urgent &&
        (t.currentStatus === TicketStatus.SUBMITTED ||
            t.currentStatus === TicketStatus.UPDATED_SUBMITTED ||
            t.currentStatus === TicketStatus.COST_ESTIMATION_NEEDED));
    const costEstimationNeededTickets = ownedTickets.filter((t) => t.currentStatus === TicketStatus.COST_ESTIMATION_NEEDED && !t.urgent);
    const approvedCostTickets = ownedTickets.filter((t) => t.currentStatus === TicketStatus.COST_ESTIMATION_APPROVED);
    const workInProgressTickets = ownedTickets.filter((t) => t.currentStatus === TicketStatus.WORK_ORDER_IN_PROGRESS);
    // WOs returned or rejected by S1 to AMM: owner is AMM (INTERNAL), status Awaiting Service Provider or Rejected
    const returnedWorkOrders = ownedWorkOrders.filter((wo) => wo.currentStatus === WorkOrderStatus.CREATED ||
        wo.currentStatus === WorkOrderStatus.REJECTED);
    const costProposalPreparedWOs = ownedWorkOrders.filter((wo) => wo.currentStatus === WorkOrderStatus.COST_PROPOSAL_PREPARED);
    const followUpExceptionWOs = ownedWorkOrders.filter((wo) => [
        WorkOrderStatus.FOLLOW_UP_REQUESTED,
        WorkOrderStatus.REPAIR_UNSUCCESSFUL,
        WorkOrderStatus.NEW_WO_NEEDED,
    ].includes(wo.currentStatus));
    const { data: regionTickets = [], isLoading: loadingRegionTickets } = useQuery({
        queryKey: ['tickets', 'amm-region', session?.regionId],
        queryFn: () => ticketsAPI.list({ regionId: session.regionId }),
        enabled: session?.regionId != null,
    });
    const { data: participatedTickets = [], isLoading: loadingParticipatedTickets } = useQuery({
        queryKey: ['tickets', 'amm-participated', session?.regionId, session?.userId],
        queryFn: () => ticketsAPI.list({
            regionId: session.regionId,
            participatedByUserId: session.userId,
        }),
        enabled: session?.regionId != null && session?.userId != null,
    });
    const terminalStatuses = [
        TicketStatus.REJECTED,
        TicketStatus.WITHDRAWN,
        TicketStatus.ARCHIVED,
    ];
    const closedTickets = regionTickets.filter((t) => terminalStatuses.includes(t.currentStatus));
    const sortByUpdatedAt = (items) => [...items].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    const myActiveTickets = sortByUpdatedAt(participatedTickets);
    const myClosedTickets = sortByUpdatedAt(closedTickets);
    const readOnlyTicketsFiltered = ticketReadOnlyFilter === 'active' ? myActiveTickets : myClosedTickets;
    const { data: regionWOs = [], isLoading: loadingRegionWOs } = useQuery({
        queryKey: ['work-orders', 'amm-region', session?.regionId],
        queryFn: () => workOrdersAPI.list({ regionId: session.regionId }),
        enabled: session?.regionId != null,
    });
    const { data: workOrdersWithVendor = [] } = useQuery({
        queryKey: ['work-orders', 'amm-region-vendor', session?.regionId],
        queryFn: () => workOrdersAPI.list({
            regionId: session.regionId,
            currentOwnerType: 'VENDOR',
        }),
        enabled: session?.regionId != null,
    });
    const sortNewestFirst = (items) => [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const myActiveWOs = regionWOs.filter((wo) => !TerminalWorkOrderStatuses.includes(wo.currentStatus));
    const myClosedWOs = regionWOs.filter((wo) => TerminalWorkOrderStatuses.includes(wo.currentStatus));
    const readOnlyWOsFiltered = woReadOnlyFilter === 'active'
        ? sortNewestFirst(myActiveWOs)
        : sortNewestFirst(myClosedWOs);
    return (_jsxs(Layout, { screenTitle: "Dashboard", children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Area Maintenance Manager" }), _jsx("p", { className: "text-gray-600", children: session?.regionName ?? 'Dashboard' })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2", children: "Tickets" }), _jsx(Card, { className: "bg-slate-50 border-slate-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Create Ticket" }), _jsx("p", { className: "text-sm text-gray-600", children: "Create a ticket for any store in your region." })] }), _jsx(Link, { to: "/amm/submit", children: _jsx(Button, { type: "button", children: "Submit New Ticket" }) })] }) }), _jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [openUrgentTickets.length > 0 ? (_jsx(Link, { to: "/amm/urgent-tickets", children: _jsxs(Card, { className: "cursor-pointer hover:shadow-md transition border-amber-200 bg-amber-50/50 block", onClick: undefined, children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Urgent Tickets" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Badge, { variant: "warning", children: openUrgentTickets.length }), _jsx("span", { className: "text-sm text-gray-500", children: "Click to open list" })] })] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Submitted, updated (after clarification), or awaiting cost estimation \u2014 urgent, owned by you" })] }) })) : (_jsxs(Card, { className: "border-amber-200 bg-amber-50/50 opacity-90", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Urgent Tickets" }), _jsx(Badge, { variant: "warning", children: "0" })] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Submitted, updated (after clarification), or awaiting cost estimation \u2014 urgent, owned by you" })] })), costEstimationNeededTickets.length > 0 ? (_jsx(Link, { to: "/amm/cost-estimation-tickets", children: _jsxs(Card, { className: "cursor-pointer hover:shadow-md transition border-blue-200 bg-blue-50/50 block", onClick: undefined, children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Tickets Awaiting Cost Estimation" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Badge, { variant: "warning", children: costEstimationNeededTickets.length }), _jsx("span", { className: "text-sm text-gray-500", children: "Click to open list" })] })] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Non-urgent tickets in Cost Estimation Needed, owned by you" })] }) })) : (_jsxs(Card, { className: "border-blue-200 bg-blue-50/50 opacity-90", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Tickets Awaiting Cost Estimation" }), _jsx(Badge, { variant: "warning", children: "0" })] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Non-urgent tickets in Cost Estimation Needed, owned by you" })] })), approvedCostTickets.length > 0 ? (_jsx(Link, { to: "/amm/approved-cost-tickets", children: _jsxs(Card, { className: "cursor-pointer hover:shadow-md transition border-green-200 bg-green-50/50 block", onClick: undefined, children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Tickets with Approved Cost" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Badge, { variant: "success", children: approvedCostTickets.length }), _jsx("span", { className: "text-sm text-gray-500", children: "Click to open list" })] })] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Cost estimation approved \u2014 create first work order or archive" })] }) })) : (_jsxs(Card, { className: "border-green-200 bg-green-50/50 opacity-90", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Tickets with Approved Cost" }), _jsx(Badge, { variant: "success", children: "0" })] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Cost estimation approved \u2014 create first work order or archive" })] })), workInProgressTickets.length > 0 ? (_jsx(Link, { to: "/amm/work-in-progress-tickets", children: _jsxs(Card, { className: "cursor-pointer hover:shadow-md transition border-teal-200 bg-teal-50/50 block", onClick: undefined, children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Tickets \u2014 Work in Progress" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Badge, { variant: "default", children: workInProgressTickets.length }), _jsx("span", { className: "text-sm text-gray-500", children: "Click to open list" })] })] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Work order(s) sent \u2014 create extra work orders or archive when all done" })] }) })) : (_jsxs(Card, { className: "border-teal-200 bg-teal-50/50 opacity-90", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Tickets \u2014 Work in Progress" }), _jsx(Badge, { variant: "default", children: "0" })] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Work order(s) sent \u2014 create extra work orders or archive when all done" })] }))] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2", children: "Work Orders" }), _jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [returnedWorkOrders.length > 0 ? (_jsx(Link, { to: "/amm/returned-work-orders", children: _jsxs(Card, { className: "cursor-pointer hover:shadow-md transition border-rose-200 bg-rose-50/50 block", onClick: undefined, children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Work orders \u2014 returned" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Badge, { variant: "warning", children: returnedWorkOrders.length }), _jsx("span", { className: "text-sm text-gray-500", children: "Click to open list" })] })] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Returned or rejected by service provider (S1) \u2014 review and resend or close" })] }) })) : (_jsxs(Card, { className: "border-rose-200 bg-rose-50/50 opacity-90", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Work orders \u2014 returned" }), _jsx(Badge, { variant: "warning", children: "0" })] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Returned or rejected by service provider (S1) \u2014 review and resend or close" })] })), workOrdersWithVendor.length > 0 ? (_jsx(Link, { to: "/amm/work-orders-with-vendor", children: _jsxs(Card, { className: "cursor-pointer hover:shadow-md transition border-sky-200 bg-sky-50/50 block", onClick: undefined, children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Work orders sent to vendors" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Badge, { variant: "default", children: workOrdersWithVendor.length }), _jsx("span", { className: "text-sm text-gray-500", children: "Click to open list" })] })] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "View status and details" })] }) })) : (_jsxs(Card, { className: "border-sky-200 bg-sky-50/50 opacity-90", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Work orders sent to vendors" }), _jsx(Badge, { variant: "default", children: "0" })] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "View status and details" })] })), costProposalPreparedWOs.length > 0 ? (_jsx(Link, { to: "/amm/cost-proposal-work-orders", children: _jsxs(Card, { className: "cursor-pointer hover:shadow-md transition border-emerald-200 bg-emerald-50/50 block", onClick: undefined, children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Work Orders Awaiting Cost Proposal Review" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Badge, { variant: "warning", children: costProposalPreparedWOs.length }), _jsx("span", { className: "text-sm text-gray-500", children: "Click to open list" })] })] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Approve / Request Revision / Close Without Cost" })] }) })) : (_jsxs(Card, { className: "border-emerald-200 bg-emerald-50/50 opacity-90", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Work Orders Awaiting Cost Proposal Review" }), _jsx(Badge, { variant: "warning", children: "0" })] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Approve / Request Revision / Close Without Cost" })] })), followUpExceptionWOs.length > 0 ? (_jsx(Link, { to: "/amm/follow-up-work-orders", children: _jsxs(Card, { className: "cursor-pointer hover:shadow-md transition border-orange-200 bg-orange-50/50 block", onClick: undefined, children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Follow-Up / Exception Work Orders" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Badge, { variant: "warning", children: followUpExceptionWOs.length }), _jsx("span", { className: "text-sm text-gray-500", children: "Click to open list" })] })] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Follow-Up Requested, Repair Unsuccessful, or New WO Needed" })] }) })) : (_jsxs(Card, { className: "border-orange-200 bg-orange-50/50 opacity-90", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Follow-Up / Exception Work Orders" }), _jsx(Badge, { variant: "warning", children: "0" })] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Follow-Up Requested, Repair Unsuccessful, or New WO Needed" })] }))] })] }), _jsxs(Card, { children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-2", children: "My tickets" }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Tickets in your region you participated in (active) or that are closed." }), _jsxs("div", { className: "flex gap-2 mb-4", children: [_jsxs(Button, { type: "button", variant: ticketReadOnlyFilter === 'active' ? 'primary' : 'secondary', size: "sm", onClick: () => setTicketReadOnlyFilter('active'), children: ["Active tickets (", myActiveTickets.length, ")"] }), _jsxs(Button, { type: "button", variant: ticketReadOnlyFilter === 'closed' ? 'primary' : 'secondary', size: "sm", onClick: () => setTicketReadOnlyFilter('closed'), children: ["Closed tickets (", myClosedTickets.length, ")"] })] }), (ticketReadOnlyFilter === 'active' && loadingParticipatedTickets) ||
                                (ticketReadOnlyFilter === 'closed' && loadingRegionTickets) ? (_jsx("p", { className: "text-gray-500", children: "Loading..." })) : readOnlyTicketsFiltered.length === 0 ? (_jsx("p", { className: "text-gray-500", children: "No tickets in this group." })) : (_jsx("div", { className: "space-y-2", children: readOnlyTicketsFiltered.map((t) => (_jsx(TicketRow, { ticket: t, onClick: () => setSelectedTicketId(t.id) }, t.id))) }))] }), _jsxs(Card, { children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-2", children: "My work orders" }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Work orders in your region \u2014 active (in progress) or closed." }), _jsxs("div", { className: "flex gap-2 mb-4", children: [_jsxs(Button, { type: "button", variant: woReadOnlyFilter === 'active' ? 'primary' : 'secondary', size: "sm", onClick: () => setWoReadOnlyFilter('active'), children: ["Active work orders (", myActiveWOs.length, ")"] }), _jsxs(Button, { type: "button", variant: woReadOnlyFilter === 'closed' ? 'primary' : 'secondary', size: "sm", onClick: () => setWoReadOnlyFilter('closed'), children: ["Closed work orders (", myClosedWOs.length, ")"] })] }), loadingRegionWOs ? (_jsx("p", { className: "text-gray-500", children: "Loading..." })) : readOnlyWOsFiltered.length === 0 ? (_jsx("p", { className: "text-gray-500", children: "No work orders in this group." })) : (_jsx("div", { className: "space-y-2", children: readOnlyWOsFiltered.map((wo) => (_jsx(WorkOrderRow, { workOrder: wo, onSelect: () => setSelectedWorkOrderId(wo.id) }, wo.id))) }))] })] }), selectedTicketId != null && (_jsx(AMMTicketDetailModal, { ticketId: selectedTicketId, onClose: () => setSelectedTicketId(null) })), selectedWorkOrderId != null && (_jsx(AMMWorkOrderDetailModal, { workOrderId: selectedWorkOrderId, onClose: () => setSelectedWorkOrderId(null) }))] }));
}
function TicketRow({ ticket, onClick }) {
    return (_jsxs("button", { type: "button", className: "w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition flex flex-wrap items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1", onClick: (e) => {
            e.preventDefault();
            e.stopPropagation();
            onClick();
        }, children: [_jsxs("span", { className: "font-semibold text-gray-900", children: ["Ticket #", ticket.id] }), ticket.urgent && _jsx(Badge, { variant: "urgent", children: "URGENT" }), _jsx(Badge, { variant: getStatusBadgeVariant(ticket.currentStatus), children: ticket.currentStatus }), _jsx("span", { className: "text-sm text-gray-600", children: ticket.storeName }), _jsx("span", { className: "text-sm text-gray-500", children: new Date(ticket.createdAt).toLocaleDateString() })] }));
}
function WorkOrderRow({ workOrder, onSelect }) {
    return (_jsxs("button", { type: "button", className: "w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition flex flex-wrap items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1", onClick: (e) => {
            e.preventDefault();
            e.stopPropagation();
            onSelect();
        }, children: [_jsxs("span", { className: "font-semibold text-gray-900", children: ["Work Order #", workOrder.id] }), _jsxs("span", { className: "text-sm text-gray-600", children: ["Ticket #", workOrder.ticketId] }), _jsx(Badge, { variant: getStatusBadgeVariant(workOrder.currentStatus), children: workOrder.currentStatus }), _jsx("span", { className: "text-sm text-gray-600", children: workOrder.vendorCompanyName }), _jsx("span", { className: "text-sm text-gray-500", children: new Date(workOrder.updatedAt).toLocaleDateString() })] }));
}
