type DateParts = {
  year: number;
  month: number;
  day: number;
};

type TimeParts = {
  hour: number;
  minute: number;
};

const padDatePart = (value: number) => String(value).padStart(2, "0");

const isSameLocalDate = (date: Date, parts: DateParts) =>
  date.getFullYear() === parts.year &&
  date.getMonth() === parts.month - 1 &&
  date.getDate() === parts.day;

const parseLocalDateParts = (dateText: string): DateParts | null => {
  const normalizedDate = dateText.trim();
  const calendarMatch = normalizedDate.match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );
  const ptBrMatch = normalizedDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const match = calendarMatch ?? ptBrMatch;

  if (!match) {
    return null;
  }

  const parts = calendarMatch
    ? {
        year: Number(match[1]),
        month: Number(match[2]),
        day: Number(match[3]),
      }
    : {
        year: Number(match[3]),
        month: Number(match[2]),
        day: Number(match[1]),
      };
  const localDate = new Date(parts.year, parts.month - 1, parts.day);

  return isSameLocalDate(localDate, parts) ? parts : null;
};

const parseTimeParts = (timeText: string): TimeParts | null => {
  const match = timeText.trim().match(/^(\d{2}):(\d{2})$/);

  if (!match) {
    return null;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }

  return { hour, minute };
};

export const parseDateTime = (value: Date | string | null | undefined) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const localDateParts = parseLocalDateParts(value);

  if (localDateParts) {
    return new Date(
      localDateParts.year,
      localDateParts.month - 1,
      localDateParts.day
    );
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

export const parseLocalDateTimeToDate = (
  dateText: string,
  timeText: string
) => {
  const dateParts = parseLocalDateParts(dateText);
  const timeParts = parseTimeParts(timeText);

  if (!dateParts || !timeParts) {
    return null;
  }

  return new Date(
    dateParts.year,
    dateParts.month - 1,
    dateParts.day,
    timeParts.hour,
    timeParts.minute,
    0,
    0
  );
};

export const parseLocalDateTimeToISOString = (
  dateText: string,
  timeText: string
) => parseLocalDateTimeToDate(dateText, timeText)?.toISOString() ?? null;

export const getCalendarDateString = (value = new Date()) =>
  `${value.getFullYear()}-${padDatePart(value.getMonth() + 1)}-${padDatePart(
    value.getDate()
  )}`;

export const getLocalDateTimeParts = (value: string) => {
  const parsedDate = parseDateTime(value);

  if (!parsedDate) {
    return null;
  }

  return {
    date: getCalendarDateString(parsedDate),
    time: `${padDatePart(parsedDate.getHours())}:${padDatePart(
      parsedDate.getMinutes()
    )}`,
  };
};

export const formatDateToPtBr = (value: Date | string) => {
  const date = parseDateTime(value);

  if (!date) {
    return typeof value === "string" ? value : "";
  }

  return `${padDatePart(date.getDate())}/${padDatePart(
    date.getMonth() + 1
  )}/${date.getFullYear()}`;
};

export const formatShortDateToPtBr = (value: Date | string) => {
  const date = parseDateTime(value);

  if (!date) {
    return typeof value === "string" ? value : "";
  }

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
};

export const formatFullDateToPtBr = (value: Date | string) => {
  const date = parseDateTime(value);

  if (!date) {
    return typeof value === "string" ? value : "";
  }

  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export const formatTimeToPtBr = (value: Date | string) => {
  const date = parseDateTime(value);

  if (!date) {
    return typeof value === "string" ? value : "";
  }

  return `${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`;
};
