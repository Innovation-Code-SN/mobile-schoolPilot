export type Gender = 'MALE' | 'FEMALE';

/**
 * Bloc médical optionnel saisi à la pré-inscription.
 *
 * Sur mobile, on n'expose qu'un sous-ensemble (groupe sanguin + assurance
 * + besoins clés) ; le reste du dossier médical complet est rempli plus
 * tard depuis l'écran "Santé" une fois l'élève créé.
 *
 * Côté backend, ce DTO est sérialisé tel quel dans
 * {@code PreRegistrationMedicalInfo}.
 */
export interface PreRegistrationMedicalIntake {
  bloodType?: string;
  primaryDoctorName?: string;
  primaryDoctorPhone?: string;
  preferredHospital?: string;
  socialSecurityNumber?: string;
  // Assurance santé
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceExpiryDate?: string;
  insurancePhone?: string;
  additionalNotes?: string;
}

export type ParentRelation =
  | 'FATHER'
  | 'MOTHER'
  | 'GRANDFATHER'
  | 'GRANDMOTHER'
  | 'UNCLE'
  | 'AUNT'
  | 'BROTHER'
  | 'SISTER'
  | 'GUARDIAN'
  | 'STEP_FATHER'
  | 'STEP_MOTHER'
  | 'OTHER';

export interface PreRegistrationFormData {
  studentFirstName: string;
  studentLastName: string;
  studentGender: Gender;
  studentDateOfBirth: string;
  studentPlaceOfBirth: string;
  studentNationality: string;
  studentPreviousSchool?: string;
  studentPreviousClass?: string;
  requestedLevel?: string;
  academicYearId?: number;
  parentRelation: ParentRelation;
  transportationNeeded?: boolean;
  canteenSubscription?: boolean;
  selectedServiceIds?: number[];
  /**
   * Bloc médical structuré (optionnel) — remplace les anciens champs plats
   * `allergies` / `medicalInformation` / `bloodType` qui ont été retirés.
   */
  medicalIntake?: PreRegistrationMedicalIntake;
  specialNeeds?: string;
  additionalComments?: string;
}

export interface RegisterParentRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  cin?: string;
  address?: string;
  city?: string;
  profession?: string;
}

export interface RegisterParentResponse {
  parentId: number;
  userId: number;
  email: string;
  fullName: string;
  message?: string;
  emailSent?: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
