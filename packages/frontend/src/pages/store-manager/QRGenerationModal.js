import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
/**
 * QR Generation Modal — Store Manager (Section 18)
 * Select WO (if multiple), enter declared technician count, generate QR.
 * Scan type derived from WO status: Accepted → check-in, Service In Progress → checkout.
 * QR auto-refreshes every 5 minutes (previous QR invalidated).
 */
import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { qrAPI } from '../../api/qr';
import { Button } from '../../components/shared';
const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes (Section 18.5)
export function QRGenerationModal({ ticketId, workOrders, onClose, }) {
    const [selectedWorkOrderId, setSelectedWorkOrderId] = useState(workOrders.length === 1 ? workOrders[0].id : null);
    const [techCount, setTechCount] = useState('');
    const [generated, setGenerated] = useState(null);
    const [copyFeedback, setCopyFeedback] = useState(false);
    const refreshTimerRef = useRef(null);
    const handleCopyToken = () => {
        if (generated?.qrToken == null)
            return;
        navigator.clipboard.writeText(generated.qrToken).then(() => {
            setCopyFeedback(true);
            setTimeout(() => setCopyFeedback(false), 2000);
        }).catch(() => { });
    };
    const generateMutation = useMutation({
        mutationFn: qrAPI.generate,
        onSuccess: (data, variables) => {
            setGenerated({
                qrToken: data.qrToken,
                expirationTs: data.expirationTs,
                workOrderId: variables.workOrderId,
            });
        },
    });
    const wo = selectedWorkOrderId
        ? workOrders.find((w) => w.id === selectedWorkOrderId)
        : null;
    const isCheckout = wo?.currentStatus === 'Service In Progress';
    const techCountNum = parseInt(techCount, 10);
    const isCheckIn = !isCheckout; // Service Visit Scheduled or Follow-Up Visit Requested
    const techCountOk = isCheckout || (!isNaN(techCountNum) && techCountNum >= 1);
    const canGenerate = wo != null &&
        techCountOk &&
        !generateMutation.isPending;
    const handleGenerate = () => {
        if (!canGenerate || !wo)
            return;
        generateMutation.mutate({
            workOrderId: wo.id,
            ...(isCheckIn ? { techCountConfirmed: techCountNum } : {}),
        });
    };
    // Auto-refresh QR every 5 minutes when a QR is displayed (Section 18.5)
    useEffect(() => {
        if (generated == null || !wo)
            return;
        const isCheckoutWo = wo.currentStatus === 'Service In Progress';
        const isCheckInWo = wo.currentStatus === 'Service Visit Scheduled' || wo.currentStatus === 'Follow-Up Visit Requested';
        if (!isCheckoutWo && !isCheckInWo)
            return;
        if (isCheckInWo && (isNaN(techCountNum) || techCountNum < 1))
            return;
        const workOrderId = wo.id;
        const count = techCountNum;
        refreshTimerRef.current = setTimeout(() => {
            generateMutation.mutate(isCheckoutWo ? { workOrderId } : { workOrderId, techCountConfirmed: count }, {
                onSuccess: (data) => {
                    setGenerated({
                        qrToken: data.qrToken,
                        expirationTs: data.expirationTs,
                        workOrderId,
                    });
                },
            });
        }, REFRESH_INTERVAL_MS);
        return () => {
            if (refreshTimerRef.current) {
                clearTimeout(refreshTimerRef.current);
                refreshTimerRef.current = null;
            }
        };
    }, [generated?.qrToken, wo?.id, techCountNum]);
    const handleClose = () => {
        if (refreshTimerRef.current) {
            clearTimeout(refreshTimerRef.current);
            refreshTimerRef.current = null;
        }
        setGenerated(null);
        setTechCount('');
        setSelectedWorkOrderId(workOrders.length === 1 ? workOrders[0].id : null);
        onClose();
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: _jsxs("div", { className: "bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: "p-6 border-b border-gray-200 flex justify-between items-center", children: [_jsxs("h2", { className: "text-xl font-bold text-gray-900", children: ["Generate QR \u2014 Ticket #", ticketId] }), _jsx("button", { type: "button", onClick: handleClose, className: "text-gray-400 hover:text-gray-600 text-2xl", "aria-label": "Close", children: "\u00D7" })] }), _jsxs("div", { className: "p-6 space-y-4", children: [workOrders.length > 1 && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Vendor (Work Order)" }), _jsxs("select", { value: selectedWorkOrderId ?? '', onChange: (e) => {
                                        setSelectedWorkOrderId(parseInt(e.target.value, 10));
                                        setGenerated(null);
                                    }, className: "w-full p-3 border border-gray-300 rounded-lg", children: [_jsx("option", { value: "", children: "\u2014 Select vendor \u2014" }), workOrders.map((w) => (_jsxs("option", { value: w.id, children: [w.vendorCompanyName, " \u2014 WO #", w.id] }, w.id)))] })] })), wo?.currentStatus !== 'Service In Progress' && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Number of technicians arrived *" }), _jsx("input", { type: "number", min: 1, value: techCount, onChange: (e) => setTechCount(e.target.value), placeholder: "e.g. 2", className: "w-full p-3 border border-gray-300 rounded-lg" })] })), generated == null ? (_jsx(Button, { type: "button", onClick: handleGenerate, disabled: !canGenerate, children: generateMutation.isPending ? 'Generating...' : 'Generate QR Code' })) : (_jsxs("div", { className: "space-y-4 pt-2", children: [_jsxs("p", { className: "text-sm text-green-700 font-medium", children: [wo?.currentStatus === 'Service In Progress'
                                            ? 'QR for check-out. '
                                            : 'QR for check-in. ', "Refreshes every 5 minutes; invalid after use."] }), _jsx("div", { className: "flex justify-center p-4 bg-gray-50 rounded-lg", children: _jsx(QRCodeSVG, { value: generated.qrToken, size: 200, level: "M" }) }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Text version (copy & paste)" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", readOnly: true, value: generated.qrToken, className: "flex-1 p-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono" }), _jsx(Button, { type: "button", variant: "secondary", size: "sm", onClick: handleCopyToken, children: copyFeedback ? 'Copied!' : 'Copy' })] }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Technician can scan the QR or paste this token manually." })] }), _jsxs("p", { className: "text-xs text-gray-500", children: ["Expires:", ' ', new Date(generated.expirationTs).toLocaleString()] }), _jsx(Button, { type: "button", variant: "secondary", onClick: () => setGenerated(null), children: "Generate another" })] })), generateMutation.isError && (_jsx("p", { className: "text-sm text-red-600", children: generateMutation.error instanceof Error
                                ? generateMutation.error.message
                                : 'Failed to generate QR' }))] }), _jsx("div", { className: "p-6 border-t border-gray-200", children: _jsx(Button, { type: "button", variant: "secondary", onClick: handleClose, className: "w-full", children: "Close" }) })] }) }));
}
