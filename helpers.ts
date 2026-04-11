// take random seconds between 1 and 5
export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
