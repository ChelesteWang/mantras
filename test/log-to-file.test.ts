import * as fs from 'fs';
import { logToFile } from '../src/log-to-file';

// Mock the fs module
jest.mock('fs');

describe('logToFile', () => {
  const MOCK_MESSAGE = 'This is a test log message.';

  beforeEach(() => {
    // Reset mocks before each test
    (fs.appendFileSync as jest.Mock).mockClear();
  });

  it('should call fs.appendFileSync with the correct parameters on success', () => {
    logToFile(MOCK_MESSAGE);
    expect(fs.appendFileSync).toHaveBeenCalledTimes(1);
    expect(fs.appendFileSync).toHaveBeenCalledWith(expect.stringContaining('debug.log'), MOCK_MESSAGE + '\n');
  });

  it('should try a fallback path if the primary path fails', () => {
    // Arrange: Force the first appendFileSync to throw an error
    const MOCK_ERROR = new Error('Permission denied');
    (fs.appendFileSync as jest.Mock)
      .mockImplementationOnce(() => { throw MOCK_ERROR; })
      .mockImplementationOnce(() => {}); // The second call succeeds

    // Act
    logToFile(MOCK_MESSAGE);

    // Assert
    expect(fs.appendFileSync).toHaveBeenCalledTimes(2);
    expect(fs.appendFileSync).toHaveBeenCalledWith(expect.stringContaining('debug.log'), MOCK_MESSAGE + '\n');
    expect(fs.appendFileSync).toHaveBeenCalledWith('/tmp/debug.log', MOCK_MESSAGE + '\n');
  });

  it('should not throw an error if both primary and fallback paths fail', () => {
    // Arrange: Force both appendFileSync calls to throw an error
    const MOCK_ERROR = new Error('All logging failed');
    (fs.appendFileSync as jest.Mock).mockImplementation(() => {
      throw MOCK_ERROR;
    });

    // Act & Assert: Expect the function to catch all errors and not crash
    expect(() => {
      logToFile(MOCK_MESSAGE);
    }).not.toThrow();

    // Optional: Verify that both attempts were made
    expect(fs.appendFileSync).toHaveBeenCalledTimes(2);
  });
});