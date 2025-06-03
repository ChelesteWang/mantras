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
export function log(message?: any, ...optionalParams: any[]): void {
  if (DEBUG_MODE) {
    console.log(message, ...optionalParams);
  }
}

/**
 * Logs a warning message to the console if in debug mode.
 * @param message The warning message to log.
 * @param optionalParams Optional additional parameters to log.
 */
export function warn(message?: any, ...optionalParams: any[]): void {
  if (DEBUG_MODE) {
    console.warn(message, ...optionalParams);
  }
}

/**
 * Logs an error message to the console if in debug mode.
 * @param message The error message to log.
 * @param optionalParams Optional additional parameters to log.
 */
export function error(message?: any, ...optionalParams: any[]): void {
  if (DEBUG_MODE) {
    console.error(message, ...optionalParams);
  }
}

/**
 * A simple logger object that groups logging functions.
 */
export const Logger = {
  log,
  warn,
  error,
};

export default Logger;