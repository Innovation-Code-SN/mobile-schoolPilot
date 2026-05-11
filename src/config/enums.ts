import type { Gender, ParentRelation } from '../types/preRegistration';

export interface EnumOption<T = string> {
  value: T;
  label: string;
}

export const GENDERS: EnumOption<Gender>[] = [
  { value: 'MALE', label: 'Masculin' },
  { value: 'FEMALE', label: 'Féminin' },
];

export const PARENT_RELATIONS: EnumOption<ParentRelation>[] = [
  { value: 'FATHER', label: 'Père' },
  { value: 'MOTHER', label: 'Mère' },
  { value: 'GRANDFATHER', label: 'Grand-père' },
  { value: 'GRANDMOTHER', label: 'Grand-mère' },
  { value: 'UNCLE', label: 'Oncle' },
  { value: 'AUNT', label: 'Tante' },
  { value: 'BROTHER', label: 'Frère' },
  { value: 'SISTER', label: 'Sœur' },
  { value: 'STEP_FATHER', label: 'Beau-père' },
  { value: 'STEP_MOTHER', label: 'Belle-mère' },
  { value: 'GUARDIAN', label: 'Tuteur légal' },
  { value: 'OTHER', label: 'Autre' },
];

export const BLOOD_TYPES: EnumOption[] = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
];

export const DOCUMENT_TYPE_OPTIONS: EnumOption[] = [
  { value: 'BIRTH_CERTIFICATE', label: 'Acte de naissance' },
  { value: 'ID_CARD', label: "Pièce d'identité" },
  { value: 'SCHOOL_RECORD', label: 'Bulletin scolaire' },
  { value: 'MEDICAL_CERTIFICATE', label: 'Certificat médical' },
  { value: 'PHOTO', label: "Photo d'identité" },
  { value: 'OTHER', label: 'Autre' },
];
