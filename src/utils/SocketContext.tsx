'use client';

import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { Socket } from 'socket.io-client';

import { getSocket } from './socket';
import { getUserData } from './getUserData';
import { getToken } from './getUserToken';
import { logger } from './logger';

interface ISocketContext {
  socket: Socket;
  isConnected: boolean;
}

export const SocketContext = createContext<ISocketContext | undefined>(
  undefined,
);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const socket = getSocket();

  useEffect(() => {
    /* 🔑 Setup auth & connect */
    if (!socket.connected) {
      const token = getToken(); // sync usage like first example
      if (token) {
        socket.auth = { token: `Bearer ${token}` };
        logger.log('🔑 Socket auth token set');
      } else {
        logger.warn('No auth token found for socket');
      }

      socket.connect();
    }

    /* ✅ On connect */
    const handleConnect = async () => {
      setIsConnected(true);

      try {
        const user = await getUserData();
        const userId = user?.userId;

        if (userId) {
          socket.emit('register', userId);
          logger.log('🟢 Socket registered user:', userId);
        } else {
          logger.warn('No userId found for socket registration');
        }
      } catch (err) {
        logger.error('Error registering socket user:', err);
      }
    };

    /* ❌ On disconnect */
    const handleDisconnect = () => {
      setIsConnected(false);
      logger.warn('🔌 Socket disconnected');
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
