import { io } from 'socket.io-client';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const SOCKET_URL = BASE_URL.replace('/api', '');
let adminSocket = null;

export const connectAdminSocket = () => {
  if (adminSocket) return adminSocket;

  adminSocket = io(`${SOCKET_URL}/admin`, {
    transports: ['websocket', 'polling'],
  });

  return adminSocket;
};

export const disconnectAdminSocket = () => { /* No hard disconnect */ };

export const getAdminSocket = () => adminSocket;

