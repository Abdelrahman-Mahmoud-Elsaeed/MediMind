import apiClient from '@/shared/lib/apiClient';

export const pharmacyApi = {
  // 1. Get Refill Orders
  getRefillOrders: async (params) => {
    try {
      const response = await apiClient.get('/medications/refills', { params });
      const data = response.data?.data || response.data;
      if (Array.isArray(data)) {
        return data;
      }
      return [];
    } catch (error) {
      console.warn('API /medications/refills error:', error?.response?.data || error.message);
      return [];
    }
  },

  // 2. Create Refill Order
  createRefillOrder: async (payload) => {
    const backendPayload = {
      medicationId: String(payload.medicationId),
      targetPharmacyId: String(payload.targetPharmacyId || '65a000000000000000000001'),
      quantityRequested: Number(payload.quantityRequested || 30),
      fulfillmentType: payload.fulfillmentType || 'DELIVERY',
      deliveryAddress: payload.deliveryAddress || undefined,
    };

    const response = await apiClient.post('/medications/refills', backendPayload);
    return response.data?.data || response.data;
  },

  // 3. Update Refill Order Status (Pharmacist/Admin)
  updateRefillStatus: async (id, payload) => {
    const backendPayload = {
      orderStatus: payload.orderStatus || payload.status,
      pharmacistNotes: payload.pharmacistNotes || undefined,
    };

    const response = await apiClient.patch(`/medications/refills/${id}/status`, backendPayload);
    return response.data?.data || response.data;
  },

  // 4. Get Partner Pharmacies Directory
  getPharmacies: async (query = '') => {
    try {
      const response = await apiClient.get('/pharmacies');
      const apiPharmacies = response.data?.data || response.data;
      if (Array.isArray(apiPharmacies) && apiPharmacies.length > 0) {
        if (!query) return apiPharmacies;
        const q = query.toLowerCase();
        return apiPharmacies.filter((p) =>
          (p.pharmacyName || p.name || '').toLowerCase().includes(q) ||
          (p.ownerName || '').toLowerCase().includes(q)
        );
      }
    } catch (error) {
      // Fallback to seeded partner pharmacies list
    }

    const mockPharmacies = [
      {
        id: '65a000000000000000000001',
        name: 'MediMind Central Pharmacy',
        arabicName: 'صيدلية ميدي مايند المركزية',
        address: '90th North St, Fifth Settlement, New Cairo',
        arabicAddress: 'شارع التسعين الشمالي، التجمع الخامس، القاهرة الجديدة',
        phone: '+20 100 123 4567',
        hours: '24/7 (Open 24 Hours)',
        arabicHours: 'مفتوح 24 ساعة / 7 أيام',
        rating: 4.9,
        reviewsCount: 128,
        fulfillmentOptions: ['DELIVERY', 'PICKUP'],
        isVerified: true,
        isOpen: true,
        distance: '1.2 km',
      },
      {
        id: '65a000000000000000000002',
        name: 'El-Ezaby Pharmacy (Mohandessin)',
        arabicName: 'صيدلية العزبي (المهندسين)',
        address: 'Shehab St, Mohandessin, Giza',
        arabicAddress: 'شارع شهاب، المهندسين، الجيزة',
        phone: '+20 19777',
        hours: '24/7 (Open 24 Hours)',
        arabicHours: 'مفتوح 24 ساعة / 7 أيام',
        rating: 4.9,
        reviewsCount: 210,
        fulfillmentOptions: ['DELIVERY', 'PICKUP'],
        isVerified: true,
        isOpen: true,
        distance: '2.8 km',
      },
      {
        id: '65a000000000000000000003',
        name: 'Seif Pharmacy (Smouha Branch)',
        arabicName: 'صيدلية سيف (فرع سموحة)',
        address: 'Victor Emanuel St, Smouha, Alexandria',
        arabicAddress: 'شارع فيكتور عمانويل، سموحة، الإسكندرية',
        phone: '+20 19199',
        hours: '08:00 AM - 02:00 AM',
        arabicHours: '08:00 صباحاً - 02:00 صباحاً',
        rating: 4.8,
        reviewsCount: 94,
        fulfillmentOptions: ['DELIVERY', 'PICKUP'],
        isVerified: true,
        isOpen: true,
        distance: '3.5 km',
      },
      {
        id: '65a000000000000000000004',
        name: 'Care & Cure Pharmacy (Maadi)',
        arabicName: 'صيدلية العناية والشفاء (المعادي)',
        address: 'Road 9, Maadi, Cairo',
        arabicAddress: 'شارع 9، المعادي، القاهرة',
        phone: '+20 102 999 8877',
        hours: '09:00 AM - 12:00 AM',
        arabicHours: '09:00 صباحاً - 12:00 منتصف الليل',
        rating: 4.7,
        reviewsCount: 65,
        fulfillmentOptions: ['PICKUP'],
        isVerified: true,
        isOpen: true,
        distance: '5.1 km',
      },
    ];

    if (!query) return mockPharmacies;
    const lowerQ = query.toLowerCase();
    return mockPharmacies.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQ) ||
        p.arabicName.includes(query) ||
        p.address.toLowerCase().includes(lowerQ) ||
        p.arabicAddress.includes(query)
    );
  },
};
