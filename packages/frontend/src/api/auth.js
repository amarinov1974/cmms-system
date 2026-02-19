/**
 * Auth API
 */
import { apiClient, SESSION_STORAGE_KEY } from './client';
export const authAPI = {
    demoLogin: async (request) => {
        const { data } = await apiClient.post('/auth/demo-login', request);
        return data;
    },
    getSession: async () => {
        const { data } = await apiClient.get('/auth/session');
        return data;
    },
    logout: async () => {
        await apiClient.post('/auth/logout');
        if (typeof window !== 'undefined') {
            localStorage.removeItem(SESSION_STORAGE_KEY);
        }
    },
    getInternalUsers: async () => {
        const { data } = await apiClient.get('/auth/users/internal');
        return data.users;
    },
    getVendorUsers: async () => {
        const { data } = await apiClient.get('/auth/users/vendor');
        return data.users;
    },
};
