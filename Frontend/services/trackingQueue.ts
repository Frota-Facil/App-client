import {
  enqueueTracking,
  getQueue,
  saveQueue,
  type TrackingItem,
} from "../storage/trackingQueue";

export type TrackingPoint = Omit<TrackingItem, "routeId">;

export type TrackingQueue = {
  routeId: string;
  points: TrackingPoint[];
};

const toTrackingPoint = ({
  latitude,
  longitude,
  capturedAt,
}: TrackingItem): TrackingPoint => ({
  latitude,
  longitude,
  capturedAt,
});

const toTrackingItem = (
  routeId: string,
  point: TrackingPoint
): TrackingItem => ({
  routeId,
  ...point,
});

export async function loadTrackingQueue(
  routeId: string
): Promise<TrackingQueue> {
  const queue = await getQueue();

  return {
    routeId,
    points: queue
      .filter((tracking) => tracking.routeId === routeId)
      .map(toTrackingPoint),
  };
}

export async function saveTrackingQueue(
  queue: TrackingQueue
): Promise<void> {
  const currentQueue = await getQueue();
  const otherRoutes = currentQueue.filter(
    (tracking) => tracking.routeId !== queue.routeId
  );

  await saveQueue([
    ...otherRoutes,
    ...queue.points.map((point) => toTrackingItem(queue.routeId, point)),
  ]);
}

export async function enqueueTrackingPoint(
  routeId: string,
  point: TrackingPoint
): Promise<void> {
  await enqueueTracking(toTrackingItem(routeId, point));
}

export async function removeFirstTrackingPoints(
  routeId: string,
  amount: number
): Promise<void> {
  const queue = await getQueue();
  let remainingToRemove = amount;

  await saveQueue(
    queue.filter((tracking) => {
      if (tracking.routeId !== routeId || remainingToRemove <= 0) {
        return true;
      }

      remainingToRemove -= 1;
      return false;
    })
  );
}

export async function clearTrackingQueue(
  routeId: string
): Promise<void> {
  const queue = await getQueue();

  await saveQueue(
    queue.filter((tracking) => tracking.routeId !== routeId)
  );
}
