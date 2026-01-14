import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { addNotification } from '../store/notificationsSlice';
import { env } from '../config/env';
import { useAuthUser } from './useAuthUser';

export const useSocket = () => {
  const dispatch = useDispatch();
  const { authUser } = useAuthUser();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!authUser) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socketUrl = env.apiBaseUrl?.replace(/\/api$/, '') || 'http://localhost:3000';
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      if (authUser?.id) {
        console.log('Registering socket with MongoDB user ID:', authUser.id);
        socket.emit('register', authUser.id);
      } else {
        console.warn('Cannot register socket: authUser.id not available');
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socket.on('bid:hired', (data) => {
      console.log('Received bid:hired notification:', data);
      
      dispatch(
        addNotification({
          type: 'bid_hired',
          title: 'You Got Hired! 🎉',
          message: `You have been hired for "${data.gigTitle}"`,
          gigId: data.gigId,
          bidId: data.bidId,
        })
      );


      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('You Got Hired! 🎉', {
          body: `You have been hired for "${data.gigTitle}"`,
          icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%23fff"/><text x="50" y="70" font-size="60" font-weight="bold" text-anchor="middle" fill="%2309090b">GF</text></svg>',
          tag: data.bidId,
        });
      }
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [authUser, dispatch]);

  return socketRef.current;
};
