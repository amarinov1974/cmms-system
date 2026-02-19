import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * S2 (Technician) Dashboard — Section 14
 * Single list: Urgent (newest first) then Non-Urgent (newest first).
 * Row: Store Name, Address, Urgency, ETA, Category, Short AMM comment.
 * Click → Work Order Detail.
 */
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { workOrdersAPI } from '../../../api/work-orders';
import { useSession } from '../../../contexts/SessionContext';
import { Layout, Card, Badge } from '../../../components/shared';
import { S2WorkOrderDetailModal } from './S2WorkOrderDetailModal';
function shortComment(comment, maxLen = 60) {
    if (comment == null || comment === '')
        return '—';
    return comment.length <= maxLen ? comment : comment.slice(0, maxLen) + '…';
}
function formatEta(eta) {
    if (eta == null)
        return '—';
    return new Date(eta).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
}
export function S2Dashboard() {
    const { session } = useSession();
    const [selectedWOId, setSelectedWOId] = useState(null);
    const { data: workOrders = [], isLoading } = useQuery({
        queryKey: ['work-orders', 's2', session?.userId],
        queryFn: () => workOrdersAPI.list({
            currentOwnerId: session.userId,
            currentOwnerType: 'VENDOR',
        }),
        enabled: session?.userId != null,
    });
    const sorted = useMemo(() => {
        const urgent = workOrders.filter((wo) => wo.urgent === true);
        const nonUrgent = workOrders.filter((wo) => wo.urgent !== true);
        const byNewest = (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        return [...urgent.sort(byNewest), ...nonUrgent.sort(byNewest)];
    }, [workOrders]);
    return (_jsxs(Layout, { screenTitle: "Dashboard", children: [_jsxs("div", { className: "space-y-6", children: [_jsx("p", { className: "text-gray-600", children: "Your assigned work orders. Urgent first, then non-urgent. Open one to check in or complete work." }), isLoading ? (_jsx(Card, { children: _jsx("p", { className: "text-gray-600", children: "Loading work orders..." }) })) : sorted.length === 0 ? (_jsx(Card, { children: _jsx("div", { className: "text-center py-8", children: _jsx("p", { className: "text-gray-600", children: "No work orders assigned to you" }) }) })) : (_jsxs("div", { className: "space-y-6", children: [sorted.filter((wo) => wo.urgent).length > 0 && (_jsxs("section", { children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Urgent Work Orders" }), _jsx("div", { className: "space-y-2", children: sorted
                                            .filter((wo) => wo.urgent)
                                            .map((wo) => (_jsxs(Card, { className: "cursor-pointer hover:shadow-md transition", onClick: () => setSelectedWOId(wo.id), children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-1", children: [_jsx("span", { className: "font-medium text-gray-900", children: wo.storeName ?? 'Store' }), _jsx(Badge, { variant: "danger", children: "Urgent" }), _jsxs("span", { className: "text-sm text-gray-500", children: ["ETA: ", formatEta(wo.eta)] })] }), wo.storeAddress != null && wo.storeAddress !== '' && (_jsx("p", { className: "text-sm text-gray-600 mb-1", children: wo.storeAddress })), _jsxs("p", { className: "text-sm text-gray-600", children: ["Category: ", wo.category ?? '—', " \u2022 AMM: ", shortComment(wo.commentToVendor)] })] }, wo.id))) })] })), _jsxs("section", { children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-2", children: sorted.some((wo) => wo.urgent) ? 'Non-Urgent Work Orders' : 'Work Orders' }), _jsx("div", { className: "space-y-2", children: sorted
                                            .filter((wo) => !wo.urgent)
                                            .map((wo) => (_jsxs(Card, { className: "cursor-pointer hover:shadow-md transition", onClick: () => setSelectedWOId(wo.id), children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-1", children: [_jsx("span", { className: "font-medium text-gray-900", children: wo.storeName ?? 'Store' }), _jsx(Badge, { variant: "secondary", children: "Non-Urgent" }), _jsxs("span", { className: "text-sm text-gray-500", children: ["ETA: ", formatEta(wo.eta)] })] }), wo.storeAddress != null && wo.storeAddress !== '' && (_jsx("p", { className: "text-sm text-gray-600 mb-1", children: wo.storeAddress })), _jsxs("p", { className: "text-sm text-gray-600", children: ["Category: ", wo.category ?? '—', " \u2022 AMM: ", shortComment(wo.commentToVendor)] })] }, wo.id))) })] })] }))] }), selectedWOId != null && (_jsx(S2WorkOrderDetailModal, { workOrderId: selectedWOId, onClose: () => setSelectedWOId(null) }))] }));
}
