import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * AMM Ticket Detail Modal
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsAPI } from '../../api/tickets';
import { workOrdersAPI } from '../../api/work-orders';
import { Button, Badge } from '../../components/shared';
export function AMMTicketDetailModal({ ticketId, onClose, }) {
    const queryClient = useQueryClient();
    const [clarificationComment, setClarificationComment] = useState('');
    const [rejectReason, setRejectReason] = useState('');
    const [costAmount, setCostAmount] = useState('');
    const [selectedVendorId, setSelectedVendorId] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [showCostForm, setShowCostForm] = useState(false);
    const [showWorkOrderForm, setShowWorkOrderForm] = useState(false);
    const { data: ticket, isLoading } = useQuery({
        queryKey: ['ticket', ticketId],
        queryFn: () => ticketsAPI.getById(ticketId),
    });
    const clarifyMutation = useMutation({
        mutationFn: (comment) => ticketsAPI.requestClarification(ticketId, comment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
            setClarificationComment('');
        },
    });
    const rejectMutation = useMutation({
        mutationFn: (reason) => ticketsAPI.reject(ticketId, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            onClose();
        },
    });
    const submitCostMutation = useMutation({
        mutationFn: (estimatedAmount) => ticketsAPI.submitCostEstimation(ticketId, estimatedAmount),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
            setCostAmount('');
            setShowCostForm(false);
        },
    });
    const createWOMutation = useMutation({
        mutationFn: workOrdersAPI.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
            setShowWorkOrderForm(false);
        },
    });
    const archiveMutation = useMutation({
        mutationFn: () => ticketsAPI.archive(ticketId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            onClose();
        },
    });
    if (isLoading || ticket == null) {
        return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: _jsx("div", { className: "bg-white rounded-lg p-6", children: _jsx("p", { children: "Loading ticket details..." }) }) }));
    }
    const canRequestClarification = ticket.currentStatus === 'Ticket Submitted' ||
        ticket.currentStatus === 'Updated Ticket Submitted' ||
        ticket.currentStatus === 'Cost Estimation Needed';
    const canReject = ticket.currentStatus === 'Ticket Submitted' ||
        ticket.currentStatus === 'Updated Ticket Submitted' ||
        ticket.currentStatus === 'Cost Estimation Needed';
    const canSubmitCost = ticket.currentStatus === 'Cost Estimation Needed';
    const canCreateWO = (ticket.currentStatus === 'Ticket Submitted' && ticket.urgent) ||
        ticket.currentStatus === 'Ticket Cost Estimation Approved';
    const canArchive = ticket.currentStatus === 'Ticket Cost Estimation Approved';
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto", children: _jsxs("div", { className: "bg-white rounded-lg max-w-4xl w-full my-8", children: [_jsx("div", { className: "p-6 border-b border-gray-200 sticky top-0 bg-white", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsxs("h2", { className: "text-2xl font-bold text-gray-900", children: ["Ticket #", ticket.id] }), ticket.urgent && _jsx(Badge, { variant: "urgent", children: "URGENT" }), _jsx(Badge, { variant: ticket.currentStatus.includes('Approved')
                                                    ? 'success'
                                                    : 'warning', children: ticket.currentStatus })] }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Store: ", ticket.storeName, " \u2022 Created by:", ' ', ticket.createdByUserName] })] }), _jsx("button", { type: "button", onClick: onClose, className: "text-gray-400 hover:text-gray-600 text-2xl", "aria-label": "Close", children: "\u00D7" })] }) }), _jsxs("div", { className: "p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "Details" }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4 space-y-2", children: [_jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium text-gray-600", children: "Category:" }), ' ', _jsx("span", { className: "text-sm text-gray-900", children: ticket.category })] }), _jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium text-gray-600", children: "Description:" }), _jsx("p", { className: "text-sm text-gray-900 mt-1", children: ticket.description })] })] })] }), _jsxs("div", { className: "space-y-4", children: [canRequestClarification && (_jsxs("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4", children: [_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "Request Clarification" }), _jsx("textarea", { value: clarificationComment, onChange: (e) => setClarificationComment(e.target.value), placeholder: "Explain what needs clarification...", rows: 3, className: "w-full p-3 border border-gray-300 rounded-lg mb-2" }), _jsx(Button, { type: "button", onClick: () => clarifyMutation.mutate(clarificationComment), disabled: !clarificationComment.trim() || clarifyMutation.isPending, size: "sm", children: clarifyMutation.isPending
                                                ? 'Sending...'
                                                : 'Send Back to SM' })] })), canReject && (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: !showRejectForm ? (_jsx(Button, { type: "button", variant: "danger", onClick: () => setShowRejectForm(true), size: "sm", children: "Reject Ticket" })) : (_jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "font-medium text-red-900", children: "Reject Ticket" }), _jsx("textarea", { value: rejectReason, onChange: (e) => setRejectReason(e.target.value), placeholder: "Reason for rejection (required)...", rows: 3, className: "w-full p-3 border border-gray-300 rounded-lg" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { type: "button", variant: "danger", onClick: () => rejectMutation.mutate(rejectReason), disabled: !rejectReason.trim() || rejectMutation.isPending, size: "sm", children: rejectMutation.isPending
                                                            ? 'Rejecting...'
                                                            : 'Confirm Rejection' }), _jsx(Button, { type: "button", variant: "secondary", onClick: () => setShowRejectForm(false), size: "sm", children: "Cancel" })] })] })) })), canSubmitCost && (_jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: !showCostForm ? (_jsx(Button, { type: "button", onClick: () => setShowCostForm(true), size: "sm", children: "Submit Cost Estimation" })) : (_jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "font-medium text-blue-900", children: "Submit Cost Estimation" }), _jsx("p", { className: "text-sm text-blue-700", children: "Enter the estimated cost in EUR. This will route the ticket through the approval chain based on the amount." }), _jsx("input", { type: "number", value: costAmount, onChange: (e) => setCostAmount(e.target.value), placeholder: "Amount in EUR (e.g., 1500)", min: "0", step: "0.01", className: "w-full p-3 border border-gray-300 rounded-lg" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { type: "button", onClick: () => submitCostMutation.mutate(parseFloat(costAmount)), disabled: !costAmount ||
                                                            parseFloat(costAmount) <= 0 ||
                                                            submitCostMutation.isPending, size: "sm", children: submitCostMutation.isPending
                                                            ? 'Submitting...'
                                                            : 'Submit for Approval' }), _jsx(Button, { type: "button", variant: "secondary", onClick: () => setShowCostForm(false), size: "sm", children: "Cancel" })] })] })) })), canCreateWO && (_jsx("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4", children: !showWorkOrderForm ? (_jsx(Button, { type: "button", onClick: () => setShowWorkOrderForm(true), size: "sm", children: "Create Work Order" })) : (_jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "font-medium text-green-900", children: "Create Work Order" }), _jsxs("select", { value: selectedVendorId, onChange: (e) => setSelectedVendorId(e.target.value), className: "w-full p-3 border border-gray-300 rounded-lg", children: [_jsx("option", { value: "", children: "-- Select Vendor --" }), _jsx("option", { value: "1", children: "FastFix Maintenance" }), _jsx("option", { value: "2", children: "QuickRepair Services" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { type: "button", onClick: () => createWOMutation.mutate({
                                                            ticketId,
                                                            vendorCompanyId: parseInt(selectedVendorId, 10),
                                                        }), disabled: !selectedVendorId ||
                                                            createWOMutation.isPending, size: "sm", children: createWOMutation.isPending
                                                            ? 'Creating...'
                                                            : 'Create Work Order' }), _jsx(Button, { type: "button", variant: "secondary", onClick: () => setShowWorkOrderForm(false), size: "sm", children: "Cancel" })] })] })) })), canArchive && (_jsxs("div", { className: "bg-gray-50 border border-gray-200 rounded-lg p-4", children: [_jsx("p", { className: "text-sm text-gray-700 mb-2", children: "This ticket is approved and can be archived when all work orders are complete." }), _jsx(Button, { type: "button", onClick: () => archiveMutation.mutate(), disabled: archiveMutation.isPending, size: "sm", variant: "secondary", children: archiveMutation.isPending
                                                ? 'Archiving...'
                                                : 'Archive Ticket' })] }))] }), ticket.comments != null && ticket.comments.length > 0 && (_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-3", children: "Comments" }), _jsx("div", { className: "space-y-3", children: ticket.comments.map((c) => (_jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsx("span", { className: "font-medium text-gray-900", children: c.authorUserName }), _jsx("span", { className: "text-xs text-gray-500", children: new Date(c.createdAt).toLocaleString() })] }), _jsx("p", { className: "text-sm text-gray-700", children: c.text })] }, c.id))) })] })), ticket.auditLog != null && ticket.auditLog.length > 0 && (_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-3", children: "History" }), _jsx("div", { className: "space-y-2", children: ticket.auditLog.map((entry) => (_jsxs("div", { className: "text-sm", children: [_jsx("span", { className: "text-gray-600", children: new Date(entry.createdAt).toLocaleString() }), ' - ', _jsx("span", { className: "font-medium", children: entry.actionType }), entry.prevStatus != null && (_jsxs("span", { className: "text-gray-600", children: [' ', "(", entry.prevStatus, " \u2192 ", entry.newStatus, ")"] })), entry.comment != null && (_jsxs("p", { className: "text-gray-600 ml-4 mt-1", children: ["\"", entry.comment, "\""] }))] }, entry.id))) })] }))] }), _jsx("div", { className: "p-6 border-t border-gray-200 sticky bottom-0 bg-white", children: _jsx(Button, { type: "button", variant: "secondary", onClick: onClose, className: "w-full", children: "Close" }) })] }) }));
}
