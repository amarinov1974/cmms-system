import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Assign Technician Modal (S1)
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workOrdersAPI } from '../../../api/work-orders';
import { apiClient } from '../../../api/client';
import { useSession } from '../../../contexts/SessionContext';
import { Button } from '../../../components/shared';
export function AssignTechnicianModal({ workOrderId, onClose, }) {
    const { session } = useSession();
    const queryClient = useQueryClient();
    const [selectedTechId, setSelectedTechId] = useState('');
    const [eta, setEta] = useState('');
    const { data: workOrder, isLoading: loadingWO } = useQuery({
        queryKey: ['work-order', workOrderId],
        queryFn: () => workOrdersAPI.getById(workOrderId),
    });
    const { data: technicians, isLoading: loadingTechs } = useQuery({
        queryKey: ['technicians', session?.companyId],
        queryFn: async () => {
            const { data } = await apiClient.get('/auth/users/vendor');
            return (data.users ?? []).filter((u) => u.role === 'S2' && u.vendorCompanyId === session?.companyId);
        },
        enabled: session?.companyId != null,
    });
    const assignMutation = useMutation({
        mutationFn: workOrdersAPI.assignTechnician,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['work-orders'] });
            onClose();
        },
    });
    const handleAssign = () => {
        if (!selectedTechId || !eta)
            return;
        assignMutation.mutate({
            workOrderId,
            technicianUserId: parseInt(selectedTechId, 10),
            eta,
        });
    };
    if (loadingWO || loadingTechs) {
        return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: _jsx("div", { className: "bg-white rounded-lg p-6", children: _jsx("p", { children: "Loading..." }) }) }));
    }
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: _jsxs("div", { className: "bg-white rounded-lg max-w-2xl w-full", children: [_jsx("div", { className: "p-6 border-b border-gray-200", children: _jsxs("h2", { className: "text-2xl font-bold text-gray-900", children: ["Assign Technician - WO #", workOrderId] }) }), _jsxs("div", { className: "p-6 space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Technician *" }), _jsxs("select", { value: selectedTechId, onChange: (e) => setSelectedTechId(e.target.value), className: "w-full p-3 border border-gray-300 rounded-lg", children: [_jsx("option", { value: "", children: "-- Select Technician --" }), technicians?.map((tech) => (_jsx("option", { value: tech.id, children: tech.name }, tech.id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Estimated Arrival Time *" }), _jsx("input", { type: "datetime-local", value: eta, onChange: (e) => setEta(e.target.value), className: "w-full p-3 border border-gray-300 rounded-lg" })] })] }), _jsxs("div", { className: "p-6 border-t border-gray-200 flex gap-3", children: [_jsx(Button, { type: "button", variant: "secondary", onClick: onClose, children: "Cancel" }), _jsx(Button, { type: "button", onClick: handleAssign, disabled: !selectedTechId || !eta || assignMutation.isPending, className: "flex-1", children: assignMutation.isPending ? 'Assigning...' : 'Assign Technician' })] }), assignMutation.isError && (_jsx("div", { className: "px-6 pb-6", children: _jsxs("p", { className: "text-red-600 text-sm", children: ["Error:", ' ', assignMutation.error?.response?.data?.error ??
                                'Failed to assign'] }) }))] }) }));
}
