import {
  WellSummary,
  WellDetail,
  ProductionRecord,
  DigitalTwinState,
  CssSimulationRequest,
  CssSimulationResponse,
  SrpSimulationRequest,
  SrpSimulationResponse,
  OptimizationResponse,
  DashboardSummary,
  FieldOverview,
  EquipmentEvent,
  LoginRequest,
  LoginResponse,
  UserProfile,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorJson = await response.json();
        errorMessage = errorJson.detail || errorMessage;
      } catch {
        // Fallback to status text
      }
      throw new ApiError(response.status, errorMessage);
    }

    return await response.json();
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    // Network / connection error
    throw new Error('Unable to connect to Well-Nex Digital Twin services. Please verify backend server is running.');
  }
}

export const api = {
  getHealth: () => request<{ status: string; service: string }>('/health'),
  
  getWells: (statusFilter?: string) => 
    request<WellSummary[]>(statusFilter ? `/wells?status_filter=${statusFilter}` : '/wells'),
  
  getWell: (id: number) => request<WellDetail>(`/wells/${id}`),
  
  getProduction: (id: number, limit: number = 30) => 
    request<ProductionRecord[]>(`/wells/${id}/production?limit=${limit}`),
  
  getCss: (id: number) => request<any>(`/wells/${id}/css`),
  
  simulateCss: (id: number, data: CssSimulationRequest) => 
    request<CssSimulationResponse>(`/wells/${id}/css/simulate`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  applyCss: (id: number, data: CssSimulationRequest) =>
    request<any>(`/wells/${id}/css/apply`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  getSrp: (id: number) => request<any>(`/wells/${id}/srp`),
  
  simulateSrp: (id: number, data: SrpSimulationRequest) => 
    request<SrpSimulationResponse>(`/wells/${id}/srp/simulate`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  applySrp: (id: number, data: SrpSimulationRequest) =>
    request<any>(`/wells/${id}/srp/apply`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  getEquipment: (id: number) => request<any>(`/wells/${id}/equipment`),
  
  resolveEquipmentEvent: (eventId: number) =>
    request<any>(`/equipment/${eventId}/resolve`, {
      method: 'PATCH',
    }),
  
  getDigitalTwin: (id: number) => request<DigitalTwinState>(`/wells/${id}/digital-twin`),
  
  optimizeWell: (id: number, priority: string = 'BALANCED') => 
    request<OptimizationResponse>(`/wells/${id}/optimize`, {
      method: 'POST',
      body: JSON.stringify({ well_id: id, prioritize: priority }),
    }),
  
  getLatestOptimization: (id: number) => request<any>(`/wells/${id}/optimization/latest`),
  
  getFieldOverview: () => request<FieldOverview>('/field/overview'),
  
  getDashboardSummary: () => request<DashboardSummary>('/dashboard/summary'),
  
  login: (data: LoginRequest) =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => request<UserProfile>('/auth/me'),
};
