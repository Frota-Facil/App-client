import {
  enqueueTracking,
  getFirstQueuedTracking,
  getQueueSize,
  removeFirstQueuedTracking,
  type TrackingItem,
} from "../storage/trackingQueue";
import {
  sendTrackingPoint,
  type TrackingPoint,
} from "./tracking";

export type { TrackingItem };

let syncPromise: Promise<void> | null = null;

const toTrackingPoint = (tracking: TrackingItem): TrackingPoint => ({
  latitude: tracking.latitude,
  longitude: tracking.longitude,
  capturedAt: tracking.capturedAt,
});

const sendQueuedTracking = (tracking: TrackingItem) =>
  sendTrackingPoint(tracking.routeId, toTrackingPoint(tracking));

const syncTrackingQueueInternal = async () => {
  while (true) {
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
  void syncTrackingQueue();

  return () => {};
}

export async function sendTracking(tracking: TrackingItem) {
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
