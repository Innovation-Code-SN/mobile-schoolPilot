import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { communicationApi } from '../api/communicationApi';
import { useAuth } from '../contexts/AuthContext';
import { AbsencesScreen } from '../screens/parent/academic/AbsencesScreen';
import { BulletinsScreen } from '../screens/parent/academic/BulletinsScreen';
import { DevoirsScreen } from '../screens/parent/academic/DevoirsScreen';
import { EmploiDuTempsScreen } from '../screens/parent/academic/EmploiDuTempsScreen';
import { NotesScreen } from '../screens/parent/academic/NotesScreen';
import { ScolariteHomeScreen } from '../screens/parent/academic/ScolariteHomeScreen';
import { AnnouncementDetailScreen } from '../screens/parent/AnnouncementDetailScreen';
import { CalendarScreen } from '../screens/parent/CalendarScreen';
import { ChangePasswordScreen } from '../screens/parent/ChangePasswordScreen';
import { ChildDetailScreen } from '../screens/parent/ChildDetailScreen';
import { ChildrenListScreen } from '../screens/parent/ChildrenListScreen';
import { InfirmaryVisitsScreen } from '../screens/parent/InfirmaryVisitsScreen';
import { MedicalProfileScreen } from '../screens/parent/MedicalProfileScreen';
import { TransportScreen } from '../screens/parent/TransportScreen';
import { CommunicationsScreen } from '../screens/parent/CommunicationsScreen';
import { DashboardScreen } from '../screens/parent/DashboardScreen';
import { EventDetailScreen } from '../screens/parent/EventDetailScreen';
import { FinanceScreen } from '../screens/parent/FinanceScreen';
import { InvitationsScreen } from '../screens/parent/InvitationsScreen';
import { MessageDetailScreen } from '../screens/parent/MessageDetailScreen';
import { MoreScreen } from '../screens/parent/MoreScreen';
import { NotificationsScreen } from '../screens/parent/NotificationsScreen';
import { PreRegistrationDetailScreen } from '../screens/parent/PreRegistrationDetailScreen';
import { PreRegistrationDocumentsScreen } from '../screens/parent/PreRegistrationDocumentsScreen';
import { PreRegistrationFormScreen } from '../screens/parent/PreRegistrationFormScreen';
import { PreRegistrationsListScreen } from '../screens/parent/PreRegistrationsListScreen';
import { ProfileScreen } from '../screens/parent/ProfileScreen';
import { colors, typography } from '../theme';
import type {
  CommunicationsStackParamList,
  FinanceStackParamList,
  MoreStackParamList,
  ParentTabParamList,
  ScolariteStackParamList,
} from './types';

const Tabs = createBottomTabNavigator<ParentTabParamList>();
const ScolariteStack = createNativeStackNavigator<ScolariteStackParamList>();
const CommunicationsStack = createNativeStackNavigator<CommunicationsStackParamList>();
const FinanceStack = createNativeStackNavigator<FinanceStackParamList>();
const MoreStack = createNativeStackNavigator<MoreStackParamList>();

const stackScreenOptions = {
  headerStyle: { backgroundColor: colors.secondary },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: { ...typography.bodyBold, color: '#FFFFFF' },
};

function ScolariteStackNavigator() {
  return (
    <ScolariteStack.Navigator screenOptions={stackScreenOptions}>
      <ScolariteStack.Screen
        name="ScolariteHome"
        component={ScolariteHomeScreen}
        options={{ title: 'Scolarité' }}
      />
      <ScolariteStack.Screen name="Notes" component={NotesScreen} options={{ title: 'Notes' }} />
      <ScolariteStack.Screen
        name="Bulletins"
        component={BulletinsScreen}
        options={{ title: 'Bulletins' }}
      />
      <ScolariteStack.Screen
        name="Devoirs"
        component={DevoirsScreen}
        options={{ title: 'Devoirs' }}
      />
      <ScolariteStack.Screen
        name="Absences"
        component={AbsencesScreen}
        options={{ title: 'Présences' }}
      />
      <ScolariteStack.Screen
        name="EmploiDuTemps"
        component={EmploiDuTempsScreen}
        options={{ title: 'Emploi du temps' }}
      />
    </ScolariteStack.Navigator>
  );
}

function CommunicationsStackNavigator() {
  return (
    <CommunicationsStack.Navigator screenOptions={stackScreenOptions}>
      <CommunicationsStack.Screen
        name="CommunicationsHome"
        component={CommunicationsScreen}
        options={{ title: 'Messages' }}
      />
      <CommunicationsStack.Screen
        name="AnnouncementDetail"
        component={AnnouncementDetailScreen}
        options={{ title: 'Annonce' }}
      />
      <CommunicationsStack.Screen
        name="MessageDetail"
        component={MessageDetailScreen}
        options={{ title: 'Message' }}
      />
    </CommunicationsStack.Navigator>
  );
}

