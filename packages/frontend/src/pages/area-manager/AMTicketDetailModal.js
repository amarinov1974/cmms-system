import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Area Manager Ticket Detail — Section 12
 * Initial review: Approve for Cost Estimation, Request Clarification, Reject.
 * Approval chain: Approve / Return (comment mandatory) / Reject.
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsAPI } from '../../api/tickets';
import { useSession } from '../../contexts/SessionContext';
import { Button, Badge } from '../../components/shared';
const INTERNAL_ROLE_LABELS = {
    SM: 'Store Manager (creator)',
    AM: 'Area Manager',
    AMM: 'Area Maintenance Manager',
    D: 'Sales Director',
    C2: 'Maintenance Director',
    BOD: 'Board of Directors',
};
export function AMTicketDetailModal({ ticketId, onClose, }) {
    const { session } = useSession();
    const queryClient = useQueryClient();
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [clarificationComment, setClarificationComment] = useState('');
    const [assignToRole, setAssignToRole] = useState('SM');
    const [showClarificationForm, setShowClarificationForm] = useState(false);
    const [returnComment, setReturnComment] = useState('');
    const [approveComment, setApproveComment] = useState('');
    const { data: ticket, isLoading } = useQuery({
        queryKey: ['ticket', ticketId],
        queryFn: () => ticketsAPI.getById(ticketId),
    });
    const approveForEstimationMutation = useMutation({
        mutationFn: () => ticketsAPI.approveForEstimation(ticketId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
            onClose();
        },
    });
    const clarifyMutation = useMutation({
        mutationFn: ({ comment, role }) => ticketsAPI.requestClarification(ticketId, comment, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
            setClarificationComment('');
            setShowClarificationForm(false);
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
    const approveCostMutation = useMutation({
        mutationFn: () => ticketsAPI.approveCostEstimation(ticketId, approveComment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
            onClose();
        },
    });
    const returnCostMutation = useMutation({
        mutationFn: () => ticketsAPI.returnCostEstimation(ticketId, returnComment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
            onClose();
        },
    });
    const submitResponseToRequesterMutation = useMutation({
        mutationFn: (comment) => ticketsAPI.submitUpdated(ticketId, undefined, comment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
            onClose();
        },
    });
    if (isLoading || ticket == null) {
        return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: _jsx("div", { className: "bg-white rounded-lg p-6", children: _jsx("p", { children: "Loading ticket details..." }) }) }));
    }
    const isInitialReview = ticket.currentStatus === 'Ticket Submitted' ||
        ticket.currentStatus === 'Updated Ticket Submitted';
    const isApprovalChain = ticket.currentStatus === 'Cost Estimation Approval Needed';
    const isOwner = session?.userId != null && ticket.currentOwnerUserId === session.userId;
    const canInitialReview = isInitialReview && isOwner;
    const canReturnToRequester = ticket.currentStatus === 'Awaiting Ticket Creator Response' &&
        isOwner &&
        ticket.clarificationRequestedByUserId != null;
    const canApprovalChain = isApprovalChain && isOwner && ticket.costEstimation;
    const costAmount = ticket.costEstimation?.estimatedAmount != null
        ? Number(ticket.costEstimation.estimatedAmount)
        : null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto", children: _jsxs("div", { className: "bg-white rounded-lg max-w-4xl w-full my-8", children: [_jsx("div", { className: "p-6 border-b border-gray-200 sticky top-0 bg-white", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold text-gray-900", children: "Ticket Detail" }), _jsxs("div", { className: "flex items-center gap-3 mt-2", children: [_jsxs("span", { className: "text-sm text-gray-600", children: ["Ticket #", ticket.id] }), _jsx(Badge, { variant: ticket.currentStatus.includes('Approved')
                                                    ? 'success'
                                                    : 'warning', children: ticket.currentStatus })] }), _jsxs("p", { className: "text-sm text-gray-500 mt-1", children: ["Store: ", ticket.storeName, " \u2022 Created by: ", ticket.createdByUserName] })] }), _jsx(Button, { type: "button", variant: "secondary", onClick: onClose, children: "Back" })] }) }), _jsxs("div", { className: "p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto", children: [_jsxs("section", { children: [_jsx("h2", { className: "font-semibold text-gray-900 mb-2", children: "Ticket information" }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4 space-y-2", children: [_jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium text-gray-600", children: "Category:" }), ' ', _jsx("span", { className: "text-sm text-gray-900", children: ticket.category })] }), _jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium text-gray-600", children: "Current Owner:" }), ' ', _jsx("span", { className: "text-sm text-gray-900", children: ticket.currentOwnerUserName != null ? `${ticket.currentOwnerUserName}${ticket.currentOwnerUserRole != null ? ` (${ticket.currentOwnerUserRole})` : ''}` : '—' })] }), _jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium text-gray-600", children: "Original Problem Description (locked):" }), _jsx("p", { className: "text-sm text-gray-900 mt-1", children: ticket.originalDescription ?? ticket.description })] }), _jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium text-gray-600", children: "Created:" }), ' ', _jsx("span", { className: "text-sm text-gray-900", children: new Date(ticket.createdAt).toLocaleString() })] })] })] }), canReturnToRequester && (_jsxs("section", { className: "space-y-4", children: [_jsx("h3", { className: "font-semibold text-gray-900", children: "Respond to clarification" }), _jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: [_jsx("p", { className: "text-sm text-blue-900 mb-2", children: ticket.clarificationRequestedByUserName != null || ticket.clarificationRequestedByUserRole != null
                                                ? `${ticket.clarificationRequestedByUserName ?? 'Requester'}${ticket.clarificationRequestedByUserRole != null ? ` (${INTERNAL_ROLE_LABELS[ticket.clarificationRequestedByUserRole] ?? ticket.clarificationRequestedByUserRole})` : ''} requested clarification. You can only return the ticket to them.`
                                                : 'Return the ticket to the role that requested clarification.' }), _jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Optional comment" }), _jsx("textarea", { value: clarificationComment, onChange: (e) => setClarificationComment(e.target.value), placeholder: "Add a comment (optional)...", rows: 3, className: "w-full p-3 border border-gray-300 rounded-lg mb-3" }), _jsx(Button, { type: "button", onClick: () => submitResponseToRequesterMutation.mutate(clarificationComment.trim() || undefined), disabled: submitResponseToRequesterMutation.isPending, children: submitResponseToRequesterMutation.isPending ? 'Sending...' : `Return to ${ticket.clarificationRequestedByUserName ?? 'requester'}` })] })] })), canInitialReview && (_jsxs("section", { className: "space-y-4", children: [_jsx("h3", { className: "font-semibold text-gray-900", children: "Initial review" }), _jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4", children: [_jsx("h4", { className: "font-medium text-green-900 mb-2", children: "Approve for Cost Estimation" }), _jsx("p", { className: "text-sm text-green-700 mb-3", children: "Sends this ticket to the Area Maintenance Manager for cost estimation." }), _jsx(Button, { type: "button", onClick: () => approveForEstimationMutation.mutate(), disabled: approveForEstimationMutation.isPending, children: approveForEstimationMutation.isPending ? 'Approving...' : 'Approve for Cost Estimation' })] }), _jsxs("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4", children: [_jsx("h4", { className: "font-medium text-yellow-900 mb-2", children: "Request clarification" }), _jsx("p", { className: "text-sm text-yellow-800 mb-2", children: "Send the ticket to a role involved in this ticket. After they update it, the ticket will return to you." }), !showClarificationForm ? (_jsx(Button, { type: "button", variant: "secondary", onClick: () => { const options = (ticket.involvedInternalRoles ?? ['SM']).filter((r) => r !== ticket.currentOwnerUserRole); setAssignToRole(options[0] ?? 'SM'); setShowClarificationForm(true); }, children: "Request Ticket Clarification" })) : (_jsxs("div", { className: "space-y-3", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Send clarification request to" }), _jsx("select", { value: assignToRole, onChange: (e) => setAssignToRole(e.target.value), className: "w-full p-2 border border-gray-300 rounded-lg", children: ((ticket.involvedInternalRoles ?? ['SM']).filter((r) => r !== ticket.currentOwnerUserRole)).map((r) => (_jsx("option", { value: r, children: INTERNAL_ROLE_LABELS[r] ?? r }, r))) }), _jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Clarification text (mandatory)" }), _jsx("textarea", { value: clarificationComment, onChange: (e) => setClarificationComment(e.target.value), placeholder: "Explain what needs clarification...", rows: 4, className: "w-full p-3 border border-gray-300 rounded-lg" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { type: "button", onClick: () => clarifyMutation.mutate({ comment: clarificationComment, role: assignToRole }), disabled: !clarificationComment.trim() || clarifyMutation.isPending, children: clarifyMutation.isPending ? 'Sending...' : 'Submit' }), _jsx(Button, { type: "button", variant: "secondary", onClick: () => {
                                                                setShowClarificationForm(false);
                                                                setClarificationComment('');
                                                            }, children: "Cancel" })] })] }))] }), _jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: [_jsx("h4", { className: "font-medium text-red-900 mb-2", children: "Reject ticket" }), !showRejectForm ? (_jsxs(_Fragment, { children: [_jsx("p", { className: "text-sm text-red-700 mb-3", children: "Reject with a reason (terminal state)." }), _jsx(Button, { type: "button", variant: "danger", onClick: () => setShowRejectForm(true), children: "Reject Ticket" })] })) : (_jsxs("div", { className: "space-y-3", children: [_jsx("label", { className: "block text-sm font-medium text-red-900", children: "Reason (mandatory)" }), _jsx("textarea", { value: rejectReason, onChange: (e) => setRejectReason(e.target.value), placeholder: "Reason for rejection...", rows: 3, className: "w-full p-3 border border-gray-300 rounded-lg" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { type: "button", variant: "danger", onClick: () => rejectMutation.mutate(rejectReason), disabled: !rejectReason.trim() || rejectMutation.isPending, children: rejectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection' }), _jsx(Button, { type: "button", variant: "secondary", onClick: () => {
                                                                setShowRejectForm(false);
                                                                setRejectReason('');
                                                            }, children: "Cancel" })] })] }))] })] })), canApprovalChain && costAmount != null && (_jsxs("section", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "Cost estimation approval" }), _jsxs("p", { className: "text-sm text-gray-700 mb-3", children: ["Amount: ", _jsxs("strong", { children: ["\u20AC", costAmount.toLocaleString()] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Comment (optional for Approve)" }), _jsx("textarea", { value: approveComment, onChange: (e) => setApproveComment(e.target.value), placeholder: "Comment for approval...", rows: 2, className: "w-full p-3 border border-gray-300 rounded-lg" })] }), _jsx(Button, { type: "button", onClick: () => approveCostMutation.mutate(), disabled: approveCostMutation.isPending, children: approveCostMutation.isPending ? 'Approving...' : 'Approve' })] }), _jsxs("div", { className: "mt-4 pt-4 border-t border-blue-200 space-y-3", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Return to AMM (comment mandatory)" }), _jsx("textarea", { value: returnComment, onChange: (e) => setReturnComment(e.target.value), placeholder: "Reason for return...", rows: 2, className: "w-full p-3 border border-gray-300 rounded-lg" }), _jsx(Button, { type: "button", variant: "secondary", onClick: () => returnCostMutation.mutate(), disabled: !returnComment.trim() || returnCostMutation.isPending, children: returnCostMutation.isPending ? 'Returning...' : 'Return to AMM' })] }), _jsxs("div", { className: "mt-4 pt-4 border-t border-blue-200", children: [_jsx(Button, { type: "button", variant: "danger", onClick: () => setShowRejectForm(true), children: "Reject" }), showRejectForm && (_jsxs("div", { className: "mt-3 space-y-2", children: [_jsx("textarea", { value: rejectReason, onChange: (e) => setRejectReason(e.target.value), placeholder: "Reason for rejection...", rows: 2, className: "w-full p-3 border border-gray-300 rounded-lg" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { type: "button", variant: "danger", onClick: () => rejectMutation.mutate(rejectReason), disabled: !rejectReason.trim() || rejectMutation.isPending, children: "Confirm Rejection" }), _jsx(Button, { type: "button", variant: "secondary", onClick: () => setShowRejectForm(false), children: "Cancel" })] })] }))] })] })), ticket.comments != null && ticket.comments.length > 0 && (_jsxs("section", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "Comments" }), _jsx("div", { className: "space-y-3", children: [...ticket.comments]
                                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                        .map((c) => (_jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsx("span", { className: "font-medium text-gray-900", children: c.authorUserName }), _jsx("span", { className: "text-xs text-gray-500", children: new Date(c.createdAt).toLocaleString() })] }), _jsx("p", { className: "text-sm text-gray-700", children: c.text })] }, c.id))) })] })), ticket.auditLog != null && ticket.auditLog.length > 0 && (_jsxs("section", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "History" }), _jsx("div", { className: "space-y-2", children: ticket.auditLog.map((entry) => (_jsxs("div", { className: "text-sm bg-gray-50 rounded-lg p-3", children: [_jsx("span", { className: "text-gray-600", children: new Date(entry.createdAt).toLocaleString() }), ' — ', _jsx("span", { className: "font-medium", children: entry.actionType }), entry.prevStatus != null && (_jsxs("span", { className: "text-gray-600", children: [" (", entry.prevStatus, " \u2192 ", entry.newStatus, ")"] })), entry.actorRole != null && (_jsxs("p", { className: "mt-1 text-gray-600", children: ["By ", entry.actorName, " (", entry.actorRole, ")"] })), entry.comment != null && (_jsxs("p", { className: "text-gray-600 mt-1", children: ["\"", entry.comment, "\""] }))] }, entry.id))) })] })), (approveForEstimationMutation.isError ||
                            clarifyMutation.isError ||
                            rejectMutation.isError ||
                            approveCostMutation.isError ||
                            returnCostMutation.isError) && (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: _jsxs("p", { className: "text-sm text-red-700", children: ["Error:", ' ', approveForEstimationMutation.error?.response?.data?.error ??
                                        clarifyMutation.error?.response?.data?.error ??
                                        rejectMutation.error?.response?.data?.error ??
                                        approveCostMutation.error?.response?.data?.error ??
                                        returnCostMutation.error?.response?.data?.error ??
                                        'Action failed'] }) }))] }), _jsx("div", { className: "p-6 border-t border-gray-200 sticky bottom-0 bg-white", children: _jsx(Button, { type: "button", variant: "secondary", onClick: onClose, className: "w-full", children: "Back" }) })] }) }));
}
