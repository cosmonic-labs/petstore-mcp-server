// Mock implementation of wasi:config/store for test environments
// This allows tests to run in Node.js without actual WASI runtime

/**
 * Gets a configuration value of type `string` associated with the `key`.
 *
 * In test environment, this returns undefined (no config set)
 */
export function get(key: string): string | undefined {
  // Return undefined to use default values in tests
  return undefined;
}

/**
 * Gets a list of configuration key-value pairs of type `string`.
 */
export function getAll(): Array<[string, string]> {
  return [];
}

/**
 * An error type that encapsulates the different errors that can occur fetching configuration values.
 */
export type Error = ErrorUpstream | ErrorIo;

export interface ErrorUpstream {
  tag: 'upstream',
  val: string,
}

export interface ErrorIo {
  tag: 'io',
  val: string,
}
