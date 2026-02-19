import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Ticket Submit Screen (Section 8)
 * Accessible by Store Manager (store fixed) and AMM (with store selector).
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ticketsAPI } from '../api/tickets';
import { storesAPI } from '../api/stores';
import { assetsAPI } from '../api/assets';
import { useSession } from '../contexts/SessionContext';
import { Layout, Button, Card } from '../components/shared';
const CATEGORIES = [
    { value: 'ELECTRICAL_INSTALLATIONS', label: 'Electrical Installations' },
    { value: 'HEATING_VENTILATION_AIR_CONDITIONING', label: 'Heating, Ventilation and Air Conditioning' },
    { value: 'REFRIGERATION', label: 'Refrigeration' },
    { value: 'KITCHEN_EQUIPMENT', label: 'Kitchen Equipment' },
    { value: 'ELEVATORS', label: 'Elevators' },
    { value: 'AUTOMATIC_DOORS', label: 'Automatic Doors' },
    { value: 'FIRE_PROTECTION_SYSTEM', label: 'Fire Protection System' },
    { value: 'WATER_AND_SEWAGE', label: 'Water and Sewage' },
    { value: 'CONSTRUCTION_WORKS', label: 'Construction Works' },
    { value: 'HYGIENE', label: 'Hygiene' },
    { value: 'ENVIRONMENTAL', label: 'Environmental' },
    { value: 'OTHER', label: 'Other' },
];
export function SubmitTicketPage({ backLink, backLabel = 'Back' }) {
    const { session } = useSession();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [storeId, setStoreId] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [urgent, setUrgent] = useState(false);
    const [assetIdInput, setAssetIdInput] = useState('');
    const [assetLookupMessage, setAssetLookupMessage] = useState(null);
    const [assetDescription, setAssetDescription] = useState(null);
    const [showSuccess, setShowSuccess] = useState(null);
    const [isSending, setIsSending] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [validationError, setValidationError] = useState('');
    const [submitError, setSubmitError] = useState('');
    const onNavigateRef = useRef(() => navigate(backLink));
    const fileInputRef = useRef(null);
    onNavigateRef.current = () => navigate(backLink);
    const isSM = session?.role === 'SM';
    const isAMM = session?.role === 'AMM';
    const { data: stores = [] } = useQuery({
        queryKey: ['stores'],
        queryFn: storesAPI.list,
        enabled: isAMM,
    });
    useEffect(() => {
        if (isSM && session?.storeId != null) {
            setStoreId(session.storeId);
        }
        if (isAMM && stores.length === 1) {
            setStoreId(stores[0].id);
        }
    }, [isSM, isAMM, session?.storeId, stores]);
    useEffect(() => {
        if (showSuccess == null)
            return;
        const t = setTimeout(() => {
            onNavigateRef.current();
        }, 2000);
        return () => clearTimeout(t);
    }, [showSuccess]);
    const createMutation = useMutation({
        mutationFn: ticketsAPI.create,
    });
    const isBusy = createMutation.isPending || isSending;
    const validate = () => {
        setValidationError('');
        if (isAMM && (storeId === '' || storeId == null)) {
            setValidationError('Please select a store.');
            return false;
        }
        if (!category.trim()) {
            setValidationError('Please select a category.');
            return false;
        }
        if (!description.trim()) {
            setValidationError('Please enter a description.');
            return false;
        }
        return true;
    };
    const resolvedStoreId = isSM ? session?.storeId : (storeId === '' ? null : Number(storeId));
    const handleLookupAsset = async () => {
        const id = parseInt(assetIdInput.trim(), 10);
        if (Number.isNaN(id) || id < 1) {
            setAssetLookupMessage(null);
            setAssetDescription(null);
            return;
        }
        setAssetLookupMessage('idle');
        try {
            const asset = await assetsAPI.getById(id);
            if (asset) {
                setAssetDescription(asset.description);
                setAssetLookupMessage('found');
            }
            else {
                setAssetDescription(null);
                setAssetLookupMessage('notfound');
            }
        }
        catch {
            setAssetDescription(null);
            setAssetLookupMessage('notfound');
        }
    };
    const uploadFilesToTicket = async (ticketId) => {
        for (const file of selectedFiles) {
            await ticketsAPI.uploadAttachment(ticketId, file, false);
        }
    };
    const handleSaveDraft = async () => {
        setSubmitError('');
        if (resolvedStoreId == null || !validate())
            return;
        try {
            const ticket = await createMutation.mutateAsync({
                storeId: resolvedStoreId,
                category,
                description,
                urgent,
                assetId: (() => {
                    const id = parseInt(assetIdInput.trim(), 10);
                    return Number.isNaN(id) || id < 1 ? undefined : id;
                })(),
            });
            if (selectedFiles.length > 0)
                await uploadFilesToTicket(ticket.id);
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            setShowSuccess('draft');
        }
        catch {
            // Error via createMutation.isError
        }
    };
    const handleSubmitTicket = async () => {
        setSubmitError('');
        if (resolvedStoreId == null || !validate())
            return;
        setIsSending(true);
        try {
            const ticket = await createMutation.mutateAsync({
                storeId: resolvedStoreId,
                category,
                description,
                urgent,
                assetId: (() => {
                    const id = parseInt(assetIdInput.trim(), 10);
                    return Number.isNaN(id) || id < 1 ? undefined : id;
                })(),
            });
            if (selectedFiles.length > 0)
                await uploadFilesToTicket(ticket.id);
            try {
                await ticketsAPI.submit(ticket.id);
            }
            catch (err) {
                const msg = err?.response?.data?.error ?? 'Failed to submit ticket';
                setSubmitError(msg);
                return;
            }
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            setShowSuccess('submitted');
        }
        catch {
            //
        }
        finally {
            setIsSending(false);
        }
    };
    if (showSuccess != null) {
        return (_jsx(Layout, { screenTitle: "Submit Ticket", backLink: backLink, backLabel: backLabel, children: _jsx(Card, { className: "max-w-xl mx-auto text-center", children: _jsxs("div", { className: "bg-green-100 border-2 border-green-500 rounded-lg p-6", children: [_jsx("p", { className: "text-green-800 font-semibold text-xl mb-2", children: showSuccess === 'draft'
                                ? '✓ Ticket saved as draft.'
                                : '✓ Ticket submitted.' }), _jsx("p", { className: "text-green-700 text-sm", children: "Returning to dashboard in 2 seconds..." })] }) }) }));
    }
    return (_jsx(Layout, { screenTitle: "Submit Ticket", backLink: backLink, backLabel: backLabel, children: _jsx(Card, { className: "max-w-2xl mx-auto", children: _jsxs("form", { onSubmit: (e) => e.preventDefault(), className: "space-y-6", children: [isAMM && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Store *" }), _jsxs("select", { value: storeId === '' ? '' : String(storeId), onChange: (e) => setStoreId(e.target.value === '' ? '' : parseInt(e.target.value, 10)), required: true, className: "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", children: [_jsx("option", { value: "", children: "\u2014 Select store \u2014" }), stores.map((s) => (_jsx("option", { value: s.id, children: s.name }, s.id)))] })] })), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Category *" }), _jsxs("select", { value: category, onChange: (e) => setCategory(e.target.value), required: true, className: "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", children: [_jsx("option", { value: "", children: "\u2014 Select Category \u2014" }), CATEGORIES.map((cat) => (_jsx("option", { value: cat.value, children: cat.label }, cat.value)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Description *" }), _jsx("textarea", { value: description, onChange: (e) => setDescription(e.target.value), required: true, rows: 6, placeholder: "Describe the observed issue, context, and findings in your own words...", className: "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Urgency *" }), _jsxs("div", { className: "flex gap-6", children: [_jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "radio", name: "urgent", checked: !urgent, onChange: () => setUrgent(false), className: "w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" }), _jsx("span", { className: "text-sm text-gray-700", children: "No" })] }), _jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "radio", name: "urgent", checked: urgent, onChange: () => setUrgent(true), className: "w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" }), _jsx("span", { className: "text-sm text-gray-700", children: "Yes (Urgent)" })] })] }), urgent && (_jsx("p", { className: "mt-2 text-sm text-amber-700", children: "Urgent tickets are routed to Area Maintenance Manager (C1) for immediate action." }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Attachments (optional)" }), _jsx("p", { className: "text-xs text-gray-600 mb-2", children: "Add files or take a photo. On mobile, choosing images may open the camera." }), _jsx("input", { ref: fileInputRef, type: "file", multiple: true, accept: "image/*,.pdf,.doc,.docx,.xls,.xlsx", className: "hidden", onChange: (e) => setSelectedFiles(Array.from(e.target.files ?? [])) }), _jsx(Button, { type: "button", variant: "secondary", size: "sm", onClick: () => fileInputRef.current?.click(), children: "Add files or take photo" }), selectedFiles.length > 0 && (_jsx("ul", { className: "mt-2 text-sm text-gray-600 list-disc list-inside", children: selectedFiles.map((f, i) => (_jsx("li", { children: f.name }, i))) }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Asset linking (optional)" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", inputMode: "numeric", value: assetIdInput, onChange: (e) => {
                                                    setAssetIdInput(e.target.value);
                                                    setAssetLookupMessage(null);
                                                }, onBlur: handleLookupAsset, placeholder: "Asset ID", className: "flex-1 p-3 border border-gray-300 rounded-lg" }), _jsx(Button, { type: "button", variant: "secondary", onClick: handleLookupAsset, children: "Look up" })] }), _jsx("p", { className: "text-xs text-gray-500", children: "Or scan barcode/QR to enter Asset ID." }), assetLookupMessage === 'found' && assetDescription != null && (_jsxs("p", { className: "text-sm text-green-700", children: ["Asset: ", assetDescription] })), assetLookupMessage === 'notfound' && (_jsx("p", { className: "text-sm text-amber-600", children: "Asset not found" }))] })] }), _jsxs("div", { className: "flex flex-wrap gap-3 pt-4 border-t border-gray-200", children: [_jsx(Button, { type: "button", variant: "secondary", onClick: () => navigate(backLink), children: "Cancel" }), _jsx(Button, { type: "button", variant: "secondary", onClick: handleSaveDraft, disabled: isBusy, children: createMutation.isPending && !isSending ? 'Saving...' : 'Save as Draft' }), _jsx(Button, { type: "button", onClick: handleSubmitTicket, disabled: isBusy, children: isSending ? 'Submitting...' : 'Submit Ticket' })] }), validationError && (_jsx("p", { className: "text-amber-600 text-sm", children: validationError })), createMutation.isError && (_jsx("p", { className: "text-red-600 text-sm", children: createMutation.error?.response?.data?.error ?? 'Failed to create ticket' })), submitError && (_jsx("p", { className: "text-red-600 text-sm", children: submitError }))] }) }) }));
}
