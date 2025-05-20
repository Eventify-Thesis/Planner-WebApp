import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUser } from '@clerk/clerk-react';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connect: (code: string, isHost?: boolean) => void;
  disconnect: () => void;
  currentCode: string | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

// Create a persistent socket reference outside the component
let persistentSocket: Socket | null = null;
let persistentCode: string | null = null;

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(persistentSocket);
  const [isConnected, setIsConnected] = useState(!!persistentSocket?.connected);
  const [currentCode, setCurrentCode] = useState<string | null>(persistentCode);
  const { user } = useUser();

  const connect = (code: string, isHost: boolean = false) => {
    // If a socket exists with the same code, reuse it
    if (persistentSocket && persistentCode === code && persistentSocket.connected) {
      console.log('Reusing existing socket connection for code:', code);
      setSocket(persistentSocket);
      setIsConnected(true);
      setCurrentCode(code);
      return;
    }

    // If a different code or no connection, create a new socket
    if (persistentSocket) {
      persistentSocket.disconnect();
    }

    console.log('Creating new socket connection for code:', code, 'isHost:', isHost);
    const newSocket = io(`${import.meta.env.VITE_API_BASE_URL}/quiz`, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      auth: {
        code,
        isHost,
        userId: isHost ? 'host-user' : user?.id,
        username: isHost ? 'Quiz Host' : user?.fullName,
      },
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to WebSocket');
      
      // Join the quiz using the code
      newSocket.emit('joinQuizByCode', {
        code,
        userId: isHost ? 'host-user' : user?.id,
        username: isHost ? 'Quiz Host' : user?.fullName,
        isHost,
      });
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from WebSocket');
    });

    // Update all references
    persistentSocket = newSocket;
    persistentCode = code;
    setSocket(newSocket);
    setCurrentCode(code);
  };

  const disconnect = () => {
    if (persistentSocket) {
      persistentSocket.disconnect();
      persistentSocket = null;
      persistentCode = null;
      setSocket(null);
      setCurrentCode(null);
      setIsConnected(false);
    }
  };

  // Cleanup on unmount of the entire app
  useEffect(() => {
    return () => {
      if (persistentSocket) {
        console.log('Disconnecting socket');
        persistentSocket.disconnect();
        persistentSocket = null;
        persistentCode = null;
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, connect, disconnect, currentCode }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
} 