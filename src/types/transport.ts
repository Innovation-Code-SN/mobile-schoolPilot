// src/types/transport.ts
// Types pour le module transport côté parent.
// Aligne avec /backend/.../dtos/transport/ChildTransportInfoDto.java
// et AttendanceSummaryDto.java

export interface ChildTransportInfo {
  studentId: number;
  studentName?: string;
  studentNumber?: string;
  className?: string;
  photoUrl?: string;

  // Affectation
  assignmentId?: number;
  assignmentStatus?: string;
  usesMorningTransport?: boolean;
  usesAfternoonTransport?: boolean;

  // Ligne
  routeId?: number;
  routeCode?: string;
  routeName?: string;

  // Arrêt
  stopId?: number;
  stopName?: string;
  stopAddress?: string;
  stopLatitude?: number;
  stopLongitude?: number;
  morningPickupTime?: string;
  afternoonDropoffTime?: string;

  // Véhicule
  vehicleRegistration?: string;
  vehicleBrand?: string;
  vehicleColor?: string;

  // Chauffeur
  driverName?: string;
  driverPhone?: string;

  // Surveillant
  supervisorName?: string;
  supervisorPhone?: string;

  // Statut actuel
  busInProgress?: boolean;
  currentTripStatus?: string;
  estimatedArrivalMinutes?: number;
  currentBusLatitude?: number;
  currentBusLongitude?: number;

  // Contacts d'urgence
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  specialInstructions?: string;

  // Statistiques
  attendanceRate?: number;
  totalTripsThisMonth?: number;
  presentTripsThisMonth?: number;
}

export interface AttendanceSummary {
  studentId: number;
  studentName?: string;
  startDate?: string;
  endDate?: string;

  totalTrips?: number;
  presentCount?: number;
  absentCount?: number;
  lateCount?: number;
  excusedCount?: number;

  attendanceRate?: number;
  punctualityRate?: number;

  morningTrips?: number;
  morningPresent?: number;
  afternoonTrips?: number;
  afternoonPresent?: number;

  attendanceRateTrend?: number;
  trendDescription?: string;

  hasAttendanceIssue?: boolean;
  attendanceIssueMessage?: string;
}

export interface TransportAttendance {
  id?: number;
  studentId: number;
  tripDate?: string;
  tripType?: string; // MORNING / AFTERNOON
  status?: string; // PRESENT / ABSENT / LATE / EXCUSED
  notes?: string;
  pickupTime?: string;
  dropoffTime?: string;
}
