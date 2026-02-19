/**
 * Work Orders API (Extended)
 */
import { apiClient } from './client';
export const workOrdersAPI = {
    list: async (params) => {
        const { data } = await apiClient.get('/work-orders', { params });
        return data.workOrders;
    },
    getById: async (id) => {
        const { data } = await apiClient.get(`/work-orders/${id}`);
        return data;
    },
    create: async (request) => {
        const { data } = await apiClient.post(`/tickets/${request.ticketId}/create-work-order`, {
            ticketId: request.ticketId,
            vendorCompanyId: request.vendorCompanyId,
            description: request.description,
        });
        return data;
    },
    assignTechnician: async (request) => {
        const { data } = await apiClient.post(`/work-orders/${request.workOrderId}/assign-technician`, {
            technicianUserId: request.technicianUserId,
            eta: request.eta,
        });
        return data;
    },
    checkIn: async (request) => {
        const { data } = await apiClient.post(`/work-orders/${request.workOrderId}/checkin`, { qrToken: request.qrToken });
        return data;
    },
    checkOut: async (request) => {
        const { data } = await apiClient.post(`/work-orders/${request.workOrderId}/checkout`, {
            qrToken: request.qrToken,
            outcome: request.outcome,
            comment: request.comment,
            workReport: request.workReport,
        });
        return data;
    },
    submitCostProposal: async (request) => {
        const { data } = await apiClient.post(`/work-orders/${request.workOrderId}/submit-cost-proposal`, { invoiceRows: request.invoiceRows });
        return data;
    },
};
