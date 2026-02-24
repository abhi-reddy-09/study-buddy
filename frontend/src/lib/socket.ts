import { io as ioClient, Socket } from 'socket.io-client';
import { getAuthToken } from './api';

const SOCKET_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export function connectSocket(): Socket | null {
  const token = getAuthToken();
  if (!token) return null;
  if (socket?.connected) return socket;

  socket = ioClient(SOCKET_BASE_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect_error', () => {
    // Connection failed (e.g. invalid token); caller can handle
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket(): Socket | null {
  return socket;
}
