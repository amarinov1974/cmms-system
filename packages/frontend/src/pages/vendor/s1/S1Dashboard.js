import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * S1 (Service Admin) Dashboard
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { workOrdersAPI } from '../../../api/work-orders';
import { useSession } from '../../../contexts/SessionContext';
import { Layout, Card, Badge } from '../../../components/shared';
import { AssignTechnicianModal } from './AssignTechnicianModal';
export function S1Dashboard() {
    const { session } = useSession();
    const [selectedWorkOrderId, setSelectedWorkOrderId] = useState(null);
    const { data: workOrders, isLoading } = useQuery({
        queryKey: ['work-orders', 's1', session?.companyId],
        queryFn: () => workOrdersAPI.list({
            vendorCompanyId: session.companyId,
        }),
        enabled: session?.companyId != null,
    });
    const createdWOs = workOrders?.filter((wo) => wo.currentStatus === 'Work Order Created');
    return (_jsxs(Layout, { children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Service Admin Dashboard" }), _jsx("p", { className: "text-gray-600", children: session?.companyName ?? 'Vendor Company' })] }), _jsx(Card, { className: "bg-blue-50 border-blue-200", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "text-blue-600 text-2xl", children: "\uD83D\uDC77" }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium text-blue-900 mb-1", children: "Your Role" }), _jsx("p", { className: "text-sm text-blue-700", children: "Assign technicians to new work orders and set estimated arrival times." })] })] }) }), isLoading ? (_jsx(Card, { children: _jsx("p", { className: "text-gray-600", children: "Loading work orders..." }) })) : createdWOs != null && createdWOs.length > 0 ? (_jsxs("div", { className: "space-y-4", children: [_jsxs("p", { className: "text-sm text-gray-600", children: [createdWOs.length, " work order(s) awaiting assignment"] }), createdWOs.map((wo) => (_jsx(Card, { className: "hover:shadow-md transition cursor-pointer", onClick: () => setSelectedWorkOrderId(wo.id), children: _jsx("div", { className: "flex justify-between items-start", children: _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900", children: ["Work Order #", wo.id] }), _jsx(Badge, { variant: "warning", children: "Created" })] }), _jsxs("div", { className: "flex gap-4 text-sm text-gray-600 flex-wrap", children: [_jsxs("span", { children: ["Ticket: #", wo.ticketId] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["Created:", ' ', new Date(wo.createdAt).toLocaleDateString()] })] })] }) }) }, wo.id)))] })) : (_jsx(Card, { children: _jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "text-4xl mb-4", children: "\u2705" }), _jsx("p", { className: "text-gray-600", children: "All work orders assigned!" })] }) }))] }), selectedWorkOrderId != null && (_jsx(AssignTechnicianModal, { workOrderId: selectedWorkOrderId, onClose: () => setSelectedWorkOrderId(null) }))] }));
}
