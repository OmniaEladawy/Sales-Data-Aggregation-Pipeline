export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const hoursAgoIso = (hoursAgo: number): string =>
  new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();
