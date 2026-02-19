import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Area Manager Ticket Detail Modal
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsAPI } from '../../api/tickets';
import { Button, Badge } from '../../components/shared';
export function AMTicketDetailModal({ ticketId, onClose, }) {
    const queryClient = useQueryClient();
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);
    const { data: ticket, isLoading } = useQuery({
        queryKey: ['ticket', ticketId],
        queryFn: () => ticketsAPI.getById(ticketId),
    });
    const approveMutation = useMutation({
        mutationFn: () => ticketsAPI.approveForEstimation(ticketId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            onClose();
        },
    });
    const rejectMutation = useMutation({
        mutationFn: (reason) => ticketsAPI.reject(ticketId, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            onClose();
        },
    });
    if (isLoading || ticket == null) {
        return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: _jsx("div", { className: "bg-white rounded-lg p-6", children: _jsx("p", { children: "Loading ticket details..." }) }) }));
    }
    const canApprove = ticket.currentStatus === 'Ticket Submitted' ||
        ticket.currentStatus === 'Updated Ticket Submitted';
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto", children: _jsxs("div", { className: "bg-white rounded-lg max-w-4xl w-full my-8", children: [_jsx("div", { className: "p-6 border-b border-gray-200 sticky top-0 bg-white", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsxs("h2", { className: "text-2xl font-bold text-gray-900", children: ["Ticket #", ticket.id] }), _jsx(Badge, { variant: ticket.currentStatus.includes('Approved')
                                                    ? 'success'
                                                    : 'warning', children: ticket.currentStatus })] }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Store: ", ticket.storeName, " \u2022 Created by:", ' ', ticket.createdByUserName] })] }), _jsx("button", { type: "button", onClick: onClose, className: "text-gray-400 hover:text-gray-600 text-2xl", "aria-label": "Close", children: "\u00D7" })] }) }), _jsxs("div", { className: "p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "Ticket Details" }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4 space-y-2", children: [_jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium text-gray-600", children: "Category:" }), ' ', _jsx("span", { className: "text-sm text-gray-900", children: ticket.category })] }), _jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium text-gray-600", children: "Description:" }), _jsx("p", { className: "text-sm text-gray-900 mt-1", children: ticket.description })] }), _jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium text-gray-600", children: "Created:" }), ' ', _jsx("span", { className: "text-sm text-gray-900", children: new Date(ticket.createdAt).toLocaleString() })] })] })] }), canApprove && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4", children: [_jsx("h4", { className: "font-medium text-green-900 mb-2", children: "Approve for Processing" }), _jsx("p", { className: "text-sm text-green-700 mb-3", children: "Approving this ticket will send it to the Area Maintenance Manager for cost estimation and work order creation." }), _jsx(Button, { type: "button", onClick: () => approveMutation.mutate(), disabled: approveMutation.isPending, children: approveMutation.isPending
                                                ? 'Approving...'
                                                : 'Approve Ticket' })] }), _jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: !showRejectForm ? (_jsxs("div", { children: [_jsx("h4", { className: "font-medium text-red-900 mb-2", children: "Reject Ticket" }), _jsx("p", { className: "text-sm text-red-700 mb-3", children: "If this ticket is not appropriate for maintenance processing, you can reject it with a reason." }), _jsx(Button, { type: "button", variant: "danger", onClick: () => setShowRejectForm(true), size: "sm", children: "Reject Ticket" })] })) : (_jsxs("div", { className: "space-y-3", children: [_jsx("h4", { className: "font-medium text-red-900", children: "Reject Ticket" }), _jsx("textarea", { value: rejectReason, onChange: (e) => setRejectReason(e.target.value), placeholder: "Please provide a reason for rejection...", rows: 3, className: "w-full p-3 border border-gray-300 rounded-lg", autoFocus: true }), _jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { type: "button", variant: "danger", onClick: () => rejectMutation.mutate(rejectReason), disabled: !rejectReason.trim() || rejectMutation.isPending, children: rejectMutation.isPending
                                                            ? 'Rejecting...'
                                                            : 'Confirm Rejection' }), _jsx(Button, { type: "button", variant: "secondary", onClick: () => {
                                                            setShowRejectForm(false);
                                                            setRejectReason('');
                                                        }, children: "Cancel" })] })] })) })] })), ticket.comments != null && ticket.comments.length > 0 && (_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-3", children: "Comments" }), _jsx("div", { className: "space-y-3", children: ticket.comments.map((c) => (_jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsx("span", { className: "font-medium text-gray-900", children: c.authorUserName }), _jsx("span", { className: "text-xs text-gray-500", children: new Date(c.createdAt).toLocaleString() })] }), _jsx("p", { className: "text-sm text-gray-700", children: c.text })] }, c.id))) })] })), ticket.auditLog != null && ticket.auditLog.length > 0 && (_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-3", children: "History" }), _jsx("div", { className: "space-y-2", children: ticket.auditLog.map((entry) => (_jsxs("div", { className: "text-sm", children: [_jsx("span", { className: "text-gray-600", children: new Date(entry.createdAt).toLocaleString() }), ' - ', _jsx("span", { className: "font-medium", children: entry.actionType }), entry.prevStatus != null && (_jsxs("span", { className: "text-gray-600", children: [' ', "(", entry.prevStatus, " \u2192 ", entry.newStatus, ")"] })), entry.comment != null && (_jsxs("p", { className: "text-gray-600 ml-4 mt-1", children: ["\"", entry.comment, "\""] }))] }, entry.id))) })] })), approveMutation.isError && (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: _jsxs("p", { className: "text-sm text-red-700", children: ["Error:", ' ', approveMutation.error?.response?.data?.error ??
                                        'Failed to approve ticket'] }) })), rejectMutation.isError && (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: _jsxs("p", { className: "text-sm text-red-700", children: ["Error:", ' ', rejectMutation.error?.response?.data?.error ??
                                        'Failed to reject ticket'] }) }))] }), _jsx("div", { className: "p-6 border-t border-gray-200 sticky bottom-0 bg-white", children: _jsx(Button, { type: "button", variant: "secondary", onClick: onClose, className: "w-full", children: "Close" }) })] }) }));
}
