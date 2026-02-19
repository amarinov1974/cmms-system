import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Check-In Modal (S2)
 */
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { workOrdersAPI } from '../../../api/work-orders';
import { Button } from '../../../components/shared';
export function CheckInModal({ workOrderId, onClose }) {
    const queryClient = useQueryClient();
    const [qrToken, setQrToken] = useState('');
    const checkInMutation = useMutation({
        mutationFn: workOrdersAPI.checkIn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['work-orders'] });
            onClose();
        },
    });
    const handleCheckIn = () => {
        if (!qrToken.trim())
            return;
        checkInMutation.mutate({
            workOrderId,
            qrToken: qrToken.trim(),
        });
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: _jsxs("div", { className: "bg-white rounded-lg max-w-md w-full", children: [_jsxs("div", { className: "p-6 border-b border-gray-200", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Check In" }), _jsxs("p", { className: "text-sm text-gray-600", children: ["WO #", workOrderId] })] }), _jsxs("div", { className: "p-6 space-y-4", children: [_jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: _jsxs("p", { className: "text-sm text-blue-700", children: [_jsx("strong", { children: "Instructions:" }), " The Store Manager will generate a QR code. Scan it or enter the code manually below."] }) }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "QR Code Token *" }), _jsx("input", { type: "text", value: qrToken, onChange: (e) => setQrToken(e.target.value), placeholder: "Enter QR token or scan...", className: "w-full p-3 border border-gray-300 rounded-lg", autoFocus: true }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "QR codes expire after 5 minutes" })] }), checkInMutation.isError && (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: _jsxs("p", { className: "text-sm text-red-700", children: ["Error:", ' ', checkInMutation.error?.response?.data?.error ??
                                        'Check-in failed'] }) }))] }), _jsxs("div", { className: "p-6 border-t border-gray-200 flex gap-3", children: [_jsx(Button, { type: "button", variant: "secondary", onClick: onClose, children: "Cancel" }), _jsx(Button, { type: "button", onClick: handleCheckIn, disabled: !qrToken.trim() || checkInMutation.isPending, className: "flex-1", children: checkInMutation.isPending ? 'Checking In...' : 'Check In' })] })] }) }));
}
