import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useQuery } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { calendarApi } from '../../api/calendarApi';
import { communicationApi } from '../../api/communicationApi';
import { notificationApi } from '../../api/notificationApi';
import { parentApi } from '../../api/parentApi';
import { Badge, Card, ErrorView, Loader, Screen, SectionHeader } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useDashboardAcademic } from '../../hooks/useDashboardAcademic';
import type { ParentTabParamList } from '../../navigation/types';
import { colors, radius, spacing, typography } from '../../theme';
import type { ChildSummary, PreRegistrationSummary } from '../../types/parent';
import { formatCurrency, formatDate, initials } from '../../utils/format';
import {
  childStatusLabel,
  childStatusTone,
  preRegStatusTone,
} from '../../utils/status';

type Nav = BottomTabNavigationProp<ParentTabParamList>;

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bonjour';
  if (h < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

export function DashboardScreen() {
  const { user, logout } = useAuth();
  const nav = useNavigation<Nav>();

  const dashboardQuery = useQuery({
    queryKey: ['parent', 'dashboard'],
    queryFn: parentApi.getDashboard,
  });

  const unreadQuery = useQuery({
    queryKey: ['communications', 'unread-count'],
    queryFn: communicationApi.getUnreadMessagesCount,
    refetchInterval: 60_000,
  });

  // Centre de notifications (≠ messages) : badge cloche du header.
  const notifUnreadQuery = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationApi.getUnreadCount,
    refetchInterval: 60_000,
  });

  const todayEventsQuery = useQuery({
    queryKey: ['calendar', 'today'],
    queryFn: calendarApi.getTodayEvents,
  });

  const upcomingEventsQuery = useQuery({
    queryKey: ['calendar', 'upcoming-dashboard'],
    queryFn: () => calendarApi.getUpcomingEvents(0, 5),
  });

  const greeting = useMemo(() => getGreeting(), []);

  // ⚠ Hook : doit être appelé avant tout early return.
  // Si le dashboard n'est pas encore chargé, on passe un tableau vide.
  const academic = useDashboardAcademic(dashboardQuery.data?.children ?? []);

  if (dashboardQuery.isLoading) {
    return (
      <Screen>
        <Loader label="Chargement du tableau de bord…" />
      </Screen>
    );
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <Screen>
        <ErrorView
          message={(dashboardQuery.error as Error)?.message}
          onRetry={() => dashboardQuery.refetch()}
        />
      </Screen>
    );
  }

  const { parentInfo, children, preRegistrations, financialSummary } = dashboardQuery.data;
  const unreadCount = unreadQuery.data ?? 0;
  const notifUnreadCount = notifUnreadQuery.data ?? 0;
  const todayEvents = todayEventsQuery.data ?? [];
  const upcomingEvents = (upcomingEventsQuery.data?.content ?? []).filter(
    (e) => !todayEvents.some((t) => t.id === e.id)
  );

  const refreshAll = () => {
    dashboardQuery.refetch();
    unreadQuery.refetch();
    notifUnreadQuery.refetch();
    todayEventsQuery.refetch();
    upcomingEventsQuery.refetch();
    academic.refetch();
  };

  return (
    <Screen refreshing={dashboardQuery.isRefetching} onRefresh={refreshAll}>
      {/* ── Hero ─────────────────────────────────────────── */}
      <View style={styles.heroRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.hello}>{greeting},</Text>
          <Text style={styles.name}>
            {parentInfo.fullName || `${user?.firstName ?? ''}`}
          </Text>
          <Text style={styles.sub}>Bienvenue sur votre espace parent</Text>
        </View>
        <Pressable
          onPress={() => nav.navigate('MoreTab', { screen: 'Notifications' })}
          hitSlop={12}
          style={styles.bellWrapper}
        >
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
          {notifUnreadCount > 0 ? (
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeText}>
                {notifUnreadCount > 9 ? '9+' : notifUnreadCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      {/* ── Quick Actions ───────────────────────────────── */}
      <View style={styles.quickGrid}>
        <QuickAction
          icon="chatbubbles"
          label="Messages"
          color={colors.secondary}
          badge={unreadCount > 0 ? unreadCount : undefined}
          onPress={() =>
            nav.navigate('CommunicationsTab', { screen: 'CommunicationsHome' })
          }
        />
        <QuickAction
          icon="document-text"
          label="Bulletins"
          color={colors.info}
          onPress={() => nav.navigate('ScolariteTab', { screen: 'Bulletins' })}
        />
        <QuickAction
          icon="card"
          label="Factures"
          color={colors.warning}
          onPress={() => nav.navigate('FinanceTab', { screen: 'FinanceHome' })}
        />
        <QuickAction
          icon="bus"
          label="Transport"
          color={colors.success}
          onPress={() => {
            if (children.length === 1) {
              nav.navigate('MoreTab', {
                screen: 'Transport',
                params: { childId: children[0].id, childName: children[0].fullName },
              });
            } else {
              nav.navigate('MoreTab', { screen: 'ChildrenList' });
            }
          }}
        />
        <QuickAction
          icon="add-circle"
          label="Préinscrire"
          color={colors.primary}
          onPress={() =>
            nav.navigate('MoreTab', {
              screen: 'PreRegistrationForm',
              params: {},
            })
          }
        />
      </View>

      {/* ── À ne pas manquer ────────────────────────────── */}
      <ToWatchSection
        unreadMessages={unreadCount}
        overdueInvoices={financialSummary.overdueInvoicesCount}
        unpaidInvoices={financialSummary.unpaidInvoicesCount}
        totalDue={financialSummary.totalDue}
        devoirsARendre={academic.aggregates.devoirsARendre}
        devoirsEnRetard={academic.aggregates.devoirsEnRetard}
        evaluationsAVenir={academic.aggregates.evaluationsAVenir}
        nav={nav}
      />

      {/* ── KPI Grid ────────────────────────────────────── */}
      <View style={styles.kpiGrid}>
        <KpiCard
          icon="people"
          label="Enfants inscrits"
          value={String(children.length)}
          tone={colors.primary}
          onPress={() => nav.navigate('MoreTab', { screen: 'ChildrenList' })}
        />
        <KpiCard
          icon="document-text"
          label="Préinscriptions"
          value={String(preRegistrations.length)}
          tone={colors.secondary}
          onPress={() =>
            nav.navigate('MoreTab', { screen: 'PreRegistrationsList' })
          }
        />
        <KpiCard
          icon="cash"
          label="Solde dû"
          value={formatCurrency(financialSummary.totalDue)}
          tone={colors.warning}
          onPress={() => nav.navigate('FinanceTab', { screen: 'FinanceHome' })}
        />
        <KpiCard
          icon="alert-circle"
          label="En retard"
          value={String(financialSummary.overdueInvoicesCount)}
          tone={colors.danger}
          onPress={() => nav.navigate('FinanceTab', { screen: 'FinanceHome' })}
        />
      </View>

      {/* ── Mes enfants ─────────────────────────────────── */}
      <SectionHeader
        title="Mes enfants"
        subtitle={`${children.length} enfant${children.length > 1 ? 's' : ''}`}
        right={
          children.length > 3 ? (
            <Text
              style={styles.linkText}
              onPress={() => nav.navigate('MoreTab', { screen: 'ChildrenList' })}
            >
              Voir tout
            </Text>
          ) : undefined
        }
      />
      {children.length === 0 ? (
        <Card>
          <Text style={styles.muted}>Aucun enfant inscrit pour le moment.</Text>
        </Card>
      ) : (
        children.slice(0, 3).map((c) => (
          <ChildRow
            key={c.id}
            child={c}
            onPress={() =>
              nav.navigate('MoreTab', {
                screen: 'ChildDetail',
                params: { childId: c.id, childName: c.fullName },
              })
            }
          />
        ))
      )}

      <View style={styles.spacer} />

      {/* ── Suivi pédagogique ───────────────────────────── */}
      {children.length > 0 ? (
        <>
          <SectionHeader
            title="Suivi pédagogique"
            subtitle={
              academic.periodeCourante?.libelle
                ? `Période : ${academic.periodeCourante.libelle}`
                : undefined
            }
            right={
              <Text
                style={styles.linkText}
                onPress={() =>
                  nav.navigate('ScolariteTab', { screen: 'ScolariteHome' })
                }
              >
                Détails
              </Text>
            }
          />
          {academic.perChild.map((entry) => (
            <AcademicChildCard
              key={entry.child.id}
              entry={entry}
              onPress={() =>
                nav.navigate('ScolariteTab', { screen: 'ScolariteHome' })
              }
            />
          ))}
          <View style={styles.spacer} />
        </>
      ) : null}

      {/* ── Événements ──────────────────────────────────── */}
      {todayEvents.length > 0 || upcomingEvents.length > 0 ? (
        <>
          <SectionHeader
            title="Prochains événements"
            right={
              <Text
                style={styles.linkText}
                onPress={() => nav.navigate('MoreTab', { screen: 'CalendarHome' })}
              >
                Calendrier
              </Text>
            }
          />
          {todayEvents.slice(0, 2).map((e) => (
            <EventRow
              key={`today-${e.id}`}
              title={e.title}
              date="Aujourd'hui"
              location={e.location}
              isToday
              onPress={() =>
                nav.navigate('MoreTab', { screen: 'EventDetail', params: { id: e.id } })
              }
            />
          ))}
          {upcomingEvents.slice(0, 3 - Math.min(todayEvents.length, 2)).map((e) => (
            <EventRow
              key={`up-${e.id}`}
              title={e.title}
              date={e.startDate ? formatDate(e.startDate) : '—'}
              location={e.location}
              onPress={() =>
                nav.navigate('MoreTab', { screen: 'EventDetail', params: { id: e.id } })
              }
            />
          ))}
          <View style={styles.spacer} />
        </>
      ) : null}

      {/* ── Préinscriptions ─────────────────────────────── */}
      <SectionHeader
        title="Préinscriptions récentes"
        subtitle={`${preRegistrations.length} en cours`}
        right={
          preRegistrations.length > 3 ? (
            <Text
              style={styles.linkText}
              onPress={() =>
                nav.navigate('MoreTab', { screen: 'PreRegistrationsList' })
              }
            >
              Voir tout
            </Text>
          ) : undefined
        }
      />
      {preRegistrations.length === 0 ? (
        <Card>
          <Text style={styles.muted}>Aucune préinscription en cours.</Text>
        </Card>
      ) : (
        preRegistrations.slice(0, 3).map((p) => (
          <PreRegRow
            key={p.id}
            item={p}
            onPress={() =>
              nav.navigate('MoreTab', {
                screen: 'PreRegistrationDetail',
                params: { preRegistrationId: p.id },
              })
            }
          />
        ))
      )}

      <View style={styles.spacer} />

      <Text style={styles.logout} onPress={() => logout()}>
        Se déconnecter
      </Text>
    </Screen>
  );
}

function QuickAction({
  icon,
  label,
  color,
  badge,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  badge?: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}
    >
      <View style={[styles.quickIcon, { backgroundColor: color + '1A' }]}>
        <Ionicons name={icon} size={22} color={color} />
        {badge ? (
          <View style={styles.quickBadge}>
            <Text style={styles.quickBadgeText}>{badge > 9 ? '9+' : badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.quickLabel} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function KpiCard({
  icon,
  label,
  value,
  tone,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  tone: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.kpi, pressed && styles.pressed]}
    >
      <View style={[styles.kpiIcon, { backgroundColor: tone + '1A' }]}>
        <Ionicons name={icon} size={20} color={tone} />
      </View>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </Pressable>
  );
}

function ToWatchSection({
  unreadMessages,
  overdueInvoices,
  unpaidInvoices,
  totalDue,
  devoirsARendre,
  devoirsEnRetard,
  evaluationsAVenir,
  nav,
}: {
  unreadMessages: number;
  overdueInvoices: number;
  unpaidInvoices: number;
  totalDue: number;
  devoirsARendre: number;
  devoirsEnRetard: number;
  evaluationsAVenir: number;
  nav: Nav;
}) {
  const items: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    color: string;
    onPress: () => void;
  }[] = [];

  if (devoirsEnRetard > 0) {
    items.push({
      icon: 'time',
      label: `${devoirsEnRetard} devoir${devoirsEnRetard > 1 ? 's' : ''} en retard`,
      color: colors.danger,
      onPress: () => nav.navigate('ScolariteTab', { screen: 'Devoirs' }),
    });
  }

  if (overdueInvoices > 0) {
    items.push({
      icon: 'warning',
      label: `${overdueInvoices} facture${overdueInvoices > 1 ? 's' : ''} en retard${
        totalDue > 0 ? ` • ${formatCurrency(totalDue)}` : ''
      }`,
      color: colors.danger,
      onPress: () => nav.navigate('FinanceTab', { screen: 'FinanceHome' }),
    });
  } else if (unpaidInvoices > 0) {
    items.push({
      icon: 'cash-outline',
      label: `${unpaidInvoices} facture${unpaidInvoices > 1 ? 's' : ''} à régler${
        totalDue > 0 ? ` • ${formatCurrency(totalDue)}` : ''
      }`,
      color: colors.warning,
      onPress: () => nav.navigate('FinanceTab', { screen: 'FinanceHome' }),
    });
  }

  if (devoirsARendre > 0) {
    items.push({
      icon: 'list',
      label: `${devoirsARendre} devoir${devoirsARendre > 1 ? 's' : ''} à rendre cette semaine`,
      color: colors.warning,
      onPress: () => nav.navigate('ScolariteTab', { screen: 'Devoirs' }),
    });
  }

  if (evaluationsAVenir > 0) {
    items.push({
      icon: 'school',
      label: `${evaluationsAVenir} évaluation${evaluationsAVenir > 1 ? 's' : ''} dans les 14 jours`,
      color: colors.info,
      onPress: () => nav.navigate('ScolariteTab', { screen: 'Notes' }),
    });
  }

  if (unreadMessages > 0) {
    items.push({
      icon: 'mail-unread',
      label: `${unreadMessages} message${unreadMessages > 1 ? 's' : ''} non lu${
        unreadMessages > 1 ? 's' : ''
      }`,
      color: colors.secondary,
      onPress: () =>
        nav.navigate('CommunicationsTab', { screen: 'CommunicationsHome' }),
    });
  }

  if (items.length === 0) return null;

  return (
    <Card style={styles.toWatchCard}>
      <View style={styles.toWatchHeader}>
        <Ionicons name="flash" size={16} color={colors.primary} />
        <Text style={styles.toWatchTitle}>À ne pas manquer</Text>
      </View>
      {items.map((item, idx) => (
        <Pressable
          key={idx}
          onPress={item.onPress}
          style={({ pressed }) => [styles.toWatchItem, pressed && styles.pressed]}
        >
          <Ionicons name={item.icon} size={18} color={item.color} />
          <Text style={[styles.toWatchItemText, { color: item.color }]} numberOfLines={2}>
            {item.label}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </Pressable>
      ))}
    </Card>
  );
}

function ChildRow({ child, onPress }: { child: ChildSummary; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <Card style={styles.rowCard}>
        <View style={styles.rowHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>{child.fullName}</Text>
            <Text style={styles.rowSub}>
              {child.currentClass ? `${child.currentClass}` : 'Non assigné'}
              {child.academicYear ? ` • ${child.academicYear}` : ''}
            </Text>
          </View>
          <Badge label={childStatusLabel(child.status)} tone={childStatusTone(child.status)} />
        </View>
        {child.unpaidInvoicesCount > 0 ? (
          <View style={styles.warnRow}>
            <Ionicons name="alert-circle-outline" size={14} color={colors.warning} />
            <Text style={styles.warnText}>
              {child.unpaidInvoicesCount} facture{child.unpaidInvoicesCount > 1 ? 's' : ''} impayée
              {child.unpaidInvoicesCount > 1 ? 's' : ''} •{' '}
              {formatCurrency(child.totalDue - child.paidAmount)}
            </Text>
          </View>
        ) : null}
      </Card>
    </Pressable>
  );
}

function EventRow({
  title,
  date,
  location,
  isToday,
  onPress,
}: {
  title: string;
  date: string;
  location?: string;
  isToday?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      <Card style={styles.rowCard}>
        <View style={styles.rowHeader}>
          <View
            style={[
              styles.eventIcon,
              { backgroundColor: (isToday ? colors.primary : colors.info) + '1A' },
            ]}
          >
            <Ionicons
              name="calendar"
              size={18}
              color={isToday ? colors.primary : colors.info}
            />
          </View>
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={styles.rowTitle} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.rowSub}>
              {date}
              {location ? ` • ${location}` : ''}
            </Text>
          </View>
          {isToday ? <Badge label="Aujourd'hui" tone="primary" /> : null}
        </View>
      </Card>
    </Pressable>
  );
}

function AcademicChildCard({
  entry,
  onPress,
}: {
  entry: ReturnType<typeof useDashboardAcademic>['perChild'][number];
  onPress: () => void;
}) {
  const m = entry.moyenneGenerale;
  const moyenneColor =
    typeof m === 'number'
      ? m >= 14
        ? colors.success
        : m >= 10
        ? colors.primary
        : colors.warning
      : colors.textMuted;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      <Card style={styles.rowCard}>
        <View style={styles.acaHeader}>
          <View style={styles.acaAvatar}>
            <Text style={styles.acaAvatarText}>
              {initials(entry.child.firstName, entry.child.lastName)}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>{entry.child.fullName}</Text>
            <Text style={styles.rowSub}>
              {entry.child.currentClass ?? 'Classe non assignée'}
            </Text>
          </View>
          <View style={styles.acaMoyenneBox}>
            <Text style={[styles.acaMoyenneValue, { color: moyenneColor }]}>
              {typeof m === 'number' ? m.toFixed(2) : '—'}
            </Text>
            <Text style={styles.acaMoyenneSur}>/20</Text>
          </View>
        </View>

        {entry.rang || entry.mentionLibelle ? (
          <View style={styles.acaSubRow}>
            {entry.rang ? (
              <View style={styles.acaSubItem}>
                <Ionicons name="trophy-outline" size={12} color={colors.textSecondary} />
                <Text style={styles.acaSubText}>
                  Rang {entry.rang}
                  {entry.rangSur ? `/${entry.rangSur}` : ''}
                </Text>
              </View>
            ) : null}
            {entry.mentionLibelle ? (
              <View style={styles.acaSubItem}>
                <View
                  style={[
                    styles.mentionDot,
                    entry.mentionCouleur
                      ? { backgroundColor: entry.mentionCouleur }
                      : { backgroundColor: colors.primary },
                  ]}
                />
                <Text style={styles.acaSubText}>{entry.mentionLibelle}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.acaStatsRow}>
          <MiniStat
            icon="list-outline"
            value={entry.nbDevoirsARendre + entry.nbDevoirsEnRetard}
            label="Devoirs"
            color={entry.nbDevoirsEnRetard > 0 ? colors.danger : colors.textSecondary}
          />
          <MiniStat
            icon="school-outline"
            value={entry.nbEvaluationsAVenir}
            label="Évals"
            color={colors.info}
          />
          <MiniStat
            icon="alert-circle-outline"
            value={entry.nbAbsences}
            label="Absences"
            color={
              entry.nbAbsencesInjustifiees > 0 ? colors.warning : colors.textSecondary
            }
          />
        </View>
      </Card>
    </Pressable>
  );
}

function MiniStat({
  icon,
  value,
  label,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <View style={styles.miniStat}>
      <Ionicons name={icon} size={14} color={color} />
      <Text style={[styles.miniStatValue, { color }]}>{value}</Text>
      <Text style={styles.miniStatLabel}>{label}</Text>
    </View>
  );
}

function PreRegRow({
  item,
  onPress,
}: {
  item: PreRegistrationSummary;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      <Card style={styles.rowCard}>
        <View style={styles.rowHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>{item.studentFullName}</Text>
            <Text style={styles.rowSub}>
              {item.requestedLevel} • Dossier {item.registrationNumber}
            </Text>
            <Text style={styles.rowMuted}>Déposé le {formatDate(item.submissionDate)}</Text>
          </View>
          <Badge label={item.statusLabel ?? item.status} tone={preRegStatusTone(item.status)} />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  heroRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  hello: { ...typography.caption, color: colors.textSecondary },
  name: { ...typography.h2, color: colors.text },
  sub: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  bellWrapper: { padding: spacing.xs },
  bellBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.danger,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '700' },

  // Quick actions
  quickGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  quickBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.danger,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  quickLabel: {
    ...typography.small,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },

  // To watch
  toWatchCard: { marginBottom: spacing.lg, padding: spacing.md },
  toWatchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  toWatchTitle: { ...typography.bodyBold, color: colors.text },
  toWatchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  toWatchItemText: { flex: 1, ...typography.caption, fontWeight: '600' },

  // KPI
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  kpi: {
    flexBasis: '47%',
    flexGrow: 1,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  kpiIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  kpiValue: { ...typography.h2, color: colors.text },
  kpiLabel: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },

  // Rows
  rowCard: { marginBottom: spacing.sm },
  rowHeader: { flexDirection: 'row', alignItems: 'center' },
  rowTitle: { ...typography.bodyBold, color: colors.text },
  rowSub: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  rowMuted: { ...typography.small, color: colors.textMuted, marginTop: 2 },
  warnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
  },
  warnText: { ...typography.caption, color: colors.warning, flex: 1 },
  eventIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Academic child card
  acaHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  acaAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acaAvatarText: { ...typography.bodyBold, color: '#FFFFFF' },
  acaMoyenneBox: { alignItems: 'flex-end' },
  acaMoyenneValue: { ...typography.h2, fontWeight: '800' },
  acaMoyenneSur: { ...typography.small, color: colors.textMuted, marginTop: -4 },
  acaSubRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.sm,
    paddingLeft: 48,
  },
  acaSubItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  acaSubText: { ...typography.small, color: colors.textSecondary, fontWeight: '600' },
  mentionDot: { width: 8, height: 8, borderRadius: 4 },
  acaStatsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  miniStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  miniStatValue: { ...typography.bodyBold, fontSize: 14 },
  miniStatLabel: { ...typography.small, color: colors.textMuted },

  // Misc
  linkText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
  muted: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  spacer: { height: spacing.lg },
  pressed: { opacity: 0.7 },
  logout: {
    ...typography.bodyBold,
    color: colors.danger,
    textAlign: 'center',
    padding: spacing.md,
  },
});
