/**
 * Area Manager Ticket Detail — Section 12
 * Initial review: Approve for Cost Estimation, Request Clarification, Reject.
 * Approval chain: Approve / Return (comment mandatory) / Reject.
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsAPI } from '../../api/tickets';
import { useSession } from '../../contexts/SessionContext';
import { Button, Badge } from '../../components/shared';

interface AMTicketDetailModalProps {
  ticketId: number;
  onClose: () => void;
}

const INTERNAL_ROLE_LABELS: Record<string, string> = {
  SM: 'Store Manager (creator)',
  AM: 'Area Manager',
  AMM: 'Area Maintenance Manager',
  D: 'Sales Director',
  C2: 'Maintenance Director',
  BOD: 'Board of Directors',
};

export function AMTicketDetailModal({
  ticketId,
  onClose,
}: AMTicketDetailModalProps) {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [clarificationComment, setClarificationComment] = useState('');
  const [assignToRole, setAssignToRole] = useState('SM');
  const [showClarificationForm, setShowClarificationForm] = useState(false);
  const [returnComment, setReturnComment] = useState('');
  const [approveComment, setApproveComment] = useState('');

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => ticketsAPI.getById(ticketId),
  });

  const approveForEstimationMutation = useMutation({
    mutationFn: () => ticketsAPI.approveForEstimation(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      onClose();
    },
  });

  const clarifyMutation = useMutation({
    mutationFn: ({ comment, role }: { comment: string; role: string }) =>
      ticketsAPI.requestClarification(ticketId, comment, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      setClarificationComment('');
      setShowClarificationForm(false);
      onClose();
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (reason: string) => ticketsAPI.reject(ticketId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      onClose();
    },
  });

  const approveCostMutation = useMutation({
    mutationFn: () =>
      ticketsAPI.approveCostEstimation(ticketId, approveComment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      onClose();
    },
  });

  const returnCostMutation = useMutation({
    mutationFn: () =>
      ticketsAPI.returnCostEstimation(ticketId, returnComment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      onClose();
    },
  });

  const submitResponseToRequesterMutation = useMutation({
    mutationFn: (comment?: string) =>
      ticketsAPI.submitUpdated(ticketId, undefined, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      onClose();
    },
  });

  if (isLoading || ticket == null) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6">
          <p>Loading ticket details...</p>
        </div>
      </div>
    );
  }

  const isInitialReview =
    ticket.currentStatus === 'Ticket Submitted' ||
    ticket.currentStatus === 'Updated Ticket Submitted';
  const isApprovalChain =
    ticket.currentStatus === 'Cost Estimation Approval Needed';
  const isOwner =
    session?.userId != null && ticket.currentOwnerUserId === session.userId;

  const canInitialReview = isInitialReview && isOwner;
  const canReturnToRequester =
    ticket.currentStatus === 'Awaiting Ticket Creator Response' &&
    isOwner &&
    ticket.clarificationRequestedByUserId != null;
  const canApprovalChain = isApprovalChain && isOwner && ticket.costEstimation;

  const costAmount =
    ticket.costEstimation?.estimatedAmount != null
      ? Number(ticket.costEstimation.estimatedAmount)
      : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full my-8">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Ticket Detail</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm text-gray-600">Ticket #{ticket.id}</span>
                <Badge
                  variant={
                    ticket.currentStatus.includes('Approved')
                      ? 'success'
                      : 'warning'
                  }
                >
                  {ticket.currentStatus}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Store: {ticket.storeName} • Created by: {ticket.createdByUserName}
              </p>
            </div>
            <Button type="button" variant="secondary" onClick={onClose}>
              Back
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          <section>
            <h2 className="font-semibold text-gray-900 mb-2">Ticket information</h2>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-600">Category:</span>{' '}
                <span className="text-sm text-gray-900">{ticket.category}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Current Owner:</span>{' '}
                <span className="text-sm text-gray-900">
                  {ticket.currentOwnerUserName != null ? `${ticket.currentOwnerUserName}${ticket.currentOwnerUserRole != null ? ` (${ticket.currentOwnerUserRole})` : ''}` : '—'}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Original Problem Description (locked):</span>
                <p className="text-sm text-gray-900 mt-1">{ticket.originalDescription ?? ticket.description}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Created:</span>{' '}
                <span className="text-sm text-gray-900">
                  {new Date(ticket.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </section>

          {/* When AM is assignee (owner) in Awaiting Creator Response: only option is to return to the role that requested clarification */}
          {canReturnToRequester && (
            <section className="space-y-4">
              <h3 className="font-semibold text-gray-900">Respond to clarification</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 mb-2">
                  {ticket.clarificationRequestedByUserName != null || ticket.clarificationRequestedByUserRole != null
                    ? `${ticket.clarificationRequestedByUserName ?? 'Requester'}${ticket.clarificationRequestedByUserRole != null ? ` (${INTERNAL_ROLE_LABELS[ticket.clarificationRequestedByUserRole] ?? ticket.clarificationRequestedByUserRole})` : ''} requested clarification. You can only return the ticket to them.`
                    : 'Return the ticket to the role that requested clarification.'}
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-1">Optional comment</label>
                <textarea
                  value={clarificationComment}
                  onChange={(e) => setClarificationComment(e.target.value)}
                  placeholder="Add a comment (optional)..."
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg mb-3"
                />
                <Button
                  type="button"
                  onClick={() => submitResponseToRequesterMutation.mutate(clarificationComment.trim() || undefined)}
                  disabled={submitResponseToRequesterMutation.isPending}
                >
                  {submitResponseToRequesterMutation.isPending ? 'Sending...' : `Return to ${ticket.clarificationRequestedByUserName ?? 'requester'}`}
                </Button>
              </div>
            </section>
          )}

          {/* 12.2 Initial review: Approve for Cost Estimation, Request Clarification, Reject */}
          {canInitialReview && (
            <section className="space-y-4">
              <h3 className="font-semibold text-gray-900">Initial review</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Approve for Cost Estimation</h4>
                <p className="text-sm text-green-700 mb-3">
                  Sends this ticket to the Area Maintenance Manager for cost estimation.
                </p>
                <Button
                  type="button"
                  onClick={() => approveForEstimationMutation.mutate()}
                  disabled={approveForEstimationMutation.isPending}
                >
                  {approveForEstimationMutation.isPending ? 'Approving...' : 'Approve for Cost Estimation'}
                </Button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2">Request clarification</h4>
                <p className="text-sm text-yellow-800 mb-2">Send the ticket to a role involved in this ticket. After they update it, the ticket will return to you.</p>
                {!showClarificationForm ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => { const options = (ticket.involvedInternalRoles ?? ['SM']).filter((r) => r !== ticket.currentOwnerUserRole); setAssignToRole(options[0] ?? 'SM'); setShowClarificationForm(true); }}
                  >
                    Request Ticket Clarification
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Send clarification request to</label>
                    <select
                      value={assignToRole}
                      onChange={(e) => setAssignToRole(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      {((ticket.involvedInternalRoles ?? ['SM']).filter((r) => r !== ticket.currentOwnerUserRole)).map((r) => (
                        <option key={r} value={r}>{INTERNAL_ROLE_LABELS[r] ?? r}</option>
                      ))}
                    </select>
                    <label className="block text-sm font-medium text-gray-700">Clarification text (mandatory)</label>
                    <textarea
                      value={clarificationComment}
                      onChange={(e) => setClarificationComment(e.target.value)}
                      placeholder="Explain what needs clarification..."
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={() => clarifyMutation.mutate({ comment: clarificationComment, role: assignToRole })}
                        disabled={!clarificationComment.trim() || clarifyMutation.isPending}
                      >
                        {clarifyMutation.isPending ? 'Sending...' : 'Submit'}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          setShowClarificationForm(false);
                          setClarificationComment('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-2">Reject ticket</h4>
                {!showRejectForm ? (
                  <>
                    <p className="text-sm text-red-700 mb-3">Reject with a reason (terminal state).</p>
                    <Button type="button" variant="danger" onClick={() => setShowRejectForm(true)}>
                      Reject Ticket
                    </Button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-red-900">Reason (mandatory)</label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Reason for rejection..."
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => rejectMutation.mutate(rejectReason)}
                        disabled={!rejectReason.trim() || rejectMutation.isPending}
                      >
                        {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          setShowRejectForm(false);
                          setRejectReason('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* 12.5 Approval chain: Approve / Return (comment mandatory) / Reject */}
          {canApprovalChain && costAmount != null && (
            <section className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Cost estimation approval</h3>
              <p className="text-sm text-gray-700 mb-3">
                Amount: <strong>€{costAmount.toLocaleString()}</strong>
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comment (optional for Approve)</label>
                  <textarea
                    value={approveComment}
                    onChange={(e) => setApproveComment(e.target.value)}
                    placeholder="Comment for approval..."
                    rows={2}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => approveCostMutation.mutate()}
                  disabled={approveCostMutation.isPending}
                >
                  {approveCostMutation.isPending ? 'Approving...' : 'Approve'}
                </Button>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-200 space-y-3">
                <label className="block text-sm font-medium text-gray-700">Return to AMM (comment mandatory)</label>
                <textarea
                  value={returnComment}
                  onChange={(e) => setReturnComment(e.target.value)}
                  placeholder="Reason for return..."
                  rows={2}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => returnCostMutation.mutate()}
                  disabled={!returnComment.trim() || returnCostMutation.isPending}
                >
                  {returnCostMutation.isPending ? 'Returning...' : 'Return to AMM'}
                </Button>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => setShowRejectForm(true)}
                >
                  Reject
                </Button>
                {showRejectForm && (
                  <div className="mt-3 space-y-2">
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Reason for rejection..."
                      rows={2}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => rejectMutation.mutate(rejectReason)}
                        disabled={!rejectReason.trim() || rejectMutation.isPending}
                      >
                        Confirm Rejection
                      </Button>
                      <Button type="button" variant="secondary" onClick={() => setShowRejectForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {ticket.comments != null && ticket.comments.length > 0 && (
            <section>
              <h3 className="font-semibold text-gray-900 mb-2">Comments</h3>
              <div className="space-y-3">
                {[...ticket.comments]
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((c) => (
                  <div key={c.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-gray-900">{c.authorUserName}</span>
                      <span className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-700">{c.text}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {ticket.auditLog != null && ticket.auditLog.length > 0 && (
            <section>
              <h3 className="font-semibold text-gray-900 mb-2">History</h3>
              <div className="space-y-2">
                {ticket.auditLog.map((entry) => (
                  <div key={entry.id} className="text-sm bg-gray-50 rounded-lg p-3">
                    <span className="text-gray-600">{new Date(entry.createdAt).toLocaleString()}</span>
                    {' — '}
                    <span className="font-medium">{entry.actionType}</span>
                    {entry.prevStatus != null && (
                      <span className="text-gray-600"> ({entry.prevStatus} → {entry.newStatus})</span>
                    )}
                    {entry.actorRole != null && (
                      <p className="mt-1 text-gray-600">By {entry.actorName} ({entry.actorRole})</p>
                    )}
                    {entry.comment != null && (
                      <p className="text-gray-600 mt-1">&quot;{entry.comment}&quot;</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {(approveForEstimationMutation.isError ||
            clarifyMutation.isError ||
            rejectMutation.isError ||
            approveCostMutation.isError ||
            returnCostMutation.isError) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">
                Error:{' '}
                {(approveForEstimationMutation.error as { response?: { data?: { error?: string } } })?.response?.data?.error ??
                  (clarifyMutation.error as { response?: { data?: { error?: string } } })?.response?.data?.error ??
                  (rejectMutation.error as { response?: { data?: { error?: string } } })?.response?.data?.error ??
                  (approveCostMutation.error as { response?: { data?: { error?: string } } })?.response?.data?.error ??
                  (returnCostMutation.error as { response?: { data?: { error?: string } } })?.response?.data?.error ??
                  'Action failed'}
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 sticky bottom-0 bg-white">
          <Button type="button" variant="secondary" onClick={onClose} className="w-full">
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
