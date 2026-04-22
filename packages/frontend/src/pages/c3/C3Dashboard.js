import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * C3 Maintenance Admin Dashboard
 * Preventive Maintenance plan upload and management
 */
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout, Card, Button } from '../../components/shared';
import { preventiveMaintenanceAPI, } from '../../api/preventive-maintenance';
export function C3Dashboard() {
    const queryClient = useQueryClient();
    const fileInputRef = useRef(null);
    const [step, setStep] = useState('upload');
    const [parsedRows, setParsedRows] = useState([]);
    const [parseErrors, setParseErrors] = useState([]);
    const [importSummary, setImportSummary] = useState('');
    const [selectedPlanIds, setSelectedPlanIds] = useState(new Set());
    const { data: plans = [], isLoading: plansLoading } = useQuery({
        queryKey: ['preventive-maintenance-plans'],
        queryFn: preventiveMaintenanceAPI.listPlans,
    });
    const createWOMutation = useMutation({
        mutationFn: preventiveMaintenanceAPI.createWorkOrdersFromPlans,
        onSuccess: (result) => {
            setSelectedPlanIds(new Set());
            queryClient.invalidateQueries({ queryKey: ['preventive-maintenance-plans'] });
            queryClient.invalidateQueries({ queryKey: ['work-orders'] });
            alert(result.summary);
        },
    });
    const parseMutation = useMutation({
        mutationFn: preventiveMaintenanceAPI.parseFile,
        onSuccess: (result) => {
            setParsedRows(result.rows);
            setParseErrors(result.errors);
            setStep('preview');
        },
    });
    const importMutation = useMutation({
        mutationFn: preventiveMaintenanceAPI.importPlans,
        onSuccess: (result) => {
            setImportSummary(result.summary);
            setStep('success');
            queryClient.invalidateQueries({ queryKey: ['preventive-maintenance-plans'] });
        },
    });
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        parseMutation.mutate(file);
        e.target.value = '';
    };
    const handleConfirmImport = () => {
        if (parsedRows.length > 0) {
            importMutation.mutate(parsedRows);
        }
    };
    const togglePlanSelection = (id) => {
        setSelectedPlanIds((prev) => {
            const next = new Set(prev);
            if (next.has(id))
                next.delete(id);
            else
                next.add(id);
            return next;
        });
    };
    const toggleAllPlans = () => {
        const planIds = plans.map((p) => p.id);
        if (selectedPlanIds.size === planIds.length) {
            setSelectedPlanIds(new Set());
        }
        else {
            setSelectedPlanIds(new Set(planIds));
        }
    };
    const handleCreateWorkOrders = () => {
        if (selectedPlanIds.size === 0) {
            alert('Select at least one plan');
            return;
        }
        createWOMutation.mutate(Array.from(selectedPlanIds));
    };
    const handleReset = () => {
        setStep('upload');
        setParsedRows([]);
        setParseErrors([]);
        setImportSummary('');
        fileInputRef.current?.click();
    };
    return (_jsx(Layout, { children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Maintenance Admin (C3) Dashboard" }), _jsx("p", { className: "text-gray-600", children: "Upload and manage preventive maintenance plans" })] }), _jsxs(Card, { className: "bg-slate-50 border-slate-200", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-3", children: "Upload Preventive Maintenance Plan" }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Upload an Excel (.xlsx) or CSV file with columns: asset_name, task_description, vendor_company_id, vendor_user_id (optional), schedule_type (INTERVAL or SPECIFIC_DATES), interval_days (if INTERVAL), specific_dates (if SPECIFIC_DATES, comma-separated)" }), step === 'upload' && (_jsxs("div", { children: [_jsx("input", { ref: fileInputRef, type: "file", accept: ".xlsx,.xls,.csv", onChange: handleFileChange, className: "hidden" }), _jsx(Button, { type: "button", variant: "primary", onClick: () => fileInputRef.current?.click(), disabled: parseMutation.isPending, children: parseMutation.isPending ? 'Parsing...' : 'Choose File' }), parseMutation.isError && (_jsx("p", { className: "mt-2 text-red-600 text-sm", children: parseMutation.error
                                        ?.response?.data?.error ?? 'Parse failed' }))] })), step === 'preview' && (_jsxs("div", { children: [_jsxs("h3", { className: "font-medium text-gray-900 mb-2", children: ["Preview (", parsedRows.length, " row(s))"] }), parseErrors.length > 0 && (_jsx("div", { className: "mb-3 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm", children: parseErrors.map((err, i) => (_jsx("div", { children: err }, i))) })), _jsx("div", { className: "overflow-x-auto max-h-64 border rounded-lg mb-4", children: _jsxs("table", { className: "min-w-full text-sm", children: [_jsx("thead", { className: "bg-gray-100", children: _jsxs("tr", { children: [_jsx("th", { className: "px-2 py-1 text-left", children: "Asset" }), _jsx("th", { className: "px-2 py-1 text-left", children: "Task" }), _jsx("th", { className: "px-2 py-1 text-left", children: "Vendor Co ID" }), _jsx("th", { className: "px-2 py-1 text-left", children: "Schedule" }), _jsx("th", { className: "px-2 py-1 text-left", children: "Interval/Dates" })] }) }), _jsx("tbody", { children: parsedRows.map((row, i) => (_jsxs("tr", { className: "border-t", children: [_jsx("td", { className: "px-2 py-1", children: row.asset_name }), _jsx("td", { className: "px-2 py-1 max-w-[200px] truncate", children: row.task_description }), _jsx("td", { className: "px-2 py-1", children: row.vendor_company_id }), _jsx("td", { className: "px-2 py-1", children: row.schedule_type }), _jsx("td", { className: "px-2 py-1", children: row.schedule_type === 'INTERVAL'
                                                                ? `${row.interval_days} days`
                                                                : row.specific_dates })] }, i))) })] }) }), _jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { type: "button", variant: "primary", onClick: handleConfirmImport, disabled: parsedRows.length === 0 || importMutation.isPending, children: importMutation.isPending ? 'Importing...' : 'Confirm Import' }), _jsx(Button, { type: "button", variant: "secondary", onClick: handleReset, children: "Cancel" })] }), importMutation.isError && (_jsx("p", { className: "mt-2 text-red-600 text-sm", children: importMutation.error
                                        ?.response?.data?.error ?? 'Import failed' }))] })), step === 'success' && (_jsxs("div", { children: [_jsx("p", { className: "text-green-700 font-medium mb-2", children: importSummary }), _jsx(Button, { type: "button", variant: "primary", onClick: handleReset, children: "Upload Another File" })] }))] }), _jsxs(Card, { children: [_jsxs("h2", { className: "text-lg font-semibold text-gray-900 mb-3", children: ["Existing Plans (", plans.length, ")"] }), plansLoading ? (_jsx("p", { className: "text-gray-600", children: "Loading..." })) : plans.length === 0 ? (_jsx("p", { className: "text-gray-500 text-sm", children: "No preventive maintenance plans yet. Upload a file above." })) : (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between gap-3 mb-3", children: [_jsx("button", { type: "button", onClick: toggleAllPlans, className: "text-sm text-blue-600 hover:underline", children: selectedPlanIds.size === plans.length
                                                ? 'Deselect all'
                                                : 'Select all' }), _jsx(Button, { type: "button", variant: "primary", onClick: handleCreateWorkOrders, disabled: selectedPlanIds.size === 0 || createWOMutation.isPending, children: createWOMutation.isPending
                                                ? 'Creating...'
                                                : `Create Work Orders (${selectedPlanIds.size} selected)` })] }), createWOMutation.isError && (_jsx("p", { className: "mb-2 text-red-600 text-sm", children: createWOMutation.error
                                        ?.response?.data?.error ?? 'Failed' })), _jsx("div", { className: "overflow-x-auto max-h-80 border rounded-lg", children: _jsxs("table", { className: "min-w-full text-sm", children: [_jsx("thead", { className: "bg-gray-100", children: _jsxs("tr", { children: [_jsx("th", { className: "px-2 py-1 w-8", children: _jsx("input", { type: "checkbox", checked: plans.length > 0 &&
                                                                    selectedPlanIds.size === plans.length, onChange: toggleAllPlans, className: "rounded" }) }), _jsx("th", { className: "px-2 py-1 text-left", children: "Asset" }), _jsx("th", { className: "px-2 py-1 text-left", children: "Task" }), _jsx("th", { className: "px-2 py-1 text-left", children: "Vendor" }), _jsx("th", { className: "px-2 py-1 text-left", children: "Schedule" })] }) }), _jsx("tbody", { children: plans.map((p) => (_jsxs("tr", { className: "border-t", children: [_jsx("td", { className: "px-2 py-1", children: _jsx("input", { type: "checkbox", checked: selectedPlanIds.has(p.id), onChange: () => togglePlanSelection(p.id), className: "rounded" }) }), _jsx("td", { className: "px-2 py-1", children: p.assetName }), _jsx("td", { className: "px-2 py-1 max-w-[200px] truncate", children: p.taskDescription }), _jsx("td", { className: "px-2 py-1", children: p.vendorCompany?.name ?? '-' }), _jsx("td", { className: "px-2 py-1", children: p.scheduleType })] }, p.id))) })] }) })] }))] })] }) }));
}
