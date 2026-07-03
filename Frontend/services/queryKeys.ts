export const queryKeys = {
  vehicles: ["vehicles"] as const,
  availableVehicles: ["vehicles", "available"] as const,
  requests: ["requests"] as const,
  notifications: ["notifications"] as const,
  trips: ["trips"] as const,
  trip: (routeId: string) => ["trips", routeId] as const,
  profile: ["profile"] as const,
  home: ["home"] as const,
};

export const queryRefreshIntervals = {
  fast: 1000 * 5,
  standard: 1000 * 10,
} as const;
