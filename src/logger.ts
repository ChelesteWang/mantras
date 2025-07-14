import { createLogger, format, transports, Logger as WinstonLoggerInstance } from 'winston';

// Define a generic Logger interface to allow for pluggable implementations
export interface Logger {
  info(message: string): void;
  warn(message: string, meta?: any): void;
  error(message: string, error?: Error): void;
  debug(message: string, meta?: any): void;
}

// Create a class that implements our Logger interface and uses the winston instance.
export class WinstonLogger implements Logger {
  private logger: WinstonLoggerInstance;
  
  constructor() {
    this.logger = createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
      ),
      defaultMeta: { service: 'mantras-app' },
      transports: [
        new transports.File({ filename: 'error.log', level: 'error' }),
        new transports.File({ filename: 'combined.log' })
      ]
    });

    // If we're not in production, log to the console as well with a simple format.
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new transports.Console({
        format: format.combine(
          format.colorize(),
          format.simple()
        )
      }));
    }
  }

  public info(message: string): void {
    this.logger.info(message);
  }

  public warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  public error(message: string, error?: Error): void {
    this.logger.error(message, error);
  }

  public debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }
}

// Export a singleton instance of our logger.
// The rest of the application will use this instance, which adheres to the Logger interface.
export const logger: Logger = new WinstonLogger();