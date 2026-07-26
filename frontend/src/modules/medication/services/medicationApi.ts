import apiClient from '@/shared/lib/apiClient';
import { Medication, RefillRequest } from '../types/medication.types';

export interface CreateMedicationDto {
  name: string;
  dosage?: string;
  frequency?: string;
  currentStock?: number;
  totalStock?: number;
  quantity?: number;
  conditionId?: string;
  patientId?: string;
  formType?: 'TABLET' | 'CAPSULE' | 'SYRUP' | 'INJECTION' | 'DROP' | 'CREAM' | 'OTHER';
  isChronic?: boolean;
  relationToMeals?: 'BEFORE_MEALS' | 'AFTER_MEALS' | 'WITH_FOOD' | 'ON_EMPTY_STOMACH' | 'NONE';
  firstDoseTime?: string;
  startDate?: string;
  endDate?: string | null;
  expirationDate?: string;
  iconType?: string;
  inventory?: {
    initialQuantity: number;
    currentQuantity: number;
    doseAmount: number;
    refillThreshold: number;
  };
  instructions?: {
    relationToMeals: string;
    notes?: string;
  };
  schedule?: {
    frequency: string;
    dosesPerDay: number;
    firstDoseTime: string;
    startDate: string;
    endDate?: string | null;
  };
}

export interface UpdateMedicationDto extends Partial<CreateMedicationDto> {
  isActive?: boolean;
}

export interface CreateRefillOrderDto {
  medicationId: string;
  targetPharmacyId?: string;
  quantityRequested?: number;
  fulfillmentType?: 'PICKUP' | 'DELIVERY';
  deliveryAddress?: {
    street?: string;
    city?: string;
    zipCode?: string;
  };
}

export interface UpdateRefillStatusDto {
  orderStatus: 'SUBMITTED' | 'APPROVED' | 'DISPENSED' | 'READY_FOR_PICKUP' | 'COMPLETED' | 'REJECTED';
  pharmacistNotes?: string;
}

