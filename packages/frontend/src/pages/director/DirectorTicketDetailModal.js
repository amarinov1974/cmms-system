import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Director Ticket Detail Modal
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsAPI } from '../../api/tickets';
import { Button, Badge } from '../../components/shared';
function getThresholdInfo(amount) {
    if (amount <= 1000) {
        return { chain: 'AM only', color: 'text-green-700' };
    }
    if (amount <= 3000) {
        return { chain: 'AM → D → C2', color: 'text-yellow-700' };
    }
    return { chain: 'AM → D → C2 → BOD', color: 'text-red-700' };
}
export function DirectorTicketDetailModal({ ticketId, onClose, }) {
    const queryClient = useQueryClient();
    const [comment, setComment] = useState('');
    const [returnComment, setReturnComment] = useState('');
    const [rejectReason, setRejectReason] = useState('');
    const [showReturnForm, setShowReturnForm] = useState(false);
    const [showRejectForm, setShowRejectForm] = useState(false);
    const { data: ticket, isLoading } = useQuery({
        queryKey: ['ticket', ticketId],
        queryFn: () => ticketsAPI.getById(ticketId),
    });
    const costEstimation = ticket?.costEstimation;
    const approveMutation = useMutation({
        mutationFn: () => ticketsAPI.approveCostEstimation(ticketId, comment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            onClose();
        },
    });
    const returnMutation = useMutation({
        mutationFn: () => ticketsAPI.returnCostEstimation(ticketId, returnComment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            onClose();
        },
    });
    const rejectMutation = useMutation({
        mutationFn: () => ticketsAPI.reject(ticketId, rejectReason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            onClose();
        },
    });
    if (isLoading || ticket == null) {
        return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: _jsx("div", { className: "bg-white rounded-lg p-6", children: _jsx("p", { children: "Loading ticket details..." }) }) }));
    }
    const canApprove = ticket.currentStatus === 'Cost Estimation Approval Needed';
    const amount = costEstimation != null
        ? typeof costEstimation.estimatedAmount === 'number'
            ? costEstimation.estimatedAmount
            : parseFloat(String(costEstimation.estimatedAmount))
        : 0;
    const thresholdInfo = costEstimation ? getThresholdInfo(amount) : null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto", children: _jsxs("div", { className: "bg-white rounded-lg max-w-4xl w-full my-8", children: [_jsx("div", { className: "p-6 border-b border-gray-200 sticky top-0 bg-white", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsxs("h2", { className: "text-2xl font-bold text-gray-900", children: ["Ticket #", ticket.id] }), _jsx(Badge, { variant: "warning", children: "Cost Approval Needed" })] }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Store: ", ticket.storeName, " \u2022 Created by:", ' ', ticket.createdByUserName] })] }), _jsx("button", { type: "button", onClick: onClose, className: "text-gray-400 hover:text-gray-600 text-2xl", "aria-label": "Close", children: "\u00D7" })] }) }), _jsxs("div", { className: "p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "Ticket Details" }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4 space-y-2", children: [_jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium text-gray-600", children: "Category:" }), ' ', _jsx("span", { className: "text-sm text-gray-900", children: ticket.category })] }), _jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium text-gray-600", children: "Description:" }), _jsx("p", { className: "text-sm text-gray-900 mt-1", children: ticket.description })] })] })] }), costEstimation != null && (_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "Cost Estimation" }), _jsxs("div", { className: "bg-blue-50 rounded-lg p-4 border-2 border-blue-200", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium text-gray-600", children: "Estimated Amount:" }), _jsxs("span", { className: "text-3xl font-bold text-blue-900", children: ["\u20AC", amount.toLocaleString()] })] }), thresholdInfo != null && (_jsxs("div", { className: "mt-3 pt-3 border-t border-blue-200", children: [_jsx("span", { className: "text-sm font-medium text-gray-600", children: "Approval Chain:" }), ' ', _jsx("span", { className: `text-sm font-semibold ${thresholdInfo.color}`, children: thresholdInfo.chain })] })), _jsxs("div", { className: "mt-2", children: [_jsx("span", { className: "text-sm font-medium text-gray-600", children: "Submitted by:" }), ' ', _jsx("span", { className: "text-sm text-gray-900", children: costEstimation.createdByUserName })] }), _jsxs("div", { className: "mt-1", children: [_jsx("span", { className: "text-sm font-medium text-gray-600", children: "Submitted:" }), ' ', _jsx("span", { className: "text-sm text-gray-900", children: new Date(costEstimation.createdAt).toLocaleString() })] })] })] })), canApprove && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4", children: [_jsx("h4", { className: "font-medium text-green-900 mb-2", children: "Approve Cost Estimation" }), _jsx("p", { className: "text-sm text-green-700 mb-3", children: "Approving will either escalate to the next approver in the chain or, if you're the final approver, return the ticket to AMM for work order creation." }), _jsx("textarea", { value: comment, onChange: (e) => setComment(e.target.value), placeholder: "Optional comment...", rows: 2, className: "w-full p-3 border border-gray-300 rounded-lg mb-2" }), _jsx(Button, { type: "button", onClick: () => approveMutation.mutate(), disabled: approveMutation.isPending, children: approveMutation.isPending ? 'Approving...' : 'Approve' })] }), _jsx("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4", children: !showReturnForm ? (_jsxs("div", { children: [_jsx("h4", { className: "font-medium text-yellow-900 mb-2", children: "Return to AMM" }), _jsx("p", { className: "text-sm text-yellow-700 mb-3", children: "If the cost estimation needs revision, you can return it to the Area Maintenance Manager for adjustment." }), _jsx(Button, { type: "button", onClick: () => setShowReturnForm(true), size: "sm", variant: "secondary", children: "Return for Revision" })] })) : (_jsxs("div", { className: "space-y-3", children: [_jsx("h4", { className: "font-medium text-yellow-900", children: "Return to AMM for Revision" }), _jsx("textarea", { value: returnComment, onChange: (e) => setReturnComment(e.target.value), placeholder: "Explain what needs to be revised (required)...", rows: 3, className: "w-full p-3 border border-gray-300 rounded-lg", autoFocus: true }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { type: "button", onClick: () => returnMutation.mutate(), disabled: !returnComment.trim() ||
                                                            returnMutation.isPending, size: "sm", children: returnMutation.isPending
                                                            ? 'Returning...'
                                                            : 'Confirm Return' }), _jsx(Button, { type: "button", variant: "secondary", onClick: () => {
                                                            setShowReturnForm(false);
                                                            setReturnComment('');
                                                        }, size: "sm", children: "Cancel" })] })] })) }), _jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: !showRejectForm ? (_jsxs("div", { children: [_jsx("h4", { className: "font-medium text-red-900 mb-2", children: "Reject Ticket" }), _jsx("p", { className: "text-sm text-red-700 mb-3", children: "If this cost estimation is not acceptable, you can reject the entire ticket." }), _jsx(Button, { type: "button", variant: "danger", onClick: () => setShowRejectForm(true), size: "sm", children: "Reject Ticket" })] })) : (_jsxs("div", { className: "space-y-3", children: [_jsx("h4", { className: "font-medium text-red-900", children: "Reject Ticket" }), _jsx("textarea", { value: rejectReason, onChange: (e) => setRejectReason(e.target.value), placeholder: "Reason for rejection (required)...", rows: 3, className: "w-full p-3 border border-gray-300 rounded-lg" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { type: "button", variant: "danger", onClick: () => rejectMutation.mutate(), disabled: !rejectReason.trim() ||
                                                            rejectMutation.isPending, size: "sm", children: rejectMutation.isPending
                                                            ? 'Rejecting...'
                                                            : 'Confirm Rejection' }), _jsx(Button, { type: "button", variant: "secondary", onClick: () => {
                                                            setShowRejectForm(false);
                                                            setRejectReason('');
                                                        }, size: "sm", children: "Cancel" })] })] })) })] })), ticket.approvalRecords != null &&
                            ticket.approvalRecords.length > 0 && (_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-3", children: "Approval History" }), _jsx("div", { className: "space-y-2", children: ticket.approvalRecords.map((approval) => (_jsxs("div", { className: "bg-gray-50 rounded-lg p-3", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("span", { className: "font-medium text-gray-900", children: approval.approverUserName }), _jsxs("span", { className: "text-sm text-gray-600", children: ["(", approval.role, ")"] }), _jsx(Badge, { variant: approval.decision === 'APPROVED'
                                                            ? 'success'
                                                            : approval.decision === 'REJECTED'
                                                                ? 'danger'
                                                                : 'warning', children: approval.decision })] }), approval.comment != null && (_jsx("p", { className: "text-sm text-gray-600 mt-1", children: approval.comment })), _jsx("span", { className: "text-xs text-gray-500", children: new Date(approval.createdAt).toLocaleString() })] }, approval.id))) })] })), ticket.comments != null && ticket.comments.length > 0 && (_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-3", children: "Comments" }), _jsx("div", { className: "space-y-3", children: ticket.comments.map((c) => (_jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsx("span", { className: "font-medium text-gray-900", children: c.authorUserName }), _jsx("span", { className: "text-xs text-gray-500", children: new Date(c.createdAt).toLocaleString() })] }), _jsx("p", { className: "text-sm text-gray-700", children: c.text })] }, c.id))) })] })), approveMutation.isError && (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: _jsxs("p", { className: "text-sm text-red-700", children: ["Error:", ' ', approveMutation.error?.response?.data?.error ??
                                        'Failed to approve'] }) })), returnMutation.isError && (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: _jsxs("p", { className: "text-sm text-red-700", children: ["Error:", ' ', returnMutation.error?.response?.data?.error ??
                                        'Failed to return'] }) })), rejectMutation.isError && (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: _jsxs("p", { className: "text-sm text-red-700", children: ["Error:", ' ', rejectMutation.error?.response?.data?.error ??
                                        'Failed to reject'] }) }))] }), _jsx("div", { className: "p-6 border-t border-gray-200 sticky bottom-0 bg-white", children: _jsx(Button, { type: "button", variant: "secondary", onClick: onClose, className: "w-full", children: "Close" }) })] }) }));
}
