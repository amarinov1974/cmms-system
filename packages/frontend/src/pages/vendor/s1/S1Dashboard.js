import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * S1 (Service Admin) Dashboard — Section 13
 * New WO Urgent, New WO Non-Urgent, Active WO, Archived WO.
 * Count only; click opens list. List opens WO detail; opening WO records read acknowledgment.
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { workOrdersAPI } from '../../../api/work-orders';
import { useSession } from '../../../contexts/SessionContext';
import { Layout, Card, Button } from '../../../components/shared';
import { WorkOrderStatus } from '../../../types/statuses';
import { S1WorkOrderList } from './S1WorkOrderList';
import { S1WorkOrderDetailModal } from './S1WorkOrderDetailModal';
const ACTIVE_STATUSES = [
    WorkOrderStatus.ACCEPTED_TECHNICIAN_ASSIGNED,
    WorkOrderStatus.SERVICE_IN_PROGRESS,
    WorkOrderStatus.SERVICE_COMPLETED,
    WorkOrderStatus.FOLLOW_UP_REQUESTED,
    WorkOrderStatus.NEW_WO_NEEDED,
    WorkOrderStatus.REPAIR_UNSUCCESSFUL,
    WorkOrderStatus.COST_PROPOSAL_PREPARED,
    WorkOrderStatus.COST_REVISION_REQUESTED,
];
const ARCHIVED_STATUSES = [WorkOrderStatus.COST_PROPOSAL_APPROVED, WorkOrderStatus.CLOSED_WITHOUT_COST, WorkOrderStatus.REJECTED];
export function S1Dashboard() {
    const { session } = useSession();
    const [listMode, setListMode] = useState(null);
    const [selectedWorkOrderId, setSelectedWorkOrderId] = useState(null);
    const { data: workOrders = [], isLoading } = useQuery({
        queryKey: ['work-orders', 's1', session?.companyId],
        queryFn: () => workOrdersAPI.list({
            vendorCompanyId: session.companyId,
        }),
        enabled: session?.companyId != null,
    });
    const isOwner = (wo) => session?.userId != null && wo.currentOwnerId === session.userId;
    const newUrgent = workOrders.filter((wo) => wo.currentStatus === WorkOrderStatus.CREATED && wo.urgent === true && isOwner(wo));
    const newNonUrgent = workOrders.filter((wo) => wo.currentStatus === WorkOrderStatus.CREATED && wo.urgent === false && isOwner(wo));
    const active = workOrders.filter((wo) => ACTIVE_STATUSES.includes(wo.currentStatus));
    const archived = workOrders.filter((wo) => ARCHIVED_STATUSES.includes(wo.currentStatus));
    // WOs from your company where S1 participated but is not the current owner (handed off to S2/S3/AMM or closed)
    const notOwnedByS1 = workOrders.filter((wo) => wo.currentOwnerId !== session?.userId);
    // Active: includes CREATED (e.g. returned to AMM — still "Awaiting Service Provider") + normal active statuses
    const otherActiveStatuses = [WorkOrderStatus.CREATED, ...ACTIVE_STATUSES];
    const otherActive = notOwnedByS1.filter((wo) => otherActiveStatuses.includes(wo.currentStatus));
    const otherClosed = notOwnedByS1.filter((wo) => ARCHIVED_STATUSES.includes(wo.currentStatus));
    const countNewUrgent = newUrgent.length;
    const countNewNonUrgent = newNonUrgent.length;
    const countActive = active.length;
    const countArchived = archived.length;
    const listItems = listMode === 'urgent'
        ? newUrgent
        : listMode === 'non-urgent'
            ? newNonUrgent
            : listMode === 'active'
                ? active
                : listMode === 'archived'
                    ? archived
                    : listMode === 'other-active'
                        ? otherActive
                        : listMode === 'other-closed'
                            ? otherClosed
                            : [];
    return (_jsxs(Layout, { screenTitle: "Dashboard", children: [_jsxs("div", { className: "space-y-6", children: [_jsx(Card, { className: "bg-blue-50 border-blue-200", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "text-blue-600 text-2xl", children: "\uD83D\uDC77" }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium text-blue-900 mb-1", children: "Your Role" }), _jsx("p", { className: "text-sm text-blue-700", children: "Assign technicians to new work orders, set ETA, or return/reject. Active and archived are read-only." })] })] }) }), listMode != null ? (_jsx(S1WorkOrderList, { items: listItems, title: listMode === 'urgent'
                            ? 'New Work Orders — Urgent'
                            : listMode === 'non-urgent'
                                ? 'New Work Orders — Non-Urgent'
                                : listMode === 'active'
                                    ? 'Active Work Orders'
                                    : listMode === 'archived'
                                        ? 'Archived Work Orders'
                                        : listMode === 'other-active'
                                            ? 'Active work orders (you are not owner)'
                                            : 'Closed work orders (you are not owner)', onBack: () => setListMode(null), onSelectWo: (id) => setSelectedWorkOrderId(id) })) : isLoading ? (_jsx(Card, { children: _jsx("p", { className: "text-gray-600", children: "Loading work orders..." }) })) : (_jsxs("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [_jsxs(Card, { className: "bg-amber-50 border-amber-200 cursor-pointer hover:shadow-md transition", onClick: () => setListMode('urgent'), children: [_jsx("h3", { className: "font-medium text-amber-900 mb-1", children: "New Work Orders \u2014 Urgent" }), _jsx("p", { className: "text-3xl font-bold text-amber-700", children: countNewUrgent }), _jsx("p", { className: "text-xs text-amber-600 mt-1", children: "Status: Awaiting Service Provider, Urgent" })] }), _jsxs(Card, { className: "bg-slate-50 border-slate-200 cursor-pointer hover:shadow-md transition", onClick: () => setListMode('non-urgent'), children: [_jsx("h3", { className: "font-medium text-slate-900 mb-1", children: "New Work Orders \u2014 Non-Urgent" }), _jsx("p", { className: "text-3xl font-bold text-slate-700", children: countNewNonUrgent }), _jsx("p", { className: "text-xs text-slate-600 mt-1", children: "Status: Awaiting Service Provider, Non-Urgent" })] }), _jsxs(Card, { className: "bg-green-50 border-green-200 cursor-pointer hover:shadow-md transition", onClick: () => setListMode('active'), children: [_jsx("h3", { className: "font-medium text-green-900 mb-1", children: "Active Work Orders" }), _jsx("p", { className: "text-3xl font-bold text-green-700", children: countActive }), _jsx("p", { className: "text-xs text-green-600 mt-1", children: "Read-only" })] }), _jsxs(Card, { className: "bg-gray-100 border-gray-200 cursor-pointer hover:shadow-md transition", onClick: () => setListMode('archived'), children: [_jsx("h3", { className: "font-medium text-gray-900 mb-1", children: "Archived Work Orders" }), _jsx("p", { className: "text-3xl font-bold text-gray-600", children: countArchived }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Read-only" })] })] })), !isLoading && (_jsxs(Card, { className: "bg-slate-50 border-slate-200", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-2", children: "My work orders" }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Work orders from your company that you participated in but are not currently owning. Read-only." }), _jsxs("div", { className: "flex flex-wrap gap-3", children: [_jsxs(Button, { type: "button", variant: "secondary", onClick: () => setListMode('other-active'), children: ["Active work orders (", otherActive.length, ")"] }), _jsxs(Button, { type: "button", variant: "secondary", onClick: () => setListMode('other-closed'), children: ["Closed work orders (", otherClosed.length, ")"] })] })] }))] }), selectedWorkOrderId != null && (_jsx(S1WorkOrderDetailModal, { workOrderId: selectedWorkOrderId, onClose: () => setSelectedWorkOrderId(null) }))] }));
}
