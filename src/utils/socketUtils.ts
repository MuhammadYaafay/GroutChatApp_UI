
import { io, Socket } from 'socket.io-client';
import { getAuthToken } from './authUtils';

let socket: Socket | null = null;

interface MessageData {
  content: string;
  timestamp?: string;
  // Add more fields if needed
}

export const initializeSocket = (): Socket => {
  if (socket) {
    return socket;
  }

  const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  
  socket = io(SOCKET_URL, {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  // Socket event listeners
  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', (reason) => {
    console.log(`Socket disconnected: ${reason}`);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
};

export const connectSocket = (userId: number): void => {
  const socket = initializeSocket();
  
  if (socket.connected) {
    socket.emit('authenticate', { userId });
    return;
  }
  
  socket.auth = { token: getAuthToken() };
  socket.connect();
  
  socket.on('connect', () => {
    socket.emit('authenticate', { userId });
  });
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
  }
};

export const getSocket = (): Socket | null => {
  return socket;
};

// Message handling
export const sendDirectMessage = (recipientId: number, messageData: MessageData): void => {
  if (!socket || !socket.connected) {
    throw new Error('Socket not connected');
  }
  
  socket.emit('direct_message', {
    recipientId,
    messageData
  });
};

export const sendChannelMessage = (channelId: number, messageData: MessageData): void => {
  if (!socket || !socket.connected) {
    throw new Error('Socket not connected');
  }
  
  socket.emit('channel_message', {
    channelId,
    messageData
  });
};

export const sendTypingIndicator = (params: { 
  recipientId?: number, 
  channelId?: number, 
  isTyping: boolean 
}): void => {
  if (!socket || !socket.connected) {
    return;
  }
  
  socket.emit('typing', params);
};

export const markMessageAsRead = (messageId: number, senderId: number): void => {
  if (!socket || !socket.connected) {
    return;
  }
  
  socket.emit('message_read', { messageId, senderId });
};

export const joinChannel = (channelId: number): void => {
  if (!socket || !socket.connected) {
    throw new Error('Socket not connected');
  }
  
  socket.emit('join_channel', { channelId });
};

export const leaveChannel = (channelId: number): void => {
  if (!socket || !socket.connected) {
    return;
  }
  
  socket.emit('leave_channel', { channelId });
};

export default {
  initializeSocket,
  connectSocket,
  disconnectSocket,
  getSocket,
  sendDirectMessage,
  sendChannelMessage,
  sendTypingIndicator,
  markMessageAsRead,
  joinChannel,
  leaveChannel
};
