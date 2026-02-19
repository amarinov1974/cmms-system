import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * AMM Ticket Detail — Section 11 (Urgent Flow) and other AMM states
 * Header, read-only core block, Create WO / Request Clarification / Reject.
 */
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsAPI } from '../../api/tickets';
import { workOrdersAPI } from '../../api/work-orders';
import { authAPI } from '../../api/auth';
import { useSession } from '../../contexts/SessionContext';
import { TicketStatus } from '../../types/statuses';
import { Button, Badge } from '../../components/shared';
const INTERNAL_ROLE_LABELS = {
    SM: 'Store Manager (creator)',
    AM: 'Area Manager',
    AMM: 'Area Maintenance Manager',
    D: 'Sales Director',
    C2: 'Maintenance Director',
    BOD: 'Board of Directors',
};
export function AMMTicketDetailModal({ ticketId, onClose, }) {
    const { session } = useSession();
    const queryClient = useQueryClient();
    const [clarificationComment, setClarificationComment] = useState('');
    const [assignToRole, setAssignToRole] = useState('SM');
    const [rejectReason, setRejectReason] = useState('');
    const [costAmount, setCostAmount] = useState('');
    const [selectedVendorId, setSelectedVendorId] = useState('');
    const [commentToVendor, setCommentToVendor] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [showWorkOrderForm, setShowWorkOrderForm] = useState(false);
    const [uploadingAttachment, setUploadingAttachment] = useState(false);
    const costEstimationFileInputRef = useRef(null);
    const [showClarificationPopup, setShowClarificationPopup] = useState(false);
    const [woSuccessState, setWoSuccessState] = useState(null);
    const [showCostSubmittedSuccess, setShowCostSubmittedSuccess] = useState(false);
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;
    const { data: ticket, isLoading } = useQuery({
        queryKey: ['ticket', ticketId],
        queryFn: () => ticketsAPI.getById(ticketId),
    });
    const { data: workOrdersForTicket = [] } = useQuery({
        queryKey: ['work-orders', 'ticket', ticketId],
        queryFn: () => workOrdersAPI.list({ ticketId }),
        enabled: !!ticketId,
    });
    const { data: vendorUsers = [] } = useQuery({
        queryKey: ['vendor-users'],
        queryFn: authAPI.getVendorUsers,
        enabled: showWorkOrderForm || woSuccessState === 'sent',
    });
    const vendorCompanies = Array.from(new Map(vendorUsers
        .filter((u) => u.vendorCompanyId != null && u.vendorCompanyName != null)
        .map((u) => [u.vendorCompanyId, { id: u.vendorCompanyId, name: u.vendorCompanyName }])).values());
    const clarifyMutation = useMutation({
        mutationFn: ({ comment, role }) => ticketsAPI.requestClarification(ticketId, comment, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
            setClarificationComment('');
            setShowClarificationPopup(false);
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
            setShowCostSubmittedSuccess(true);
        },
    });
    useEffect(() => {
        if (!showCostSubmittedSuccess)
            return;
        const t = setTimeout(() => {
            onCloseRef.current();
        }, 2000);
        return () => clearTimeout(t);
    }, [showCostSubmittedSuccess]);
    const handleCostEstimationFileChange = async (e) => {
        const files = e.target.files;
        if (!files?.length)
            return;
        setUploadingAttachment(true);
        try {
            for (let i = 0; i < files.length; i++) {
                await ticketsAPI.uploadAttachment(ticketId, files[i], true);
            }
            queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
        }
        catch (err) {
            console.error('Upload failed:', err);
        }
        finally {
            setUploadingAttachment(false);
            e.target.value = '';
        }
    };
    const createWOMutation = useMutation({
        mutationFn: workOrdersAPI.create,
        onSuccess: async () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
            queryClient.invalidateQueries({ queryKey: ['work-orders'] });
            await queryClient.refetchQueries({ queryKey: ['tickets'] });
            setWoSuccessState('sent');
            setShowWorkOrderForm(false);
            setSelectedVendorId('');
            setCommentToVendor('');
        },
    });
    const archiveMutation = useMutation({
        mutationFn: () => ticketsAPI.archive(ticketId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
            onClose();
        },
    });
    const handleCreateWO = () => {
        const vid = parseInt(selectedVendorId, 10);
        if (Number.isNaN(vid) || !commentToVendor.trim())
            return;
        createWOMutation.mutate({
            ticketId,
            vendorCompanyId: vid,
            description: commentToVendor.trim(),
        });
    };
    const handleCreateAnotherWO = (yes) => {
        setWoSuccessState(null);
        if (yes)
            setShowWorkOrderForm(true);
        else
            onClose();
    };
    if (isLoading || ticket == null) {
        return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: _jsx("div", { className: "bg-white rounded-lg p-6", children: _jsx("p", { children: "Loading ticket details..." }) }) }));
    }
    const isUrgentFlow = ticket.currentStatus === 'Ticket Submitted' && ticket.urgent;
    const isOwner = session?.userId != null && ticket.currentOwnerUserId === session.userId;
    const canReturnToRequester = ticket.currentStatus === 'Awaiting Ticket Creator Response' &&
        isOwner &&
        ticket.clarificationRequestedByUserId != null;
    // AMM can send back to SM (or other involved role) whenever ticket is with AMM in these statuses — urgent and non-urgent.
    const canRequestClarification = ticket.currentStatus === TicketStatus.SUBMITTED ||
        ticket.currentStatus === TicketStatus.UPDATED_SUBMITTED ||
        ticket.currentStatus === TicketStatus.COST_ESTIMATION_NEEDED;
    const canReject = ticket.currentStatus === 'Ticket Submitted' ||
        ticket.currentStatus === 'Updated Ticket Submitted' ||
        ticket.currentStatus === 'Cost Estimation Needed';
    // Urgent tickets skip cost estimation; only show for non-urgent.
    const canSubmitCost = ticket.currentStatus === 'Cost Estimation Needed' && !ticket.urgent;
    // Urgent: create WO directly from Submitted, Updated Submitted, or Cost Estimation Needed (after clarification). Non-urgent: only after cost approved or WO in progress.
    const canCreateWO = (ticket.urgent &&
        (ticket.currentStatus === 'Ticket Submitted' ||
            ticket.currentStatus === 'Updated Ticket Submitted' ||
            ticket.currentStatus === 'Cost Estimation Needed' ||
            ticket.currentStatus === 'Work Order In Progress')) ||
        (!ticket.urgent &&
            (ticket.currentStatus === 'Ticket Cost Estimation Approved' ||
                ticket.currentStatus === 'Work Order In Progress'));
    const canArchive = ticket.currentStatus === 'Ticket Cost Estimation Approved' ||
        ticket.currentStatus === 'Work Order In Progress';
    const submittedAt = ticket.submittedAt ??
        (ticket.currentStatus !== 'Draft' ? ticket.createdAt : null);
    const visibleAttachments = (ticket.attachments ?? []).filter((a) => !a.internalFlag);
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto", children: _jsxs("div", { className: "bg-white rounded-lg max-w-4xl w-full my-8 flex flex-col max-h-[90vh]", children: [_jsx("div", { className: "p-6 border-b border-gray-200 sticky top-0 bg-white shrink-0", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold text-gray-900", children: "Ticket Detail" }), _jsxs("p", { className: "text-sm text-gray-500 mt-0.5", children: ["Ticket #", ticket.id] })] }), _jsx(Button, { type: "button", variant: "secondary", onClick: onClose, children: "Back" })] }) }), _jsx("div", { className: "p-6 space-y-6 overflow-y-auto flex-1", children: showCostSubmittedSuccess ? (_jsx("div", { className: "flex flex-col items-center justify-center py-8", children: _jsxs("div", { className: "bg-green-100 border-2 border-green-500 rounded-lg p-6 max-w-md w-full text-center", children: [_jsx("p", { className: "text-green-800 font-semibold text-xl mb-2", children: "\u2713 Cost estimation sent to Area Manager for approval." }), _jsx("p", { className: "text-green-700 text-sm", children: "Returning to dashboard in 2 seconds..." })] }) })) : (_jsxs(_Fragment, { children: [_jsxs("section", { children: [_jsx("h2", { className: "font-semibold text-gray-900 mb-2", children: "Ticket information" }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4 space-y-3", children: [_jsxs("div", { className: "flex flex-wrap gap-x-6 gap-y-1 text-sm", children: [_jsxs("span", { children: [_jsx("strong", { children: "Ticket ID:" }), " ", ticket.id] }), submittedAt != null && (_jsxs("span", { children: [_jsx("strong", { children: "Date & Time Submitted:" }), " ", new Date(submittedAt).toLocaleString()] })), _jsxs("span", { children: [_jsx("strong", { children: "Created By:" }), " ", ticket.createdByUserName, ticket.createdByUserRole != null ? ` (${ticket.createdByUserRole})` : ''] }), _jsxs("span", { children: [_jsx("strong", { children: "Current Owner:" }), " ", ticket.currentOwnerUserName != null ? `${ticket.currentOwnerUserName}${ticket.currentOwnerUserRole != null ? ` (${ticket.currentOwnerUserRole})` : ''}` : '—'] }), _jsxs("span", { children: [_jsx("strong", { children: "Store:" }), " ", ticket.storeName] }), _jsxs("span", { children: [_jsx("strong", { children: "Category:" }), " ", ticket.category] }), _jsxs("span", { children: [_jsx("strong", { children: "Urgency:" }), ' ', ticket.urgent ? _jsx(Badge, { variant: "urgent", children: "URGENT" }) : _jsx(Badge, { variant: "default", children: "Non-Urgent" })] }), _jsxs("span", { children: [_jsx("strong", { children: "Current Status:" }), " ", _jsx(Badge, { variant: ticket.currentStatus.includes('Approved') ? 'success' : 'warning', children: ticket.currentStatus })] })] }), _jsxs("div", { children: [_jsx("strong", { className: "text-sm text-gray-600", children: "Original Problem Description (locked)" }), _jsx("p", { className: "mt-1 text-sm text-gray-900 whitespace-pre-wrap", children: ticket.originalDescription ?? ticket.description })] }), (ticket.assetId != null || ticket.assetDescription != null) && (_jsxs("div", { children: [_jsx("strong", { className: "text-sm text-gray-600", children: "Asset" }), _jsxs("p", { className: "text-sm text-gray-900", children: [ticket.assetId != null && `ID: ${ticket.assetId}`, ticket.assetDescription != null && ` — ${ticket.assetDescription}`] })] })), visibleAttachments.length > 0 && (_jsxs("div", { children: [_jsx("strong", { className: "text-sm text-gray-600", children: "Attachments" }), _jsx("ul", { className: "mt-1 text-sm text-gray-900 list-disc list-inside", children: visibleAttachments.map((a) => (_jsx("li", { children: a.fileName }, a.id))) })] }))] })] }), woSuccessState === 'sent' && (_jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4", children: [_jsx("p", { className: "font-medium text-green-800 mb-2", children: "Work Order successfully sent." }), _jsx("p", { className: "text-sm text-green-700 mb-3", children: "Create another Work Order?" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { type: "button", variant: "primary", onClick: () => handleCreateAnotherWO(false), size: "sm", children: "No" }), _jsx(Button, { type: "button", variant: "secondary", onClick: () => handleCreateAnotherWO(true), size: "sm", children: "Yes" })] })] })), workOrdersForTicket.length > 0 && (_jsxs("section", { className: "bg-gray-50 border border-gray-200 rounded-lg p-4", children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "Work orders for this ticket" }), _jsx("ul", { className: "space-y-2", children: workOrdersForTicket.map((wo) => (_jsxs("li", { className: "flex flex-wrap items-center gap-x-3 gap-y-1 text-sm bg-white rounded-lg p-3 border border-gray-200", children: [_jsx("span", { className: "font-medium text-gray-900", children: wo.vendorCompanyName }), _jsx(Badge, { variant: wo.currentStatus?.includes('Created') ? 'default' : 'warning', children: wo.currentStatus ?? '—' }), _jsx("span", { className: "text-gray-500", children: new Date(wo.createdAt).toLocaleString() })] }, wo.id))) })] })), woSuccessState !== 'sent' && canCreateWO && (_jsxs("section", { className: "bg-green-50 border border-green-200 rounded-lg p-4", children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "Create Work Order" }), ticket.urgent && (_jsx("p", { className: "text-sm text-green-800 mb-2", children: "Urgent: create work order(s) directly \u2014 no cost estimation or approval required." })), createWOMutation.isError && (_jsx("p", { className: "text-sm text-red-600 bg-red-50 p-2 rounded mb-2", children: (() => {
                                            const err = createWOMutation.error;
                                            return err?.response?.data?.error ?? err?.message ?? 'Failed to create work order.';
                                        })() })), !showWorkOrderForm ? (_jsx(Button, { type: "button", onClick: () => setShowWorkOrderForm(true), children: "Create Work Order" })) : (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Select Vendor *" }), _jsxs("select", { value: selectedVendorId, onChange: (e) => setSelectedVendorId(e.target.value), className: "w-full p-3 border border-gray-300 rounded-lg", children: [_jsx("option", { value: "", children: "\u2014 Select Vendor \u2014" }), vendorCompanies.map((v) => (_jsx("option", { value: v.id, children: v.name }, v.id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Comment to Vendor *" }), _jsx("textarea", { value: commentToVendor, onChange: (e) => setCommentToVendor(e.target.value), placeholder: "Explain the issue and provide instructions for the vendor...", rows: 4, className: "w-full p-3 border border-gray-300 rounded-lg" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { type: "button", onClick: handleCreateWO, disabled: !selectedVendorId ||
                                                            !commentToVendor.trim() ||
                                                            createWOMutation.isPending, children: createWOMutation.isPending ? 'Sending...' : 'Send Work Order' }), _jsx(Button, { type: "button", variant: "secondary", onClick: () => setShowWorkOrderForm(false), children: "Cancel" })] })] }))] })), canReturnToRequester && (_jsxs("section", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "Respond to clarification" }), _jsx("p", { className: "text-sm text-blue-900 mb-2", children: ticket.clarificationRequestedByUserName != null || ticket.clarificationRequestedByUserRole != null
                                            ? `${ticket.clarificationRequestedByUserName ?? 'Requester'}${ticket.clarificationRequestedByUserRole != null ? ` (${INTERNAL_ROLE_LABELS[ticket.clarificationRequestedByUserRole] ?? ticket.clarificationRequestedByUserRole})` : ''} requested clarification. You can only return the ticket to them.`
                                            : 'Return the ticket to the role that requested clarification.' }), _jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Optional comment" }), _jsx("textarea", { value: clarificationComment, onChange: (e) => setClarificationComment(e.target.value), placeholder: "Add a comment (optional)...", rows: 3, className: "w-full p-3 border border-gray-300 rounded-lg mb-3" }), _jsx(Button, { type: "button", onClick: () => submitResponseToRequesterMutation.mutate(clarificationComment.trim() || undefined), disabled: submitResponseToRequesterMutation.isPending, children: submitResponseToRequesterMutation.isPending ? 'Sending...' : `Return to ${ticket.clarificationRequestedByUserName ?? 'requester'}` })] })), canRequestClarification && (_jsxs("section", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4", children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "Request Ticket Clarification" }), _jsx("p", { className: "text-sm text-gray-700 mb-2", children: "Send the ticket to a role that has been involved in this ticket. After they update it, the ticket will return to you." }), clarifyMutation.isError && (_jsx("p", { className: "text-sm text-red-600 bg-red-50 p-2 rounded mb-2", children: (() => {
                                            const err = clarifyMutation.error;
                                            return err?.response?.data?.error ?? err?.message ?? 'Request clarification failed.';
                                        })() })), !showClarificationPopup ? (_jsx(Button, { type: "button", onClick: () => { const baseRoles = ticket.involvedInternalRoles ?? ['SM']; const options = baseRoles.filter((r) => r !== ticket.currentOwnerUserRole); const targetOptions = options.length > 0 ? options : ['SM']; setAssignToRole(targetOptions[0] ?? 'SM'); setShowClarificationPopup(true); }, children: "Request Ticket Clarification" })) : (_jsxs("div", { className: "space-y-3", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Send clarification request to" }), _jsx("select", { value: assignToRole, onChange: (e) => setAssignToRole(e.target.value), className: "w-full p-2 border border-gray-300 rounded-lg", children: (() => { const baseRoles = ticket.involvedInternalRoles ?? ['SM']; const options = baseRoles.filter((r) => r !== ticket.currentOwnerUserRole); const targetOptions = options.length > 0 ? options : ['SM']; return targetOptions.map((r) => (_jsx("option", { value: r, children: INTERNAL_ROLE_LABELS[r] ?? r }, r))); })() }), _jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Clarification text (mandatory)" }), _jsx("textarea", { value: clarificationComment, onChange: (e) => setClarificationComment(e.target.value), placeholder: "Explain what needs clarification...", rows: 4, className: "w-full p-3 border border-gray-300 rounded-lg" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { type: "button", onClick: () => clarifyMutation.mutate({ comment: clarificationComment, role: assignToRole }), disabled: !clarificationComment.trim() || clarifyMutation.isPending, children: clarifyMutation.isPending ? 'Sending...' : 'Submit' }), _jsx(Button, { type: "button", variant: "secondary", onClick: () => setShowClarificationPopup(false), children: "Cancel" })] })] }))] })), canReject && (_jsxs("section", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "Reject Ticket" }), !showRejectForm ? (_jsx(Button, { type: "button", variant: "danger", onClick: () => setShowRejectForm(true), children: "Reject Ticket" })) : (_jsxs("div", { className: "space-y-3", children: [_jsx("label", { className: "block text-sm font-medium text-red-900", children: "Reason (mandatory)" }), _jsx("textarea", { value: rejectReason, onChange: (e) => setRejectReason(e.target.value), placeholder: "Reason for rejection...", rows: 3, className: "w-full p-3 border border-gray-300 rounded-lg" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { type: "button", variant: "danger", onClick: () => rejectMutation.mutate(rejectReason), disabled: !rejectReason.trim() || rejectMutation.isPending, children: rejectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection' }), _jsx(Button, { type: "button", variant: "secondary", onClick: () => setShowRejectForm(false), children: "Cancel" })] })] }))] })), canSubmitCost && (_jsxs("section", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "Submit Cost Estimation" }), _jsx("p", { className: "text-sm text-blue-700 mb-3", children: "Enter the estimated cost and optionally attach documents. This will route the ticket through the approval chain." }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Estimated amount (EUR)" }), _jsx("input", { type: "number", value: costAmount, onChange: (e) => setCostAmount(e.target.value), placeholder: "Amount in EUR", min: "0", step: "0.01", className: "w-full p-3 border border-gray-300 rounded-lg" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Documents (optional)" }), _jsx("p", { className: "text-xs text-gray-600 mb-2", children: "Attach supporting documents for the cost estimation." }), _jsx("input", { ref: costEstimationFileInputRef, type: "file", multiple: true, accept: ".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.heic,image/*", className: "hidden", onChange: handleCostEstimationFileChange }), _jsx(Button, { type: "button", variant: "secondary", size: "sm", onClick: () => costEstimationFileInputRef.current?.click(), disabled: uploadingAttachment, children: uploadingAttachment ? 'Uploading...' : 'Add document(s)' }), ticket.attachments != null && ticket.attachments.length > 0 && (_jsx("ul", { className: "mt-2 text-sm text-gray-600 list-disc list-inside", children: ticket.attachments.map((a) => (_jsx("li", { children: a.fileName }, a.id))) }))] }), _jsx("div", { className: "flex gap-2 pt-1", children: _jsx(Button, { type: "button", onClick: () => submitCostMutation.mutate(parseFloat(costAmount)), disabled: !costAmount || parseFloat(costAmount) <= 0 || submitCostMutation.isPending, children: submitCostMutation.isPending ? 'Submitting...' : 'Submit for Approval' }) })] })] })), canArchive && (_jsxs("section", { className: "bg-gray-50 border border-gray-200 rounded-lg p-4", children: [_jsx("p", { className: "text-sm text-gray-700 mb-2", children: "Ticket is approved. Archive when all work orders are complete." }), archiveMutation.isError && (_jsx("div", { className: "mb-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800", children: archiveMutation.error?.response?.data?.error ??
                                            'Archive failed' })), _jsx(Button, { type: "button", variant: "secondary", onClick: () => archiveMutation.mutate(), disabled: archiveMutation.isPending, children: archiveMutation.isPending ? 'Archiving...' : 'Archive Ticket' })] })), ticket.comments != null && ticket.comments.length > 0 && (_jsxs("section", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "Comments" }), _jsx("div", { className: "space-y-3", children: [...ticket.comments]
                                            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                            .map((c) => (_jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsxs("div", { className: "flex justify-between items-start mb-1", children: [_jsx("span", { className: "font-medium text-gray-900", children: c.authorUserName }), _jsx("span", { className: "text-xs text-gray-500", children: new Date(c.createdAt).toLocaleString() })] }), _jsx("p", { className: "text-sm text-gray-700", children: c.text })] }, c.id))) })] })), ticket.auditLog != null && ticket.auditLog.length > 0 && (_jsxs("section", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "History" }), _jsx("div", { className: "space-y-2", children: ticket.auditLog.map((entry) => (_jsxs("div", { className: "text-sm bg-gray-50 rounded-lg p-3", children: [_jsx("span", { className: "text-gray-600", children: new Date(entry.createdAt).toLocaleString() }), ' — ', _jsx("span", { className: "font-medium", children: entry.actionType }), entry.prevStatus != null && (_jsxs("span", { className: "text-gray-600", children: [" (", entry.prevStatus, " \u2192 ", entry.newStatus, ")"] })), _jsxs("p", { className: "mt-1 text-gray-600", children: ["Performed by ", entry.actorName, entry.actorRole != null ? ` (${entry.actorRole})` : ''] }), entry.comment != null && _jsxs("p", { className: "text-gray-600 mt-1", children: ["\"", entry.comment, "\""] })] }, entry.id))) })] }))] })) }), _jsx("div", { className: "p-6 border-t border-gray-200 sticky bottom-0 bg-white shrink-0", children: _jsx(Button, { type: "button", variant: "secondary", onClick: onClose, className: "w-full", children: "Back" }) })] }) }));
}
