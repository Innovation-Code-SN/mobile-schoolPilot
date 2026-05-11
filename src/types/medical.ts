// src/types/medical.ts
// Types pour le dossier médical structuré (parent view).
// Aligne avec /backend/.../dtos/infirmary/CompleteMedicalProfileDto.java

export type MedicalContactType =
  | 'EMERGENCY_FAMILY'
  | 'EMERGENCY_OTHER'
  | 'PRIMARY_DOCTOR'
  | 'SPECIALIST_DOCTOR'
  | 'OTHER';

export type MedicalConditionSeverity = 'MILD' | 'MODERATE' | 'SEVERE' | 'CRITICAL';

export interface StudentMedicalProfile {
  id?: number;
  studentId?: number;
  bloodType?: string;
  heightCm?: number;
  weightKg?: number;
  primaryDoctorName?: string;
  primaryDoctorPhone?: string;
  preferredHospital?: string;
  /** ID de l'établissement partenaire préféré (résolu côté backend). */
  preferredFacilityId?: number;
  preferredFacilityName?: string;
  socialSecurityNumber?: string;

  // Assurance santé
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceExpiryDate?: string;
  insurancePhone?: string;

  additionalNotes?: string;
  lastReviewDate?: string;
  completedByParent?: boolean;
  completedAt?: string;
}

export interface StudentMedicalContact {
  id?: number;
  contactType: MedicalContactType;
  fullName: string;
  phonePrimary?: string;
  phoneSecondary?: string;
  email?: string;
  relationship?: string;
  specialty?: string;
  priority?: number;
  notes?: string;
}

export interface StudentMedicalConditionLink {
  id?: number;
  conditionId: number;
  conditionCode?: string;
  conditionName?: string;
  conditionTypeName?: string;
  severity?: MedicalConditionSeverity;
  diagnosisDate?: string;
  notes?: string;
  active?: boolean;
}

export interface StudentMedication {
  id?: number;
  medicationName: string;
  dosage?: string;
  frequency?: string;
  administrationRoute?: string;
  startDate?: string;
  endDate?: string;
  prescriber?: string;
  notes?: string;
  active?: boolean;
}

export interface StudentVaccination {
  id?: number;
  vaccineName: string;
  administrationDate?: string;
  nextBoosterDate?: string;
  batchNumber?: string;
  administeredBy?: string;
  notes?: string;
}

export interface StudentMedicalAuthorizationGrant {
  id?: number;
  authorizationId: number;
  authorizationCode?: string;
  authorizationName?: string;
  authorizationDescription?: string;
  authorizationRequired?: boolean;
  granted: boolean;
  grantedAt?: string;
  grantedBy?: string;
  notes?: string;
}

export interface CompleteMedicalProfile {
  studentId: number;
  studentNumber?: string;
  studentFullName?: string;
  studentAge?: number;
  studentClassName?: string;
  profile?: StudentMedicalProfile;
  contacts: StudentMedicalContact[];
  conditions: StudentMedicalConditionLink[];
  medications: StudentMedication[];
  vaccinations: StudentVaccination[];
  authorizations: StudentMedicalAuthorizationGrant[];
}

export const MEDICAL_CONTACT_TYPE_LABELS: Record<MedicalContactType, string> = {
  EMERGENCY_FAMILY: 'Urgence — famille',
  EMERGENCY_OTHER: 'Urgence — autre',
  PRIMARY_DOCTOR: 'Médecin traitant',
  SPECIALIST_DOCTOR: 'Médecin spécialiste',
  OTHER: 'Autre',
};

export const MEDICAL_CONDITION_SEVERITY_LABELS: Record<MedicalConditionSeverity, string> = {
  MILD: 'Légère',
  MODERATE: 'Modérée',
  SEVERE: 'Sévère',
  CRITICAL: 'Critique',
};
