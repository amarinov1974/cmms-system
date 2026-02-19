/**
 * S1 (Service Admin) Dashboard — Section 13
 * New WO Urgent, New WO Non-Urgent, Active WO, Archived WO.
 * Count only; click opens list. List opens WO detail; opening WO records read acknowledgment.
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { workOrdersAPI } from '../../../api/work-orders';
import { useSession } from '../../../contexts/SessionContext';
import { Layout, Card, Badge, Button } from '../../../components/shared';
import { WorkOrderStatus } from '../../../types/statuses';
import { S1WorkOrderList } from './S1WorkOrderList';
import { S1WorkOrderDetailModal } from './S1WorkOrderDetailModal';

const ACTIVE_STATUSES: readonly string[] = [
  WorkOrderStatus.ACCEPTED_TECHNICIAN_ASSIGNED,
  WorkOrderStatus.SERVICE_IN_PROGRESS,
  WorkOrderStatus.SERVICE_COMPLETED,
  WorkOrderStatus.FOLLOW_UP_REQUESTED,
  WorkOrderStatus.NEW_WO_NEEDED,
  WorkOrderStatus.REPAIR_UNSUCCESSFUL,
  WorkOrderStatus.COST_PROPOSAL_PREPARED,
  WorkOrderStatus.COST_REVISION_REQUESTED,
];
const ARCHIVED_STATUSES: readonly string[] = [WorkOrderStatus.COST_PROPOSAL_APPROVED, WorkOrderStatus.CLOSED_WITHOUT_COST, WorkOrderStatus.REJECTED];

export function S1Dashboard() {
  const { session } = useSession();
  const [listMode, setListMode] = useState<'urgent' | 'non-urgent' | 'active' | 'archived' | 'other-active' | 'other-closed' | null>(null);
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<number | null>(null);

  const { data: workOrders = [], isLoading } = useQuery({
    queryKey: ['work-orders', 's1', session?.companyId],
    queryFn: () =>
      workOrdersAPI.list({
        vendorCompanyId: session!.companyId,
      }),
    enabled: session?.companyId != null,
  });

  const isOwner = (wo: { currentOwnerId: number }) =>
    session?.userId != null && wo.currentOwnerId === session.userId;

  const newUrgent = workOrders.filter(
    (wo) =>
      wo.currentStatus === WorkOrderStatus.CREATED && wo.urgent === true && isOwner(wo)
  );
  const newNonUrgent = workOrders.filter(
    (wo) =>
      wo.currentStatus === WorkOrderStatus.CREATED && wo.urgent === false && isOwner(wo)
  );
  const active = workOrders.filter((wo) =>
    ACTIVE_STATUSES.includes(wo.currentStatus)
  );
  const archived = workOrders.filter((wo) =>
    ARCHIVED_STATUSES.includes(wo.currentStatus)
  );

  // WOs from your company where S1 participated but is not the current owner (handed off to S2/S3/AMM or closed)
  const notOwnedByS1 = workOrders.filter(
    (wo) => wo.currentOwnerId !== session?.userId
  );
  // Active: includes CREATED (e.g. returned to AMM — still "Awaiting Service Provider") + normal active statuses
  const otherActiveStatuses: readonly string[] = [WorkOrderStatus.CREATED, ...ACTIVE_STATUSES];
  const otherActive = notOwnedByS1.filter((wo) =>
    otherActiveStatuses.includes(wo.currentStatus)
  );
  const otherClosed = notOwnedByS1.filter((wo) =>
    ARCHIVED_STATUSES.includes(wo.currentStatus)
  );

  const countNewUrgent = newUrgent.length;
  const countNewNonUrgent = newNonUrgent.length;
  const countActive = active.length;
  const countArchived = archived.length;

  const listItems =
    listMode === 'urgent'
      ? newUrgent
      : listMode === 'non-urgent'
        ? newNonUrgent
        : listMode === 'active'
          ? active
          : listMode === 'archived'
            ? archived
            : listMode === 'other-active'
              ? otherActive
              : listMode === 'other-closed'
                ? otherClosed
                : [];

  return (
    <Layout screenTitle="Dashboard">
      <div className="space-y-6">
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 text-2xl">👷</div>
            <div>
              <h3 className="font-medium text-blue-900 mb-1">Your Role</h3>
              <p className="text-sm text-blue-700">
                Assign technicians to new work orders, set ETA, or return/reject. Active and archived are read-only.
              </p>
            </div>
          </div>
        </Card>

        {listMode != null ? (
          <S1WorkOrderList
            items={listItems}
            title={
              listMode === 'urgent'
                ? 'New Work Orders — Urgent'
                : listMode === 'non-urgent'
                  ? 'New Work Orders — Non-Urgent'
                  : listMode === 'active'
                    ? 'Active Work Orders'
                    : listMode === 'archived'
                      ? 'Archived Work Orders'
                      : listMode === 'other-active'
                        ? 'Active work orders (you are not owner)'
                        : 'Closed work orders (you are not owner)'
            }
            onBack={() => setListMode(null)}
            onSelectWo={(id) => setSelectedWorkOrderId(id)}
          />
        ) : isLoading ? (
          <Card>
            <p className="text-gray-600">Loading work orders...</p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card
              className="bg-amber-50 border-amber-200 cursor-pointer hover:shadow-md transition"
              onClick={() => setListMode('urgent')}
            >
              <h3 className="font-medium text-amber-900 mb-1">New Work Orders — Urgent</h3>
              <p className="text-3xl font-bold text-amber-700">{countNewUrgent}</p>
              <p className="text-xs text-amber-600 mt-1">Status: Awaiting Service Provider, Urgent</p>
            </Card>
            <Card
              className="bg-slate-50 border-slate-200 cursor-pointer hover:shadow-md transition"
              onClick={() => setListMode('non-urgent')}
            >
              <h3 className="font-medium text-slate-900 mb-1">New Work Orders — Non-Urgent</h3>
              <p className="text-3xl font-bold text-slate-700">{countNewNonUrgent}</p>
              <p className="text-xs text-slate-600 mt-1">Status: Awaiting Service Provider, Non-Urgent</p>
            </Card>
            <Card
              className="bg-green-50 border-green-200 cursor-pointer hover:shadow-md transition"
              onClick={() => setListMode('active')}
            >
              <h3 className="font-medium text-green-900 mb-1">Active Work Orders</h3>
              <p className="text-3xl font-bold text-green-700">{countActive}</p>
              <p className="text-xs text-green-600 mt-1">Read-only</p>
            </Card>
            <Card
              className="bg-gray-100 border-gray-200 cursor-pointer hover:shadow-md transition"
              onClick={() => setListMode('archived')}
            >
              <h3 className="font-medium text-gray-900 mb-1">Archived Work Orders</h3>
              <p className="text-3xl font-bold text-gray-600">{countArchived}</p>
              <p className="text-xs text-gray-500 mt-1">Read-only</p>
            </Card>
          </div>
        )}

        {!isLoading && (
          <Card className="bg-slate-50 border-slate-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">My work orders</h2>
            <p className="text-sm text-gray-600 mb-4">
              Work orders from your company that you participated in but are not currently owning. Read-only.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setListMode('other-active')}
              >
                Active work orders ({otherActive.length})
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setListMode('other-closed')}
              >
                Closed work orders ({otherClosed.length})
              </Button>
            </div>
          </Card>
        )}
      </div>

      {selectedWorkOrderId != null && (
        <S1WorkOrderDetailModal
          workOrderId={selectedWorkOrderId}
          onClose={() => setSelectedWorkOrderId(null)}
        />
      )}
    </Layout>
  );
}
