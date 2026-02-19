import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Check-Out Modal (S2) — Section 14.9–14.10, 18.8, 18.9
 * 1. Select outcome (mandatory); 2. Comment if required; 3. Scan/paste QR.
 * Saves form state as draft when closing without submit.
 */
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { workOrdersAPI } from '../../../api/work-orders';
import { Button } from '../../../components/shared';
import { getS2WODraft, setS2WODraft } from './s2Draft';
export function CheckOutModal({ workOrderId, workReport, onClose, onSuccess, }) {
    const queryClient = useQueryClient();
    const draft = getS2WODraft(workOrderId);
    const [qrToken, setQrToken] = useState(draft?.qrToken ?? '');
    const [outcome, setOutcome] = useState(draft?.outcome ?? 'FIXED');
    const [comment, setComment] = useState(draft?.comment ?? '');
    const saveDraftOnClose = () => {
        setS2WODraft(workOrderId, { outcome, comment, qrToken });
        onClose();
    };
    const checkOutMutation = useMutation({
        mutationFn: workOrdersAPI.checkOut,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['work-orders'] });
            queryClient.invalidateQueries({ queryKey: ['work-order', workOrderId] });
            onSuccess?.();
            onClose();
        },
    });
    const commentRequired = outcome !== 'FIXED';
    const canSubmit = qrToken.trim() !== '' &&
        (!commentRequired || comment.trim() !== '') &&
        workReport.length > 0 &&
        workReport.every((r) => String(r.description).trim() !== '' &&
            String(r.unit).trim() !== '' &&
            Number(r.quantity) >= 0);
    const handleCheckOut = () => {
        if (!canSubmit)
            return;
        checkOutMutation.mutate({
            workOrderId,
            qrToken: qrToken.trim(),
            outcome,
            comment: comment.trim() || undefined,
            workReport: workReport.filter((r) => String(r.description).trim() !== '' &&
                String(r.unit).trim() !== '' &&
                Number(r.quantity) >= 0),
        });
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto", children: _jsxs("div", { className: "bg-white rounded-lg max-w-lg w-full my-8", children: [_jsxs("div", { className: "p-6 border-b border-gray-200", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Check Out" }), _jsxs("p", { className: "text-sm text-gray-600", children: ["WO #", workOrderId] })] }), _jsxs("div", { className: "p-6 space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Outcome *" }), _jsxs("select", { value: outcome, onChange: (e) => setOutcome(e.target.value), className: "w-full p-3 border border-gray-300 rounded-lg", children: [_jsx("option", { value: "FIXED", children: "Issue Fixed" }), _jsx("option", { value: "FOLLOW_UP", children: "Follow-Up Visit Needed" }), _jsx("option", { value: "NEW_WO_NEEDED", children: "New Work Order Needed" }), _jsx("option", { value: "UNSUCCESSFUL", children: "Repair Unsuccessful" })] })] }), commentRequired && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Comment * (required for this outcome)" }), _jsx("textarea", { value: comment, onChange: (e) => setComment(e.target.value), rows: 3, placeholder: "Explain...", className: "w-full p-3 border border-gray-300 rounded-lg" })] })), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "QR Code Token * (scan or paste)" }), _jsx("input", { type: "text", value: qrToken, onChange: (e) => setQrToken(e.target.value), placeholder: "Scan checkout QR or paste token from store...", className: "w-full p-3 border border-gray-300 rounded-lg" }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "You can scan the QR at the store or paste the token the store sent you." })] }), checkOutMutation.isError && (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: _jsx("p", { className: "text-sm text-red-700", children: checkOutMutation.error?.response?.data?.error ??
                                    'Check-out failed' }) }))] }), _jsxs("div", { className: "p-6 border-t border-gray-200 flex gap-3", children: [_jsx(Button, { type: "button", variant: "secondary", onClick: saveDraftOnClose, children: "Cancel" }), _jsx(Button, { type: "button", onClick: handleCheckOut, disabled: !canSubmit || checkOutMutation.isPending, className: "flex-1", children: checkOutMutation.isPending ? 'Checking Out...' : 'Check Out' })] })] }) }));
}
