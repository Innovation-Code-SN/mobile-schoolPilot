export interface ParentInfo {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  cin?: string;
}

export interface ChildSummary {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  currentClass?: string;
  currentLevel?: string;
  academicYear?: string;
  status: string;
  relationType: string;
  isPrimaryContact: boolean;
  isFinanciallyResponsible: boolean;
  totalDue: number;
  paidAmount: number;
  unpaidInvoicesCount: number;
}

export interface AcademicInfo {
  currentClass?: string;
  currentLevel?: string;
  academicYear?: string;
  status: string;
}

export interface TransportInfo {
  needsTransport: boolean;
  transportRoute?: string;
  pickupPoint?: string;
  dropoffPoint?: string;
}

export interface ChildDetail {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  age: number;
  nationality?: string;
  academicInfo: AcademicInfo;
  // Le dossier médical détaillé est servi par l'endpoint dédié
  // /infirmary/parent/students/{id}/medical-profile (cf. medicalApi).
  transportInfo?: TransportInfo;
  relationType: string;
  isPrimaryContact: boolean;
  isFinanciallyResponsible: boolean;
}

export interface PreRegistrationSummary {
  id: number;
  registrationNumber: string;
  studentFirstName: string;
  studentLastName: string;
  studentFullName: string;
  studentDateOfBirth: string;
  requestedLevel: string;
  submissionDate: string;
  status: string;
  statusLabel: string;
  canUploadDocuments: boolean;
  canModify: boolean;
  adminNotes?: string;
  rejectionReason?: string;
}

export interface ParentInvoice {
  id: number;
  invoiceNumber: string;
  studentId: number;
  studentFullName: string;
  studentClass?: string;
  issueDate: string;
  dueDate: string;
  status: string;
  statusLabel: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  currency: string;
  isOverdue: boolean;
  daysOverdue: number;
  notes?: string;
  canPay: boolean;
  canDownload: boolean;
}

export interface ParentPayment {
  id: number;
  paymentNumber?: string;
  invoiceId?: number;
  invoiceNumber?: string;
  studentFullName?: string;
  amount: number;
  currency?: string;
  paymentMethod?: string;
  paymentMethodLabel?: string;
  paymentDate: string;
  status?: string;
  statusLabel?: string;
  reference?: string;
  notes?: string;
}

export interface FinancialSummary {
  totalDue: number;
  totalPaid: number;
  totalPending: number;
  unpaidInvoicesCount: number;
  overdueInvoicesCount: number;
}

export interface ParentDashboard {
  parentInfo: ParentInfo;
  children: ChildSummary[];
  preRegistrations: PreRegistrationSummary[];
  financialSummary: FinancialSummary;
  recentActivities: unknown[];
  upcomingEvents: unknown[];
}

export interface Parent {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cin?: string;
  address?: string;
  city?: string;
  profession?: string;
  active: boolean;
}

export interface UpdateParentProfileDto {
  phone?: string;
  address?: string;
  city?: string;
  profession?: string;
}

export interface PreRegistrationSelectedService {
  serviceId: number;
  serviceName?: string;
  [key: string]: unknown;
}

export interface PreRegistrationDetail {
  id: number;
  registrationNumber?: string;
  studentFirstName: string;
  studentLastName: string;
  studentFullName?: string;
  studentGender: string;
  studentDateOfBirth: string;
  studentPlaceOfBirth?: string;
  studentNationality?: string;
  studentPreviousSchool?: string;
  studentPreviousClass?: string;
  requestedLevel?: string;
  academicYearId?: number;
  academicYearLabel?: string;
  parentRelation?: string;
  transportationNeeded?: boolean;
  canteenSubscription?: boolean;
  selectedServices?: PreRegistrationSelectedService[];
  /**
   * Bloc médical structuré (lecture seule en détail). Stocké en JSON
   * dans PreRegistrationMedicalInfo côté backend.
   */
  medicalIntake?: import('./preRegistration').PreRegistrationMedicalIntake;
  specialNeeds?: string;
  additionalComments?: string;
  submissionDate?: string;
  status: string;
  statusLabel?: string;
  canUploadDocuments?: boolean;
  canModify?: boolean;
  adminNotes?: string;
  rejectionReason?: string;
}

export interface PreRegistrationDocument {
  id: number;
  documentType: string;
  documentTypeLabel?: string;
  fileName: string;
  fileSize?: number;
  uploadDate: string;
  status?: string;
  statusLabel?: string;
  notes?: string;
}

export interface ParentInvitation {
  id: number;
  token?: string;
  senderName?: string;
  senderEmail?: string;
  recipientEmail: string;
  recipientName?: string;
  childName?: string;
  childId?: number;
  status: string;
  statusLabel?: string;
  relationType?: string;
  isEmergencyContact?: boolean;
  isAuthorizedPickup?: boolean;
  isFinanciallyResponsible?: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface SchoolService {
  id: number;
  schoolId?: number;
  schoolName?: string;
  code: string;
  name: string;
  description?: string;
  category: 'MANDATORY' | 'OPTIONAL' | 'EXTRACURRICULAR' | 'ADMINISTRATIVE';
  categoryLabel?: string;
  availableAtPreRegistration?: boolean;
  availableAtAdmission?: boolean;
  availableAfterEnrollment?: boolean;
  isActive: boolean;
  displayOrder?: number;
  icon?: string;
  color?: string;
}

export interface AcademicYearRef {
  id: number;
  libelle: string;
  dateDebut?: string;
  dateFin?: string;
  isActive?: boolean;
}

export interface LevelRef {
  id: number;
  code?: string;
  libelle: string;
  ordre?: number;
  isActive?: boolean;
  cycle?: { id: number; libelle: string };
}
