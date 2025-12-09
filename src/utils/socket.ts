// socket.ts
import { io, Socket } from 'socket.io-client';
import { DefaultEventsMap } from '@socket.io/component-emitter';
import { getBackendAPI } from './getAPI';

let socket: Socket<DefaultEventsMap, DefaultEventsMap> | null = null;

export const getSocket = (): Socket<DefaultEventsMap, DefaultEventsMap> => {
  const backendURL = getBackendAPI();
  if (!socket) {
    socket = io(backendURL, {
      path: '/socket.io',
      transports: ['websocket'],
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
    });
  }
  return socket;
};
