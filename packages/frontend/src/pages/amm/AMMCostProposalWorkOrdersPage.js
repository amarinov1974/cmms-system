import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * AMM Work Orders Awaiting Cost Proposal Review — list (newest first) with preview.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { workOrdersAPI } from '../../api/work-orders';
import { useSession } from '../../contexts/SessionContext';
import { Layout, Button, Badge } from '../../components/shared';
import { AMMWorkOrderDetailModal } from './AMMWorkOrderDetailModal';
import { WorkOrderStatus } from '../../types/statuses';
function getStatusBadgeVariant(status) {
    if (status.includes('Approved'))
        return 'success';
    if (status.includes('Rejected') || status.includes('Withdrawn'))
        return 'danger';
    return 'warning';
}
export function AMMCostProposalWorkOrdersPage() {
    const { session } = useSession();
    const [selectedWorkOrderId, setSelectedWorkOrderId] = useState(null);
    const { data: ownedWorkOrders = [], isLoading } = useQuery({
        queryKey: ['work-orders', 'amm-owned', session?.userId],
        queryFn: () => workOrdersAPI.list({
            currentOwnerId: session.userId,
            currentOwnerType: 'INTERNAL',
        }),
        enabled: session?.userId != null,
    });
    const costProposalWOs = ownedWorkOrders
        .filter((wo) => wo.currentStatus === WorkOrderStatus.COST_PROPOSAL_PREPARED)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return (_jsxs(Layout, { screenTitle: "Work Orders Awaiting Cost Proposal Review", children: [_jsxs("div", { className: "max-w-4xl mx-auto space-y-4", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Work Orders Awaiting Cost Proposal Review" }), _jsx("p", { className: "text-sm text-gray-600 mt-0.5", children: "Approve / Request Revision / Close Without Cost \u2014 newest first" })] }), _jsx(Link, { to: "/amm", children: _jsx(Button, { type: "button", variant: "secondary", children: "Back to dashboard" }) })] }), isLoading ? (_jsx("p", { className: "text-gray-500", children: "Loading\u2026" })) : costProposalWOs.length === 0 ? (_jsx("div", { className: "rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-gray-600", children: "No work orders awaiting cost proposal review." })) : (_jsx("ul", { className: "space-y-2", children: costProposalWOs.map((wo) => (_jsx("li", { children: _jsx(WorkOrderPreviewRow, { workOrder: wo, onOpen: () => setSelectedWorkOrderId(wo.id) }) }, wo.id))) }))] }), selectedWorkOrderId != null && (_jsx(AMMWorkOrderDetailModal, { workOrderId: selectedWorkOrderId, onClose: () => setSelectedWorkOrderId(null) }))] }));
}
function WorkOrderPreviewRow({ workOrder, onOpen, }) {
    return (_jsx("button", { type: "button", className: "w-full text-left p-4 rounded-lg border border-gray-200 hover:bg-emerald-50/50 hover:border-emerald-200 cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1", onClick: (e) => {
            e.preventDefault();
            e.stopPropagation();
            onOpen();
        }, children: _jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsxs("span", { className: "font-semibold text-gray-900", children: ["Work Order #", workOrder.id] }), _jsxs("span", { className: "text-sm text-gray-600", children: ["Ticket #", workOrder.ticketId] }), _jsx(Badge, { variant: getStatusBadgeVariant(workOrder.currentStatus), children: workOrder.currentStatus }), _jsx("span", { className: "text-sm text-gray-600", children: workOrder.vendorCompanyName }), workOrder.storeName && (_jsx("span", { className: "text-sm text-gray-600", children: workOrder.storeName })), _jsx("span", { className: "text-sm text-gray-500", children: new Date(workOrder.updatedAt).toLocaleDateString() })] }) }));
}
