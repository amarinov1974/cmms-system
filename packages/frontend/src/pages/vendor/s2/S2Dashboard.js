import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * S2 (Technician) Dashboard
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { workOrdersAPI } from '../../../api/work-orders';
import { useSession } from '../../../contexts/SessionContext';
import { Layout, Card, Badge, Button } from '../../../components/shared';
import { CheckInModal } from './CheckInModal';
import { CheckOutModal } from './CheckOutModal';
export function S2Dashboard() {
    const { session } = useSession();
    const [selectedWOId, setSelectedWOId] = useState(null);
    const [modalType, setModalType] = useState(null);
    const { data: workOrders, isLoading } = useQuery({
        queryKey: ['work-orders', 's2', session?.userId],
        queryFn: () => workOrdersAPI.list({
            currentOwnerId: session.userId,
        }),
        enabled: session?.userId != null,
    });
    const openCheckIn = (woId) => {
        setSelectedWOId(woId);
        setModalType('checkin');
    };
    const openCheckOut = (woId) => {
        setSelectedWOId(woId);
        setModalType('checkout');
    };
    const closeModal = () => {
        setSelectedWOId(null);
        setModalType(null);
    };
    const getStatusBadgeVariant = (status) => {
        if (status.includes('Assigned'))
            return 'warning';
        if (status.includes('Progress'))
            return 'success';
        return 'default';
    };
    return (_jsxs(Layout, { children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Technician Dashboard" }), _jsx("p", { className: "text-gray-600", children: "My Assigned Work Orders" })] }), isLoading ? (_jsx(Card, { children: _jsx("p", { className: "text-gray-600", children: "Loading work orders..." }) })) : workOrders != null && workOrders.length > 0 ? (_jsx("div", { className: "space-y-4", children: workOrders.map((wo) => (_jsx(Card, { children: _jsx("div", { className: "flex justify-between items-start", children: _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900", children: ["Work Order #", wo.id] }), _jsx(Badge, { variant: getStatusBadgeVariant(wo.currentStatus), children: wo.currentStatus })] }), _jsxs("div", { className: "flex gap-4 text-sm text-gray-600 mb-3 flex-wrap", children: [_jsxs("span", { children: ["Ticket: #", wo.ticketId] }), wo.eta != null && (_jsxs(_Fragment, { children: [_jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["ETA: ", new Date(wo.eta).toLocaleString()] })] }))] }), wo.currentStatus === 'Accepted / Technician Assigned' && (_jsx(Button, { type: "button", size: "sm", onClick: () => openCheckIn(wo.id), children: "Check In (Scan QR)" })), wo.currentStatus === 'Service In Progress' && (_jsx(Button, { type: "button", size: "sm", onClick: () => openCheckOut(wo.id), children: "Check Out (Scan QR)" }))] }) }) }, wo.id))) })) : (_jsx(Card, { children: _jsx("div", { className: "text-center py-8", children: _jsx("p", { className: "text-gray-600", children: "No work orders assigned to you" }) }) }))] }), selectedWOId != null && modalType === 'checkin' && (_jsx(CheckInModal, { workOrderId: selectedWOId, onClose: closeModal })), selectedWOId != null && modalType === 'checkout' && (_jsx(CheckOutModal, { workOrderId: selectedWOId, onClose: closeModal }))] }));
}
