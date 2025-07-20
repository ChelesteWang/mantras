import { Logger } from '../src/infrastructure/logging/logger';

// Define a reusable mock logger instance
const mockWinstonLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  add: jest.fn(),
};

// Mock the winston library
jest.mock('winston', () => ({
  format: {
    combine: jest.fn((...args) => args.join(' ')),
    timestamp: jest.fn(() => 'timestamp'),
    errors: jest.fn(() => 'errors'),
    splat: jest.fn(() => 'splat'),
    json: jest.fn(() => 'json'),
    colorize: jest.fn(() => 'colorize'),
    simple: jest.fn(() => 'simple'),
  },
  // Important: Always return the same mock instance
  createLogger: jest.fn().mockReturnValue(mockWinstonLogger),
  transports: {
    File: jest.fn(),
    Console: jest.fn(),
  },
}));

// Import the logger singleton *after* the mock has been defined.
// This ensures it gets created with the mocked winston.
const { logger }: { logger: Logger } = require('../src/infrastructure/logging/logger');

describe('WinstonLogger Singleton', () => {
  beforeEach(() => {
    // Clear all mock calls before each test
    jest.clearAllMocks();
    // Re-configure createLogger to return the shared mock instance for each test,
    // as clearAllMocks also clears mock implementations.
    const winston = require('winston');
    winston.createLogger.mockReturnValue(mockWinstonLogger);
  });

  it('should call the info method on the winston logger', () => {
    const message = 'test info';
    logger.info(message);
    expect(mockWinstonLogger.info).toHaveBeenCalledWith(message);
    expect(mockWinstonLogger.info).toHaveBeenCalledTimes(1);
  });

  it('should call the warn method on the winston logger', () => {
    const message = 'test warning';
    const meta = { data: 123 };
    logger.warn(message, meta);
    expect(mockWinstonLogger.warn).toHaveBeenCalledWith(message, meta);
    expect(mockWinstonLogger.warn).toHaveBeenCalledTimes(1);
  });

  it('should call the error method on the winston logger', () => {
    const message = 'test error';
    const error = new Error('test');
    logger.error(message, error);
    expect(mockWinstonLogger.error).toHaveBeenCalledWith(message, error);
    expect(mockWinstonLogger.error).toHaveBeenCalledTimes(1);
  });

  it('should call the debug method on the winston logger', () => {
    const message = 'test debug';
    const meta = { details: 'more info' };
    logger.debug(message, meta);
    expect(mockWinstonLogger.debug).toHaveBeenCalledWith(message, meta);
    expect(mockWinstonLogger.debug).toHaveBeenCalledTimes(1);
  });
});
