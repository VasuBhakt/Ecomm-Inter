type LogLevel = "debug" | "info" | "warn" | "error";

interface LogMessage {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  private formatMessage(level: LogLevel, message: string, data?: any): LogMessage {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  private log(level: LogLevel, message: string, data?: any) {
    if (!this.isDevelopment && level === "debug") return;

    const formatted = this.formatMessage(level, message, data);
    const color = this.getColor(level);

    console.log(
      `%c[${formatted.timestamp}] [${level.toUpperCase()}]: %c${message}`,
      `color: gray; font-weight: lighter;`,
      `color: ${color}; font-weight: bold;`,
      data ?? ""
    );
  }

  private getColor(level: LogLevel): string {
    switch (level) {
      case "debug": return "#7f8c8d"; // Gray
      case "info":  return "#2ecc71"; // Green
      case "warn":  return "#f39c12"; // Orange
      case "error": return "#e74c3c"; // Red
      default:      return "#34495e";
    }
  }

  debug(message: string, data?: any) {
    this.log("debug", message, data);
  }

  info(message: string, data?: any) {
    this.log("info", message, data);
  }

  warn(message: string, data?: any) {
    this.log("warn", message, data);
  }

  error(message: string, data?: any) {
    this.log("error", message, data);
  }
}

export const logger = new Logger();
