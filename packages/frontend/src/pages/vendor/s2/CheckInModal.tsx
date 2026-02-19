/**
 * Check-In Modal (S2) — Section 14.5, 18.7, 18.9
 * SM inputs number of technicians when generating check-in QR. S2 cannot change it:
 * - Confirm: check in with that number (scan QR / paste token).
 * - Return to store: send task back to SM so they can generate a new QR with the correct number.
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { workOrdersAPI } from '../../../api/work-orders';
import { Button } from '../../../components/shared';

interface CheckInModalProps {
  workOrderId: number;
  /** Declared by Store Manager when generating QR; S2 can only confirm or return to store */
  declaredTechCount: number | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CheckInModal({
  workOrderId,
  declaredTechCount,
  onClose,
  onSuccess,
}: CheckInModalProps) {
  const queryClient = useQueryClient();
  const [qrToken, setQrToken] = useState('');
  const [checkInSuccess, setCheckInSuccess] = useState(false);

  const checkInMutation = useMutation({
    mutationFn: workOrdersAPI.checkIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['work-order', workOrderId] });
      setCheckInSuccess(true);
    },
  });

  const returnMutation = useMutation({
    mutationFn: () => workOrdersAPI.returnForTechCount(workOrderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['work-order', workOrderId] });
      onSuccess?.();
      onClose();
    },
  });

  const techCountValid = declaredTechCount != null && declaredTechCount >= 1;
  const canConfirm = techCountValid && qrToken.trim() !== '';

  const handleConfirm = () => {
    if (!canConfirm) return;
    checkInMutation.mutate({
      workOrderId,
      qrToken: qrToken.trim(),
      techCountConfirmed: declaredTechCount!,
    });
  };

  const handleReturnToStore = () => {
    returnMutation.mutate();
  };

  const handleCloseAfterSuccess = () => {
    onSuccess?.();
    onClose();
  };

  if (checkInSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Check In</h2>
            <p className="text-sm text-gray-600">WO #{workOrderId}</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                You are checked in now! When done with work, open the work order to fill out work specification and check out.
              </p>
            </div>
          </div>
          <div className="p-6 border-t border-gray-200">
            <Button type="button" onClick={handleCloseAfterSuccess} className="w-full">
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Check In</h2>
          <p className="text-sm text-gray-600">WO #{workOrderId}</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              <strong>Steps:</strong> The store has declared the number of technicians. You can <strong>confirm</strong> (scan QR and check in) or <strong>return to store</strong> so they can generate a new QR with the correct number.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of technicians (declared by store)
            </label>
            {declaredTechCount != null && declaredTechCount >= 1 ? (
              <p className="p-3 bg-gray-100 rounded-lg text-gray-800 font-medium">
                {declaredTechCount} — cannot be changed here. Return to store if incorrect.
              </p>
            ) : (
              <p className="text-sm text-amber-700">
                Store has not generated a QR yet. Ask the store to generate the check-in QR code (with technician count) first.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              QR Code Token * (scan or paste)
            </label>
            <input
              type="text"
              value={qrToken}
              onChange={(e) => setQrToken(e.target.value)}
              placeholder="Scan QR code or paste token from store..."
              className="w-full p-3 border border-gray-300 rounded-lg"
              autoFocus
              disabled={!techCountValid}
            />
            <p className="text-xs text-gray-500 mt-1">You can scan the QR at the store or paste the token the store sent you. Token expires after 5 minutes.</p>
          </div>

          {(checkInMutation.isError || returnMutation.isError) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">
                {((checkInMutation.error || returnMutation.error) as { response?: { data?: { error?: string } } })?.response?.data?.error ??
                  'Action failed'}
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          {declaredTechCount != null && declaredTechCount >= 1 && (
            <Button
              type="button"
              variant="secondary"
              onClick={handleReturnToStore}
              disabled={returnMutation.isPending || checkInMutation.isPending}
            >
              {returnMutation.isPending ? 'Returning...' : 'Return to store (correct number)'}
            </Button>
          )}
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm || checkInMutation.isPending}
            className="flex-1 min-w-0"
          >
            {checkInMutation.isPending ? 'Checking In...' : 'Confirm & Check In'}
          </Button>
        </div>
      </div>
    </div>
  );
}
