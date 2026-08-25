import apiClient from '@/shared/lib/apiClient';

export const medicationApi = {
  // Helper to resolve or auto-create a medical condition ID for the patient via GET/POST /conditions
  getOrCreateDefaultConditionId: async () => {
    const fallbackId = '65a000000000000000000001';
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
    } catch (err) {
      console.warn('Could not auto-fetch/create conditionId via /conditions:', err?.response?.data || err.message);
      return fallbackId;
    }
  },

  // 1. GET /medications -> List Medications
  getMedications: async (params) => {
    try {
      const response = await apiClient.get('/medications', { params });
      const data = response.data.data || response.data;
      if (Array.isArray(data)) {
        return data.map(mapBackendMedicationToUi);
      }
      return [];
    } catch (error) {
      console.warn('API /medications error:', error?.response?.data || error.message);
      return [];
    }
  },

  // 2. GET /medications/:medicationId -> Single Medication
  getMedicationById: async (id) => {
    const response = await apiClient.get(`/medications/${id}`);
    const data = response.data.data || response.data;
    return mapBackendMedicationToUi(data);
  },

  // 3. POST /medications -> Create Medication (strictly matches createMedicationSchema)
  createMedication: async (payload) => {
    let backendPayload;

    if (payload.inventory && payload.schedule && payload.instructions && payload.conditionId && payload.formType) {
      // User passed structured DTO matching backend schema directly
      backendPayload = { ...payload };
    } else {
      // Formatter for flat UI form inputs
      const formTypeMap = {
        pill: 'TABLET',
        bottle: 'SYRUP',
        kit: 'OTHER',
        urgent_pill: 'TABLET',
        CAPSULE: 'CAPSULE',
        TABLET: 'TABLET',
        SYRUP: 'SYRUP',
        INJECTION: 'INJECTION',
        DROP: 'DROP',
        CREAM: 'CREAM',
        OTHER: 'OTHER',
      };

      const validMealRelations = ['BEFORE_MEALS', 'AFTER_MEALS', 'WITH_FOOD', 'ON_EMPTY_STOMACH', 'NONE'];
      const rawMeal = payload.instructions?.relationToMeals || payload.relationToMeals;
      const relationToMeals = validMealRelations.includes(rawMeal) ? rawMeal : 'NONE';

      const formType = formTypeMap[payload.type || payload.formType || payload.iconType] || 'TABLET';
      const startDate = payload.schedule?.startDate || payload.startDate
        ? new Date(payload.schedule?.startDate || payload.startDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      const isChronic = payload.isChronic !== undefined ? Boolean(payload.isChronic) : true;
      const rawEndDate = payload.schedule?.endDate || payload.endDate;
      const endDate = isChronic
        ? null
        : rawEndDate
        ? new Date(rawEndDate).toISOString().split('T')[0]
        : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const expDate = payload.expirationDate
        ? new Date(payload.expirationDate).toISOString().split('T')[0]
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const initialQty = Number(
        payload.inventory?.initialQuantity || payload.stock || payload.totalStock || payload.initialQuantity || 30
      );
      const currentQty = Number(
        payload.inventory?.currentQuantity || payload.currentStock || payload.stock || initialQty
      );
      const doseAmount = Number(payload.inventory?.doseAmount || payload.doseAmount || 1);
      const refillThreshold = Number(payload.inventory?.refillThreshold || payload.refillThreshold || 5);

      const freq = payload.schedule?.frequency || payload.frequency;
      const frequency = ['DAILY', 'WEEKLY', 'AS_NEEDED'].includes(freq) ? freq : 'DAILY';
      const dosesPerDay = Number(payload.schedule?.dosesPerDay || payload.dosesPerDay || 1);
      const firstDoseTime = payload.schedule?.firstDoseTime || payload.time || payload.firstDoseTime || '08:00';

      const notes = String(
        payload.instructions?.notes || payload.notes || payload.dosage || payload.strength || ''
      );

      backendPayload = {
        patientId: payload.patientId || undefined,
        conditionId: payload.conditionId,
        name: payload.name || 'Medication',
        imageURL: payload.imageURL || null,
        formType,
        isChronic,
        inventory: {
          initialQuantity: Math.max(1, initialQty),
          currentQuantity: Math.max(0, currentQty),
          doseAmount: Math.max(0.1, doseAmount),
          refillThreshold: Math.max(1, refillThreshold),
        },
        instructions: {
          relationToMeals,
          notes,
        },
        schedule: {
          frequency,
          dosesPerDay: Math.max(1, Math.min(24, dosesPerDay)),
          firstDoseTime,
          startDate,
          endDate,
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
    } catch (err) {
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

  // 4. PUT /medications/:medicationId -> Update Medication (strictly matches updateMedicationSchema)
  updateMedication: async (id, payload) => {
    let backendPayload = {};

    if (payload.inventory || payload.instructions || payload.schedule) {
      backendPayload = { ...payload };
    } else {
      if (payload.isActive !== undefined) backendPayload.isActive = Boolean(payload.isActive);
      if (payload.imageURL !== undefined) backendPayload.imageURL = payload.imageURL;

      if (payload.currentStock !== undefined || payload.doseAmount !== undefined || payload.refillThreshold !== undefined) {
        backendPayload.inventory = {};
        if (payload.currentStock !== undefined) backendPayload.inventory.currentQuantity = Number(payload.currentStock);
        if (payload.doseAmount !== undefined) backendPayload.inventory.doseAmount = Number(payload.doseAmount);
        if (payload.refillThreshold !== undefined) backendPayload.inventory.refillThreshold = Number(payload.refillThreshold);
      }

      if (payload.relationToMeals !== undefined || payload.dosage !== undefined || payload.notes !== undefined) {
        backendPayload.instructions = {};
        if (payload.relationToMeals !== undefined) backendPayload.instructions.relationToMeals = payload.relationToMeals;
        if (payload.notes !== undefined || payload.dosage !== undefined) backendPayload.instructions.notes = payload.notes || payload.dosage;
      }

      if (payload.frequency !== undefined || payload.dosesPerDay !== undefined || payload.firstDoseTime !== undefined) {
        backendPayload.schedule = {};
        if (payload.frequency !== undefined) backendPayload.schedule.frequency = payload.frequency;
        if (payload.dosesPerDay !== undefined) backendPayload.schedule.dosesPerDay = Number(payload.dosesPerDay);
        if (payload.firstDoseTime !== undefined) backendPayload.schedule.firstDoseTime = payload.firstDoseTime;
      }
    }

    const response = await apiClient.put(`/medications/${id}`, backendPayload);
    const data = response.data.data || response.data;
    return mapBackendMedicationToUi(data);
  },

  // 5. DELETE /medications/:medicationId -> Delete Medication
  deleteMedication: async (id) => {
    const response = await apiClient.delete(`/medications/${id}`);
    return response.status === 204 ? { success: true } : (response.data?.data || response.data || { success: true });
  },

  // 6. POST /medications/scan -> Scan Image Base64 (strictly matches scanMedicationSchema: { imageBase64 })
  scanMedication: async (imageData) => {
    const imageBase64 = typeof imageData === 'string'
      ? imageData
      : imageData?.imageBase64 || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const response = await apiClient.post('/medications/scan', { imageBase64 });
    const data = response.data.data || response.data;
    return data;
  },

  // 7. GET /medications/refills -> List Refill Orders
  getRefillOrders: async () => {
    try {
      const response = await apiClient.get('/medications/refills');
      const data = response.data.data || response.data;
      if (Array.isArray(data)) {
        return data.map(mapBackendRefillToUi);
      }
      return [];
    } catch (error) {
      console.warn('API /medications/refills error:', error?.response?.data || error.message);
      return [];
    }
  },

  // 8. POST /medications/refills -> Create Refill Order (strictly matches createRefillOrderSchema)
  createRefillOrder: async (payload) => {
    const backendPayload = {
      medicationId: String(payload.medicationId || payload.id),
      targetPharmacyId: String(payload.targetPharmacyId || '65a000000000000000000001'),
      quantityRequested: Number(payload.quantityRequested || payload.quantity || 30),
      fulfillmentType: payload.fulfillmentType || 'DELIVERY',
      deliveryAddress: payload.deliveryAddress || undefined,
    };

    const response = await apiClient.post('/medications/refills', backendPayload);
    const data = response.data.data || response.data;
    return mapBackendRefillToUi(data);
  },

  // 9. PATCH /medications/refills/:id/status -> Update Refill Order Status (strictly matches updateRefillStatusSchema)
  updateRefillStatus: async (id, payload) => {
    const backendPayload = {
      orderStatus: payload.orderStatus || payload.status || 'SUBMITTED',
      pharmacistNotes: payload.pharmacistNotes || undefined,
    };

    const response = await apiClient.patch(`/medications/refills/${id}/status`, backendPayload);
    const data = response.data.data || response.data;
    return mapBackendRefillToUi(data);
  },
};

// Mapper: Backend Medication Document -> UI Component Model
function mapBackendMedicationToUi(item) {
  const medId = String(item.medicationId || item.id || item._id || '');
  const currentStock = Number(
    item.inventory?.currentQuantity ?? item.currentStock ?? item.stock ?? 30
  );
  const totalStock = Number(
    item.inventory?.initialQuantity ?? item.totalStock ?? item.capacity ?? Math.max(currentStock, 30)
  );
  const refillThreshold = Number(item.inventory?.refillThreshold ?? 5);
  const ratio = totalStock > 0 ? currentStock / totalStock : 1;

  let status = item.status || 'optimal';
  if (!item.status) {
    if (currentStock <= 2 || ratio <= 0.1) status = 'urgent';
    else if (currentStock <= refillThreshold || ratio <= 0.3) status = 'low';
    else if (ratio <= 0.6) status = 'healthy';
    else status = 'optimal';
  }

  const iconTypeMap = {
    TABLET: 'pill',
    CAPSULE: 'pill',
    SYRUP: 'bottle',
    INJECTION: 'kit',
    DROP: 'bottle',
    CREAM: 'kit',
    OTHER: 'kit',
  };

  let frequencyText = item.frequency;
  if (!frequencyText && item.schedule) {
    const freqName =
      item.schedule.frequency === 'DAILY'
        ? 'Once daily'
        : item.schedule.frequency === 'WEEKLY'
        ? 'Weekly'
        : 'As needed';
    const firstTime = item.schedule.timesOfDay && item.schedule.timesOfDay.length > 0
      ? item.schedule.timesOfDay[0]
      : item.schedule.firstDoseTime || '';
    frequencyText = firstTime ? `${freqName}, ${firstTime}` : freqName;
  }

  return {
    id: medId,
    _id: medId,
    conditionId: item.conditionId ? String(item.conditionId) : undefined,
    name: item.name || 'Medication',
    formType: item.formType || 'TABLET',
    isChronic: item.isChronic !== undefined ? item.isChronic : true,
    dosage: item.instructions?.notes || item.dosage || `${item.inventory?.doseAmount || 1} tablet`,
    frequency: frequencyText || 'Once daily, morning',
    time: item.schedule?.firstDoseTime || (item.schedule?.timesOfDay && item.schedule.timesOfDay[0]) || '08:00',
    relationToMeals: item.instructions?.relationToMeals || 'NONE',
    currentStock,
    totalStock,
    refillThreshold,
    inventory: item.inventory || { currentQuantity: currentQuantity, initialQuantity: totalStock, refillThreshold },
    instructions: item.instructions || { relationToMeals: item.relationToMeals || 'NONE', notes: item.dosage },
    schedule: item.schedule || { frequency: 'DAILY', firstDoseTime: item.time || '08:00' },
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
    raw: item,
  };
}

// Mapper: Backend Refill Order Document -> UI Component Model
function mapBackendRefillToUi(item) {
  const isShipping =
    item.orderStatus === 'SUBMITTED' ||
    item.orderStatus === 'APPROVED' ||
    item.orderStatus === 'DISPENSED' ||
    item.status === 'shipping';

  return {
    id: String(item.id || item._id),
    medicationId: item.medicationId?._id || item.medicationId,
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
