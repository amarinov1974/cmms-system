import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Check-Out Modal (S2)
 */
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { workOrdersAPI, } from '../../../api/work-orders';
import { Button } from '../../../components/shared';
export function CheckOutModal({ workOrderId, onClose }) {
    const queryClient = useQueryClient();
    const [qrToken, setQrToken] = useState('');
    const [outcome, setOutcome] = useState('FIXED');
    const [comment, setComment] = useState('');
    const [workReport, setWorkReport] = useState([
        { description: '', unit: 'hours', quantity: 1 },
    ]);
    const checkOutMutation = useMutation({
        mutationFn: workOrdersAPI.checkOut,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['work-orders'] });
            onClose();
        },
    });
    const addWorkRow = () => {
        setWorkReport([
            ...workReport,
            { description: '', unit: 'hours', quantity: 1 },
        ]);
    };
    const updateWorkRow = (index, field, value) => {
        const updated = [...workReport];
        updated[index] = { ...updated[index], [field]: value };
        setWorkReport(updated);
    };
    const handleCheckOut = () => {
        if (!qrToken.trim())
            return;
        if (outcome !== 'FIXED' && !comment.trim()) {
            alert('Comment required for non-FIXED outcomes');
            return;
        }
        checkOutMutation.mutate({
            workOrderId,
            qrToken: qrToken.trim(),
            outcome,
            comment: comment.trim() || undefined,
            workReport: workReport.filter((r) => r.description.trim()),
        });
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto", children: _jsxs("div", { className: "bg-white rounded-lg max-w-2xl w-full my-8", children: [_jsxs("div", { className: "p-6 border-b border-gray-200", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Check Out" }), _jsxs("p", { className: "text-sm text-gray-600", children: ["WO #", workOrderId] })] }), _jsxs("div", { className: "p-6 space-y-4 max-h-[60vh] overflow-y-auto", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "QR Code Token *" }), _jsx("input", { type: "text", value: qrToken, onChange: (e) => setQrToken(e.target.value), placeholder: "Scan checkout QR code...", className: "w-full p-3 border border-gray-300 rounded-lg" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Outcome *" }), _jsxs("select", { value: outcome, onChange: (e) => setOutcome(e.target.value), className: "w-full p-3 border border-gray-300 rounded-lg", children: [_jsx("option", { value: "FIXED", children: "Fixed - Issue Resolved" }), _jsx("option", { value: "FOLLOW_UP", children: "Follow-Up Visit Needed" }), _jsx("option", { value: "NEW_WO_NEEDED", children: "New Work Order Needed" }), _jsx("option", { value: "UNSUCCESSFUL", children: "Repair Unsuccessful" })] })] }), outcome !== 'FIXED' && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Comment * (Required for non-FIXED outcomes)" }), _jsx("textarea", { value: comment, onChange: (e) => setComment(e.target.value), rows: 3, placeholder: "Explain what happened...", className: "w-full p-3 border border-gray-300 rounded-lg" })] })), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Work Report" }), workReport.map((row, index) => (_jsxs("div", { className: "flex gap-2 mb-2", children: [_jsx("input", { type: "text", value: row.description, onChange: (e) => updateWorkRow(index, 'description', e.target.value), placeholder: "Work performed", className: "flex-1 p-2 border border-gray-300 rounded-lg" }), _jsx("input", { type: "text", value: row.unit, onChange: (e) => updateWorkRow(index, 'unit', e.target.value), placeholder: "Unit", className: "w-24 p-2 border border-gray-300 rounded-lg" }), _jsx("input", { type: "number", value: row.quantity, onChange: (e) => updateWorkRow(index, 'quantity', parseFloat(e.target.value) || 0), min: 0, step: 0.1, className: "w-24 p-2 border border-gray-300 rounded-lg" })] }, index))), _jsx(Button, { type: "button", size: "sm", variant: "secondary", onClick: addWorkRow, children: "+ Add Row" })] }), checkOutMutation.isError && (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: _jsxs("p", { className: "text-sm text-red-700", children: ["Error:", ' ', checkOutMutation.error?.response?.data?.error ??
                                        'Check-out failed'] }) }))] }), _jsxs("div", { className: "p-6 border-t border-gray-200 flex gap-3", children: [_jsx(Button, { type: "button", variant: "secondary", onClick: onClose, children: "Cancel" }), _jsx(Button, { type: "button", onClick: handleCheckOut, disabled: !qrToken.trim() || checkOutMutation.isPending, className: "flex-1", children: checkOutMutation.isPending ? 'Checking Out...' : 'Check Out' })] })] }) }));
}
