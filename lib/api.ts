const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// API utility class for making HTTP requests
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('flowforge_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
    });
    return this.handleResponse<T>(response);
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });
    return this.handleResponse<T>(response);
  }
}

// Create and export API client instance
export const api = new ApiClient(API_BASE_URL);

// API response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  total?: number;
  pagination?: {
    page: number;
    limit: number;
    pages: number;
  };
}

// Manufacturing Order types
export interface ManufacturingOrder {
  _id: string;
  reference: string;
  finishedProduct: string;
  quantity: number;
  scheduledStartDate: string;
  dueDate: string;
  assignee: {
    _id: string;
    username: string;
    email: string;
    role: string;
  };
  status: 'Draft' | 'Confirmed' | 'In Progress' | 'To Close' | 'Done' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  progress: number;
  actualStartDate?: string;
  actualEndDate?: string;
  notes?: string;
  components: Array<{
    materialId?: string;
    name: string;
    quantity: number;
    unit: string;
    unitCost: number;
  }>;
  workOrders: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: {
    _id: string;
    username: string;
    email: string;
  };
}

// Work Order types
export interface WorkOrder {
  _id: string;
  reference: string;
  manufacturingOrderId: string;
  operationName: string;
  workCenter: {
    _id: string;
    name: string;
    code: string;
    type: string;
  };
  sequence: number;
  expectedDuration: number;
  realDuration: number;
  status: 'Pending' | 'In Progress' | 'Paused' | 'Completed' | 'Cancelled';
  assignee: {
    _id: string;
    username: string;
    email: string;
    role: string;
  };
  startTime?: string;
  endTime?: string;
  pausedTime: number;
  comments: Array<{
    text: string;
    author: {
      _id: string;
      username: string;
      email: string;
    };
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Stock Ledger types
export interface StockItem {
  _id: string;
  materialName: string;
  materialCode: string;
  category: string;
  unit: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  reorderLevel: number;
  maxStock: number;
  averageCost: number;
  lastCost: number;
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Overstock';
  stockValue: number;
  location: {
    warehouse: string;
    zone?: string;
    bin?: string;
  };
  supplier: {
    name?: string;
    contact?: string;
    leadTime: number;
  };
  lastMovement: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Work Center types
export interface WorkCenter {
  _id: string;
  name: string;
  code: string;
  description?: string;
  type: 'Machine' | 'Assembly' | 'Quality' | 'Packaging' | 'Storage';
  location: string;
  costPerHour: number;
  capacity: {
    hoursPerDay: number;
    daysPerWeek: number;
    efficiency: number;
  };
  status: 'Active' | 'Maintenance' | 'Inactive' | 'Broken';
  availability: number;
  effectiveCapacity: number;
  operators: Array<{
    _id: string;
    username: string;
    email: string;
    role: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// API service functions
export const manufacturingOrdersApi = {
  getAll: (params?: Record<string, any>) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return api.get<ApiResponse<ManufacturingOrder[]>>(`/manufacturing-orders${queryString}`);
  },
  getById: (id: string) => api.get<ApiResponse<ManufacturingOrder>>(`/manufacturing-orders/${id}`),
  create: (data: Partial<ManufacturingOrder>) => api.post<ApiResponse<ManufacturingOrder>>('/manufacturing-orders', data),
  update: (id: string, data: Partial<ManufacturingOrder>) => api.put<ApiResponse<ManufacturingOrder>>(`/manufacturing-orders/${id}`, data),
  updateStatus: (id: string, status: string) => api.patch<ApiResponse<ManufacturingOrder>>(`/manufacturing-orders/${id}/status`, { status }),
  delete: (id: string) => api.delete<ApiResponse<void>>(`/manufacturing-orders/${id}`),
  getStats: () => api.get<ApiResponse<any>>('/manufacturing-orders/stats/overview'),
};

export const workOrdersApi = {
  getAll: (params?: Record<string, any>) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return api.get<ApiResponse<WorkOrder[]>>(`/work-orders${queryString}`);
  },
  getById: (id: string) => api.get<ApiResponse<WorkOrder>>(`/work-orders/${id}`),
  create: (data: Partial<WorkOrder>) => api.post<ApiResponse<WorkOrder>>('/work-orders', data),
  update: (id: string, data: Partial<WorkOrder>) => api.put<ApiResponse<WorkOrder>>(`/work-orders/${id}`, data),
  start: (id: string) => api.patch<ApiResponse<WorkOrder>>(`/work-orders/${id}/start`),
  complete: (id: string, data?: any) => api.patch<ApiResponse<WorkOrder>>(`/work-orders/${id}/complete`, data),
  addComment: (id: string, text: string) => api.post<ApiResponse<any>>(`/work-orders/${id}/comments`, { text }),
};

export const stockLedgerApi = {
  getAll: (params?: Record<string, any>) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return api.get<ApiResponse<StockItem[]>>(`/stock-ledger${queryString}`);
  },
  getById: (id: string) => api.get<ApiResponse<StockItem>>(`/stock-ledger/${id}`),
  create: (data: Partial<StockItem>) => api.post<ApiResponse<StockItem>>('/stock-ledger', data),
  update: (id: string, data: Partial<StockItem>) => api.put<ApiResponse<StockItem>>(`/stock-ledger/${id}`, data),
  addTransaction: (id: string, transaction: any) => api.post<ApiResponse<any>>(`/stock-ledger/${id}/transaction`, transaction),
  getLowStock: () => api.get<ApiResponse<StockItem[]>>('/stock-ledger/alerts/low-stock'),
  getStats: () => api.get<ApiResponse<any>>('/stock-ledger/stats/overview'),
};

export const workCentersApi = {
  getAll: (params?: Record<string, any>) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return api.get<ApiResponse<WorkCenter[]>>(`/work-centers${queryString}`);
  },
  getById: (id: string) => api.get<ApiResponse<WorkCenter>>(`/work-centers/${id}`),
  create: (data: Partial<WorkCenter>) => api.post<ApiResponse<WorkCenter>>('/work-centers', data),
  update: (id: string, data: Partial<WorkCenter>) => api.put<ApiResponse<WorkCenter>>(`/work-centers/${id}`, data),
  updateStatus: (id: string, status: string, reason?: string) => api.patch<ApiResponse<WorkCenter>>(`/work-centers/${id}/status`, { status, reason }),
  delete: (id: string) => api.delete<ApiResponse<void>>(`/work-centers/${id}`),
};
