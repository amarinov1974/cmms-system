import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * S3 (Finance/Backoffice) Dashboard
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { workOrdersAPI } from '../../../api/work-orders';
import { useSession } from '../../../contexts/SessionContext';
import { Layout, Card, Badge } from '../../../components/shared';
import { CreateCostProposalModal } from './CreateCostProposalModal';
export function S3Dashboard() {
    const { session } = useSession();
    const [selectedWOId, setSelectedWOId] = useState(null);
    const { data: workOrders, isLoading } = useQuery({
        queryKey: ['work-orders', 's3', session?.userId],
        queryFn: () => workOrdersAPI.list({
            currentOwnerId: session.userId,
        }),
        enabled: session?.userId != null,
    });
    return (_jsxs(Layout, { children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Finance Dashboard" }), _jsx("p", { className: "text-gray-600", children: "Cost Proposal Preparation" })] }), _jsx(Card, { className: "bg-blue-50 border-blue-200", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "text-blue-600 text-2xl", children: "\uD83D\uDCB0" }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium text-blue-900 mb-1", children: "Your Role" }), _jsx("p", { className: "text-sm text-blue-700", children: "Create detailed cost proposals for completed work orders, including labor and materials." })] })] }) }), isLoading ? (_jsx(Card, { children: _jsx("p", { className: "text-gray-600", children: "Loading work orders..." }) })) : workOrders != null && workOrders.length > 0 ? (_jsxs("div", { className: "space-y-4", children: [_jsxs("p", { className: "text-sm text-gray-600", children: [workOrders.length, " work order(s) awaiting cost proposal"] }), workOrders.map((wo) => (_jsx(Card, { className: "hover:shadow-md transition cursor-pointer", onClick: () => setSelectedWOId(wo.id), children: _jsx("div", { className: "flex justify-between items-start", children: _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900", children: ["Work Order #", wo.id] }), _jsx(Badge, { variant: "success", children: "Completed" })] }), _jsxs("div", { className: "flex gap-4 text-sm text-gray-600 flex-wrap", children: [_jsxs("span", { children: ["Ticket: #", wo.ticketId] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["Technician: ", wo.assignedTechnicianName ?? 'N/A'] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["Completed:", ' ', wo.checkoutTs != null
                                                                ? new Date(wo.checkoutTs).toLocaleDateString()
                                                                : 'N/A'] })] })] }) }) }, wo.id)))] })) : (_jsx(Card, { children: _jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "text-4xl mb-4", children: "\u2705" }), _jsx("p", { className: "text-gray-600", children: "No work orders awaiting cost proposal" })] }) }))] }), selectedWOId != null && (_jsx(CreateCostProposalModal, { workOrderId: selectedWOId, onClose: () => setSelectedWOId(null) }))] }));
}
