import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  loginUser,
  registerUser,
  getCurrentUser,
  depositFunds,
  withdrawFunds,
  getTransactions,
  getWalletSummary,
  getPortfolio,
  buyStock,
  sellStock,
  getNotifications,
  markAllNotificationsRead,
  logoutUser,
} from '../utils/services.js';
import { allStocks } from '../utils/marketData.js';
import { io } from 'socket.io-client';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const SOCKET_URL = BASE_URL.replace('/api', '');
let socket = null;

// ==================== Market Store (with real-time updates) ====================
export const useMarketStore = create((set, get) => {
  // Initialize stocks from marketData.js, adding basePrice for calculations
  const initialStocks = allStocks.map(stock => ({
    ...stock,
    basePrice: stock.price,
    lastChange: 0,
    direction: 'neutral' // 'up', 'down', 'neutral'
  }));

  return {
    stocks: initialStocks,
    isUpdating: false,
    intervalId: null,

    // Update single stock price
    updateStockPrice: (symbol, newPrice, newChange, newChangePercent, direction) => {
      set((state) => ({
        stocks: state.stocks.map(stock =>
          stock.symbol === symbol
            ? {
              ...stock,
              price: newPrice,
              change: newChange,
              changePercent: newChangePercent,
              lastChange: Date.now(),
              direction,
              // Update sparkline by shifting and adding new value
              sparkline: [...stock.sparkline.slice(1), newPrice]
            }
            : stock
        )
      }));
    },

    // Start real-time price updates
    startRealTimeUpdates: () => {
      if (get().intervalId) return;

      const intervalId = setInterval(() => {
        const currentStocks = get().stocks;

        currentStocks.forEach(stock => {
          // Random fluctuation logic (realistic small changes)
          const volatility = 0.002; // 0.2% volatility per tick
          const change = (Math.random() - 0.5) * 2 * volatility * stock.basePrice;
          const newPrice = Math.max(0.01, stock.price + change);
          const totalChange = newPrice - stock.basePrice;
          const totalChangePercent = (totalChange / stock.basePrice) * 100;
          const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';

          if (Math.abs(change) > 0.001) {
            get().updateStockPrice(stock.symbol, newPrice, totalChange, totalChangePercent, direction);
          }
        });
      }, 800); // Update every 800ms

      set({ intervalId, isUpdating: true });
    },

    // Stop real-time updates
    stopRealTimeUpdates: () => {
      const { intervalId } = get();
      if (intervalId) {
        clearInterval(intervalId);
        set({ intervalId: null, isUpdating: false });
      }
    },

    // Get stock by symbol
    getStock: (symbol) => {
      return get().stocks.find(s => s.symbol === symbol);
    }
  };
});

