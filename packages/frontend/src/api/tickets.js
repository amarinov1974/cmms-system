/**
 * Tickets API
 */
import { apiClient } from './client';
export const ticketsAPI = {
    list: async (params) => {
        const { data } = await apiClient.get('/tickets', {
            params,
        });
        return data.tickets;
    },
    getById: async (id) => {
        const { data } = await apiClient.get(`/tickets/${id}`);
        return data;
    },
    create: async (request) => {
        const { data } = await apiClient.post('/tickets', request);
        return data;
    },
    submit: async (ticketId) => {
        const { data } = await apiClient.post(`/tickets/${ticketId}/submit`);
        return data;
    },
    submitUpdated: async (ticketId, updatedDescription, comment) => {
        const { data } = await apiClient.post(`/tickets/${ticketId}/submit-updated`, { updatedDescription, comment });
        return data;
    },
    withdraw: async (ticketId, reason) => {
        const { data } = await apiClient.post(`/tickets/${ticketId}/withdraw`, { reason });
        return data;
    },
    addComment: async (ticketId, text) => {
        await apiClient.post(`/tickets/${ticketId}/comments`, { text });
    },
    requestClarification: async (ticketId, comment) => {
        const { data } = await apiClient.post(`/tickets/${ticketId}/request-clarification`, { comment });
        return data;
    },
    reject: async (ticketId, reason) => {
        const { data } = await apiClient.post(`/tickets/${ticketId}/reject`, { reason });
        return data;
    },
    submitCostEstimation: async (ticketId, estimatedAmount) => {
        const { data } = await apiClient.post(`/tickets/${ticketId}/submit-cost-estimation`, { estimatedAmount });
        return data;
    },
    archive: async (ticketId) => {
        const { data } = await apiClient.post(`/tickets/${ticketId}/archive`);
        return data;
    },
    approveForEstimation: async (ticketId) => {
        const { data } = await apiClient.post(`/tickets/${ticketId}/approve-for-estimation`);
        return data;
    },
    approveCostEstimation: async (ticketId, comment) => {
        const { data } = await apiClient.post(`/tickets/${ticketId}/approve-cost-estimation`, { comment });
        return data;
    },
    returnCostEstimation: async (ticketId, comment) => {
        const { data } = await apiClient.post(`/tickets/${ticketId}/return-cost-estimation`, { comment });
        return data;
    },
};
