// @ts-nocheck
const BUGSINK_DSN = "https://c2ccd525df2047828b2d0a3863c8b543@barakplasma.bugsink.com/5";

export function initBugTracking() {
  if (!window.Sentry || window.__HUMVEE_BUG_TRACKING__) return;

  window.Sentry.init({
    dsn: BUGSINK_DSN,
    tracesSampleRate: 0,
    sendDefaultPii: false,
    beforeSend(event) {
      if (event.request) delete event.request.cookies;
      return event;
    },
  });

  window.__HUMVEE_BUG_TRACKING__ = true;
}