// ==================== Auth Store ====================
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      // Connect to socket
      connectSocket: () => {
        if (socket || !get().user) return;

        socket = io(SOCKET_URL, {
          transports: ['websocket', 'polling'],
        });

        socket.on('connect', () => {
          console.log('✅ Connected to socket server');
          if (get().user?._id) {
            socket.emit('joinUserRoom', get().user._id);
          }
        });

        // Listen for wallet updates
        socket.on('walletUpdate', async (data) => {
          console.log('📥 Wallet update received:', data);
          // Update local balance immediately
          if (data.newBalance) {
            get().updateBalance(data.newBalance);
          }
          // Refresh wallet transactions and summary
          await Promise.all([
            useWalletStore.getState().fetchTransactions(),
            useWalletStore.getState().fetchSummary(),
          ]);
        });

        // Listen for trade updates
        socket.on('tradeUpdate', async (data) => {
          console.log('📥 Trade update received:', data);
          // Update local balance immediately
          if (data.newBalance) {
            get().updateBalance(data.newBalance);
          }
          // Refresh portfolio and wallet data
          await Promise.all([
            useTradeStore.getState().fetchPortfolio(),
            useWalletStore.getState().fetchTransactions(),
            useWalletStore.getState().fetchSummary(),
          ]);
          // Increment unread count (for new notification)
          useNotificationStore.getState().incrementUnread();
        });

        // Listen for notification updates
        socket.on('notificationUpdate', async () => {
          console.log('📥 Notification update received');
          await useNotificationStore.getState().fetchNotifications(1, true);
        });

        socket.on('disconnect', () => {
          console.log('❌ Disconnected from socket server');
        });
      },

      // Disconnect socket
      disconnectSocket: () => {
        if (socket) {
          socket.disconnect();
          socket = null;
        }
      },

      // Login action
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const data = await loginUser({ email, password });
          localStorage.setItem('token', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          set({
            user: data.user,
            token: data.accessToken,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          // Connect to socket after login
          get().connectSocket();
          return { success: true, message: data.message };
        } catch (error) {
          set({ isLoading: false });
          const msg = error.response?.data?.message || 'Login failed. Please try again.';
          return { success: false, message: msg };
        }
      },

      // Register action
      register: async (name, email, password) => {
        set({ isLoading: true });
        try {
          const data = await registerUser({ name, email, password });
          set({ isLoading: false });
          return { success: true, message: data.message };
        } catch (error) {
          set({ isLoading: false });
          const msg = error.response?.data?.message || 'Registration failed.';
          return { success: false, message: msg };
        }
      },

      // Logout action
      logout: async () => {
        const { user, refreshToken } = get();
        try {
          if (user?._id) {
            await logoutUser(user._id, refreshToken);
          }
        } catch (error) {
          console.error('Logout API error:', error);
        }
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        // Disconnect socket before logging out
        get().disconnectSocket();
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      // Refresh user data from backend
      refreshUser: async () => {
        try {
          const data = await getCurrentUser();
          set({ user: data.user });
          // Connect socket if not already connected
          get().connectSocket();
        } catch (error) {
          // Token invalid - logout
          get().logout();
        }
      },

      // Update user balance locally (after trade/wallet)
      updateBalance: (newBalance) => {
        set((state) => ({
          user: state.user ? { ...state.user, balance: newBalance } : null,
        }));
      },

      // Update user data manually
      setUser: (userData) => {
        set({ user: userData });
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// ==================== Wallet Store ====================
export const useWalletStore = create((set, get) => ({
  transactions: [],
  summary: null,
  isLoading: false,
  pagination: null,

  // Fetch transactions
  fetchTransactions: async (page = 1, limit = 20, type = null) => {
    set({ isLoading: true });
    try {
      const data = await getTransactions(page, limit, type);
      set({
        transactions: data.transactions,
        pagination: data.pagination,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  // Fetch wallet summary
  fetchSummary: async () => {
    try {
      const data = await getWalletSummary();
      set({ summary: data });
      // Update auth store balance too
      useAuthStore.getState().updateBalance(data.balance);
    } catch (error) {
      console.error('Failed to fetch wallet summary:', error);
    }
  },

  // Deposit
  deposit: async (amount) => {
    set({ isLoading: true });
    try {
      const data = await depositFunds(amount);
      // Update balance in auth store
      useAuthStore.getState().updateBalance(data.balance);
      // Refresh transactions and summary
      await Promise.all([
        get().fetchTransactions(),
        get().fetchSummary()
      ]);
      set({ isLoading: false });
      return { success: true, message: data.message, balance: data.balance };
    } catch (error) {
      set({ isLoading: false });
      const msg = error.response?.data?.message || 'Deposit failed.';
      return { success: false, message: msg };
    }
  },

  // Withdraw
  withdraw: async (amount) => {
    set({ isLoading: true });
    try {
      const data = await withdrawFunds(amount);
      // Update balance in auth store
      useAuthStore.getState().updateBalance(data.balance);
      // Refresh transactions and summary
      await Promise.all([
        get().fetchTransactions(),
        get().fetchSummary()
      ]);
      set({ isLoading: false });
      return { success: true, message: data.message, balance: data.balance };
    } catch (error) {
      set({ isLoading: false });
      const msg = error.response?.data?.message || 'Withdrawal failed.';
      return { success: false, message: msg };
    }
  },
}));

// ==================== Portfolio / Trade Store ====================
export const useTradeStore = create((set, get) => ({
  portfolio: null,
  holdings: [],
  tradeHistory: [],
  isLoading: false,

  // Fetch portfolio
  fetchPortfolio: async () => {
    set({ isLoading: true });
    try {
      const data = await getPortfolio();
      set({
        portfolio: data.portfolio,
        holdings: data.portfolio?.holdings || [],
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  // Buy stock
  executeBuy: async (symbol, name, quantity, price) => {
    set({ isLoading: true });
    try {
      const data = await buyStock(symbol, name, quantity, price);
      // Update balance in auth store
      useAuthStore.getState().updateBalance(data.trade.newBalance);
      // Refresh portfolio and wallet transactions/summary
      await Promise.all([
        get().fetchPortfolio(),
        useWalletStore.getState().fetchTransactions(),
        useWalletStore.getState().fetchSummary()
      ]);
      set({ isLoading: false });
      return { success: true, message: data.message, trade: data.trade };
    } catch (error) {
      set({ isLoading: false });
      const msg = error.response?.data?.message || 'Buy order failed.';
      return { success: false, message: msg };
    }
  },

  // Sell stock
  executeSell: async (symbol, quantity, price) => {
    set({ isLoading: true });
    try {
      const data = await sellStock(symbol, quantity, price);
      // Update balance in auth store
      useAuthStore.getState().updateBalance(data.trade.newBalance);
      // Refresh portfolio and wallet transactions/summary
      await Promise.all([
        get().fetchPortfolio(),
        useWalletStore.getState().fetchTransactions(),
        useWalletStore.getState().fetchSummary()
      ]);
      set({ isLoading: false });
      return { success: true, message: data.message, trade: data.trade };
    } catch (error) {
      set({ isLoading: false });
      const msg = error.response?.data?.message || 'Sell order failed.';
      return { success: false, message: msg };
    }
  },
}));

// ==================== Notification Store ====================
export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  pagination: null,

  // Fetch notifications
  fetchNotifications: async (page = 1, silent = false) => {
    if (!silent) set({ isLoading: true });
    try {
      const data = await getNotifications(page);
      set({
        notifications: page === 1
          ? data.notifications
          : [...get().notifications, ...data.notifications],
        unreadCount: data.unreadCount,
        pagination: data.pagination,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  // Mark all as read
  markAllRead: async () => {
    try {
      await markAllNotificationsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  },

  // Increment unread count (used when new notification arrives)
  incrementUnread: () => {
    set((state) => ({ unreadCount: state.unreadCount + 1 }));
  },
}));

// ==================== Theme Store ====================
export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'dark', // Default dark theme

      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark';
        set({ theme: newTheme });
        // Apply to DOM
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      setTheme: (theme) => {
        set({ theme });
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    }),
    {
      name: 'theme-storage', // localStorage key
    }
  )
);

// ==================== Legacy store (backward compatibility) ====================
// For pages using the legacy store - please migrate to the new stores
export const useStore = create((set, get) => ({
  get balance() {
    return useAuthStore.getState().user?.balance || 0;
  },
  get portfolio() {
    return useTradeStore.getState().holdings || [];
  },
  get transactionHistory() {
    return useWalletStore.getState().transactions || [];
  },

  addFunds: async (amount) => {
    return await useWalletStore.getState().deposit(amount);
  },

  withdrawFunds: async (amount) => {
    return await useWalletStore.getState().withdraw(amount);
  },

  executeTrade: async (type, stock, quantity, price) => {
    if (type === 'buy') {
      return await useTradeStore.getState().executeBuy(
        stock.symbol,
        stock.name,
        quantity,
        price
      );
    }
    if (type === 'sell') {
      return await useTradeStore.getState().executeSell(
        stock.symbol,
        quantity,
        price
      );
    }
    return { success: false, message: 'Invalid trade type' };
  },
}));
