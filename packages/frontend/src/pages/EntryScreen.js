import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Entry Screen
 * Demo login - select user type and user
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '../api/auth';
import { apiClient, SESSION_STORAGE_KEY } from '../api/client';
const INTERNAL_ROLE_ORDER = ['SM', 'AM', 'AMM', 'D', 'C2', 'BOD'];
function sortInternalUsers(users) {
    return [...users].sort((a, b) => {
        const roleIndexA = INTERNAL_ROLE_ORDER.indexOf(a.role);
        const roleIndexB = INTERNAL_ROLE_ORDER.indexOf(b.role);
        const roleA = roleIndexA === -1 ? 999 : roleIndexA;
        const roleB = roleIndexB === -1 ? 999 : roleIndexB;
        if (roleA !== roleB)
            return roleA - roleB;
        if (a.role === 'SM' && b.role === 'SM') {
            return (a.storeId ?? 0) - (b.storeId ?? 0);
        }
        return (a.name ?? '').localeCompare(b.name ?? '');
    });
}
const VENDOR_ROLE_ORDER = ['S1', 'S2', 'S3'];
function sortVendorUsers(users) {
    return [...users].sort((a, b) => {
        const roleIndexA = VENDOR_ROLE_ORDER.indexOf(a.role);
        const roleIndexB = VENDOR_ROLE_ORDER.indexOf(b.role);
        const roleA = roleIndexA === -1 ? 999 : roleIndexA;
        const roleB = roleIndexB === -1 ? 999 : roleIndexB;
        if (roleA !== roleB)
            return roleA - roleB;
        return (a.name ?? '').localeCompare(b.name ?? '');
    });
}
export function EntryScreen() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [userType, setUserType] = useState('INTERNAL');
    const [selectedUserId, setSelectedUserId] = useState(null);
    const { data: internalUsers, isLoading: internalLoading, isError: internalError, error: internalErrorDetail, refetch: refetchInternal, } = useQuery({
        queryKey: ['internal-users'],
        queryFn: authAPI.getInternalUsers,
        enabled: userType === 'INTERNAL',
    });
    const { data: vendorUsers, isLoading: vendorLoading, isError: vendorError, error: vendorErrorDetail, refetch: refetchVendor, } = useQuery({
        queryKey: ['vendor-users'],
        queryFn: authAPI.getVendorUsers,
        enabled: userType === 'VENDOR',
    });
    const usersLoading = userType === 'INTERNAL' ? internalLoading : vendorLoading;
    const usersError = userType === 'INTERNAL' ? internalError : vendorError;
    const usersErrorDetail = userType === 'INTERNAL' ? internalErrorDetail : vendorErrorDetail;
    const refetchUsers = userType === 'INTERNAL' ? refetchInternal : refetchVendor;
    const users = userType === 'INTERNAL'
        ? internalUsers != null
            ? sortInternalUsers(internalUsers)
            : undefined
        : vendorUsers != null
            ? sortVendorUsers(vendorUsers)
            : undefined;
    const loginMutation = useMutation({
        mutationFn: authAPI.demoLogin,
        onSuccess: async (data, variables) => {
            if (!data.success || !data.user)
                return;
            if (data.sessionId && typeof window !== 'undefined') {
                localStorage.setItem(SESSION_STORAGE_KEY, data.sessionId);
            }
            const user = data.user;
            const userType = variables.userType;
            const role = String(user.role ?? '').trim();
            if (!role) {
                console.error('Login response missing role', data);
                return;
            }
            queryClient.setQueryData(['session'], {
                session: {
                    userId: user.id,
                    userName: user.name,
                    role,
                    userType,
                    companyId: user.companyId,
                    companyName: user.companyName,
                    storeId: user.storeId,
                    storeName: user.storeName,
                    regionId: user.regionId,
                    regionName: user.regionName,
                },
            });
            if (role === 'SM')
                navigate('/store-manager');
            else if (role === 'AM')
                navigate('/area-manager');
            else if (role === 'AMM')
                navigate('/amm');
            else if (role === 'D' || role === 'C2' || role === 'BOD')
                navigate('/director');
            else if (role === 'S1')
                navigate('/vendor/s1');
            else if (role === 'S2')
                navigate('/vendor/s2');
            else if (role === 'S3')
                navigate('/vendor/s3');
            else
                navigate('/');
        },
    });
    const handleLogin = () => {
        if (selectedUserId == null)
            return;
        loginMutation.mutate({ userType, userId: selectedUserId });
    };
    const deleteAllMutation = useMutation({
        mutationFn: async () => {
            const { data } = await apiClient.post('/demo/delete-all-tickets');
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            queryClient.invalidateQueries({ queryKey: ['work-orders'] });
            alert(`Deleted ${data.deleted.tickets} ticket(s) and ${data.deleted.workOrders} work order(s).`);
        },
    });
    const handleDeleteAllTickets = () => {
        if (!window.confirm('Delete ALL tickets and work orders? This cannot be undone.'))
            return;
        deleteAllMutation.mutate();
    };
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 relative", children: [_jsx("button", { type: "button", onClick: handleDeleteAllTickets, disabled: deleteAllMutation.isPending, className: "fixed top-4 right-4 z-10 py-2 px-4 rounded-lg border-2 border-red-200 text-red-700 bg-red-50 font-medium hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm", children: deleteAllMutation.isPending ? 'Deleting...' : 'Delete all tickets' }), deleteAllMutation.isError && (_jsx("div", { className: "fixed top-14 right-4 z-10 max-w-xs text-red-600 text-sm bg-white border border-red-200 rounded-lg p-2 shadow", children: deleteAllMutation.error?.response?.data?.error ?? 'Failed to delete' })), _jsxs("div", { className: "bg-white rounded-lg shadow-xl p-8 max-w-md w-full", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-2", children: "CMMS System" }), _jsx("p", { className: "text-gray-600 mb-8", children: "Demo Login - Select User" }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "User Type" }), _jsxs("div", { className: "flex gap-4", children: [_jsx("button", { type: "button", onClick: () => {
                                            setUserType('INTERNAL');
                                            setSelectedUserId(null);
                                        }, className: `flex-1 py-2 px-4 rounded-lg border-2 transition ${userType === 'INTERNAL'
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-300 hover:border-gray-400'}`, children: "Internal User" }), _jsx("button", { type: "button", onClick: () => {
                                            setUserType('VENDOR');
                                            setSelectedUserId(null);
                                        }, className: `flex-1 py-2 px-4 rounded-lg border-2 transition ${userType === 'VENDOR'
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-300 hover:border-gray-400'}`, children: "Vendor User" })] })] }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Select User" }), usersLoading && (_jsx("p", { className: "text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-2", children: "Loading users\u2026" })), usersError && (_jsxs("div", { className: "text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 mb-2", children: [_jsx("p", { children: "Could not load users. Is the backend running at the API URL?" }), _jsx("p", { className: "mt-1 text-xs opacity-90", children: usersErrorDetail?.response?.data?.error ??
                                            usersErrorDetail?.message ??
                                            String(usersErrorDetail) }), _jsx("button", { type: "button", onClick: () => refetchUsers(), className: "mt-2 text-sm font-medium text-red-800 underline hover:no-underline", children: "Retry" })] })), !usersLoading && !usersError && Array.isArray(users) && users.length === 0 && (_jsxs("p", { className: "text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-2", children: ["No users in database. Run: ", _jsx("code", { className: "bg-amber-100 px-1 rounded", children: "npm run db:seed" }), " in the backend package."] })), _jsxs("select", { value: selectedUserId ?? '', onChange: (e) => setSelectedUserId(e.target.value ? Number(e.target.value) : null), disabled: usersLoading || usersError, className: "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed", children: [_jsx("option", { value: "", children: "-- Select a user --" }), users?.map((user) => (_jsxs("option", { value: user.id, children: [user.name, " (", user.role, ")", user.storeName != null ? ` - ${user.storeName}` : '', user.regionName != null ? ` - ${user.regionName}` : '', user.vendorCompanyName != null
                                                ? ` - ${user.vendorCompanyName}`
                                                : ''] }, user.id)))] })] }), _jsx("button", { type: "button", onClick: handleLogin, disabled: selectedUserId == null || loginMutation.isPending, className: "w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition", children: loginMutation.isPending ? 'Logging in...' : 'Login' }), loginMutation.isError && (_jsx("p", { className: "mt-4 text-red-600 text-sm text-center", children: "Login failed. Please try again." })), _jsx("p", { className: "mt-6 text-xs text-gray-500 text-center", children: "Demo Mode - No password required" })] })] }));
}
export default EntryScreen;
