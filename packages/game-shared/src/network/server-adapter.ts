import { ISocketAdapter } from "./socket-adapter";

/**
 * Abstract interface for server-side WebSocket operations
 * This allows swapping WebSocket implementations without changing business logic
 */
export interface IServerAdapter {
  /**
   * Register an event listener on the server
   */
  on(event: string, listener: (...args: any[]) => void): this;

  /**
   * Emit an event to all connected clients
   */
  emit(event: string, ...args: any[]): boolean;

  /**
   * Native pub/sub broadcasting (uWebSockets.js only)
   * Bypasses JavaScript loop and broadcasts directly via C++
   * @param topic - The topic to publish to (e.g., "all")
   * @param message - Binary message to broadcast
   * @param isBinary - Whether the message is binary
   * @returns true if published successfully
   */
  publish?(topic: string, message: ArrayBuffer | Uint8Array, isBinary: boolean): boolean;

  /**
   * Start listening on a port
   */
  listen(port: number, callback?: () => void): void;

  /**
   * Get connected sockets
   */
  readonly sockets: {
    size: number;
    sockets: Map<string, ISocketAdapter>;
  };
}
