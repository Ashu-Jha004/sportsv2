type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";
type LogContext =
  | "AUTH"
  | "DATABASE"
  | "VALIDATION"
  | "API"
  | "CHALLENGE_SYSTEM"
  | "TEAM_SYSTEM"
  | "DISCOVER_SYSTEM";

interface LogEntry {
  level: LogLevel;
  context: LogContext;
  action: string;
  message: string;
  userId?: string;
  teamId?: string;
  data?: any;
  error?: Error;
  timestamp: string;
  stack?: string;
}

export class Logger {
  private static formatLog(entry: LogEntry): string {
    const emoji = {
      INFO: "ℹ️",
      WARN: "⚠️",
      ERROR: "❌",
      DEBUG: "🔍",
    }[entry.level];

    let log = `
╔════════════════════════════════════════════════════════════════
║ ${emoji} [${entry.level}] ${entry.context} - ${entry.action}
║ Time: ${entry.timestamp}`;

    if (entry.userId) log += `\n║ User ID: ${entry.userId}`;
    if (entry.teamId) log += `\n║ Team ID: ${entry.teamId}`;

    log += `\n║ Message: ${entry.message}`;

    if (entry.data) {
      log += `\n║ Data: ${JSON.stringify(entry.data, null, 2)}`;
    }

    if (entry.error) {
      log += `\n║ Error: ${entry.error.message}`;
    }

    if (entry.stack) {
      log += `\n║ Stack: ${entry.stack}`;
    }

    log += `\n╚════════════════════════════════════════════════════════════════`;

    return log;
  }

  static info(
    context: LogContext,
    action: string,
    message: string,
    data?: any
  ) {
    const entry: LogEntry = {
      level: "INFO",
      context,
      action,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
    console.log(this.formatLog(entry));

    // In production, send to monitoring service
    if (process.env.NODE_ENV === "production") {
      // TODO: Send to Sentry/LogRocket/DataDog
      // await sendToMonitoring(entry);
    }
  }

  static error(
    context: LogContext,
    action: string,
    message: string,
    error: unknown,
    userId?: string,
    teamId?: string,
    data?: any
  ) {
    const errorObj = error instanceof Error ? error : new Error(String(error));

    const entry: LogEntry = {
      level: "ERROR",
      context,
      action,
      message,
      userId,
      teamId,
      data,
      error: errorObj,
      stack: errorObj.stack,
      timestamp: new Date().toISOString(),
    };

    console.error(this.formatLog(entry));

    // In production, send to error tracking
    if (process.env.NODE_ENV === "production") {
      // TODO: Send to Sentry
      // Sentry.captureException(error, { extra: entry });
    }
  }

  static warn(
    context: LogContext,
    action: string,
    message: string,
    data?: any
  ) {
    const entry: LogEntry = {
      level: "WARN",
      context,
      action,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
    console.warn(this.formatLog(entry));
  }

  static debug(
    context: LogContext,
    action: string,
    message: string,
    data?: any
  ) {
    if (process.env.NODE_ENV === "development") {
      const entry: LogEntry = {
        level: "DEBUG",
        context,
        action,
        message,
        data,
        timestamp: new Date().toISOString(),
      };
      console.debug(this.formatLog(entry));
    }
  }
}

// Performance tracking helper
export class PerformanceTracker {
  private startTime: number;
  private action: string;

  constructor(action: string) {
    this.action = action;
    this.startTime = Date.now();
    Logger.debug("API", action, "Started");
  }

  end() {
    const duration = Date.now() - this.startTime;
    Logger.info("API", this.action, `Completed in ${duration}ms`);

    // Alert if slow (>3 seconds)
    if (duration > 3000) {
      Logger.warn("API", this.action, `Slow operation: ${duration}ms`);
    }

    return duration;
  }
}