function FinanceStackNavigator() {
  return (
    <FinanceStack.Navigator screenOptions={stackScreenOptions}>
      <FinanceStack.Screen
        name="FinanceHome"
        component={FinanceScreen}
        options={{ title: 'Finance' }}
      />
    </FinanceStack.Navigator>
  );
}

function MoreStackNavigator() {
  return (
    <MoreStack.Navigator screenOptions={stackScreenOptions}>
      <MoreStack.Screen name="MoreHome" component={MoreScreen} options={{ title: 'Plus' }} />
      <MoreStack.Screen
        name="ChildrenList"
        component={ChildrenListScreen}
        options={{ title: 'Mes enfants' }}
      />
      <MoreStack.Screen
        name="ChildDetail"
        component={ChildDetailScreen}
        options={({ route }) => ({ title: route.params.childName ?? 'Enfant' })}
      />
      <MoreStack.Screen
        name="MedicalProfile"
        component={MedicalProfileScreen}
        options={({ route }) => ({ title: `Santé · ${route.params.childName ?? 'Enfant'}` })}
      />
      <MoreStack.Screen
        name="InfirmaryVisits"
        component={InfirmaryVisitsScreen}
        options={({ route }) => ({ title: `Infirmerie · ${route.params.childName ?? 'Enfant'}` })}
      />
      <MoreStack.Screen
        name="Transport"
        component={TransportScreen}
        options={({ route }) => ({ title: `Transport · ${route.params.childName ?? 'Enfant'}` })}
      />
      <MoreStack.Screen
        name="PreRegistrationsList"
        component={PreRegistrationsListScreen}
        options={{ title: 'Préinscriptions' }}
      />
      <MoreStack.Screen
        name="PreRegistrationForm"
        component={PreRegistrationFormScreen}
        options={({ route }) => ({
          title: route.params?.preRegistrationId ? 'Modifier' : 'Nouvelle préinscription',
        })}
      />
      <MoreStack.Screen
        name="PreRegistrationDetail"
        component={PreRegistrationDetailScreen}
        options={{ title: 'Détail' }}
      />
      <MoreStack.Screen
        name="PreRegistrationDocuments"
        component={PreRegistrationDocumentsScreen}
        options={({ route }) => ({ title: route.params.title ?? 'Documents' })}
      />
      <MoreStack.Screen
        name="CalendarHome"
        component={CalendarScreen}
        options={{ title: 'Calendrier' }}
      />
      <MoreStack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{ title: 'Événement' }}
      />
      <MoreStack.Screen
        name="Invitations"
        component={InvitationsScreen}
        options={{ title: 'Invitations' }}
      />
      <MoreStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Mon profil' }}
      />
      <MoreStack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ title: 'Changer le mot de passe' }}
      />
      <MoreStack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
    </MoreStack.Navigator>
  );
}

function useUnreadMessagesBadge() {
  const { isAuthenticated } = useAuth();
  const { data } = useQuery({
    queryKey: ['communications', 'unread-count'],
    queryFn: communicationApi.getUnreadMessagesCount,
    enabled: isAuthenticated,
    refetchInterval: 60_000,
  });
  return data && data > 0 ? (data > 99 ? '99+' : String(data)) : undefined;
}

export function ParentTabNavigator() {
  const messagesBadge = useUnreadMessagesBadge();

  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 64,
          paddingTop: 6,
          paddingBottom: 10,
        },
        tabBarIcon: ({ color, size }) => {
          const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
            DashboardTab: 'home-outline',
            ScolariteTab: 'school-outline',
            CommunicationsTab: 'chatbubbles-outline',
            FinanceTab: 'card-outline',
            MoreTab: 'ellipsis-horizontal-outline',
          };
          return <Ionicons name={iconMap[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="DashboardTab" component={DashboardScreen} options={{ title: 'Accueil' }} />
      <Tabs.Screen
        name="ScolariteTab"
        component={ScolariteStackNavigator}
        options={{ title: 'Scolarité' }}
      />
      <Tabs.Screen
        name="CommunicationsTab"
        component={CommunicationsStackNavigator}
        options={{ title: 'Messages', tabBarBadge: messagesBadge }}
      />
      <Tabs.Screen
        name="FinanceTab"
        component={FinanceStackNavigator}
        options={{ title: 'Finance' }}
      />
      <Tabs.Screen name="MoreTab" component={MoreStackNavigator} options={{ title: 'Plus' }} />
    </Tabs.Navigator>
  );
}
