/**
 * S3 (Finance / Backoffice) Dashboard — Section 15
 * Action-group: Service Completed, Cost Revision Requested, Approved (read-only), Closed Without Cost (read-only).
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { workOrdersAPI } from '../../../api/work-orders';
import { invoiceBatchesAPI } from '../../../api/invoice-batches';
import { useSession } from '../../../contexts/SessionContext';
import { Layout, Card, Button } from '../../../components/shared';
import { S3WorkOrderList } from './S3WorkOrderList';
import { S3WorkOrderDetailModal } from './S3WorkOrderDetailModal';
import { TerminalWorkOrderStatuses } from '../../../types/statuses';

const SERVICE_COMPLETED = 'Service Completed';
const COST_REVISION_REQUESTED = 'Cost Revision Requested';
const COST_PROPOSAL_APPROVED = 'Cost Proposal Approved';
const CLOSED_WITHOUT_COST = 'Closed Without Cost';

type ListMode = 'service-completed' | 'revision' | 'approved' | 'closed' | null;

export function S3Dashboard() {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const [listMode, setListMode] = useState<ListMode>(null);
  const [selectedWOId, setSelectedWOId] = useState<number | null>(null);
  const [batchCreating, setBatchCreating] = useState(false);
  const [batchError, setBatchError] = useState<string | null>(null);

  const { data: workOrders = [], isLoading } = useQuery({
    queryKey: ['work-orders', 's3', session?.companyId],
    queryFn: () =>
      workOrdersAPI.list({
        vendorCompanyId: session!.companyId,
      }),
    enabled: session?.companyId != null,
  });

  const serviceCompleted = workOrders.filter(
    (wo) => wo.currentStatus === SERVICE_COMPLETED && wo.currentOwnerId === session?.userId
  );
  const revisionRequested = workOrders.filter(
    (wo) => wo.currentStatus === COST_REVISION_REQUESTED && wo.currentOwnerId === session?.userId
  );
  // Approved but not yet in an invoice batch (eligible for "Create Invoice Batch")
  const approved = workOrders.filter(
    (wo) => wo.currentStatus === COST_PROPOSAL_APPROVED && wo.invoiceBatchId == null
  );
  const closedNoCost = workOrders.filter((wo) => wo.currentStatus === CLOSED_WITHOUT_COST);
  // Approved and already batched — show in "Closed Work Orders" (read-only)
  const batchedApproved = workOrders.filter(
    (wo) => wo.currentStatus === COST_PROPOSAL_APPROVED && wo.invoiceBatchId != null
  );
  const closedWorkOrders = [...closedNoCost, ...batchedApproved];

  // Work orders from your company that S3 is not currently owner of
  const myWorkOrders = workOrders.filter(
    (wo) => wo.currentOwnerId !== session?.userId
  );
  const myActiveCount = myWorkOrders.filter(
    (wo) => !TerminalWorkOrderStatuses.includes(wo.currentStatus)
  ).length;
  const myClosedCount = myWorkOrders.filter((wo) =>
    TerminalWorkOrderStatuses.includes(wo.currentStatus)
  ).length;

  const listItems =
    listMode === 'service-completed'
      ? serviceCompleted
      : listMode === 'revision'
        ? revisionRequested
        : listMode === 'approved'
          ? approved
          : listMode === 'closed'
            ? closedWorkOrders
            : [];

  const listTitle =
    listMode === 'service-completed'
      ? 'Service Completed (Awaiting Cost Proposal)'
      : listMode === 'revision'
        ? 'Cost Revision Requested'
        : listMode === 'approved'
          ? 'Approved Cost Proposals'
          : listMode === 'closed'
            ? 'Closed Work Orders'
            : '';

  return (
    <Layout screenTitle="Dashboard">
      <div className="space-y-6">
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 text-2xl">💰</div>
            <div>
              <h3 className="font-medium text-blue-900 mb-1">Your Role</h3>
              <p className="text-sm text-blue-700">
                Prepare cost proposals (labor + materials), resubmit after revision, and view approved or closed work orders.
              </p>
            </div>
          </div>
        </Card>

        {isLoading ? (
          <Card>
            <p className="text-gray-600">Loading work orders...</p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card
              className="bg-amber-50 border-amber-200 cursor-pointer hover:shadow-md transition"
              onClick={() => setListMode('service-completed')}
            >
              <h3 className="font-medium text-amber-900 mb-1">Service Completed</h3>
              <p className="text-3xl font-bold text-amber-700">{serviceCompleted.length}</p>
              <p className="text-xs text-amber-600 mt-1">Awaiting cost proposal</p>
            </Card>
            <Card
              className="bg-orange-50 border-orange-200 cursor-pointer hover:shadow-md transition"
              onClick={() => setListMode('revision')}
            >
              <h3 className="font-medium text-orange-900 mb-1">Cost Revision Requested</h3>
              <p className="text-3xl font-bold text-orange-700">{revisionRequested.length}</p>
              <p className="text-xs text-orange-600 mt-1">Recalculate and resubmit</p>
            </Card>
            <Card
              className="bg-green-50 border-green-200 cursor-pointer hover:shadow-md transition"
              onClick={() => setListMode('approved')}
            >
              <h3 className="font-medium text-green-900 mb-1">Approved Cost Proposals</h3>
              <p className="text-3xl font-bold text-green-700">{approved.length}</p>
              <p className="text-xs text-green-600 mt-1">Read-only</p>
            </Card>
            <Card
              className="bg-gray-100 border-gray-200 cursor-pointer hover:shadow-md transition"
              onClick={() => setListMode('closed')}
            >
              <h3 className="font-medium text-gray-900 mb-1">Closed Work Orders</h3>
              <p className="text-3xl font-bold text-gray-600">{closedWorkOrders.length}</p>
              <p className="text-xs text-gray-500 mt-1">Read-only</p>
            </Card>
          </div>
        )}

        {listMode != null && (
          <S3WorkOrderList
            items={listItems}
            title={listTitle}
            onBack={() => setListMode(null)}
            onSelectWo={(id) => setSelectedWOId(id)}
            isApprovedList={listMode === 'approved'}
            batchCreating={batchCreating}
            batchError={batchError}
            onCreateBatch={
              listMode === 'approved'
                ? async (workOrderIds: number[]) => {
                    setBatchError(null);
                    setBatchCreating(true);
                    try {
                      const res = await invoiceBatchesAPI.create(workOrderIds);
                      await queryClient.invalidateQueries({
                        queryKey: ['work-orders', 's3', session?.companyId],
                      });
                      window.open(res.batch.pdfUrl, '_blank', 'noopener');
                    } catch (e: unknown) {
                      const err = e as { response?: { data?: { error?: string }; status?: number } };
                      const msg =
                        err.response?.data?.error ??
                        (e instanceof Error ? e.message : 'Failed to create batch');
                      setBatchError(msg);
                    } finally {
                      setBatchCreating(false);
                    }
                  }
                : undefined
            }
            onClearBatchError={() => setBatchError(null)}
          />
        )}

        <Card className="bg-slate-50 border-slate-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">My work orders</h2>
          <p className="text-sm text-gray-600 mb-4">
            Work orders from your company that you are not currently owning ({myWorkOrders.length} total). Read-only.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/vendor/s3/my-work-orders/active">
              <Button type="button" variant="secondary">
                Active work orders ({myActiveCount})
              </Button>
            </Link>
            <Link to="/vendor/s3/my-work-orders/closed">
              <Button type="button" variant="secondary">
                Closed work orders ({myClosedCount})
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {selectedWOId != null && (
        <S3WorkOrderDetailModal
          workOrderId={selectedWOId}
          onClose={() => setSelectedWOId(null)}
        />
      )}
    </Layout>
  );
}
