import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Ticket Detail Modal
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsAPI } from '../../api/tickets';
import { Button, Badge } from '../../components/shared';
export function TicketDetailModal({ ticketId, onClose, }) {
    const queryClient = useQueryClient();
    const [comment, setComment] = useState('');
    const [updatedDescription, setUpdatedDescription] = useState('');
    const [withdrawReason, setWithdrawReason] = useState('');
    const [showWithdrawForm, setShowWithdrawForm] = useState(false);
    const { data: ticket, isLoading } = useQuery({
        queryKey: ['ticket', ticketId],
        queryFn: () => ticketsAPI.getById(ticketId),
    });
    const submitMutation = useMutation({
        mutationFn: () => ticketsAPI.submit(ticketId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
        },
    });
    const submitUpdatedMutation = useMutation({
        mutationFn: () => ticketsAPI.submitUpdated(ticketId, updatedDescription, comment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
            setComment('');
            setUpdatedDescription('');
        },
    });
    const withdrawMutation = useMutation({
        mutationFn: () => ticketsAPI.withdraw(ticketId, withdrawReason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            onClose();
        },
    });
    const addCommentMutation = useMutation({
        mutationFn: () => ticketsAPI.addComment(ticketId, comment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
            setComment('');
        },
    });
    if (isLoading) {
        return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: _jsx("div", { className: "bg-white rounded-lg p-6", children: _jsx("p", { children: "Loading ticket details..." }) }) }));
    }
    if (ticket == null) {
        return null;
    }
    const canSubmit = ticket.currentStatus === 'Draft';
    const canSubmitUpdated = ticket.currentStatus === 'Awaiting Ticket Creator Response';
    const canWithdraw = ticket.currentStatus === 'Awaiting Ticket Creator Response';
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: _jsxs("div", { className: "bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto", children: [_jsx("div", { className: "p-6 border-b border-gray-200 sticky top-0 bg-white", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsxs("h2", { className: "text-2xl font-bold text-gray-900", children: ["Ticket #", ticket.id] }), ticket.urgent && _jsx(Badge, { variant: "urgent", children: "URGENT" }), _jsx(Badge, { variant: ticket.currentStatus.includes('Approved')
                                                    ? 'success'
                                                    : 'warning', children: ticket.currentStatus })] }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Created ", new Date(ticket.createdAt).toLocaleString()] })] }), _jsx("button", { type: "button", onClick: onClose, className: "text-gray-400 hover:text-gray-600 text-2xl", "aria-label": "Close", children: "\u00D7" })] }) }), _jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "Details" }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4 space-y-2", children: [_jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium text-gray-600", children: "Category:" }), ' ', _jsx("span", { className: "text-sm text-gray-900", children: ticket.category })] }), _jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium text-gray-600", children: "Description:" }), ' ', _jsx("p", { className: "text-sm text-gray-900 mt-1", children: ticket.description })] }), _jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium text-gray-600", children: "Current Owner:" }), ' ', _jsx("span", { className: "text-sm text-gray-900", children: ticket.currentOwnerUserName ?? 'System' })] })] })] }), canSubmit && (_jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: [_jsx("p", { className: "text-sm text-blue-800 mb-3", children: "This ticket is in Draft status. Submit it to send for processing." }), _jsx(Button, { type: "button", onClick: () => submitMutation.mutate(), disabled: submitMutation.isPending, children: submitMutation.isPending ? 'Submitting...' : 'Submit Ticket' })] })), canSubmitUpdated && (_jsxs("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3", children: [_jsx("p", { className: "text-sm text-yellow-800", children: "The AMM has requested clarification. Please update the description and resubmit." }), _jsx("textarea", { value: updatedDescription, onChange: (e) => setUpdatedDescription(e.target.value), placeholder: "Updated description (optional - leave empty to keep original)", rows: 3, className: "w-full p-3 border border-gray-300 rounded-lg" }), _jsx("textarea", { value: comment, onChange: (e) => setComment(e.target.value), placeholder: "Comment explaining changes (optional)", rows: 2, className: "w-full p-3 border border-gray-300 rounded-lg" }), _jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { type: "button", onClick: () => submitUpdatedMutation.mutate(), disabled: submitUpdatedMutation.isPending, children: submitUpdatedMutation.isPending
                                                ? 'Submitting...'
                                                : 'Resubmit Ticket' }), !showWithdrawForm && (_jsx(Button, { type: "button", variant: "danger", onClick: () => setShowWithdrawForm(true), children: "Withdraw Ticket" }))] }), showWithdrawForm && (_jsxs("div", { className: "mt-4 space-y-3 border-t border-yellow-300 pt-4", children: [_jsx("p", { className: "text-sm text-red-700 font-medium", children: "Withdraw this ticket?" }), _jsx("textarea", { value: withdrawReason, onChange: (e) => setWithdrawReason(e.target.value), placeholder: "Reason for withdrawal (optional)", rows: 2, className: "w-full p-3 border border-gray-300 rounded-lg" }), _jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { type: "button", variant: "danger", onClick: () => withdrawMutation.mutate(), disabled: withdrawMutation.isPending, children: withdrawMutation.isPending
                                                        ? 'Withdrawing...'
                                                        : 'Confirm Withdrawal' }), _jsx(Button, { type: "button", variant: "secondary", onClick: () => setShowWithdrawForm(false), children: "Cancel" })] })] }))] })), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-3", children: "Comments" }), ticket.comments != null && ticket.comments.length > 0 ? (_jsx("div", { className: "space-y-3", children: ticket.comments.map((c) => (_jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsx("span", { className: "font-medium text-gray-900", children: c.authorUserName }), _jsx("span", { className: "text-xs text-gray-500", children: new Date(c.createdAt).toLocaleString() })] }), _jsx("p", { className: "text-sm text-gray-700", children: c.text })] }, c.id))) })) : (_jsx("p", { className: "text-sm text-gray-600", children: "No comments yet" })), _jsxs("div", { className: "mt-4", children: [_jsx("textarea", { value: comment, onChange: (e) => setComment(e.target.value), placeholder: "Add a comment...", rows: 3, className: "w-full p-3 border border-gray-300 rounded-lg" }), _jsx(Button, { type: "button", onClick: () => addCommentMutation.mutate(), disabled: !comment.trim() || addCommentMutation.isPending, className: "mt-2", children: addCommentMutation.isPending ? 'Adding...' : 'Add Comment' })] })] }), ticket.auditLog != null && ticket.auditLog.length > 0 && (_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-3", children: "History" }), _jsx("div", { className: "space-y-2", children: ticket.auditLog.map((entry) => (_jsxs("div", { className: "text-sm", children: [_jsx("span", { className: "text-gray-600", children: new Date(entry.createdAt).toLocaleString() }), ' - ', _jsx("span", { className: "font-medium", children: entry.actionType }), entry.prevStatus != null && (_jsxs("span", { className: "text-gray-600", children: [' ', "(", entry.prevStatus, " \u2192 ", entry.newStatus, ")"] })), entry.comment != null && (_jsxs("p", { className: "text-gray-600 ml-4 mt-1", children: ["\"", entry.comment, "\""] }))] }, entry.id))) })] }))] }), _jsx("div", { className: "p-6 border-t border-gray-200 sticky bottom-0 bg-white", children: _jsx(Button, { type: "button", variant: "secondary", onClick: onClose, className: "w-full", children: "Close" }) })] }) }));
}