export const medicationApi = {
  // Helper to resolve or auto-create a medical condition ID for the patient via GET/POST /conditions
  getOrCreateDefaultConditionId: async (): Promise<string> => {
    const fallbackId = '660000000000000000000001';
    try {
      const response = await apiClient.get('/conditions');
      const conditions = response.data.data || response.data;
      if (Array.isArray(conditions) && conditions.length > 0) {
        const foundId = conditions[0]._id || conditions[0].id || conditions[0].conditionId;
        if (foundId) return String(foundId);
      }

      // Create a default medical condition if patient doesn't have one yet
      const createRes = await apiClient.post('/conditions', {
        diseaseName: 'General Health',
        isChronic: true,
        diagnosedDate: new Date().toISOString().split('T')[0],
        notes: 'General health management',
      });
      const newCondition = createRes.data.data || createRes.data;
      const createdId = newCondition._id || newCondition.id || newCondition.conditionId;
      return String(createdId || fallbackId);
    } catch (err: any) {
      console.warn('Could not auto-fetch/create conditionId via /conditions:', err?.response?.data || err.message);
      return fallbackId;
    }
  },

  // 1. GET /medications -> List Medications
  getMedications: async (params?: Record<string, any>): Promise<Medication[]> => {
    try {
      const response = await apiClient.get('/medications', { params });
      const data = response.data.data || response.data;
      if (Array.isArray(data)) {
        return data.map(mapBackendMedicationToUi);
      }
      return [];
    } catch (error: any) {
      console.warn('API /medications error:', error?.response?.data || error.message);
      return [];
    }
  },

  // 2. GET /medications/:medicationId -> Single Medication
  getMedicationById: async (id: string): Promise<Medication> => {
    const response = await apiClient.get(`/medications/${id}`);
    const data = response.data.data || response.data;
    return mapBackendMedicationToUi(data);
  },

  // 3. POST /medications -> Create Medication (preserves exact user input values)
  createMedication: async (payload: any): Promise<Medication> => {
    let backendPayload: any;

    if (payload.inventory && payload.schedule && payload.instructions) {
      // User passed structured DTO directly from modal
      backendPayload = { ...payload };
    } else {
      // Helper fallback for flat payload
      const formTypeMap: Record<string, string> = {
        pill: 'TABLET',
        bottle: 'SYRUP',
        kit: 'OTHER',
        urgent_pill: 'TABLET',
      };

      const formType = payload.formType || formTypeMap[payload.iconType || 'pill'] || 'TABLET';
      const startDate = payload.startDate
        ? new Date(payload.startDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      const expDate = payload.expirationDate
        ? new Date(payload.expirationDate).toISOString().split('T')[0]
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      backendPayload = {
        name: payload.name,
        formType,
        isChronic: payload.isChronic !== undefined ? payload.isChronic : true,
        inventory: {
          initialQuantity: Number(payload.quantity || payload.totalStock || 30),
          currentQuantity: Number(payload.quantity || payload.currentStock || 30),
          doseAmount: Number(payload.doseAmount || 1),
          refillThreshold: Number(payload.refillThreshold || 5),
        },
        instructions: {
          relationToMeals: payload.relationToMeals || 'WITH_FOOD',
          notes: payload.notes || payload.dosage || '',
        },
        schedule: {
          frequency: payload.frequency || 'DAILY',
          dosesPerDay: Number(payload.dosesPerDay || 1),
          firstDoseTime: payload.firstDoseTime || '08:00',
          startDate,
          endDate: payload.isChronic ? null : payload.endDate || null,
        },
        expirationDate: expDate,
      };
    }

    // Auto-resolve conditionId if missing
    if (!backendPayload.conditionId) {
      backendPayload.conditionId = await medicationApi.getOrCreateDefaultConditionId();
    }

    try {
      const response = await apiClient.post('/medications', backendPayload);
      const data = response.data.data || response.data;
      return mapBackendMedicationToUi(data);
    } catch (err: any) {
      if (err?.response?.data?.code === 'CONDITION_NOT_FOUND') {
        const newConditionId = await medicationApi.getOrCreateDefaultConditionId();
        backendPayload.conditionId = String(newConditionId);
        const retryRes = await apiClient.post('/medications', backendPayload);
        const data = retryRes.data.data || retryRes.data;
        return mapBackendMedicationToUi(data);
      }
      throw err;
    }
  },

  // 4. PUT /medications/:medicationId -> Update Medication
  updateMedication: async (id: string, payload: UpdateMedicationDto): Promise<Medication> => {
    const backendPayload: any = {};
    if (payload.isActive !== undefined) backendPayload.isActive = payload.isActive;
    if (payload.currentStock !== undefined) {
      backendPayload.inventory = {
        currentQuantity: Number(payload.currentStock),
      };
    }

    const response = await apiClient.put(`/medications/${id}`, backendPayload);
    const data = response.data.data || response.data;
    return mapBackendMedicationToUi(data);
  },

  // 5. DELETE /medications/:medicationId -> Delete Medication
  deleteMedication: async (id: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(`/medications/${id}`);
    return response.data;
  },

  // 6. POST /medications/scan -> Scan Image/Barcode
  scanMedication: async (formData: FormData): Promise<any> => {
    const response = await apiClient.post('/medications/scan', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // 7. GET /medications/refills -> List Refill Orders
  getRefillOrders: async (): Promise<RefillRequest[]> => {
    try {
      const response = await apiClient.get('/medications/refills');
      const data = response.data.data || response.data;
      if (Array.isArray(data)) {
        return data.map(mapBackendRefillToUi);
      }
      return [];
    } catch (error: any) {
      console.warn('API /medications/refills error:', error?.response?.data || error.message);
      return [];
    }
  },

  // 8. POST /medications/refills -> Create Refill Order
  createRefillOrder: async (payload: CreateRefillOrderDto): Promise<RefillRequest> => {
    const response = await apiClient.post('/medications/refills', payload);
    const data = response.data.data || response.data;
    return mapBackendRefillToUi(data);
  },

  // 9. PATCH /medications/refills/:id/status -> Update Refill Order Status
  updateRefillStatus: async (id: string, payload: UpdateRefillStatusDto): Promise<RefillRequest> => {
    const response = await apiClient.patch(`/medications/refills/${id}/status`, payload);
    const data = response.data.data || response.data;
    return mapBackendRefillToUi(data);
  },
};

// Mapper: Backend Medication Document -> UI Component Model matching reference design
function mapBackendMedicationToUi(item: any): Medication {
  const currentStock = Number(
    item.inventory?.currentQuantity ?? item.currentStock ?? item.stock ?? 30
  );
  const totalStock = Number(
    item.inventory?.initialQuantity ?? item.totalStock ?? item.capacity ?? Math.max(currentStock, 30)
  );
  const refillThreshold = Number(item.inventory?.refillThreshold ?? 5);
  const ratio = totalStock > 0 ? currentStock / totalStock : 1;

  let status: Medication['status'] = item.status || 'optimal';
  if (!item.status) {
    if (currentStock <= 2 || ratio <= 0.1) status = 'urgent';
    else if (currentStock <= refillThreshold || ratio <= 0.3) status = 'low';
    else if (ratio <= 0.6) status = 'healthy';
    else status = 'optimal';
  }

  const iconTypeMap: Record<string, Medication['iconType']> = {
    TABLET: 'pill',
    CAPSULE: 'pill',
    SYRUP: 'bottle',
    INJECTION: 'kit',
    DROP: 'bottle',
    CREAM: 'kit',
    OTHER: 'kit',
  };

  // Build human-readable frequency subtitle string (e.g. "Once daily, 08:00")
  let frequencyText = item.frequency;
  if (!frequencyText && item.schedule) {
    const freqName =
      item.schedule.frequency === 'DAILY'
        ? 'Once daily'
        : item.schedule.frequency === 'WEEKLY'
        ? 'Weekly'
        : 'As needed';
    const firstTime = item.schedule.timesOfDay && item.schedule.timesOfDay.length > 0 ? item.schedule.timesOfDay[0] : '';
    frequencyText = firstTime ? `${freqName}, ${firstTime}` : freqName;
  }

  return {
    id: String(item.medicationId || item.id || item._id),
    name: item.name || 'Medication',
    dosage: item.instructions?.notes || item.dosage || `${item.inventory?.doseAmount || 1} tablet`,
    frequency: frequencyText || 'Once daily, morning',
    currentStock,
    totalStock,
    unit: 'UNITS',
    status,
    category: currentStock <= refillThreshold || ratio <= 0.3 ? 'low_stock' : item.isActive === false ? 'finished' : 'active',
    iconType:
      item.iconType ||
      iconTypeMap[item.formType] ||
      (status === 'urgent'
        ? 'urgent_pill'
        : status === 'low'
        ? 'kit'
        : status === 'healthy'
        ? 'bottle'
        : 'pill'),
  };
}

// Mapper: Backend Refill Order Document -> UI Component Model
function mapBackendRefillToUi(item: any): RefillRequest {
  const isShipping =
    item.orderStatus === 'SUBMITTED' ||
    item.orderStatus === 'APPROVED' ||
    item.orderStatus === 'DISPENSED' ||
    item.status === 'shipping';

  return {
    id: String(item.id || item._id),
    medication: item.medicationId?.name || item.medicationName || 'Medication Refill',
    rxNumber: item.rxNumber || `Refill #RX-${String(item.id || item._id).slice(-4)}`,
    pharmacy: item.targetPharmacyId?.name || item.pharmacy || 'Walgreens Specialty',
    requestDate: item.createdAt || item.requestDate
      ? new Date(item.createdAt || item.requestDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : 'Recent',
    status: isShipping ? 'shipping' : 'completed',
  };
}
