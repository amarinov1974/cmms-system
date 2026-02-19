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
    submitUpdated: async (ticketId, updatedDescription, comment, assetId) => {
        const { data } = await apiClient.post(`/tickets/${ticketId}/submit-updated`, { updatedDescription, comment, assetId });
        return data;
    },
    withdraw: async (ticketId, reason) => {
        const { data } = await apiClient.post(`/tickets/${ticketId}/withdraw`, { reason });
        return data;
    },
    addComment: async (ticketId, text) => {
        await apiClient.post(`/tickets/${ticketId}/comments`, { text });
    },
    requestClarification: async (ticketId, comment, assignToRole) => {
        const { data } = await apiClient.post(`/tickets/${ticketId}/request-clarification`, { comment, assignToRole: assignToRole || 'SM' });
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
    /** Upload a file attachment to a ticket. */
    uploadAttachment: async (ticketId, file, internalFlag = true) => {
        const form = new FormData();
        form.append('file', file);
        form.append('internalFlag', String(internalFlag));
        const baseURL = import.meta.env.VITE_API_URL ?? '/api';
        const res = await fetch(`${baseURL}/tickets/${ticketId}/attachments`, {
            method: 'POST',
            credentials: 'include',
            body: form,
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: res.statusText }));
            throw new Error(err?.error ?? 'Upload failed');
        }
        return res.json();
    },
};
