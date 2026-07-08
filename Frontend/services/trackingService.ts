import NetInfo from "@react-native-community/netinfo";
import type { NetInfoState } from "@react-native-community/netinfo";

import {
  enqueueTracking,
  getFirstQueuedTracking,
  getQueueSize,
  removeFirstQueuedTracking,
  type TrackingItem,
} from "../storage/trackingQueue";
import {
  sendTracking as postTracking,
  type TrackingPoint,
} from "./tracking";

export type { TrackingItem };

let syncPromise: Promise<void> | null = null;

const isOnline = (netInfo: NetInfoState) =>
  netInfo.isConnected === true && netInfo.isInternetReachable !== false;

const getIsOnline = async () => isOnline(await NetInfo.fetch());

const toTrackingPoint = (tracking: TrackingItem): TrackingPoint => ({
  xCoordinate: tracking.xCoordinate,
  yCoordinate: tracking.yCoordinate,
  created_at: tracking.created_at,
});

const sendQueuedTracking = (tracking: TrackingItem) =>
  postTracking(tracking.routeId, toTrackingPoint(tracking));

const syncTrackingQueueInternal = async () => {
  if (!(await getIsOnline())) {
    return;
  }

  while (await getIsOnline()) {
    const nextTracking = await getFirstQueuedTracking();

    if (!nextTracking) {
      return;
    }

    try {
      await sendQueuedTracking(nextTracking);
      await removeFirstQueuedTracking();
    } catch {
      return;
    }
  }
};

export async function syncTrackingQueue() {
  if (syncPromise) {
    return syncPromise;
  }

  syncPromise = syncTrackingQueueInternal().finally(() => {
    syncPromise = null;
  });

  return syncPromise;
}

export function subscribeToTrackingQueueSync() {
  return NetInfo.addEventListener((state) => {
    if (isOnline(state)) {
      void syncTrackingQueue();
    }
  });
}

export async function sendTracking(tracking: TrackingItem) {
  if (!(await getIsOnline())) {
    await enqueueTracking(tracking);

    return;
  }

  const pendingTrackings = await getQueueSize();

  if (pendingTrackings > 0) {
    await enqueueTracking(tracking);
    await syncTrackingQueue();

    return;
  }

  try {
    await sendQueuedTracking(tracking);
  } catch {
    await enqueueTracking(tracking);
  }
}
