// socket.ts
import { io, Socket } from 'socket.io-client';
import { DefaultEventsMap } from '@socket.io/component-emitter';
import { getBackendAPI } from './getAPI';

let socket: Socket<DefaultEventsMap, DefaultEventsMap> | null = null;

export const getSocket = (): Socket<DefaultEventsMap, DefaultEventsMap> => {
  // Remove any trailing /api to hit the socket root
  const backendURL = getBackendAPI().replace(/\/api\/?$/, '');
  if (!socket) {
    socket = io(backendURL, {
      path: '/socket.io',
      transports: ['websocket'],
      withCredentials: true,
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
    });
  }
  return socket;
};
