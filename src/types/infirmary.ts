// src/types/infirmary.ts
// Types pour les passages à l'infirmerie côté parent (lecture seule).

export interface InfirmaryVisit {
  id?: number;
  studentId: number;
  studentNumber?: string;
  studentFullName?: string;
  studentClassName?: string;
  entryAt: string;
  exitAt?: string;
  /** Code paramétrable (catégorie VISIT_REASON). */
  reason: string;
  /** Libellé du motif renvoyé par le backend. */
  reasonLabel?: string;
  reasonDetails?: string;
  symptoms?: string;
  careProvided?: string;
  medicationsAdministered?: string;
  /** Code paramétrable (catégorie VISIT_DECISION). */
  decision: string;
  /** Libellé de la décision renvoyé par le backend. */
  decisionLabel?: string;
  notes?: string;
  handledByName?: string;
  parentNotified?: boolean;
  parentNotifiedAt?: string;

  // Évacuation (visible si decision = EVACUATED)
  evacuationFacilityName?: string;
  evacuationFacilityText?: string;
  evacuationContactName?: string;
  evacuationContactPhone?: string;
  evacuationDepartedAt?: string;
  evacuationNotes?: string;

  createdAt?: string;
  updatedAt?: string;
}

/**
 * Libellés par défaut (fallback si le backend ne renvoie pas reasonLabel).
 */
export const VISIT_REASON_DEFAULT_LABELS: Record<string, string> = {
  ILLNESS: 'Maladie',
  INJURY: 'Blessure',
  ALLERGY_CRISIS: 'Crise allergique',
  CHRONIC_CONDITION: 'Suivi maladie chronique',
  MEDICATION_INTAKE: 'Prise de traitement',
  ROUTINE_CHECK: 'Visite de contrôle',
  EMOTIONAL_SUPPORT: 'Soutien psychologique',
  OTHER: 'Autre',
};

export const VISIT_DECISION_DEFAULT_LABELS: Record<string, string> = {
  RETURNED_TO_CLASS: 'Retour en classe',
  REST_AT_INFIRMARY: "Repos à l'infirmerie",
  PARENT_CALLED: 'Parent appelé',
  EVACUATED: 'Évacuation hôpital / SAMU',
  SENT_HOME: 'Renvoyé à la maison',
};
