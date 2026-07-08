import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@tracking_queue";

export type TrackingItem = {
  routeId: string;
  xCoordinate: number;
  yCoordinate: number;
  created_at: string;
};

let queueLock: Promise<void> = Promise.resolve();

const isTrackingItem = (value: unknown): value is TrackingItem => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Partial<TrackingItem>;

  return (
    typeof item.routeId === "string" &&
    item.routeId.trim().length > 0 &&
    typeof item.xCoordinate === "number" &&
    Number.isFinite(item.xCoordinate) &&
    typeof item.yCoordinate === "number" &&
    Number.isFinite(item.yCoordinate) &&
    typeof item.created_at === "string" &&
    item.created_at.trim().length > 0
  );
};

const withQueueLock = async <T>(
  operation: () => Promise<T>
): Promise<T> => {
  const previousLock = queueLock;
  let releaseLock!: () => void;

  queueLock = new Promise<void>((resolve) => {
    releaseLock = resolve;
  });

  await previousLock;

  try {
    return await operation();
  } finally {
    releaseLock();
  }
};

const readQueueUnsafe = async (): Promise<TrackingItem[]> => {
  const data = await AsyncStorage.getItem(STORAGE_KEY);

  if (!data) {
    return [];
  }

  try {
    const parsed = JSON.parse(data);

    if (!Array.isArray(parsed)) {
      await AsyncStorage.removeItem(STORAGE_KEY);
      return [];
    }

    return parsed.filter(isTrackingItem);
  } catch {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return [];
  }
};

const writeQueueUnsafe = async (queue: TrackingItem[]) => {
  if (queue.length === 0) {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return;
  }

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
};

export async function getQueue(): Promise<TrackingItem[]> {
  return withQueueLock(readQueueUnsafe);
}

export async function saveQueue(queue: TrackingItem[]) {
  await withQueueLock(() => writeQueueUnsafe(queue.filter(isTrackingItem)));
}

export async function enqueueTracking(
  tracking: TrackingItem
) {
  await withQueueLock(async () => {
    const queue = await readQueueUnsafe();

    queue.push(tracking);

    await writeQueueUnsafe(queue);
  });
}

export async function getFirstQueuedTracking(): Promise<TrackingItem | null> {
  return withQueueLock(async () => {
    const queue = await readQueueUnsafe();

    return queue[0] ?? null;
  });
}

export async function removeFirstQueuedTracking(): Promise<boolean> {
  return withQueueLock(async () => {
    const queue = await readQueueUnsafe();

    if (queue.length === 0) {
      return false;
    }

    queue.shift();

    await writeQueueUnsafe(queue);

    return true;
  });
}

export async function getQueueSize(): Promise<number> {
  return withQueueLock(async () => {
    const queue = await readQueueUnsafe();

    return queue.length;
  });
}

export async function clearQueue() {
  await withQueueLock(() => AsyncStorage.removeItem(STORAGE_KEY));
}
