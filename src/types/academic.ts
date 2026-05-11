// ============================================================
// Types alignés sur les DTOs backend du portail parent :
//   - /parent/pedagogique/*  → ParentPortailPedagogiqueController
//   - /parent/vie-scolaire/* → ParentPortailVieScolaireController
// ============================================================

// ── PÉDAGOGIQUE ──────────────────────────────────────────────

export interface PeriodeParent {
  id: number;
  libelle: string;
  code?: string;
  ordre?: number;
  dateDebut?: string;
  dateFin?: string;
  estCourante?: boolean;
  isActive?: boolean;
}

export interface NoteParent {
  id: number;
  valeurNote?: number;
  noteSur20?: number;
  noteSur?: number;
  rang?: number;
  appreciation?: string;
  estAbsent?: boolean;
  absenceJustifiee?: boolean;
  estDispense?: boolean;

  evaluationId?: number;
  evaluationLibelle?: string;
  typeEvaluationLibelle?: string;
  dateEvaluation?: string;
  coefficientEvaluation?: number;

  matiereId?: number;
  matiereLibelle?: string;
  matiereCode?: string;
  matiereCouleur?: string;
}

export interface MoyenneMatiereParent {
  matiereId?: number;
  matiereLibelle?: string;
  matiereCode?: string;
  matiereCouleur?: string;

  moyenne?: number;
  moyenneClasse?: number;
  rang?: number;
  rangSur?: number;
  noteMin?: number;
  noteMax?: number;
  nombreNotes?: number;
  mentionLibelle?: string;
  mentionCouleur?: string;

  coefficient?: number;
}

export interface MoyenneGeneraleParent {
  eleveId?: number;
  periodeId?: number;
  periodeLibelle?: string;

  moyenneGenerale?: number;
  totalCoefficients?: number;
  nombreMatieres?: number;
  rang?: number;
  rangSur?: number;
  mentionLibelle?: string;
  mentionCouleur?: string;
}

export interface EvaluationParent {
  id: number;
  code?: string;
  libelle?: string;
  description?: string;

  matiereLibelle?: string;
  matiereCode?: string;
  matiereCouleur?: string;

  typeEvaluationLibelle?: string;
  statutLibelle?: string;

  dateEvaluation?: string;
  heureDebut?: string;
  heureFin?: string;
  dureeMinutes?: number;

  salleNom?: string;
  salleCode?: string;

  noteSur?: number;
  coefficient?: number;

  consignes?: string;

  noteObtenue?: number;
  noteObtenueSur20?: number;
  rang?: number;
  estAbsent?: boolean;
  appreciation?: string;
}

export interface EmploiDuTempsParent {
  id: number;
  jourSemaine?: number;
  jourLibelle?: string;
  heureDebut?: string;
  heureFin?: string;
  dureeMinutes?: number;

  matiereLibelle?: string;
  matiereCode?: string;
  matiereCouleur?: string;

  enseignantNomComplet?: string;

  salleNom?: string;
  salleCode?: string;
  batiment?: string;

  typeSeanceLibelle?: string;
  statutLibelle?: string;
}

// ── VIE SCOLAIRE ─────────────────────────────────────────────

export interface BulletinParent {
  id: number;
  numeroBulletin?: string;
  periodeId?: number;
  periodeLibelle?: string;
  periodeOrdre?: number;

  moyenneGenerale?: number;
  moyenneClasse?: number;
  rang?: number;
  rangSur?: number;
  mentionLibelle?: string;
  mentionCouleur?: string;

  statutLibelle?: string;
  estDisponible?: boolean;
  datePublication?: string;

  nombreAbsences?: number;
  nombreRetards?: number;
}

export interface AbsenceParent {
  id: number;
  dateDebut?: string;
  dateFin?: string;
  heureDebut?: string;
  heureFin?: string;
  nombreJours?: number;
  nombreHeures?: number;

  typeAbsenceLibelle?: string;
  motif?: string;
  estJustifiee?: boolean;
  statutTraitementLibelle?: string;

  justificatifDepose?: boolean;
  dateJustification?: string;

  alerteEnvoyee?: boolean;
  dateAlerte?: string;
}

export interface RetardParent {
  id: number;
  dateRetard?: string;
  heurePrevue?: string;
  heureArrivee?: string;
  dureeRetardMinutes?: number;

  motif?: string;
  estJustifie?: boolean;
  statutTraitementLibelle?: string;

  justificatifDepose?: boolean;
  alerteEnvoyee?: boolean;
}

export interface StatistiquesAssiduite {
  eleveId?: number;
  eleveNom?: string;
  nombreAbsences?: number;
  nombreAbsencesJustifiees?: number;
  nombreAbsencesInjustifiees?: number;
  nombreRetards?: number;
  nombreRetardsJustifies?: number;
  tauxAbsenteisme?: number;
  tauxRetard?: number;
}

export interface DevoirParent {
  id: number;
  titre?: string;
  description?: string;

  matiereLibelle?: string;
  matiereCode?: string;
  matiereCouleur?: string;

  typeDevoirLibelle?: string;
  niveauDifficulteLibelle?: string;

  dateAttribution?: string;
  dateEcheance?: string;
  dureeEstimeeMinutes?: number;
  estObligatoire?: boolean;
  estNote?: boolean;
  bareme?: number;

  consignes?: string;

  statutRenduLibelle?: string;
  estEnRetard?: boolean;
  joursRestants?: number;
}
