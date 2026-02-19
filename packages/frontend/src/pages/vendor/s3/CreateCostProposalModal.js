import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Create Cost Proposal Modal (S3)
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workOrdersAPI } from '../../../api/work-orders';
import { Button } from '../../../components/shared';
export function CreateCostProposalModal({ workOrderId, onClose, }) {
    const queryClient = useQueryClient();
    const [invoiceRows, setInvoiceRows] = useState([
        {
            description: 'Service call / arrival fee',
            unit: 'fixed',
            quantity: 1,
            pricePerUnit: 50,
        },
        { description: 'Labor', unit: 'hours', quantity: 2, pricePerUnit: 75 },
    ]);
    const { data: workOrder, isLoading } = useQuery({
        queryKey: ['work-order', workOrderId],
        queryFn: () => workOrdersAPI.getById(workOrderId),
    });
    const submitMutation = useMutation({
        mutationFn: workOrdersAPI.submitCostProposal,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['work-orders'] });
            onClose();
        },
    });
    const addInvoiceRow = () => {
        setInvoiceRows([
            ...invoiceRows,
            { description: '', unit: 'units', quantity: 1, pricePerUnit: 0 },
        ]);
    };
    const updateInvoiceRow = (index, field, value) => {
        const updated = [...invoiceRows];
        updated[index] = { ...updated[index], [field]: value };
        setInvoiceRows(updated);
    };
    const removeInvoiceRow = (index) => {
        setInvoiceRows(invoiceRows.filter((_, i) => i !== index));
    };
    const calculateTotal = () => {
        return invoiceRows.reduce((sum, row) => sum + row.quantity * row.pricePerUnit, 0);
    };
    const handleSubmit = () => {
        const validRows = invoiceRows.filter((r) => r.description.trim() && r.pricePerUnit > 0);
        if (validRows.length === 0) {
            alert('Add at least one invoice row');
            return;
        }
        submitMutation.mutate({
            workOrderId,
            invoiceRows: validRows,
        });
    };
    if (isLoading || workOrder == null) {
        return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: _jsx("div", { className: "bg-white rounded-lg p-6", children: _jsx("p", { children: "Loading..." }) }) }));
    }
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto", children: _jsxs("div", { className: "bg-white rounded-lg max-w-4xl w-full my-8", children: [_jsxs("div", { className: "p-6 border-b border-gray-200", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Create Cost Proposal" }), _jsxs("p", { className: "text-sm text-gray-600", children: ["WO #", workOrderId] })] }), _jsxs("div", { className: "p-6 space-y-6 max-h-[60vh] overflow-y-auto", children: [workOrder.workReport != null && workOrder.workReport.length > 0 && (_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "Work Performed" }), _jsx("div", { className: "bg-gray-50 rounded-lg p-4", children: workOrder.workReport.map((row, idx) => (_jsxs("div", { className: "text-sm text-gray-700", children: [row.description, " - ", row.quantity, " ", row.unit] }, idx))) })] })), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "Invoice Line Items" }), _jsx("div", { className: "space-y-2", children: invoiceRows.map((row, index) => (_jsxs("div", { className: "flex gap-2 items-start", children: [_jsx("input", { type: "text", value: row.description, onChange: (e) => updateInvoiceRow(index, 'description', e.target.value), placeholder: "Description", className: "flex-1 p-2 border border-gray-300 rounded-lg" }), _jsx("input", { type: "text", value: row.unit, onChange: (e) => updateInvoiceRow(index, 'unit', e.target.value), placeholder: "Unit", className: "w-24 p-2 border border-gray-300 rounded-lg" }), _jsx("input", { type: "number", value: row.quantity, onChange: (e) => updateInvoiceRow(index, 'quantity', parseFloat(e.target.value) || 0), min: 0, step: 0.1, placeholder: "Qty", className: "w-24 p-2 border border-gray-300 rounded-lg" }), _jsx("input", { type: "number", value: row.pricePerUnit, onChange: (e) => updateInvoiceRow(index, 'pricePerUnit', parseFloat(e.target.value) || 0), min: 0, step: 0.01, placeholder: "Price", className: "w-28 p-2 border border-gray-300 rounded-lg" }), _jsxs("div", { className: "w-28 p-2 text-right font-medium", children: ["\u20AC", (row.quantity * row.pricePerUnit).toFixed(2)] }), _jsx("button", { type: "button", onClick: () => removeInvoiceRow(index), className: "text-red-600 hover:text-red-800", "aria-label": "Remove row", children: "\u2715" })] }, index))) }), _jsx(Button, { type: "button", size: "sm", variant: "secondary", onClick: addInvoiceRow, className: "mt-2", children: "+ Add Line Item" })] }), _jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "font-semibold text-gray-900", children: "Total Cost:" }), _jsxs("span", { className: "text-2xl font-bold text-blue-900", children: ["\u20AC", calculateTotal().toFixed(2)] })] }) }), submitMutation.isError && (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: _jsxs("p", { className: "text-sm text-red-700", children: ["Error:", ' ', submitMutation.error?.response?.data?.error ??
                                        'Failed to submit'] }) }))] }), _jsxs("div", { className: "p-6 border-t border-gray-200 flex gap-3", children: [_jsx(Button, { type: "button", variant: "secondary", onClick: onClose, children: "Cancel" }), _jsx(Button, { type: "button", onClick: handleSubmit, disabled: submitMutation.isPending, className: "flex-1", children: submitMutation.isPending
                                ? 'Submitting...'
                                : 'Submit Cost Proposal' })] })] }) }));
}
