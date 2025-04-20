
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { getAuthToken } from '@/utils/authUtils';

interface MessageData {
  content: string;
  timestamp?: string;
  // Add more fields if needed
}

export const useChatSocket = (onMessage: (data: MessageData) => void) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const token = getAuthToken();

    if (!token) return;

    socketRef.current = io(SOCKET_URL, {
      query: { token },
      autoConnect: true,
    });

    socketRef.current.on('message', onMessage);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [onMessage]);

  return socketRef.current;
};
