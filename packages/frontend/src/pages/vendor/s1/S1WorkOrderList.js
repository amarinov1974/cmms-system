import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Card, Badge, Button } from '../../../components/shared';
function shortComment(comment, maxLen = 60) {
    if (comment == null || comment === '')
        return '—';
    return comment.length <= maxLen ? comment : comment.slice(0, maxLen) + '…';
}
function formatEta(eta) {
    if (eta == null)
        return '—';
    const d = new Date(eta);
    return d.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
}
export function S1WorkOrderList({ items, title, onBack, onSelectWo, }) {
    return (_jsxs(Card, { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900", children: title }), _jsx(Button, { type: "button", variant: "secondary", onClick: onBack, children: "Back" })] }), items.length === 0 ? (_jsx("p", { className: "text-gray-600", children: "No work orders in this group." })) : (_jsx("div", { className: "space-y-2", children: items.map((wo) => (_jsxs("div", { className: "p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition", onClick: () => onSelectWo(wo.id), role: "button", tabIndex: 0, onKeyDown: (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onSelectWo(wo.id);
                        }
                    }, children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-1", children: [_jsx("span", { className: "font-medium text-gray-900", children: wo.storeName ?? 'Store' }), _jsx(Badge, { variant: wo.urgent ? 'danger' : 'secondary', children: wo.urgent ? 'Urgent' : 'Non-Urgent' }), _jsxs("span", { className: "text-sm text-gray-500", children: ["ETA: ", formatEta(wo.eta)] })] }), wo.storeAddress != null && wo.storeAddress !== '' && (_jsx("p", { className: "text-sm text-gray-600 mb-1", children: wo.storeAddress })), _jsxs("div", { className: "flex flex-wrap gap-2 text-sm text-gray-600", children: [_jsxs("span", { children: ["Category: ", wo.category ?? '—'] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["AMM comment: ", shortComment(wo.commentToVendor)] }), _jsx("span", { children: "\u2022" }), _jsx("span", { className: "font-medium", children: wo.currentStatus }), wo.assignedTechnicianName != null && wo.assignedTechnicianName !== '' && (_jsxs(_Fragment, { children: [_jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["Owner: ", _jsx("strong", { children: wo.assignedTechnicianName })] })] }))] })] }, wo.id))) }))] }));
}
