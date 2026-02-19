import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Check-In Modal (S2) — Section 14.5, 18.7, 18.9
 * SM inputs number of technicians when generating check-in QR. S2 cannot change it:
 * - Confirm: check in with that number (scan QR / paste token).
 * - Return to store: send task back to SM so they can generate a new QR with the correct number.
 */
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { workOrdersAPI } from '../../../api/work-orders';
import { Button } from '../../../components/shared';
export function CheckInModal({ workOrderId, declaredTechCount, onClose, onSuccess, }) {
    const queryClient = useQueryClient();
    const [qrToken, setQrToken] = useState('');
    const [checkInSuccess, setCheckInSuccess] = useState(false);
    const checkInMutation = useMutation({
        mutationFn: workOrdersAPI.checkIn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['work-orders'] });
            queryClient.invalidateQueries({ queryKey: ['work-order', workOrderId] });
            setCheckInSuccess(true);
        },
    });
    const returnMutation = useMutation({
        mutationFn: () => workOrdersAPI.returnForTechCount(workOrderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['work-orders'] });
            queryClient.invalidateQueries({ queryKey: ['work-order', workOrderId] });
            onSuccess?.();
            onClose();
        },
    });
    const techCountValid = declaredTechCount != null && declaredTechCount >= 1;
    const canConfirm = techCountValid && qrToken.trim() !== '';
    const handleConfirm = () => {
        if (!canConfirm)
            return;
        checkInMutation.mutate({
            workOrderId,
            qrToken: qrToken.trim(),
            techCountConfirmed: declaredTechCount,
        });
    };
    const handleReturnToStore = () => {
        returnMutation.mutate();
    };
    const handleCloseAfterSuccess = () => {
        onSuccess?.();
        onClose();
    };
    if (checkInSuccess) {
        return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: _jsxs("div", { className: "bg-white rounded-lg max-w-md w-full", children: [_jsxs("div", { className: "p-6 border-b border-gray-200", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Check In" }), _jsxs("p", { className: "text-sm text-gray-600", children: ["WO #", workOrderId] })] }), _jsx("div", { className: "p-6 space-y-4", children: _jsx("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4", children: _jsx("p", { className: "text-sm text-green-800", children: "You are checked in now! When done with work, open the work order to fill out work specification and check out." }) }) }), _jsx("div", { className: "p-6 border-t border-gray-200", children: _jsx(Button, { type: "button", onClick: handleCloseAfterSuccess, className: "w-full", children: "Close" }) })] }) }));
    }
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: _jsxs("div", { className: "bg-white rounded-lg max-w-md w-full", children: [_jsxs("div", { className: "p-6 border-b border-gray-200", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Check In" }), _jsxs("p", { className: "text-sm text-gray-600", children: ["WO #", workOrderId] })] }), _jsxs("div", { className: "p-6 space-y-4", children: [_jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: _jsxs("p", { className: "text-sm text-blue-700", children: [_jsx("strong", { children: "Steps:" }), " The store has declared the number of technicians. You can ", _jsx("strong", { children: "confirm" }), " (scan QR and check in) or ", _jsx("strong", { children: "return to store" }), " so they can generate a new QR with the correct number."] }) }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Number of technicians (declared by store)" }), declaredTechCount != null && declaredTechCount >= 1 ? (_jsxs("p", { className: "p-3 bg-gray-100 rounded-lg text-gray-800 font-medium", children: [declaredTechCount, " \u2014 cannot be changed here. Return to store if incorrect."] })) : (_jsx("p", { className: "text-sm text-amber-700", children: "Store has not generated a QR yet. Ask the store to generate the check-in QR code (with technician count) first." }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "QR Code Token * (scan or paste)" }), _jsx("input", { type: "text", value: qrToken, onChange: (e) => setQrToken(e.target.value), placeholder: "Scan QR code or paste token from store...", className: "w-full p-3 border border-gray-300 rounded-lg", autoFocus: true, disabled: !techCountValid }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "You can scan the QR at the store or paste the token the store sent you. Token expires after 5 minutes." })] }), (checkInMutation.isError || returnMutation.isError) && (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: _jsx("p", { className: "text-sm text-red-700", children: (checkInMutation.error || returnMutation.error)?.response?.data?.error ??
                                    'Action failed' }) }))] }), _jsxs("div", { className: "p-6 border-t border-gray-200 flex flex-wrap gap-3", children: [_jsx(Button, { type: "button", variant: "secondary", onClick: onClose, children: "Cancel" }), declaredTechCount != null && declaredTechCount >= 1 && (_jsx(Button, { type: "button", variant: "secondary", onClick: handleReturnToStore, disabled: returnMutation.isPending || checkInMutation.isPending, children: returnMutation.isPending ? 'Returning...' : 'Return to store (correct number)' })), _jsx(Button, { type: "button", onClick: handleConfirm, disabled: !canConfirm || checkInMutation.isPending, className: "flex-1 min-w-0", children: checkInMutation.isPending ? 'Checking In...' : 'Confirm & Check In' })] })] }) }));
}
