import type { Vehicle } from "./data";
import { colors } from "./colors";
import {
  formatFullDateToPtBr,
  formatShortDateToPtBr,
  formatTimeToPtBr,
  parseDateTime,
} from "../utils/dateTime";

export type RouteStatus = "PENDING" | "READY" | "STARTED" | "FINISHED";

export type TripStatus = "scheduled" | "in_progress" | "finished";

export type Trip = {
  id: string;
  requestId: string;
  routeStatus: RouteStatus;
  requestStatus: string;
  description: string | null;
  reportMarkdown: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  predictedStartDate: string;
  predictedEndDate: string;
  destination: string;
  reason: string;
  vehicle: Vehicle & {
    id: string;
    model: string;
    year: number;
    odometer: number;
    imageUrl: string | null;
    type: "CAR" | "MOTORCYCLE" | "TRUCK" | "TRACTOR" | "VAN";
  };
};

export const getTripStatus = (routeStatus: RouteStatus): TripStatus => {
  if (routeStatus === "STARTED") {
    return "in_progress";
  }

  if (routeStatus === "FINISHED") {
    return "finished";
  }

  return "scheduled";
};

export const getTripStatusMeta = (routeStatus: RouteStatus) => {
  switch (getTripStatus(routeStatus)) {
    case "in_progress":
      return {
        label: "Em andamento",
        bg: colors.primarySoft,
        color: colors.primaryActive,
      };
    case "finished":
      return {
        label: "Concluída",
        bg: colors.successSoft,
        color: colors.successText,
      };
    default:
      return {
        label: "Agendada",
        bg: colors.warningSoft,
        color: colors.warningText,
      };
  }
};

export const parseTripDate = parseDateTime;

export const getTripCardDateValue = (trip: Trip) => {
  const status = getTripStatus(trip.routeStatus);

  if (status === "in_progress") {
    return trip.startedAt ?? trip.predictedStartDate;
  }

  if (status === "finished") {
    return trip.finishedAt ?? trip.startedAt ?? trip.predictedStartDate;
  }

  return trip.predictedStartDate;
};

export const formatTripDate = (value: string) => {
  const date = parseTripDate(value);

  if (!date) {
    return value;
  }

  const today = new Date();
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  return isToday
    ? "Hoje"
    : formatShortDateToPtBr(date);
};

export const formatTripFullDate = (value: string) => {
  const date = parseTripDate(value);

  if (!date) {
    return value;
  }

  return formatFullDateToPtBr(date);
};

export const formatTripTime = (value: string) => {
  const date = parseTripDate(value);

  if (!date) {
    return value;
  }

  return formatTimeToPtBr(date);
};

export const isTripFinished = (trip: Trip) => trip.routeStatus === "FINISHED";

export const isTripToday = (trip: Trip) => {
  const date = parseTripDate(trip.predictedStartDate);
  const today = new Date();

  return Boolean(
    date &&
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
  );
};

export const isUpcomingTrip = (trip: Trip) => {
  const date = parseTripDate(trip.predictedStartDate);

  if (!date) {
    return false;
  }

  const tomorrow = new Date();
  tomorrow.setHours(24, 0, 0, 0);

  return date >= tomorrow;
};

export const sortTripsByStartDate = (trips: Trip[]) =>
  [...trips].sort((first, second) => {
    const firstDate = parseTripDate(first.predictedStartDate)?.getTime() ?? 0;
    const secondDate = parseTripDate(second.predictedStartDate)?.getTime() ?? 0;

    return firstDate - secondDate;
  });

const tripStatusPriority: Record<TripStatus, number> = {
  in_progress: 0,
  scheduled: 1,
  finished: 2,
};

export const sortTripsByStatusAndDateDesc = (trips: Trip[]) =>
  [...trips].sort((first, second) => {
    const firstStatus = getTripStatus(first.routeStatus);
    const secondStatus = getTripStatus(second.routeStatus);
    const statusDiff =
      tripStatusPriority[firstStatus] - tripStatusPriority[secondStatus];

    if (statusDiff !== 0) {
      return statusDiff;
    }

    const firstDate =
      parseTripDate(getTripCardDateValue(first))?.getTime() ?? 0;
    const secondDate =
      parseTripDate(getTripCardDateValue(second))?.getTime() ?? 0;

    return secondDate - firstDate;
  });
