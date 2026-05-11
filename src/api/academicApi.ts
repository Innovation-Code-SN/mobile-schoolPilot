import type {
  AbsenceParent,
  BulletinParent,
  DevoirParent,
  EmploiDuTempsParent,
  EvaluationParent,
  MoyenneGeneraleParent,
  MoyenneMatiereParent,
  NoteParent,
  PeriodeParent,
  RetardParent,
  StatistiquesAssiduite,
} from '../types/academic';
import { apiClient } from './client';

const PEDAGOGIQUE = '/parent/pedagogique';
const VIE_SCOLAIRE = '/parent/vie-scolaire';

// IMPORTANT : ces endpoints renvoient directement le payload brut
// (ResponseEntity<List<...>>) et NON le wrapper ApiResponse.
// On utilise donc apiClient.getRaw plutôt que apiClient.get.

export const academicApi = {
  // ── Périodes ────────────────────────────────────────────────
  async getPeriodes(): Promise<PeriodeParent[]> {
    try {
      return (await apiClient.getRaw<PeriodeParent[]>(`${PEDAGOGIQUE}/periodes`)) ?? [];
    } catch {
      return [];
    }
  },

  // ── Notes ───────────────────────────────────────────────────
  async getNotes(eleveId: number, periodeId: number): Promise<NoteParent[]> {
    return (
      (await apiClient.getRaw<NoteParent[]>(
        `${PEDAGOGIQUE}/enfants/${eleveId}/notes`,
        { params: { periodeId } }
      )) ?? []
    );
  },

  async getNotesRecentes(eleveId: number, limite = 10): Promise<NoteParent[]> {
    return (
      (await apiClient.getRaw<NoteParent[]>(
        `${PEDAGOGIQUE}/enfants/${eleveId}/notes/recentes`,
        { params: { limite } }
      )) ?? []
    );
  },

  // ── Moyennes ────────────────────────────────────────────────
  async getMoyennesParMatiere(
    eleveId: number,
    periodeId: number
  ): Promise<MoyenneMatiereParent[]> {
    return (
      (await apiClient.getRaw<MoyenneMatiereParent[]>(
        `${PEDAGOGIQUE}/enfants/${eleveId}/moyennes`,
        { params: { periodeId } }
      )) ?? []
    );
  },

  async getMoyenneGenerale(
    eleveId: number,
    periodeId: number
  ): Promise<MoyenneGeneraleParent | null> {
    try {
      return (
        (await apiClient.getRaw<MoyenneGeneraleParent>(
          `${PEDAGOGIQUE}/enfants/${eleveId}/moyenne-generale`,
          { params: { periodeId } }
        )) ?? null
      );
    } catch {
      return null;
    }
  },

  // ── Évaluations ─────────────────────────────────────────────
  async getEvaluations(eleveId: number, periodeId: number): Promise<EvaluationParent[]> {
    return (
      (await apiClient.getRaw<EvaluationParent[]>(
        `${PEDAGOGIQUE}/enfants/${eleveId}/evaluations`,
        { params: { periodeId } }
      )) ?? []
    );
  },

  async getEvaluationsAVenir(eleveId: number, jours = 14): Promise<EvaluationParent[]> {
    return (
      (await apiClient.getRaw<EvaluationParent[]>(
        `${PEDAGOGIQUE}/enfants/${eleveId}/evaluations/a-venir`,
        { params: { jours } }
      )) ?? []
    );
  },

  // ── Emploi du temps ─────────────────────────────────────────
  async getEmploiDuTemps(eleveId: number, jourSemaine?: number): Promise<EmploiDuTempsParent[]> {
    return (
      (await apiClient.getRaw<EmploiDuTempsParent[]>(
        `${PEDAGOGIQUE}/enfants/${eleveId}/emploi-du-temps`,
        { params: jourSemaine ? { jourSemaine } : undefined }
      )) ?? []
    );
  },

  // ── Bulletins ───────────────────────────────────────────────
  async getBulletins(eleveId: number): Promise<BulletinParent[]> {
    return (
      (await apiClient.getRaw<BulletinParent[]>(
        `${VIE_SCOLAIRE}/enfants/${eleveId}/bulletins`
      )) ?? []
    );
  },

  bulletinPdfUrl(eleveId: number, bulletinId: number): string {
    return `${VIE_SCOLAIRE}/enfants/${eleveId}/bulletins/${bulletinId}/pdf`;
  },

  // ── Absences & retards ──────────────────────────────────────
  async getAbsences(eleveId: number, periodeId?: number): Promise<AbsenceParent[]> {
    return (
      (await apiClient.getRaw<AbsenceParent[]>(
        `${VIE_SCOLAIRE}/enfants/${eleveId}/absences`,
        { params: periodeId ? { periodeId } : undefined }
      )) ?? []
    );
  },

  async getStatistiquesAssiduite(
    eleveId: number,
    periodeId: number
  ): Promise<StatistiquesAssiduite | null> {
    try {
      return (
        (await apiClient.getRaw<StatistiquesAssiduite>(
          `${VIE_SCOLAIRE}/enfants/${eleveId}/absences/statistiques`,
          { params: { periodeId } }
        )) ?? null
      );
    } catch {
      return null;
    }
  },

  async getRetards(eleveId: number, periodeId?: number): Promise<RetardParent[]> {
    return (
      (await apiClient.getRaw<RetardParent[]>(
        `${VIE_SCOLAIRE}/enfants/${eleveId}/retards`,
        { params: periodeId ? { periodeId } : undefined }
      )) ?? []
    );
  },

  // ── Devoirs / cahier de textes ──────────────────────────────
  async getDevoirs(
    eleveId: number,
    periodeId?: number,
    matiereId?: number
  ): Promise<DevoirParent[]> {
    const params: Record<string, number> = {};
    if (periodeId) params.periodeId = periodeId;
    if (matiereId) params.matiereId = matiereId;
    return (
      (await apiClient.getRaw<DevoirParent[]>(
        `${VIE_SCOLAIRE}/enfants/${eleveId}/devoirs`,
        { params: Object.keys(params).length ? params : undefined }
      )) ?? []
    );
  },

  async getDevoirsARendre(eleveId: number, jours = 7): Promise<DevoirParent[]> {
    return (
      (await apiClient.getRaw<DevoirParent[]>(
        `${VIE_SCOLAIRE}/enfants/${eleveId}/devoirs/a-rendre`,
        { params: { jours } }
      )) ?? []
    );
  },
};
