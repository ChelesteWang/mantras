/**
 * Logger utility that only outputs logs when in debug mode.
 * Debug mode is determined by the NODE_ENV environment variable.
 */

const DEBUG_MODE = process.env.NODE_ENV === 'development';

/**
 * Logs a message to the console if in debug mode.
 * @param message The message to log.
 * @param optionalParams Optional additional parameters to log.
 */
export class Logger {
  static log(message?: any, ...optionalParams: any[]): void {
    if (DEBUG_MODE) {
      console.log(message, ...optionalParams);
    }
  }

  static warn(message?: any, ...optionalParams: any[]): void {
    if (DEBUG_MODE) {
      console.warn(message, ...optionalParams);
    }
  }

  static error(message?: any, ...optionalParams: any[]): void {
    if (DEBUG_MODE) {
      console.error(message, ...optionalParams);
    }
  }
}