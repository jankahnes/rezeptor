// composables/useEngagement.ts
interface EngagementEvent {
  recipeId: number;
  type: 'click' | 'time_spent' | 'copy' | 'shopping_list' | 'share';
}

let eventQueue: EngagementEvent[] = [];
let flushInterval: NodeJS.Timeout | null = null;

const flushEvents = async () => {
  if (eventQueue.length === 0) return;

  const eventsToSend = [...eventQueue];
  eventQueue = [];

  try {
    await $fetch('/api/track-engagement', {
      method: 'POST',
      body: { events: eventsToSend },
    });
  } catch (error) {
    console.error('Failed to track engagement:', error);
  }
};

if (process.client && !flushInterval) {
  flushInterval = setInterval(flushEvents, 10000);

  window.addEventListener('beforeunload', () => {
    if (eventQueue.length > 0) {
      navigator.sendBeacon(
        '/api/track-engagement',
        JSON.stringify({ events: eventQueue })
      );
    }
  });
}

export const useEngagement = () => {
  const track = (
    recipeId: number | null | undefined,
    type: EngagementEvent['type']
  ) => {
    if (!recipeId) return;
    eventQueue.push({ recipeId, type });
  };

  const trackTimeSpent = (recipeId: number) => {
    if (!process.client) return;

    let elapsed = 0;
    const interval = setInterval(() => elapsed++, 1000);
    let tracked = false;

    const cleanup = () => {
      clearInterval(interval);
      if (elapsed > 30 && !tracked) {
        track(recipeId, 'time_spent');
        tracked = true;
      }
    };

    onBeforeUnmount(cleanup);

    if (document) {
      document.addEventListener('visibilitychange', cleanup, { once: true });
    }
  };

  return {
    track,
    trackTimeSpent,
  };
};
