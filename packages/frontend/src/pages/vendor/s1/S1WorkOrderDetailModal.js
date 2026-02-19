import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * S1 Work Order Detail — Section 13.6–13.10
 * Read-only block; when Owner=S1 and Status=Awaiting Service Provider: Assign Technician, Return for Clarification, Reject.
 * Opening WO triggers read acknowledgment (recordOpened).
 */
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workOrdersAPI } from '../../../api/work-orders';
import { useSession } from '../../../contexts/SessionContext';
import { Button, Badge } from '../../../components/shared';
import { WorkOrderStatus } from '../../../types/statuses';
import { AssignTechnicianModal } from './AssignTechnicianModal';
export function S1WorkOrderDetailModal({ workOrderId, onClose, }) {
    const { session } = useSession();
    const queryClient = useQueryClient();
    const [showAssign, setShowAssign] = useState(false);
    const [returnComment, setReturnComment] = useState('');
    const [showReturnForm, setShowReturnForm] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);
    const { data: wo, isLoading } = useQuery({
        queryKey: ['work-order', workOrderId],
        queryFn: () => workOrdersAPI.getById(workOrderId),
        enabled: workOrderId > 0,
    });
    useEffect(() => {
        if (wo != null && workOrderId > 0) {
            workOrdersAPI.recordOpened(workOrderId).catch(() => { });
        }
    }, [workOrderId, wo]);
    const returnMutation = useMutation({
        mutationFn: () => workOrdersAPI.returnForClarification(workOrderId, returnComment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['work-orders'] });
            queryClient.invalidateQueries({ queryKey: ['work-order', workOrderId] });
            onClose();
        },
    });
    const rejectMutation = useMutation({
        mutationFn: () => workOrdersAPI.reject(workOrderId, rejectReason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['work-orders'] });
            onClose();
        },
    });
    const isOwner = session?.userId != null && wo?.currentOwnerId === session.userId;
    const isAwaitingProvider = wo?.currentStatus === WorkOrderStatus.CREATED;
    const canAct = isOwner && isAwaitingProvider;
    if (isLoading || wo == null) {
        return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: _jsx("div", { className: "bg-white rounded-lg p-6", children: _jsx("p", { children: "Loading work order..." }) }) }));
    }
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto", children: _jsxs("div", { className: "bg-white rounded-lg max-w-2xl w-full my-8", children: [_jsx("div", { className: "p-6 border-b border-gray-200", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold text-gray-900", children: "Work Order Detail" }), _jsxs("p", { className: "text-sm text-gray-600 mt-1", children: ["WO #", wo.id, " \u2022 Ticket #", wo.ticketId] }), _jsx(Badge, { variant: wo.urgent ? 'danger' : 'secondary', className: "mt-2", children: wo.urgent ? 'Urgent' : 'Non-Urgent' })] }), _jsx(Button, { type: "button", variant: "secondary", onClick: onClose, children: "Back" })] }) }), _jsxs("div", { className: "p-6 space-y-4 max-h-[70vh] overflow-y-auto", children: [_jsxs("section", { children: [_jsx("h2", { className: "font-semibold text-gray-900 mb-2", children: "Details" }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4 space-y-2 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Store:" }), ' ', wo.storeName ?? '—'] }), wo.storeAddress != null && wo.storeAddress !== '' && (_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Address:" }), ' ', wo.storeAddress] })), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Category:" }), ' ', wo.category ?? '—'] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "AMM comment:" }), ' ', wo.commentToVendor ?? '—'] }), wo.assetDescription != null && wo.assetDescription !== '' && (_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Asset:" }), ' ', wo.assetDescription] })), wo.attachments != null && wo.attachments.length > 0 && (_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Attachments:" }), _jsx("ul", { className: "list-disc list-inside mt-1", children: wo.attachments.map((a) => (_jsx("li", { children: a.fileName }, a.id))) })] })), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Current status:" }), ' ', _jsx("strong", { children: wo.currentStatus })] }), wo.assignedTechnicianId != null && (_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Assigned to (owner):" }), ' ', _jsx("strong", { children: wo.assignedTechnicianName ?? 'Technician' })] }))] })] }), canAct && (_jsxs("section", { className: "space-y-4 border-t pt-4", children: [_jsx("h2", { className: "font-semibold text-gray-900", children: "Actions" }), _jsx("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4", children: _jsx(Button, { type: "button", onClick: () => setShowAssign(true), className: "w-full", children: "Assign Technician" }) }), _jsx("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4", children: !showReturnForm ? (_jsx(Button, { type: "button", variant: "secondary", onClick: () => setShowReturnForm(true), className: "w-full", children: "Return for Clarification" })) : (_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Comment (mandatory)" }), _jsx("textarea", { value: returnComment, onChange: (e) => setReturnComment(e.target.value), placeholder: "Clarification needed...", rows: 3, className: "w-full p-3 border border-gray-300 rounded-lg" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { type: "button", onClick: () => returnMutation.mutate(), disabled: !returnComment.trim() || returnMutation.isPending, children: returnMutation.isPending
                                                                    ? 'Submitting...'
                                                                    : 'Confirm Return' }), _jsx(Button, { type: "button", variant: "secondary", onClick: () => {
                                                                    setShowReturnForm(false);
                                                                    setReturnComment('');
                                                                }, children: "Cancel" })] })] })) }), _jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: !showRejectForm ? (_jsx(Button, { type: "button", variant: "danger", onClick: () => setShowRejectForm(true), className: "w-full", children: "Reject Work Order" })) : (_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "block text-sm font-medium text-red-900", children: "Reason (mandatory)" }), _jsx("textarea", { value: rejectReason, onChange: (e) => setRejectReason(e.target.value), placeholder: "Reason for rejection...", rows: 3, className: "w-full p-3 border border-gray-300 rounded-lg" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { type: "button", variant: "danger", onClick: () => rejectMutation.mutate(), disabled: !rejectReason.trim() || rejectMutation.isPending, children: rejectMutation.isPending
                                                                    ? 'Rejecting...'
                                                                    : 'Confirm Rejection' }), _jsx(Button, { type: "button", variant: "secondary", onClick: () => {
                                                                    setShowRejectForm(false);
                                                                    setRejectReason('');
                                                                }, children: "Cancel" })] })] })) })] })), wo.auditLog != null && wo.auditLog.length > 0 && (_jsxs("section", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "History" }), _jsx("div", { className: "space-y-2", children: wo.auditLog.map((entry) => (_jsxs("div", { className: "text-sm bg-gray-50 rounded-lg p-3", children: [_jsx("span", { className: "text-gray-600", children: new Date(entry.createdAt).toLocaleString() }), ' — ', _jsx("span", { className: "font-medium", children: entry.actionType }), entry.prevStatus != null && (_jsxs("span", { className: "text-gray-600", children: [" (", entry.prevStatus, " \u2192 ", entry.newStatus, ")"] })), _jsxs("p", { className: "mt-1 text-gray-600", children: ["Performed by ", entry.actorName, entry.actorRole != null ? ` (${entry.actorRole})` : ''] }), entry.comment != null && _jsxs("p", { className: "text-gray-600 mt-1", children: ["\"", entry.comment, "\""] })] }, entry.id))) })] })), (returnMutation.isError || rejectMutation.isError) && (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: _jsx("p", { className: "text-sm text-red-700", children: returnMutation.error?.response?.data?.error ??
                                            rejectMutation.error?.response?.data?.error ??
                                            'Action failed' }) }))] })] }) }), showAssign && (_jsx(AssignTechnicianModal, { workOrderId: workOrderId, onClose: () => {
                    setShowAssign(false);
                    queryClient.invalidateQueries({ queryKey: ['work-orders'] });
                    queryClient.invalidateQueries({ queryKey: ['work-order', workOrderId] });
                    onClose();
                } }))] }));
}
