export const ONLINE_QUEUE_CHANGED = "clevermed:online-queue-changed";

export function notifyOnlineQueueChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(ONLINE_QUEUE_CHANGED));
}
