import type { NavigatorScreenParams } from '@react-navigation/native';

export type ParentTabParamList = {
  DashboardTab: undefined;
  ScolariteTab: NavigatorScreenParams<ScolariteStackParamList>;
  CommunicationsTab: NavigatorScreenParams<CommunicationsStackParamList>;
  FinanceTab: NavigatorScreenParams<FinanceStackParamList>;
  MoreTab: NavigatorScreenParams<MoreStackParamList>;
};

export type ScolariteStackParamList = {
  ScolariteHome: undefined;
  Notes: undefined;
  Bulletins: undefined;
  Devoirs: undefined;
  Absences: undefined;
  EmploiDuTemps: undefined;
};

export type CommunicationsStackParamList = {
  CommunicationsHome: undefined;
  AnnouncementDetail: { id: number };
  MessageDetail: { id: number };
};

export type FinanceStackParamList = {
  FinanceHome: undefined;
};

export type CalendarStackParamList = {
  CalendarHome: undefined;
  EventDetail: { id: number };
};

export type ChildrenStackParamList = {
  ChildrenList: undefined;
  ChildDetail: { childId: number; childName?: string };
  MedicalProfile: { childId: number; childName?: string };
  InfirmaryVisits: { childId: number; childName?: string };
  Transport: { childId: number; childName?: string };
};

export type PreRegistrationsStackParamList = {
  PreRegistrationsList: undefined;
  PreRegistrationForm: { preRegistrationId?: number };
  PreRegistrationDetail: { preRegistrationId: number };
  PreRegistrationDocuments: { preRegistrationId: number; title?: string };
};

export type MoreStackParamList = {
  MoreHome: undefined;
  Profile: undefined;
  Invitations: undefined;
  ChangePassword: undefined;
  // Children
  ChildrenList: undefined;
  ChildDetail: { childId: number; childName?: string };
  MedicalProfile: { childId: number; childName?: string };
  InfirmaryVisits: { childId: number; childName?: string };
  Transport: { childId: number; childName?: string };
  // Préinscriptions
  PreRegistrationsList: undefined;
  PreRegistrationForm: { preRegistrationId?: number };
  PreRegistrationDetail: { preRegistrationId: number };
  PreRegistrationDocuments: { preRegistrationId: number; title?: string };
  // Calendrier
  CalendarHome: undefined;
  EventDetail: { id: number };
  // Notifications (centre de notifications agrégé)
  Notifications: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Parent: NavigatorScreenParams<ParentTabParamList>;
};
