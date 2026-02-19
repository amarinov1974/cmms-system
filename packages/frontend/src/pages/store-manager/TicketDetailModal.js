import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Ticket Detail (Store Manager View) — Section 9
 * Read-only block, Clarification mode when owner, visibility rules, history log.
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsAPI } from '../../api/tickets';
import { workOrdersAPI } from '../../api/work-orders';
import { useSession } from '../../contexts/SessionContext';
import { Button, Badge } from '../../components/shared';
import { TicketStatus } from '../../types/statuses';
import { QRGenerationModal } from './QRGenerationModal';
export function TicketDetailModal({ ticketId, onClose, }) {
    const { session } = useSession();
    const queryClient = useQueryClient();
    const [clarificationText, setClarificationText] = useState('');
    const [clarificationAssetId, setClarificationAssetId] = useState('');
    const [withdrawReason, setWithdrawReason] = useState('');
    const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const { data: ticket, isLoading } = useQuery({
        queryKey: ['ticket', ticketId],
        queryFn: () => ticketsAPI.getById(ticketId),
    });
    const { data: relatedWorkOrders = [] } = useQuery({
        queryKey: ['work-orders', 'ticket', ticketId],
        queryFn: () => workOrdersAPI.list({ ticketId }),
        enabled: ticketId != null,
    });
    const submitMutation = useMutation({
        mutationFn: () => ticketsAPI.submit(ticketId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
        },
    });
    const submitUpdatedMutation = useMutation({
        mutationFn: () => {
            const raw = clarificationAssetId.trim();
            const assetId = raw ? parseInt(raw, 10) : undefined;
            const validAssetId = assetId != null && !Number.isNaN(assetId) && assetId >= 1 ? assetId : undefined;
            return ticketsAPI.submitUpdated(ticketId, clarificationText, clarificationText, validAssetId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
            setClarificationText('');
            setClarificationAssetId('');
            onClose();
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
        mutationFn: () => ticketsAPI.addComment(ticketId, clarificationText),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
            setClarificationText('');
        },
    });
    if (isLoading) {
        return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: _jsx("div", { className: "bg-white rounded-lg p-6", children: _jsx("p", { children: "Loading ticket details..." }) }) }));
    }
    if (ticket == null) {
        return null;
    }
    const isOwner = session?.userId != null && ticket.currentOwnerUserId === session.userId;
    const isCreator = session?.userId != null && ticket.createdByUserId === session.userId;
    const canSubmitDraft = isOwner && ticket.currentStatus === 'Draft';
    // Only the ticket creator (SM who created it) can submit clarification; unlimited exchange with AMM.
    const isClarificationMode = isCreator &&
        ticket.currentStatus === TicketStatus.AWAITING_CREATOR_RESPONSE;
    const clarificationValid = (clarificationText?.trim() ?? '').length > 0;
    const readOnly = !isOwner;
    const awaitingCreatorResponseNotCreator = ticket.currentStatus === TicketStatus.AWAITING_CREATOR_RESPONSE && !isCreator;
    const visibleComments = (ticket.comments != null && readOnly
        ? ticket.comments.filter((c) => !c.internalFlag)
        : ticket.comments ?? []).slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const visibleAttachments = (ticket.attachments ?? []).filter((a) => !a.internalFlag);
    const submittedAt = ticket.submittedAt ?? (ticket.currentStatus !== 'Draft' ? ticket.createdAt : null);
    return (_jsxs("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: [_jsxs("div", { className: "bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col", children: [_jsx("div", { className: "p-6 border-b border-gray-200 sticky top-0 bg-white shrink-0", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold text-gray-900", children: "Ticket Detail" }), _jsxs("p", { className: "text-sm text-gray-500 mt-0.5", children: ["Ticket #", ticket.id] })] }), _jsx(Button, { type: "button", variant: "secondary", onClick: onClose, children: "Back" })] }) }), _jsxs("div", { className: "p-6 space-y-6 overflow-y-auto", children: [readOnly && (_jsx("div", { className: "bg-gray-100 border border-gray-300 rounded-lg p-3 text-sm text-gray-700", children: "You are not the owner of this ticket. View only \u2014 no modifications." })), awaitingCreatorResponseNotCreator && (_jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800", children: ["This ticket is awaiting a clarification response from the ticket creator (", ticket.createdByUserName ?? 'Store Manager', "). Only they can submit the response and return it to the Area Maintenance Manager."] })), _jsxs("section", { className: "space-y-4", children: [_jsx("h2", { className: "font-semibold text-gray-900", children: "Ticket information" }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4 space-y-3", children: [_jsxs("div", { className: "flex flex-wrap gap-x-6 gap-y-1 text-sm", children: [_jsxs("span", { children: [_jsx("strong", { children: "Ticket ID:" }), " ", ticket.id] }), submittedAt != null && (_jsxs("span", { children: [_jsx("strong", { children: "Date & Time Submitted:" }), " ", new Date(submittedAt).toLocaleString()] })), _jsxs("span", { children: [_jsx("strong", { children: "Created By:" }), " ", ticket.createdByUserName, ticket.createdByUserRole != null ? ` (${ticket.createdByUserRole})` : ''] }), _jsxs("span", { children: [_jsx("strong", { children: "Current Owner:" }), " ", ticket.currentOwnerUserName != null ? `${ticket.currentOwnerUserName}${ticket.currentOwnerUserRole != null ? ` (${ticket.currentOwnerUserRole})` : ''}` : '—'] }), _jsxs("span", { children: [_jsx("strong", { children: "Store:" }), " ", ticket.storeName] }), _jsxs("span", { children: [_jsx("strong", { children: "Category:" }), " ", ticket.category] }), _jsxs("span", { children: [_jsx("strong", { children: "Urgency:" }), ' ', ticket.urgent ? _jsx(Badge, { variant: "urgent", children: "Urgent" }) : _jsx(Badge, { variant: "default", children: "Non-Urgent" })] }), _jsxs("span", { children: [_jsx("strong", { children: "Current Status:" }), " ", _jsx(Badge, { variant: ticket.currentStatus.includes('Approved') ? 'success' : 'warning', children: ticket.currentStatus })] })] }), _jsxs("div", { children: [_jsx("strong", { className: "text-sm text-gray-600", children: "Original Problem Description (locked)" }), _jsx("p", { className: "mt-1 text-sm text-gray-900 whitespace-pre-wrap", children: ticket.originalDescription ?? ticket.description })] })] })] }), _jsxs("section", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "Related Work Orders" }), relatedWorkOrders.length === 0 ? (_jsx("p", { className: "text-sm text-gray-500", children: "No work orders for this ticket." })) : (_jsxs(_Fragment, { children: [_jsx("ul", { className: "bg-gray-50 rounded-lg p-4 space-y-2 mb-3", children: relatedWorkOrders.map((wo) => (_jsxs("li", { className: "flex flex-wrap items-center gap-2 text-sm", children: [_jsxs("span", { className: "font-medium", children: ["Work Order #", wo.id] }), _jsx(Badge, { variant: "default", children: wo.currentStatus }), _jsx("span", { className: "text-gray-600", children: wo.vendorCompanyName }), _jsx("span", { className: "text-gray-500", children: new Date(wo.updatedAt).toLocaleDateString() })] }, wo.id))) }), _jsx(Button, { type: "button", onClick: () => setShowQRModal(true), children: relatedWorkOrders.length === 1 ? 'Generate QR Code' : 'Generate QR Code (select work order)' })] }))] }), (ticket.assetId != null || ticket.assetDescription != null) && (_jsxs("section", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "Asset" }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4 text-sm", children: [ticket.assetId != null && _jsxs("span", { children: [_jsx("strong", { children: "Asset ID:" }), " ", ticket.assetId] }), ticket.assetDescription != null && (_jsxs("p", { className: "mt-1", children: [_jsx("strong", { children: "Description:" }), " ", ticket.assetDescription] }))] })] })), _jsxs("section", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "Attachments" }), visibleAttachments.length > 0 ? (_jsx("ul", { className: "bg-gray-50 rounded-lg p-4 space-y-2", children: visibleAttachments.map((a) => (_jsxs("li", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { children: a.fileName }), _jsx("span", { className: "text-gray-500", children: new Date(a.createdAt).toLocaleDateString() })] }, a.id))) })) : (_jsx("p", { className: "text-sm text-gray-500", children: "No attachments" })), isClarificationMode && (_jsx("p", { className: "mt-2 text-xs text-gray-500", children: "Add attachments (add-only) \u2014 upload will be available in a future release." }))] }), canSubmitDraft && (_jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: [_jsx("p", { className: "text-sm text-blue-800 mb-3", children: "This ticket is in Draft. Submit it to send for processing." }), _jsx(Button, { type: "button", onClick: () => submitMutation.mutate(), disabled: submitMutation.isPending, children: submitMutation.isPending ? 'Submitting...' : 'Submit Ticket' })] })), isClarificationMode && (_jsxs("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3", children: [_jsx("p", { className: "text-sm text-yellow-800 font-medium", children: "Clarification requested. Provide your response (mandatory) and optionally add attachments or link an asset." }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Clarification Response *" }), _jsx("textarea", { value: clarificationText, onChange: (e) => setClarificationText(e.target.value), placeholder: "Enter your clarification response...", rows: 4, className: "w-full p-3 border border-gray-300 rounded-lg" })] }), ticket.assetId == null && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Add asset link (optional)" }), _jsx("input", { type: "text", inputMode: "numeric", value: clarificationAssetId, onChange: (e) => setClarificationAssetId(e.target.value), placeholder: "Asset ID", className: "w-full p-3 border border-gray-300 rounded-lg max-w-xs" })] })), submitUpdatedMutation.isError && (_jsx("p", { className: "text-sm text-red-600 bg-red-50 p-2 rounded", children: (() => {
                                            const err = submitUpdatedMutation.error;
                                            return err?.response?.data?.error ?? (err?.message ?? 'Submit failed. Please try again.');
                                        })() })), _jsxs("div", { className: "flex gap-3 pt-2", children: [_jsx(Button, { type: "button", onClick: () => submitUpdatedMutation.mutate(), disabled: submitUpdatedMutation.isPending || !clarificationValid, children: submitUpdatedMutation.isPending ? 'Submitting...' : 'Submit Updated Ticket' }), _jsx(Button, { type: "button", variant: "danger", onClick: () => setShowWithdrawConfirm(true), children: "Withdraw Ticket" })] }), showWithdrawConfirm && (_jsxs("div", { className: "mt-4 pt-4 border-t border-yellow-300 space-y-3", children: [_jsx("p", { className: "text-sm text-red-700 font-medium", children: "Withdraw this ticket? This is a terminal state." }), _jsx("textarea", { value: withdrawReason, onChange: (e) => setWithdrawReason(e.target.value), placeholder: "Reason (optional)", rows: 2, className: "w-full p-3 border border-gray-300 rounded-lg" }), _jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { type: "button", variant: "danger", onClick: () => withdrawMutation.mutate(), disabled: withdrawMutation.isPending, children: withdrawMutation.isPending ? 'Withdrawing...' : 'Confirm Withdrawal' }), _jsx(Button, { type: "button", variant: "secondary", onClick: () => setShowWithdrawConfirm(false), children: "Cancel" })] })] }))] })), _jsxs("section", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "Comments" }), visibleComments.length > 0 ? (_jsx("div", { className: "space-y-3", children: visibleComments.map((c) => (_jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsxs("div", { className: "flex justify-between items-start mb-1", children: [_jsx("span", { className: "font-medium text-gray-900", children: c.authorUserName }), _jsx("span", { className: "text-xs text-gray-500", children: new Date(c.createdAt).toLocaleString() })] }), _jsx("p", { className: "text-sm text-gray-700", children: c.text })] }, c.id))) })) : (_jsx("p", { className: "text-sm text-gray-500", children: "No comments" })), !readOnly && !isClarificationMode && (_jsxs("div", { className: "mt-4", children: [_jsx("textarea", { value: clarificationText, onChange: (e) => setClarificationText(e.target.value), placeholder: "Add a comment...", rows: 3, className: "w-full p-3 border border-gray-300 rounded-lg" }), _jsx(Button, { type: "button", onClick: () => addCommentMutation.mutate(), disabled: !clarificationText.trim() || addCommentMutation.isPending, className: "mt-2", children: addCommentMutation.isPending ? 'Adding...' : 'Add Comment' })] }))] }), ticket.auditLog != null && ticket.auditLog.length > 0 && (_jsxs("section", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "History" }), _jsx("div", { className: "space-y-2", children: ticket.auditLog.map((entry) => (_jsxs("div", { className: "text-sm bg-gray-50 rounded-lg p-3", children: [_jsx("span", { className: "text-gray-600", children: new Date(entry.createdAt).toLocaleString() }), ' — ', _jsx("span", { className: "font-medium", children: entry.actionType }), entry.prevStatus != null && (_jsxs("span", { className: "text-gray-600", children: [" (", entry.prevStatus, " \u2192 ", entry.newStatus, ")"] })), _jsxs("p", { className: "mt-1 text-gray-600", children: ["Performed by ", entry.actorName, entry.actorRole != null ? ` (${entry.actorRole})` : ''] }), entry.comment != null && _jsxs("p", { className: "text-gray-600 mt-1", children: ["\"", entry.comment, "\""] })] }, entry.id))) })] }))] }), _jsx("div", { className: "p-6 border-t border-gray-200 sticky bottom-0 bg-white shrink-0", children: _jsx(Button, { type: "button", variant: "secondary", onClick: onClose, className: "w-full", children: "Back" }) })] }), showQRModal && relatedWorkOrders.length > 0 && (_jsx(QRGenerationModal, { ticketId: ticketId, workOrders: relatedWorkOrders, onClose: () => setShowQRModal(false) }))] }));
}
