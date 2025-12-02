// lib/utils/logger.ts
export const logger = {
  team: {
    debug: (...args: any[]) => {
      if (process.env.NODE_ENV === "development") {
        console.groupCollapsed(
          "%c🧢 TEAM",
          "color: #3B82F6; font-weight: bold"
        );
        console.debug(...args);
        console.groupEnd();
      }
    },
    error: (error: Error, context?: Record<string, any>) => {
      console.error("%c🧢 TEAM ERROR", "color: #EF4444; font-weight: bold", {
        error: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
      });
    },
  },
  api: {
    request: (url: string, method: string, body?: any) => {
      if (process.env.NODE_ENV === "development") {
        console.log(
          "%c📡 API",
          "color: #10B981; font-weight: bold",
          `${method} ${url}`,
          body
        );
      }
    },
  },
  notification: {
    debug: (...args: any[]) => {
      if (process.env.NODE_ENV === "development") {
        console.groupCollapsed(
          "%c🧢 TEAM",
          "color: #3B82F6; font-weight: bold"
        );
        console.debug(...args);
        console.groupEnd();
      }
    },
    error: (error: Error, context?: Record<string, any>) => {
      console.error("%c🧢 TEAM ERROR", "color: #EF4444; font-weight: bold", {
        error: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
      });
    },
  },
};
