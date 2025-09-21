'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { manufacturingOrdersApi, type ManufacturingOrder } from '@/lib/api';

interface DataContextType {
  // Manufacturing Orders
  manufacturingOrders: ManufacturingOrder[];
  isLoading: boolean;
  error: string | null;

  // CRUD Operations
  fetchOrders: () => Promise<void>;
  updateOrder: (orderId: string, updatedData: Partial<ManufacturingOrder>) => Promise<void>;
  updateOrderOptimistic: (orderId: string, updatedData: Partial<ManufacturingOrder>) => void;
  addOrder: (newOrder: ManufacturingOrder) => void;
  deleteOrder: (orderId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;

  // Real-time update functions
  refreshData: () => Promise<void>;
  clearError: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}

interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const [orders, setOrders] = useState<ManufacturingOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all orders
  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await manufacturingOrdersApi.getAll();
      if (response.success && response.data) {
        setOrders(response.data);
      } else {
        setError('Failed to fetch manufacturing orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch manufacturing orders');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Optimistic update for immediate UI feedback
  const updateOrderOptimistic = useCallback((orderId: string, updatedData: Partial<ManufacturingOrder>) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order._id === orderId ? { ...order, ...updatedData } : order
      )
    );
  }, []);

  // Update order with backend sync
  const updateOrder = useCallback(async (orderId: string, updatedData: Partial<ManufacturingOrder>) => {
    // Store original order for rollback
    const originalOrder = orders.find(order => order._id === orderId);
    
    // Optimistic update
    updateOrderOptimistic(orderId, updatedData);
    
    try {
      const response = await manufacturingOrdersApi.update(orderId, updatedData);
      if (response.success && response.data) {
        // Update with server response
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order._id === orderId ? response.data : order
          )
        );
      } else {
        throw new Error('Failed to update order');
      }
    } catch (err) {
      console.error('Error updating order:', err);
      // Rollback on error
      if (originalOrder) {
        updateOrderOptimistic(orderId, originalOrder);
      }
      setError('Failed to update order');
      throw err;
    }
  }, [orders, updateOrderOptimistic]);

  // Update order status specifically
  const updateOrderStatus = useCallback(async (orderId: string, status: string) => {
    const originalOrder = orders.find(order => order._id === orderId);
    
    // Optimistic update
    updateOrderOptimistic(orderId, { status });
    
    try {
      const response = await manufacturingOrdersApi.updateStatus(orderId, status);
      if (response.success && response.data) {
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order._id === orderId ? response.data : order
          )
        );
      } else {
        throw new Error('Failed to update order status');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      // Rollback on error
      if (originalOrder) {
        updateOrderOptimistic(orderId, { status: originalOrder.status });
      }
      setError('Failed to update order status');
      throw err;
    }
  }, [orders, updateOrderOptimistic]);

  // Add new order
  const addOrder = useCallback((newOrder: ManufacturingOrder) => {
    setOrders(prevOrders => [...prevOrders, newOrder]);
  }, []);

  // Delete order
  const deleteOrder = useCallback(async (orderId: string) => {
    // Store original orders for rollback
    const originalOrders = [...orders];
    
    // Optimistic removal
    setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
    
    try {
      await manufacturingOrdersApi.delete(orderId);
    } catch (err) {
      console.error('Error deleting order:', err);
      // Rollback on error
      setOrders(originalOrders);
      setError('Failed to delete order');
      throw err;
    }
  }, [orders]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await fetchOrders();
  }, [fetchOrders]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Auto-refresh data every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading) {
        fetchOrders();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchOrders, isLoading]);

  const value: DataContextType = {
    manufacturingOrders: orders,
    isLoading,
    error,
    fetchOrders,
    updateOrder,
    updateOrderOptimistic,
    addOrder,
    deleteOrder,
    updateOrderStatus,
    refreshData,
    clearError,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}
