export type MedicationStatus = 'optimal' | 'healthy' | 'low' | 'urgent';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  currentStock: number;
  totalStock: number;
  unit: string;
  status: MedicationStatus;
  category: 'active' | 'finished' | 'low_stock';
  iconType: 'pill' | 'bottle' | 'kit' | 'urgent_pill';
}

export interface RefillRequest {
  id: string;
  medication: string;
  rxNumber: string;
  pharmacy: string;
  requestDate: string;
  status: 'shipping' | 'completed' | 'pending';
}

export interface WeeklyAdherence {
  week: string;
  taken: number;
  missed: number;
}
