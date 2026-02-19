import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * AMM Work Order Detail — Section 16
 * Cost Proposal Review: read-only WO + invoice table (with warning highlights) + Approve / Request Revision / Close Without Cost.
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workOrdersAPI } from '../../api/work-orders';
import { useSession } from '../../contexts/SessionContext';
import { Button, Badge } from '../../components/shared';
export function AMMWorkOrderDetailModal({ workOrderId, onClose, }) {
    const { session } = useSession();
    const queryClient = useQueryClient();
    const [revisionComment, setRevisionComment] = useState('');
    const [showRevisionForm, setShowRevisionForm] = useState(false);
    const [showCloseConfirm, setShowCloseConfirm] = useState(false);
    const [resendComment, setResendComment] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const { data: wo, isLoading } = useQuery({
        queryKey: ['work-order', workOrderId],
        queryFn: () => workOrdersAPI.getById(workOrderId),
        enabled: workOrderId > 0,
    });
    const approveMutation = useMutation({
        mutationFn: () => workOrdersAPI.approveCostProposal(workOrderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['work-orders'] });
            queryClient.invalidateQueries({ queryKey: ['work-order', workOrderId] });
            onClose();
        },
    });
    const revisionMutation = useMutation({
        mutationFn: () => workOrdersAPI.requestCostRevision(workOrderId, revisionComment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['work-orders'] });
            queryClient.invalidateQueries({ queryKey: ['work-order', workOrderId] });
            setRevisionComment('');
            setShowRevisionForm(false);
            onClose();
        },
    });
    const closeWithoutCostMutation = useMutation({
        mutationFn: () => workOrdersAPI.closeWithoutCost(workOrderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['work-orders'] });
            queryClient.invalidateQueries({ queryKey: ['work-order', workOrderId] });
            setShowCloseConfirm(false);
            onClose();
        },
    });
    const resendToVendorMutation = useMutation({
        mutationFn: (comment) => workOrdersAPI.resendToVendor(workOrderId, comment || undefined),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['work-orders'] });
            queryClient.invalidateQueries({ queryKey: ['work-order', workOrderId] });
            setResendComment('');
            onClose();
        },
    });
    const rejectWoMutation = useMutation({
        mutationFn: (reason) => workOrdersAPI.reject(workOrderId, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['work-orders'] });
            queryClient.invalidateQueries({ queryKey: ['work-order', workOrderId] });
            setShowRejectForm(false);
            setRejectReason('');
            onClose();
        },
    });
    const isCostProposalPrepared = wo?.currentStatus === 'Cost Proposal Prepared';
    const isOwner = session?.userId != null && wo?.currentOwnerId === session.userId;
    const canAct = isCostProposalPrepared && isOwner;
    // Returned by S1 to AMM: status Awaiting Service Provider, owner is INTERNAL (AMM)
    const isReturnedToAm = wo?.currentStatus === 'Awaiting Service Provider' &&
        wo?.currentOwnerType === 'INTERNAL' &&
        isOwner;
    if (isLoading || wo == null) {
        return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: _jsx("div", { className: "bg-white rounded-lg p-6", children: _jsx("p", { children: "Loading work order..." }) }) }));
    }
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto", children: _jsxs("div", { className: "bg-white rounded-lg max-w-4xl w-full my-8", children: [_jsx("div", { className: "p-6 border-b border-gray-200", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold text-gray-900", children: "Work Order Detail" }), _jsxs("p", { className: "text-sm text-gray-600 mt-1", children: ["WO #", wo.id, " \u2022 Ticket #", wo.ticketId] }), _jsx(Badge, { variant: wo.urgent ? 'danger' : 'secondary', className: "mt-2", children: wo.urgent ? 'Urgent' : 'Non-Urgent' })] }), _jsx(Button, { type: "button", variant: "secondary", onClick: onClose, children: "Back" })] }) }), _jsxs("div", { className: "p-6 space-y-6 max-h-[75vh] overflow-y-auto", children: [_jsxs("section", { children: [_jsx("h2", { className: "font-semibold text-gray-900 mb-2", children: "Details" }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4 space-y-2 text-sm", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-gray-600", children: "Status:" }), _jsx(Badge, { variant: wo.currentStatus === 'Cost Proposal Prepared' ? 'warning' : 'default', children: wo.currentStatus ?? '—' })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Current owner:" }), ' ', wo.assignedTechnicianName != null && wo.assignedTechnicianName !== ''
                                                    ? wo.assignedTechnicianName
                                                    : wo.currentOwnerType === 'VENDOR'
                                                        ? 'Vendor (S1)'
                                                        : 'AMM'] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "ETA:" }), ' ', wo.eta != null
                                                    ? new Date(wo.eta).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
                                                    : '—'] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Store:" }), " ", wo.storeName ?? '—'] }), wo.storeAddress != null && wo.storeAddress !== '' && (_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Address:" }), " ", wo.storeAddress] })), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Category:" }), " ", wo.category ?? '—'] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "AMM comment:" }), " ", wo.commentToVendor ?? '—'] }), wo.assetDescription != null && wo.assetDescription !== '' && (_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Asset:" }), " ", wo.assetDescription] })), wo.attachments != null && wo.attachments.length > 0 && (_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Attachments:" }), _jsx("ul", { className: "list-disc list-inside mt-1", children: wo.attachments.map((a) => (_jsx("li", { children: a.fileName }, a.id))) })] }))] })] }), isReturnedToAm && (_jsxs("section", { className: "space-y-4 border-t pt-4", children: [_jsx("h2", { className: "font-semibold text-gray-900", children: "Actions (returned by vendor)" }), _jsx("p", { className: "text-sm text-gray-600", children: "This work order was returned by the service provider (S1). Resend it to the vendor with an optional comment, or reject it." }), _jsxs("div", { className: "grid gap-4 sm:grid-cols-1", children: [_jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: [_jsx("h3", { className: "font-medium text-blue-900 mb-2", children: "Resend to vendor (S1)" }), _jsx("p", { className: "text-sm text-blue-700 mb-3", children: "Send the work order back to the vendor. You can add a comment (e.g. clarification) for them." }), _jsx("textarea", { value: resendComment, onChange: (e) => setResendComment(e.target.value), placeholder: "Optional comment for vendor...", rows: 2, className: "w-full p-3 border border-gray-300 rounded-lg mb-3" }), _jsx(Button, { type: "button", onClick: () => resendToVendorMutation.mutate(resendComment), disabled: resendToVendorMutation.isPending, children: resendToVendorMutation.isPending ? 'Sending...' : 'Resend to vendor' })] }), _jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: [_jsx("h3", { className: "font-medium text-red-900 mb-2", children: "Reject work order" }), !showRejectForm ? (_jsxs(_Fragment, { children: [_jsx("p", { className: "text-sm text-red-700 mb-3", children: "Reject this work order. Terminal state." }), _jsx(Button, { type: "button", variant: "danger", onClick: () => setShowRejectForm(true), children: "Reject work order" })] })) : (_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "block text-sm font-medium text-red-900", children: "Reason *" }), _jsx("textarea", { value: rejectReason, onChange: (e) => setRejectReason(e.target.value), placeholder: "Reason for rejection...", rows: 2, className: "w-full p-3 border border-gray-300 rounded-lg" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { type: "button", variant: "danger", onClick: () => rejectWoMutation.mutate(rejectReason), disabled: !rejectReason.trim() || rejectWoMutation.isPending, children: rejectWoMutation.isPending ? 'Rejecting...' : 'Confirm reject' }), _jsx(Button, { type: "button", variant: "secondary", onClick: () => {
                                                                        setShowRejectForm(false);
                                                                        setRejectReason('');
                                                                    }, children: "Cancel" })] })] }))] })] }), (resendToVendorMutation.isError || rejectWoMutation.isError) && (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700", children: resendToVendorMutation.error?.response?.data?.error ??
                                        rejectWoMutation.error?.response?.data?.error ??
                                        'Action failed' }))] })), wo.workReport != null && wo.workReport.length > 0 && (_jsxs("section", { children: [_jsx("h2", { className: "font-semibold text-gray-900 mb-2", children: "Technician work report (read-only)" }), _jsx("div", { className: "overflow-x-auto border border-gray-200 rounded-lg", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-gray-100", children: [_jsx("th", { className: "text-left p-2", children: "#" }), _jsx("th", { className: "text-left p-2", children: "Description" }), _jsx("th", { className: "text-left p-2", children: "Unit" }), _jsx("th", { className: "text-right p-2", children: "Quantity" })] }) }), _jsx("tbody", { children: wo.workReport.map((row, idx) => (_jsxs("tr", { className: "border-t border-gray-100", children: [_jsx("td", { className: "p-2", children: idx + 1 }), _jsx("td", { className: "p-2", children: row.description }), _jsx("td", { className: "p-2", children: row.unit }), _jsx("td", { className: "p-2 text-right", children: row.quantity })] }, idx))) })] }) })] })), wo.invoiceRows != null && wo.invoiceRows.length > 0 && (_jsxs("section", { children: [_jsx("h2", { className: "font-semibold text-gray-900 mb-2", children: "Invoice proposal (from S3)" }), _jsx("div", { className: "overflow-x-auto border border-gray-200 rounded-lg", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-gray-100", children: [_jsx("th", { className: "text-left p-2", children: "#" }), _jsx("th", { className: "text-left p-2", children: "Description" }), _jsx("th", { className: "text-left p-2", children: "Unit" }), _jsx("th", { className: "text-right p-2", children: "Qty" }), _jsx("th", { className: "text-right p-2", children: "Price/Unit" }), _jsx("th", { className: "text-right p-2", children: "Line Total" })] }) }), _jsx("tbody", { children: wo.invoiceRows.map((r) => (_jsxs("tr", { className: `border-t border-gray-100 ${r.warningFlag ? 'bg-red-50' : ''}`, children: [_jsx("td", { className: "p-2", children: r.rowNumber }), _jsx("td", { className: "p-2", children: r.description }), _jsx("td", { className: "p-2", children: r.unit }), _jsx("td", { className: "p-2 text-right", children: r.quantity }), _jsxs("td", { className: "p-2 text-right", children: ["\u20AC", Number(r.pricePerUnit).toFixed(2)] }), _jsxs("td", { className: "p-2 text-right", children: ["\u20AC", Number(r.lineTotal).toFixed(2)] })] }, r.id))) })] }) }), wo.totalCost != null && (_jsxs("div", { className: "mt-3 p-3 bg-gray-100 rounded-lg flex justify-between items-center", children: [_jsx("span", { className: "font-semibold text-gray-900", children: "Grand total" }), _jsxs("span", { className: "text-lg font-bold", children: ["\u20AC", Number(wo.totalCost).toFixed(2)] })] })), wo.invoiceRows.some((r) => r.warningFlag) && (_jsx("p", { className: "text-xs text-amber-700 mt-2", children: "Rows in light red: item not in price list and/or quantity differs from technician report (review only)." }))] })), canAct && (_jsxs("section", { className: "space-y-4 border-t pt-4", children: [_jsx("h2", { className: "font-semibold text-gray-900", children: "Actions" }), _jsxs("div", { className: "grid gap-4 sm:grid-cols-1", children: [_jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4", children: [_jsx("h3", { className: "font-medium text-green-900 mb-2", children: "Approve Cost Proposal" }), _jsx("p", { className: "text-sm text-green-700 mb-3", children: "Finalize this cost proposal. Work order moves to approved/archived. Ticket may be archived when all WOs are closed." }), _jsx(Button, { type: "button", onClick: () => approveMutation.mutate(), disabled: approveMutation.isPending, children: approveMutation.isPending ? 'Approving...' : 'Approve Cost Proposal' })] }), _jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-lg p-4", children: [_jsx("h3", { className: "font-medium text-amber-900 mb-2", children: "Request Cost Revision" }), !showRevisionForm ? (_jsxs(_Fragment, { children: [_jsx("p", { className: "text-sm text-amber-700 mb-3", children: "Send back to S3 for changes. Comment is mandatory." }), _jsx(Button, { type: "button", variant: "secondary", onClick: () => setShowRevisionForm(true), children: "Request Cost Revision" })] })) : (_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "block text-sm font-medium text-amber-900", children: "Comment *" }), _jsx("textarea", { value: revisionComment, onChange: (e) => setRevisionComment(e.target.value), placeholder: "Explain what needs to be revised...", rows: 3, className: "w-full p-3 border border-gray-300 rounded-lg" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { type: "button", onClick: () => revisionMutation.mutate(), disabled: !revisionComment.trim() || revisionMutation.isPending, children: revisionMutation.isPending ? 'Sending...' : 'Send Revision Request' }), _jsx(Button, { type: "button", variant: "secondary", onClick: () => {
                                                                        setShowRevisionForm(false);
                                                                        setRevisionComment('');
                                                                    }, children: "Cancel" })] })] }))] }), _jsxs("div", { className: "bg-gray-100 border border-gray-200 rounded-lg p-4", children: [_jsx("h3", { className: "font-medium text-gray-900 mb-2", children: "Close Without Cost" }), !showCloseConfirm ? (_jsxs(_Fragment, { children: [_jsx("p", { className: "text-sm text-gray-700 mb-3", children: "No invoice required (e.g. warranty, internal decision). Terminal state." }), _jsx(Button, { type: "button", variant: "secondary", onClick: () => setShowCloseConfirm(true), children: "Close Without Cost" })] })) : (_jsxs("div", { className: "space-y-3", children: [_jsx("p", { className: "text-sm text-gray-700", children: "Are you sure? Status will be Closed Without Cost and the work order will be terminal." }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { type: "button", variant: "danger", onClick: () => closeWithoutCostMutation.mutate(), disabled: closeWithoutCostMutation.isPending, children: closeWithoutCostMutation.isPending ? 'Closing...' : 'Confirm Close Without Cost' }), _jsx(Button, { type: "button", variant: "secondary", onClick: () => setShowCloseConfirm(false), children: "Cancel" })] })] }))] })] })] })), wo.auditLog != null && wo.auditLog.length > 0 && (_jsxs("section", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "History" }), _jsx("div", { className: "space-y-2", children: wo.auditLog.map((entry) => (_jsxs("div", { className: "text-sm bg-gray-50 rounded-lg p-3", children: [_jsx("span", { className: "text-gray-600", children: new Date(entry.createdAt).toLocaleString() }), ' — ', _jsx("span", { className: "font-medium", children: entry.actionType }), entry.prevStatus != null && (_jsxs("span", { className: "text-gray-600", children: [" (", entry.prevStatus, " \u2192 ", entry.newStatus, ")"] })), _jsxs("p", { className: "mt-1 text-gray-600", children: ["Performed by ", entry.actorName, entry.actorRole != null ? ` (${entry.actorRole})` : ''] }), entry.comment != null && _jsxs("p", { className: "text-gray-600 mt-1", children: ["\"", entry.comment, "\""] })] }, entry.id))) })] })), (approveMutation.isError || revisionMutation.isError || closeWithoutCostMutation.isError) && (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: _jsx("p", { className: "text-sm text-red-700", children: approveMutation.error?.response?.data?.error ??
                                    revisionMutation.error?.response?.data?.error ??
                                    closeWithoutCostMutation.error?.response?.data?.error ??
                                    'Action failed' }) }))] })] }) }));
}
